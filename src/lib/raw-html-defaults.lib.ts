/**
 * Whether data attributes are allowed by default for raw HTML rendering
 * (the `formatRaw` default for `allowDataAttr`, and `config.rawHtmlAllowDataAttr`).
 */
export const DEFAULT_RAW_ALLOW_DATA_ATTR = true;

/**
 * Default allowed tags for cell-level `raw: true` rendering
 * (the `formatRaw` whitelist). Intentionally narrower but more permissive on
 * attributes than `DEFAULT_RAW_ALLOWED_*`: here `style` IS ALLOWED, because
 * `raw: true` is an explicit developer opt-in for trusted content.
 *
 * These are the defaults for `config.rawHtmlAllowedTags` / `config.rawHtmlAllowedAttr` —
 * the host app can override them (e.g. to disallow `style`).
 */
export const DEFAULT_RAW_CELL_ALLOWED_TAGS = [
    'b',
    'i',
    'u',
    'strong',
    'em',
    'span',
    'br',
    'p',
    'a',
] as const;

/**
 * Default allowed attributes for cell-level `raw: true` rendering
 * (the `formatRaw` whitelist). `style` IS ALLOWED here
 * (DOMPurify sanitizes the CSS content anyway).
 */
export const DEFAULT_RAW_CELL_ALLOWED_ATTR = [
    'href',
    'target',
    'title',
    'class',
    'style',
    'rel',
] as const;
