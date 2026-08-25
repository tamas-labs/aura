import { getErrorSink } from '../../../utils/error-sink';
import { FooterSettingsZod } from '../../../zod/response/footer/footer-settings.zod';
import type { FooterSettings } from '../../../../types/api-response.types';

/**
 * Footer Settings Schema Validator
 *
 * Validates the footer settings object.
 * Uses centralized error handling via the error handler store.
 *
 * Validation rules:
 * - Optional field (if missing or null, it is valid -> undefined)
 * - If present, it must be an object
 * - Its fields (`sticky`, `height`) must be of valid types
 * - No cross-field validation (like searchableItems on the header)
 *
 * @param value - Footer object from the API response (which may contain settings)
 * @param errorStoreId - Error handler store identifier
 * @param key - Config/validation key name (e.g. 'response.footer')
 *
 * @returns {FooterSettings | null | undefined} Validated settings or undefined/null
 *
 * @example
 * ```typescript
 * const footer = {
 *   settings: { sticky: true }
 * };
 *
 * const validSettings = validateFooterSettings(footer, 'store-id', 'key');
 * ```
 */
export const validateFooterSettings = (
    value: Record<string, unknown>,
    errorStoreId: string,
    key: string
): FooterSettings | null | undefined => {
    // If there is no settings (undefined) or it's an empty field, it's valid because it's optional
    if (value.settings === undefined || value.settings === null) {
        return value.settings as undefined | null;
    }

    try {
        // Validate settings with the Zod schema
        // FooterSettingsZod strips the extra fields
        // Since it's nullable(), the result can also be null
        const settings = FooterSettingsZod.parse(value.settings) as FooterSettings | null;

        return settings;
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error via the centralized helper function
        errorStore.addSchemaValidationError(
            'FooterSettingsValidator',
            'Invalid footer settings structure',
            `${key}.settings`,
            value.settings,
            error instanceof Error ? error.message : 'Unknown validation error'
        );

        // Throw the error to abort execution
        throw new Error(
            `Footer settings validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
