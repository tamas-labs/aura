import { z } from 'zod';
import { htmlSanitizer } from '../../../sanitizers';

/**
 * Static Unit Zod Schema
 * - Validates the unit field for static column configs
 * - Accepts free-form unit strings (e.g. 'percent', 'GB', '°C', 'km/h')
 * - Unlike UnitIdentifierZod, NOT restricted to Intl.NumberFormat identifiers
 * - HTML sanitization applied
 * - Nullable: yes
 *
 * @example
 * ```ts
 * StaticUnitZod.parse('percent'); // 'percent'
 * StaticUnitZod.parse('GB'); // 'GB'
 * StaticUnitZod.parse('°C'); // '°C'
 * StaticUnitZod.parse('km/h'); // 'km/h'
 * StaticUnitZod.parse(null); // null
 * StaticUnitZod.parse(''); // Error (min 1 char)
 * ```
 */
export const StaticUnitZod = z
    .string()
    .min(1, 'Unit cannot be empty')
    .max(50, 'Unit string too long (max 50 chars)')
    .transform(htmlSanitizer)
    .nullable();
