import { createLazyValidator } from '../../../utils';

/**
 * Lazy loading wrapper for footer validation.
 * The module is loaded on first use and then cached for subsequent calls.
 *
 * @param {ApiResponse} value - The API response containing footer data
 * @param {string} errorStoreId - The error store identifier
 * @param {string} key - The validation context key
 * @returns {Promise<import('../../../../types/api-response.types').Footer | undefined>} Resolves with validated Footer or undefined
 */
export const lazyValidateFooter = createLazyValidator(
    () => import('./footer.schema'),
    'validateFooter'
);
