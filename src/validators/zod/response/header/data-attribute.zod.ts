import { z } from 'zod';
import { htmlSanitizer } from '../../../sanitizers';

/**
 * Data Attribute Value Zod Schema
 * - Validates the value of a data-* attribute
 * - String, max 1000 chars
 * - Supports placeholders like {field}
 * - HTML sanitization applied
 * - Nullable
 *
 * @example
 * ```ts
 * DataAttributeValueZod.parse('some-value'); // OK
 * DataAttributeValueZod.parse('{id}'); // OK
 * ```
 */
export const DataAttributeValueZod = z
    .string()
    .max(1000, 'Data attribute value too long')
    .transform(htmlSanitizer)
    .nullable();

/**
 * Helper to check if a key is a data attribute
 *
 * @param key - The object key to check
 * @returns true if key starts with 'data-'
 */
export const isDataAttribute = (key: string): boolean => {
    return key.startsWith('data-');
};
