import { ErrorReportingApiKeyZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import { DEFAULT_ERROR_REPORTING_API_KEY } from '../../../lib/default-values.lib';

/**
 * ErrorReportingApiKey validation schema
 * - Validates the error reporting API key
 * - Supports nullable values
 * - Min 10, max 200 characters (if not an empty string)
 * - Only alphanumeric characters, hyphen, and underscore are allowed
 * - Empty string is allowed (when there is no API key)
 * - Default value: DEFAULT_ERROR_REPORTING_API_KEY ('')
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateErrorReportingApiKey('abc123-def_456', 'my-store'); // 'abc123-def_456'
 * const result2 = validateErrorReportingApiKey('', 'my-store'); // ''
 * const result3 = validateErrorReportingApiKey(null, 'my-store'); // null
 * const result4 = validateErrorReportingApiKey('invalid!@#', 'my-store'); // '' (fallback + error logged)
 * ```
 */

/**
 * ErrorReportingApiKey validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated API key value or DEFAULT_ERROR_REPORTING_API_KEY fallback
 */
export const validateErrorReportingApiKey = (
    value: unknown,
    errorStoreId: string
): string | null => {
    try {
        return ErrorReportingApiKeyZod().parse(value) as string | null;
    } catch (error) {
        const errorStore = getErrorSink(errorStoreId);

        errorStore.addSchemaValidationError(
            'ErrorReportingApiKeyValidator',
            'Invalid error reporting API key provided',
            'errorReportingApiKey',
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            {
                requirements:
                    'Alphanumeric characters, hyphens and underscores (10-200 characters), or an empty string',
                pattern: '^[a-zA-Z0-9_-]+$',
            }
        );

        return DEFAULT_ERROR_REPORTING_API_KEY;
    }
};
