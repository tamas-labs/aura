import { z } from 'zod';

/**
 * Boolean Zod Schema
 * - Accepts the boolean type
 * - Allows nullable values
 * - Default value: false
 *
 * @example
 * ```ts
 * BooleanZod.parse(true); // true
 * BooleanZod.parse(false); // false
 * BooleanZod.parse(null); // null
 * BooleanZod.parse(undefined); // false (default)
 * ```
 */
export const BooleanZod = z.boolean().nullable().default(false);
