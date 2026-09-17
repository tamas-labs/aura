import { describe, it, expect } from 'vitest';
import { filterItemsByFilter } from '../filter-items.util';
import type { FilterItem } from '../../types/api-response.types';

describe('filterItemsByFilter', () => {
    const items = [
        { id: 1, status: 'active', role: 'admin', count: 100 },
        { id: 2, status: 'inactive', role: 'user', count: 50 },
        { id: 3, status: 'pending', role: 'admin', count: 75 },
        { id: 4, status: 'active', role: 'guest', count: 25 },
        { id: 5, status: null, role: 'user', count: null },
    ];

    describe('invalid inputs', () => {
        it('should return empty array if items is not array or null', () => {
            expect(filterItemsByFilter(null as any, [])).toEqual([]);
            expect(filterItemsByFilter(undefined as any, [])).toEqual([]);
            expect(filterItemsByFilter({} as any, [])).toEqual([]);
        });

        it('should return original items if filterItems is empty', () => {
            expect(filterItemsByFilter(items, [])).toEqual(items);
            expect(filterItemsByFilter(items, null as any)).toEqual(items);
        });

        it('should return original items if filterItems is undefined', () => {
            expect(filterItemsByFilter(items, undefined as any)).toEqual(items);
        });
    });

    describe('single field filtering', () => {
        it('should filter by single value', () => {
            const filters: FilterItem[] = [{ field: 'status', values: ['active'] }];
            const result = filterItemsByFilter(items, filters);

            expect(result).toHaveLength(2);
            expect((result[0] as any).id).toBe(1);
            expect((result[1] as any).id).toBe(4);
        });

        it('should filter by multiple values (OR within field)', () => {
            const filters: FilterItem[] = [{ field: 'status', values: ['active', 'pending'] }];
            const result = filterItemsByFilter(items, filters);

            expect(result).toHaveLength(3);
            expect((result[0] as any).id).toBe(1);
            expect((result[1] as any).id).toBe(3);
            expect((result[2] as any).id).toBe(4);
        });

        it('should return empty array if no values match', () => {
            const filters: FilterItem[] = [{ field: 'status', values: ['archived'] }];
            const result = filterItemsByFilter(items, filters);

            expect(result).toHaveLength(0);
        });

        it('should handle empty values array (returns all items)', () => {
            const filters: FilterItem[] = [{ field: 'status', values: [] }];
            const result = filterItemsByFilter(items, filters);

            expect(result).toEqual(items);
        });
    });

    describe('multiple field filtering (AND logic)', () => {
        it('should apply AND logic between different fields', () => {
            const filters: FilterItem[] = [
                { field: 'status', values: ['active'] },
                { field: 'role', values: ['admin'] },
            ];
            const result = filterItemsByFilter(items, filters);

            expect(result).toHaveLength(1);
            expect((result[0] as any).id).toBe(1);
        });

        it('should return empty if AND conditions cannot be satisfied', () => {
            const filters: FilterItem[] = [
                { field: 'status', values: ['active'] },
                { field: 'role', values: ['user'] },
            ];
            const result = filterItemsByFilter(items, filters);

            expect(result).toHaveLength(0);
        });

        it('should handle multiple values in multiple fields', () => {
            const filters: FilterItem[] = [
                { field: 'status', values: ['active', 'inactive'] },
                { field: 'role', values: ['admin', 'user'] },
            ];
            const result = filterItemsByFilter(items, filters);

            expect(result).toHaveLength(2);
            expect((result[0] as any).id).toBe(1); // active admin
            expect((result[1] as any).id).toBe(2); // inactive user
        });
    });

    describe('numeric values', () => {
        it('should filter by numeric values', () => {
            const filters: FilterItem[] = [{ field: 'count', values: [100] }];
            const result = filterItemsByFilter(items, filters);

            expect(result).toHaveLength(1);
            expect((result[0] as any).id).toBe(1);
        });

        it('should filter by multiple numeric values', () => {
            const filters: FilterItem[] = [{ field: 'count', values: [50, 75] }];
            const result = filterItemsByFilter(items, filters);

            expect(result).toHaveLength(2);
            expect((result[0] as any).id).toBe(2);
            expect((result[1] as any).id).toBe(3);
        });
    });

    describe('null and undefined handling', () => {
        it('should not match items with null field values unless null is in filter', () => {
            const filters: FilterItem[] = [{ field: 'status', values: ['active', 'inactive'] }];
            const result = filterItemsByFilter(items, filters);

            // Should not include item with status: null
            expect(result).toHaveLength(3);
            expect(result.every((item: any) => item.status !== null)).toBe(true);
        });

        it('should match null values when null is explicitly in filter values', () => {
            const filters: FilterItem[] = [{ field: 'status', values: [null] }];
            const result = filterItemsByFilter(items, filters);

            expect(result).toHaveLength(1);
            expect((result[0] as any).id).toBe(5);
        });

        it('should match undefined values when undefined is explicitly in filter values', () => {
            const itemsWithUndefined = [
                { id: 1, status: 'active' },
                { id: 2, status: undefined },
            ];
            const filters: FilterItem[] = [{ field: 'status', values: [undefined] }];
            const result = filterItemsByFilter(itemsWithUndefined, filters);

            expect(result).toHaveLength(1);
            expect((result[0] as any).id).toBe(2);
        });
    });

    describe('nested field filtering', () => {
        const nestedItems = [
            { id: 1, user: { name: 'John', role: 'admin' } },
            { id: 2, user: { name: 'Jane', role: 'user' } },
            { id: 3, user: { name: 'Bob', role: 'admin' } },
        ];

        it('should filter by nested field', () => {
            const filters: FilterItem[] = [{ field: 'user.role', values: ['admin'] }];
            const result = filterItemsByFilter(nestedItems, filters);

            expect(result).toHaveLength(2);
            expect((result[0] as any).id).toBe(1);
            expect((result[1] as any).id).toBe(3);
        });

        it('should handle non-existent nested paths', () => {
            const filters: FilterItem[] = [{ field: 'user.nonexistent', values: ['test'] }];
            const result = filterItemsByFilter(nestedItems, filters);

            expect(result).toHaveLength(0);
        });
    });

    describe('mixed type values', () => {
        const mixedItems = [
            { id: 1, value: 'test' },
            { id: 2, value: 123 },
            { id: 3, value: true },
            { id: 4, value: false },
        ];

        it('should filter string values', () => {
            const filters: FilterItem[] = [{ field: 'value', values: ['test'] }];
            const result = filterItemsByFilter(mixedItems, filters);

            expect(result).toHaveLength(1);
            expect((result[0] as any).id).toBe(1);
        });

        it('should filter boolean values', () => {
            const filters: FilterItem[] = [{ field: 'value', values: [true] }];
            const result = filterItemsByFilter(mixedItems, filters);

            expect(result).toHaveLength(1);
            expect((result[0] as any).id).toBe(3);
        });

        it('should handle mixed filter values', () => {
            const filters: FilterItem[] = [{ field: 'value', values: ['test', 123, true] }];
            const result = filterItemsByFilter(mixedItems, filters);

            expect(result).toHaveLength(3);
        });
    });

    describe('string/number type coercion', () => {
        const coercionItems = [
            { id: 1, status: 0, name: 'Zero' },
            { id: 2, status: 1, name: 'One' },
            { id: 3, status: '0', name: 'String Zero' },
            { id: 4, status: '1', name: 'String One' },
            { id: 5, status: 100, name: 'Hundred' },
        ];

        it('should match string filter "0" with number item 0', () => {
            const filters: FilterItem[] = [{ field: 'status', values: ['0'] }];
            const result = filterItemsByFilter(coercionItems, filters);

            expect(result).toHaveLength(2); // Matches 0 and '0'
            expect((result as any[]).map(r => r.id).sort()).toEqual([1, 3]);
        });

        it('should match number filter 0 with string item "0"', () => {
            const filters: FilterItem[] = [{ field: 'status', values: [0] }];
            const result = filterItemsByFilter(coercionItems, filters);

            expect(result).toHaveLength(2); // Matches 0 and '0'
            expect((result as any[]).map(r => r.id).sort()).toEqual([1, 3]);
        });

        it('should match string filter "1" with number item 1', () => {
            const filters: FilterItem[] = [{ field: 'status', values: ['1'] }];
            const result = filterItemsByFilter(coercionItems, filters);

            expect(result).toHaveLength(2); // Matches 1 and '1'
            expect((result as any[]).map(r => r.id).sort()).toEqual([2, 4]);
        });

        it('should NOT match string "0" with null or undefined', () => {
            const itemsWithNull = [
                { id: 6, status: null },
                { id: 7, status: undefined },
            ];
            const filters: FilterItem[] = [{ field: 'status', values: ['0'] }];
            const result = filterItemsByFilter(itemsWithNull, filters);

            expect(result).toHaveLength(0);
        });

        it('should NOT match string "true" with boolean true', () => {
            const itemsWithBoolean = [{ id: 8, status: true }];
            const filters: FilterItem[] = [{ field: 'status', values: ['true'] }];
            const result = filterItemsByFilter(itemsWithBoolean, filters);

            expect(result).toHaveLength(0);
        });

        it('should match mixed types correctly', () => {
            const items = [{ status: 0 }, { status: '1' }, { status: 2 }];
            const filters: FilterItem[] = [{ field: 'status', values: ['0', 1] }]; // '0' matches 0, 1 matches '1'
            const result = filterItemsByFilter(items, filters);

            expect(result).toHaveLength(2);
        });
    });

    describe('date-column matching (dateFilterFields)', () => {
        it('should match a bare yyyy-mm-dd row value by exact day', () => {
            const dateItems = [
                { id: 1, created_at: '2026-03-15' },
                { id: 2, created_at: '2026-03-16' },
            ];
            const filters: FilterItem[] = [{ field: 'created_at', values: ['2026-03-15'] }];
            const result = filterItemsByFilter(dateItems, filters, new Set(['created_at']));

            expect(result).toHaveLength(1);
            expect((result[0] as any).id).toBe(1);
        });

        it('should match a full-timestamp row value anywhere within the calendar day', () => {
            const dateItems = [
                { id: 1, created_at: '2026-03-15T00:00:00' },
                { id: 2, created_at: '2026-03-15T13:45:30' },
                { id: 3, created_at: '2026-03-15T23:59:59' },
                { id: 4, created_at: '2026-03-16T00:00:00' },
                { id: 5, created_at: '2026-03-14T23:59:59' },
            ];
            const filters: FilterItem[] = [{ field: 'created_at', values: ['2026-03-15'] }];
            const result = filterItemsByFilter(dateItems, filters, new Set(['created_at']));

            expect((result as any[]).map(r => r.id)).toEqual([1, 2, 3]);
        });

        it('should not day-match a field absent from dateFilterFields', () => {
            const dateItems = [{ id: 1, created_at: '2026-03-15T13:45:30' }];
            const filters: FilterItem[] = [{ field: 'created_at', values: ['2026-03-15'] }];
            const result = filterItemsByFilter(dateItems, filters);

            // Falls back to exact-value matching: a timestamp never equals a bare date string
            expect(result).toHaveLength(0);
        });

        it('should not match an invalid or non-date-only filter value', () => {
            const dateItems = [{ id: 1, created_at: '2026-03-15T13:45:30' }];
            const filters: FilterItem[] = [{ field: 'created_at', values: ['not-a-date'] }];
            const result = filterItemsByFilter(dateItems, filters, new Set(['created_at']));

            expect(result).toHaveLength(0);
        });

        it('should not match a row value that fails to parse as a date', () => {
            const dateItems = [{ id: 1, created_at: 'garbage' }];
            const filters: FilterItem[] = [{ field: 'created_at', values: ['2026-03-15'] }];
            const result = filterItemsByFilter(dateItems, filters, new Set(['created_at']));

            expect(result).toHaveLength(0);
        });

        it('should leave non-date fields on the same item unaffected', () => {
            const dateItems = [
                { id: 1, created_at: '2026-03-15T10:00:00', status: 'active' },
                { id: 2, created_at: '2026-03-15T10:00:00', status: 'inactive' },
            ];
            const filters: FilterItem[] = [
                { field: 'created_at', values: ['2026-03-15'] },
                { field: 'status', values: ['active'] },
            ];
            const result = filterItemsByFilter(dateItems, filters, new Set(['created_at']));

            expect(result).toHaveLength(1);
            expect((result[0] as any).id).toBe(1);
        });
    });

    describe('edge cases', () => {
        it('should return empty array when filtering empty items', () => {
            const filters: FilterItem[] = [{ field: 'status', values: ['active'] }];
            const result = filterItemsByFilter([], filters);

            expect(result).toEqual([]);
        });

        it('should handle filter with non-existent field', () => {
            const filters: FilterItem[] = [{ field: 'nonexistent', values: ['test'] }];
            const result = filterItemsByFilter(items, filters);

            expect(result).toHaveLength(0);
        });

        it('should preserve item order', () => {
            const filters: FilterItem[] = [{ field: 'role', values: ['admin', 'user'] }];
            const result = filterItemsByFilter(items, filters);

            expect((result[0] as any).id).toBe(1);
            expect((result[1] as any).id).toBe(2);
            expect((result[2] as any).id).toBe(3);
            expect((result[3] as any).id).toBe(5);
        });
    });
});
