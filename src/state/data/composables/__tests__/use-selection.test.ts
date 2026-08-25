import { describe, it, expect } from 'vitest';
import { useSelection } from '../use-selection';

describe('useSelection', () => {
    it('should start with an empty selection', () => {
        const { selectedRows } = useSelection();

        expect(selectedRows.value).toEqual([]);
    });

    describe('toggleRowSelection', () => {
        it('should select an unselected row', () => {
            const { selectedRows, toggleRowSelection, isRowSelected } = useSelection();

            toggleRowSelection(1);

            expect(selectedRows.value).toEqual([1]);
            expect(isRowSelected(1)).toBe(true);
        });

        it('should deselect an already selected row', () => {
            const { selectedRows, toggleRowSelection, isRowSelected } = useSelection();

            toggleRowSelection(1);
            toggleRowSelection(1);

            expect(selectedRows.value).toEqual([]);
            expect(isRowSelected(1)).toBe(false);
        });

        it('should keep the other rows when deselecting one', () => {
            const { selectedRows, toggleRowSelection } = useSelection();

            toggleRowSelection(1);
            toggleRowSelection(2);
            toggleRowSelection(3);
            toggleRowSelection(2);

            expect(selectedRows.value).toEqual([1, 3]);
        });

        // Row ids come straight from the response, so both numeric and string ids
        // must survive the round trip — and they must not be conflated.
        it('should treat a string id as distinct from the numeric one', () => {
            const { selectedRows, toggleRowSelection, isRowSelected } = useSelection();

            toggleRowSelection(1);
            toggleRowSelection('1');

            expect(selectedRows.value).toEqual([1, '1']);
            expect(isRowSelected('1')).toBe(true);
        });
    });

    describe('selectRows', () => {
        it('should add every id', () => {
            const { selectedRows, selectRows } = useSelection();

            selectRows([1, 2, 3]);

            expect(selectedRows.value).toEqual([1, 2, 3]);
        });

        it('should merge without duplicating the existing ids', () => {
            const { selectedRows, selectRows } = useSelection();

            selectRows([1, 2]);
            selectRows([2, 3]);

            expect(selectedRows.value).toEqual([1, 2, 3]);
        });

        it('should drop duplicates inside a single call', () => {
            const { selectedRows, selectRows } = useSelection();

            selectRows([1, 1, 2, 2]);

            expect(selectedRows.value).toEqual([1, 2]);
        });

        it('should leave the selection untouched for an empty list', () => {
            const { selectedRows, selectRows } = useSelection();

            selectRows([1, 2]);
            selectRows([]);

            expect(selectedRows.value).toEqual([1, 2]);
        });
    });

    describe('deselectRows', () => {
        it('should remove the given ids only', () => {
            const { selectedRows, selectRows, deselectRows } = useSelection();

            selectRows([1, 2, 3, 4]);
            deselectRows([2, 4]);

            expect(selectedRows.value).toEqual([1, 3]);
        });

        it('should ignore ids that are not selected', () => {
            const { selectedRows, selectRows, deselectRows } = useSelection();

            selectRows([1, 2]);
            deselectRows([9]);

            expect(selectedRows.value).toEqual([1, 2]);
        });

        it('should be a no-op for an empty list', () => {
            const { selectedRows, selectRows, deselectRows } = useSelection();

            selectRows([1, 2]);
            deselectRows([]);

            expect(selectedRows.value).toEqual([1, 2]);
        });
    });

    describe('clearSelection', () => {
        it('should drop every selected row', () => {
            const { selectedRows, selectRows, clearSelection } = useSelection();

            selectRows([1, 2, 3]);
            clearSelection();

            expect(selectedRows.value).toEqual([]);
        });
    });

    describe('isRowSelected', () => {
        it('should return false for an unselected row', () => {
            const { isRowSelected } = useSelection();

            expect(isRowSelected(1)).toBe(false);
        });

        it('should follow a deselection', () => {
            const { selectRows, deselectRows, isRowSelected } = useSelection();

            selectRows([1]);
            deselectRows([1]);

            expect(isRowSelected(1)).toBe(false);
        });
    });
});
