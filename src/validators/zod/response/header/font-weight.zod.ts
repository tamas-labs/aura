import { z } from 'zod';

/**
 * Font Weight Zod Schema
 * - Validates CSS font-weight values
 * - Supports:
 *   - Numbers: 100, 200...900
 *   - strings: '100', '200'...
 *   - Keywords: normal, bold, lighter, bolder
 * - Nullable: yes
 *
 * @example
 * ```ts
 * FontWeightZod.parse(400); // success
 * FontWeightZod.parse('bold'); // success
 * FontWeightZod.parse(150); // error
 * ```
 */
export const FontWeightZod = z
    .union([
        z
            .number()
            .min(100)
            .max(900)
            .refine(val => val % 100 === 0, { message: 'Must be multiple of 100' }),
        z.string().regex(/^(100|200|300|400|500|600|700|800|900|normal|bold|lighter|bolder)$/),
    ])
    .nullable();
