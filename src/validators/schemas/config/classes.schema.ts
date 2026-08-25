import { ClassesZod } from '../../zod';
import { DEFAULT_CLASSES } from '../../../lib/default-values.lib';
import { getErrorSink } from '../../utils/error-sink';

/**
 * Classes object validation
 * - Validates the structure of the classes object
 * - Supports dynamic keys (table, icon, button, link, modal, etc.)
 * - Values: string[] OR nested object (Record<string, string[]>)
 * - For the dataTypes key it is always a nested object
 * - Supports nullable values
 * - Default value: DEFAULT_CLASSES
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateClasses(
 *   { table: ['table-striped'], icon: ['mx-2'] },
 *   'aura-core'
 * ); // { table: ['table-striped'], icon: ['mx-2'] }
 * ```
 */

/**
 * Classes validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated classes object or DEFAULT_CLASSES fallback
 */
export function validateClasses(
    value: unknown,
    errorStoreId: string
): Record<string, string[] | Record<string, string[]>> {
    try {
        const result = ClassesZod.parse(value);

        // If null, use the default value
        if (result === null) {
            return DEFAULT_CLASSES as Record<string, string[] | Record<string, string[]>>;
        }

        return result as Record<string, string[] | Record<string, string[]>>;
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error via the centralized helper function
        errorStore.addSchemaValidationError(
            'ClassesValidator',
            'Invalid classes object provided',
            'classes',
            value,
            error instanceof Error ? error.message : 'Unknown validation error'
        );

        // Return the fallback value from DEFAULT_CLASSES
        return DEFAULT_CLASSES as Record<string, string[] | Record<string, string[]>>;
    }
}
