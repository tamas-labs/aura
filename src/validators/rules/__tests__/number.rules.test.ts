import { describe, it, expect } from 'vitest';
import { numberRule } from '../number.rules';

describe('numberRule', () => {
    describe('valid number values', () => {
        it('should accept positive integers', () => {
            expect(numberRule(0)).toBe(true);
            expect(numberRule(1)).toBe(true);
            expect(numberRule(100)).toBe(true);
            expect(numberRule(999999)).toBe(true);
        });

        it('should accept negative integers', () => {
            expect(numberRule(-1)).toBe(true);
            expect(numberRule(-100)).toBe(true);
            expect(numberRule(-999999)).toBe(true);
        });

        it('should accept decimal numbers', () => {
            expect(numberRule(3.14)).toBe(true);
            expect(numberRule(-99.99)).toBe(true);
            expect(numberRule(0.1)).toBe(true);
            expect(numberRule(-0.1)).toBe(true);
        });

        it('should accept zero', () => {
            expect(numberRule(0)).toBe(true);
            expect(numberRule(-0)).toBe(true);
        });

        it('should accept max and min safe integers', () => {
            expect(numberRule(Number.MAX_SAFE_INTEGER)).toBe(true);
            expect(numberRule(Number.MIN_SAFE_INTEGER)).toBe(true);
        });

        it('should accept very small decimal numbers', () => {
            expect(numberRule(0.0000001)).toBe(true);
            expect(numberRule(Number.EPSILON)).toBe(true);
        });
    });

    describe('invalid special number values', () => {
        it('should reject NaN', () => {
            expect(numberRule(NaN)).toBe(false);
            expect(numberRule(parseInt('abc'))).toBe(false);
        });

        it('should reject Infinity', () => {
            expect(numberRule(Infinity)).toBe(false);
            expect(numberRule(-Infinity)).toBe(false);
            expect(numberRule(1 / 0)).toBe(false);
            expect(numberRule(-1 / 0)).toBe(false);
        });
    });

    describe('invalid non-number values', () => {
        it('should reject numeric strings', () => {
            expect(numberRule('123')).toBe(false);
            expect(numberRule('3.14')).toBe(false);
            expect(numberRule('0')).toBe(false);
            expect(numberRule('-1')).toBe(false);
        });

        it('should reject booleans', () => {
            expect(numberRule(true)).toBe(false);
            expect(numberRule(false)).toBe(false);
        });

        it('should reject null and undefined', () => {
            expect(numberRule(null)).toBe(false);
            expect(numberRule(undefined)).toBe(false);
        });

        it('should reject objects', () => {
            expect(numberRule({})).toBe(false);
            expect(numberRule({ value: 123 })).toBe(false);
        });

        it('should reject arrays', () => {
            expect(numberRule([])).toBe(false);
            expect(numberRule([1, 2, 3])).toBe(false);
        });

        it('should reject functions', () => {
            expect(numberRule(() => 123)).toBe(false);
            expect(numberRule(Math.random)).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle Number objects differently than primitives', () => {
            // numberRule checks for primitive number type, not Number objects
            // eslint-disable-next-line sonarjs/no-primitive-wrappers
            const numberObject = new Number(123);
            expect(numberRule(numberObject)).toBe(false);
        });

        it('should reject string representations of special values', () => {
            expect(numberRule('NaN')).toBe(false);
            expect(numberRule('Infinity')).toBe(false);
            expect(numberRule('-Infinity')).toBe(false);
        });
    });

    describe('type safety', () => {
        it('should accept unknown type parameter', () => {
            const unknownValue: unknown = 123;
            expect(() => numberRule(unknownValue)).not.toThrow();
        });

        it('should always return boolean', () => {
            expect(typeof numberRule(123)).toBe('boolean');
            expect(typeof numberRule('123')).toBe('boolean');
            expect(typeof numberRule(NaN)).toBe('boolean');
            expect(typeof numberRule(null)).toBe('boolean');
        });
    });
});
