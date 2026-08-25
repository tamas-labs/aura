import { describe, it, expect } from 'vitest';
import { FontSizeZod } from '../font-size.zod';

describe('FontSizeZod', () => {
    describe('valid inputs', () => {
        it('should accept valid CSS units', () => {
            expect(FontSizeZod.parse('12px')).toBe('12px');
            expect(FontSizeZod.parse('1.5rem')).toBe('1.5rem');
            expect(FontSizeZod.parse('100%')).toBe('100%');
            expect(FontSizeZod.parse('1em')).toBe('1em');
            expect(FontSizeZod.parse('12.5px')).toBe('12.5px');
        });

        it('should accept valid CSS keywords', () => {
            expect(FontSizeZod.parse('small')).toBe('small');
            expect(FontSizeZod.parse('medium')).toBe('medium');
            expect(FontSizeZod.parse('large')).toBe('large');
            expect(FontSizeZod.parse('x-small')).toBe('x-small');
            expect(FontSizeZod.parse('xx-large')).toBe('xx-large');
            expect(FontSizeZod.parse('smaller')).toBe('smaller');
            expect(FontSizeZod.parse('larger')).toBe('larger');
        });

        it('should accept null', () => {
            expect(FontSizeZod.parse(null)).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject invalid values', () => {
            expect(() => FontSizeZod.parse('12')).toThrow(); // Missing unit
            expect(() => FontSizeZod.parse('px')).toThrow(); // Missing number
            expect(() => FontSizeZod.parse('huge')).toThrow(); // Invalid keyword
            expect(() => FontSizeZod.parse('')).toThrow();
        });
    });
});
