import { VariantsZod } from '../../zod';
import { DEFAULT_VARIANTS } from '../../../lib/default-values.lib';
import { getErrorSink } from '../../utils/error-sink';

/**
 * Variants object validation
 * - Validates the structure of the variants object
 * - Flat structure: Record<string, string>
 * - Supports dynamic keys (primary, destroy, edit, etc.)
 * - Values: string (non-empty)
 * - Supports nullable values
 * - Default value: DEFAULT_VARIANTS
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateVariants(
 *   { primary: 'primary', destroy: 'danger' },
 *   'aura-core'
 * ); // { primary: 'primary', destroy: 'danger' }
 * ```
 */

/**
 * Variants validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated variants object or DEFAULT_VARIANTS fallback
 */
export function validateVariants(value: unknown, errorStoreId: string): Record<string, string> {
    try {
        const result = VariantsZod.parse(value);

        // If null, use the default value
        if (result === null) {
            return DEFAULT_VARIANTS as Record<string, string>;
        }

        return result as Record<string, string>;
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error to the error store
        errorStore.addError({
            severity: 'warning',
            component: 'VariantsValidator',
            action: 'validate',
            type: 'validation',
            message: 'Invalid variants object provided',
            details: error instanceof Error ? error.message : 'Unknown validation error',
            key: 'variants',
            metadata: {
                receivedValue: value,
                receivedType: typeof value,
            },
        });

        // Return the fallback value from DEFAULT_VARIANTS
        return DEFAULT_VARIANTS as Record<string, string>;
    }
}
