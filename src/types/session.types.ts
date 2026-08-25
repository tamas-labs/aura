import type { SearchItem, SortItem, FilterItem, RowId } from './api-response.types';

/**
 * Session State Interface
 *
 * Defines the structure of the data saved to and loaded from sessionStorage.
 * This state allows restoring the user's previous view configuration (pagination, sorting, searching).
 */
export interface SessionState {
    /** Current page number */
    page: number;
    /** Number of rows per page */
    limit: number;
    /** Active sort rules */
    sortItems: SortItem[];
    /** Active search filters */
    searchItems: SearchItem[];
    /** Active filter items */
    filterItems?: FilterItem[];
    /** Global search term */
    globalSearchTerm: string | null;
    /** Selected row identifiers */
    selectedRows?: RowId[];
}
