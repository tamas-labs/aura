import type { ApiResponse, Header } from '../../../../types/api-response.types';
import { getErrorSink } from '../../../utils/error-sink';
import { HeaderZod } from '../../../../validators/zod/response/header/header.zod';
import { validateHeaderRows } from './header-rows.schema';
import { validateHeaderSettings } from './header-settings.schema';

/**
 * Header Schema Validator
 *
 * Validates the header object. Unlike the footer, the header is required in the
 * API response — without it there are no columns to render.
 *
 * Behavior:
 * 1. If there is no header key -> error (the table cannot be rendered)
 * 2. If there is -> validate the structure (rows, settings)
 * 3. `HeaderZod` strips the extra fields
 * 4. The validated rows are passed on to the settings validator for cross-field
 *    validation (e.g. `searchableItems`)
 *
 * On failure the error is reported through the error sink and then rethrown, so
 * response processing aborts instead of continuing with a half-validated header.
 *
 * @param value - The full API response object
 * @param errorStoreId - Error handler store identifier
 * @param key - Validation key (e.g. 'response.header')
 *
 * @returns {Header} Validated Header object
 *
 * @throws {Error} If the header is missing or its structure is invalid
 */
export const validateHeader = (value: ApiResponse, errorStoreId: string, key: string): Header => {
    try {
        // If there is no header key in the API response, throw an error
        if (!value.header) {
            throw new Error('Header field is required in API response');
        }

        // Validate header (and strip)
        // HeaderZod strips the extra fields
        const headerObj = HeaderZod.parse(value.header) as Record<string, unknown>;

        // Validate (and sanitize) header rows
        const validRows = validateHeaderRows(headerObj, errorStoreId, `${key}.rows`);

        // Validate (and sanitize) header settings
        // Pass the validated rows for cross-field validation (searchableItems)
        const validSettings = validateHeaderSettings(
            headerObj,
            errorStoreId,
            `${key}.settings`,
            validRows
        );

        // Return validated and sanitized Header object
        return {
            rows: validRows,
            settings: validSettings,
        } as Header;
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error via the centralized helper function
        errorStore.addSchemaValidationError(
            'HeaderValidator',
            'Invalid header structure in API response',
            key,
            value.header,
            error instanceof Error ? error.message : 'Unknown validation error'
        );

        // Throw the error to abort execution
        throw new Error(
            `Header validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
