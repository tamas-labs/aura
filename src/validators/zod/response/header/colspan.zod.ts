import { z } from 'zod';

/**
 * Colspan Zod Schema
 * - Validates the colspan value (column merging)
 * - Type: integer
 * - Minimum: 1
 * - Maximum: 50
 * - Nullable: yes (optional field)
 *
 * @example
 * ```ts
 * ColspanZod.parse(1); // 1
 * ColspanZod.parse(5); // 5
 * ColspanZod.parse(null); // null
 * ColspanZod.parse(0); // error (min 1)
 * ```
 */
export const ColspanZod = z.number().int().min(1).max(50).nullable();
