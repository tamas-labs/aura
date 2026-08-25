import DOMPurify from 'isomorphic-dompurify';
import type { CountryCode } from 'libphonenumber-js/min';
import type { FormatterInput, PhoneOptions, RawHtmlOptions } from './formatter.types';
import {
    DEFAULT_RAW_CELL_ALLOWED_TAGS,
    DEFAULT_RAW_CELL_ALLOWED_ATTR,
    DEFAULT_RAW_ALLOW_DATA_ATTR,
} from '../../../../lib/raw-html-defaults.lib';

/**
 * The required `rel` tokens alongside `target="_blank"` (tabnabbing + referrer protection).
 * The `raw: true` path allows `a`/`target`/`rel`, so an untrusted API response's
 * `<a target="_blank">` without `rel` would open a reverse-tabnabbing hole.
 */
const REQUIRED_BLANK_REL_TOKENS = ['noopener', 'noreferrer'] as const;

/** DOMPurify entry point the `rel` enforcement hooks into. */
const AFTER_SANITIZE_ATTRIBUTES = 'afterSanitizeAttributes';

/**
 * DOMPurify hook: forces `rel="noopener noreferrer"` onto every `target="_blank"`
 * anchor. Preserves existing `rel` tokens (e.g. `nofollow`), only adding the
 * missing ones.
 */
function enforceBlankRel(node: Element): void {
    if (node.nodeName !== 'A' || node.getAttribute('target') !== '_blank') return;

    const tokens = new Set((node.getAttribute('rel') ?? '').split(/\s+/).filter(Boolean));
    for (const token of REQUIRED_BLANK_REL_TOKENS) tokens.add(token);
    node.setAttribute('rel', [...tokens].join(' '));
}

/**
 * Formats a phone number.
 * @returns Promise<string> The formatted phone number
 */
export async function formatPhone(
    value: FormatterInput,
    options: PhoneOptions = {}
): Promise<string> {
    if (value === null || value === undefined || value === '') return '';
    const text = String(value);

    const { format = 'international', defaultCountry = 'US' } = options;

    const { default: parsePhoneNumber } = await import('libphonenumber-js/min');

    const pn = parsePhoneNumber(text, defaultCountry as CountryCode);

    if (!pn || !pn.isValid()) {
        return '';
    }

    if (format === 'national') {
        return pn.formatNational();
    }
    if (format === 'e164') {
        return pn.number;
    }

    return pn.formatInternational();
}

/**
 * Sanitizes and returns raw HTML.
 *
 * The allowed tags / attributes / data-* attributes come from `config`
 * (`rawHtmlAllowedTags` / `rawHtmlAllowedAttr` / `rawHtmlAllowDataAttr`), via the
 * `formatValue` → `options.rawHtml` chain. If a field is not provided, we use the
 * cell-level default (`DEFAULT_RAW_CELL_ALLOWED_*`), which preserves the previous
 * hardcoded behavior (`style` is allowed).
 *
 * Sanitization is unconditional. The former `sanitize: false` bypass was
 * unreachable — no config key, prop or response field set it, and `formatRaw`
 * is not part of the public API — so its only observable effect was a
 * `console.warn` that the production build strips (`drop_console`). Rather than
 * making that warning survive, the dangerous state was removed: the whitelist is
 * the single knob, and it can be widened arbitrarily via config.
 */
export function formatRaw(value: FormatterInput, options: RawHtmlOptions = {}): string {
    if (value === null || value === undefined) return '';
    const text = String(value);

    const {
        allowedTags = DEFAULT_RAW_CELL_ALLOWED_TAGS,
        allowedAttr = DEFAULT_RAW_CELL_ALLOWED_ATTR,
        allowDataAttr = DEFAULT_RAW_ALLOW_DATA_ATTR,
    } = options;

    // The hook is scoped to this one call. `isomorphic-dompurify` exports a
    // shared module-level instance — which the host app may well be importing
    // too, since Aura declares it as a peer dependency — so a permanently
    // registered hook would silently rewrite the host's own `sanitize()` results
    // from the first raw cell onwards. Sanitization is synchronous, so nothing
    // can interleave between the registration and the removal.
    DOMPurify.addHook(AFTER_SANITIZE_ATTRIBUTES, enforceBlankRel);

    try {
        return DOMPurify.sanitize(text, {
            ALLOWED_TAGS: [...allowedTags],
            ALLOWED_ATTR: [...allowedAttr],
            ALLOW_DATA_ATTR: allowDataAttr,
        });
    } finally {
        // Passing the function as well matters: that way only *this* hook is
        // removed, never one the host registered. Older DOMPurify versions
        // ignore the second argument and pop the last hook — still ours, since
        // it was added synchronously just above.
        DOMPurify.removeHook(AFTER_SANITIZE_ATTRIBUTES, enforceBlankRel);
    }
}

/**
 * Converts `config`'s (or any object containing the raw HTML keys) raw HTML
 * settings into `RawHtmlOptions` for `formatValue`/`formatRaw`.
 * Skips `null`/`undefined` fields, so `formatRaw` uses its own default.
 */
export const buildRawHtmlOptions = (config: {
    rawHtmlAllowedTags?: readonly string[] | null;
    rawHtmlAllowedAttr?: readonly string[] | null;
    rawHtmlAllowDataAttr?: boolean | null;
}): RawHtmlOptions => ({
    allowedTags: config.rawHtmlAllowedTags ?? undefined,
    allowedAttr: config.rawHtmlAllowedAttr ?? undefined,
    allowDataAttr: config.rawHtmlAllowDataAttr ?? undefined,
});
