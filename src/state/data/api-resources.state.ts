import { defineStore } from 'pinia';
import { watch, ref, computed, readonly, unref } from 'vue';
import type { CoreStore } from '../../types';
import { generateSessionKey, loadFromSessionStorage } from '../../utils';
import { validateSessionState } from '../../validators/schemas/session';
import type {
    ApiResourcesStore,
    QueryParams,
    SortDirection,
    SortItem,
    SearchItem,
    FilterItem,
} from '../../types/api-response.types';
import { usePagination } from './composables/use-pagination';
import { useSorting } from './composables/use-sorting';
import { useSearching } from './composables/use-searching';
import { useFiltering } from './composables/use-filtering';
import { useGlobalSearch } from './composables/use-global-search';
import { useSelection } from './composables/use-selection';
import { useColumnVisibility } from './composables/use-column-visibility';
import { useResponseData } from './composables/use-response-data';
import { useSessionPersistence } from './composables/use-session-persistence';

/**
 * Re-exported for convenience: consumers of the store usually need these types too,
 * and importing them from the store keeps them from having to know the
 * `types/api-response.types` path.
 */
export type { ApiResourcesStore, QueryParams, SortDirection, SortItem, SearchItem, FilterItem };

/**
 * API Resources Store Factory
 *
 * Unified store for managing API response data including header, body, footer, items,
 * pagination metadata and links. Replaces the previous multi-level store hierarchy.
 *
 * Composition root: the store is assembled from focused sub-composables under
 * `./composables/` — the query slices (pagination, sorting, searching, filtering,
 * global search, selection) are pure state, while `use-response-data` owns the
 * validated response and the network layer. The orchestrator wires the cross-cutting
 * `queryParams` computed, session save/restore, and the auto-refetch watchers.
 *
 * @param storeId - Unique identifier for this store instance
 * @param core - Core store instance providing config and error handling
 * @returns Pinia store instance with API resource management capabilities
 *
 * @example
 * ```typescript
 * const apiStore = useApiResourcesStore('my-table', coreStore);
 * await apiStore.fetchData();
 * console.log(apiStore.header?.rows);
 * ```
 */
