import { describe, it, expect } from 'vitest';
import { HeaderCellsZod } from '../header-cells.zod';

describe('HeaderCellsZod', () => {
    describe('valid cases', () => {
        it('should parse array with single valid cell object', () => {
            const validCells = [{ content: 'ID', key: 'id', field: 'id' }];
            const result = HeaderCellsZod.parse(validCells);
            expect(result).toMatchObject(validCells);
        });

        it('should parse array with multiple valid cell objects', () => {
            const validCells = [
                { content: 'ID', key: 'id', field: 'id' },
                { content: 'Name', key: 'name', field: 'name' },
            ];
            const result = HeaderCellsZod.parse(validCells);
            expect(result[0]).toMatchObject({ content: 'ID', key: 'id', field: 'id' });
            expect(result[1]).toMatchObject({ content: 'Name', key: 'name', field: 'name' });
        });

        it('should parse array with cells containing various properties', () => {
            const complexCells = [
                {
                    content: 'ID',
                    key: 'id',
                    field: 'id',
                    sortable: true,
                    searchable: true,
                    width: '100px',
                },
            ];
            const result = HeaderCellsZod.parse(complexCells);
            expect(result[0]?.sortable).toBe(true);
            expect(result[0]?.width).toBe('100px');
        });

        it('should parse cells with data-* attributes', () => {
            const cellsWithData = [
                {
                    content: 'Status',
                    key: 'status',
                    field: 'status',
                    'data-tooltip': 'User status',
                    'data-icon': 'info',
                },
            ];
            const result = HeaderCellsZod.parse(cellsWithData);
            expect(result[0]?.['data-tooltip']).toBe('User status');
            expect(result[0]?.['data-icon']).toBe('info');
        });

        it('should throw for array with empty objects (missing required fields)', () => {
            const emptyObjectArray = [{}];
            expect(() => HeaderCellsZod.parse(emptyObjectArray)).toThrow();
        });
    });

    describe('invalid cases - empty array', () => {
        it('should throw error for empty array', () => {
            expect(() => HeaderCellsZod.parse([])).toThrow(
                'Header cells array must contain at least one cell'
            );
        });
    });

    describe('invalid cases - null and undefined', () => {
        it('should throw error for null value', () => {
            expect(() => HeaderCellsZod.parse(null)).toThrow();
        });

        it('should throw error for undefined value', () => {
            expect(() => HeaderCellsZod.parse(undefined)).toThrow();
        });
    });

    describe('invalid cases - non-array types', () => {
        it('should throw error for string value', () => {
            expect(() => HeaderCellsZod.parse('cells')).toThrow();
        });

        it('should throw error for number value', () => {
            expect(() => HeaderCellsZod.parse(123)).toThrow();
        });

        it('should throw error for boolean value', () => {
            expect(() => HeaderCellsZod.parse(true)).toThrow();
        });

        it('should throw error for plain object (not array)', () => {
            expect(() => HeaderCellsZod.parse({ content: 'ID' })).toThrow();
        });
    });

    describe('invalid cases - array with non-object elements', () => {
        it('should throw error for array with string elements', () => {
            expect(() => HeaderCellsZod.parse(['cell1', 'cell2'])).toThrow();
        });

        it('should throw error for array with number elements', () => {
            expect(() => HeaderCellsZod.parse([1, 2, 3])).toThrow();
        });

        it('should throw error for array with boolean elements', () => {
            expect(() => HeaderCellsZod.parse([true, false])).toThrow();
        });

        it('should throw error for array with null elements', () => {
            expect(() => HeaderCellsZod.parse([null])).toThrow();
        });

        it('should throw error for mixed array with objects and primitives', () => {
            expect(() => HeaderCellsZod.parse([{ content: 'ID' }, 'invalid'])).toThrow();
        });
    });
});
