import { describe, it, expect } from 'vitest';
import { resolveValue } from '../resolve-value.util';

describe('resolveValue', () => {
    describe('valid cases', () => {
        it('should resolve direct property', () => {
            const obj = { name: 'John', age: 30 };
            expect(resolveValue(obj, 'name')).toBe('John');
            expect(resolveValue(obj, 'age')).toBe(30);
        });

        it('should resolve nested property with dot notation', () => {
            const obj = {
                user: {
                    name: 'Jane',
                    address: {
                        city: 'New York',
                        zip: 10001,
                    },
                },
            };
            expect(resolveValue(obj, 'user.name')).toBe('Jane');
            expect(resolveValue(obj, 'user.address.city')).toBe('New York');
            expect(resolveValue(obj, 'user.address.zip')).toBe(10001);
        });

        it('should handle deeply nested paths', () => {
            const obj = {
                a: {
                    b: {
                        c: {
                            d: {
                                value: 'deep',
                            },
                        },
                    },
                },
            };
            expect(resolveValue(obj, 'a.b.c.d.value')).toBe('deep');
        });

        it('should resolve properties with various data types', () => {
            const obj = {
                string: 'text',
                number: 42,
                boolean: true,
                array: [1, 2, 3],
                object: { nested: 'value' },
                nullValue: null,
            };
            expect(resolveValue(obj, 'string')).toBe('text');
            expect(resolveValue(obj, 'number')).toBe(42);
            expect(resolveValue(obj, 'boolean')).toBe(true);
            expect(resolveValue(obj, 'array')).toEqual([1, 2, 3]);
            expect(resolveValue(obj, 'object')).toEqual({ nested: 'value' });
            expect(resolveValue(obj, 'nullValue')).toBe(null);
        });

        it('should prioritize direct property over nested path', () => {
            const obj = {
                'user.name': 'Direct Property',
                user: {
                    name: 'Nested Property',
                },
            };
            // Direct property check happens first
            expect(resolveValue(obj, 'user.name')).toBe('Direct Property');
        });
    });

    describe('invalid cases', () => {
        it('should return undefined for null item', () => {
            expect(resolveValue(null, 'name')).toBeUndefined();
        });

        it('should return undefined for undefined item', () => {
            expect(resolveValue(undefined, 'name')).toBeUndefined();
        });

        it('should return undefined for non-object primitives', () => {
            expect(resolveValue(42, 'prop')).toBeUndefined();
            expect(resolveValue('string', 'prop')).toBeUndefined();
            expect(resolveValue(true, 'prop')).toBeUndefined();
        });

        it('should return undefined for non-existent property', () => {
            const obj = { name: 'John' };
            expect(resolveValue(obj, 'age')).toBeUndefined();
            expect(resolveValue(obj, 'nonExistent')).toBeUndefined();
        });

        it('should return undefined for non-existent nested path', () => {
            const obj = { user: { name: 'John' } };
            expect(resolveValue(obj, 'user.age')).toBeUndefined();
            expect(resolveValue(obj, 'user.address.city')).toBeUndefined();
        });

        it('should return undefined when intermediate value is null', () => {
            const obj = { user: null };
            expect(resolveValue(obj, 'user.name')).toBeUndefined();
        });

        it('should return undefined when intermediate value is undefined', () => {
            const obj = { user: undefined };
            expect(resolveValue(obj, 'user.name')).toBeUndefined();
        });

        it('should return undefined when intermediate value is not an object', () => {
            const obj = { user: 'string' };
            expect(resolveValue(obj, 'user.name')).toBeUndefined();
        });
    });

    describe('edge cases', () => {
        it('should handle empty object', () => {
            const obj = {};
            expect(resolveValue(obj, 'any')).toBeUndefined();
        });

        it('should handle empty string path', () => {
            const obj = { '': 'empty key', name: 'John' };
            expect(resolveValue(obj, '')).toBe('empty key');
        });

        it('should handle property with zero value', () => {
            const obj = { count: 0, flag: false, empty: '' };
            expect(resolveValue(obj, 'count')).toBe(0);
            expect(resolveValue(obj, 'flag')).toBe(false);
            expect(resolveValue(obj, 'empty')).toBe('');
        });

        it('should handle arrays as items', () => {
            const arr = ['a', 'b', 'c'];
            expect(resolveValue(arr, '0')).toBe('a');
            expect(resolveValue(arr, '1')).toBe('b');
            expect(resolveValue(arr, 'length')).toBe(3);
        });

        it('should handle complex nested structures', () => {
            const obj = {
                users: [
                    { name: 'John', age: 30 },
                    { name: 'Jane', age: 25 },
                ],
            };
            expect(resolveValue(obj, 'users')).toEqual([
                { name: 'John', age: 30 },
                { name: 'Jane', age: 25 },
            ]);
        });

        it('should handle objects with numeric keys', () => {
            const obj = { 0: 'zero', 1: 'one', 2: 'two' };
            expect(resolveValue(obj, '0')).toBe('zero');
            expect(resolveValue(obj, '1')).toBe('one');
        });

        it('should handle property names with special characters', () => {
            const obj = {
                'prop-with-dash': 'value1',
                prop_with_underscore: 'value2',
                prop$with$dollar: 'value3',
            };
            expect(resolveValue(obj, 'prop-with-dash')).toBe('value1');
            expect(resolveValue(obj, 'prop_with_underscore')).toBe('value2');
            expect(resolveValue(obj, 'prop$with$dollar')).toBe('value3');
        });

        it('should handle path breaking at nested null/undefined without error', () => {
            const obj = {
                a: {
                    b: null,
                },
            };
            expect(resolveValue(obj, 'a.b.c.d')).toBeUndefined();
        });
    });

    describe('prototype chain safety', () => {
        // `path` comes from the API response (a header cell's `field`/`data`), so a
        // faulty or compromised backend controls it. Only own properties may resolve.
        it('should not resolve inherited methods', () => {
            const item = { id: 1 };
            expect(resolveValue(item, 'toString')).toBeUndefined();
            expect(resolveValue(item, 'valueOf')).toBeUndefined();
            expect(resolveValue(item, 'hasOwnProperty')).toBeUndefined();
        });

        it('should not resolve constructor or __proto__', () => {
            const item = { id: 1 };
            expect(resolveValue(item, 'constructor')).toBeUndefined();
            expect(resolveValue(item, '__proto__')).toBeUndefined();
            expect(resolveValue(item, 'prototype')).toBeUndefined();
        });

        it('should not resolve inherited members on a nested segment', () => {
            const item = { user: { name: 'John' } };
            expect(resolveValue(item, 'user.toString')).toBeUndefined();
            expect(resolveValue(item, 'user.constructor')).toBeUndefined();
            expect(resolveValue(item, 'user.__proto__')).toBeUndefined();
            expect(resolveValue(item, 'user.__proto__.polluted')).toBeUndefined();
        });

        it('should not resolve an own __proto__ key minted by JSON.parse', () => {
            // JSON.parse creates a real own data property here, so an own-property
            // check alone would let it through — the denylist is what stops it.
            const item: unknown = JSON.parse('{"id":1,"__proto__":{"admin":true}}');
            expect(resolveValue(item, '__proto__')).toBeUndefined();
            expect(resolveValue(item, 'id')).toBe(1);
            expect(({} as Record<string, unknown>).admin).toBeUndefined();
        });

        it('should not resolve prototype members of class instances', () => {
            class Row {
                public id = 7;
                public get label(): string {
                    return 'from prototype';
                }
                public describe(): string {
                    return 'method';
                }
            }
            const item = new Row();
            expect(resolveValue(item, 'id')).toBe(7);
            expect(resolveValue(item, 'label')).toBeUndefined();
            expect(resolveValue(item, 'describe')).toBeUndefined();
        });

        it('should still resolve own properties of a prototype-less object', () => {
            const item = Object.create(null) as Record<string, unknown>;
            item.name = 'John';
            item.nested = { city: 'New York' };
            expect(resolveValue(item, 'name')).toBe('John');
            expect(resolveValue(item, 'nested.city')).toBe('New York');
        });

        it('should not resolve array prototype members', () => {
            const arr = ['a', 'b'];
            expect(resolveValue(arr, 'map')).toBeUndefined();
            expect(resolveValue(arr, 'constructor')).toBeUndefined();
            // `length` is an own property of arrays, so it stays resolvable
            expect(resolveValue(arr, 'length')).toBe(2);
        });
    });

    describe('mixed object and array paths', () => {
        it('should resolve nested path: object -> array -> index', () => {
            // "hello.first_level.1" -> "Hello"
            const item = {
                hello: {
                    first_level: ['', 'Hello'],
                },
            };
            expect(resolveValue(item, 'hello.first_level.1')).toBe('Hello');
        });

        it('should resolve nested path: array -> object -> property', () => {
            // "world.2.first_level" -> "World"
            const item = {
                world: ['', '', { first_level: 'World' }],
            };
            expect(resolveValue(item, 'world.2.first_level')).toBe('World');
        });

        it('should handle deeply nested mixed paths', () => {
            const item = {
                data: [
                    {
                        values: [10, 20, { target: 'Found' }],
                    },
                ],
            };
            expect(resolveValue(item, 'data.0.values.2.target')).toBe('Found');
        });

        it('should return undefined for invalid array index', () => {
            const item = { arr: ['a', 'b'] };
            expect(resolveValue(item, 'arr.5')).toBeUndefined();
        });
    });
});
