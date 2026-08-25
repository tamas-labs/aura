import type {
    FormatterInput,
    NumberOptions,
    CurrencyOptions,
    UnitOptions,
} from './formatter.types';
import { getOrBuild } from '../../../../utils/bounded-cache.util';

// Cache for Intl.NumberFormat objects, capped at BOUNDED_CACHE_LIMIT entries
const numberFormatCache = new Map<string, Intl.NumberFormat>();

function getCacheKey(locale: string, options: Intl.NumberFormatOptions): string {
    // Determine a safe cache key. JSON.stringify order is not guaranteed but for simple options objects usually stable enough for this use case.
    return `${locale}-${JSON.stringify(options)}`;
}

function getNumberFormatter(locale: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
    const key = getCacheKey(locale, options || {});

    return getOrBuild(numberFormatCache, key, () => {
        try {
            return new Intl.NumberFormat(locale, options);
        } catch {
            // Defensive fallback to the default locale. `locale`/`currency`/`unit` are
            // validated at the zod boundary (locale-regex + closed `currency`/`unit` enum),
            // so this branch is unreachable on the validated path — that's why we do NOT
            // log to the console (the plugin reports errors to the central error store,
            // not the console).
            return new Intl.NumberFormat(undefined, options);
        }
    });
}

/**
 * Parsers input to number or returns null.
 */
function parseNumber(value: FormatterInput): number | null {
    if (value === null || value === undefined || value === '') return null;
    if (typeof value === 'number') return isNaN(value) ? null : value;
    const num = Number(value);
    return isNaN(num) ? null : num;
}

/**
 * Formats a number with locale support.
 *
 * @example
 * formatNumber(1234.56, { locale: 'hu-HU' }) // "1 234,56"
 */
export function formatNumber(value: FormatterInput, options: NumberOptions = {}): string {
    const num = parseNumber(value);
    if (num === null) return '';

    const { locale = 'en-US', decimals } = options;
    const intlOptions: Intl.NumberFormatOptions = {};

    if (decimals !== undefined && decimals !== null) {
        intlOptions.minimumFractionDigits = decimals;
        intlOptions.maximumFractionDigits = decimals;
    }

    return getNumberFormatter(locale, intlOptions).format(num);
}

/**
 * Formats a value as currency.
 *
 * @example
 * formatCurrency(1234, { currency: 'HUF', locale: 'hu-HU' }) // "1 234 Ft"
 */
export function formatCurrency(value: FormatterInput, options: CurrencyOptions): string {
    const num = parseNumber(value);
    if (num === null) return '';

    const { locale = 'en-US', currency } = options;
    const intlOptions: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: currency,
    };

    return getNumberFormatter(locale, intlOptions).format(num);
}

/**
 * Formats a value as unit.
 *
 * @example
 * formatUnit(1234, { unit: 'percent', locale: 'hu-HU' }) // "1 234%"
 * formatUnit(50, { unit: 'kilometer-per-hour', locale: 'en-US' }) // "50 km/h"
 */
export function formatUnit(value: FormatterInput, options: UnitOptions): string {
    const num = parseNumber(value);
    if (num === null) return '';

    const { locale = 'en-US', unit, unitDisplay = 'short' } = options;
    const intlOptions: Intl.NumberFormatOptions = {
        style: 'unit',
        unit: unit,
        unitDisplay: unitDisplay,
    };

    return getNumberFormatter(locale, intlOptions).format(num);
}
