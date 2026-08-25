import { StringZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import { readOwnEntry } from '../../../utils/safe-object.util';
import {
    DEFAULT_SITE_NAME,
    DEFAULT_URL_PARAMETER,
    DEFAULT_HREF,
    DEFAULT_URL_PARAMETER_LAST_SEGMENT,
    DEFAULT_URL_STRUCTURE,
} from '../../../lib/default-values.lib';

const defaults: Record<string, string> = {
    siteName: DEFAULT_SITE_NAME,
    urlParameter: DEFAULT_URL_PARAMETER,
    href: DEFAULT_HREF,
    urlParameterLastSegment: DEFAULT_URL_PARAMETER_LAST_SEGMENT,
    urlStructure: DEFAULT_URL_STRUCTURE,
};

/**
 * String validation schema
 * - Validates string values
 * - Supports nullable values
 * - HTML sanitization applied automatically
 * - Default value: read from defaults by key
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateString('Hello World', 'my-store', 'siteName'); // 'Hello World' (sanitized)
 * const result2 = validateString('', 'my-store', 'siteName'); // '' (empty string)
 * const result3 = validateString(null, 'my-store', 'siteName'); // null
 * const result4 = validateString(123, 'my-store', 'siteName'); // 'https://example.com' (fallback from defaults + error logged)
 * ```
 */

/**
 * String validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @param key - The config key name (e.g. 'siteName', 'href')
 * @param min - Minimum character count (default: 0, empty string allowed)
 * @param max - Maximum character count (default: 250)
 * @returns Validated and sanitized string value, or the fallback read from defaults by key
 */
export const validateString = (
    value: unknown,
    errorStoreId: string,
    key: string,
    min = 0,
    max = 250
): string | null => {
    try {
        return StringZod(min, max).parse(value) as string | null;
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error via the centralized helper function
        errorStore.addSchemaValidationError(
            'StringValidator',
            'Invalid string value provided',
            key,
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            { constraints: { min, max } }
        );

        // Return the fallback value from defaults
        return readOwnEntry(defaults, key) ?? '';
    }
};
