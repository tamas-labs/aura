import { z } from 'zod';

/**
 * String array validation for class names
 * - Cannot be an empty array
 * - Cannot contain an empty string
 */
const ClassArrayZod = z
    .array(z.string().min(1, 'Class name cannot be empty'))
    .min(1, 'Class array cannot be empty');

/**
 * Nested object validation (e.g. dataTypes)
 * - Dynamic keys
 * - Every value is a string array
 * - Cannot be an empty array
 * - Cannot be an empty string
 */
const NestedClassObjectZod = z.record(z.string(), ClassArrayZod);

/**
 * Classes object validation
 * - Dynamic keys (table, icon, button, link, modal, etc.)
 * - Values: string[] OR nested object (Record<string, string[]>)
 * - For the dataTypes key it's always a nested object
 * - Nullable (falls back to defaultConfigLib.classes)
 */
export const ClassesZod = z
    .record(z.string(), z.union([ClassArrayZod, NestedClassObjectZod]))
    .nullable()
    .refine(
        data => {
            // If null, it's valid (will fall back)
            if (data === null) return true;

            // Check the dataTypes key
            if ('dataTypes' in data) {
                const dataTypes = data.dataTypes;

                // dataTypes cannot be a string array, only a nested object
                if (Array.isArray(dataTypes)) {
                    return false;
                }

                // dataTypes must be an object
                if (typeof dataTypes !== 'object' || dataTypes === null) {
                    return false;
                }
            }

            return true;
        },
        {
            message: 'dataTypes must be a nested object, not a string array',
        }
    );
