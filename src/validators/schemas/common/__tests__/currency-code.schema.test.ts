import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateCurrencyCode } from '../currency-code.schema';
import { defaultConfigLib } from '../../../../lib/default-config.lib';

describe('CurrencyCode Schema Validator', () => {
    const TEST_STORE_ID = 'test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('validateCurrencyCode - Valid inputs', () => {
        it('should accept HUF', () => {
            const result = validateCurrencyCode('HUF', TEST_STORE_ID);
            expect(result).toBe('HUF');
        });

        it('should accept USD', () => {
            const result = validateCurrencyCode('USD', TEST_STORE_ID);
            expect(result).toBe('USD');
        });

        it('should accept EUR', () => {
            const result = validateCurrencyCode('EUR', TEST_STORE_ID);
            expect(result).toBe('EUR');
        });

        it('should accept GBP', () => {
            const result = validateCurrencyCode('GBP', TEST_STORE_ID);
            expect(result).toBe('GBP');
        });

        it('should accept JPY', () => {
            const result = validateCurrencyCode('JPY', TEST_STORE_ID);
            expect(result).toBe('JPY');
        });

        it('should accept CHF', () => {
            const result = validateCurrencyCode('CHF', TEST_STORE_ID);
            expect(result).toBe('CHF');
        });

        it('should accept null value', () => {
            const result = validateCurrencyCode(null, TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('validateCurrencyCode - Invalid inputs', () => {
        it('should return fallback for invalid currency code', () => {
            const result = validateCurrencyCode('INVALID', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.currencyCode);
        });

        it('should return fallback for lowercase code', () => {
            const result = validateCurrencyCode('usd', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.currencyCode);
        });

        it('should return fallback for too short code', () => {
            const result = validateCurrencyCode('US', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.currencyCode);
        });

        it('should return fallback for too long code', () => {
            const result = validateCurrencyCode('USDD', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.currencyCode);
        });

        it('should return fallback for numeric code', () => {
            const result = validateCurrencyCode('123', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.currencyCode);
        });

        it('should return fallback for invalid type (number)', () => {
            const result = validateCurrencyCode(840, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.currencyCode);
        });

        it('should return fallback for invalid type (boolean)', () => {
            const result = validateCurrencyCode(true, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.currencyCode);
        });

        it('should return fallback for invalid type (object)', () => {
            const result = validateCurrencyCode({}, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.currencyCode);
        });

        it('should return fallback for undefined', () => {
            const result = validateCurrencyCode(undefined, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.currencyCode);
        });

        it('should return fallback for empty string', () => {
            const result = validateCurrencyCode('', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.currencyCode);
        });
    });

    describe('validateCurrencyCode - Fallback behavior', () => {
        it('should return HUF as default fallback', () => {
            const result = validateCurrencyCode('XXX', TEST_STORE_ID);
            expect(result).toBe('HUF'); // defaultConfigLib.currencyCode
        });
    });
});
