import { z } from 'zod';

/**
 * Number Zod Schema
 * - Accepts the number type
 * - Allows nullable values
 * - Min: 1, Max: 1000
 *
 * The 1..1000 range is the shared bound for the numeric config keys (currently
 * `rowsNumber`): 0 or a negative page size is meaningless, and the upper bound keeps
 * a mistyped value from asking for an unbounded page. No default here — the fallback
 * is chosen per key by `validateNumber`.
 *
 * @example
 * ```ts
 * NumberZod.parse(10);   // 10
 * NumberZod.parse(null); // null
 * NumberZod.parse(0);    // throws (below the minimum)
 * NumberZod.parse(1001); // throws (above the maximum)
 * ```
 */
export const NumberZod = z.number().min(1).max(1000).nullable();
