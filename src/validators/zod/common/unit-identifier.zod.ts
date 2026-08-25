import { z } from 'zod';
import { cacheSchema } from '../utils/schema-cache';

/**
 * Unit Identifier Zod Schema
 * - Validates Intl.NumberFormat supported unit identifiers
 * - Based on: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/supportedValuesOf#supported_unit_identifiers
 * - Nullable values allowed
 *
 * @example
 * ```ts
 * UnitIdentifierZod().parse('kilogram'); // 'kilogram'
 * UnitIdentifierZod().parse('percent'); // 'percent'
 * UnitIdentifierZod().parse(null); // null
 * UnitIdentifierZod().parse('invalid'); // Error
 * ```
 */
export const UnitIdentifierZod = cacheSchema(() => {
    return z
        .enum([
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
        ])
        .nullable();
});
