import { DateStyleZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import { DEFAULT_DATE_STYLE } from '../../../lib/default-values.lib';

/**
 * DateStyle validation schema
 * - Validates date display style values
 * - Supports nullable values
 * - Allowed values: 'short', 'medium', 'long'
 * - Default value: DEFAULT_DATE_STYLE ('short')
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateDateStyle('short', 'my-store'); // 'short'
 * const result2 = validateDateStyle('medium', 'my-store'); // 'medium'
 * const result3 = validateDateStyle('long', 'my-store'); // 'long'
 * const result4 = validateDateStyle(null, 'my-store'); // null
 * const result5 = validateDateStyle('YYYY.MM.DD', 'my-store'); // 'short' (fallback + error logged)
 * const result6 = validateDateStyle(123, 'my-store'); // 'short' (fallback + error logged)
 * ```
 */

/**
 * DateStyle validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated date style value, or the DEFAULT_DATE_STYLE fallback
 */
export const validateDateStyle = (
    value: unknown,
    errorStoreId: string
): 'short' | 'medium' | 'long' | null => {
    try {
        return DateStyleZod().parse(value);
    } catch (error) {
        const errorStore = getErrorSink(errorStoreId);

        errorStore.addSchemaValidationError(
            'DateStyleValidator',
            'Invalid date style provided',
            'dateStyle',
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            { note: "Must be 'short', 'medium', or 'long'" }
        );

        return DEFAULT_DATE_STYLE;
    }
};
