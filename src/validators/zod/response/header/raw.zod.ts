import { z } from 'zod';

/**
 * Raw HTML Flag Zod Schema
 * - Validates the 'raw' configuration flag for cells
 * - Must be a boolean value
 * - True indicates content should be rendered as raw HTML
 * - Nullable
 * - NOTE: This only validates the `raw` boolean flag. The actual content
 *   sanitization happens at render time in `formatRaw` (with a config-driven
 *   whitelist: rawHtmlAllowedTags / rawHtmlAllowedAttr / rawHtmlAllowDataAttr).
 *
 * @example
 * ```ts
 * RawZod.parse(true); // true
 * RawZod.parse(false); // false
 * RawZod.parse(null); // null
 * ```
 */
export const RawZod = z.boolean().nullable();
