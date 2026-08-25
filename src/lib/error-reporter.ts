import type { ECSError, AuraConfig } from '../types';
import {
    DEFAULT_ERROR_REPORTING_SERVICE,
    UNIMPLEMENTED_ERROR_REPORTING_SERVICES,
} from './default-values.lib';

/**
 * Error Reporter configuration
 */
export interface ErrorReporterConfig {
    /** Whether error reporting is enabled */
    enabled: boolean;
    /** Custom endpoint URL */
    endpoint?: string;
    /** Service type */
    service?: 'sentry' | 'logrocket' | 'rollbar' | 'custom';
    /** API key for the service */
    apiKey?: string;
    /** Maximum number of retries on failure */
    maxRetries?: number;
    /** Delay between retries (ms) */
    retryDelay?: number;
    /** Batch size (how many errors go into one request) */
    batchSize?: number;
    /** Automatic flush interval (ms) */
    flushInterval?: number;
    /** Upper bound for the pending queue; the oldest entries are dropped above it */
    maxQueueSize?: number;
    /** Upper bound for the exponential backoff delay after failed flushes (ms) */
    maxBackoffDelay?: number;
    /**
     * Called when a flush fails, so the owner can surface it.
     *
     * The reporter cannot write to the error store itself: the store reports
     * everything it collects back here, so it would recurse. `console.*` is not
     * an option either — the production build strips every console call
     * (`drop_console`), which is exactly where a silent reporter hurts most.
     */
    onFailure?: (payload: ReporterFailure) => void;
    /** Called when the queue cap discards errors (same reasoning as `onFailure`) */
    onDrop?: (payload: ReporterDrop) => void;
}

/** What a failed flush reports to the owner */
export interface ReporterFailure {
    /** The rejection thrown by the transport */
    error: unknown;
    /** Errors still waiting in the queue after the failure */
    pending: number;
    /** How many flushes have failed in a row */
    consecutiveFailures: number;
    /** Milliseconds until the next attempt is allowed (the backoff window) */
    retryInMs: number;
}

/** What a queue overflow reports to the owner */
export interface ReporterDrop {
    /** Errors discarded by this overflow */
    dropped: number;
    /** Errors discarded since the reporter was created */
    totalDropped: number;
    /** The cap that was hit */
    maxQueueSize: number;
}

/** Fallback flush interval, also the base unit of the failure backoff. */
const DEFAULT_FLUSH_INTERVAL = 30000;

/** Fallback batch size, retry count and retry delay. */
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;

/**
 * Default queue cap. Without one, a permanently unreachable endpoint would grow
 * the queue forever: every failed flush pushes its batch back while new errors
 * keep arriving, and ECS errors carry a `context` object — a real memory leak in
 * a long-running SPA.
 */
const DEFAULT_MAX_QUEUE_SIZE = 100;

/** Default backoff ceiling: stop doubling the retry delay at 5 minutes. */
const DEFAULT_MAX_BACKOFF_DELAY = 300000;

/**
 * Whether the given service name has no transport and must fall back.
 *
 * @param service - The configured service name
 */
const isUnimplementedService = (service: string): boolean =>
    (UNIMPLEMENTED_ERROR_REPORTING_SERVICES as readonly string[]).includes(service);

/**
 * Error Reporter class
 * Remote error reporting with batch processing and retry logic.
 *
 * There is exactly one transport: a POST to `endpoint`. A service name without
 * an implementation is normalized to it in the constructor, so no construction
 * path can end up with a reporter that quietly sends nowhere.
 */
export class ErrorReporter {
    private queue: ECSError[] = [];
    private timer: ReturnType<typeof setTimeout> | null = null;
    private isDestroyed = false;
    /** The in-flight flush, so concurrent callers await it instead of racing it. */
    private flushPromise: Promise<void> | null = null;
    /** Consecutive failed flushes — drives the exponential backoff. */
    private consecutiveFailures = 0;
    /** Epoch ms before which no send is attempted (0 = no backoff active). */
    private nextAttemptAt = 0;
    /** Errors discarded because the queue was full. */
    private dropped = 0;

    private config: ErrorReporterConfig;

    constructor(config: ErrorReporterConfig) {
        const service = config.service ?? DEFAULT_ERROR_REPORTING_SERVICE;

        // Normalized here rather than in the factory: a reporter built directly
        // must behave the same way as one built from the plugin config.
        this.config = {
            ...config,
            service: isUnimplementedService(service) ? DEFAULT_ERROR_REPORTING_SERVICE : service,
        };

        if (config.enabled && config.flushInterval) {
            this.startBatchTimer();
        }
    }

    /** Errors waiting to be sent. */
    get pendingCount(): number {
        return this.queue.length;
    }

    /** Errors discarded because the queue reached its cap. */
    get droppedCount(): number {
        return this.dropped;
    }

    /** Whether a failed flush is currently holding sends back. */
    get isBackingOff(): boolean {
        return this.nextAttemptAt > Date.now();
    }

    /**
     * Report an error to the remote service
     * @param error - ECS-formatted error
     */
    async report(error: ECSError): Promise<void> {
        if (!this.config.enabled || this.isDestroyed) return;

        this.enqueue([error]);

        if (this.queue.length >= (this.config.batchSize ?? DEFAULT_BATCH_SIZE)) {
            await this.flush();
        }
    }

