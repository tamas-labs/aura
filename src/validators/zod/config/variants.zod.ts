import { z } from 'zod';

/**
 * Variants Zod schema
 * - Flat structure: Record<string, string>
 * - Keys: non-empty strings
 * - Values: non-empty strings
 * - Nullable support
 *
 * @example
 * ```ts
 * { primary: 'primary', destroy: 'danger' } // Valid
 * { customVariant: 'custom-class' } // Valid (dynamic keys)
 * { empty: '' } // Invalid (empty string value)
 * null // Valid (fallback to default)
 * ```
 */
export const VariantsZod = z
    .record(
        z.string().min(1, 'Variant key cannot be empty'),
        z.string().min(1, 'Variant value cannot be empty')
    )
    .nullable();
