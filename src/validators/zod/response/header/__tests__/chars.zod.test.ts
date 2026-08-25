import { describe, it, expect } from 'vitest';
import { CharsZod } from '../chars.zod';

describe('CharsZod', () => {
    describe('valid inputs', () => {
        it('should accept single character "0"', () => {
            const result = CharsZod.parse('0');
            expect(result).toBe('0');
        });

        it('should accept single character "."', () => {
            const result = CharsZod.parse('.');
            expect(result).toBe('.');
        });

        it('should accept single character "-"', () => {
            const result = CharsZod.parse('-');
            expect(result).toBe('-');
        });

        it('should accept multiple characters "--"', () => {
            const result = CharsZod.parse('--');
            expect(result).toBe('--');
        });

        it('should accept space character', () => {
            const result = CharsZod.parse(' ');
            expect(result).toBe(' ');
        });

        it('should accept maximum length (10 characters)', () => {
            const result = CharsZod.parse('0123456789');
            expect(result).toBe('0123456789');
        });

        it('should accept null value', () => {
            const result = CharsZod.parse(null);
            expect(result).toBeNull();
        });

        it('should accept special characters', () => {
            const result = CharsZod.parse('*#@');
            expect(result).toBe('*#@');
        });

        it('should accept unicode characters', () => {
            const result = CharsZod.parse('•');
            expect(result).toBe('•');
        });
    });

    describe('invalid inputs', () => {
        it('should reject empty string', () => {
            expect(() => CharsZod.parse('')).toThrow();
        });

        it('should reject string exceeding maximum length (11 characters)', () => {
            expect(() => CharsZod.parse('01234567890')).toThrow();
        });

        it('should reject number value', () => {
            expect(() => CharsZod.parse(0)).toThrow();
        });

        it('should reject boolean value', () => {
            expect(() => CharsZod.parse(true)).toThrow();
        });

        it('should reject object value', () => {
            expect(() => CharsZod.parse({})).toThrow();
        });

        it('should reject array value', () => {
            expect(() => CharsZod.parse(['0'])).toThrow();
        });

        it('should reject undefined value', () => {
            expect(() => CharsZod.parse(undefined)).toThrow();
        });

        it('should reject very long string', () => {
            expect(() => CharsZod.parse('a'.repeat(100))).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should validate with safeParse for valid value', () => {
            const result = CharsZod.safeParse('.');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('.');
            }
        });

        it('should validate with safeParse for invalid value', () => {
            const result = CharsZod.safeParse('');
            expect(result.success).toBe(false);
        });

        it('should validate with safeParse for null', () => {
            const result = CharsZod.safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeNull();
            }
        });

        it('should handle boundary at min length (1)', () => {
            const result = CharsZod.parse('a');
            expect(result).toBe('a');
        });

        it('should handle boundary at max length (10)', () => {
            const result = CharsZod.parse('abcdefghij');
            expect(result).toBe('abcdefghij');
        });

        it('should reject boundary plus one (11 characters)', () => {
            expect(() => CharsZod.parse('abcdefghijk')).toThrow();
        });

        it('should accept newline character', () => {
            const result = CharsZod.parse('\n');
            expect(result).toBe('\n');
        });

        it('should accept tab character', () => {
            const result = CharsZod.parse('\t');
            expect(result).toBe('\t');
        });
    });
});
