import { describe, it, expect } from 'vitest';
import { HeightZod } from '../height.zod';

describe('HeightZod', () => {
    describe('valid inputs - px unit', () => {
        it('should accept pixel value "100px"', () => {
            const result = HeightZod.parse('100px');
            expect(result).toBe('100px');
        });

        it('should accept pixel with decimal "50.5px"', () => {
            const result = HeightZod.parse('50.5px');
            expect(result).toBe('50.5px');
        });

        it('should accept large pixel value "9999px"', () => {
            const result = HeightZod.parse('9999px');
            expect(result).toBe('9999px');
        });
    });

    describe('valid inputs - % unit', () => {
        it('should accept percentage "50%"', () => {
            const result = HeightZod.parse('50%');
            expect(result).toBe('50%');
        });

        it('should accept percentage "100%"', () => {
            const result = HeightZod.parse('100%');
            expect(result).toBe('100%');
        });
    });

    describe('valid inputs - rem unit', () => {
        it('should accept rem value "2.5rem"', () => {
            const result = HeightZod.parse('2.5rem');
            expect(result).toBe('2.5rem');
        });

        it('should accept rem value "10rem"', () => {
            const result = HeightZod.parse('10rem');
            expect(result).toBe('10rem');
        });
    });

    describe('valid inputs - auto', () => {
        it('should accept "auto"', () => {
            const result = HeightZod.parse('auto');
            expect(result).toBe('auto');
        });
    });

    describe('valid inputs - nullable', () => {
        it('should accept null', () => {
            const result = HeightZod.parse(null);
            expect(result).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject missing unit "100"', () => {
            expect(() => HeightZod.parse('100')).toThrow();
        });

        it('should reject invalid unit "px100"', () => {
            expect(() => HeightZod.parse('px100')).toThrow();
        });

        it('should reject invalid string "abc"', () => {
            expect(() => HeightZod.parse('abc')).toThrow();
        });

        it('should reject empty string', () => {
            expect(() => HeightZod.parse('')).toThrow();
        });

        it('should reject non-string types', () => {
            expect(() => HeightZod.parse(123)).toThrow();
            expect(() => HeightZod.parse({})).toThrow();
            expect(() => HeightZod.parse([])).toThrow();
        });
    });
});
