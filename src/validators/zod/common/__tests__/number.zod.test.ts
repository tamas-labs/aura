import { describe, it, expect } from 'vitest';
import { NumberZod } from '../../common/number.zod';

describe('NumberZod', () => {
    describe('valid inputs', () => {
        it('should parse valid number within range', () => {
            const result = NumberZod.parse(50);
            expect(result).toBe(50);
        });

        it('should parse minimum valid value (1)', () => {
            const result = NumberZod.parse(1);
            expect(result).toBe(1);
        });

        it('should parse maximum valid value (1000)', () => {
            const result = NumberZod.parse(1000);
            expect(result).toBe(1000);
        });

        it('should accept null', () => {
            const result = NumberZod.parse(null);
            expect(result).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should throw error for number below minimum (0)', () => {
            expect(() => NumberZod.parse(0)).toThrow();
        });

        it('should throw error for negative numbers', () => {
            expect(() => NumberZod.parse(-10)).toThrow();
        });

        it('should throw error for number above maximum (1001)', () => {
            expect(() => NumberZod.parse(1001)).toThrow();
        });

        it('should throw error for string value', () => {
            expect(() => NumberZod.parse('100' as unknown)).toThrow();
        });

        it('should throw error for boolean value', () => {
            expect(() => NumberZod.parse(true as unknown)).toThrow();
        });

        it('should throw error for object value', () => {
            expect(() => NumberZod.parse({} as unknown)).toThrow();
        });

        it('should throw error for array value', () => {
            expect(() => NumberZod.parse([] as unknown)).toThrow();
        });

        it('should throw error for undefined', () => {
            expect(() => NumberZod.parse(undefined)).toThrow();
        });

        it('should throw error for NaN', () => {
            expect(() => NumberZod.parse(NaN)).toThrow();
        });

        it('should throw error for Infinity', () => {
            expect(() => NumberZod.parse(Infinity)).toThrow();
        });
    });

    describe('safeParse method', () => {
        it('should return success for valid input', () => {
            const result = NumberZod.safeParse(100);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe(100);
            }
        });

        it('should return error for invalid input', () => {
            const result = NumberZod.safeParse(2000);
            expect(result.success).toBe(false);
        });

        it('should return success for null', () => {
            const result = NumberZod.safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeNull();
            }
        });
    });
});
