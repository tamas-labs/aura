import { describe, it, expect } from 'vitest';
import { StaticUnitZod } from '../static-unit.zod';

describe('StaticUnitZod', () => {
    describe('valid inputs', () => {
        it('should accept "percent"', () => {
            expect(StaticUnitZod.parse('percent')).toBe('percent');
        });

        it('should accept "GB"', () => {
            expect(StaticUnitZod.parse('GB')).toBe('GB');
        });

        it('should accept "°C"', () => {
            expect(StaticUnitZod.parse('°C')).toBe('°C');
        });

        it('should accept "km/h"', () => {
            expect(StaticUnitZod.parse('km/h')).toBe('km/h');
        });

        it('should accept "kg"', () => {
            expect(StaticUnitZod.parse('kg')).toBe('kg');
        });

        it('should accept single character unit', () => {
            expect(StaticUnitZod.parse('%')).toBe('%');
        });

        it('should accept unit at max length (50 chars)', () => {
            const maxUnit = 'a'.repeat(50);
            const result = StaticUnitZod.parse(maxUnit);
            expect(result).toHaveLength(50);
        });

        it('should accept null', () => {
            expect(StaticUnitZod.parse(null)).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject empty string', () => {
            expect(() => StaticUnitZod.parse('')).toThrow(/cannot be empty/i);
        });

        it('should reject string exceeding max length (51 chars)', () => {
            const tooLong = 'a'.repeat(51);
            expect(() => StaticUnitZod.parse(tooLong)).toThrow(/too long/i);
        });

        it('should reject number', () => {
            expect(() => StaticUnitZod.parse(42)).toThrow();
        });

        it('should reject boolean', () => {
            expect(() => StaticUnitZod.parse(true)).toThrow();
        });

        it('should reject undefined', () => {
            expect(() => StaticUnitZod.parse(undefined)).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should sanitize XSS content', () => {
            const result = StaticUnitZod.parse('<script>alert("xss")</script>');
            expect(result).not.toContain('<script>');
        });

        it('should sanitize HTML tags', () => {
            const result = StaticUnitZod.parse('<b>kg</b>');
            expect(result).not.toContain('<b>');
        });
    });
});
