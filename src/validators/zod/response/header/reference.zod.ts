import { z } from 'zod';

/**
 * Reference Field Zod Schema
 * - Validates the reference field name
 * - Must be a string
 * - Length between 1 and 100 characters
 * - Nullable values allowed
 *
 * @example
 * ```ts
 * ReferenceZod.parse('user_id'); // 'user_id'
 * ReferenceZod.parse(null); // null
 * ReferenceZod.parse(''); // throws error (min 1)
 * ReferenceZod.parse(123); // throws error (not string)
 * ```
 */
export const ReferenceZod = z.string().min(1).max(100).nullable();
