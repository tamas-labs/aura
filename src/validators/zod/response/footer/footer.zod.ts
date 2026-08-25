import { z } from 'zod';
import { FooterSettingsZod } from './footer-settings.zod';
import { HeaderRowsZod } from '../header/header-rows.zod';

/**
 * Footer Zod Schema
 * - Required object type (if present)
 * - `rows` is a required field (array, min 1 element) — reuses HeaderRowsZod
 * - `settings` is optional
 * - Removes unknown fields (.strip())
 *
 * @example
 * ```ts
 * FooterZod.parse({ rows: [...] }); // success
 * FooterZod.parse({ rows: [...], settings: { sticky: true } }); // success
 * FooterZod.parse({}); // error (missing rows)
 * ```
 */
export const FooterZod = z
    .object({
        rows: HeaderRowsZod,
        settings: FooterSettingsZod.optional(),
    })
    .strip();
