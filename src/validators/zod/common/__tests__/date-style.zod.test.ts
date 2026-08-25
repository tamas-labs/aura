import { describe, it, expect } from 'vitest';
import { DateStyleZod } from '../date-style.zod';

describe('DateStyleZod', () => {
    describe('valid inputs', () => {
        it('should accept "short"', () => {
            const result = DateStyleZod().parse('short');
            expect(result).toBe('short');
        });

        it('should accept "medium"', () => {
            const result = DateStyleZod().parse('medium');
            expect(result).toBe('medium');
        });

        it('should accept "long"', () => {
            const result = DateStyleZod().parse('long');
            expect(result).toBe('long');
        });

        it('should accept null value', () => {
            const result = DateStyleZod().parse(null);
            expect(result).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject moment.js format string', () => {
            expect(() => DateStyleZod().parse('YYYY.MM.DD. HH:mm')).toThrow();
        });

        it('should reject ISO format string', () => {
            expect(() => DateStyleZod().parse('YYYY-MM-DD')).toThrow();
        });

        it('should reject empty string', () => {
            expect(() => DateStyleZod().parse('')).toThrow();
        });

        it('should reject arbitrary string', () => {
            expect(() => DateStyleZod().parse('invalid')).toThrow();
        });

        it('should reject number value', () => {
            expect(() => DateStyleZod().parse(123)).toThrow();
        });

        it('should reject boolean value', () => {
            expect(() => DateStyleZod().parse(true)).toThrow();
        });

        it('should reject object value', () => {
            expect(() => DateStyleZod().parse({})).toThrow();
        });

        it('should reject array value', () => {
            expect(() => DateStyleZod().parse(['short'])).toThrow();
        });

        it('should reject undefined value', () => {
            expect(() => DateStyleZod().parse(undefined)).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should be case-sensitive - reject uppercase SHORT', () => {
            expect(() => DateStyleZod().parse('SHORT')).toThrow();
        });

        it('should be case-sensitive - reject mixed case Short', () => {
            expect(() => DateStyleZod().parse('Short')).toThrow();
        });

        it('should reject value with extra whitespace', () => {
            expect(() => DateStyleZod().parse(' short ')).toThrow();
        });

        it('should reject similar but invalid strings', () => {
            expect(() => DateStyleZod().parse('shorter')).toThrow();
            expect(() => DateStyleZod().parse('med')).toThrow();
            expect(() => DateStyleZod().parse('longer')).toThrow();
        });
    });
});
