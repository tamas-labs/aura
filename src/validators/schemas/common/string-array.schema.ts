import { StringArrayZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';

/**
 * Generic `string[]` validator function (e.g. raw HTML allowed tag/attr lists).
 *
 * - Validates the string array with the `StringArrayZod` schema
 * - Supports nullable values
 * - On error, returns the given `fallback` value and logs to the error store
 *
 * @param value - The value to validate (string[] or null)
 * @param errorStoreId - The error handler store identifier
 * @param key - The config key name (e.g. 'rawHtmlAllowedTags')
 * @param fallback - Value returned on invalid input
 * @returns Validated string[] value (or null), or the fallback on error
 *
 * @example
 * ```ts
 * validateStringArray(['b', 'i'], 'store', 'rawHtmlAllowedTags', ['a']); // ['b', 'i']
 * validateStringArray(null, 'store', 'rawHtmlAllowedTags', ['a']); // null
 * validateStringArray('nope', 'store', 'rawHtmlAllowedTags', ['a']); // ['a'] (fallback + error)
 * ```
 */
export const validateStringArray = (
    value: unknown,
    errorStoreId: string,
    key: string,
    fallback: string[]
): string[] | null => {
    try {
        return StringArrayZod.parse(value);
    } catch (error) {
        const errorStore = getErrorSink(errorStoreId);

        errorStore.addSchemaValidationError(
            'StringArrayValidator',
            `Invalid string array provided for "${key}"`,
            key,
            value,
            error instanceof Error ? error.message : 'Unknown validation error'
        );

        return fallback;
    }
};
