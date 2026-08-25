import { describe, it, expect } from 'vitest';
import { WidthZod } from '../width.zod';

describe('WidthZod', () => {
    describe('valid inputs - px unit', () => {
        it('should accept pixel value "100px"', () => {
            const result = WidthZod.parse('100px');
            expect(result).toBe('100px');
        });

        it('should accept pixel with decimal "50.5px"', () => {
            const result = WidthZod.parse('50.5px');
            expect(result).toBe('50.5px');
        });

        it('should accept zero pixel "0px"', () => {
            const result = WidthZod.parse('0px');
            expect(result).toBe('0px');
        });

        it('should accept large pixel value "9999px"', () => {
            const result = WidthZod.parse('9999px');
            expect(result).toBe('9999px');
        });
    });

    describe('valid inputs - % unit', () => {
        it('should accept percentage "50%"', () => {
            const result = WidthZod.parse('50%');
            expect(result).toBe('50%');
        });

        it('should accept percentage "100%"', () => {
            const result = WidthZod.parse('100%');
            expect(result).toBe('100%');
        });

        it('should accept decimal percentage "33.33%"', () => {
            const result = WidthZod.parse('33.33%');
            expect(result).toBe('33.33%');
        });

        it('should accept zero percentage "0%"', () => {
            const result = WidthZod.parse('0%');
            expect(result).toBe('0%');
        });
    });

    describe('valid inputs - rem unit', () => {
        it('should accept rem value "2rem"', () => {
            const result = WidthZod.parse('2rem');
            expect(result).toBe('2rem');
        });

        it('should accept decimal rem "2.5rem"', () => {
            const result = WidthZod.parse('2.5rem');
            expect(result).toBe('2.5rem');
        });

        it('should accept large rem "10rem"', () => {
            const result = WidthZod.parse('10rem');
            expect(result).toBe('10rem');
        });

        it('should accept zero rem "0rem"', () => {
            const result = WidthZod.parse('0rem');
            expect(result).toBe('0rem');
        });
    });

    describe('valid inputs - auto', () => {
        it('should accept "auto" keyword', () => {
            const result = WidthZod.parse('auto');
            expect(result).toBe('auto');
        });
    });

    describe('valid inputs - null', () => {
        it('should accept null value', () => {
            const result = WidthZod.parse(null);
            expect(result).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject number without unit', () => {
            expect(() => WidthZod.parse('100')).toThrow();
        });

        it('should reject unit without number', () => {
            expect(() => WidthZod.parse('px')).toThrow();
        });

        it('should reject invalid unit "100pt"', () => {
            expect(() => WidthZod.parse('100pt')).toThrow();
        });

        it('should reject invalid unit "50em"', () => {
            expect(() => WidthZod.parse('50em')).toThrow();
        });

        it('should reject space between number and unit', () => {
            expect(() => WidthZod.parse('100 px')).toThrow();
        });

        it('should reject number type', () => {
            expect(() => WidthZod.parse(100)).toThrow();
        });

        it('should reject boolean value', () => {
            expect(() => WidthZod.parse(true)).toThrow();
        });

        it('should reject object value', () => {
            expect(() => WidthZod.parse({})).toThrow();
        });

        it('should reject array value', () => {
            expect(() => WidthZod.parse(['100px'])).toThrow();
        });

        it('should reject undefined value', () => {
            expect(() => WidthZod.parse(undefined)).toThrow();
        });

        it('should reject empty string', () => {
            expect(() => WidthZod.parse('')).toThrow();
        });

        it('should reject invalid keyword "inherit"', () => {
            expect(() => WidthZod.parse('inherit')).toThrow();
        });

        it('should reject negative value "-100px"', () => {
            expect(() => WidthZod.parse('-100px')).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should validate with safeParse for valid value', () => {
            const result = WidthZod.safeParse('100px');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('100px');
            }
        });

        it('should validate with safeParse for invalid value', () => {
            const result = WidthZod.safeParse('invalid');
            expect(result.success).toBe(false);
        });

        it('should validate with safeParse for null', () => {
            const result = WidthZod.safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeNull();
            }
        });

        it('should accept very precise decimal "0.123456px"', () => {
            const result = WidthZod.parse('0.123456px');
            expect(result).toBe('0.123456px');
        });

        it('should accept single digit decimal "1.5%"', () => {
            const result = WidthZod.parse('1.5%');
            expect(result).toBe('1.5%');
        });
    });
});
