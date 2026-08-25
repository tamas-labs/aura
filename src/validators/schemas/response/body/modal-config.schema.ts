import type { ModalConfig } from '../../../../types/api-response.types';
import { ModalConfigZod } from '../../../zod/response/body/modal-config.zod';
import { createConfigValidator } from './create-config-validator';

const ALLOWED_KEYS = new Set([
    'type',
    'id',
    'route',
    'content',
    'icon',
    'variant',
    'button',
    'value',
    'size',
    'target',
    'class',
    'style',
    'alt',
    'title',
    'key',
    'if',
    'else',
    'cellRules',
]);

/**
 * Modal Config Schema Validator — generated with the factory
 *
 * Validates a single 'modal'-type entry of body.columnConfigs.
 * Uses centralized error handling via the error handler store.
 *
 * Validation rules:
 * - `type` is required, its value can only be 'modal'
 * - `id` is required — for conditional config it can be given in the `if`/`else` branches
 * - At least one trigger form is required: `icon`, `button`, `content`, or conditional branches
 * - Unknown keys (not in ALLOWED_KEYS and not data-*) are silently removed
 * - `data-*` attributes are validated with DataAttributeValueZod
 * - On error, the detailed error message is added to the error store
 *
 * @param config - The config object to validate (a body.columnConfigs entry)
 * @param errorStoreId - Error handler store identifier
 * @param configKey - Validation context key (e.g. 'response.body.columnConfigs.edit_modal')
 *
 * @returns {ModalConfig} Validated and sanitized ModalConfig object
 *
 * @throws Error - If Zod validation fails or a data-* attribute is invalid
 *
 * @example
 * ```typescript
 * const config = { type: 'modal', id: 'edit-modal', icon: 'pencil', variant: 'primary' };
 * const valid = validateModalConfig(config, 'store-id', 'response.body.columnConfigs.edit_modal');
 * // => { type: 'modal', id: 'edit-modal', icon: 'pencil', variant: 'primary' }
 *
 * const invalid = { type: 'modal', icon: 'pencil' }; // missing id
 * validateModalConfig(invalid, 'store-id', 'response.body.columnConfigs.x');
 * // => throws Error, adds to error store
 * ```
 */
export const validateModalConfig = createConfigValidator<ModalConfig>(
    ModalConfigZod,
    ALLOWED_KEYS,
    'ModalConfigValidator',
    'Invalid modal column config'
);
