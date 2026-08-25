import { describe, it, expect } from 'vitest';
import { ShowZod } from '../show.zod';

describe('ShowZod', () => {
    describe('valid inputs', () => {
        it('should accept true', () => {
            expect(ShowZod.parse(true)).toBe(true);
        });

        it('should accept false (hidden column)', () => {
            expect(ShowZod.parse(false)).toBe(false);
        });

        it('should accept null (visible)', () => {
            expect(ShowZod.parse(null)).toBeNull();
        });
    });

    describe('default behaviour (opt-out semantics)', () => {
        it('should default to true when undefined', () => {
            // This is the key difference from BooleanZod (which defaults to false):
            // a missing show means a visible column.
            expect(ShowZod.parse(undefined)).toBe(true);
        });
    });

    describe('invalid inputs', () => {
        it('should reject a string', () => {
            expect(() => ShowZod.parse('true')).toThrow();
        });

        it('should reject a number', () => {
            expect(() => ShowZod.parse(1)).toThrow();
        });
    });
});
