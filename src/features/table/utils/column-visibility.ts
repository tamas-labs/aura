/** For the visibility check, the `show` field is enough. */
type ColumnVisibilityInput = { show?: boolean | null };

/**
 * A column is visible if `show` is **not** explicitly set to `false`.
 * A missing / `null` / `true` value all mean a visible column (opt-out semantics).
 *
 * @param cell - The cell being checked (only the `show` field is needed)
 * @returns `true` if the column should be rendered
 */
export function isCellVisible(cell: ColumnVisibilityInput): boolean {
    return cell.show !== false;
}

/**
 * Filters the visible cells — `show: false` columns are excluded. The cell order
 * is preserved, so the header/body/footer/search layers align by position.
 *
 * @param cells - The full cell list
 * @returns Only the visible cells (in original order)
 */
export function filterVisibleCells<T extends ColumnVisibilityInput>(cells: T[]): T[] {
    return cells.filter(isCellVisible);
}
