import type { FilterItem } from '../types/api-response.types';
import { resolveValue } from './resolve-value.util';

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
 * Filter items based on filter criteria (e.g. checkbox selections).
 * Supports nested property access.
 *
 * All filter conditions must match (AND logic).
 * A single filter condition matches if the item's value is loosely equal to any of the filter's values (OR logic within a single field).
 * Supports string/number type coercion (e.g. "0" matches 0).
 *
 * @param items - The array of items to filter
 * @param filterItems - The criteria to filter by
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
 * ```
 */
export const filterItemsByFilter = (items: unknown[], filterItems: FilterItem[]): unknown[] => {
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

            // Check if the item's value is in the selected values using loose matching for string/number
            return values.some(filterValue => looseMatch(filterValue, itemValue));
        });
    });
};
