import { TimeZoneZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import { DEFAULT_TIME_ZONE } from '../../../lib/default-values.lib';

/**
 * TimeZone validation schema
 * - Validates IANA timezone values
 * - Supports nullable values
 * - Allowed values: IANA timezone list (e.g. 'Europe/Budapest', 'America/New_York')
 * - Default value: DEFAULT_TIME_ZONE
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateTimeZone('Europe/Budapest', 'my-store'); // 'Europe/Budapest'
 * const result2 = validateTimeZone('America/New_York', 'my-store'); // 'America/New_York'
 * const result3 = validateTimeZone(null, 'my-store'); // null
 * const result4 = validateTimeZone('Invalid/Zone', 'my-store'); // 'Europe/Budapest' (fallback + error logged)
 * ```
 */

/**
 * TimeZone validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated timezone value, or the DEFAULT_TIME_ZONE fallback
 */
export const validateTimeZone = (value: unknown, errorStoreId: string): string | null => {
    try {
        return TimeZoneZod().parse(value) as string | null;
    } catch (error) {
        const errorStore = getErrorSink(errorStoreId);

        errorStore.addSchemaValidationError(
            'TimeZoneValidator',
            'Invalid timezone provided',
            'timeZone',
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            { note: 'Must be a valid IANA timezone (e.g., Europe/Budapest, America/New_York)' }
        );

        return DEFAULT_TIME_ZONE;
    }
};
