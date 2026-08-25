import { z } from 'zod';

/**
 * Rowspan Zod Schema
 * - Validates the rowspan value (row merging)
 * - Type: integer
 * - Minimum: 1
 * - Maximum: 20
 * - Nullable: yes (optional field)
 *
 * @example
 * ```ts
 * RowspanZod.parse(1); // 1
 * RowspanZod.parse(3); // 3
 * RowspanZod.parse(null); // null
 * RowspanZod.parse(0); // error (min 1)
 * ```
 */
export const RowspanZod = z.number().int().min(1).max(20).nullable();
