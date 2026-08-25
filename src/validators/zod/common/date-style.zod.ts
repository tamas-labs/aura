import { z } from 'zod';
import { cacheSchema } from '../utils/schema-cache';

/**
 * DateStyle Zod Schema
 * - Validates date display style values
 * - Allowed values: 'short', 'medium', 'long'
 * - Nullable values allowed
 * - Used with Intl.DateTimeFormat options
 *
 * @example
 * ```ts
 * DateStyleZod().parse('short'); // 'short'
 * DateStyleZod().parse('medium'); // 'medium'
 * DateStyleZod().parse('long'); // 'long'
 * DateStyleZod().parse(null); // null
 * DateStyleZod().parse('YYYY.MM.DD'); // Error
 * ```
 */
export const DateStyleZod = cacheSchema(() => {
    return z.enum(['short', 'medium', 'long']).nullable();
});
