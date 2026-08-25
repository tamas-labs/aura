import { LocalizationZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import { DEFAULT_LOCALIZATION } from '../../../lib/default-values.lib';

/**
 * Localization validation schema
 * - Validates locale string values
 * - Supports nullable values
 * - Allowed format: xx-XX (e.g. 'hu-HU', 'en-US', 'de-DE')
 * - Default value: DEFAULT_LOCALIZATION
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateLocalization('hu-HU', 'my-store'); // 'hu-HU'
 * const result2 = validateLocalization('en-US', 'my-store'); // 'en-US'
 * const result3 = validateLocalization(null, 'my-store'); // null
 * const result4 = validateLocalization('invalid', 'my-store'); // 'hu-HU' (fallback + error logged)
 * ```
 */

/**
 * Localization validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated localization value or DEFAULT_LOCALIZATION fallback
 */
export const validateLocalization = (value: unknown, errorStoreId: string): string | null => {
    try {
        return LocalizationZod().parse(value) as string | null;
    } catch (error) {
        const errorStore = getErrorSink(errorStoreId);

        errorStore.addSchemaValidationError(
            'LocalizationValidator',
            'Invalid localization format provided',
            'localization',
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            { note: 'Must be in format xx-XX (e.g., hu-HU, en-US, de-DE)' }
        );

        return DEFAULT_LOCALIZATION;
    }
};
