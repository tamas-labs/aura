import { describe, it, expect } from 'vitest';
import { ColorZod } from '../color.zod';

describe('ColorZod', () => {
    describe('valid inputs', () => {
        it('should accept Bootstrap colors', () => {
            expect(ColorZod.parse('primary')).toBe('primary');
            expect(ColorZod.parse('success')).toBe('success');
            expect(ColorZod.parse('danger')).toBe('danger');
            expect(ColorZod.parse('warning')).toBe('warning');
            expect(ColorZod.parse('info')).toBe('info');
        });

        it('should accept CSS hex colors', () => {
            expect(ColorZod.parse('#fff')).toBe('#fff');
            expect(ColorZod.parse('#ffffff')).toBe('#ffffff');
            expect(ColorZod.parse('#FF0000')).toBe('#FF0000');
            expect(ColorZod.parse('#ABC')).toBe('#ABC');
        });

        it('should accept CSS rgb/rgba colors', () => {
            expect(ColorZod.parse('rgb(255, 240, 0)')).toBe('rgb(255, 240, 0)');
            expect(ColorZod.parse('rgba(255,255,255,0.5)')).toBe('rgba(255,255,255,0.5)');
            expect(ColorZod.parse('rgb(0,0,0)')).toBe('rgb(0,0,0)');
        });

        it('should accept CSS color names', () => {
            expect(ColorZod.parse('red')).toBe('red');
            expect(ColorZod.parse('blue')).toBe('blue');
            expect(ColorZod.parse('yellow')).toBe('yellow');
            expect(ColorZod.parse('DeepSkyBlue')).toBe('DeepSkyBlue');
        });

        it('should accept null', () => {
            expect(ColorZod.parse(null)).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject invalid values', () => {
            expect(() => ColorZod.parse('#ff')).toThrow(); // Too short hex
            expect(() => ColorZod.parse('#fffffff')).toThrow(); // Too long hex
            expect(() => ColorZod.parse('rgb(a,b,c)')).toThrow(); // Invalid rgb
            expect(() => ColorZod.parse('123')).toThrow(); // Number as string matching nothing
            expect(() => ColorZod.parse('')).toThrow();
        });
    });
});
