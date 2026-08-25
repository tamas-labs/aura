import { getErrorSink } from '../../../utils/error-sink';
import { HeaderRowsZod } from '../../../zod/response/header/header-rows.zod';
import { validateHeaderCells } from './header-cells.schema';

/**
 * Header Rows Schema Validator
 *
 * Validates the structure of the header.rows array and the type of its elements.
 * Uses centralized error handling via the error handler store.
 *
 * Validation rules:
 * - `rows` is a required field on the header object
 * - `rows` must be of array type
 * - `rows` must contain at least 1 element
 * - the elements of `rows` must be of object type
 *
 * @param value - Header object from the API response
 * @param errorStoreId - Error handler store identifier
 * @param key - Config/validation key name (e.g. 'response.header.rows')
 *
 * @throws Error - If validation fails
 * @returns {Record<string, unknown>[]} - The sanitized rows array
 *
 * @example
 * ```typescript
 * const header = {
 *   rows: [
 *     { cells: [...] },
 *     { cells: [...] }
 *   ]
 * };
 *
 * const validRows = validateHeaderRows(header, 'my-store-errors', 'response.header.rows');
 * ```
 */
export const validateHeaderRows = (
    value: Record<string, unknown>,
    errorStoreId: string,
    key: string
): Record<string, unknown>[] => {
    try {
        // CRITICAL: Explicitly check whether the rows key exists
        if (!value.rows) {
            throw new Error('Header rows field is required and cannot be null or undefined');
        }

        // Validate rows with the Zod schema
        // HeaderRowsZod strips the row-level extra fields
        const rows = HeaderRowsZod.parse(value.rows) as Record<string, unknown>[];

        // After validating rows, validate the cells array within each row
        return rows.map((row, index) => {
            const validCells = validateHeaderCells(
                row,
                errorStoreId,
                `${key}[${index}].cells`,
                index
            );
            return {
                ...row,
                cells: validCells,
            };
        });
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error via the centralized helper function
        errorStore.addSchemaValidationError(
            'HeaderRowsValidator',
            'Invalid header rows structure',
            key,
            value.rows,
            error instanceof Error ? error.message : 'Unknown validation error',
            {
                note: 'Header rows must be a non-empty array of objects',
                constraints: { minLength: 1 },
            }
        );

        // Throw the error to abort execution
        throw new Error(
            `Header rows validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
