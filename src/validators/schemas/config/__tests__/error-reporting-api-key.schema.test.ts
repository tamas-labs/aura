import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateErrorReportingApiKey } from '../error-reporting-api-key.schema';
import { defaultConfigLib } from '../../../../lib/default-config.lib';

describe('ErrorReportingApiKey Schema Validator', () => {
    const TEST_STORE_ID = 'test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('validateErrorReportingApiKey - Valid inputs', () => {
        it('should accept valid API key with alphanumeric characters', () => {
            const result = validateErrorReportingApiKey('abc123DEF456xyz789', TEST_STORE_ID);
            expect(result).toBe('abc123DEF456xyz789');
        });

        it('should accept valid API key with hyphens', () => {
            const result = validateErrorReportingApiKey('abc-123-def-456', TEST_STORE_ID);
            expect(result).toBe('abc-123-def-456');
        });

        it('should accept valid API key with underscores', () => {
            const result = validateErrorReportingApiKey('abc_123_def_456', TEST_STORE_ID);
            expect(result).toBe('abc_123_def_456');
        });

        it('should accept valid API key with mixed characters', () => {
            const result = validateErrorReportingApiKey('abc_123-DEF_456-xyz', TEST_STORE_ID);
            expect(result).toBe('abc_123-DEF_456-xyz');
        });

        it('should accept exactly 10 character API key', () => {
            const result = validateErrorReportingApiKey('1234567890', TEST_STORE_ID);
            expect(result).toBe('1234567890');
        });

        it('should accept 200 character API key', () => {
            const longKey = 'a'.repeat(200);
            const result = validateErrorReportingApiKey(longKey, TEST_STORE_ID);
            expect(result).toBe(longKey);
        });

        it('should accept empty string', () => {
            const result = validateErrorReportingApiKey('', TEST_STORE_ID);
            expect(result).toBe('');
        });

        it('should accept null value', () => {
            const result = validateErrorReportingApiKey(null, TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('validateErrorReportingApiKey - Invalid inputs', () => {
        it('should return fallback for API key with special characters', () => {
            const result = validateErrorReportingApiKey('abc!@#$%123', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingApiKey);
        });

        it('should return fallback for API key with spaces', () => {
            const result = validateErrorReportingApiKey('abc 123 def 456', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingApiKey);
        });

        it('should return fallback for API key shorter than 10 characters', () => {
            const result = validateErrorReportingApiKey('abc123', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingApiKey);
        });

        it('should return fallback for API key longer than 200 characters', () => {
            const longKey = 'a'.repeat(201);
            const result = validateErrorReportingApiKey(longKey, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingApiKey);
        });

        it('should return fallback for API key with dots', () => {
            const result = validateErrorReportingApiKey('abc.123.def.456', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingApiKey);
        });

        it('should return fallback for invalid type (number)', () => {
            const result = validateErrorReportingApiKey(123456789012, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingApiKey);
        });

        it('should return fallback for invalid type (boolean)', () => {
            const result = validateErrorReportingApiKey(true, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingApiKey);
        });

        it('should return fallback for invalid type (object)', () => {
            const result = validateErrorReportingApiKey({}, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingApiKey);
        });

        it('should return fallback for undefined', () => {
            const result = validateErrorReportingApiKey(undefined, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingApiKey);
        });
    });

    describe('validateErrorReportingApiKey - Edge cases', () => {
        it('should handle exactly 9 characters (just below min)', () => {
            const result = validateErrorReportingApiKey('123456789', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingApiKey);
        });

        it('should handle exactly 11 characters (just above min)', () => {
            const result = validateErrorReportingApiKey('12345678901', TEST_STORE_ID);
            expect(result).toBe('12345678901');
        });

        it('should handle exactly 199 characters (just below max)', () => {
            const key199 = 'a'.repeat(199);
            const result = validateErrorReportingApiKey(key199, TEST_STORE_ID);
            expect(result).toBe(key199);
        });
    });

    describe('validateErrorReportingApiKey - Fallback behavior', () => {
        it('should return empty string as default fallback', () => {
            const result = validateErrorReportingApiKey('invalid!@#', TEST_STORE_ID);
            expect(result).toBe(''); // defaultConfigLib.errorReportingApiKey is ''
        });
    });
});
