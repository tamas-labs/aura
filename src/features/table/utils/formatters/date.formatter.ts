import type { FormatterInput, DateOptions } from './formatter.types';
import { getOrBuild } from '../../../../utils/bounded-cache.util';
import { readOwnEntry } from '../../../../utils/safe-object.util';

// Cache for Intl.DateTimeFormat objects, capped at BOUNDED_CACHE_LIMIT entries
const dateFormatCache = new Map<string, Intl.DateTimeFormat>();

function getCacheKey(locale: string, options: Intl.DateTimeFormatOptions): string {
    return `${locale}-${JSON.stringify(options)}`;
}

function getDateFormatter(
    locale: string,
    options?: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
    const key = getCacheKey(locale, options || {});

    return getOrBuild(dateFormatCache, key, () => {
        try {
            return new Intl.DateTimeFormat(locale, options);
        } catch {
            // Defensive fallback to the default locale. `locale`/`options` are validated
            // at the zod boundary (locale-regex + closed `timeZone` enum), so this branch
            // is unreachable on the validated path — that's why we do NOT log to the
            // console (the plugin reports errors to the central error store, not the console).
            return new Intl.DateTimeFormat(undefined, options);
        }
    });
}

function parseDate(value: FormatterInput): Date | null {
    if (value === null || value === undefined || value === '') return null;
    if (value instanceof Date) {
        return isNaN(value.getTime()) ? null : value;
    }
    if (typeof value === 'boolean') return null;

    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
}

const FORMAT_MAP: Record<string, Intl.DateTimeFormatOptions> = {
    short: { year: 'numeric', month: '2-digit', day: '2-digit' },
    medium: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
};

/**
 * Formats a date value to a localized string.
 *
 * @param value - The value to format (Date object, timestamp constant, or ISO string)
 * @param options - Formatting options (locale, dateStyle format, timeZone)
 * @returns The formatted date string, or empty string if input is invalid
 *
 * @example
 * formatDate(new Date('2024-01-01'), { locale: 'en-US' }) // "01/01/2024"
 * formatDate('2024-01-01', { locale: 'hu-HU', format: 'medium' }) // "2024. jan. 1."
 * formatDate(null) // ""
 */
export function formatDate(value: FormatterInput, options: DateOptions = {}): string {
    const date = parseDate(value);
    if (!date) return '';

    const { locale = 'en-US', format = 'short', timeZone } = options;
    const intlOptions: Intl.DateTimeFormatOptions = {
        ...(readOwnEntry(FORMAT_MAP, format) ?? FORMAT_MAP.short),
        ...(timeZone ? { timeZone } : {}),
    };

    return getDateFormatter(locale, intlOptions).format(date);
}

/**
 * Formats both date and time to a localized string.
 * Combines date style (short/medium/long) with time (hour:minute).
 *
 * @param value - The value to format
 * @param options - Formatting options (locale, dateStyle format, timeZone)
 * @returns The formatted date and time string
 *
 * @example
 * formatDateTime('2024-01-01T14:30:00', { locale: 'en-US' }) // "01/01/2024, 02:30 PM"
 * formatDateTime('2024-01-01T14:30:00', { locale: 'hu-HU', format: 'medium' }) // "2024. jan. 1. 14:30"
 */
export function formatDateTime(value: FormatterInput, options: DateOptions = {}): string {
    const date = parseDate(value);
    if (!date) return '';

    const { locale = 'en-US', format = 'short', timeZone } = options;
    const dateOptions = readOwnEntry(FORMAT_MAP, format) ?? FORMAT_MAP.short;
    const intlOptions: Intl.DateTimeFormatOptions = {
        ...dateOptions,
        hour: '2-digit',
        minute: '2-digit',
        ...(timeZone ? { timeZone } : {}),
    };

    return getDateFormatter(locale, intlOptions).format(date);
}
