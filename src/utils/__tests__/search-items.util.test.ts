import { describe, it, expect } from 'vitest';
import { filterItemsBySearch } from '../search-items.util';
import type { SearchItem } from '../../types/api-response.types';

describe('filterItemsBySearch', () => {
    const items = [
        { id: 1, name: 'John Doe', email: 'john@example.com', active: true, age: 30 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false, age: 25 },
        { id: 3, name: 'Bob Jones', email: 'bob@example.com', active: true, age: 40 },
        { id: 4, name: null, email: 'null@example.com', active: false, age: null },
    ];

    describe('invalid inputs', () => {
        it('should return empty array if items is not array or null', () => {
            expect(filterItemsBySearch(null as any, [])).toEqual([]);
            expect(filterItemsBySearch(undefined as any, [])).toEqual([]);
            expect(filterItemsBySearch({} as any, [])).toEqual([]);
        });

        it('should return original items if searchItems is empty', () => {
            expect(filterItemsBySearch(items, [])).toEqual(items);
            expect(filterItemsBySearch(items, null as any)).toEqual(items);
        });

        it('should return original items if searchItems is undefined', () => {
            expect(filterItemsBySearch(items, undefined as any)).toEqual(items);
        });
    });

    describe('string field searches', () => {
        it('should filter string field partial match (case insensitive)', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'jo' }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(2); // John Doe, Bob Jones
            expect((result[0] as any).name).toBe('John Doe');
            expect((result[1] as any).name).toBe('Bob Jones');
        });

        it('should filter string field exact match', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'John Doe', exact: true }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).name).toBe('John Doe');
        });

        it('should not match partial string on exact search', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'John', exact: true }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(0);
        });

        it('should be case insensitive for partial matches', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'JOHN' }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).name).toBe('John Doe');
        });

        it('should be case insensitive for exact matches', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'john doe', exact: true }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).name).toBe('John Doe');
        });

        it('should match substring anywhere in the string', () => {
            const search: SearchItem[] = [{ field: 'email', term: 'example' }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(4); // All items have @example.com
        });
    });

    describe('number field searches', () => {
        it('should filter number field', () => {
            const search: SearchItem[] = [{ field: 'age', term: '30' }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).age).toBe(30);
        });

        it('should filter number field with partial match', () => {
            const search: SearchItem[] = [{ field: 'age', term: '4' }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(1); // age: 40
            expect((result[0] as any).age).toBe(40);
        });

        it('should filter number field with exact match', () => {
            const search: SearchItem[] = [{ field: 'age', term: '30', exact: true }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).age).toBe(30);
        });
    });

    describe('boolean field searches', () => {
        it('should filter boolean field', () => {
            const search: SearchItem[] = [{ field: 'active', term: 'false' }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(2); // Jane Smith, Null item
            expect((result[0] as any).active).toBe(false);
        });

        it('should filter boolean true value', () => {
            const search: SearchItem[] = [{ field: 'active', term: 'true' }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(2); // John Doe, Bob Jones
        });

        it('should match boolean with exact match', () => {
            const search: SearchItem[] = [{ field: 'active', term: 'false', exact: true }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(2);
        });
    });

    describe('multiple search criteria (AND logic)', () => {
        it('should handle multiple search criteria (AND logic)', () => {
            const search: SearchItem[] = [
                { field: 'name', term: 'jo' },
                { field: 'age', term: '30' },
            ];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(1); // John Doe
            expect((result[0] as any).name).toBe('John Doe');
        });

        it('should return empty array if no items match all criteria', () => {
            const search: SearchItem[] = [
                { field: 'name', term: 'John' },
                { field: 'age', term: '25' }, // John is 30, not 25
            ];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(0);
        });

        it('should handle three search criteria', () => {
            const search: SearchItem[] = [
                { field: 'name', term: 'john' },
                { field: 'email', term: 'john' },
                { field: 'active', term: 'true' },
            ];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).name).toBe('John Doe');
        });
    });

    describe('empty and null term handling', () => {
        it('should handle empty or null term as wildcard (no filter)', () => {
            const search: SearchItem[] = [{ field: 'name', term: '' }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(items.length); // Should return all
        });

        it('should handle null term', () => {
            const search: SearchItem[] = [{ field: 'name', term: null as any }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(items.length);
        });

        it('should handle undefined term', () => {
            const search: SearchItem[] = [{ field: 'name', term: undefined as any }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(items.length);
        });

        it('should combine empty term with valid term correctly', () => {
            const search: SearchItem[] = [
                { field: 'name', term: '' }, // Should not filter
                { field: 'age', term: '30' }, // Should filter
            ];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).age).toBe(30);
        });
    });

    describe('null/undefined values in items', () => {
        it('should handle null/undefined values in items gracefully', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'John' }];
            const result = filterItemsBySearch(items, search);

            // Item 4 has null name, should not crash and not match
            expect(result.some((i: any) => i.id === 4)).toBe(false);
        });

        it('should not match items with null values', () => {
            const search: SearchItem[] = [{ field: 'age', term: '30' }];
            const result = filterItemsBySearch(items, search);

            // Item 4 has null age
            expect(result.every((i: any) => i.age !== null)).toBe(true);
        });

        it('should handle search on non-existent field', () => {
            const search: SearchItem[] = [{ field: 'nonExistent', term: 'test' }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(0);
        });
    });

    describe('nested property searches', () => {
        it('should support nested properties', () => {
            const nestedItems = [
                { id: 1, user: { name: 'Alice' } },
                { id: 2, user: { name: 'Bob' } },
            ];

            const search: SearchItem[] = [{ field: 'user.name', term: 'ali' }];
            const result = filterItemsBySearch(nestedItems, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).user.name).toBe('Alice');
        });

        it('should support deeply nested properties', () => {
            const nestedItems = [
                { id: 1, user: { profile: { name: 'Alice' } } },
                { id: 2, user: { profile: { name: 'Bob' } } },
            ];

            const search: SearchItem[] = [{ field: 'user.profile.name', term: 'bob' }];
            const result = filterItemsBySearch(nestedItems, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).user.profile.name).toBe('Bob');
        });

        it('should handle nested property that does not exist', () => {
            const nestedItems = [
                { id: 1, user: { name: 'Alice' } },
                { id: 2, user: {} },
            ];

            const search: SearchItem[] = [{ field: 'user.name', term: 'ali' }];
            const result = filterItemsBySearch(nestedItems, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).id).toBe(1);
        });

        it('should handle nested property with null parent', () => {
            const nestedItems = [
                { id: 1, user: { name: 'Alice' } },
                { id: 2, user: null },
            ];

            const search: SearchItem[] = [{ field: 'user.name', term: 'ali' }];
            const result = filterItemsBySearch(nestedItems, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).id).toBe(1);
        });
    });

    describe('edge cases', () => {
        it('should handle empty items array', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'test' }];
            const result = filterItemsBySearch([], search);

            expect(result).toHaveLength(0);
        });

        it('should handle items with special characters in values', () => {
            const specialItems = [
                { id: 1, name: 'John & Jane' },
                { id: 2, name: 'Bob <test>' },
            ];

            const search: SearchItem[] = [{ field: 'name', term: '&' }];
            const result = filterItemsBySearch(specialItems, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).name).toBe('John & Jane');
        });

        it('should handle items with numeric strings', () => {
            const numericItems = [
                { id: 1, code: '12345' },
                { id: 2, code: '67890' },
            ];

            const search: SearchItem[] = [{ field: 'code', term: '123' }];
            const result = filterItemsBySearch(numericItems, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).code).toBe('12345');
        });

        it('should handle whitespace in search terms', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'John Doe' }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(1);
            expect((result[0] as any).name).toBe('John Doe');
        });

        it('should handle exact match with exact: false explicitly set', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'jo', exact: false }];
            const result = filterItemsBySearch(items, search);

            expect(result).toHaveLength(2); // Should use partial match
        });
    });

    describe('range (between) search', () => {
        it('should match numeric values within [min, max]', () => {
            const search: SearchItem[] = [{ field: 'age', min: 26, max: 40 }];
            const result = filterItemsBySearch(items, search);

            // John (30) and Bob (40); Jane (25) and null age excluded
            expect(result.map((r: any) => r.id)).toEqual([1, 3]);
        });

        it('should support open lower bound (only max)', () => {
            const search: SearchItem[] = [{ field: 'age', max: 30 }];
            const result = filterItemsBySearch(items, search);

            expect(result.map((r: any) => r.id)).toEqual([1, 2]);
        });

        it('should support open upper bound (only min)', () => {
            const search: SearchItem[] = [{ field: 'age', min: 30 }];
            const result = filterItemsBySearch(items, search);

            expect(result.map((r: any) => r.id)).toEqual([1, 3]);
        });

        it('should exclude items whose value is null/undefined', () => {
            const search: SearchItem[] = [{ field: 'age', min: 0, max: 100 }];
            const result = filterItemsBySearch(items, search);

            // The item with age: null is excluded
            expect(result.map((r: any) => r.id)).toEqual([1, 2, 3]);
        });

        it('should coerce string bounds to numbers', () => {
            const search: SearchItem[] = [{ field: 'age', min: '26', max: '40' }];
            const result = filterItemsBySearch(items, search);

            expect(result.map((r: any) => r.id)).toEqual([1, 3]);
        });

        it('should match date strings within a range', () => {
            const dated = [
                { id: 1, created: '2024-01-15' },
                { id: 2, created: '2024-06-01' },
                { id: 3, created: '2024-12-31' },
            ];
            const search: SearchItem[] = [
                { field: 'created', min: '2024-05-01', max: '2024-07-01' },
            ];
            const result = filterItemsBySearch(dated, search);

            expect(result.map((r: any) => r.id)).toEqual([2]);
        });

        it('should combine range and text criteria (AND)', () => {
            const search: SearchItem[] = [
                { field: 'age', min: 26 },
                { field: 'name', term: 'bob' },
            ];
            const result = filterItemsBySearch(items, search);

            expect(result.map((r: any) => r.id)).toEqual([3]);
        });
    });

    describe('accent-insensitive search', () => {
        const accented = [
            { id: 1, name: 'Árvíztűrő tükörfúrógép' },
            { id: 2, name: 'Arvizturo tukorfurogep' },
            { id: 3, name: 'Kovács Béla' },
        ];

        it('should not match an unaccented term by default', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'arvizturo' }];
            const result = filterItemsBySearch(accented, search);

            expect(result.map((r: any) => r.id)).toEqual([2]);
        });

        it('should match both spellings when the flag is on', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'arvizturo' }];
            const result = filterItemsBySearch(accented, search, true);

            expect(result.map((r: any) => r.id)).toEqual([1, 2]);
        });

        it('should match an accented term against unaccented data', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'tükörfúrógép' }];
            const result = filterItemsBySearch(accented, search, true);

            expect(result.map((r: any) => r.id)).toEqual([1, 2]);
        });

        it('should stay case-insensitive while folding accents', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'KOVACS' }];
            const result = filterItemsBySearch(accented, search, true);

            expect(result.map((r: any) => r.id)).toEqual([3]);
        });

        it('should apply folding to exact matches too', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'kovacs bela', exact: true }];

            expect(filterItemsBySearch(accented, search, true).map((r: any) => r.id)).toEqual([3]);
            expect(filterItemsBySearch(accented, search, false)).toEqual([]);
        });

        it('should not turn an exact match into a partial one', () => {
            const search: SearchItem[] = [{ field: 'name', term: 'kovacs', exact: true }];

            expect(filterItemsBySearch(accented, search, true)).toEqual([]);
        });

        it('should leave range criteria untouched', () => {
            const rows = [
                { id: 1, name: 'Béla', age: 30 },
                { id: 2, name: 'Bela', age: 20 },
            ];
            const search: SearchItem[] = [{ field: 'age', min: 25 }];

            expect(filterItemsBySearch(rows, search, true).map((r: any) => r.id)).toEqual([1]);
        });

        it('should still ignore empty terms', () => {
            const search: SearchItem[] = [{ field: 'name', term: '' }];

            expect(filterItemsBySearch(accented, search, true)).toHaveLength(3);
        });

        it('should still skip null values', () => {
            const rows = [{ id: 1, name: null }];
            const search: SearchItem[] = [{ field: 'name', term: 'a' }];

            expect(filterItemsBySearch(rows, search, true)).toEqual([]);
        });
    });
});
