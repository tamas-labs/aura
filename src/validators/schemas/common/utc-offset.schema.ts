import { UtcOffsetZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import { DEFAULT_UTC_OFFSET } from '../../../lib/default-values.lib';

/**
 * UtcOffset validation schema
 * - Validates UTC offset values
 * - Supports nullable values
 * - Allowed format: +/-HH:MM (e.g. '+02:00', '-05:00')
 * - Default value: DEFAULT_UTC_OFFSET
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateUtcOffset('+02:00', 'my-store'); // '+02:00'
 * const result2 = validateUtcOffset('-05:00', 'my-store'); // '-05:00'
 * const result3 = validateUtcOffset(null, 'my-store'); // null
 * const result4 = validateUtcOffset('+99:00', 'my-store'); // '+02:00' (fallback + error logged)
 * ```
 */

/**
 * UtcOffset validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated UTC offset value or DEFAULT_UTC_OFFSET fallback
 */
export const validateUtcOffset = (value: unknown, errorStoreId: string): string | null => {
    try {
        return UtcOffsetZod().parse(value) as string | null;
    } catch (error) {
        const errorStore = getErrorSink(errorStoreId);

        errorStore.addSchemaValidationError(
            'UtcOffsetValidator',
            'Invalid UTC offset provided',
            'utcOffset',
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            { note: 'Must be a valid UTC offset format (e.g., +02:00, -05:00)' }
        );

        return DEFAULT_UTC_OFFSET;
    }
};
