import { describe, it, expect } from 'vitest';
import { ColspanZod } from '../colspan.zod';

describe('ColspanZod', () => {
    describe('valid inputs', () => {
        it('should accept minimum value (1)', () => {
            const result = ColspanZod.parse(1);
            expect(result).toBe(1);
        });

        it('should accept valid colspan value', () => {
            const result = ColspanZod.parse(5);
            expect(result).toBe(5);
        });

        it('should accept maximum value (50)', () => {
            const result = ColspanZod.parse(50);
            expect(result).toBe(50);
        });

        it('should accept null value', () => {
            const result = ColspanZod.parse(null);
            expect(result).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject value below minimum (0)', () => {
            expect(() => ColspanZod.parse(0)).toThrow();
        });

        it('should reject negative value', () => {
            expect(() => ColspanZod.parse(-1)).toThrow();
        });

        it('should reject value above maximum (51)', () => {
            expect(() => ColspanZod.parse(51)).toThrow();
        });

        it('should reject decimal number', () => {
            expect(() => ColspanZod.parse(2.5)).toThrow();
        });

        it('should reject string value', () => {
            expect(() => ColspanZod.parse('5')).toThrow();
        });

        it('should reject boolean value', () => {
            expect(() => ColspanZod.parse(true)).toThrow();
        });

        it('should reject object value', () => {
            expect(() => ColspanZod.parse({})).toThrow();
        });

        it('should reject array value', () => {
            expect(() => ColspanZod.parse([5])).toThrow();
        });

        it('should reject undefined value', () => {
            expect(() => ColspanZod.parse(undefined)).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should validate with safeParse for valid value', () => {
            const result = ColspanZod.safeParse(10);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe(10);
            }
        });

        it('should validate with safeParse for invalid value', () => {
            const result = ColspanZod.safeParse(100);
            expect(result.success).toBe(false);
        });

        it('should validate with safeParse for null', () => {
            const result = ColspanZod.safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeNull();
            }
        });

        it('should handle boundary value at min (1)', () => {
            const result = ColspanZod.parse(1);
            expect(result).toBe(1);
        });

        it('should handle boundary value at max (50)', () => {
            const result = ColspanZod.parse(50);
            expect(result).toBe(50);
        });
    });
});
