import type { HeaderCell } from '../../../types';
import type { ApiResourcesStore } from '../../../types/api-response.types';
import { resolveValue } from '../../../utils';
import { isExactSearchCell, resolveCellField } from './resolve-cell-field';

/**
 * Where a Shift+click on a body cell sends the cell's raw value (`cellClickSearch`).
 *
 * - `column` — the column's own header search input (`searchable: true`).
 * - `global` — the toolbar's global search input (`showHeaderSearch: true`).
 */
export type CellClickSearchTarget =
    | { kind: 'column'; field: string; term: string; exact: true | undefined }
    | { kind: 'global'; term: string };

/** The table-level facts {@link resolveCellClickSearch} needs besides the column. */
export interface CellClickSearchContext {
    /** Whether the toolbar's global search input is shown (`showHeaderSearch`). */
    globalSearchEnabled: boolean;
    /** The response's `header.settings.searchableItems` — the fields global search covers. */
    globalSearchableFields: readonly string[] | null | undefined;
}

/** The store actions a cell click writes through. */
export type CellClickSearchStore = Pick<
    ApiResourcesStore,
    'setGlobalSearch' | 'getSearchTerm' | 'addSearch' | 'updateSearchTerm'
>;

/**
 * Elements whose own click behaviour wins over the search gesture: Shift+click on a
 * link opens a new window, on a button it runs the button's action.
 */
const INTERACTIVE_SELECTOR =
    'a, button, input, select, textarea, label, summary, [role="button"], [contenteditable]';

/**
 * Turns a raw cell value into a search term.
 *
 * Only scalars qualify: an object or array has no single text a search could match,
 * and an empty value would only clear the search instead of setting one.
 *
 * @param value - The raw value read from the row.
 * @returns The trimmed term, or `null` when the value cannot be searched for.
 */
function toSearchTerm(value: unknown): string | null {
    if (typeof value !== 'string' && typeof value !== 'number' && typeof value !== 'boolean') {
        return null;
    }
    const term = String(value).trim();
    return term === '' ? null : term;
}

/**
 * Whether a mouse event is the cell-click search gesture: a plain primary-button
 * Shift+click that did not land on an interactive element.
 *
 * Any other modifier held alongside Shift disqualifies it, so browser and OS shortcuts
 * built on those combinations keep working.
 *
 * @param event - The `mousedown` or `click` event.
 * @returns `true` if the event should trigger a cell-click search.
 */
export function isCellClickSearchGesture(event: MouseEvent): boolean {
    if (event.button !== 0 || !event.shiftKey) return false;
    if (event.ctrlKey || event.metaKey || event.altKey) return false;

    const { target } = event;
    return !(target instanceof Element && target.closest(INTERACTIVE_SELECTOR) !== null);
}

/**
 * Decides where a Shift+clicked cell's raw value goes.
 *
 * The value is always the **raw** row value of the field the column searches on
 * ({@link resolveCellField}), never the formatted text: both the client-side matchers
 * and a backend compare against the raw data, so `1 234,50 Ft` would find nothing where
 * `1234.5` finds the row.
 *
 * Resolution:
 * 1. Selector columns, and multi-field columns without an explicit `reference`, are
 *    ignored — the latter show several values and none of them is the obvious one.
 * 2. A `searchable` column targets its own search input. A `between` column is ignored:
 *    one value cannot fill a min/max pair.
 * 3. Otherwise the global search input, if it is shown and — when the response lists
 *    `searchableItems` — the field is one of them.
 * 4. Otherwise nothing.
 *
 * @param column - The header cell of the clicked column.
 * @param item - The row data.
 * @param context - Global search availability.
 * @returns The search to apply, or `null` when the click should be ignored.
 *
 * @example
 * ```ts
 * resolveCellClickSearch(
 *     { key: 'age', field: 'age', searchable: true, number: true },
 *     { age: 5 },
 *     { globalSearchEnabled: false, globalSearchableFields: undefined }
 * ); // { kind: 'column', field: 'age', term: '5', exact: true }
 * ```
 */
export function resolveCellClickSearch(
    column: HeaderCell,
    item: unknown,
    context: CellClickSearchContext
): CellClickSearchTarget | null {
    if (column.selectable) return null;
    if (column.fields && column.fields.length > 0 && !column.reference) return null;

    const field = resolveCellField(column);
    const term = toSearchTerm(resolveValue(item, field));
    if (term === null) return null;

    if (column.searchable) {
        if (column.between) return null;
        return { kind: 'column', field, term, exact: isExactSearchCell(column) ? true : undefined };
    }

    if (!context.globalSearchEnabled) return null;

    const searchableFields = context.globalSearchableFields;
    if (searchableFields && searchableFields.length > 0 && !searchableFields.includes(field)) {
        return null;
    }

    return { kind: 'global', term };
}

/**
 * Writes a resolved cell-click search into the store.
 *
 * The search inputs follow the store on their own, so this is all a click has to do.
 * A column that is already searched gets its term replaced rather than a second entry.
 * Unlike typing into the global search input, no minimum length applies: the value was
 * picked, not half-typed, so a `5` is a complete term.
 *
 * @param store - The table's API resources store.
 * @param target - The search resolved by {@link resolveCellClickSearch}.
 */
export function applyCellClickSearch(
    store: CellClickSearchStore,
    target: CellClickSearchTarget
): void {
    if (target.kind === 'global') {
        store.setGlobalSearch(target.term);
        return;
    }

    if (store.getSearchTerm(target.field) === null) {
        store.addSearch(target.field, target.term, target.exact);
    } else {
        store.updateSearchTerm(target.field, target.term, target.exact);
    }
}
