import { describe, it, expect } from 'vitest';
import { UnitIdentifierZod } from '../unit-identifier.zod';

describe('UnitIdentifierZod', () => {
    describe('valid unit identifiers', () => {
        it('should accept common units', () => {
            expect(UnitIdentifierZod().parse('kilogram')).toBe('kilogram');
            expect(UnitIdentifierZod().parse('meter')).toBe('meter');
            expect(UnitIdentifierZod().parse('celsius')).toBe('celsius');
            expect(UnitIdentifierZod().parse('percent')).toBe('percent');
            expect(UnitIdentifierZod().parse('liter')).toBe('liter');
            expect(UnitIdentifierZod().parse('kilometer')).toBe('kilometer');
        });

        it('should accept IT units', () => {
            const itUnits = [
                'byte',
                'kilobyte',
                'megabyte',
                'gigabyte',
                'terabyte',
                'petabyte',
                'bit',
                'kilobit',
                'megabit',
                'gigabit',
                'terabit',
            ];
            itUnits.forEach(unit => {
                expect(UnitIdentifierZod().parse(unit)).toBe(unit);
            });
        });

        it('should accept time units', () => {
            const timeUnits = [
                'second',
                'millisecond',
                'microsecond',
                'nanosecond',
                'minute',
                'hour',
                'day',
                'week',
                'month',
                'year',
            ];
            timeUnits.forEach(unit => {
                expect(UnitIdentifierZod().parse(unit)).toBe(unit);
            });
        });

        it('should accept special naming units', () => {
            expect(UnitIdentifierZod().parse('mile-scandinavian')).toBe('mile-scandinavian');
            expect(UnitIdentifierZod().parse('fluid-ounce')).toBe('fluid-ounce');
        });

        it('should accept null value', () => {
            expect(UnitIdentifierZod().parse(null)).toBeNull();
        });
    });

    describe('invalid unit identifiers', () => {
        it('should throw error for invalid unit string', () => {
            expect(() => UnitIdentifierZod().parse('invalid')).toThrow();
        });

        it('should throw error for short forms', () => {
            expect(() => UnitIdentifierZod().parse('kg')).toThrow();
            expect(() => UnitIdentifierZod().parse('km')).toThrow();
        });

        it('should throw error for symbols', () => {
            expect(() => UnitIdentifierZod().parse('%')).toThrow();
        });

        it('should throw error for uppercase units (case sensitivity)', () => {
            expect(() => UnitIdentifierZod().parse('Celsius')).toThrow();
        });

        it('should throw error for empty string', () => {
            expect(() => UnitIdentifierZod().parse('')).toThrow();
        });

        it('should throw error for partial match', () => {
            expect(() => UnitIdentifierZod().parse('kilo')).toThrow();
            expect(() => UnitIdentifierZod().parse('meters')).toThrow();
        });
    });

    describe('invalid types', () => {
        it('should throw error for number type', () => {
            expect(() => UnitIdentifierZod().parse(123)).toThrow();
        });

        it('should throw error for boolean type', () => {
            expect(() => UnitIdentifierZod().parse(true)).toThrow();
        });

        it('should throw error for object type', () => {
            expect(() => UnitIdentifierZod().parse({})).toThrow();
        });

        it('should throw error for array type', () => {
            expect(() => UnitIdentifierZod().parse([])).toThrow();
        });

        it('should throw error for undefined', () => {
            expect(() => UnitIdentifierZod().parse(undefined)).toThrow();
        });
    });

    describe('safeParse validation', () => {
        it('should return success=true for valid unit', () => {
            const result = UnitIdentifierZod().safeParse('kilogram');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('kilogram');
            }
        });

        it('should return success=false for invalid unit', () => {
            const result = UnitIdentifierZod().safeParse('kg');
            expect(result.success).toBe(false);
        });

        it('should return success=true for null', () => {
            const result = UnitIdentifierZod().safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeNull();
            }
        });

        it('should return success=false for invalid type', () => {
            const result = UnitIdentifierZod().safeParse(123);
            expect(result.success).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should accept all supported unit identifiers', () => {
            const allUnits = [
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

            allUnits.forEach(unit => {
                const result = UnitIdentifierZod().parse(unit);
                expect(result).toBe(unit);
            });
        });
    });
});
