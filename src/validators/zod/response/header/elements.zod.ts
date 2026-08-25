import { z } from 'zod';
import { htmlSanitizer } from '../../../sanitizers';

/**
 * Elements Zod Schema
 *
 * Validates the `elements` property for filterable columns.
 * Can be either:
 * 1. An array of strings or numbers (e.g. `["Active", "Inactive"]` or `[1, 2, 3]`)
 * 2. A record with string/number values (e.g. `{ "0": "Inactive", "1": "Active" }`)
 *
 * Requirements:
 * - Must not be empty (min 1 element/key)
 * - Values must be strings or numbers
 * - String values are sanitized using htmlSanitizer
 * - Nullable
 *
 * @example
 * ```ts
 * ElementsZod.parse(["Active", "Inactive"]); // OK
 * ElementsZod.parse([1, 2, 3]); // OK
 * ElementsZod.parse({ "0": "Inactive", "1": "Active" }); // OK
 * ElementsZod.parse([]); // Error: min 1
 * ElementsZod.parse({}); // Error: min 1
 * ```
 */
export const ElementsZod = z
    .union([
        // Array format: ["Value1", "Value2"] or [1, 2]
        z
            .array(z.union([z.string().min(1).transform(htmlSanitizer), z.number()]))
            .min(1, 'Elements array must contain at least one element'),

        // Record format: { "key1": "Value1", "key2": 2 }
        z
            .record(
                z.string(), // Keys are always strings in JS objects
                z.union([z.string().min(1).transform(htmlSanitizer), z.number()])
            )
            .refine(data => Object.keys(data).length > 0, {
                message: 'Elements object must contain at least one key-value pair',
            }),
    ])
    .nullable();
