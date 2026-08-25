import { CurrencyCodeZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import { DEFAULT_CURRENCY_CODE } from '../../../lib/default-values.lib';

/**
 * Currency validation schema
 * - Validates ISO 4217 currency codes
 * - Supports nullable values
 * - Allowed values: ISO 4217 codes (e.g. 'HUF', 'USD', 'EUR')
 * - Default value: DEFAULT_CURRENCY_CODE
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateCurrencyCode('HUF', 'my-store'); // 'HUF'
 * const result2 = validateCurrencyCode('USD', 'my-store'); // 'USD'
 * const result3 = validateCurrencyCode(null, 'my-store'); // null
 * const result4 = validateCurrencyCode('INVALID', 'my-store'); // 'HUF' (fallback + error logged)
 * ```
 */

/**
 * Currency validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated currency code, or the DEFAULT_CURRENCY_CODE fallback
 */
export const validateCurrencyCode = (value: unknown, errorStoreId: string): string | null => {
    try {
        return CurrencyCodeZod().parse(value) as string | null;
    } catch (error) {
        const errorStore = getErrorSink(errorStoreId);

        errorStore.addSchemaValidationError(
            'CurrencyCodeValidator',
            'Invalid ISO 4217 currency code provided',
            'currencyCode',
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            { note: 'Must be a valid ISO 4217 currency code (e.g., HUF, USD, EUR)' }
        );

        return DEFAULT_CURRENCY_CODE;
    }
};
