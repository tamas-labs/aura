import { createLazyValidator } from '../../../utils';

/**
 * Lazy loading wrapper for body validation.
 * The module is loaded on first use and then cached for subsequent calls.
 *
 * @param {ApiResponse} value - The API response containing body data
 * @param {string} errorStoreId - The error store identifier
 * @param {string} key - The validation context key
 * @returns {Promise<import('../../../../types/api-response.types').Body | undefined>} Resolves with validated Body or undefined
 */
export const lazyValidateBody = createLazyValidator(() => import('./body.schema'), 'validateBody');

/**
 * Lazy loading wrapper for static column config validation.
 * The module is loaded on first use and then cached for subsequent calls.
 *
 * @param {Record<string, unknown>} config - The static config object to validate
 * @param {string} errorStoreId - The error store identifier
 * @param {string} configKey - The validation context key (e.g. 'response.body.columnConfigs.idPrefix')
 * @returns {Promise<import('../../../../types/api-response.types').StaticConfig>} Resolves with validated StaticConfig
 */
export const lazyValidateStaticConfig = createLazyValidator(
    () => import('./static-config.schema'),
    'validateStaticConfig'
);

/**
 * Lazy loading wrapper for icon column config validation.
 * The module is loaded on first use and then cached for subsequent calls.
 *
 * @param {Record<string, unknown>} config - The icon config object to validate
 * @param {string} errorStoreId - The error store identifier
 * @param {string} configKey - The validation context key (e.g. 'response.body.columnConfigs.status_icon')
 * @returns {Promise<import('../../../../types/api-response.types').IconConfig>} Resolves with validated IconConfig
 */
export const lazyValidateIconConfig = createLazyValidator(
    () => import('./icon-config.schema'),
    'validateIconConfig'
);

/**
 * Lazy loading wrapper for modal column config validation.
 * The module is loaded on first use and then cached for subsequent calls.
 *
 * @param {Record<string, unknown>} config - The modal config object to validate
 * @param {string} errorStoreId - The error store identifier
 * @param {string} configKey - The validation context key (e.g. 'response.body.columnConfigs.edit_modal')
 * @returns {Promise<import('../../../../types/api-response.types').ModalConfig>} Resolves with validated ModalConfig
 */
export const lazyValidateModalConfig = createLazyValidator(
    () => import('./modal-config.schema'),
    'validateModalConfig'
);

/**
 * Lazy loading wrapper for link column config validation.
 * The module is loaded on first use and then cached for subsequent calls.
 *
 * @param {Record<string, unknown>} config - The link config object to validate
 * @param {string} errorStoreId - The error store identifier
 * @param {string} configKey - The validation context key (e.g. 'response.body.columnConfigs.name')
 * @returns {Promise<import('../../../../types/api-response.types').LinkConfig>} Resolves with validated LinkConfig
 */
export const lazyValidateLinkConfig = createLazyValidator(
    () => import('./link-config.schema'),
    'validateLinkConfig'
);

/**
 * Lazy loading wrapper for reference column config validation.
 * The module is loaded on first use and then cached for subsequent calls.
 *
 * @param {Record<string, unknown>} config - The reference config object to validate
 * @param {string} errorStoreId - The error store identifier
 * @param {string} configKey - The validation context key (e.g. 'response.body.columnConfigs.fullName')
 * @returns {Promise<import('../../../../types/api-response.types').ReferenceConfig>} Resolves with validated ReferenceConfig
 */
export const lazyValidateReferenceConfig = createLazyValidator(
    () => import('./reference-config.schema'),
    'validateReferenceConfig'
);

/**
 * Lazy loading wrapper for button column config validation.
 * The module is loaded on first use and then cached for subsequent calls.
 *
 * @param {Record<string, unknown>} config - The button config object to validate
 * @param {string} errorStoreId - The error store identifier
 * @param {string} configKey - The validation context key (e.g. 'response.body.columnConfigs.edit')
 * @returns {Promise<import('../../../../types/api-response.types').ButtonConfig>} Resolves with validated ButtonConfig
 */
export const lazyValidateButtonConfig = createLazyValidator(
    () => import('./button-config.schema'),
    'validateButtonConfig'
);

/**
 * Lazy loading wrapper for badge column config validation.
 * The module is loaded on first use and then cached for subsequent calls.
 *
 * @param {Record<string, unknown>} config - The badge config object to validate
 * @param {string} errorStoreId - The error store identifier
 * @param {string} configKey - The validation context key (e.g. 'response.body.columnConfigs.status')
 * @returns {Promise<import('../../../../types/api-response.types').BadgeConfig>} Resolves with validated BadgeConfig
 */
export const lazyValidateBadgeConfig = createLazyValidator(
    () => import('./badge-config.schema'),
    'validateBadgeConfig'
);

/**
 * Lazy loading wrapper for progress column config validation.
 * The module is loaded on first use and then cached for subsequent calls.
 *
 * @param {Record<string, unknown>} config - The progress config object to validate
 * @param {string} errorStoreId - The error store identifier
 * @param {string} configKey - The validation context key (e.g. 'response.body.columnConfigs.completion')
 * @returns {Promise<import('../../../../types/api-response.types').ProgressConfig>} Resolves with validated ProgressConfig
 */
export const lazyValidateProgressConfig = createLazyValidator(
    () => import('./progress-config.schema'),
    'validateProgressConfig'
);
