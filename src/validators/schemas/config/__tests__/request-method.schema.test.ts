import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateRequestMethod } from '../request-method.schema';
import { defaultConfigLib } from '../../../../lib/default-config.lib';

describe('RequestMethod Schema Validator', () => {
    const TEST_STORE_ID = 'test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('validateRequestMethod - Valid inputs', () => {
        it('should accept GET method', () => {
            const result = validateRequestMethod('GET', TEST_STORE_ID);
            expect(result).toBe('GET');
        });

        it('should accept POST method', () => {
            const result = validateRequestMethod('POST', TEST_STORE_ID);
            expect(result).toBe('POST');
        });

        it('should accept PUT method', () => {
            const result = validateRequestMethod('PUT', TEST_STORE_ID);
            expect(result).toBe('PUT');
        });

        it('should accept DELETE method', () => {
            const result = validateRequestMethod('DELETE', TEST_STORE_ID);
            expect(result).toBe('DELETE');
        });

        it('should accept PATCH method', () => {
            const result = validateRequestMethod('PATCH', TEST_STORE_ID);
            expect(result).toBe('PATCH');
        });

        it('should accept null value', () => {
            const result = validateRequestMethod(null, TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('validateRequestMethod - Invalid inputs', () => {
        it('should return fallback for invalid method', () => {
            const result = validateRequestMethod('INVALID', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.requestMethod);
        });

        it('should return fallback for lowercase method', () => {
            const result = validateRequestMethod('get', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.requestMethod);
        });

        it('should return fallback for invalid type (number)', () => {
            const result = validateRequestMethod(123, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.requestMethod);
        });

        it('should return fallback for invalid type (boolean)', () => {
            const result = validateRequestMethod(true, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.requestMethod);
        });

        it('should return fallback for invalid type (object)', () => {
            const result = validateRequestMethod({}, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.requestMethod);
        });

        it('should return fallback for undefined', () => {
            const result = validateRequestMethod(undefined, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.requestMethod);
        });
    });

    describe('validateRequestMethod - Fallback behavior', () => {
        it('should return POST as default fallback', () => {
            const result = validateRequestMethod('INVALID', TEST_STORE_ID);
            expect(result).toBe('POST'); // defaultConfigLib.requestMethod is 'POST'
        });
    });
});
