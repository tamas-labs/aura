import { describe, it, expect } from 'vitest';
import { PadZod } from '../pad.zod';

describe('PadZod', () => {
    describe('valid inputs', () => {
        it('should accept minimum value (0)', () => {
            const result = PadZod.parse(0);
            expect(result).toBe(0);
        });

        it('should accept valid pad value', () => {
            const result = PadZod.parse(10);
            expect(result).toBe(10);
        });

        it('should accept maximum value (100)', () => {
            const result = PadZod.parse(100);
            expect(result).toBe(100);
        });

        it('should accept null value', () => {
            const result = PadZod.parse(null);
            expect(result).toBeNull();
        });

        it('should accept mid-range value', () => {
            const result = PadZod.parse(50);
            expect(result).toBe(50);
        });
    });

    describe('invalid inputs', () => {
        it('should reject negative value', () => {
            expect(() => PadZod.parse(-1)).toThrow();
        });

        it('should reject value above maximum (101)', () => {
            expect(() => PadZod.parse(101)).toThrow();
        });

        it('should reject decimal number', () => {
            expect(() => PadZod.parse(5.5)).toThrow();
        });

        it('should reject string value', () => {
            expect(() => PadZod.parse('10')).toThrow();
        });

        it('should reject boolean value', () => {
            expect(() => PadZod.parse(true)).toThrow();
        });

        it('should reject object value', () => {
            expect(() => PadZod.parse({})).toThrow();
        });

        it('should reject array value', () => {
            expect(() => PadZod.parse([10])).toThrow();
        });

        it('should reject undefined value', () => {
            expect(() => PadZod.parse(undefined)).toThrow();
        });

        it('should reject large negative value', () => {
            expect(() => PadZod.parse(-100)).toThrow();
        });

        it('should reject very large value', () => {
            expect(() => PadZod.parse(1000)).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should validate with safeParse for valid value', () => {
            const result = PadZod.safeParse(25);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe(25);
            }
        });

        it('should validate with safeParse for invalid value', () => {
            const result = PadZod.safeParse(200);
            expect(result.success).toBe(false);
        });

        it('should validate with safeParse for null', () => {
            const result = PadZod.safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeNull();
            }
        });

        it('should handle boundary value at min (0)', () => {
            const result = PadZod.parse(0);
            expect(result).toBe(0);
        });

        it('should handle boundary value at max (100)', () => {
            const result = PadZod.parse(100);
            expect(result).toBe(100);
        });

        it('should reject boundary minus one (-1)', () => {
            expect(() => PadZod.parse(-1)).toThrow();
        });

        it('should reject boundary plus one (101)', () => {
            expect(() => PadZod.parse(101)).toThrow();
        });
    });
});
