/**
 * For the visibility check, the column key and the `show` field are enough.
 *
 * `key` is optional here on purpose: the helpers also run over cells that come
 * straight from a response, and a cell without a key simply cannot be on the
 * user's hidden list.
 */
type ColumnVisibilityInput = { key?: string; show?: boolean | null };

/**
 * A column is visible when **both** rules allow it:
 *
 * 1. `show` is not explicitly `false` — the response's own decision (opt-out
 *    semantics: missing / `null` / `true` all mean visible). It is not
 *    user-toggleable.
 * 2. its `key` is not on `hiddenKeys` — the columns the user switched off in the
 *    settings panel (`hiddenColumns` in the api-resources store).
 *
 * @param cell - The cell being checked (only `key` and `show` are needed)
 * @param hiddenKeys - Column keys the user hid; omitted means "nothing hidden"
 * @returns `true` if the column should be rendered
 */
export function isCellVisible(
    cell: ColumnVisibilityInput,
    hiddenKeys?: readonly string[]
): boolean {
    if (cell.show === false) return false;
    if (!hiddenKeys || hiddenKeys.length === 0 || !cell.key) return true;
    return !hiddenKeys.includes(cell.key);
}

/**
 * Filters the visible cells — `show: false` and user-hidden columns are excluded.
 * The cell order is preserved, so the header/body/footer/search layers align by
 * position.
 *
 * @param cells - The full cell list
 * @param hiddenKeys - Column keys the user hid; omitted means "nothing hidden"
 * @returns Only the visible cells (in original order)
 */
export function filterVisibleCells<T extends ColumnVisibilityInput>(
    cells: T[],
    hiddenKeys?: readonly string[]
): T[] {
    return cells.filter(cell => isCellVisible(cell, hiddenKeys));
}
