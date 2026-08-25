import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateLocalization } from '../localization.schema';
import { defaultConfigLib } from '../../../../lib/default-config.lib';

describe('Localization Schema Validator', () => {
    const TEST_STORE_ID = 'test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('validateLocalization - Valid inputs', () => {
        it('should accept hu-HU', () => {
            const result = validateLocalization('hu-HU', TEST_STORE_ID);
            expect(result).toBe('hu-HU');
        });

        it('should accept en-US', () => {
            const result = validateLocalization('en-US', TEST_STORE_ID);
            expect(result).toBe('en-US');
        });

        it('should accept de-DE', () => {
            const result = validateLocalization('de-DE', TEST_STORE_ID);
            expect(result).toBe('de-DE');
        });

        it('should accept fr-FR', () => {
            const result = validateLocalization('fr-FR', TEST_STORE_ID);
            expect(result).toBe('fr-FR');
        });

        it('should accept es-ES', () => {
            const result = validateLocalization('es-ES', TEST_STORE_ID);
            expect(result).toBe('es-ES');
        });

        it('should accept null value', () => {
            const result = validateLocalization(null, TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('validateLocalization - Invalid inputs', () => {
        it('should return fallback for uppercase language code', () => {
            const result = validateLocalization('HU-HU', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.localization);
        });

        it('should return fallback for lowercase country code', () => {
            const result = validateLocalization('hu-hu', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.localization);
        });

        it('should return fallback for wrong separator', () => {
            const result = validateLocalization('hu_HU', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.localization);
        });

        it('should return fallback for too short code', () => {
            const result = validateLocalization('hu', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.localization);
        });

        it('should return fallback for too long code', () => {
            const result = validateLocalization('hun-HUN', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.localization);
        });

        it('should return fallback for invalid type (number)', () => {
            const result = validateLocalization(123, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.localization);
        });

        it('should return fallback for invalid type (boolean)', () => {
            const result = validateLocalization(true, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.localization);
        });

        it('should return fallback for invalid type (object)', () => {
            const result = validateLocalization({}, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.localization);
        });

        it('should return fallback for undefined', () => {
            const result = validateLocalization(undefined, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.localization);
        });

        it('should return fallback for empty string', () => {
            const result = validateLocalization('', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.localization);
        });
    });

    describe('validateLocalization - Fallback behavior', () => {
        it('should return en-US as default fallback', () => {
            const result = validateLocalization('invalid', TEST_STORE_ID);
            expect(result).toBe('en-US'); // defaultConfigLib.localization
        });
    });
});
