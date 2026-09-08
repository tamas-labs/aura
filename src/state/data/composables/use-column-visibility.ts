import { ref } from 'vue';

/**
 * Column visibility state slice.
 *
 * Holds the columns the **user** has hidden from the settings panel, keyed by
 * `HeaderCell.key`. Pure state — no dependency on the core store or the API response.
 *
 * @remarks
 * This is deliberately a *hidden* list rather than a visible one. The set of columns
 * is owned by the response (`header.rows`), so a visible-list would have to be
 * re-seeded on every response and would hide a newly added column until it was. The
 * hidden list only ever names columns the user explicitly switched off; anything the
 * response adds shows up on its own.
 *
 * The response-side `show: false` flag is a separate, stronger rule: it is the
 * server's decision, it is not user-toggleable, and it is applied by
 * `isCellVisible` regardless of this list.
 */
export const useColumnVisibility = () => {
    const hiddenColumns = ref<string[]>([]);

    /**
     * Whether the user has hidden a column.
     *
     * @param key - The `HeaderCell.key` of the column
     * @returns `true` if the column is on the hidden list
     */
    const isColumnHidden = (key: string): boolean => hiddenColumns.value.includes(key);

    /**
     * Hides a column. Hiding an already hidden column is a no-op.
     *
     * @param key - The `HeaderCell.key` of the column
     * @example
     * hideColumn('email');
     */
    const hideColumn = (key: string): void => {
        if (!key || hiddenColumns.value.includes(key)) return;
        hiddenColumns.value = [...hiddenColumns.value, key];
    };

    /**
     * Shows a previously hidden column. Showing a visible column is a no-op.
     *
     * @param key - The `HeaderCell.key` of the column
     * @example
     * showColumn('email');
     */
    const showColumn = (key: string): void => {
        hiddenColumns.value = hiddenColumns.value.filter(item => item !== key);
    };

    /**
     * Flips a column between hidden and visible.
     *
     * @param key - The `HeaderCell.key` of the column
     * @example
     * toggleColumn('email');
     */
    const toggleColumn = (key: string): void => {
        if (isColumnHidden(key)) {
            showColumn(key);
            return;
        }
        hideColumn(key);
    };

    /**
     * Replaces the whole hidden list. Empty keys are dropped and duplicates collapsed,
     * so a restored session cannot seed the list with unusable entries.
     *
     * @param keys - The column keys to hide
     * @example
     * setHiddenColumns(['email', 'createdAt']);
     */
    const setHiddenColumns = (keys: string[]): void => {
        hiddenColumns.value = [...new Set((keys || []).filter(Boolean))];
    };

    /**
     * Clears the hidden list — every column the response allows becomes visible again.
     *
     * @example
     * showAllColumns();
     */
    const showAllColumns = (): void => {
        hiddenColumns.value = [];
    };

    return {
        hiddenColumns,
        isColumnHidden,
        hideColumn,
        showColumn,
        toggleColumn,
        setHiddenColumns,
        showAllColumns,
    };
};
