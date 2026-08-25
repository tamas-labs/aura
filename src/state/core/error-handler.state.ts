import { defineStore } from 'pinia';
import { ref, computed, getCurrentScope, onScopeDispose } from 'vue';
import type { ECSError, ErrorSeverity, ErrorType } from '../../types/error.types';
import type { AuraConfig } from '../../types/config.types';
import { createErrorReporter, type ErrorReporter } from '../../lib/error-reporter';
import { buildFallbackErrorKey } from '../../lib/error-key.lib';

/** Error keys of the reporter's own problems (stable, so they can be deduplicated) */
const REPORTER_FAILURE_KEY = 'errorReporting.failed';
const REPORTER_DROP_KEY = 'errorReporting.dropped';

/** Key of the store's own "the error list is full" notice */
const OVERFLOW_KEY = 'errorHandler.limitReached';

/**
 * Keys the size cap never discards.
 *
 * These are the pipeline's own notices — the reporter cannot send, the reporter
 * dropped, the store dropped. They are `info`, so the plain "oldest droppable
 * first" rule would evict them exactly when a flood makes them relevant, and
 * the host would be left without the one entry explaining why errors are
 * missing. There are at most three of them, and merging keeps it that way.
 */
const PROTECTED_KEYS: readonly string[] = [REPORTER_FAILURE_KEY, REPORTER_DROP_KEY, OVERFLOW_KEY];

/**
 * Upper bound for the collected errors.
 *
 * Deduplication alone does not bound the array: a table that re-validates a
 * response on every refresh can produce endlessly *distinct* errors (a new
 * column name, a new received value in the key). The cap follows the reporter
 * queue's pattern — the oldest entries are dropped — so a long-running SPA
 * cannot grow the store without limit. 50 is far above what a UI can usefully
 * show, and with merging in place a real table stays in the single digits.
 */
const MAX_STORED_ERRORS = 50;

/**
 * Severities that block rendering (the table is replaced by the error UI).
 * These are evicted last: a flood of warnings must not be able to push out the
 * one error that explains why the table is not there.
 */
const BLOCKING_SEVERITIES: readonly ErrorSeverity[] = ['critical', 'error'];

/**
 * Error Handler Store Factory
 * ECS-compatible error handling in a Pinia store
 *
 * @param storeId - Unique store identifier (default: 'aura-error-handler')
 * @param config - Optional Aura configuration (for error reporting settings)
 * @returns Pinia store instance
 *
 * @example
 * ```typescript
 * // Create the store
 * const errorStore = useErrorHandlerStore('my-app-errors');
 *
 * // Add an error
 * errorStore.addError({
 *   severity: 'error',
 *   component: 'UserForm',
 *   action: 'validate',
 *   type: 'validation',
 *   message: 'Invalid email'
 * });
 * ```
 */
