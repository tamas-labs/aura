import { z } from 'zod';

/**
 * String array Zod schema
 * - General-purpose `string[]` validator (e.g. raw HTML allowed tag/attr lists)
 * - Every element is a non-empty string, max 100 characters
 * - The array has max 200 elements
 * - Supports nullable values
 */
export const StringArrayZod = z.array(z.string().min(1).max(100)).max(200).nullable();
