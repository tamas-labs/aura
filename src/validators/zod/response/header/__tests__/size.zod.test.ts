import { describe, it, expect } from 'vitest';
import { SizeZod } from '../size.zod';

describe('SizeZod', () => {
    describe('valid inputs', () => {
        it('should accept "xs"', () => {
            expect(SizeZod.parse('xs')).toBe('xs');
        });

        it('should accept "sm"', () => {
            expect(SizeZod.parse('sm')).toBe('sm');
        });

        it('should accept "md"', () => {
            expect(SizeZod.parse('md')).toBe('md');
        });

        it('should accept "lg"', () => {
            expect(SizeZod.parse('lg')).toBe('lg');
        });

        it('should accept "xl"', () => {
            expect(SizeZod.parse('xl')).toBe('xl');
        });

        it('should accept null', () => {
            expect(SizeZod.parse(null)).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject invalid values', () => {
            expect(() => SizeZod.parse('small')).toThrow();
            expect(() => SizeZod.parse('large')).toThrow();
            expect(() => SizeZod.parse('')).toThrow();
            expect(() => SizeZod.parse(123)).toThrow();
        });
    });
});
