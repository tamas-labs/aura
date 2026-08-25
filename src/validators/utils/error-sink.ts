import { useErrorHandlerStore } from '../../state/core/error-handler.state';
import type { ECSError, ErrorSeverity } from '../../types/error.types';

/**
 * The slice of the error handler store the validator layer actually uses.
 *
 * Two methods out of the store's full surface — validators only ever *record*
 * findings, they never read, filter or clear the error list. Typing them against
 * this narrow interface instead of the store keeps the dependency honest and
 * documents exactly what a future non-Pinia implementation would have to provide.
 */
export interface ErrorSink {
    /**
     * Record a schema validation finding (always `warning` severity, `validate`
     * action, with `receivedValue` / `receivedType` metadata).
     */
    addSchemaValidationError(
        component: string,
        message: string,
        key: string,
        receivedValue: unknown,
        details?: string,
        additionalMetadata?: Record<string, unknown>
    ): void;
    /** Record an arbitrary ECS error (used where the schema helper's shape does not fit) */
    addError(error: Omit<ECSError, 'timestamp' | 'level'> & { level?: ErrorSeverity }): void;
}

/**
 * The **single** point where the validator layer reaches into the state layer.
 *
 * @remarks
 * `validators/` sits below `state/`, yet every validator needs somewhere to report
 * to. Until the validators take an injected sink as a parameter (the eventual DI
 * refactor), that inversion exists — but it lives here, in one file, rather than in
 * all 32 validator modules. Two consequences worth keeping:
 *
 * - a new validator cannot deepen the coupling: it imports this seam, not the store;
 * - switching to real dependency injection becomes a change to this file plus the
 *   validators' parameter lists, with the call bodies (`sink.addSchemaValidationError(…)`)
 *   already in their final shape.
 *
 * The store is resolved lazily, on the error path only, so validating a valid value
 * still touches no Pinia context.
 *
 * @param errorStoreId - The error handler store identifier threaded through the validators
 * @returns The narrow reporting interface backed by the error handler store
 */
export const getErrorSink = (errorStoreId: string): ErrorSink => useErrorHandlerStore(errorStoreId);
