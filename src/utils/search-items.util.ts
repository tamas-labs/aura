import type { SearchItem } from '../types/api-response.types';
import { foldSearchText } from './normalize-text.util';
import { resolveValue } from './resolve-value.util';

/**
 * Converts an arbitrary value into a comparable number.
 * Numbers pass through directly; strings/dates are tried via `Number()`, then `Date.parse()`.
 *
 * @param input - The value to convert.
 * @returns The number (epoch ms for dates), or `null` if it can't be compared.
 */
const toComparableNumber = (input: unknown): number | null => {
    if (input === null || input === undefined || input === '') {
        return null;
    }

    if (typeof input === 'number') {
        return Number.isNaN(input) ? null : input;
    }

    const asNumber = Number(input);
    if (!Number.isNaN(asNumber) && String(input).trim() !== '') {
        return asNumber;
    }

    const asDate = Date.parse(String(input));
    return Number.isNaN(asDate) ? null : asDate;
};

/**
 * Checks whether a value is within the `[min, max]` range (`between` search).
 * Either bound may be omitted (open range). A non-comparable value never matches.
 *
 * @param value - The item's field value.
 * @param min - Lower bound (or `null`/`undefined`).
 * @param max - Upper bound (or `null`/`undefined`).
 * @returns `true` if the value falls within the range.
 */
const matchesRange = (value: unknown, min: unknown, max: unknown): boolean => {
    const comparableValue = toComparableNumber(value);
    if (comparableValue === null) {
        return false;
    }

    const comparableMin = toComparableNumber(min);
    if (comparableMin !== null && comparableValue < comparableMin) {
        return false;
    }

    const comparableMax = toComparableNumber(max);
    if (comparableMax !== null && comparableValue > comparableMax) {
        return false;
    }

    return true;
};

/**
 * A search criterion with the parts that don't depend on the row precomputed.
 *
 * The comparable term is built once per criterion rather than once per row:
 * `normalize('NFD')` is the expensive half of an accent-insensitive comparison,
 * and a table can hold far more rows than search criteria.
 */
interface PreparedCriteria {
    /** The original criterion — `field`, `exact`, `min`/`max` are read from it. */
    criteria: SearchItem;
    /** The comparable form of `term`, or `null` when the term is empty. */
    comparableTerm: string | null;
}

/**
 * Checks whether a value matches the text search term.
 * Case-insensitive; if `exact` is set, expects a full match.
 *
 * @param value - The item's field value.
 * @param comparableTerm - The already-folded search term.
 * @param exact - Whether to require an exact match.
 * @param accentInsensitive - Whether diacritics should be ignored.
 * @returns `true` if it matches.
 */
const matchesTerm = (
    value: unknown,
    comparableTerm: string,
    exact: boolean | undefined,
    accentInsensitive: boolean
): boolean => {
    if (value === null || value === undefined) {
        return false;
    }

    const comparableValue = foldSearchText(String(value), accentInsensitive);

    return exact ? comparableValue === comparableTerm : comparableValue.includes(comparableTerm);
};

/**
 * Evaluates a single search criterion against an item.
 * If the criterion has `min`/`max`, it runs as a range search (`between`),
 * otherwise as a text search.
 *
 * @param item - The item being checked.
 * @param prepared - The search criterion with its comparable term.
 * @param accentInsensitive - Whether diacritics should be ignored.
 * @returns `true` if the item matches the criterion.
 */
const matchesCriteria = (
    item: unknown,
    prepared: PreparedCriteria,
    accentInsensitive: boolean
): boolean => {
    const { criteria, comparableTerm } = prepared;
    const { field, exact, min, max } = criteria;
    const value = resolveValue(item, field);

    // Range (between) search: it's enough for one of the bounds to be provided.
    const hasMin = min !== null && min !== undefined;
    const hasMax = max !== null && max !== undefined;
    if (hasMin || hasMax) {
        return matchesRange(value, min, max);
    }

    // An empty term doesn't filter.
    if (comparableTerm === null) {
        return true;
    }

    return matchesTerm(value, comparableTerm, exact, accentInsensitive);
};

/**
 * Builds the row-independent part of every criterion.
 *
 * @param searchItems - The raw criteria.
 * @param accentInsensitive - Whether diacritics should be ignored.
 * @returns The criteria paired with their comparable terms.
 */
const prepareCriteria = (
    searchItems: SearchItem[],
    accentInsensitive: boolean
): PreparedCriteria[] =>
    searchItems.map(criteria => {
        const { term } = criteria;
        const isEmptyTerm = term === '' || term === null || term === undefined;

        return {
            criteria,
            comparableTerm: isEmptyTerm ? null : foldSearchText(String(term), accentInsensitive),
        };
    });

/**
 * Filter items based on search criteria.
 * Supports exact and partial matching, case-insensitive string comparison,
 * optional accent-insensitive comparison, nested property access, and range
 * (`between`) matching via `min`/`max`.
 *
 * All search conditions must match (AND logic).
 *
 * @param items - The array of items to filter
 * @param searchItems - The criteria to search by
 * @param accentInsensitive - Ignore diacritics when comparing (`accentInsensitiveSearch`)
 * @returns The filtered items array
 *
 * @example
 * ```typescript
 * const items = [{ name: 'John', age: 30 }, { name: 'Jane', age: 25 }];
 * const search = [{ field: 'name', term: 'j', exact: false }];
 * const result = filterItemsBySearch(items, search); // both items
 *
 * // Range (between) search
 * const ranged = filterItemsBySearch(items, [{ field: 'age', min: 26, max: 40 }]); // John only
 *
 * // Accent-insensitive search
 * const rows = [{ name: 'Árvíztűrő' }];
 * filterItemsBySearch(rows, [{ field: 'name', term: 'arvizturo' }], true); // matches
 * ```
 */
export const filterItemsBySearch = (
    items: unknown[],
    searchItems: SearchItem[],
    accentInsensitive = false
): unknown[] => {
    if (!items || !Array.isArray(items)) {
        return [];
    }

    if (!searchItems || searchItems.length === 0) {
        return items;
    }

    const prepared = prepareCriteria(searchItems, accentInsensitive);

    return items.filter(item =>
        prepared.every(entry => matchesCriteria(item, entry, accentInsensitive))
    );
};
