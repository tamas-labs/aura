import { z } from 'zod';

/**
 * Width Zod Schema
 * - Validates the cell width in CSS format
 * - Type: string (pattern matching)
 * - Accepted formats:
 *   - "{number}px" (e.g. "100px")
 *   - "{number}%" (e.g. "50%")
 *   - "{number}rem" (e.g. "2.5rem", "10rem")
 *   - "auto"
 * - Nullable: yes (optional field)
 *
 * Regex: `^(\d+(\.\d+)?(px|%|rem)|auto)$`
 *
 * @example
 * ```ts
 * WidthZod.parse("100px"); // success
 * WidthZod.parse("50%"); // success
 * WidthZod.parse("2.5rem"); // success
 * WidthZod.parse("auto"); // success
 * WidthZod.parse(null); // null
 * WidthZod.parse("100"); // error (missing unit)
 * ```
 */
export const WidthZod = z
    .string()
    .regex(/^(\d+(\.\d+)?(px|%|rem)|auto)$/, {
        message: "Width must be in format: '100px', '50%', '2.5rem' or 'auto'",
    })
    .nullable();
