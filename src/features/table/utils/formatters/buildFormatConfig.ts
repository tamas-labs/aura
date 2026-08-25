import type { CellFormatConfig } from './formatter.types';

/**
 * Configuration source that can provide value formatting properties.
 * Any column type config (StaticConfig, BadgeConfig, LinkConfig, etc.) can satisfy this interface.
 */
interface FormatConfigSource {
    number?: boolean | null;
    currency?: boolean | string | null;
    currencyCode?: string;
    unit?: string | null;
    date?: boolean | null;
    datetime?: boolean | null;
    phone?: boolean | null;
    time?: boolean | null;
    raw?: boolean | string | null;
    slice?: number | null;
    sliceEnd?: string | null;
    pad?: number | null;
    padStart?: number | null;
    padEnd?: number | null;
    chars?: string | null;
    uppercase?: boolean | null;
    lowercase?: boolean | null;
    capitalize?: boolean | null;
}

/**
 * Builds a CellFormatConfig from any column type configuration.
 *
 * Extracts only the value-formatting fields (number, currency, date, slice, uppercase, etc.)
 * and normalizes missing values to null. Used by all column type renderers
 * (static, badge, link, button, etc.) for `formatValue()` compatibility.
 *
 * @param config - Source configuration with optional formatting properties
 * @returns A normalized CellFormatConfig with all fields set (missing → null)
 *
 * @example
 * ```ts
 * // From a StaticConfig
 * buildFormatConfig({ number: true, padStart: 5, chars: '0' });
 * // → { number: true, padStart: 5, chars: '0', currency: null, date: null, ... }
 *
 * // Empty config
 * buildFormatConfig({});
 * // → { number: null, currency: null, date: null, ... }
 * ```
 */
export function buildFormatConfig(config: FormatConfigSource): CellFormatConfig {
    return {
        number: config.number ?? null,
        currency: config.currency ?? null,
        currencyCode: config.currencyCode,
        unit: config.unit ?? null,
        date: config.date ?? null,
        datetime: config.datetime ?? null,
        phone: config.phone ?? null,
        time: config.time ?? null,
        raw: config.raw ?? null,
        slice: config.slice ?? null,
        sliceEnd: config.sliceEnd ?? null,
        pad: config.pad ?? null,
        padStart: config.padStart ?? null,
        padEnd: config.padEnd ?? null,
        chars: config.chars ?? null,
        uppercase: config.uppercase ?? null,
        lowercase: config.lowercase ?? null,
        capitalize: config.capitalize ?? null,
    };
}
