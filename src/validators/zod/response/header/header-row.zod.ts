import { z } from 'zod';

/**
 * Header Row Zod Schema
 *
 * Validates the structure of a single header row object:
 * - Required object type
 * - The `cells` field is required
 * - Removes unknown fields (.strip())
 *
 * @example
 * ```ts
 * HeaderRowZod.parse({ cells: [...] }); // success
 * HeaderRowZod.parse({ cells: [...], extra: 'value' }); // success (extra removed)
 * ```
 */
export const HeaderRowZod = z
    .object({
        cells: z
            .array(z.record(z.string(), z.unknown()))
            .min(1, 'Header rows must contain at least one cell'),
    })
    .strip();
