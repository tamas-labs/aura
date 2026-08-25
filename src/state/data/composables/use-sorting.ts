import { ref } from 'vue';
import type { SortDirection, SortItem } from '../../../types/api-response.types';

/**
 * Sorting state slice.
 *
 * Manages the ordered list of active sort fields. Pure state — no dependency on
 * the core store or the API response.
 */
export const useSorting = () => {
    const sortItems = ref<SortItem[]>([]);

    /**
     * Adds a new sort field.
     * If the field is already sorted, it does nothing.
     *
     * @param field - The field key to sort by
     * @param direction - The direction to sort (asc/desc)
     */
    const addSort = (field: string, direction: SortDirection) => {
        if (!field) return;

        const existing = sortItems.value.find(item => item.field === field);
        if (!existing) {
            sortItems.value.push({ field, direction });
        }
    };

    /**
     * Updates the direction of an existing sort field.
     * If the field is not currently sorted, it does nothing.
     *
     * @param field - The field key to update
     * @param direction - The new direction
     */
    const updateSortDirection = (field: string, direction: SortDirection) => {
        const index = sortItems.value.findIndex(item => item.field === field);
        if (index !== -1) {
            sortItems.value[index]!.direction = direction;
        }
    };

    /**
     * Removes a field from the sort list.
     *
     * @param field - The field key to remove
     */
    const removeSort = (field: string) => {
        sortItems.value = sortItems.value.filter(item => item.field !== field);
    };

    /**
     * Clears all active sorts.
     */
    const clearAllSorts = () => {
        sortItems.value = [];
    };

    /**
     * Gets the current sort direction for a field.
     * Returns null if the field is not sorted.
     *
     * @param field - The field to check
     */
    const getSortDirection = (field: string): SortDirection | null => {
        const item = sortItems.value.find(i => i.field === field);
        return item ? item.direction : null;
    };

    return {
        sortItems,
        addSort,
        updateSortDirection,
        removeSort,
        clearAllSorts,
        getSortDirection,
    };
};
