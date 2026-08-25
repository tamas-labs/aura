import { describe, it, expect } from 'vitest';
import { HeaderRowsZod } from '../header-rows.zod';

describe('HeaderRowsZod', () => {
    describe('valid cases', () => {
        it('should parse array with single object element', () => {
            const validRows = [{ cells: [{ content: 'ID' }] }];
            const result = HeaderRowsZod.parse(validRows);
            expect(result).toEqual(validRows);
        });

        it('should parse array with multiple object elements', () => {
            const validRows = [{ cells: [{ content: 'ID' }] }, { cells: [{ content: 'Name' }] }];
            const result = HeaderRowsZod.parse(validRows);
            expect(result).toEqual(validRows);
        });

        it('should parse array and strip unknown properties from rows', () => {
            const rowsWithExtra = [
                {
                    cells: [{ content: 'ID', field: 'id' }],
                    unknownProp: 'should be removed',
                    extraField: 123,
                },
            ];
            const result = HeaderRowsZod.parse(rowsWithExtra);
            expect(result).toEqual([{ cells: [{ content: 'ID', field: 'id' }] }]);
            expect(result[0]).not.toHaveProperty('unknownProp');
            expect(result[0]).not.toHaveProperty('extraField');
        });

        it('should strip __proto__ from rows (prototype pollution protection)', () => {
            const maliciousRows = [
                {
                    cells: [{ content: 'ID' }],
                    __proto__: { polluted: true },
                },
            ];
            const result = HeaderRowsZod.parse(maliciousRows);
            expect(result).toEqual([{ cells: [{ content: 'ID' }] }]);
            expect(result[0]).not.toHaveProperty('__proto__');
        });

        it('should parse array with objects containing various properties', () => {
            const complexRows = [
                {
                    cells: [{ content: 'ID', field: 'id', sortable: true }],
                },
            ];
            const result = HeaderRowsZod.parse(complexRows);
            expect(result).toEqual(complexRows);
        });

        it('should throw for array with empty objects (missing cells)', () => {
            const emptyObjectArray = [{}];
            expect(() => HeaderRowsZod.parse(emptyObjectArray)).toThrow();
        });

        it('should parse array with nested objects in cells', () => {
            const nestedRows = [
                {
                    cells: [{ content: 'Name' }],
                },
            ];
            const result = HeaderRowsZod.parse(nestedRows);
            expect(result).toEqual(nestedRows);
        });
    });

    describe('invalid cases - empty array', () => {
        it('should throw error for empty array', () => {
            expect(() => HeaderRowsZod.parse([])).toThrow(
                'Header rows array must contain at least one row'
            );
        });
    });

    describe('invalid cases - null and undefined', () => {
        it('should throw error for null value', () => {
            expect(() => HeaderRowsZod.parse(null)).toThrow();
        });

        it('should throw error for undefined value', () => {
            expect(() => HeaderRowsZod.parse(undefined)).toThrow();
        });
    });

    describe('invalid cases - non-array types', () => {
        it('should throw error for string value', () => {
            expect(() => HeaderRowsZod.parse('rows')).toThrow();
        });

        it('should throw error for number value', () => {
            expect(() => HeaderRowsZod.parse(123)).toThrow();
        });

        it('should throw error for boolean value', () => {
            expect(() => HeaderRowsZod.parse(true)).toThrow();
        });

        it('should throw error for plain object (not array)', () => {
            expect(() => HeaderRowsZod.parse({ cells: [] })).toThrow();
        });
    });

    describe('invalid cases - array with non-object elements', () => {
        it('should throw error for array with string elements', () => {
            expect(() => HeaderRowsZod.parse(['row1', 'row2'])).toThrow();
        });

        it('should throw error for array with number elements', () => {
            expect(() => HeaderRowsZod.parse([1, 2, 3])).toThrow();
        });

        it('should throw error for array with boolean elements', () => {
            expect(() => HeaderRowsZod.parse([true, false])).toThrow();
        });

        it('should throw error for array with null elements', () => {
            expect(() => HeaderRowsZod.parse([null])).toThrow();
        });

        it('should throw error for array with nested arrays', () => {
            expect(() => HeaderRowsZod.parse([[[{ content: 'ID' }]]])).toThrow();
        });
    });

    describe('safeParse validation', () => {
        it('should return success for valid rows array', () => {
            const validRows = [{ cells: [{ content: 'ID' }] }];
            const result = HeaderRowsZod.safeParse(validRows);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validRows);
            }
        });

        it('should return error for empty array', () => {
            const result = HeaderRowsZod.safeParse([]);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.issues[0]?.message).toContain('at least one row');
            }
        });

        it('should return error for null', () => {
            const result = HeaderRowsZod.safeParse(null);

            expect(result.success).toBe(false);
        });

        it('should return error for non-array type', () => {
            const result = HeaderRowsZod.safeParse({ cells: [] });

            expect(result.success).toBe(false);
        });
    });

    describe('type inference', () => {
        it('should infer correct type for parsed data', () => {
            const validRows = [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }];
            const result = HeaderRowsZod.parse(validRows);

            // TypeScript type check
            expect(Array.isArray(result)).toBe(true);
            expect(typeof result[0]).toBe('object');
            expect(result[0]?.cells).toBeDefined();
            expect(result[0]?.cells[0]).toHaveProperty('field', 'id');
        });
    });
});
