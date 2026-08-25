import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateSiteToken } from '../site-token.schema';
import { DEFAULT_SITE_TOKEN } from '../../../../lib/default-values.lib';
import { useErrorHandlerStore } from '../../../../state/core/error-handler.state';

describe('SiteToken Schema Validator', () => {
    const TEST_STORE_ID = 'test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('validateSiteToken - Valid inputs', () => {
        it('should accept valid string token', () => {
            const result = validateSiteToken('my-secret-token', TEST_STORE_ID);
            expect(result).toBe('my-secret-token');
        });

        it('should accept empty string', () => {
            const result = validateSiteToken('', TEST_STORE_ID);
            expect(result).toBe('');
        });

        it('should accept long string token', () => {
            const longToken = 'a'.repeat(200);
            const result = validateSiteToken(longToken, TEST_STORE_ID);
            expect(result).toBe(longToken);
        });

        it('should accept string with special characters', () => {
            const result = validateSiteToken('token-with_special.chars@123', TEST_STORE_ID);
            expect(result).toBe('token-with_special.chars@123');
        });

        it('should accept boolean true', () => {
            const result = validateSiteToken(true, TEST_STORE_ID);
            expect(result).toBe(true);
        });

        it('should accept boolean false', () => {
            const result = validateSiteToken(false, TEST_STORE_ID);
            expect(result).toBe(false);
        });

        it('should handle null by returning null (not default)', () => {
            const result = validateSiteToken(null, TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('validateSiteToken - Invalid inputs', () => {
        it('should return default value for number input', () => {
            const result = validateSiteToken(12345, TEST_STORE_ID);
            expect(result).toBe(DEFAULT_SITE_TOKEN);
        });

        it('should return default value for object input', () => {
            const result = validateSiteToken({ token: 'abc' }, TEST_STORE_ID);
            expect(result).toBe(DEFAULT_SITE_TOKEN);
        });

        it('should return default value for array input', () => {
            const result = validateSiteToken(['token'], TEST_STORE_ID);
            expect(result).toBe(DEFAULT_SITE_TOKEN);
        });

        it('should return default value for undefined input', () => {
            const result = validateSiteToken(undefined, TEST_STORE_ID);
            expect(result).toBe(DEFAULT_SITE_TOKEN);
        });

        it('should return default value for empty object', () => {
            const result = validateSiteToken({}, TEST_STORE_ID);
            expect(result).toBe(DEFAULT_SITE_TOKEN);
        });
    });

    describe('validateSiteToken - Error handling', () => {
        it('should add error to store when validation fails', () => {
            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            const initialErrorCount = errorStore.errors.length;

            validateSiteToken(12345, TEST_STORE_ID);

            expect(errorStore.errors.length).toBeGreaterThan(initialErrorCount);
        });

        it('should not add error to store for valid string', () => {
            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            const initialErrorCount = errorStore.errors.length;

            validateSiteToken('valid-token', TEST_STORE_ID);

            expect(errorStore.errors.length).toBe(initialErrorCount);
        });

        it('should not add error to store for valid boolean', () => {
            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            const initialErrorCount = errorStore.errors.length;

            validateSiteToken(true, TEST_STORE_ID);

            expect(errorStore.errors.length).toBe(initialErrorCount);
        });

        it('should not add error to store for null (valid value)', () => {
            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            const initialErrorCount = errorStore.errors.length;

            const result = validateSiteToken(null, TEST_STORE_ID);

            expect(errorStore.errors.length).toBe(initialErrorCount);
            expect(result).toBeNull();
        });
    });

    describe('validateSiteToken - Edge cases', () => {
        it('should handle very long string', () => {
            const veryLongToken = 'a'.repeat(1000);
            const result = validateSiteToken(veryLongToken, TEST_STORE_ID);
            expect(result).toBe(veryLongToken);
        });

        it('should handle string with unicode characters', () => {
            const unicodeToken = '🔑token-emoji';
            const result = validateSiteToken(unicodeToken, TEST_STORE_ID);
            expect(result).toBe(unicodeToken);
        });

        it('should handle string with whitespace', () => {
            const tokenWithSpaces = '  token with spaces  ';
            const result = validateSiteToken(tokenWithSpaces, TEST_STORE_ID);
            expect(result).toBe(tokenWithSpaces);
        });

        it('should handle NaN', () => {
            const result = validateSiteToken(NaN, TEST_STORE_ID);
            expect(result).toBe(DEFAULT_SITE_TOKEN);
        });

        it('should handle Infinity', () => {
            const result = validateSiteToken(Infinity, TEST_STORE_ID);
            expect(result).toBe(DEFAULT_SITE_TOKEN);
        });
    });

    describe('validateSiteToken - Fallback behavior', () => {
        it('should return DEFAULT_SITE_TOKEN for all invalid inputs', () => {
            expect(validateSiteToken(123, TEST_STORE_ID)).toBe(DEFAULT_SITE_TOKEN);
            expect(validateSiteToken({}, TEST_STORE_ID)).toBe(DEFAULT_SITE_TOKEN);
            expect(validateSiteToken([], TEST_STORE_ID)).toBe(DEFAULT_SITE_TOKEN);
            expect(validateSiteToken(undefined, TEST_STORE_ID)).toBe(DEFAULT_SITE_TOKEN);
        });

        it('should verify DEFAULT_SITE_TOKEN is false', () => {
            expect(DEFAULT_SITE_TOKEN).toBe(false);
        });
    });
});
