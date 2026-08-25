import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateTimeZone } from '../time-zone.schema';
import { defaultConfigLib } from '../../../../lib/default-config.lib';

describe('TimeZone Schema Validator', () => {
    const TEST_STORE_ID = 'test-store';
    const DEFAULT_TIMEZONE = 'Europe/Budapest';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('validateTimeZone - Valid inputs', () => {
        it('should accept Europe/Budapest', () => {
            const result = validateTimeZone(DEFAULT_TIMEZONE, TEST_STORE_ID);
            expect(result).toBe(DEFAULT_TIMEZONE);
        });

        it('should accept America/New_York', () => {
            const result = validateTimeZone('America/New_York', TEST_STORE_ID);
            expect(result).toBe('America/New_York');
        });

        it('should accept Asia/Tokyo', () => {
            const result = validateTimeZone('Asia/Tokyo', TEST_STORE_ID);
            expect(result).toBe('Asia/Tokyo');
        });

        it('should accept UTC', () => {
            const result = validateTimeZone('UTC', TEST_STORE_ID);
            expect(result).toBe('UTC');
        });

        it('should accept Europe/London', () => {
            const result = validateTimeZone('Europe/London', TEST_STORE_ID);
            expect(result).toBe('Europe/London');
        });

        it('should accept null value', () => {
            const result = validateTimeZone(null, TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('validateTimeZone - Invalid inputs', () => {
        it('should return fallback for invalid timezone', () => {
            const result = validateTimeZone('Invalid/Timezone', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.timeZone);
        });

        it('should return fallback for non-IANA format', () => {
            const result = validateTimeZone('GMT+2', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.timeZone);
        });

        it('should return fallback for invalid type (number)', () => {
            const result = validateTimeZone(123, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.timeZone);
        });

        it('should return fallback for invalid type (boolean)', () => {
            const result = validateTimeZone(true, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.timeZone);
        });

        it('should return fallback for invalid type (object)', () => {
            const result = validateTimeZone({}, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.timeZone);
        });

        it('should return fallback for undefined', () => {
            const result = validateTimeZone(undefined, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.timeZone);
        });

        it('should return fallback for empty string', () => {
            const result = validateTimeZone('', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.timeZone);
        });
    });

    describe('validateTimeZone - Fallback behavior', () => {
        it('should return Europe/Budapest as default fallback', () => {
            const result = validateTimeZone('Invalid/Zone', TEST_STORE_ID);
            expect(result).toBe(DEFAULT_TIMEZONE); // defaultConfigLib.timeZone
        });
    });
});
