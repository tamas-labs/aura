import { getErrorSink } from '../../../utils/error-sink';
import { HeaderSettingsZod } from '../../../zod/response/header/header-settings.zod';
import type { HeaderRow, HeaderSettings } from '../../../../types/api-response.types';

/**
 * Header Settings Schema Validator
 *
 * Validates the header settings object.
 * Uses centralized error handling via the error handler store.
 *
 * Validation rules:
 * - Optional field (if missing or null, it is valid)
 * - If present, it must be an object
 * - Its fields (`sticky`, `height`, `searchableItems`) must be of valid types
 * - Cross-field validation: `searchableItems` can only contain fields that
 *   exist among the `field` values of the `headerRows` cells.
 *
 * @param value - Header object from the API response (which may contain settings)
 * @param errorStoreId - Error handler store identifier
 * @param key - Config/validation key name (e.g. 'response.header')
 * @param headerRows - Validated header rows for checking the fields
 *
 * @example
 * ```typescript
 * const header = {
 *   settings: { sticky: true, searchableItems: ['id'] }
 * };
 * const rows = [{ cells: [{ field: 'id', content: 'ID', key: 'id' }] }];
 *
 * const validSettings = validateHeaderSettings(header, 'store-id', 'key', rows);
 * ```
 */
export const validateHeaderSettings = (
    value: Record<string, unknown>,
    errorStoreId: string,
    key: string,
    headerRows: HeaderRow[] = []
): HeaderSettings | null | undefined => {
    // If there is no settings or it's null/undefined, it's valid because it's optional
    if (!value.settings) {
        return undefined;
    }

    try {
        // Validate settings with the Zod schema
        // HeaderSettingsZod strips the extra fields
        const settings = HeaderSettingsZod.parse(value.settings) as HeaderSettings | null;

        // Cross-field validation: searchableItems
        if (settings && settings.searchableItems && Array.isArray(settings.searchableItems)) {
            // Collect the valid fields from the header rows
            const validFields = new Set<string>();
            headerRows.forEach(row => {
                if (row.cells && Array.isArray(row.cells)) {
                    row.cells.forEach(cell => {
                        if (cell.field) {
                            validFields.add(cell.field);
                        }
                    });
                }
            });

            // Look for invalid items
            const invalidItems = settings.searchableItems.filter(item => !validFields.has(item));

            if (invalidItems.length > 0) {
                const errorStore = getErrorSink(errorStoreId);
                const validFieldList = Array.from(validFields).join(', ');
                const invalidItemList = invalidItems.join(', ');

                errorStore.addSchemaValidationError(
                    'HeaderSettingsValidator',
                    'Invalid searchable items in header settings',
                    `${key}.searchableItems`,
                    settings.searchableItems,
                    `The following items are not present in header fields: ${invalidItemList}`,
                    {
                        note: `Available fields are: ${validFieldList || 'none'}`,
                    }
                );

                // Abort validation by throwing an error
                throw new Error(`Invalid searchable items: ${invalidItemList}`);
            }
        }

        return settings;
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // If the cross-field validation already threw an error and added it to the store,
        // there is no need to add it again, unless it's a Zod error.
        // But here it's simpler to just rethrow if the error is already in the store.
        // getErrorSink's 'addSchemaValidationError' does not prevent the throw.

        // Check whether this error has already been handled (e.g. thrown by cross-field validation)
        // If it's a Zod error, handle it here with the default message.
        if (error instanceof Error && error.message.startsWith('Invalid searchable items')) {
            throw error;
        }

        // Add the error via the centralized helper function (for Zod errors)
        errorStore.addSchemaValidationError(
            'HeaderSettingsValidator',
            'Invalid header settings structure',
            key,
            value.settings,
            error instanceof Error ? error.message : 'Unknown validation error',
            {
                note: 'Settings must be an object with optional sticky (boolean), height (string) and searchableItems (string array) properties',
            }
        );

        // Throw the error to abort execution
        throw new Error(
            `Header settings validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
