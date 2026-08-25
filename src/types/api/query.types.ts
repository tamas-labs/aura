/**
 * Query / Request Types
 */

import type { SortDirection, RangeBound } from './primitives.types';

/**
 * Single sort item definition.
 */
export interface SortItem {
    /** The field key to sort by */
    field: string;
    /** The direction of sorting */
    direction: SortDirection;
}

/**
 * The resolved lower/upper bounds of a range (`between`) search.
 */
export interface SearchRange {
    min: RangeBound;
    max: RangeBound;
}

/**
 * Single search item definition.
 */
export interface SearchItem {
    /** The field key to search in */
    field: string;
    /** The search term. Omitted for range (`between`) searches. */
    term?: string;
    /** Whether to search for exact match */
    exact?: boolean;
    /** Lower bound for a range (`between`) search. */
    min?: RangeBound;
    /** Upper bound for a range (`between`) search. */
    max?: RangeBound;
}

/**
 * Single filter item definition.
 */
export interface FilterItem {
    /** The field key to filter by */
    field: string;
    /** The selected values to filter by */
    values: unknown[];
}

/**
 * Filter element definition for dropdown filtering.
 */
export interface FilterElement {
    /** The value to filter by */
    value: string | number | boolean | null;
    /** The label to display */
    label: string | number | boolean | null;
}

/**
 * Query parameters for API requests.
 */
export interface QueryParams {
    readonly page: number;
    readonly paginate: number;
    readonly sortable?: SortItem[];
    readonly searchable?: SearchItem[];
    readonly filterable?: FilterItem[];
    readonly globalSearch?: string;
}
