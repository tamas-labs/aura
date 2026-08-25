import { z } from 'zod';

/**
 * Slice Zod Schema
 * - Validates text truncation length
 * - Must be an integer between 1 and 10000
 * - Determines how many characters to show before truncation
 *
 * @example
 * ```ts
 * SliceZod.parse(50); // 50
 * SliceZod.parse(0); // throws error (min 1)
 * SliceZod.parse(null); // null
 * ```
 */
export const SliceZod = z.number().int().min(1).max(10000).nullable();
