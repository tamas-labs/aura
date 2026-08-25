import { ref } from 'vue';
import type { RowId } from '../../../types/api-response.types';

/**
 * Row selection state slice.
 *
 * Manages the set of selected row identifiers. Deliberately NOT part of
 * `queryParams`: selecting a row must not trigger an auto-refetch. The current
 * selection is injected into the request payload at fetch time (see
 * `use-response-data`'s `fetchData`).
 */
export const useSelection = () => {
    const selectedRows = ref<RowId[]>([]);

    /**
     * Checks whether a row (by its identifier) is currently selected.
     *
     * @param id - The row identifier.
     */
    const isRowSelected = (id: RowId): boolean => selectedRows.value.includes(id);

    /**
     * Toggles the selection state of a single row.
     *
     * @param id - The row identifier.
     */
    const toggleRowSelection = (id: RowId) => {
        if (selectedRows.value.includes(id)) {
            selectedRows.value = selectedRows.value.filter(item => item !== id);
        } else {
            selectedRows.value.push(id);
        }
    };

    /**
     * Adds the given row identifiers to the selection (union, no duplicates).
     *
     * @param ids - The row identifiers to select.
     */
    const selectRows = (ids: RowId[]) => {
        const merged = new Set<RowId>(selectedRows.value);
        ids.forEach(id => merged.add(id));
        selectedRows.value = Array.from(merged);
    };

    /**
     * Removes the given row identifiers from the selection.
     *
     * @param ids - The row identifiers to deselect.
     */
    const deselectRows = (ids: RowId[]) => {
        const removal = new Set<RowId>(ids);
        selectedRows.value = selectedRows.value.filter(id => !removal.has(id));
    };

    /**
     * Clears the entire row selection.
     */
    const clearSelection = () => {
        selectedRows.value = [];
    };

    return {
        selectedRows,
        isRowSelected,
        toggleRowSelection,
        selectRows,
        deselectRows,
        clearSelection,
    };
};
