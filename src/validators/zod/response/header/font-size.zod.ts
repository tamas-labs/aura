import { z } from 'zod';

/**
 * Font Size Zod Schema
 * - Validates CSS font-size values
 * - Supports:
 *   - Units: px, rem, em, %
 *   - Keywords: small, medium, large, etc.
 * - Nullable: yes
 *
 * @example
 * ```ts
 * FontSizeZod.parse('12px'); // success
 * FontSizeZod.parse('1.5rem'); // success
 * FontSizeZod.parse('small'); // success
 * ```
 */
export const FontSizeZod = z
    .string()
    .regex(
        /^(\d+(\.\d+)?(px|rem|em|%)|small|medium|large|x-small|x-large|xx-small|xx-large|smaller|larger)$/,
        { message: "Must be a valid CSS font-size (e.g. '12px', '1rem', 'small')" }
    )
    .nullable();
