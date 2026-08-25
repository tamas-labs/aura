import type { IconConfig } from '../../../../types/api-response.types';
import { IconConfigZod } from '../../../zod/response/body/icon-config.zod';
import { createConfigValidator } from './create-config-validator';

const ALLOWED_KEYS = new Set([
    'type',
    'icon',
    'class',
    'variant',
    'color',
    'size',
    'alt',
    'title',
    'route',
    'key',
    'style',
    'mapping',
    'if',
    'else',
    'cellRules',
]);

/**
 * The `icon` type's own mapping-entry key set — `createConfigValidator`'s
 * nested-strip step uses this to filter every entry of the `mapping` dictionary
 * (`data-*` attributes are not allowed here, see the `create-config-validator.ts` JSDoc).
 */
const ICON_MAPPING_ENTRY_ALLOWED_KEYS = new Set([
    'icon',
    'variant',
    'color',
    'class',
    'title',
    'alt',
]);

/**
 * Icon Config Schema Validator — generated with the factory
 *
 * Validates a single 'icon'-type entry of body.columnConfigs.
 * Uses centralized error handling via the error handler store.
 *
 * Validation rules:
 * - `type` is required, its value can only be 'icon'
 * - `icon`, `class`, or `mapping` is required — for conditional config it can be given in the `if`/`else` branches
 * - Unknown keys (not in ALLOWED_KEYS and not data-*) are silently removed
 * - `data-*` attributes are validated with DataAttributeValueZod
 * - `mapping` entries are nested-stripped (`ICON_MAPPING_ENTRY_ALLOWED_KEYS`) — `data-*` is not allowed inside mapping entries
 * - On error, the detailed error message is added to the error store
 *
 * @param config - The config object to validate (a body.columnConfigs entry)
 * @param errorStoreId - Error handler store identifier
 * @param configKey - Validation context key (e.g. 'response.body.columnConfigs.status_icon')
 *
 * @returns {IconConfig} Validated and sanitized IconConfig object
 *
 * @throws Error - If Zod validation fails or a data-* attribute is invalid
 *
 * @example
 * ```typescript
 * const config = { type: 'icon', icon: 'check', variant: 'success' };
 * const valid = validateIconConfig(config, 'store-id', 'response.body.columnConfigs.status_icon');
 * // => { type: 'icon', icon: 'check', variant: 'success' }
 *
 * const invalid = { type: 'icon' }; // missing icon and class
 * validateIconConfig(invalid, 'store-id', 'response.body.columnConfigs.x');
 * // => throws Error, adds to error store
 * ```
 */
export const validateIconConfig = createConfigValidator<IconConfig>(
    IconConfigZod,
    ALLOWED_KEYS,
    'IconConfigValidator',
    'Invalid icon column config',
    ICON_MAPPING_ENTRY_ALLOWED_KEYS
);
