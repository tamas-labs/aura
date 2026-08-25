import { z } from 'zod';

/**
 * String array validation for icon names
 * - Cannot be an empty array
 * - Cannot contain an empty string
 */
const IconArrayZod = z
    .array(z.string().min(1, 'Icon name cannot be empty'))
    .min(1, 'Icon array cannot be empty');

/**
 * Nested object validation (e.g. sortable)
 * - Dynamic keys
 * - Every value is a string array
 * - Cannot be an empty array
 * - Cannot be an empty string
 */
const NestedIconObjectZod = z.record(z.string(), IconArrayZod);

/**
 * Icons object validation
 * - Dynamic keys (sortable, filterable, settings, etc.)
 * - Values: string[] OR a nested object (Record<string, string[]>)
 * - Nullable (falls back to defaultConfigLib.icons)
 */
export const IconsZod = z
    .record(z.string(), z.union([IconArrayZod, NestedIconObjectZod]))
    .nullable();
