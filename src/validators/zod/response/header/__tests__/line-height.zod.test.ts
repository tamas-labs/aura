import { describe, it, expect } from 'vitest';
import { LineHeightZod } from '../line-height.zod';

describe('LineHeightZod', () => {
    describe('valid inputs', () => {
        it('should accept unitless numbers (string or number)', () => {
            expect(LineHeightZod.parse('1.5')).toBe('1.5');
            expect(LineHeightZod.parse('1')).toBe('1');
            expect(LineHeightZod.parse(1.5)).toBe(1.5);
            expect(LineHeightZod.parse(2)).toBe(2);
        });

        it('should accept values with units', () => {
            expect(LineHeightZod.parse('20px')).toBe('20px');
            expect(LineHeightZod.parse('1.5em')).toBe('1.5em');
            expect(LineHeightZod.parse('150%')).toBe('150%');
            expect(LineHeightZod.parse('2rem')).toBe('2rem');
        });

        it('should accept "normal" keyword', () => {
            expect(LineHeightZod.parse('normal')).toBe('normal');
        });

        it('should accept null', () => {
            expect(LineHeightZod.parse(null)).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject invalid values', () => {
            expect(() => LineHeightZod.parse(-1)).toThrow(); // Negative number
            expect(() => LineHeightZod.parse('abc')).toThrow();
            expect(() => LineHeightZod.parse('')).toThrow();
        });
    });
});
