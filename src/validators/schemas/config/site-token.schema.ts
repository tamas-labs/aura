import { SiteTokenZod } from '../../zod';
import { DEFAULT_SITE_TOKEN } from '../../../lib/default-values.lib';
import { getErrorSink } from '../../utils/error-sink';

/**
 * SiteToken validation schema wrapper
 * - Validates the siteToken value (string | boolean | null)
 * - Null is a valid value and is not converted
 * - Default value: DEFAULT_SITE_TOKEN (only on error)
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const token = validateSiteToken('my-token', 'my-store'); // 'my-token'
 * const enabled = validateSiteToken(true, 'my-store'); // true
 * const nullValue = validateSiteToken(null, 'my-store'); // null
 * const invalid = validateSiteToken(123, 'my-store'); // false (fallback)
 * ```
 */

/**
 * SiteToken validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated string, boolean, or null value, or the default value
 */
export function validateSiteToken(value: unknown, errorStoreId: string): string | boolean | null {
    try {
        const result = SiteTokenZod.parse(value);
        return result;
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error to the error store
        errorStore.addSchemaValidationError(
            'SiteTokenValidator',
            'Invalid site token value provided',
            'siteToken',
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            {
                allowedTypes: 'string | boolean | null',
                receivedType: typeof value,
            }
        );

        // Return the fallback value on error
        return DEFAULT_SITE_TOKEN;
    }
}
