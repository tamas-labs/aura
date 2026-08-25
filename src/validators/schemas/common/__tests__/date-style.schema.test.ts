import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateDateStyle } from '../date-style.schema';
import { defaultConfigLib } from '../../../../lib/default-config.lib';

describe('DateStyle Schema Validator', () => {
    const TEST_STORE_ID = 'test-store';
    const DEFAULT_DATE_STYLE = 'short';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('validateDateStyle - Valid inputs', () => {
        it('should accept "short" value', () => {
            const result = validateDateStyle('short', TEST_STORE_ID);
            expect(result).toBe('short');
        });

        it('should accept "medium" value', () => {
            const result = validateDateStyle('medium', TEST_STORE_ID);
            expect(result).toBe('medium');
        });

        it('should accept "long" value', () => {
            const result = validateDateStyle('long', TEST_STORE_ID);
            expect(result).toBe('long');
        });

        it('should accept null value', () => {
            const result = validateDateStyle(null, TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('validateDateStyle - Invalid inputs', () => {
        it('should return fallback for old moment.js format string', () => {
            const result = validateDateStyle('YYYY.MM.DD. HH:mm', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.dateStyle);
        });

        it('should return fallback for ISO format string', () => {
            const result = validateDateStyle('YYYY-MM-DD', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.dateStyle);
        });

        it('should return fallback for empty string', () => {
            const result = validateDateStyle('', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.dateStyle);
        });

        it('should return fallback for arbitrary string', () => {
            const result = validateDateStyle('invalid', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.dateStyle);
        });

        it('should return fallback for number', () => {
            const result = validateDateStyle(123, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.dateStyle);
        });

        it('should return fallback for boolean', () => {
            const result = validateDateStyle(true, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.dateStyle);
        });

        it('should return fallback for object', () => {
            const result = validateDateStyle({}, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.dateStyle);
        });

        it('should return fallback for undefined', () => {
            const result = validateDateStyle(undefined, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.dateStyle);
        });

        it('should return fallback for array', () => {
            const result = validateDateStyle(['short'], TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.dateStyle);
        });
    });

    describe('validateDateStyle - Fallback behavior', () => {
        it('should return "short" as fallback (DEFAULT_DATE_STYLE)', () => {
            const result = validateDateStyle('invalid', TEST_STORE_ID);
            expect(result).toBe(DEFAULT_DATE_STYLE);
        });

        it('fallback should match defaultConfigLib.dateStyle', () => {
            const result = validateDateStyle(999, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.dateStyle);
            expect(result).toBe('short');
        });
    });
});
