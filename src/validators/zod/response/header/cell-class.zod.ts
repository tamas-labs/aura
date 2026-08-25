import { z } from 'zod';
import { htmlSanitizer } from '../../../sanitizers';

/**
 * Helper for single class string validation
 */
const ClassStringSchema = z
    .string()
    .min(1, 'Class name cannot be empty')
    .max(100, 'Class name too long')
    .transform(htmlSanitizer);

/**
 * Cell Class Zod Schema
 * - Validates CSS classes
 * - Can be a single string or an array of strings
 * - HTML sanitization applied
 * - Nullable
 *
 * @example
 * ```ts
 * CellClassZod.parse('btn btn-primary'); // OK
 * CellClassZod.parse(['btn', 'btn-primary']); // OK
 * CellClassZod.parse(''); // Error
 * CellClassZod.parse([]); // Error
 * ```
 */
export const CellClassZod = z
    .union([
        z
            .string()
            .min(1, 'Class string cannot be empty')
            .max(500, 'Class string too long')
            .transform(htmlSanitizer),
        z
            .array(ClassStringSchema)
            .min(1, 'Class array cannot be empty')
            .max(50, 'Too many classes'),
    ])
    .nullable();
