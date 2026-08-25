import { SessionStateZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import type { SessionState } from '../../../types';

/**
 * Session State Validator
 *
 * Validates the session state loaded from sessionStorage.
 * Ensures that the restored data is structurally valid and safe to use.
 *
 * @param value - The raw JSON object from sessionStorage
 * @param errorStoreId - The error handler store ID
 * @returns Validated SessionState object or null if invalid
 *
 * @example
 * ```typescript
 * const session = validateSessionState(rawData, 'my-store-errors');
 * if (session) {
 *   // restore state
 * }
 * ```
 */
export const validateSessionState = (value: unknown, errorStoreId: string): SessionState | null => {
    // Use safeParse to avoid throwing errors on invalid session data
    // We treat invalid session data as "no session" (null)
    const result = SessionStateZod.safeParse(value);

    if (result.success) {
        return result.data as SessionState;
    }

    // If validation fails, log a warning but don't break the app
    const errorStore = getErrorSink(errorStoreId);

    // Collect validation error details (safe access)
    const errorDetails =
        result.error?.issues?.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') ||
        'Invalid session data';

    errorStore.addSchemaValidationError(
        'SessionStateValidator',
        'Invalid session state data found in storage',
        'sessionState',
        value,
        errorDetails,
        {
            note: 'Session data will be ignored and default values used instead.',
        }
    );

    return null;
};
