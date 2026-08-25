import { IconsZod } from '../../zod';
import { DEFAULT_ICONS } from '../../../lib/default-values.lib';
import { getErrorSink } from '../../utils/error-sink';

/**
 * Icons object validation
 * - Validates the structure of the icons object
 * - Supports dynamic keys (sortable, filterable, settings, etc.)
 * - Values: string[] OR nested object (Record<string, string[]>)
 * - Supports nullable values
 * - Default value: DEFAULT_ICONS
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateIcons(
 *   { filterable: ['fas', 'fa-filter'], settings: ['fas', 'fa-gears'] },
 *   'aura-core'
 * ); // { filterable: ['fas', 'fa-filter'], settings: ['fas', 'fa-gears'] }
 * ```
 */

/**
 * Icons validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated icons object or DEFAULT_ICONS fallback
 */
export function validateIcons(
    value: unknown,
    errorStoreId: string
): Record<string, string[] | Record<string, string[]>> {
    try {
        const result = IconsZod.parse(value);

        // If null, use the default value
        if (result === null) {
            return DEFAULT_ICONS as Record<string, string[] | Record<string, string[]>>;
        }

        return result as Record<string, string[] | Record<string, string[]>>;
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error to the error store
        errorStore.addError({
            severity: 'warning',
            component: 'IconsValidator',
            action: 'validate',
            type: 'validation',
            message: 'Invalid icons object provided',
            details: error instanceof Error ? error.message : 'Unknown validation error',
            key: 'icons',
            metadata: {
                receivedValue: value,
                receivedType: typeof value,
            },
        });

        // Return the fallback value from DEFAULT_ICONS
        return DEFAULT_ICONS as Record<string, string[] | Record<string, string[]>>;
    }
}
