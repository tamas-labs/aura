import { describe, it, expect } from 'vitest';
import { booleanRule } from '../boolean.rules';

describe('booleanRule', () => {
    describe('valid boolean values', () => {
        it('should accept true', () => {
            expect(booleanRule(true)).toBe(true);
        });

        it('should accept false', () => {
            expect(booleanRule(false)).toBe(true);
        });
    });

    describe('invalid truthy/falsy values', () => {
        it('should reject numeric truthy/falsy values', () => {
            expect(booleanRule(1)).toBe(false);
            expect(booleanRule(0)).toBe(false);
            expect(booleanRule(-1)).toBe(false);
            expect(booleanRule(999)).toBe(false);
        });

        it('should reject string truthy/falsy values', () => {
            expect(booleanRule('true')).toBe(false);
            expect(booleanRule('false')).toBe(false);
            expect(booleanRule('yes')).toBe(false);
            expect(booleanRule('no')).toBe(false);
            expect(booleanRule('')).toBe(false);
            expect(booleanRule('1')).toBe(false);
            expect(booleanRule('0')).toBe(false);
        });

        it('should reject null and undefined', () => {
            expect(booleanRule(null)).toBe(false);
            expect(booleanRule(undefined)).toBe(false);
        });
    });

    describe('invalid object and array values', () => {
        it('should reject objects', () => {
            expect(booleanRule({})).toBe(false);
            expect(booleanRule({ value: true })).toBe(false);
        });

        it('should reject arrays', () => {
            expect(booleanRule([])).toBe(false);
            expect(booleanRule([true])).toBe(false);
            expect(booleanRule([false])).toBe(false);
            expect(booleanRule([true, false])).toBe(false);
        });

        it('should reject functions', () => {
            expect(booleanRule(() => true)).toBe(false);
            expect(booleanRule(Boolean)).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should reject Boolean objects (not primitives)', () => {
            // eslint-disable-next-line sonarjs/no-primitive-wrappers
            const booleanObject = new Boolean(true);
            expect(booleanRule(booleanObject)).toBe(false);
        });

        it('should reject special numeric values', () => {
            expect(booleanRule(NaN)).toBe(false);
            expect(booleanRule(Infinity)).toBe(false);
            expect(booleanRule(-Infinity)).toBe(false);
        });

        it('should reject symbols', () => {
            expect(booleanRule(Symbol('test'))).toBe(false);
        });
    });

    describe('type safety', () => {
        it('should accept unknown type parameter', () => {
            const unknownValue: unknown = true;
            expect(() => booleanRule(unknownValue)).not.toThrow();
        });

        it('should always return boolean', () => {
            expect(typeof booleanRule(true)).toBe('boolean');
            expect(typeof booleanRule(false)).toBe('boolean');
            expect(typeof booleanRule(1)).toBe('boolean');
            expect(typeof booleanRule('true')).toBe('boolean');
            expect(typeof booleanRule(null)).toBe('boolean');
        });
    });
});
