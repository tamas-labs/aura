import { z } from 'zod';

/**
 * Cell Type Enum Zod Schema
 * - Validates the cell content type
 * - Values based on params.md specification
 * - Nullable
 *
 * @example
 * ```ts
 * CellTypeZod.parse('number'); // OK
 * CellTypeZod.parse('static'); // OK
 * CellTypeZod.parse('invalid'); // Error
 * ```
 */
export const CellTypeZod = z
    .enum([
        'number',
        'currency',
        'date',
        'datetime',
        'phone',
        'time',
        'static',
        'icon',
        'link',
        'modal',
        'reference',
        'badge',
        'progress',
        'button',
        'custom',
    ])
    .nullable();
