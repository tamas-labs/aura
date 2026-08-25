import { describe, it, expect } from 'vitest';
import {
    FORBIDDEN_PROTO_KEYS,
    isForbiddenProtoKey,
    hasSafeOwnKey,
    createNullObject,
    readOwnEntry,
} from '../safe-object.util';

describe('safe-object.util', () => {
    describe('FORBIDDEN_PROTO_KEYS', () => {
        it('should list exactly the three prototype-chain names', () => {
            expect([...FORBIDDEN_PROTO_KEYS].sort()).toEqual([
                '__proto__',
                'constructor',
                'prototype',
            ]);
        });
    });

    describe('isForbiddenProtoKey', () => {
        it.each([...FORBIDDEN_PROTO_KEYS])('should refuse %s', key => {
            expect(isForbiddenProtoKey(key)).toBe(true);
        });

        it.each(['label', 'value', 'toString', 'data-id', '', 'proto'])('should allow %s', key => {
            expect(isForbiddenProtoKey(key)).toBe(false);
        });
    });

    describe('hasSafeOwnKey', () => {
        it('should accept an own key', () => {
            expect(hasSafeOwnKey({ label: 'High' }, 'label')).toBe(true);
        });

        it('should reject a missing key', () => {
            expect(hasSafeOwnKey({ label: 'High' }, 'variant')).toBe(false);
        });

        it('should reject an inherited key', () => {
            // The trap: `({}).toString` is truthy and `'toString' in {}` is true
            expect(hasSafeOwnKey({}, 'toString')).toBe(false);
            expect(hasSafeOwnKey({}, 'valueOf')).toBe(false);
        });

        it.each([...FORBIDDEN_PROTO_KEYS])('should reject %s even as an own key', key => {
            // JSON.parse mints a real own `__proto__` property — an own-property check
            // alone would hand it straight back.
            const parsed = JSON.parse(`{"${key}": {"label": "owned"}}`) as object;

            expect(hasSafeOwnKey(parsed, key)).toBe(false);
        });

        it('should work on a null-prototype record', () => {
            const record = createNullObject<string>();
            record.label = 'High';

            expect(hasSafeOwnKey(record, 'label')).toBe(true);
            expect(hasSafeOwnKey(record, 'toString')).toBe(false);
        });
    });

    describe('createNullObject', () => {
        it('should return an empty object with no prototype', () => {
            const result = createNullObject();

            expect(Object.getPrototypeOf(result)).toBeNull();
            expect(Object.keys(result)).toEqual([]);
        });

        it('should store __proto__ as an ordinary own key instead of retargeting', () => {
            const result = createNullObject();
            const payload = { polluted: true };

            result['__proto__'] = payload;

            expect(Object.getPrototypeOf(result)).toBeNull();
            expect(Object.keys(result)).toEqual(['__proto__']);
            // The same assignment into an object literal moves the prototype instead
            const literal: Record<string, unknown> = {};
            literal['__proto__'] = payload;
            expect(Object.getPrototypeOf(literal)).toBe(payload);
            expect(Object.keys(literal)).toEqual([]);
        });

        it('should not inherit anything from Object.prototype', () => {
            const result = createNullObject();

            expect('toString' in result).toBe(false);
            expect(result['constructor']).toBeUndefined();
        });

        it('should return a fresh object on every call', () => {
            expect(createNullObject()).not.toBe(createNullObject());
        });
    });
    describe('readOwnEntry', () => {
        const registry: Record<string, unknown> = { primary: 'value', empty: '' };

        it('should return the own entry for a plain key', () => {
            expect(readOwnEntry(registry, 'primary')).toBe('value');
        });

        it('should return a falsy own value as-is', () => {
            expect(readOwnEntry(registry, 'empty')).toBe('');
        });

        it('should return undefined for an unknown key', () => {
            expect(readOwnEntry(registry, 'missing')).toBeUndefined();
        });

        it.each(['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__'])(
            'should return undefined for the inherited key "%s"',
            protoKey => {
                expect(readOwnEntry(registry, protoKey)).toBeUndefined();
            }
        );

        it('should read an own key that shadows a prototype member', () => {
            expect(readOwnEntry({ toString: 'own' }, 'toString')).toBe('own');
        });

        it('should refuse an own key on the forbidden list', () => {
            expect(readOwnEntry({ constructor: 'own' }, 'constructor')).toBeUndefined();
        });

        it('should return undefined for an absent record or key', () => {
            expect(readOwnEntry(undefined, 'primary')).toBeUndefined();
            expect(readOwnEntry(null, 'primary')).toBeUndefined();
            expect(readOwnEntry(registry, null)).toBeUndefined();
            expect(readOwnEntry(registry, '')).toBeUndefined();
        });
    });
});
