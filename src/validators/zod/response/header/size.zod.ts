import { z } from 'zod';

/**
 * Size Zod Schema
 * - Validates size
 * - Enum: 'xs', 'sm', 'md', 'lg', 'xl'
 * - Nullable: yes
 *
 * @example
 * ```ts
 * SizeZod.parse('xs'); // success
 * SizeZod.parse('lg'); // success
 * SizeZod.parse('huge'); // error
 * ```
 */
export const SizeZod = z.enum(['xs', 'sm', 'md', 'lg', 'xl']).nullable();
