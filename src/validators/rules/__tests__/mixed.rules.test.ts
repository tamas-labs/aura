import { describe, it, expect } from 'vitest';
import { mixedRules } from '../mixed.rules';

describe('mixedRules', () => {
    describe('accepted primitive types', () => {
        it('should accept string values', () => {
            expect(mixedRules('hello')).toBe(true);
            expect(mixedRules('')).toBe(true);
            expect(mixedRules('   ')).toBe(true);
        });

        it('should accept number values', () => {
            expect(mixedRules(0)).toBe(true);
            expect(mixedRules(123)).toBe(true);
            expect(mixedRules(-99)).toBe(true);
            expect(mixedRules(3.14)).toBe(true);
        });

        it('should accept boolean values', () => {
            expect(mixedRules(true)).toBe(true);
            expect(mixedRules(false)).toBe(true);
        });
    });

    describe('accepted complex types', () => {
        it('should accept empty arrays', () => {
            expect(mixedRules([])).toBe(true);
        });

        it('should accept arrays with values', () => {
            expect(mixedRules([1, 2, 3])).toBe(true);
            expect(mixedRules(['a', 'b'])).toBe(true);
            expect(mixedRules([true, false])).toBe(true);
        });

        it('should accept nested arrays', () => {
            expect(
                mixedRules([
                    [1, 2],
                    [3, 4],
                ])
            ).toBe(true);
        });

        it('should accept empty plain objects', () => {
            expect(mixedRules({})).toBe(true);
        });

        it('should accept plain objects with properties', () => {
            expect(mixedRules({ a: 1, b: 2 })).toBe(true);
            expect(mixedRules({ name: 'test', value: 123 })).toBe(true);
        });

        it('should accept nested plain objects', () => {
            expect(mixedRules({ nested: { deep: true } })).toBe(true);
            expect(mixedRules({ a: { b: { c: 1 } } })).toBe(true);
        });
    });

    describe('rejected null and undefined', () => {
        it('should reject null', () => {
            expect(mixedRules(null)).toBe(false);
        });

        it('should reject undefined', () => {
            expect(mixedRules(undefined)).toBe(false);
        });
    });

    describe('rejected functions', () => {
        it('should reject arrow functions', () => {
            expect(mixedRules(() => {})).toBe(false);
        });

        it('should reject function declarations', () => {
            expect(mixedRules(function () {})).toBe(false);
        });

        it('should reject native functions', () => {
            expect(mixedRules(Date.now)).toBe(false);
            expect(mixedRules(Math.random)).toBe(false);
        });
    });

    describe('rejected class instances', () => {
        it('should reject Date instances', () => {
            expect(mixedRules(new Date())).toBe(false);
        });

        it('should reject Error instances', () => {
            expect(mixedRules(new Error())).toBe(false);
            expect(mixedRules(new TypeError())).toBe(false);
        });

        it('should reject Set instances', () => {
            expect(mixedRules(new Set())).toBe(false);
            expect(mixedRules(new Set([1, 2, 3]))).toBe(false);
        });

        it('should reject Map instances', () => {
            expect(mixedRules(new Map())).toBe(false);
        });

        it('should reject RegExp instances', () => {
            expect(mixedRules(/test/)).toBe(false);
            expect(mixedRules(new RegExp('test'))).toBe(false);
        });

        it('should reject Promise instances', () => {
            expect(mixedRules(Promise.resolve())).toBe(false);
        });

        it('should reject custom class instances', () => {
            class CustomClass {
                value = 123;
            }
            expect(mixedRules(new CustomClass())).toBe(false);
        });
    });

    describe('rejected symbols', () => {
        it('should reject Symbol values', () => {
            expect(mixedRules(Symbol('test'))).toBe(false);
            expect(mixedRules(Symbol.iterator)).toBe(false);
        });
    });

    describe('special numeric values', () => {
        it('should accept NaN (it is a number type)', () => {
            expect(mixedRules(NaN)).toBe(true);
        });

        it('should accept Infinity values (they are number type)', () => {
            expect(mixedRules(Infinity)).toBe(true);
            expect(mixedRules(-Infinity)).toBe(true);
        });

        it('should accept Number.MAX_SAFE_INTEGER', () => {
            expect(mixedRules(Number.MAX_SAFE_INTEGER)).toBe(true);
        });

        it('should accept Number.MIN_SAFE_INTEGER', () => {
            expect(mixedRules(Number.MIN_SAFE_INTEGER)).toBe(true);
        });
    });

    describe('wrapped primitives', () => {
        it('should reject wrapped string objects', () => {
            // eslint-disable-next-line sonarjs/no-primitive-wrappers
            expect(mixedRules(new String('test'))).toBe(false);
        });

        it('should reject wrapped number objects', () => {
            // eslint-disable-next-line sonarjs/no-primitive-wrappers
            expect(mixedRules(new Number(123))).toBe(false);
        });

        it('should reject wrapped boolean objects', () => {
            // eslint-disable-next-line sonarjs/no-primitive-wrappers
            expect(mixedRules(new Boolean(true))).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle objects created with Object.create(null)', () => {
            const obj = Object.create(null);
            // Object.create(null) creates object without prototype
            // Constructor check will fail, so it should be rejected
            expect(mixedRules(obj)).toBe(false);
        });

        it('should handle plain objects with null prototype explicitly set', () => {
            const obj = { a: 1 };
            Object.setPrototypeOf(obj, null);
            expect(mixedRules(obj)).toBe(false);
        });

        it('should accept objects from Object literal', () => {
            expect(mixedRules({ key: 'value' })).toBe(true);
        });

        it('should accept objects from Object constructor', () => {
            expect(mixedRules(new Object())).toBe(true);
            expect(mixedRules(new Object({ a: 1 }))).toBe(true);
        });
    });

    describe('type safety', () => {
        it('should accept unknown type parameter', () => {
            const unknownValue: unknown = 'test';
            expect(() => mixedRules(unknownValue)).not.toThrow();
        });

        it('should always return boolean', () => {
            expect(typeof mixedRules('test')).toBe('boolean');
            expect(typeof mixedRules(123)).toBe('boolean');
            expect(typeof mixedRules(true)).toBe('boolean');
            expect(typeof mixedRules([])).toBe('boolean');
            expect(typeof mixedRules({})).toBe('boolean');
            expect(typeof mixedRules(null)).toBe('boolean');
        });
    });

    describe('comprehensive validation', () => {
        it('should validate multiple different types correctly', () => {
            const values: unknown[] = [
                'string',
                123,
                true,
                [],
                {},
                null,
                undefined,
                () => {},
                new Date(),
            ];

            const results = values.map(value => mixedRules(value));

            // First 5 should be true, rest should be false
            expect(results).toEqual([
                true, // string
                true, // number
                true, // boolean
                true, // array
                true, // plain object
                false, // null
                false, // undefined
                false, // function
                false, // Date instance
            ]);
        });
    });
});
