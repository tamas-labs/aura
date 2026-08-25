import { ref } from 'vue';

/**
 * Global search state slice.
 *
 * Manages a single global (cross-field) search term. Pure state — no dependency
 * on the core store or the API response.
 */
export const useGlobalSearch = () => {
    const globalSearchTerm = ref<string | null>(null);

    /**
     * Clears global search term.
     */
    const clearGlobalSearch = () => {
        globalSearchTerm.value = null;
    };

    /**
     * Sets the global search term.
     *
     * @param term - The search term
     */
    const setGlobalSearch = (term: string) => {
        const trimmedTerm = term.trim();
        if (trimmedTerm === '') {
            clearGlobalSearch();
            return;
        }
        globalSearchTerm.value = trimmedTerm;
    };

    return { globalSearchTerm, setGlobalSearch, clearGlobalSearch };
};
