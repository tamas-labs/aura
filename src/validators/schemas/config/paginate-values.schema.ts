import { PaginateValuesZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import { readOwnEntry } from '../../../utils/safe-object.util';
import { DEFAULT_PAGINATE_VALUES } from '../../../lib/default-values.lib';

const defaults: Record<string, number[]> = {
    paginateValues: DEFAULT_PAGINATE_VALUES,
};

/**
 * PaginateValues validation schema
 * - Validates the paginateValues array (number[])
 * - Supports nullable values
 * - Every value must be between 1 and 1000
 * - Default value: taken from defaults based on the key
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validatePaginateValues([5, 10, 25, 50], 'my-store', 'paginateValues'); // [5, 10, 25, 50]
 * const result2 = validatePaginateValues(null, 'my-store', 'paginateValues'); // null
 * const result3 = validatePaginateValues([0, 5000], 'my-store', 'paginateValues'); // [5, 10, 25, 50, 100] (fallback from defaults + error logged)
 * const result4 = validatePaginateValues('invalid', 'my-store', 'paginateValues'); // [5, 10, 25, 50, 100] (fallback + error logged)
 * ```
 */

/**
 * PaginateValues validator function
 *
 * @param value - The value to validate (number[] or null)
 * @param errorStoreId - The error handler store identifier
 * @param key - The config key name (e.g. 'paginateValues')
 * @returns Validated number[] value or the fallback read from defaults based on the key
 */
export const validatePaginateValues = (
    value: unknown,
    errorStoreId: string,
    key: string
): number[] | null => {
    try {
        return PaginateValuesZod.parse(value);
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error via the centralized helper function
        errorStore.addSchemaValidationError(
            'PaginateValuesValidator',
            'Invalid paginateValues array provided',
            key,
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            { constraints: { min: 1, max: 1000 } }
        );

        // Return the fallback value from defaults
        return readOwnEntry(defaults, key) ?? [5, 10, 25, 50, 100];
    }
};
