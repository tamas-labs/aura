import { NumberZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import { readOwnEntry } from '../../../utils/safe-object.util';
import { DEFAULT_ROWS_NUMBER } from '../../../lib/default-values.lib';

const defaults: Record<string, number> = {
    rowsNumber: DEFAULT_ROWS_NUMBER,
};

/**
 * Number validation schema
 * - Validates number values
 * - Supports nullable values
 * - Min: 1, Max: 1000
 * - Default value: read from defaults by key
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateNumber(10, 'my-store', 'rowsNumber'); // 10
 * const result2 = validateNumber(null, 'my-store', 'rowsNumber'); // null
 * const result3 = validateNumber(0, 'my-store', 'rowsNumber'); // 10 (fallback from defaults + error logged)
 * const result4 = validateNumber(1001, 'my-store', 'rowsNumber'); // 10 (fallback + error logged)
 * const result5 = validateNumber('invalid', 'my-store', 'rowsNumber'); // 10 (fallback + error logged)
 * ```
 */

/**
 * Number validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @param key - The config key name (e.g. 'rowsNumber')
 * @returns Validated number value, or the fallback read from defaults by key
 */
export const validateNumber = (
    value: unknown,
    errorStoreId: string,
    key: string
): number | null => {
    try {
        return NumberZod.parse(value);
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error via the centralized helper function
        errorStore.addSchemaValidationError(
            'NumberValidator',
            'Invalid number value provided',
            key,
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            { constraints: { min: 1, max: 1000 } }
        );

        // Return the fallback value from defaults
        return readOwnEntry(defaults, key) ?? 10;
    }
};
