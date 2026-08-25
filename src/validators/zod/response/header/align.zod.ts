import { z } from 'zod';

/**
 * Align Zod Schema
 * - Validates text alignment
 * - Enum: 'start', 'center', 'end'
 * - Nullable: yes
 *
 * @example
 * ```ts
 * AlignZod.parse('start'); // success
 * AlignZod.parse('center'); // success
 * AlignZod.parse('left'); // error
 * ```
 */
export const AlignZod = z.enum(['start', 'center', 'end']).nullable();
