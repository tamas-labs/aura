import { RequestMethodZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import { DEFAULT_REQUEST_METHOD } from '../../../lib/default-values.lib';

/**
 * RequestMethod validation schema
 * - Validates HTTP method values
 * - Supports nullable values
 * - Allowed values: GET, POST, PUT, DELETE, PATCH
 * - Default value: DEFAULT_REQUEST_METHOD
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateRequestMethod('POST', 'my-store'); // 'POST'
 * const result2 = validateRequestMethod('GET', 'my-store'); // 'GET'
 * const result3 = validateRequestMethod(null, 'my-store'); // null
 * const result4 = validateRequestMethod('INVALID', 'my-store'); // 'POST' (fallback + error logged)
 * ```
 */

/**
 * RequestMethod validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated request method value or DEFAULT_REQUEST_METHOD fallback
 */
export const validateRequestMethod = (
    value: unknown,
    errorStoreId: string
): 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | null => {
    try {
        return RequestMethodZod().parse(value) as
            | 'GET'
            | 'POST'
            | 'PUT'
            | 'DELETE'
            | 'PATCH'
            | null;
    } catch (error) {
        const errorStore = getErrorSink(errorStoreId);

        errorStore.addSchemaValidationError(
            'RequestMethodValidator',
            'Invalid request method provided',
            'requestMethod',
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            { allowedValues: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] }
        );

        return DEFAULT_REQUEST_METHOD;
    }
};
