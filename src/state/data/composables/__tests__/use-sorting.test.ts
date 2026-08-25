import { describe, it, expect } from 'vitest';
import { useSorting } from '../use-sorting';

describe('useSorting', () => {
    it('should start with no active sort', () => {
        const { sortItems } = useSorting();

        expect(sortItems.value).toEqual([]);
    });

    describe('addSort', () => {
        it('should append a sort field', () => {
            const { sortItems, addSort } = useSorting();

            addSort('name', 'asc');

            expect(sortItems.value).toEqual([{ field: 'name', direction: 'asc' }]);
        });

        // Multi-column sorting applies the rules in insertion order, so the order
        // of `sortItems` is part of the contract.
        it('should keep the insertion order of multiple fields', () => {
            const { sortItems, addSort } = useSorting();

            addSort('name', 'asc');
            addSort('age', 'desc');
            addSort('city', 'asc');

            expect(sortItems.value.map(item => item.field)).toEqual(['name', 'age', 'city']);
        });

        it('should ignore a field that is already sorted', () => {
            const { sortItems, addSort } = useSorting();

            addSort('name', 'asc');
            addSort('name', 'desc');

            expect(sortItems.value).toEqual([{ field: 'name', direction: 'asc' }]);
        });

        it('should ignore an empty field key', () => {
            const { sortItems, addSort } = useSorting();

            addSort('', 'asc');

            expect(sortItems.value).toEqual([]);
        });
    });

    describe('updateSortDirection', () => {
        it('should flip the direction of an existing field in place', () => {
            const { sortItems, addSort, updateSortDirection } = useSorting();

            addSort('name', 'asc');
            addSort('age', 'asc');
            updateSortDirection('name', 'desc');

            expect(sortItems.value).toEqual([
                { field: 'name', direction: 'desc' },
                { field: 'age', direction: 'asc' },
            ]);
        });

        it('should do nothing for an unsorted field', () => {
            const { sortItems, updateSortDirection } = useSorting();

            updateSortDirection('missing', 'desc');

            expect(sortItems.value).toEqual([]);
        });
    });

    describe('removeSort / clearAllSorts', () => {
        it('should remove a single field and keep the rest in order', () => {
            const { sortItems, addSort, removeSort } = useSorting();

            addSort('name', 'asc');
            addSort('age', 'desc');
            addSort('city', 'asc');
            removeSort('age');

            expect(sortItems.value.map(item => item.field)).toEqual(['name', 'city']);
        });

        it('should tolerate removing an unsorted field', () => {
            const { sortItems, addSort, removeSort } = useSorting();

            addSort('name', 'asc');
            removeSort('missing');

            expect(sortItems.value).toHaveLength(1);
        });

        it('should drop every sort', () => {
            const { sortItems, addSort, clearAllSorts } = useSorting();

            addSort('name', 'asc');
            addSort('age', 'desc');
            clearAllSorts();

            expect(sortItems.value).toEqual([]);
        });
    });

    describe('getSortDirection', () => {
        it('should return the direction of a sorted field', () => {
            const { addSort, getSortDirection } = useSorting();

            addSort('name', 'desc');

            expect(getSortDirection('name')).toBe('desc');
        });

        it('should return null for an unsorted field', () => {
            const { getSortDirection } = useSorting();

            expect(getSortDirection('name')).toBeNull();
        });

        it('should follow a direction update', () => {
            const { addSort, updateSortDirection, getSortDirection } = useSorting();

            addSort('name', 'asc');
            updateSortDirection('name', 'desc');

            expect(getSortDirection('name')).toBe('desc');
        });
    });
});
