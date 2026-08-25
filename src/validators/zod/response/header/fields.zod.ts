import { z } from 'zod';
import { htmlSanitizer } from '../../../sanitizers';

/**
 * Fields Array Zod Schema
 * - Validates an array of strings (field names)
 * - Used for cells displaying multiple fields (e.g. usage with separator)
 * - Array must be non-empty
 * - Strings must be non-empty and max 100 chars
 * - HTML sanitization applied to each string
 * - Nullable
 *
 * @example
 * ```ts
 * FieldsZod.parse(['name', 'email']); // OK
 * FieldsZod.parse([]); // Error: min 1
 * FieldsZod.parse(['']); // Error: min length 1
 * ```
 */
export const FieldsZod = z
    .array(
        z
            .string()
            .min(1, 'Field name cannot be empty')
            .max(100, 'Field name must be at most 100 characters')
            .transform(htmlSanitizer)
    )
    .min(1, 'Fields array must contain at least one element')
    .nullable();
