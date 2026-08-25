import { z } from 'zod';
import { HeaderSettingsZod } from './header-settings.zod';

/**
 * Header Zod Schema
 * - Required object type
 * - `rows` is a required field (array)
 * - `settings` is optional
 * - Removes unknown fields (.strip())
 *
 * @example
 * ```ts
 * HeaderZod.parse({ rows: [...] }); // success
 * HeaderZod.parse({ rows: [...], extra: 'val' }); // success (extra stripped)
 * HeaderZod.parse({}); // error (missing rows)
 * ```
 */
export const HeaderZod = z
    .object({
        rows: z
            .array(z.record(z.string(), z.unknown()))
            .min(1, 'Header rows array must contain at least one row'),
        settings: HeaderSettingsZod.optional(),
    })
    .strip();
