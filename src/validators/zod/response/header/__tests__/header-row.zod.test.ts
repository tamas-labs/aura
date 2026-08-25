import { describe, it, expect } from 'vitest';
import { HeaderRowZod } from '../header-row.zod';

describe('HeaderRowZod', () => {
    describe('valid cases', () => {
        it('should parse object with cells array', () => {
            const validRow = { cells: [{ content: 'ID' }] };
            const result = HeaderRowZod.parse(validRow);
            expect(result).toEqual(validRow);
        });

        it('should parse object with multiple cells', () => {
            const validRow = {
                cells: [
                    { content: 'ID', field: 'id' },
                    { content: 'Name', field: 'name' },
                ],
            };
            const result = HeaderRowZod.parse(validRow);
            expect(result).toEqual(validRow);
        });

        it('should strip unknown properties', () => {
            const rowWithExtra = {
                cells: [{ content: 'ID' }],
                extraProp: 'should be removed',
                anotherExtra: 123,
            };
            const result = HeaderRowZod.parse(rowWithExtra);
            expect(result).toEqual({ cells: [{ content: 'ID' }] });
            expect(result).not.toHaveProperty('extraProp');
            expect(result).not.toHaveProperty('anotherExtra');
        });

        it('should strip __proto__ property (prototype pollution protection)', () => {
            const maliciousRow = {
                cells: [{ content: 'ID' }],
                __proto__: { polluted: true },
            };
            const result = HeaderRowZod.parse(maliciousRow);
            expect(result).toEqual({ cells: [{ content: 'ID' }] });
            expect(result).not.toHaveProperty('__proto__');
        });

        it('should strip constructor property (prototype pollution protection)', () => {
            const maliciousRow = {
                cells: [{ content: 'ID' }],
                constructor: { polluted: true },
            };
            const result = HeaderRowZod.parse(maliciousRow);
            expect(result).toEqual({ cells: [{ content: 'ID' }] });
            expect(result).not.toHaveProperty('constructor');
        });
    });

    describe('invalid cases - missing cells', () => {
        it('should throw error for object without cells property', () => {
            expect(() => HeaderRowZod.parse({})).toThrow();
        });

        it('should throw error for object with null cells', () => {
            expect(() => HeaderRowZod.parse({ cells: null })).toThrow();
        });

        it('should throw error for object with undefined cells', () => {
            expect(() => HeaderRowZod.parse({ cells: undefined })).toThrow();
        });
    });

    describe('invalid cases - empty cells array', () => {
        it('should throw error for empty cells array', () => {
            expect(() => HeaderRowZod.parse({ cells: [] })).toThrow(
                'Header rows must contain at least one cell'
            );
        });
    });

    describe('invalid cases - invalid cells type', () => {
        it('should throw error for string cells', () => {
            expect(() => HeaderRowZod.parse({ cells: 'invalid' })).toThrow();
        });

        it('should throw error for number cells', () => {
            expect(() => HeaderRowZod.parse({ cells: 123 })).toThrow();
        });

        it('should throw error for object cells (not array)', () => {
            expect(() => HeaderRowZod.parse({ cells: { content: 'ID' } })).toThrow();
        });
    });

    describe('invalid cases - non-object input', () => {
        it('should throw error for null value', () => {
            expect(() => HeaderRowZod.parse(null)).toThrow();
        });

        it('should throw error for undefined value', () => {
            expect(() => HeaderRowZod.parse(undefined)).toThrow();
        });

        it('should throw error for string value', () => {
            expect(() => HeaderRowZod.parse('row')).toThrow();
        });

        it('should throw error for number value', () => {
            expect(() => HeaderRowZod.parse(123)).toThrow();
        });

        it('should throw error for array value', () => {
            expect(() => HeaderRowZod.parse([{ content: 'ID' }])).toThrow();
        });
    });

    describe('safeParse behavior', () => {
        it('should return success for valid row', () => {
            const validRow = { cells: [{ content: 'ID' }] };
            const result = HeaderRowZod.safeParse(validRow);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(validRow);
            }
        });

        it('should return failure for invalid row', () => {
            const invalidRow = { cells: [] };
            const result = HeaderRowZod.safeParse(invalidRow);

            expect(result.success).toBe(false);
        });
    });
});
