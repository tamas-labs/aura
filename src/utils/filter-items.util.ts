import type { FilterItem } from '../types/api-response.types';
import { resolveValue } from './resolve-value.util';
import { resolveDateValue } from './resolve-date-value.util';

/** A bare `yyyy-mm-dd` value, with no time component. */
const ISO_DATE_ONLY_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Helper to check loose equality between filter value and item value.
 * Handles string/number coercion while maintaining strict check for others.
 *
 * @internal
 * @param filterValue - The value from the filter criteria
 * @param itemValue - The value from the item
 * @returns True if values match (strictly or via string coercion)
 */
const looseMatch = (filterValue: unknown, itemValue: unknown): boolean => {
    // Strict equality check first covers most cases (and boolean/null/undefined)
    if (filterValue === itemValue) {
        return true;
    }

    // Handle number/string coercion only
    if (
        (typeof filterValue === 'string' || typeof filterValue === 'number') &&
        (typeof itemValue === 'string' || typeof itemValue === 'number')
    ) {
        return String(filterValue) === String(itemValue);
    }

    return false;
};

/**
 * Whether a row's raw date value falls on the calendar day a `FilterCalendar`
 * selection (a bare `yyyy-mm-dd` string) names.
 *
 * A row value that is itself a bare `yyyy-mm-dd` is compared as a string — an exact
 * day match with no `Date` parsing (and so no timezone conversion) involved. A row
 * value that also carries a time component is instead checked against that calendar
 * day's local boundaries, so a `2026-03-15` filter matches anything from
 * `2026-03-15 00:00:00` up to `2026-03-15 23:59:59.999`.
 *
 * @internal
 */
const matchesDateFilter = (filterValue: unknown, itemValue: unknown): boolean => {
    if (typeof filterValue !== 'string' || !ISO_DATE_ONLY_RE.test(filterValue)) {
        return false;
    }

    if (typeof itemValue === 'string' && ISO_DATE_ONLY_RE.test(itemValue)) {
        return itemValue === filterValue;
    }

    const itemDate = resolveDateValue(itemValue);
    if (!itemDate) {
        return false;
    }

    const year = Number(filterValue.slice(0, 4));
    const month = Number(filterValue.slice(5, 7));
    const day = Number(filterValue.slice(8, 10));
    const dayStart = new Date(year, month - 1, day, 0, 0, 0, 0).getTime();
    const dayEnd = new Date(year, month - 1, day, 23, 59, 59, 999).getTime();
    const itemTime = itemDate.getTime();

    return itemTime >= dayStart && itemTime <= dayEnd;
};

/**
 * Filter items based on filter criteria (e.g. checkbox selections).
 * Supports nested property access.
 *
 * All filter conditions must match (AND logic).
 * A single filter condition matches if the item's value is loosely equal to any of the filter's values (OR logic within a single field).
 * Supports string/number type coercion (e.g. "0" matches 0).
 *
 * A field listed in `dateFilterFields` (see `collectDateFilterFields`) is matched by
 * calendar day instead — `FilterCalendar` stores a single `yyyy-mm-dd` selection, not one
 * of the row's literal values, so exact-value matching would never match a row that also
 * carries a time component.
 *
 * @param items - The array of items to filter
 * @param filterItems - The criteria to filter by
 * @param dateFilterFields - Field keys to match by calendar day rather than exact value
 * @returns The filtered items array
 *
 * @example
 * ```typescript
 * const items = [{ status: 'active' }, { status: 'inactive' }, { status: 'pending' }];
 * const filters = [{ field: 'status', values: ['active', 'pending'] }];
 * const result = filterItemsByFilter(items, filters); // active and pending items
 *
 * // String/number coercion
 * const items2 = [{ status: 0 }, { status: 1 }];
 * const filters2 = [{ field: 'status', values: ['0'] }]; // string filter
 * const result2 = filterItemsByFilter(items2, filters2); // matches {status: 0}
 *
 * // Date-column day matching
 * const items3 = [{ created_at: '2026-03-15T22:30:00Z' }, { created_at: '2026-03-16T01:00:00Z' }];
 * const filters3 = [{ field: 'created_at', values: ['2026-03-15'] }];
 * const result3 = filterItemsByFilter(items3, filters3, new Set(['created_at'])); // first item only
 * ```
 */
export const filterItemsByFilter = (
    items: unknown[],
    filterItems: FilterItem[],
    dateFilterFields?: ReadonlySet<string>
): unknown[] => {
    if (!items || !Array.isArray(items)) {
        return [];
    }

    if (!filterItems || filterItems.length === 0) {
        return items;
    }

    return items.filter(item => {
        // Iterate through all filter criteria
        // Every criteria must match (AND logic among different fields)
        return filterItems.every(criteria => {
            const { field, values } = criteria;

            // Skip empty filters (should ideally be removed from state, but handle safely here)
            if (!values || values.length === 0) {
                return true;
            }

            const itemValue = resolveValue(item, field);

            // Handle null/undefined values in item
            // If the item value is null/undefined, it only matches if null/undefined is explicitly in the filter values
            if (itemValue === null || itemValue === undefined) {
                return values.includes(null) || values.includes(undefined);
            }

            if (dateFilterFields?.has(field)) {
                return values.some(filterValue => matchesDateFilter(filterValue, itemValue));
            }

            // Check if the item's value is in the selected values using loose matching for string/number
            return values.some(filterValue => looseMatch(filterValue, itemValue));
        });
    });
};
