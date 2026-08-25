import { z } from 'zod';
import { StringZod } from '../../common/string.zod';

const ConditionalRuleZod = z.record(z.string(), z.unknown());

/**
 * Conditional Config Zod Schema
 *
 * - Validates the `if`/`else`/`key` conditional structure on every `body.columnConfigs` entry
 * - `key`: the name of the field to evaluate in the `items` object (1-250 characters, nullable)
 * - `if`: an array of condition objects — the properties of the first matching branch apply (nullable)
 * - `else`: fallback config if no `if` branch matches; if absent, the cell does not render (nullable)
 *
 * @example
 * ```ts
 * ConditionalConfigZod.parse({
 *     key: 'status',
 *     if: [{ eq: 'active', variant: 'success' }],
 *     else: { variant: 'secondary' }
 * }); // success
 *
 * ConditionalConfigZod.parse({ key: 'status' });    // success — if/else optional
 * ConditionalConfigZod.parse({ key: null });        // success — key nullable
 * ConditionalConfigZod.parse({ else: null });       // success — else nullable
 * ConditionalConfigZod.parse({ key: '' });          // Error — key min 1 character
 * ```
 */
export const ConditionalConfigZod = z.object({
    key: StringZod(1, 250).optional(),
    if: z.array(ConditionalRuleZod).optional().nullable(),
    else: z.record(z.string(), z.unknown()).optional().nullable(),
});
