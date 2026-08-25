import { createLazyValidator } from '../../../utils';

/**
 * Lazy loading wrapper for header validation.
 * The module is loaded on first use and then cached for subsequent calls.
 *
 * @param {ApiResponse} value - The API response containing header data
 * @param {string} errorStoreId - The error store identifier
 * @param {string} key - The validation context key
 * @returns {Promise<import('../../../../types/api-response.types').Header>} Resolves with validated Header
 */
export const lazyValidateHeader = createLazyValidator(
    () => import('./header.schema'),
    'validateHeader'
);

/**
 * Lazy loading wrapper for header rows validation.
 *
 * @param {unknown} value - The value to validate (expected: HeaderRow[])
 * @param {string} errorStoreId - The error store identifier
 * @param {string} key - The validation context key
 * @returns {Promise<void>} Resolves when validation is complete
 */
export const lazyValidateHeaderRows = createLazyValidator(
    () => import('./header-rows.schema'),
    'validateHeaderRows'
);

/**
 * Lazy loading wrapper for header cells validation.
 *
 * @param {unknown} value - The value to validate (expected: HeaderCell[])
 * @param {string} errorStoreId - The error store identifier
 * @param {string} key - The validation context key
 * @returns {Promise<void>} Resolves when validation is complete
 */
export const lazyValidateHeaderCells = createLazyValidator(
    () => import('./header-cells.schema'),
    'validateHeaderCells'
);

/**
 * Lazy loading wrapper for a single header cell validation.
 *
 * @param {unknown} cell - The cell object to validate (expected: HeaderCell)
 * @param {string} errorStoreId - The error store identifier
 * @param {number} cellIndex - The cell index in the cells array
 * @param {number} rowIndex - The row index (optional, default: 0)
 * @returns {Promise<void>} Resolves when validation is complete
 */
export const lazyValidateHeaderCell = createLazyValidator(
    () => import('./header-cell.schema'),
    'validateHeaderCell'
);
