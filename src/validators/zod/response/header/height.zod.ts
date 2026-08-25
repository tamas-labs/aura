import { z } from 'zod';

/**
 * Height Zod Schema
 * - Validates the cell/header height in CSS format
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
 * HeightZod.parse("100px"); // success
 * HeightZod.parse("50%"); // success
 * HeightZod.parse("2.5rem"); // success
 * HeightZod.parse("auto"); // success
 * HeightZod.parse(null); // null
 * HeightZod.parse("100"); // error (missing unit)
 * ```
 */
export const HeightZod = z
    .string()
    .regex(/^(\d+(\.\d+)?(px|%|rem)|auto)$/, {
        message: "Height must be in format: '100px', '50%', '2.5rem' or 'auto'",
    })
    .nullable();
