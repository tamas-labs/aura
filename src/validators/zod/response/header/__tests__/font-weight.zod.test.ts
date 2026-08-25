import { describe, it, expect } from 'vitest';
import { FontWeightZod } from '../font-weight.zod';

describe('FontWeightZod', () => {
    describe('valid inputs', () => {
        it('should accept valid numeric weights', () => {
            expect(FontWeightZod.parse(100)).toBe(100);
            expect(FontWeightZod.parse(400)).toBe(400);
            expect(FontWeightZod.parse(700)).toBe(700);
            expect(FontWeightZod.parse(900)).toBe(900);
        });

        it('should accept valid string numeric weights', () => {
            expect(FontWeightZod.parse('100')).toBe('100');
            expect(FontWeightZod.parse('400')).toBe('400');
            expect(FontWeightZod.parse('900')).toBe('900');
        });

        it('should accept valid keywords', () => {
            expect(FontWeightZod.parse('normal')).toBe('normal');
            expect(FontWeightZod.parse('bold')).toBe('bold');
            expect(FontWeightZod.parse('lighter')).toBe('lighter');
            expect(FontWeightZod.parse('bolder')).toBe('bolder');
        });

        it('should accept null', () => {
            expect(FontWeightZod.parse(null)).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject invalid numeric values', () => {
            expect(() => FontWeightZod.parse(50)).toThrow(); // Too small
            expect(() => FontWeightZod.parse(1000)).toThrow(); // Too large
            expect(() => FontWeightZod.parse(150)).toThrow(); // Not multiple of 100
        });

        it('should reject invalid string values', () => {
            expect(() => FontWeightZod.parse('heavy')).toThrow();
            expect(() => FontWeightZod.parse('150')).toThrow();
            expect(() => FontWeightZod.parse('')).toThrow();
        });
    });
});
