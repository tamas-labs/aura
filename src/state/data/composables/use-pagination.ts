import { ref } from 'vue';

/**
 * Pagination state slice.
 *
 * Holds the current page and page size (`limit`). Setting the limit resets the
 * page to 1 (a page-size change invalidates the current offset).
 *
 * @param initialLimit - Initial page size (from `config.rowsNumber`).
 */
export const usePagination = (initialLimit: number) => {
    const page = ref(1);
    const limit = ref(initialLimit);

    const setPage = (newPage: number) => {
        page.value = newPage;
    };

    const setLimit = (newLimit: number) => {
        limit.value = newLimit;
        page.value = 1;
    };

    return { page, limit, setPage, setLimit };
};
