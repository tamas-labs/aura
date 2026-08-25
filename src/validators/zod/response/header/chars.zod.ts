import { z } from 'zod';

/**
 * Chars Zod Schema
 * - Validates the padding fill character
 * - Type: string
 * - Minimum length: 1
 * - Maximum length: 10
 * - Nullable: yes (optional field)
 * - Does NOT use an HTML sanitizer, since this is only a formatting character
 *
 * @example
 * ```ts
 * CharsZod.parse("0"); // "0"
 * CharsZod.parse("."); // "."
 * CharsZod.parse(null); // null
 * CharsZod.parse(""); // error (min 1)
 * ```
 */
export const CharsZod = z.string().min(1).max(10).nullable();
