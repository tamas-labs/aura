import { ref } from 'vue';
import type { FilterItem } from '../../../types/api-response.types';

/**
 * Filtering state slice.
 *
 * Manages per-field value filters (dropdown/multi-select). Pure state — no
 * dependency on the core store or the API response.
 */
export const useFiltering = () => {
    const filterItems = ref<FilterItem[]>([]);

    /**
     * Removes a field from the filter list.
     *
     * @param field - The field key to remove
     * @example
     * removeFilter('status');
     */
    const removeFilter = (field: string) => {
        filterItems.value = filterItems.value.filter(item => item.field !== field);
    };

    /**
     * Adds a new filter.
     * If the field is already filtered, it does nothing.
     *
     * @param field - The field key to filter by
     * @param values - The values to filter by
     * @example
     * addFilter('status', ['active', 'pending']);
     */
    const addFilter = (field: string, values: unknown[]) => {
        if (!field) return;

        if (!values || values.length === 0) {
            removeFilter(field);
            return;
        }

        const existing = filterItems.value.find(item => item.field === field);
        if (!existing) {
            filterItems.value.push({ field, values });
        }
    };

    /**
     * Updates the values of an existing filter.
     * If the field is not currently filtered, it does nothing.
     *
     * @param field - The field key to update
     * @param values - The new values
     * @example
     * updateFilterValues('status', ['inactive']);
     */
    const updateFilterValues = (field: string, values: unknown[]) => {
        if (!values || values.length === 0) {
            removeFilter(field);
            return;
        }

        const index = filterItems.value.findIndex(item => item.field === field);
        if (index !== -1) {
            filterItems.value[index]!.values = values;
        }
    };

    /**
     * Clears all active filters.
     *
     * @example
     * clearAllFilters();
     */
    const clearAllFilters = () => {
        filterItems.value = [];
    };

    /**
     * Gets the current filter values for a field.
     * Returns null if the field is not filtered.
     *
     * @param field - The field to check
     * @returns Array of values or null
     * @example
     * const values = getFilterValues('status'); // ['active', 'pending'] or null
     */
    const getFilterValues = (field: string): unknown[] | null => {
        const item = filterItems.value.find(i => i.field === field);
        return item ? item.values : null;
    };

    return {
        filterItems,
        addFilter,
        updateFilterValues,
        removeFilter,
        clearAllFilters,
        getFilterValues,
    };
};
