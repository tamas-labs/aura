/**
 * API Response + Store Types
 */

import type { RowId, SortDirection, RangeBound } from './primitives.types';
import type { FilterItem, QueryParams, SearchItem, SearchRange, SortItem } from './query.types';
import type { Body, Footer, Header } from './structure.types';

/**
 * Laravel pagination metadata structure.
 */
export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

/**
 * Laravel pagination links structure.
 */
export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

/**
 * Main API Response Interface.
 *
 * Represents the complete structure of the JSON response expected from the API.
 *
 * @example
 * ```typescript
 * const response: ApiResponse = {
 *   header: { rows: [...] },
 *   items: [...],
 *   meta: { ... },
 *   links: { ... }
 * };
 * ```
 */
export interface ApiResponse {
    /** Table header configuration. */
    header?: Header;
    /** Table body configuration. */
    body?: Body;
    /** Table footer configuration. */
    footer?: Footer;
    /** Data items ARRAY. */
    items?: unknown[];
    /** Pagination metadata (Laravel). */
    meta?: PaginationMeta;
    /** Pagination links (Laravel). */
    links?: PaginationLinks;
}

/**
 * Api Resources Store interface.
 */
export interface ApiResourcesStore {
    readonly queryParams: QueryParams;
    /**
     * Whether a `fetchData` request is in flight.
     *
     * Stays `true` while any request is running — with overlapping requests it
     * only returns to `false` once the last one settles — and is released on
     * every outcome, including a failure. Bind a host-side loading indicator to
     * this, or let the built-in overlay handle it (`showLoadingOverlay`).
     */
    readonly loading: boolean;
    readonly sortItems: SortItem[];
    readonly searchItems: SearchItem[];
    readonly filterItems: FilterItem[];
    readonly globalSearchTerm: string | null;
    readonly selectedRows: RowId[];
    /**
     * Column keys the user hid from the settings panel.
     *
     * Presentation-only state: it never reaches `queryParams`, so switching a column
     * off re-renders the table without a request. It is persisted with the rest of the
     * session state. The response-side `show: false` flag is stronger and independent —
     * those columns are never rendered and never appear in this list.
     */
    readonly hiddenColumns: string[];
    readonly header: Header | null;
    readonly body: Body | null;
    readonly footer: Footer | null;
    readonly displayFooter: Header | Footer | null;
    readonly items: unknown[] | null;
    readonly displayItems: unknown[] | null;
    readonly meta: PaginationMeta | null;
    readonly displayMeta: PaginationMeta | null;
    readonly links: PaginationLinks | null;
    addSort: (field: string, direction: SortDirection) => void;
    updateSortDirection: (field: string, direction: SortDirection) => void;
    removeSort: (field: string) => void;
    clearAllSorts: () => void;
    getSortDirection: (field: string) => SortDirection | null;
    addSearch: (field: string, term: string, exact?: boolean) => void;
    updateSearchTerm: (field: string, term: string, exact?: boolean) => void;
    removeSearch: (field: string) => void;
    clearAllSearches: () => void;
    getSearchTerm: (field: string) => string | null;
    setBetweenSearch: (field: string, min: RangeBound, max: RangeBound) => void;
    getBetweenRange: (field: string) => SearchRange | null;
    addFilter: (field: string, values: unknown[]) => void;
    updateFilterValues: (field: string, values: unknown[]) => void;
    removeFilter: (field: string) => void;
    clearAllFilters: () => void;
    getFilterValues: (field: string) => unknown[] | null;
    setGlobalSearch: (term: string) => void;
    clearGlobalSearch: () => void;
    isRowSelected: (id: RowId) => boolean;
    toggleRowSelection: (id: RowId) => void;
    selectRows: (ids: RowId[]) => void;
    deselectRows: (ids: RowId[]) => void;
    clearSelection: () => void;
    isColumnHidden: (key: string) => boolean;
    hideColumn: (key: string) => void;
    showColumn: (key: string) => void;
    toggleColumn: (key: string) => void;
    setHiddenColumns: (keys: string[]) => void;
    showAllColumns: () => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    fetchData: () => Promise<void>;
    processResponse: (response: ApiResponse) => Promise<void>;
    clearResponse: () => void;
    autoRefetch: boolean;
    readonly $id: string;
    $dispose: () => void;
}
