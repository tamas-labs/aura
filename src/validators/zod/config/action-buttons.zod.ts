import { z } from 'zod';

/**
 * ActionButtonsZod Schema
 *
 * Validates the actionButtons configuration array.
 * Allowed values: 'refresh', 'export', 'settings'
 *
 * @example
 * // Valid
 * ['refresh', 'export', 'settings']
 * ['refresh']
 * []
 * null
 *
 * // Invalid
 * ['refresh', 'invalid']
 * 'refresh'
 * [123]
 */
export const ActionButtonsZod = z
    .array(z.enum(['refresh', 'export', 'settings']))
    .refine(items => new Set(items).size === items.length, {
        message: 'Duplicate action buttons are not allowed',
    })
    .nullable();
