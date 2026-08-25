import { describe, it, expect } from 'vitest';
import { arrayRule } from '../array.rules';

describe('arrayRule', () => {
    describe('valid array values', () => {
        it('should accept empty array', () => {
            expect(arrayRule([])).toBe(true);
        });

        it('should accept arrays with primitive values', () => {
            expect(arrayRule([1, 2, 3])).toBe(true);
            expect(arrayRule(['a', 'b', 'c'])).toBe(true);
            expect(arrayRule([true, false])).toBe(true);
        });

        it('should accept arrays with null and undefined', () => {
            expect(arrayRule([null])).toBe(true);
            expect(arrayRule([undefined])).toBe(true);
            expect(arrayRule([null, undefined])).toBe(true);
        });

        it('should accept arrays with objects', () => {
            expect(arrayRule([{}])).toBe(true);
            expect(arrayRule([{ a: 1 }, { b: 2 }])).toBe(true);
        });

        it('should accept nested arrays', () => {
            expect(
                arrayRule([
                    [1, 2],
                    [3, 4],
                ])
            ).toBe(true);
            expect(arrayRule([[], []])).toBe(true);
        });

        it('should accept very long arrays', () => {
            const longArray = Array.from({ length: 1000 }, (_, i) => i);
            expect(arrayRule(longArray)).toBe(true);
        });

        it('should accept arrays with mixed types', () => {
            expect(arrayRule([1, 'two', true, null, { four: 4 }])).toBe(true);
        });
    });

    describe('invalid non-array values', () => {
        it('should reject strings', () => {
            expect(arrayRule('array')).toBe(false);
            expect(arrayRule('')).toBe(false);
        });

        it('should reject numbers', () => {
            expect(arrayRule(123)).toBe(false);
            expect(arrayRule(0)).toBe(false);
        });

        it('should reject booleans', () => {
            expect(arrayRule(true)).toBe(false);
            expect(arrayRule(false)).toBe(false);
        });

        it('should reject null and undefined', () => {
            expect(arrayRule(null)).toBe(false);
            expect(arrayRule(undefined)).toBe(false);
        });

        it('should reject plain objects', () => {
            expect(arrayRule({})).toBe(false);
            expect(arrayRule({ length: 3 })).toBe(false);
        });

        it('should reject functions', () => {
            expect(arrayRule(() => [])).toBe(false);
            expect(arrayRule(Array)).toBe(false);
        });
    });

    describe('array-like objects', () => {
        it('should reject array-like objects with length property', () => {
            expect(arrayRule({ 0: 'a', 1: 'b', length: 2 })).toBe(false);
        });

        it('should reject Set', () => {
            expect(arrayRule(new Set([1, 2, 3]))).toBe(false);
        });

        it('should reject Map', () => {
            expect(arrayRule(new Map())).toBe(false);
        });

        it('should reject arguments object', () => {
            function testFunc(..._args: unknown[]) {
                expect(arrayRule(arguments)).toBe(false);
            }
            testFunc(1, 2, 3);
        });

        it('should reject typed arrays', () => {
            expect(arrayRule(new Int8Array([1, 2, 3]))).toBe(false);
            expect(arrayRule(new Uint8Array([1, 2, 3]))).toBe(false);
            expect(arrayRule(new Float32Array([1.1, 2.2]))).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle sparse arrays', () => {
            const sparseArray = [1, , 3]; // eslint-disable-line no-sparse-arrays
            expect(arrayRule(sparseArray)).toBe(true);
        });

        it('should handle arrays created with Array.of and Array.from', () => {
            expect(arrayRule(Array.of(1, 2, 3))).toBe(true);
            expect(arrayRule(Array.from('abc'))).toBe(true);
            expect(arrayRule(Array.from({ length: 3 }))).toBe(true);
        });
    });

    describe('type safety', () => {
        it('should accept unknown type parameter', () => {
            const unknownValue: unknown = [1, 2, 3];
            expect(() => arrayRule(unknownValue)).not.toThrow();
        });

        it('should always return boolean', () => {
            expect(typeof arrayRule([])).toBe('boolean');
            expect(typeof arrayRule('array')).toBe('boolean');
            expect(typeof arrayRule(null)).toBe('boolean');
        });
    });
});
