import type { SortItem } from '../types/api-response.types';
import { resolveValue } from './resolve-value.util';
import { getOrBuild } from './bounded-cache.util';

/**
 * Collators, cached per locale, capped at `BOUNDED_CACHE_LIMIT` entries.
 *
 * `String.prototype.localeCompare` builds a collator on **every call**, so a
 * single sort of a thousand rows used to construct it around ten thousand times.
 * An `Intl.Collator` is stateless once built, so one instance per locale can be
 * shared by every table on the page.
 */
const collatorCache = new Map<string, Intl.Collator>();

/** Cache key for "no locale given — use the runtime default". */
const RUNTIME_DEFAULT_LOCALE_KEY = '';

/**
 * Returns the collator for a locale, building it on first use.
 *
 * @param locale - BCP 47 tag (`config.localization`), or `null`/`undefined` for
 *                 the runtime default
 * @returns A shared, `numeric: true` collator
 */
const getCollator = (locale?: string | null): Intl.Collator => {
    const key = locale || RUNTIME_DEFAULT_LOCALE_KEY;

    return getOrBuild(collatorCache, key, () => {
        try {
            return new Intl.Collator(locale || undefined, { numeric: true });
        } catch {
            // A structurally invalid tag throws a RangeError. The config validator
            // rejects those before they get here, but a comparator running inside a
            // computed is the worst place to find out otherwise: it would take the
            // whole render down instead of sorting slightly differently.
            return new Intl.Collator(undefined, { numeric: true });
        }
    });
};

/**
 * Compares two primitive values (string, number, boolean).
 */
const comparePrimitives = (valueA: unknown, valueB: unknown, collator: Intl.Collator): number => {
    // String comparison using the locale-aware collator
    if (typeof valueA === 'string' && typeof valueB === 'string') {
        return collator.compare(valueA, valueB);
    }

    // Numeric / Boolean / Other comparison
    const a = valueA as number | boolean;
    const b = valueB as number | boolean;

    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
};

/**
 * Compares two items based on a single sort rule.
 */
const compareByRule = (a: unknown, b: unknown, rule: SortItem, collator: Intl.Collator): number => {
    const { field, direction } = rule;
    const dirMultiplier = direction === 'asc' ? 1 : -1;

    const valueA = resolveValue(a, field);
    const valueB = resolveValue(b, field);

    // If values are equal, return 0
    if (valueA === valueB) return 0;

    // Handle null/undefined values (always push to the end)
    const isNullA = valueA === null || valueA === undefined;
    const isNullB = valueB === null || valueB === undefined;

    if (isNullA && !isNullB) return 1;
    if (!isNullA && isNullB) return -1;
    // A null and an undefined count as equal: the strict equality check above
    // only catches the null/null and undefined/undefined pairs.
    if (isNullA && isNullB) return 0;

    return comparePrimitives(valueA, valueB, collator) * dirMultiplier;
};

/**
 * Sorts an array based on multiple sort rules (Client-side sorting).
 *
 * This utility supports:
 * - Multi-column sorting (priority based on array order)
 * - String comparison (using a shared `Intl.Collator` for correct I18N sorting)
 * - Numeric and Boolean comparison
 * - Handling of null/undefined values (always moved to the end)
 * - Nested property paths (e.g. 'user.name')
 *
 * @param items - The array of items to sort
 * @param sortRules - The array of sorting rules (field and direction)
 * @param locale - Locale for the string comparison (`config.localization`). Left
 *                 out, the runtime default applies — which is the **browser's**
 *                 language, so the same data can sort differently from machine to
 *                 machine. Callers that have a configured locale should pass it.
 * @returns A new sorted array (shallow copy) or the original items in a new array if no rules provided
 */
export const sortItemsByRules = (
    items: unknown[],
    sortRules: SortItem[],
    locale?: string | null
): unknown[] => {
    // Input validation
    if (!items || !Array.isArray(items)) {
        return [];
    }

    // If no rules or empty rules, return shallow copy of original
    if (!sortRules || sortRules.length === 0) {
        return [...items];
    }

    // Resolved once per sort, not once per comparison
    const collator = getCollator(locale);

    // Create a shallow copy to avoid mutating the original array
    return [...items].sort((a, b) => {
        for (const rule of sortRules) {
            const result = compareByRule(a, b, rule, collator);
            if (result !== 0) {
                return result;
            }
        }
        return 0;
    });
};
