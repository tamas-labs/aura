import { z } from 'zod';

/**
 * Line Height Zod Schema
 * - Validates CSS line-height values
 * - Supports:
 *   - Unitless number (e.g. 1.5)
 *   - Units: px, em, rem, %
 *   - Keyword: normal
 * - Nullable: yes
 *
 * @example
 * ```ts
 * LineHeightZod.parse('1.5'); // success
 * LineHeightZod.parse(1.5); // success (if number allowed? regex only checks string, let's allow number too via union or coercion)
 * // Implementation uses regex on string, assuming input is string in JSON mainly, but to be safe let's stick to string pattern as per plan regex
 * ```
 */
export const LineHeightZod = z
    .union([z.string().regex(/^(\d+(\.\d+)?(px|em|rem|%)?|normal)$/), z.number().positive()])
    .nullable();
