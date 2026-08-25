import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateUnitIdentifier } from '../unit-identifier.schema';

describe('UnitIdentifier Schema Validator', () => {
    const TEST_STORE_ID = 'test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('validateUnitIdentifier - Valid inputs', () => {
        it('should accept kilogram', () => {
            const result = validateUnitIdentifier('kilogram', TEST_STORE_ID);
            expect(result).toBe('kilogram');
        });

        it('should accept celsius', () => {
            const result = validateUnitIdentifier('celsius', TEST_STORE_ID);
            expect(result).toBe('celsius');
        });

        it('should accept percent', () => {
            const result = validateUnitIdentifier('percent', TEST_STORE_ID);
            expect(result).toBe('percent');
        });

        it('should accept meter', () => {
            const result = validateUnitIdentifier('meter', TEST_STORE_ID);
            expect(result).toBe('meter');
        });

        it('should accept byte', () => {
            const result = validateUnitIdentifier('byte', TEST_STORE_ID);
            expect(result).toBe('byte');
        });

        it('should accept mile-scandinavian (hyphenated)', () => {
            const result = validateUnitIdentifier('mile-scandinavian', TEST_STORE_ID);
            expect(result).toBe('mile-scandinavian');
        });

        it('should accept null value', () => {
            const result = validateUnitIdentifier(null, TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('validateUnitIdentifier - Invalid inputs', () => {
        it('should return null for invalid unit identifier', () => {
            const result = validateUnitIdentifier('invalid', TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for short form (kg)', () => {
            const result = validateUnitIdentifier('kg', TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for short form (km)', () => {
            const result = validateUnitIdentifier('km', TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for symbol (%)', () => {
            const result = validateUnitIdentifier('%', TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for uppercase (Celsius)', () => {
            const result = validateUnitIdentifier('Celsius', TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for invalid type (number)', () => {
            const result = validateUnitIdentifier(123, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for invalid type (boolean)', () => {
            const result = validateUnitIdentifier(true, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for invalid type (object)', () => {
            const result = validateUnitIdentifier({}, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for undefined', () => {
            const result = validateUnitIdentifier(undefined, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for empty string', () => {
            const result = validateUnitIdentifier('', TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('validateUnitIdentifier - Fallback behavior', () => {
        it('should return null as default fallback (no default unit)', () => {
            const result = validateUnitIdentifier('XXX', TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('validateUnitIdentifier - All supported units', () => {
        it('should accept all Intl.NumberFormat supported units', () => {
            const supportedUnits = [
                'acre',
                'bit',
                'byte',
                'celsius',
                'centimeter',
                'day',
                'degree',
                'fahrenheit',
                'fluid-ounce',
                'foot',
                'gallon',
                'gigabit',
                'gigabyte',
                'gram',
                'hectare',
                'hour',
                'inch',
                'kilobit',
                'kilobyte',
                'kilogram',
                'kilometer',
                'liter',
                'megabit',
                'megabyte',
                'meter',
                'microsecond',
                'mile',
                'mile-scandinavian',
                'milliliter',
                'millimeter',
                'millisecond',
                'minute',
                'month',
                'nanosecond',
                'ounce',
                'percent',
                'petabyte',
                'pound',
                'second',
                'stone',
                'terabit',
                'terabyte',
                'week',
                'yard',
                'year',
            ];

            supportedUnits.forEach(unit => {
                const result = validateUnitIdentifier(unit, TEST_STORE_ID);
                expect(result).toBe(unit);
            });
        });
    });
});
