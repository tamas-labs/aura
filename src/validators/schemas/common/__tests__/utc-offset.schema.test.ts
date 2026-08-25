import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateUtcOffset } from '../utc-offset.schema';
import { defaultConfigLib } from '../../../../lib/default-config.lib';

describe('UtcOffset Schema Validator', () => {
    const TEST_STORE_ID = 'test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('validateUtcOffset - Valid inputs', () => {
        it('should accept +02:00', () => {
            const result = validateUtcOffset('+02:00', TEST_STORE_ID);
            expect(result).toBe('+02:00');
        });

        it('should accept -05:00', () => {
            const result = validateUtcOffset('-05:00', TEST_STORE_ID);
            expect(result).toBe('-05:00');
        });

        it('should accept +00:00', () => {
            const result = validateUtcOffset('+00:00', TEST_STORE_ID);
            expect(result).toBe('+00:00');
        });

        it('should accept +05:30 (India)', () => {
            const result = validateUtcOffset('+05:30', TEST_STORE_ID);
            expect(result).toBe('+05:30');
        });

        it('should accept +09:30 (Australia)', () => {
            const result = validateUtcOffset('+09:30', TEST_STORE_ID);
            expect(result).toBe('+09:30');
        });

        it('should accept -03:30', () => {
            const result = validateUtcOffset('-03:30', TEST_STORE_ID);
            expect(result).toBe('-03:30');
        });

        it('should accept +14:00', () => {
            const result = validateUtcOffset('+14:00', TEST_STORE_ID);
            expect(result).toBe('+14:00');
        });

        it('should accept -12:00', () => {
            const result = validateUtcOffset('-12:00', TEST_STORE_ID);
            expect(result).toBe('-12:00');
        });

        it('should accept null value', () => {
            const result = validateUtcOffset(null, TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('validateUtcOffset - Invalid inputs', () => {
        it('should return fallback for invalid offset format', () => {
            const result = validateUtcOffset('+99:00', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.utcOffset);
        });

        it('should return fallback for missing colon', () => {
            const result = validateUtcOffset('+0200', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.utcOffset);
        });

        it('should return fallback for missing sign', () => {
            const result = validateUtcOffset('02:00', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.utcOffset);
        });

        it('should return fallback for invalid type (number)', () => {
            const result = validateUtcOffset(200, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.utcOffset);
        });

        it('should return fallback for invalid type (boolean)', () => {
            const result = validateUtcOffset(true, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.utcOffset);
        });

        it('should return fallback for invalid type (object)', () => {
            const result = validateUtcOffset({}, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.utcOffset);
        });

        it('should return fallback for undefined', () => {
            const result = validateUtcOffset(undefined, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.utcOffset);
        });

        it('should return fallback for empty string', () => {
            const result = validateUtcOffset('', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.utcOffset);
        });
    });

    describe('validateUtcOffset - Fallback behavior', () => {
        it('should return +02:00 as default fallback', () => {
            const result = validateUtcOffset('invalid', TEST_STORE_ID);
            expect(result).toBe('+02:00'); // defaultConfigLib.utcOffset
        });
    });
});
