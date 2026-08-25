import { ActionButtonsZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import type { ActionButtonItem } from '../../../types/config.types';

const ALLOWED_VALUES: ActionButtonItem[] = ['refresh', 'export', 'settings'];

/**
 * ActionButtons validation schema
 * - Validates the actionButtons array (ActionButtonItem[])
 * - Supports nullable values
 * - Only allowed string values: 'refresh', 'export', 'settings'
 * - Duplicates are not allowed
 * - Error handling: filters out invalid elements
 *
 * @example
 * ```ts
 * const result = validateActionButtons(['refresh'], 'store-id', 'actionButtons'); // ['refresh']
 * const result2 = validateActionButtons(null, 'store-id', 'actionButtons'); // null
 * const result3 = validateActionButtons(['refresh', 'invalid'], 'store-id', 'actionButtons'); // ['refresh'] (filtered)
 * const result4 = validateActionButtons([''], 'store-id', 'actionButtons'); // [] (filtered)
 * ```
 */

/**
 * ActionButtons validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @param key - The config key name (e.g. 'actionButtons')
 * @returns Validated and filtered ActionButtonItem[] value
 */
export const validateActionButtons = (
    value: unknown,
    errorStoreId: string,
    key: string
): ActionButtonItem[] | null => {
    try {
        const result = ActionButtonsZod.parse(value);
        return result as ActionButtonItem[] | null;
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        let filteredResult: ActionButtonItem[] = [];
        const invalidItems: unknown[] = [];

        if (Array.isArray(value)) {
            // Filtering: keep only valid ActionButtonItem values and remove duplicates
            const validSet = new Set<ActionButtonItem>();

            value.forEach(item => {
                if (ALLOWED_VALUES.includes(item as ActionButtonItem)) {
                    validSet.add(item as ActionButtonItem);
                } else {
                    invalidItems.push(item);
                }
            });

            filteredResult = Array.from(validSet);
        }

        // Add the error via the centralized helper function
        errorStore.addSchemaValidationError(
            'ActionButtonsValidator',
            'Invalid actionButtons array provided',
            key,
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            {
                key,
                allowedValues: ALLOWED_VALUES,
                invalidItems: invalidItems.length > 0 ? invalidItems : undefined,
                filteredResult,
            }
        );

        // Fallback: return the filtered result
        return filteredResult;
    }
};
