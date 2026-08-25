import { describe, it, expect } from 'vitest';
import { useSearching } from '../use-searching';

describe('useSearching', () => {
    it('should start with no active search', () => {
        const { searchItems } = useSearching();

        expect(searchItems.value).toEqual([]);
    });

    describe('addSearch', () => {
        it('should append a text search', () => {
            const { searchItems, addSearch } = useSearching();

            addSearch('name', 'John');

            expect(searchItems.value).toEqual([{ field: 'name', term: 'John' }]);
        });

        // `exact` is omitted rather than defaulted to false: the backend distinguishes
        // "not requested" from "explicitly loose".
        it('should omit the exact flag when it is not given', () => {
            const { searchItems, addSearch } = useSearching();

            addSearch('name', 'John');

            expect(searchItems.value[0]).not.toHaveProperty('exact');
        });

        it('should store an explicit exact flag', () => {
            const { searchItems, addSearch } = useSearching();

            addSearch('email', 'test@example.com', true);

            expect(searchItems.value[0]).toEqual({
                field: 'email',
                term: 'test@example.com',
                exact: true,
            });
        });

        it('should store an explicit false exact flag', () => {
            const { searchItems, addSearch } = useSearching();

            addSearch('name', 'John', false);

            expect(searchItems.value[0]?.exact).toBe(false);
        });

        it('should ignore a field that is already searched', () => {
            const { searchItems, addSearch } = useSearching();

            addSearch('name', 'John');
            addSearch('name', 'Jane');

            expect(searchItems.value).toEqual([{ field: 'name', term: 'John' }]);
        });

        it('should ignore an empty field key', () => {
            const { searchItems, addSearch } = useSearching();

            addSearch('', 'John');

            expect(searchItems.value).toEqual([]);
        });

        it('should remove the field when the term is empty', () => {
            const { searchItems, addSearch } = useSearching();

            addSearch('name', 'John');
            addSearch('name', '');

            expect(searchItems.value).toEqual([]);
        });
    });

    describe('updateSearchTerm', () => {
        it('should replace the term of an existing field', () => {
            const { searchItems, addSearch, updateSearchTerm } = useSearching();

            addSearch('name', 'John');
            updateSearchTerm('name', 'Jane');

            expect(searchItems.value).toEqual([{ field: 'name', term: 'Jane' }]);
        });

        it('should do nothing for a field that is not searched', () => {
            const { searchItems, updateSearchTerm } = useSearching();

            updateSearchTerm('missing', 'Jane');

            expect(searchItems.value).toEqual([]);
        });

        it('should remove the field when the new term is empty', () => {
            const { searchItems, addSearch, updateSearchTerm } = useSearching();

            addSearch('name', 'John');
            updateSearchTerm('name', '');

            expect(searchItems.value).toEqual([]);
        });

        it('should update the exact flag when given', () => {
            const { searchItems, addSearch, updateSearchTerm } = useSearching();

            addSearch('name', 'John', true);
            updateSearchTerm('name', 'Jane', false);

            expect(searchItems.value[0]?.exact).toBe(false);
        });

        it('should keep the previous exact flag when it is not given', () => {
            const { searchItems, addSearch, updateSearchTerm } = useSearching();

            addSearch('name', 'John', true);
            updateSearchTerm('name', 'Jane');

            expect(searchItems.value[0]?.exact).toBe(true);
        });
    });

    describe('removeSearch / clearAllSearches', () => {
        it('should remove a single field', () => {
            const { searchItems, addSearch, removeSearch } = useSearching();

            addSearch('name', 'John');
            addSearch('city', 'Budapest');
            removeSearch('name');

            expect(searchItems.value).toEqual([{ field: 'city', term: 'Budapest' }]);
        });

        it('should drop every search', () => {
            const { searchItems, addSearch, clearAllSearches } = useSearching();

            addSearch('name', 'John');
            addSearch('city', 'Budapest');
            clearAllSearches();

            expect(searchItems.value).toEqual([]);
        });
    });

    describe('getSearchTerm', () => {
        it('should return the term of a searched field', () => {
            const { addSearch, getSearchTerm } = useSearching();

            addSearch('name', 'John');

            expect(getSearchTerm('name')).toBe('John');
        });

        it('should return null for a field that is not searched', () => {
            const { getSearchTerm } = useSearching();

            expect(getSearchTerm('name')).toBeNull();
        });

        it('should return null for a range-only search', () => {
            const { setBetweenSearch, getSearchTerm } = useSearching();

            setBetweenSearch('age', 18, 65);

            expect(getSearchTerm('age')).toBeNull();
        });
    });

    describe('setBetweenSearch', () => {
        it('should add a range search', () => {
            const { searchItems, setBetweenSearch } = useSearching();

            setBetweenSearch('age', 18, 65);

            expect(searchItems.value).toEqual([{ field: 'age', min: 18, max: 65 }]);
        });

        it('should keep an open lower bound as null', () => {
            const { setBetweenSearch, getBetweenRange } = useSearching();

            setBetweenSearch('createdAt', null, '2024-12-31');

            expect(getBetweenRange('createdAt')).toEqual({ min: null, max: '2024-12-31' });
        });

        // The range inputs hand over '' when cleared, which must mean "open bound",
        // not a bound whose value happens to be the empty string.
        it('should normalize empty-string bounds to null', () => {
            const { searchItems, setBetweenSearch } = useSearching();

            setBetweenSearch('age', '', 65);

            expect(searchItems.value[0]?.min).toBeNull();
        });

        it('should remove the field when both bounds are open', () => {
            const { searchItems, setBetweenSearch } = useSearching();

            setBetweenSearch('age', 18, 65);
            setBetweenSearch('age', '', '');

            expect(searchItems.value).toEqual([]);
        });

        it('should ignore an empty field key', () => {
            const { searchItems, setBetweenSearch } = useSearching();

            setBetweenSearch('', 18, 65);

            expect(searchItems.value).toEqual([]);
        });

        it('should update the bounds of an existing range', () => {
            const { searchItems, setBetweenSearch } = useSearching();

            setBetweenSearch('age', 18, 65);
            setBetweenSearch('age', 30, 40);

            expect(searchItems.value).toEqual([{ field: 'age', min: 30, max: 40 }]);
        });

        // Text and range search are mutually exclusive per field: leaving the term
        // behind would send both to the backend for the same column.
        it('should drop an existing text search on the same field', () => {
            const { searchItems, addSearch, setBetweenSearch } = useSearching();

            addSearch('age', '30', true);
            setBetweenSearch('age', 18, 65);

            expect(searchItems.value).toHaveLength(1);
            expect(searchItems.value[0]).toEqual({ field: 'age', min: 18, max: 65 });
        });
    });

    describe('getBetweenRange', () => {
        it('should return both bounds of a range search', () => {
            const { setBetweenSearch, getBetweenRange } = useSearching();

            setBetweenSearch('age', 18, 65);

            expect(getBetweenRange('age')).toEqual({ min: 18, max: 65 });
        });

        it('should return null for a field with no search', () => {
            const { getBetweenRange } = useSearching();

            expect(getBetweenRange('age')).toBeNull();
        });

        it('should return null for a text-only search', () => {
            const { addSearch, getBetweenRange } = useSearching();

            addSearch('name', 'John');

            expect(getBetweenRange('name')).toBeNull();
        });
    });
});
