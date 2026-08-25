import { describe, it, expect } from 'vitest';
import { RowspanZod } from '../rowspan.zod';

describe('RowspanZod', () => {
    describe('valid inputs', () => {
        it('should accept minimum value (1)', () => {
            const result = RowspanZod.parse(1);
            expect(result).toBe(1);
        });

        it('should accept valid rowspan value', () => {
            const result = RowspanZod.parse(3);
            expect(result).toBe(3);
        });

        it('should accept maximum value (20)', () => {
            const result = RowspanZod.parse(20);
            expect(result).toBe(20);
        });

        it('should accept null value', () => {
            const result = RowspanZod.parse(null);
            expect(result).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject value below minimum (0)', () => {
            expect(() => RowspanZod.parse(0)).toThrow();
        });

        it('should reject negative value', () => {
            expect(() => RowspanZod.parse(-1)).toThrow();
        });

        it('should reject value above maximum (21)', () => {
            expect(() => RowspanZod.parse(21)).toThrow();
        });

        it('should reject decimal number', () => {
            expect(() => RowspanZod.parse(1.5)).toThrow();
        });

        it('should reject string value', () => {
            expect(() => RowspanZod.parse('3')).toThrow();
        });

        it('should reject boolean value', () => {
            expect(() => RowspanZod.parse(false)).toThrow();
        });

        it('should reject object value', () => {
            expect(() => RowspanZod.parse({})).toThrow();
        });

        it('should reject array value', () => {
            expect(() => RowspanZod.parse([3])).toThrow();
        });

        it('should reject undefined value', () => {
            expect(() => RowspanZod.parse(undefined)).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should validate with safeParse for valid value', () => {
            const result = RowspanZod.safeParse(5);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe(5);
            }
        });

        it('should validate with safeParse for invalid value', () => {
            const result = RowspanZod.safeParse(50);
            expect(result.success).toBe(false);
        });

        it('should validate with safeParse for null', () => {
            const result = RowspanZod.safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeNull();
            }
        });

        it('should handle boundary value at min (1)', () => {
            const result = RowspanZod.parse(1);
            expect(result).toBe(1);
        });

        it('should handle boundary value at max (20)', () => {
            const result = RowspanZod.parse(20);
            expect(result).toBe(20);
        });
    });
});
