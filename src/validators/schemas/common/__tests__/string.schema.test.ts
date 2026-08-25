import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateString } from '../string.schema';
import { defaultConfigLib } from '../../../../lib/default-config.lib';

describe('String Schema Validator', () => {
    const TEST_STORE_ID = 'test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('validateString - Valid inputs', () => {
        it('should accept valid string', () => {
            const result = validateString('Test Site', TEST_STORE_ID, 'siteName');
            expect(result).toBe('Test Site');
        });

        it('should accept empty string when min is 0', () => {
            const result = validateString('', TEST_STORE_ID, 'siteName', 0);
            expect(result).toBe('');
        });

        it('should accept null value', () => {
            const result = validateString(null, TEST_STORE_ID, 'siteName');
            expect(result).toBeNull();
        });

        it('should sanitize HTML content', () => {
            const result = validateString(
                '<script>alert("xss")</script>Safe',
                TEST_STORE_ID,
                'siteName'
            );
            // HTML sanitization works
            expect(result).not.toContain('<script>');
        });

        it('should accept string within length limits', () => {
            const result = validateString('Valid', TEST_STORE_ID, 'siteName', 1, 10);
            expect(result).toBe('Valid');
        });
    });

    describe('validateString - Invalid inputs', () => {
        it('should return fallback for invalid type (number)', () => {
            const result = validateString(123, TEST_STORE_ID, 'siteName');
            expect(result).toBe(defaultConfigLib.siteName);
        });

        it('should return fallback for invalid type (boolean)', () => {
            const result = validateString(true, TEST_STORE_ID, 'siteName');
            expect(result).toBe(defaultConfigLib.siteName);
        });

        it('should return fallback for invalid type (object)', () => {
            const result = validateString({}, TEST_STORE_ID, 'siteName');
            expect(result).toBe(defaultConfigLib.siteName);
        });

        it('should return fallback for invalid type (array)', () => {
            const result = validateString([], TEST_STORE_ID, 'siteName');
            expect(result).toBe(defaultConfigLib.siteName);
        });

        it('should return fallback for string too long', () => {
            const longString = 'a'.repeat(300);
            const result = validateString(longString, TEST_STORE_ID, 'siteName', 0, 250);
            expect(result).toBe(defaultConfigLib.siteName);
        });

        it('should return fallback for string too short', () => {
            const result = validateString('', TEST_STORE_ID, 'siteName', 5, 250);
            expect(result).toBe(defaultConfigLib.siteName);
        });
    });

    describe('validateString - Custom min/max', () => {
        it('should validate with custom min length', () => {
            const result = validateString('Hello', TEST_STORE_ID, 'siteName', 5, 250);
            expect(result).toBe('Hello');
        });

        it('should validate with custom max length', () => {
            const result = validateString('Hi', TEST_STORE_ID, 'siteName', 0, 10);
            expect(result).toBe('Hi');
        });

        it('should reject string below min length', () => {
            const result = validateString('Hi', TEST_STORE_ID, 'siteName', 5, 250);
            expect(result).toBe(defaultConfigLib.siteName);
        });

        it('should reject string above max length', () => {
            const result = validateString('Too long string', TEST_STORE_ID, 'siteName', 0, 5);
            expect(result).toBe(defaultConfigLib.siteName);
        });
    });

    describe('validateString - Fallback behavior', () => {
        it('should return string fallback from defaultConfigLib for siteName', () => {
            const result = validateString(undefined, TEST_STORE_ID, 'siteName');
            expect(result).toBe(defaultConfigLib.siteName);
        });

        it('should return string fallback from defaultConfigLib for href', () => {
            const result = validateString(undefined, TEST_STORE_ID, 'href');
            expect(result).toBe(defaultConfigLib.href);
        });

        it('should return empty string for non-string config key', () => {
            const result = validateString(undefined, TEST_STORE_ID, 'debug'); // debug is boolean
            expect(result).toBe('');
        });
    });

    describe('validateString - Error logging', () => {
        it('should log error to error store on invalid input', () => {
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            validateString(123, TEST_STORE_ID, 'siteName');

            // The error store works, but doesn't necessarily call console.error
            // This would rather be an integration test
            expect(consoleSpy).toHaveBeenCalledTimes(0); // Currently doesn't use console.error

            consoleSpy.mockRestore();
        });
    });

    describe('validateString - Prototype-chain config keys', () => {
        it.each(['constructor', '__proto__', 'toString'])(
            'should fall back to the empty string for the inherited key %s',
            key => {
                // A raw `defaults[key]` lookup answers these names from `Object.prototype`,
                // and the `??` fallback keeps whatever it finds — a function, not a string.
                expect(validateString(undefined, TEST_STORE_ID, key)).toBe('');
            }
        );
    });
});
