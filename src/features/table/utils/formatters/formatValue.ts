import type { FormatterInput, CellFormatConfig, RawHtmlOptions } from './formatter.types';
import { formatCurrency, formatNumber, formatUnit } from './number.formatter';
import { formatDate, formatDateTime } from './date.formatter';
import { formatDuration } from './time.formatter';
import { formatPhone, formatRaw } from './special.formatter';
import { extractCountryFromLocale } from './locale.utils';
import {
    formatPad,
    formatPadEnd,
    formatPadStart,
    formatSlice,
    formatUppercase,
    formatLowercase,
    formatCapitalize,
} from './text.formatter';

/** Additional options for formatting */
interface FormatValueOptions {
    skipTypeFormatting?: boolean;
    dateStyle?: 'short' | 'medium' | 'long';
    timeZone?: string;
    /** Raw HTML whitelist (config-driven) for sanitizing the `config.raw` branch. */
    rawHtml?: RawHtmlOptions;
}

/**
 * Applies type-based formatting (currency, number, date, datetime, phone)
 * @returns Promise resolving to the formatted value
 */
async function applyTypeFormatting(
    value: FormatterInput,
    config: CellFormatConfig,
    locale: string,
    currencyCode?: string,
    dateStyle?: 'short' | 'medium' | 'long',
    timeZone?: string
): Promise<FormatterInput> {
    if (config.currency) {
        const currency =
            typeof config.currency === 'string'
                ? config.currency
                : currencyCode || config.currencyCode || 'USD';
        return formatCurrency(value, { currency, locale });
    }

    if (config.unit) {
        return formatUnit(value, { unit: config.unit, locale });
    }

    if (config.number) {
        return formatNumber(value, { locale });
    }

    if (config.datetime) {
        return formatDateTime(value, { locale, format: dateStyle || 'short', timeZone });
    }

    if (config.date) {
        return formatDate(value, { locale, format: dateStyle || 'short', timeZone });
    }

    if (config.phone) {
        const country = extractCountryFromLocale(locale);
        return await formatPhone(value, country ? { defaultCountry: country } : {});
    }

    if (config.time) {
        return formatDuration(value);
    }

    return value;
}

/**
 * Applies text transformation (uppercase, lowercase, capitalize)
 */
function applyTextTransformation(value: FormatterInput, config: CellFormatConfig): FormatterInput {
    if (config.uppercase) {
        return formatUppercase(value);
    }
    if (config.lowercase) {
        return formatLowercase(value);
    }
    if (config.capitalize) {
        return formatCapitalize(value);
    }
    return value;
}

/**
 * Applies padding (padStart, padEnd, pad)
 */
function applyPadding(value: FormatterInput, config: CellFormatConfig): FormatterInput {
    const chars = config.chars || ' ';

    if (config.padStart) {
        return formatPadStart(value, config.padStart, chars);
    }
    if (config.padEnd) {
        return formatPadEnd(value, config.padEnd, chars);
    }
    if (config.pad) {
        return formatPad(value, { length: config.pad, char: chars, position: 'both' });
    }
    return value;
}

/**
 * Orchestrates value formatting based on cell configuration.
 *
 * @param value - The value to format
 * @param config - The cell configuration
 * @param locale - The locale to use (defaults to 'en-US' if not provided)
 * @param currencyCode - The currency code to use if config.currency is boolean (optional)
 * @param options - Additional formatting options (dateStyle, timeZone, skipTypeFormatting)
 * @returns Promise resolving to the formatted string
 */
export async function formatValue(
    value: FormatterInput,
    config: CellFormatConfig = {},
    locale: string = 'en-US',
    currencyCode?: string,
    options?: FormatValueOptions
): Promise<string> {
    // 1. Raw HTML check
    if (config.raw) {
        return formatRaw(value, options?.rawHtml);
    }

    // 2. Type based formatting
    let current = value;
    if (!options?.skipTypeFormatting) {
        current = await applyTypeFormatting(
            value,
            config,
            locale,
            currencyCode,
            options?.dateStyle,
            options?.timeZone
        );
    }

    // 3. Text manipulation (slice)
    if (config.slice) {
        current = formatSlice(current, {
            length: config.slice,
            endWith: config.sliceEnd || undefined,
        });
    }

    // 4. Text transformation
    current = applyTextTransformation(current, config);

    // 5. Padding
    current = applyPadding(current, config);

    if (current === null || current === undefined) {
        return '';
    }

    return String(current);
}
