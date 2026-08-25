import { describe, it, expect } from 'vitest';
import { useFiltering } from '../use-filtering';

describe('useFiltering', () => {
    it('should start with no active filter', () => {
        const { filterItems } = useFiltering();

        expect(filterItems.value).toEqual([]);
    });

    describe('addFilter', () => {
        it('should append a filter', () => {
            const { filterItems, addFilter } = useFiltering();

            addFilter('status', ['active', 'pending']);

            expect(filterItems.value).toEqual([{ field: 'status', values: ['active', 'pending'] }]);
        });

        it('should ignore a field that is already filtered', () => {
            const { filterItems, addFilter } = useFiltering();

            addFilter('status', ['active']);
            addFilter('status', ['inactive']);

            expect(filterItems.value).toEqual([{ field: 'status', values: ['active'] }]);
        });

        it('should ignore an empty field key', () => {
            const { filterItems, addFilter } = useFiltering();

            addFilter('', ['active']);

            expect(filterItems.value).toEqual([]);
        });

        // "Filter with no values" is not a filter — clearing every checkbox in the
        // dropdown must remove the item, not persist an always-empty match.
        it('should remove the field when called with an empty value list', () => {
            const { filterItems, addFilter } = useFiltering();

            addFilter('status', ['active']);
            addFilter('status', []);

            expect(filterItems.value).toEqual([]);
        });

        it('should keep non-string values as they are', () => {
            const { filterItems, addFilter } = useFiltering();

            addFilter('active', [true, 0, null]);

            expect(filterItems.value[0]?.values).toEqual([true, 0, null]);
        });
    });

    describe('updateFilterValues', () => {
        it('should replace the values of an existing filter', () => {
            const { filterItems, addFilter, updateFilterValues } = useFiltering();

            addFilter('status', ['active']);
            updateFilterValues('status', ['inactive', 'archived']);

            expect(filterItems.value).toEqual([
                { field: 'status', values: ['inactive', 'archived'] },
            ]);
        });

        it('should do nothing for an unfiltered field', () => {
            const { filterItems, updateFilterValues } = useFiltering();

            updateFilterValues('missing', ['x']);

            expect(filterItems.value).toEqual([]);
        });

        it('should remove the field when updated to an empty value list', () => {
            const { filterItems, addFilter, updateFilterValues } = useFiltering();

            addFilter('status', ['active']);
            updateFilterValues('status', []);

            expect(filterItems.value).toEqual([]);
        });

        it('should leave the other filters in place', () => {
            const { filterItems, addFilter, updateFilterValues } = useFiltering();

            addFilter('status', ['active']);
            addFilter('role', ['admin']);
            updateFilterValues('status', ['archived']);

            expect(filterItems.value.map(item => item.field)).toEqual(['status', 'role']);
            expect(filterItems.value[1]?.values).toEqual(['admin']);
        });
    });

    describe('removeFilter / clearAllFilters', () => {
        it('should remove a single field', () => {
            const { filterItems, addFilter, removeFilter } = useFiltering();

            addFilter('status', ['active']);
            addFilter('role', ['admin']);
            removeFilter('status');

            expect(filterItems.value).toEqual([{ field: 'role', values: ['admin'] }]);
        });

        it('should tolerate removing an unfiltered field', () => {
            const { filterItems, addFilter, removeFilter } = useFiltering();

            addFilter('status', ['active']);
            removeFilter('missing');

            expect(filterItems.value).toHaveLength(1);
        });

        it('should drop every filter', () => {
            const { filterItems, addFilter, clearAllFilters } = useFiltering();

            addFilter('status', ['active']);
            addFilter('role', ['admin']);
            clearAllFilters();

            expect(filterItems.value).toEqual([]);
        });
    });

    describe('getFilterValues', () => {
        it('should return the values of a filtered field', () => {
            const { addFilter, getFilterValues } = useFiltering();

            addFilter('status', ['active', 'pending']);

            expect(getFilterValues('status')).toEqual(['active', 'pending']);
        });

        it('should return null for an unfiltered field', () => {
            const { getFilterValues } = useFiltering();

            expect(getFilterValues('status')).toBeNull();
        });

        it('should return null after the filter was removed', () => {
            const { addFilter, removeFilter, getFilterValues } = useFiltering();

            addFilter('status', ['active']);
            removeFilter('status');

            expect(getFilterValues('status')).toBeNull();
        });
    });
});
