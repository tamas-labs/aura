import { describe, it, expect } from 'vitest';
import { PaginateValuesZod } from '../../config/paginate-values.zod';

describe('PaginateValuesZod', () => {
    describe('valid inputs', () => {
        it('should parse valid array of numbers', () => {
            const result = PaginateValuesZod.parse([10, 20, 30]);
            expect(result).toEqual([10, 20, 30]);
        });

        it('should parse array with single valid number', () => {
            const result = PaginateValuesZod.parse([50]);
            expect(result).toEqual([50]);
        });

        it('should parse array with numbers at boundaries (1 and 1000)', () => {
            const result = PaginateValuesZod.parse([1, 1000]);
            expect(result).toEqual([1, 1000]);
        });

        it('should accept null', () => {
            const result = PaginateValuesZod.parse(null);
            expect(result).toBeNull();
        });

        it('should accept empty array', () => {
            const result = PaginateValuesZod.parse([]);
            expect(result).toEqual([]);
        });
    });

    describe('invalid inputs', () => {
        it('should throw error for array with number below minimum (0)', () => {
            expect(() => PaginateValuesZod.parse([0, 10, 20])).toThrow();
        });

        it('should throw error for array with negative numbers', () => {
            expect(() => PaginateValuesZod.parse([10, -5, 20])).toThrow();
        });

        it('should throw error for array with number above maximum (1001)', () => {
            expect(() => PaginateValuesZod.parse([10, 1001])).toThrow();
        });

        it('should throw error for array containing strings', () => {
            expect(() => PaginateValuesZod.parse(['10', '20'] as unknown)).toThrow();
        });

        it('should throw error for array containing mixed types', () => {
            expect(() => PaginateValuesZod.parse([10, '20', 30] as unknown)).toThrow();
        });

        it('should throw error for array containing null elements', () => {
            expect(() => PaginateValuesZod.parse([10, null, 30] as unknown)).toThrow();
        });

        it('should throw error for non-array value (number)', () => {
            expect(() => PaginateValuesZod.parse(100 as unknown)).toThrow();
        });

        it('should throw error for non-array value (string)', () => {
            expect(() => PaginateValuesZod.parse('10,20,30' as unknown)).toThrow();
        });

        it('should throw error for non-array value (object)', () => {
            expect(() => PaginateValuesZod.parse({} as unknown)).toThrow();
        });

        it('should throw error for undefined', () => {
            expect(() => PaginateValuesZod.parse(undefined)).toThrow();
        });
    });

    describe('safeParse method', () => {
        it('should return success for valid input', () => {
            const result = PaginateValuesZod.safeParse([10, 25, 50]);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual([10, 25, 50]);
            }
        });

        it('should return error for invalid input', () => {
            const result = PaginateValuesZod.safeParse([10, 2000]);
            expect(result.success).toBe(false);
        });

        it('should return success for null', () => {
            const result = PaginateValuesZod.safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeNull();
            }
        });

        it('should return success for empty array', () => {
            const result = PaginateValuesZod.safeParse([]);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual([]);
            }
        });
    });
});
