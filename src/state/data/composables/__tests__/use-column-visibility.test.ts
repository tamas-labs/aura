import { describe, it, expect } from 'vitest';
import { useColumnVisibility } from '../use-column-visibility';

describe('useColumnVisibility', () => {
    it('should start with nothing hidden', () => {
        const { hiddenColumns, isColumnHidden } = useColumnVisibility();

        expect(hiddenColumns.value).toEqual([]);
        expect(isColumnHidden('email')).toBe(false);
    });

    describe('hideColumn', () => {
        it('should add the key to the hidden list', () => {
            const { hiddenColumns, hideColumn, isColumnHidden } = useColumnVisibility();

            hideColumn('email');

            expect(hiddenColumns.value).toEqual(['email']);
            expect(isColumnHidden('email')).toBe(true);
        });

        it('should ignore an already hidden column', () => {
            const { hiddenColumns, hideColumn } = useColumnVisibility();

            hideColumn('email');
            hideColumn('email');

            expect(hiddenColumns.value).toEqual(['email']);
        });

        it('should ignore an empty key', () => {
            const { hiddenColumns, hideColumn } = useColumnVisibility();

            hideColumn('');

            expect(hiddenColumns.value).toEqual([]);
        });

        it('should replace the array so a watcher fires', () => {
            const { hiddenColumns, hideColumn } = useColumnVisibility();
            const before = hiddenColumns.value;

            hideColumn('email');

            expect(hiddenColumns.value).not.toBe(before);
        });
    });

    describe('showColumn', () => {
        it('should remove the key from the hidden list', () => {
            const { hiddenColumns, hideColumn, showColumn } = useColumnVisibility();

            hideColumn('email');
            hideColumn('name');
            showColumn('email');

            expect(hiddenColumns.value).toEqual(['name']);
        });

        it('should ignore a column that is already visible', () => {
            const { hiddenColumns, showColumn } = useColumnVisibility();

            showColumn('email');

            expect(hiddenColumns.value).toEqual([]);
        });
    });

    describe('toggleColumn', () => {
        it('should hide a visible column', () => {
            const { hiddenColumns, toggleColumn } = useColumnVisibility();

            toggleColumn('email');

            expect(hiddenColumns.value).toEqual(['email']);
        });

        it('should show a hidden column', () => {
            const { hiddenColumns, toggleColumn } = useColumnVisibility();

            toggleColumn('email');
            toggleColumn('email');

            expect(hiddenColumns.value).toEqual([]);
        });
    });

    describe('setHiddenColumns', () => {
        it('should replace the whole list', () => {
            const { hiddenColumns, hideColumn, setHiddenColumns } = useColumnVisibility();

            hideColumn('email');
            setHiddenColumns(['name', 'createdAt']);

            expect(hiddenColumns.value).toEqual(['name', 'createdAt']);
        });

        it('should drop empty keys and duplicates', () => {
            const { hiddenColumns, setHiddenColumns } = useColumnVisibility();

            setHiddenColumns(['name', '', 'name', 'email']);

            expect(hiddenColumns.value).toEqual(['name', 'email']);
        });

        it('should treat a missing list as empty', () => {
            const { hiddenColumns, setHiddenColumns } = useColumnVisibility();

            setHiddenColumns(undefined as unknown as string[]);

            expect(hiddenColumns.value).toEqual([]);
        });
    });

    describe('showAllColumns', () => {
        it('should clear the hidden list', () => {
            const { hiddenColumns, hideColumn, showAllColumns } = useColumnVisibility();

            hideColumn('email');
            hideColumn('name');
            showAllColumns();

            expect(hiddenColumns.value).toEqual([]);
        });
    });
});