export const useApiResourcesStore = (storeId: string, core: CoreStore): ApiResourcesStore => {
    const store = defineStore(`${storeId}-api-resources`, () => {
        // --- Query state slices (pure state) ---
        const pagination = usePagination(core.config.rowsNumber || 10);
        const sorting = useSorting();
        const searching = useSearching();
        const filtering = useFiltering();
        const globalSearch = useGlobalSearch();
        const selection = useSelection();
        const columnVisibility = useColumnVisibility();

        const { page, limit } = pagination;
        const { sortItems } = sorting;
        const { searchItems } = searching;
        const { filterItems } = filtering;
        const { globalSearchTerm } = globalSearch;
        const { selectedRows } = selection;
        const { hiddenColumns } = columnVisibility;

        // --- Cross-cutting: composed query params ---
        const queryParams = computed(() => {
            const params: Record<string, unknown> = {
                page: page.value,
                paginate: limit.value,
            };

            // Add sort parameters if we have active sorts
            if (sortItems.value.length > 0) {
                params.sortable = sortItems.value;
            }

            // Add search parameters if we have active searches
            if (searchItems.value.length > 0) {
                params.searchable = searchItems.value;
            }

            // Add filter parameters if we have active filters
            if (filterItems.value.length > 0) {
                params.filterable = filterItems.value;
            }

            // Add global search parameter if active
            if (globalSearchTerm.value !== null) {
                params.globalSearch = globalSearchTerm.value;
            }

            // Future: Add dynamic query params (filters, search)
            return params;
        });

        // --- Response data slice (validated response + network layer) ---
        const responseData = useResponseData({
            core,
            queryParams,
            page,
            limit,
            sortItems,
            searchItems,
            filterItems,
            globalSearchTerm,
            selectedRows,
        });
        const { fetchData } = responseData;

        // Auto-refetch on queryParams change
        const autoRefetch = ref(true);

        // Flag to prevent auto-refetch during session restoration
        const isRestoring = ref(false);

        /**
         * Restores the state from sessionStorage if session is enabled.
         */
        const restoreSession = () => {
            // Check if session is disabled (safe unwrap with unref)
            if (unref(core.config.disableSession)) {
                return;
            }

            const key = generateSessionKey(storeId, unref(core.config.sessionKey));
            const rawData = loadFromSessionStorage(key);

            if (!rawData) {
                return;
            }

            // Validate loaded data
            const sessionState = validateSessionState(rawData, core.errorStore.$id);

            if (sessionState) {
                // Set flag to prevent fetch trigger
                isRestoring.value = true;
                const originalAutoRefetch = autoRefetch.value;
                autoRefetch.value = false;

                try {
                    // Restore values
                    page.value = sessionState.page;
                    limit.value = sessionState.limit;
                    sortItems.value = sessionState.sortItems;
                    searchItems.value = sessionState.searchItems;
                    filterItems.value = sessionState.filterItems || [];
                    globalSearchTerm.value = sessionState.globalSearchTerm;
                    selectedRows.value = sessionState.selectedRows || [];
                    // Purely presentational, so it stays out of `queryParams` — a restored
                    // hidden list must not look like a query change.
                    columnVisibility.setHiddenColumns(sessionState.hiddenColumns || []);
                } finally {
                    // Reset flags
                    autoRefetch.value = originalAutoRefetch;
                    isRestoring.value = false;
                }
            }
        };

        // Attempt to restore session immediately
        restoreSession();

        // Reset page to 1 when search terms change (only for client-side)
        watch(
            [searchItems, filterItems],
            () => {
                // Don't reset page during session restore
                if (isRestoring.value) {
                    return;
                }
                if (core.config.externalPaginator === false) {
                    page.value = 1;
                }
            },
            { deep: true }
        );

        // Reset page to 1 when global search term changes (only for client-side)
        watch(globalSearchTerm, () => {
            // Don't reset page during session restore
            if (isRestoring.value) {
                return;
            }
            if (core.config.externalPaginator === false) {
                page.value = 1;
            }
        });

        /**
         * Serialized form of the query as of the watcher's last run.
         *
         * The callback cannot compare its own `newParams` / `oldParams` arguments.
         * `queryParams` puts the *live* `sortItems` / `searchItems` / `filterItems`
         * arrays into the object it returns, so an in-place edit — every mutator
         * that keeps the array length: `updateSortDirection`, `updateSearchTerm`,
         * `updateFilterValues`, `setBetweenSearch` — changes a nested property
         * without invalidating the computed. The deep watcher still fires, but the
         * getter hands back the same cached object twice, so `newParams` and
         * `oldParams` are one and the same reference — and an object never differs
         * from itself. Until this snapshot existed, those edits silently never
         * reached the server: a sort flipped asc→desc, a header search refined past
         * its first keystroke, or a filter's values swapped all kept displaying the
         * previous response.
         *
         * Taken after `restoreSession()`, so a restored session counts as already
         * requested rather than as a change.
         */
        let lastSeenQuery = JSON.stringify(queryParams.value);

        watch(
            queryParams,
            () => {
                // Read through the computed instead of the callback arguments — see
                // `lastSeenQuery` for why those cannot be trusted here. The snapshot
                // advances even when the query is not requested, so turning
                // `autoRefetch` back on does not replay a change made while it was off.
                const currentQuery = JSON.stringify(queryParams.value);
                const queryChanged = currentQuery !== lastSeenQuery;
                lastSeenQuery = currentQuery;

                if (!autoRefetch.value) {
                    return;
                }

                // Client-side mode answers every query change from the `items` it
                // already holds — `displayItems` re-slices and `displayMeta`
                // recounts as soon as the refs move. Firing a request here would
                // spend a round-trip on a response the store discards for its own
                // locally computed one, and raise `loading` (and with it the
                // built-in indicator) for a page change that is synchronous.
                // Only the initial mount and an explicit refresh fetch in this mode.
                if (core.config.externalPaginator === false) {
                    return;
                }

                if (queryChanged) {
                    fetchData();
                }
            },
            // `deep: true` is load-bearing rather than defensive, which is what the
            // 2026-08-25 measurement of it established: without the traversal the
            // watcher does not fire at all for the in-place edits above, because the
            // computed's own dependencies — the refs and the array lengths — are
            // untouched by them. Its cost is one callback run per such edit, which is
            // exactly the run that turns the edit into a request.
            { deep: true }
        );

        // Save state to session storage on changes (debounced — see the composable)
        useSessionPersistence({
            storeId,
            core,
            isRestoring,
            sources: {
                page,
                limit,
                sortItems,
                searchItems,
                filterItems,
                globalSearchTerm,
                selectedRows,
                hiddenColumns,
            },
        });

        return {
            queryParams: readonly(queryParams),
            loading: responseData.loading,
            header: readonly(responseData.header),
            body: readonly(responseData.body),
            footer: readonly(responseData.footer),
            items: readonly(responseData.items),
            displayItems: responseData.displayItems,
            meta: readonly(responseData.meta),
            displayMeta: responseData.displayMeta,
            links: readonly(responseData.links),
            displayFooter: responseData.displayFooter,
            fetchData: responseData.fetchData,
            processResponse: responseData.processResponse,
            clearResponse: responseData.clearResponse,
            autoRefetch,
            setPage: pagination.setPage,
            setLimit: pagination.setLimit,
            // Sorting exports
            sortItems: readonly(sortItems),
            addSort: sorting.addSort,
            updateSortDirection: sorting.updateSortDirection,
            removeSort: sorting.removeSort,
            clearAllSorts: sorting.clearAllSorts,
            getSortDirection: sorting.getSortDirection,
            // Search exports
            searchItems: readonly(searchItems),
            addSearch: searching.addSearch,
            updateSearchTerm: searching.updateSearchTerm,
            removeSearch: searching.removeSearch,
            clearAllSearches: searching.clearAllSearches,
            getSearchTerm: searching.getSearchTerm,
            setBetweenSearch: searching.setBetweenSearch,
            getBetweenRange: searching.getBetweenRange,
            // Filter exports
            filterItems: readonly(filterItems),
            addFilter: filtering.addFilter,
            updateFilterValues: filtering.updateFilterValues,
            removeFilter: filtering.removeFilter,
            clearAllFilters: filtering.clearAllFilters,
            getFilterValues: filtering.getFilterValues,
            // Global search exports
            globalSearchTerm: readonly(globalSearchTerm),
            setGlobalSearch: globalSearch.setGlobalSearch,
            clearGlobalSearch: globalSearch.clearGlobalSearch,
            // Column visibility exports
            hiddenColumns: readonly(hiddenColumns),
            isColumnHidden: columnVisibility.isColumnHidden,
            hideColumn: columnVisibility.hideColumn,
            showColumn: columnVisibility.showColumn,
            toggleColumn: columnVisibility.toggleColumn,
            setHiddenColumns: columnVisibility.setHiddenColumns,
            showAllColumns: columnVisibility.showAllColumns,
            // Row selection exports
            selectedRows: readonly(selectedRows),
            isRowSelected: selection.isRowSelected,
            toggleRowSelection: selection.toggleRowSelection,
            selectRows: selection.selectRows,
            deselectRows: selection.deselectRows,
            clearSelection: selection.clearSelection,
        };
    })();

    return store as unknown as ApiResourcesStore;
};