export const useErrorHandlerStore = (storeId: string, config?: AuraConfig) => {
    return defineStore(storeId, () => {
        // State
        const errors = ref<ECSError[]>([]);

        // Computed
        const hasErrors = computed(() => errors.value.length > 0);
        const isValid = computed(() => !hasErrors.value);

        /** Input shape shared by `pushError` and `addError` */
        type ErrorInput = Omit<ECSError, 'timestamp' | 'level'> & {
            level?: ErrorSeverity;
            timestamp?: string;
        };

        /** Errors discarded by the size cap since the store was created */
        let totalDropped = 0;

        /**
         * Whether two errors are the same problem happening again.
         *
         * `key` alone would be too coarse: a caller-supplied key is a config key
         * or column name, and several different problems can be reported for the
         * same field. Validators in particular share one generic `message` per
         * validator and put the specifics in `details`, so both take part in the
         * identity — a wrong type and an out-of-range value on the same key stay
         * two separate errors. `metadata` does not: it describes the occurrence
         * (the received value), not the problem, so the first one's context is
         * kept.
         */
        const isSameProblem = (candidate: ECSError, error: ECSError): boolean =>
            candidate.key === error.key &&
            candidate.severity === error.severity &&
            candidate.message === error.message &&
            candidate.details === error.details;

        /**
         * Index of the entry to discard when the list is full.
         *
         * The oldest non-blocking, non-protected error goes first. If everything
         * is blocking, the oldest entry loses — a newer blocking error is the
         * more actionable one.
         */
        const findEvictionIndex = (): number => {
            const droppable = errors.value.findIndex(
                error =>
                    !BLOCKING_SEVERITIES.includes(error.severity) &&
                    !PROTECTED_KEYS.includes(error.key ?? '')
            );

            return droppable === -1 ? 0 : droppable;
        };

        /** Discard the least valuable entry and count it */
        const evictOne = (): void => {
            errors.value.splice(findEvictionIndex(), 1);
            totalDropped += 1;
        };

        /**
         * Record that the cap discarded errors — once, as an `info` entry.
         *
         * Same reasoning as the reporter's own problems: dropping the 51st
         * warning is not a table problem, so it must not degrade the UI. It is
         * written directly rather than through `pushError` (which would call
         * back into the trimming) and it makes room for itself first, so the
         * notice about the cap cannot be what breaks it.
         */
        const noteOverflow = (): void => {
            const existing = errors.value.find(error => error.key === OVERFLOW_KEY);

            if (existing) {
                existing.count = (existing.count ?? 1) + 1;
                existing.lastTimestamp = new Date().toISOString();
                // Refreshed, unlike a normal merge: a stale `totalDropped` in
                // the notice that exists to report it would be worse than useless.
                existing.metadata = { totalDropped, maxErrors: MAX_STORED_ERRORS };
                return;
            }

            // Counted before the metadata is built, so the very first notice
            // includes the entry it just made room for.
            evictOne();

            errors.value.push({
                severity: 'info',
                level: 'info',
                component: 'ErrorHandlerStore',
                action: 'addError',
                type: 'unknown',
                message: 'The error list is full; the oldest errors are being dropped.',
                key: OVERFLOW_KEY,
                timestamp: new Date().toISOString(),
                metadata: { totalDropped, maxErrors: MAX_STORED_ERRORS },
            });
        };

        /** Bring the list back under the cap after an append */
        const trimToLimit = (): void => {
            if (errors.value.length <= MAX_STORED_ERRORS) return;

            while (errors.value.length > MAX_STORED_ERRORS) {
                evictOne();
            }

            noteOverflow();
        };

        /**
         * Record an error locally, without handing it to the remote reporter.
         *
         * This is the path the reporter's own hooks use: `addError` would send
         * the failure back to the very reporter that just failed, and every
         * retry would produce another error — a feedback loop.
         *
         * Every error gets a `key`, generated from `component.action.type` when
         * the caller did not supply one. Without a key the UI renders no dismiss
         * button and `clearByKey` cannot reach the error, so a single unkeyed
         * blocking error used to leave the user with no way forward at all.
         *
         * A repeat of an error that is already there does not append a second
         * entry: it bumps the existing one's `count` and `lastTimestamp`. A
         * periodically refreshing table against a failing endpoint would
         * otherwise multiply the same message in the UI forever.
         *
         * @returns The stored error — the merged entry when it was a repeat
         */
        const pushError = (error: ErrorInput): ECSError => {
            const newError: ECSError = {
                ...error,
                key: error.key || buildFallbackErrorKey(error.component, error.action, error.type),
                timestamp: error.timestamp || new Date().toISOString(),
                level: error.level || error.severity, // level = severity (backwards compatibility)
            };

            const existing = errors.value.find(candidate => isSameProblem(candidate, newError));

            if (existing) {
                existing.count = (existing.count ?? 1) + 1;
                existing.lastTimestamp = newError.timestamp;

                return existing;
            }

            errors.value.push(newError);
            trimToLimit();

            return newError;
        };

        /**
         * Record a problem of the error reporter itself — once per key.
         *
         * The "once" is `pushError`'s merging: the key and the message are both
         * constant here, so every repeat lands on the same entry and only bumps
         * its counter. The metadata therefore describes the first occurrence.
         *
         * Severity is `info` on purpose. It is not a table problem: `error`
         * would replace the table with the error UI and `warning` would show a
         * banner, so an unreachable telemetry endpoint would degrade the UI for
         * end users who cannot act on it. `info` stays out of the UI while the
         * host can still read it from `errors` (or watch `hasErrors`).
         */
        const reportReporterProblem = (
            key: string,
            message: string,
            metadata: Record<string, unknown>
        ): void => {
            pushError({
                severity: 'info',
                component: 'ErrorReporter',
                action: 'report',
                type: 'network',
                message,
                key,
                metadata,
            });
        };

        // Error reporter instance (null if disabled)
        let errorReporter: ErrorReporter | null = null;
        if (config) {
            errorReporter = createErrorReporter(config, {
                onFailure: ({ error, pending, consecutiveFailures, retryInMs }) =>
                    reportReporterProblem(
                        REPORTER_FAILURE_KEY,
                        'Failed to send errors to the reporting endpoint.',
                        {
                            reason: error instanceof Error ? error.message : String(error),
                            pending,
                            consecutiveFailures,
                            retryInMs,
                        }
                    ),
                onDrop: ({ dropped, totalDropped, maxQueueSize }) =>
                    reportReporterProblem(
                        REPORTER_DROP_KEY,
                        'The error report queue is full; the oldest errors are being dropped.',
                        { dropped, totalDropped, maxQueueSize }
                    ),
            });
        }

        /**
         * Add an error to the store
         * @param error - Partial error object (timestamp is generated automatically)
         */
        const addError = (error: ErrorInput): void => {
            const newError = pushError(error);

            // Report error to remote service if enabled
            if (errorReporter) {
                // A snapshot, not the stored entry: a repeat merges into the
                // object that is already in the store, and the reporter's queue
                // must not hold a reference that keeps changing under it.
                // Every occurrence is still reported — aggregating repeats is
                // the telemetry backend's job, not the table's.
                // Fire and forget - errors are handled internally by the reporter
                errorReporter.report({ ...newError }).catch(() => {
                    // Reporter handles errors internally, this is just to satisfy linter
                });
            }
        };

        /**
         * Clear all errors
         */
        const clearErrors = (): void => {
            errors.value = [];
        };

        /**
         * Clear errors by key
         * @param key - The key whose errors should be cleared
         */
        const clearByKey = (key: string): void => {
            errors.value = errors.value.filter(error => error.key !== key);
        };

        /**
         * Clear errors by component
         * @param component - The component name
         */
        const clearByComponent = (component: string): void => {
            errors.value = errors.value.filter(error => error.component !== component);
        };

        /**
         * Clear errors by type
         * @param type - The error type
         */
        const clearByType = (type: ErrorType): void => {
            errors.value = errors.value.filter(error => error.type !== type);
        };

        /**
         * Filter errors by severity
         * @param severity - The severity level
         */
        const getErrorsBySeverity = (severity: ErrorSeverity): ECSError[] => {
            return errors.value.filter(error => error.severity === severity);
        };

        /**
         * Filter errors by component
         * @param component - The component name
         */
        const getErrorsByComponent = (component: string): ECSError[] => {
            return errors.value.filter(error => error.component === component);
        };

        /**
         * Filter errors by key
         * @param key - The key
         */
        const getErrorsByKey = (key: string): ECSError[] => {
            return errors.value.filter(error => error.key === key);
        };

        /**
         * Add a schema validation error (centralized helper)
         * Encapsulates the common parameters of validation errors
         *
         * @param component - Validator component name (e.g. 'BooleanValidator')
         * @param message - Error message
         * @param key - The config key name
         * @param receivedValue - The received value
         * @param details - Detailed error message (optional)
         * @param additionalMetadata - Additional metadata (optional)
         */
        const addSchemaValidationError = (
            component: string,
            message: string,
            key: string,
            receivedValue: unknown,
            details?: string,
            additionalMetadata?: Record<string, unknown>
        ): void => {
            addError({
                severity: 'warning',
                component,
                action: 'validate',
                type: 'validation',
                message,
                details,
                key,
                metadata: {
                    receivedValue,
                    receivedType: typeof receivedValue,
                    ...additionalMetadata,
                },
            });
        };

        /**
         * Get critical errors
         */
        const criticalErrors = computed(() =>
            errors.value.filter(error => error.severity === 'critical')
        );

        /**
         * Get error-level errors
         */
        const errorLevelErrors = computed(() =>
            errors.value.filter(error => error.severity === 'error')
        );

        /**
         * Get warnings
         */
        const warnings = computed(() => errors.value.filter(error => error.severity === 'warning'));

        /**
         * Store cleanup: destroy the error reporter
         */
        const destroy = async (): Promise<void> => {
            if (errorReporter) {
                await errorReporter.destroy();
            }
        };

        /**
         * Cleanup: destroy the error reporter when the store itself goes away.
         *
         * Bound to the store's Pinia effect scope (stopped by `$dispose()` or by
         * the pinia instance being torn down), never to a component lifecycle.
         * This setup runs only once per `storeId` — Pinia caches the store — so
         * an `onUnmounted` hook here would attach to whichever component happened
         * to be mounting first, and that component's unmount would destroy the
         * reporter for good: a table hidden by `v-if` and shown again would then
         * drop every further error while `errorReporting` still reported `true`.
         *
         * `getCurrentScope()` also replaces the previous `try/catch`, which never
         * caught anything — `onUnmounted` without an instance emits a `[Vue warn]`
         * instead of throwing, which was the stderr noise in the test output.
         */
        if (getCurrentScope()) {
            onScopeDispose(() => {
                // Fire and forget cleanup
                destroy().catch(() => {
                    // Ignore cleanup errors
                });
            });
        }

        return {
            // State
            errors,

            // Computed
            hasErrors,
            isValid,
            criticalErrors,
            errorLevelErrors,
            warnings,

            // Actions
            addError,
            addSchemaValidationError,
            clearErrors,
            clearByKey,
            clearByComponent,
            clearByType,
            getErrorsBySeverity,
            getErrorsByComponent,
            getErrorsByKey,
            destroy,
        };
    })();
};
