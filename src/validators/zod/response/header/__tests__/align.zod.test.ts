import { describe, it, expect } from 'vitest';
import { AlignZod } from '../align.zod';

describe('AlignZod', () => {
    describe('valid inputs', () => {
        it('should accept "start"', () => {
            expect(AlignZod.parse('start')).toBe('start');
        });

        it('should accept "center"', () => {
            expect(AlignZod.parse('center')).toBe('center');
        });

        it('should accept "end"', () => {
            expect(AlignZod.parse('end')).toBe('end');
        });

        it('should accept null', () => {
            expect(AlignZod.parse(null)).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject invalid values', () => {
            expect(() => AlignZod.parse('left')).toThrow();
            expect(() => AlignZod.parse('right')).toThrow();
            expect(() => AlignZod.parse('')).toThrow();
            expect(() => AlignZod.parse(123)).toThrow();
        });
    });
});
