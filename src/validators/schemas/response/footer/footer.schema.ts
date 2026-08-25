import type { ApiResponse, Footer } from '../../../../types/api-response.types';
import { getErrorSink } from '../../../utils/error-sink';
import { FooterZod } from '../../../../validators/zod/response/footer/footer.zod';
import { validateHeaderRows } from '../header/header-rows.schema';
import { validateFooterSettings } from './footer-settings.schema';

/**
 * Footer Schema Validator
 *
 * Validates the footer object, if it exists.
 * Footer is optional in the API response.
 *
 * Behavior:
 * 1. If there is no footer key -> return undefined (valid)
 * 2. If there is -> validate the structure (rows, settings)
 * 3. Uses the header rows validator for row validation (reusability)
 * 4. Uses its own validator for settings validation
 *
 * @param value - The full API response object
 * @param errorStoreId - Error handler store identifier
 * @param key - Validation key (e.g. 'response.footer')
 *
 * @returns {Footer | undefined} Validated Footer object or undefined
 */
export const validateFooter = (
    value: ApiResponse,
    errorStoreId: string,
    key: string
): Footer | undefined => {
    // Footer is optional - if missing or undefined, we don't validate and there is no error
    // If null, that is an error (explicit null value in the API)
    if (value.footer === undefined) {
        return undefined;
    }

    try {
        // Validate footer with the Zod schema (structure check + strip)
        const footerObj = FooterZod.parse(value.footer) as Record<string, unknown>;

        // Validate (and sanitize) rows
        // REUSE: We call the header rows validator,
        // but rewrite the key to 'response.footer.rows' for the error messages.
        const validRows = validateHeaderRows(footerObj, errorStoreId, `${key}.rows`);

        // Validate settings
        const validSettings = validateFooterSettings(footerObj, errorStoreId, key);

        // Return validated and sanitized Footer object
        return {
            rows: validRows,
            settings: validSettings,
        } as Footer;
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error via the centralized helper function
        errorStore.addSchemaValidationError(
            'FooterValidator',
            'Invalid footer structure in API response',
            key,
            value.footer,
            error instanceof Error ? error.message : 'Unknown validation error'
        );

        // Throw the error to abort execution
        throw new Error(
            `Footer validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
