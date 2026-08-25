/**
 * The value a formatter may receive from a cell.
 *
 * Deliberately wide: the value comes from an API response, so anything JSON can
 * carry (plus a pre-parsed `Date`) has to be accepted. Every formatter narrows it
 * itself and returns an empty string for the values it cannot represent, so a
 * malformed cell renders blank instead of throwing.
 */
export type FormatterInput = string | number | boolean | Date | null | undefined;

/**
 * Base options shared by every locale-aware formatter.
 *
 * @property locale - BCP 47 locale tag (e.g. `hu-HU`). Defaults to `en-US` in each
 * formatter when omitted; an unparsable tag falls back to the runtime default locale.
 */
export interface FormatterOptions {
    locale?: string;
}

/**
 * Options for `formatSlice` — truncation to a maximum length.
 *
 * @property length - Maximum number of characters to keep.
 * @property endWith - Suffix appended when the value was actually truncated
 * (e.g. `'…'`). It is *not* counted against `length`.
 */
export interface SliceOptions {
    length: number;
    endWith?: string;
}

/**
 * Options for `formatPad` — padding to a fixed width.
 *
 * @property length - Target total length. Shorter values are padded, longer ones
 * are left untouched.
 * @property char - Padding character, a single space by default.
 * @property position - Which side to pad; `'both'` (the default) centers the value.
 */
export interface PadOptions {
    length: number;
    char?: string;
    position?: 'start' | 'end' | 'both';
}

/**
 * Options for `formatNumber` — locale-aware decimal formatting.
 *
 * @property decimals - Fixed number of fraction digits (sets both the minimum and
 * the maximum). When omitted, `Intl.NumberFormat` decides.
 */
export interface NumberOptions extends FormatterOptions {
    decimals?: number;
}

/**
 * Options for `formatCurrency`.
 *
 * @property currency - ISO 4217 code (e.g. `HUF`, `EUR`). Required: there is no
 * default currency, because guessing one would silently mislabel money.
 */
export interface CurrencyOptions extends FormatterOptions {
    currency: string;
}

/**
 * Options for `formatUnit`.
 *
 * @property unit - A sanctioned `Intl` unit identifier (e.g. `percent`,
 * `kilometer-per-hour`).
 * @property unitDisplay - How the unit is spelled out; `'short'` by default.
 */
export interface UnitOptions extends FormatterOptions {
    unit: string;
    unitDisplay?: 'short' | 'long' | 'narrow';
}

/**
 * Options for `formatDate` / `formatDateTime`.
 *
 * @property format - Date style preset (`'short'` by default); `formatDateTime`
 * combines it with a 2-digit hour and minute.
 * @property timeZone - IANA time zone (e.g. `Europe/Budapest`). Omitted means the
 * runtime's own zone.
 */
export interface DateOptions extends FormatterOptions {
    format?: 'short' | 'medium' | 'long';
    timeZone?: string;
}

/**
 * Options for `formatPhone`.
 *
 * Note there is no `locale` here — phone formatting is driven by country, not by
 * language, so `formatValue` derives `defaultCountry` from the locale's region
 * subtag (see `extractCountryFromLocale`).
 *
 * @property format - Output shape; `'international'` by default.
 * @property defaultCountry - ISO 3166-1 alpha-2 region used to interpret a number
 * written without a country prefix; `US` when omitted.
 */
export interface PhoneOptions {
    format?: 'national' | 'international' | 'e164';
    defaultCountry?: string;
}

/**
 * Configurable whitelist options for raw HTML sanitization.
 * Built from the `config.rawHtmlAllowedTags` / `rawHtmlAllowedAttr` / `rawHtmlAllowDataAttr`
 * values; if a field is missing, `formatRaw` uses its own cell-level defaults
 * (see `DEFAULT_RAW_CELL_ALLOWED_*`).
 *
 * There is no "skip sanitization" switch: the whitelist is the only knob, so raw
 * HTML cannot reach the DOM unsanitized. Widen `allowedTags`/`allowedAttr` if a
 * markup shape is missing.
 */
export interface RawHtmlOptions {
    allowedTags?: readonly string[];
    allowedAttr?: readonly string[];
    allowDataAttr?: boolean;
}

/**
 * The three text transforms as a standalone option object.
 *
 * No formatter takes this as a parameter today: the transforms are driven by the
 * same-named boolean flags on `CellFormatConfig`, and `formatValue` applies the
 * first one that is set. This is the grouped form of those switches.
 */
export interface TextTransformOptions {
    uppercase?: boolean;
    lowercase?: boolean;
    capitalize?: boolean;
}

/**
 * The formatting instructions of a single cell, as consumed by `formatValue`.
 *
 * Built by `buildFormatConfig` from any column type config (static, badge, link,
 * button, ...), which is why every field is nullable: a missing key is normalized to
 * `null` so "not set" and "explicitly off" look the same downstream.
 *
 * `formatValue` walks the fields in a fixed order, and each group is
 * **first-match-wins** rather than additive:
 *
 * 1. `raw` short-circuits everything else — the value is returned as sanitized HTML.
 * 2. type formatting: currency, unit, number, datetime, date, phone, time.
 * 3. `slice` (with `sliceEnd`).
 * 4. text transform: uppercase, lowercase, capitalize.
 * 5. padding: padStart, padEnd, pad — all using `chars` as the fill character.
 *
 * @property currency - `true` uses the caller's currency code (or `currencyCode`,
 * or `USD`); a string is itself the ISO 4217 code.
 * @property raw - Renders the value as sanitized HTML instead of text. Sanitization
 * is unconditional — see `RawHtmlOptions` for the whitelist knobs.
 * @property chars - Fill character for `pad` / `padStart` / `padEnd`.
 */
export interface CellFormatConfig {
    number?: boolean | null;
    currency?: boolean | string | null;
    currencyCode?: string;
    unit?: string | null;
    date?: boolean | null;
    datetime?: boolean | null;
    phone?: boolean | null;
    time?: boolean | null;
    slice?: number | null;
    sliceEnd?: string | null;
    raw?: boolean | string | null;
    pad?: number | null;
    padStart?: number | null;
    padEnd?: number | null;
    chars?: string | null;
    uppercase?: boolean | null;
    lowercase?: boolean | null;
    capitalize?: boolean | null;
}
