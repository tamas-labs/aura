import type { FilterItem, Header, SearchItem } from '../../../types/api-response.types';
import { resolveCellField } from '../../../utils/resolve-cell-field.util';

/** What removing a badge has to call on the store. */
export type ActiveFilterKind = 'global' | 'search' | 'filter';

/** One removable chip in the active-filter list. */
export interface ActiveFilterBadge {
    /** Unique within one list — used as the render key and the test id suffix. */
    id: string;
    /** Which store action removes it. */
    kind: ActiveFilterKind;
    /** The field the filter targets. Empty for the global search. */
    field: string;
    /** Column label, falling back to the raw field key when the column is unknown. */
    label: string;
    /** The human-readable filter value. */
    value: string;
}

/** The inputs of `buildActiveFilterBadges`, grouped into one options object. */
export interface ActiveFilterSources {
    /** The validated response header — the source of the column labels. */
    header: Header | null;
    /** Per-field text and range searches. */
    searchItems: readonly SearchItem[];
    /** Per-field value filters. */
    filterItems: readonly FilterItem[];
    /** The cross-field search term, or `null`. */
    globalSearchTerm: string | null;
    /** The label the global-search badge is titled with (`labels.search`). */
    globalSearchLabel: string;
}

/**
 * Field → column label map built from every header row.
 *
 * A `Map` rather than a plain object on purpose: the keys come from the response, and
 * an object lookup would walk the prototype chain (see `safe-object.util.ts`). Later
 * rows win, because in a multi-row header the last row holds the data columns.
 */
function buildLabelMap(header: Header | null): Map<string, string> {
    const labels = new Map<string, string>();

    for (const row of header?.rows ?? []) {
        for (const cell of row.cells ?? []) {
            // `key` is required on every header cell, so the chain always resolves.
            labels.set(resolveCellField(cell), String(cell.label ?? cell.content ?? cell.key));
        }
    }

    return labels;
}

/**
 * Renders a range (`between`) search as text: `10 – 20`, `≥ 10` or `≤ 20`.
 * Returns `null` when neither bound is set — such an item is not a range search.
 */
function formatRange(item: SearchItem): string | null {
    const hasMin = item.min !== null && item.min !== undefined;
    const hasMax = item.max !== null && item.max !== undefined;

    if (hasMin && hasMax) return `${item.min} – ${item.max}`;
    if (hasMin) return `≥ ${item.min}`;
    if (hasMax) return `≤ ${item.max}`;
    return null;
}

/**
 * Collects every active filter into one flat, removable badge list.
 *
 * The order is fixed — global search, column searches, column filters — so the badges
 * do not reshuffle as the user edits them.
 *
 * @param sources - The response header and the active query slices
 * @returns The badges to render, empty when nothing is filtered
 *
 * @example
 * ```ts
 * buildActiveFilterBadges({
 *     header,
 *     searchItems: [{ field: 'name', term: 'Jane' }],
 *     filterItems: [],
 *     globalSearchTerm: null,
 *     globalSearchLabel: 'Search',
 * });
 * // → [{ id: 'search:name', kind: 'search', field: 'name', label: 'Name', value: 'Jane' }]
 * ```
 */
export function buildActiveFilterBadges(sources: ActiveFilterSources): ActiveFilterBadge[] {
    const labels = buildLabelMap(sources.header);
    const labelOf = (field: string): string => labels.get(field) ?? field;
    const badges: ActiveFilterBadge[] = [];

    if (sources.globalSearchTerm) {
        badges.push({
            id: 'global',
            kind: 'global',
            field: '',
            label: sources.globalSearchLabel,
            value: sources.globalSearchTerm,
        });
    }

    for (const item of sources.searchItems) {
        const value = item.term ?? formatRange(item);
        if (!value) continue;
        badges.push({
            id: `search:${item.field}`,
            kind: 'search',
            field: item.field,
            label: labelOf(item.field),
            value,
        });
    }

    for (const item of sources.filterItems) {
        if (!item.values || item.values.length === 0) continue;
        badges.push({
            id: `filter:${item.field}`,
            kind: 'filter',
            field: item.field,
            label: labelOf(item.field),
            value: item.values.map(entry => String(entry)).join(', '),
        });
    }

    return badges;
}
