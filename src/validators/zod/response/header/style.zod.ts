import { z } from 'zod';
import { htmlSanitizer } from '../../../sanitizers';

/**
 * Style Zod Schema
 * - Validates inline CSS style string
 * - Max length: 1000 chars
 * - HTML sanitization applied
 * - Nullable
 *
 * @example
 * ```ts
 * StyleZod.parse('color: red;'); // OK
 * StyleZod.parse(''); // OK (empty style is valid CSS)
 * ```
 */
export const StyleZod = z
    .string()
    .max(1000, 'Style string too long (max 1000 chars)')
    .transform(htmlSanitizer)
    .nullable();