    /**
     * Send all pending errors
     *
     * Concurrent calls (batch-size trigger vs. interval timer) share a single
     * in-flight request, and a send is skipped entirely while the backoff after
     * a failed flush is still running.
     */
    async flush(): Promise<void> {
        if (this.flushPromise) return this.flushPromise;
        if (this.queue.length === 0 || this.isDestroyed || this.isBackingOff) return;

        this.flushPromise = this.sendQueuedErrors();

        try {
            await this.flushPromise;
        } finally {
            this.flushPromise = null;
        }
    }

    /**
     * Append errors to the queue, dropping the oldest ones above the cap
     * @param errors - Errors to queue
     * @param prepend - Put them in front (used when a failed batch is re-queued)
     */
    private enqueue(errors: ECSError[], prepend = false): void {
        this.queue = prepend ? [...errors, ...this.queue] : [...this.queue, ...errors];

        const maxQueueSize = this.config.maxQueueSize ?? DEFAULT_MAX_QUEUE_SIZE;
        const overflow = this.queue.length - maxQueueSize;

        if (overflow > 0) {
            // Drop from the front: the oldest errors are the least useful ones.
            this.queue.splice(0, overflow);

            const wasFirstDrop = this.dropped === 0;
            this.dropped += overflow;

            // Reported once per reporter instance — the drop repeats every cycle
            // while the endpoint stays unreachable, and this must not become the
            // noise that hides the actual failure below.
            if (wasFirstDrop) {
                this.config.onDrop?.({
                    dropped: overflow,
                    totalDropped: this.dropped,
                    maxQueueSize,
                });
            }
        }
    }

    /** Send the queued batch, handling success and failure bookkeeping */
    private async sendQueuedErrors(): Promise<void> {
        const errors = [...this.queue];
        this.queue = [];

        try {
            await this.sendToCustomEndpoint(errors);

            // Recovered — clear the backoff.
            this.consecutiveFailures = 0;
            this.nextAttemptAt = 0;
        } catch (err) {
            let retryInMs = 0;

            if (!this.isDestroyed) {
                // Re-queue on failure, keeping the original order.
                this.enqueue(errors, true);

                this.consecutiveFailures += 1;
                retryInMs = this.getBackoffDelay();
                this.nextAttemptAt = Date.now() + retryInMs;
            }

            this.config.onFailure?.({
                error: err,
                pending: this.queue.length,
                consecutiveFailures: this.consecutiveFailures,
                retryInMs,
            });
        }
    }

    /** Exponential backoff delay for the next attempt, capped */
    private getBackoffDelay(): number {
        const base = this.config.flushInterval || DEFAULT_FLUSH_INTERVAL;
        const ceiling = this.config.maxBackoffDelay ?? DEFAULT_MAX_BACKOFF_DELAY;

        return Math.min(base * 2 ** (this.consecutiveFailures - 1), ceiling);
    }

    /**
     * Start the batch timer
     */
    private startBatchTimer(): void {
        if (this.timer || this.isDestroyed) return;

        this.timer = setInterval(() => {
            // Fire and forget flush
            this.flush().catch(() => {
                // Errors are already logged in flush method
            });
        }, this.config.flushInterval!);
    }

    /**
     * Stop the batch timer
     */
    private stopBatchTimer(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    /**
     * Destroy the error reporter
     *
     * Terminal by design: after this the instance accepts nothing further. It is
     * therefore tied to the lifetime of the owning store (its Pinia effect
     * scope), never to a component unmount — a table hidden by `v-if` and shown
     * again reuses the cached store, and a reporter destroyed on the first
     * unmount would silently swallow every later error.
     */
    async destroy(): Promise<void> {
        this.stopBatchTimer();
        await this.flush();
        this.isDestroyed = true;
        this.queue = [];
    }

    /**
     * Send errors to the configured endpoint
     */
    private async sendToCustomEndpoint(errors: ECSError[]): Promise<void> {
        if (!this.config.endpoint) {
            throw new Error('Custom endpoint URL is required for custom service');
        }

        // `??`, not `||` — `maxRetries: 0` (and `retryDelay: 0`) must mean zero,
        // otherwise retries cannot be turned off at all.
        const maxRetries = this.config.maxRetries ?? DEFAULT_MAX_RETRIES;
        const retryDelay = this.config.retryDelay ?? DEFAULT_RETRY_DELAY;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const response = await fetch(this.config.endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(this.config.apiKey && {
                            Authorization: `Bearer ${this.config.apiKey}`,
                        }),
                    },
                    body: JSON.stringify({ errors }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Sent successfully
                return;
            } catch (err) {
                lastError = err as Error;

                // If there are retries left, wait before the next attempt
                if (attempt < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
                }
            }
        }

        // If every attempt failed
        throw lastError || new Error('Failed to send errors after retries');
    }
}

/** The observability hooks the owning store wires into a reporter */
export type ErrorReporterHooks = Pick<ErrorReporterConfig, 'onFailure' | 'onDrop'>;

/**
 * Error Reporter factory function
 * @param config - Aura configuration
 * @param hooks - Failure/drop callbacks; without them the reporter fails silently
 * @returns ErrorReporter instance, or null if disabled
 */
export const createErrorReporter = (
    config: AuraConfig,
    hooks: ErrorReporterHooks = {}
): ErrorReporter | null => {
    if (!config.errorReporting) return null;

    return new ErrorReporter({
        enabled: config.errorReporting,
        endpoint: config.errorReportingEndpoint,
        service: config.errorReportingService || 'custom',
        apiKey: config.errorReportingApiKey,
        maxRetries: DEFAULT_MAX_RETRIES,
        retryDelay: DEFAULT_RETRY_DELAY,
        batchSize: DEFAULT_BATCH_SIZE,
        flushInterval: DEFAULT_FLUSH_INTERVAL,
        ...hooks,
    });
};
