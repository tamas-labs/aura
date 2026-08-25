import { getErrorSink } from '../../../utils/error-sink';
import { HeaderCellsZod } from '../../../zod/response/header/header-cells.zod';
import { validateHeaderCell } from './header-cell.schema';

/**
 * Header Cells Schema Validator
 *
 * Validates the structure of the header.rows[].cells array and the type of its elements.
 * Uses centralized error handling via the error handler store.
 *
 * Validation rules:
 * - `cells` is a required field in every row object
 * - `cells` must be of array type
 * - `cells` must contain at least 1 element
 * - the elements of `cells` must be of object type
 * - the elements of `cells` must be valid header cells (via a validateHeaderCell call)
 *
 * @param row - A single row object from the header.rows array
 * @param errorStoreId - Error handler store identifier
 * @param key - Config/validation key name (e.g. 'response.header.rows[0].cells')
 * @param rowIndex - The row's index (default: 0)
 *
 * @throws Error - If validation fails
 * @returns {Record<string, unknown>[]} - The sanitized cells array
 *
 * @example
 * ```typescript
 * const row = {
 *   cells: [
 *     { content: 'ID', field: 'id' },
 *     { content: 'Name', field: 'name' }
 *   ]
 * };
 *
 * const validCells = validateHeaderCells(row, 'my-store-errors', 'response.header.rows[0].cells', 0);
 * ```
 */
export const validateHeaderCells = (
    row: Record<string, unknown>,
    errorStoreId: string,
    key: string,
    rowIndex: number = 0
): Record<string, unknown>[] => {
    try {
        // CRITICAL: Explicitly check whether the cells key exists
        if (!row.cells) {
            throw new Error('Header row cells field is required and cannot be null or undefined');
        }

        // Validate cells with the Zod schema
        const cells = HeaderCellsZod.parse(row.cells) as Record<string, unknown>[];

        // Iterate and validate (and sanitize) each cell individually
        return cells.map((cell, cellIndex) => {
            return validateHeaderCell(cell, errorStoreId, cellIndex, rowIndex);
        });
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error via the centralized helper function
        errorStore.addSchemaValidationError(
            'HeaderCellsValidator',
            'Invalid header cells structure',
            key,
            row.cells,
            error instanceof Error ? error.message : 'Unknown validation error',
            {
                note: 'Header cells must be a non-empty array of objects',
                constraints: { minLength: 1 },
            }
        );

        // Throw the error to abort execution
        throw new Error(
            `Header cells validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
    }
};
