import { describe, it, expect } from 'vitest';
import { stringRule } from '../string.rules';

describe('stringRule', () => {
    describe('valid string values', () => {
        it('should accept regular strings', () => {
            expect(stringRule('hello')).toBe(true);
            expect(stringRule('world')).toBe(true);
            expect(stringRule('Lorem ipsum dolor sit amet')).toBe(true);
        });

        it('should accept empty string', () => {
            expect(stringRule('')).toBe(true);
        });

        it('should accept whitespace strings', () => {
            expect(stringRule('   ')).toBe(true);
            expect(stringRule('\t')).toBe(true);
            expect(stringRule('\n')).toBe(true);
        });

        it('should accept very long strings', () => {
            const longString = 'a'.repeat(1000);
            expect(stringRule(longString)).toBe(true);
        });

        it('should accept strings with special characters', () => {
            expect(stringRule('!@#$%^&*()')).toBe(true);
            expect(stringRule('éáűőúöüóí')).toBe(true);
            expect(stringRule('你好世界')).toBe(true);
        });
    });

    describe('invalid non-string values', () => {
        it('should reject numbers', () => {
            expect(stringRule(123)).toBe(false);
            expect(stringRule(0)).toBe(false);
            expect(stringRule(-1)).toBe(false);
            expect(stringRule(3.14)).toBe(false);
        });

        it('should reject booleans', () => {
            expect(stringRule(true)).toBe(false);
            expect(stringRule(false)).toBe(false);
        });

        it('should reject null and undefined', () => {
            expect(stringRule(null)).toBe(false);
            expect(stringRule(undefined)).toBe(false);
        });

        it('should reject objects', () => {
            expect(stringRule({})).toBe(false);
            expect(stringRule({ key: 'value' })).toBe(false);
        });

        it('should reject arrays', () => {
            expect(stringRule([])).toBe(false);
            expect(stringRule(['a', 'b'])).toBe(false);
        });

        it('should reject functions', () => {
            expect(stringRule(() => {})).toBe(false);
            expect(stringRule(function () {})).toBe(false);
        });

        it('should reject symbols', () => {
            expect(stringRule(Symbol('test'))).toBe(false);
        });
    });

    describe('type safety', () => {
        it('should accept unknown type parameter', () => {
            const unknownValue: unknown = 'test';
            expect(() => stringRule(unknownValue)).not.toThrow();
        });

        it('should always return boolean', () => {
            expect(typeof stringRule('test')).toBe('boolean');
            expect(typeof stringRule(123)).toBe('boolean');
            expect(typeof stringRule(null)).toBe('boolean');
        });
    });
});
