import { z } from 'zod';

/**
 * Pad Zod Schema
 * - Validates the padding values (pad, padStart, padEnd)
 * - Type: integer
 * - Minimum: 0 (cannot be negative)
 * - Maximum: 100 (reasonable limit)
 * - Nullable: yes (optional field)
 *
 * @example
 * ```ts
 * PadZod.parse(0); // 0
 * PadZod.parse(10); // 10
 * PadZod.parse(null); // null
 * PadZod.parse(-1); // error (min 0)
 * ```
 */
export const PadZod = z.number().int().min(0).max(100).nullable();
