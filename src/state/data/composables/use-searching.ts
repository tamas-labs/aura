import { ref } from 'vue';
import type { RangeBound, SearchItem, SearchRange } from '../../../types/api-response.types';

/**
 * Searching state slice.
 *
 * Manages per-field text searches and range (`between`) searches. Text and range
 * searches are mutually exclusive per field. Pure state — no dependency on the
 * core store or the API response.
 */
export const useSearching = () => {
    const searchItems = ref<SearchItem[]>([]);

    /**
     * Removes a field from the search list.
     *
     * @param field - The field key to remove
     */
    const removeSearch = (field: string) => {
        searchItems.value = searchItems.value.filter(item => item.field !== field);
    };

    /**
     * Adds a new search field.
     * If the field is already searched, it does nothing.
     *
     * @param field - The field key to search in
     * @param term - The search term
     * @param exact - Whether to search for exact match
     *
     * @example
     * ```typescript
     * store.addSearch('name', 'John');
     * store.addSearch('email', 'test@example.com', true);
     * ```
     */
    const addSearch = (field: string, term: string, exact?: boolean) => {
        if (!field) return;

        if (term === '') {
            removeSearch(field);
            return;
        }

        const existing = searchItems.value.find(item => item.field === field);
        if (!existing) {
            const searchItem: SearchItem = { field, term };
            if (exact !== undefined) {
                searchItem.exact = exact;
            }
            searchItems.value.push(searchItem);
        }
    };

    /**
     * Updates the term of an existing search field.
     * If the field is not currently searched, it does nothing.
     *
     * @param field - The field key to update
     * @param term - The new search term
     * @param exact - Whether to search for exact match
     *
     * @example
     * ```typescript
     * store.updateSearchTerm('name', 'Jane');
     * store.updateSearchTerm('email', 'new@example.com', false);
     * ```
     */
    const updateSearchTerm = (field: string, term: string, exact?: boolean) => {
        if (term === '') {
            removeSearch(field);
            return;
        }

        const index = searchItems.value.findIndex(item => item.field === field);
        if (index !== -1) {
            searchItems.value[index]!.term = term;
            if (exact !== undefined) {
                searchItems.value[index]!.exact = exact;
            }
        }
    };

    /**
     * Clears all active searching.
     */
    const clearAllSearches = () => {
        searchItems.value = [];
    };

    /**
     * Gets the current search term for a field.
     * Returns null if the field is not searched.
     *
     * @param field - The field to check
     */
    const getSearchTerm = (field: string): string | null => {
        const item = searchItems.value.find(i => i.field === field);
        return item?.term ?? null;
    };

    /**
     * Sets (or updates) a range (`between`) search for a field.
     * Empty string bounds are treated as "no bound". If both bounds resolve
     * to null, the search item is removed.
     *
     * @param field - The field key to range-search in
     * @param min - Lower bound (null/empty = open)
     * @param max - Upper bound (null/empty = open)
     *
     * @example
     * ```typescript
     * store.setBetweenSearch('age', 18, 65);
     * store.setBetweenSearch('createdAt', '2024-01-01', null);
     * ```
     */
    const setBetweenSearch = (field: string, min: RangeBound, max: RangeBound) => {
        if (!field) return;

        const normalizedMin = min === '' ? null : min;
        const normalizedMax = max === '' ? null : max;

        if (normalizedMin === null && normalizedMax === null) {
            removeSearch(field);
            return;
        }

        const index = searchItems.value.findIndex(item => item.field === field);
        if (index === -1) {
            searchItems.value.push({ field, min: normalizedMin, max: normalizedMax });
            return;
        }

        const item = searchItems.value[index]!;
        item.min = normalizedMin;
        item.max = normalizedMax;
        // The `between` search and text search are mutually exclusive.
        delete item.term;
        delete item.exact;
    };

    /**
     * Gets the current range (`between`) bounds for a field.
     * Returns null if the field has no range search.
     *
     * @param field - The field to check
     */
    const getBetweenRange = (field: string): SearchRange | null => {
        const item = searchItems.value.find(i => i.field === field);
        if (!item || (item.min === undefined && item.max === undefined)) {
            return null;
        }
        return { min: item.min ?? null, max: item.max ?? null };
    };

    return {
        searchItems,
        addSearch,
        updateSearchTerm,
        removeSearch,
        clearAllSearches,
        getSearchTerm,
        setBetweenSearch,
        getBetweenRange,
    };
};
