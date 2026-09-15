import { BooleanZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import { readOwnEntry } from '../../../utils/safe-object.util';
import {
    DEFAULT_DEBUG,
    DEFAULT_SHOW_FOOTER,
    DEFAULT_SHOW_HEADER_SEARCH,
    DEFAULT_SHOW_LOADING_OVERLAY,
    DEFAULT_SHOW_LOADING_BAR,
    DEFAULT_SHOW_TOOLBAR_TITLE,
    DEFAULT_EXTERNAL_PAGINATOR,
    DEFAULT_RESOURCES,
    DEFAULT_DISABLE_SESSION,
    DEFAULT_ALLOW_EXTERNAL_API,
    DEFAULT_ERROR_REPORTING,
    DEFAULT_ACCENT_INSENSITIVE_SEARCH,
} from '../../../lib/default-values.lib';

const defaults: Record<string, boolean> = {
    debug: DEFAULT_DEBUG,
    showFooter: DEFAULT_SHOW_FOOTER,
    showHeaderSearch: DEFAULT_SHOW_HEADER_SEARCH,
    showLoadingOverlay: DEFAULT_SHOW_LOADING_OVERLAY,
    showLoadingBar: DEFAULT_SHOW_LOADING_BAR,
    showToolbarTitle: DEFAULT_SHOW_TOOLBAR_TITLE,
    externalPaginator: DEFAULT_EXTERNAL_PAGINATOR,
    resources: DEFAULT_RESOURCES,
    disableSession: DEFAULT_DISABLE_SESSION,
    allowExternalApi: DEFAULT_ALLOW_EXTERNAL_API,
    errorReporting: DEFAULT_ERROR_REPORTING,
    accentInsensitiveSearch: DEFAULT_ACCENT_INSENSITIVE_SEARCH,
};

/**
 * Boolean validation schema
 * - Validates boolean values
 * - Supports nullable values
 * - Default value: read from defaults by key
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateBoolean(true, 'my-store', 'debug'); // true
 * const result2 = validateBoolean(false, 'my-store', 'debug'); // false
 * const result3 = validateBoolean(null, 'my-store', 'debug'); // null
 * const result4 = validateBoolean('invalid', 'my-store', 'debug'); // false (fallback from defaults + error logged)
 * ```
 */

/**
 * Boolean validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @param key - The config key name (e.g. 'debug', 'showFooter')
 * @returns Validated boolean value, or the fallback read from defaults by key
 */
export const validateBoolean = (
    value: unknown,
    errorStoreId: string,
    key: string
): boolean | null => {
    try {
        return BooleanZod.parse(value);
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error via the centralized helper function
        errorStore.addSchemaValidationError(
            'BooleanValidator',
            'Invalid boolean value provided',
            key,
            value,
            error instanceof Error ? error.message : 'Unknown validation error'
        );

        // Return the fallback value from defaults
        return readOwnEntry(defaults, key) ?? false;
    }
};
