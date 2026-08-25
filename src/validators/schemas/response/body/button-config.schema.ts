import type { ButtonConfig } from '../../../../types/api-response.types';
import { ButtonConfigZod } from '../../../zod/response/body/button-config.zod';
import { createConfigValidator } from './create-config-validator';

const ALLOWED_KEYS = new Set([
    'type',
    'field',
    'value',
    'key',
    'route',
    'variant',
    'size',
    'rounded',
    'pill',
    'icon',
    'iconPosition',
    'disabled',
    'title',
    'htmlType',
    'color',
    'background',
    'align',
    'fontSize',
    'fontWeight',
    'italic',
    'normal',
    'lineHeight',
    'monospace',
    'text',
    'uppercase',
    'lowercase',
    'capitalize',
    'slice',
    'number',
    'currency',
    'date',
    'phone',
    'unit',
    'padStart',
    'padEnd',
    'chars',
    'class',
    'style',
    'mapping',
    'if',
    'else',
    'cellRules',
]);

/**
 * The `button` type's own mapping-entry key set — `createConfigValidator`'s
 * nested-strip step uses this to filter every entry of the `mapping` dictionary
 * (`data-*` is not allowed here). Presentation-oriented: there is NO `label`/`value`
 * (see `ButtonMappingEntryZod` — the label remains the `field`).
 */
const BUTTON_MAPPING_ENTRY_ALLOWED_KEYS = new Set([
    'variant',
    'color',
    'background',
    'size',
    'rounded',
    'pill',
    'disabled',
    'icon',
    'iconPosition',
    'title',
    'route',
    'class',
]);

/**
 * Button Config Schema Validator — generated with the factory
 *
 * Validates a single 'button'-type entry of body.columnConfigs.
 * Uses centralized error handling via the error handler store.
 *
 * Validation rules:
 * - `type` is required, its value can only be 'button'
 * - `field`, `value`, `route`, or `icon` is required — for conditional config it can be given in the `if`/`else` branches
 * - Unknown keys (not in ALLOWED_KEYS and not data-*) are silently removed
 * - `data-*` attributes are validated with DataAttributeValueZod
 * - On error, the detailed error message is added to the error store
 *
 * @param config - The config object to validate (a body.columnConfigs entry)
 * @param errorStoreId - Error handler store identifier
 * @param configKey - Validation context key (e.g. 'response.body.columnConfigs.edit')
 *
 * @returns {ButtonConfig} Validated and sanitized ButtonConfig object
 *
 * @throws Error - If Zod validation fails or a data-* attribute is invalid
 *
 * @example
 * ```typescript
 * const config = { type: 'button', field: 'name', key: 'id', route: '/users/{id}/edit', variant: 'primary' };
 * const valid = validateButtonConfig(config, 'store-id', 'response.body.columnConfigs.edit');
 * // => { type: 'button', field: 'name', key: 'id', route: '/users/{id}/edit', variant: 'primary' }
 *
 * const invalid = { type: 'button' }; // missing field, value, route and icon
 * validateButtonConfig(invalid, 'store-id', 'response.body.columnConfigs.x');
 * // => throws Error, adds to error store
 * ```
 */
export const validateButtonConfig = createConfigValidator<ButtonConfig>(
    ButtonConfigZod,
    ALLOWED_KEYS,
    'ButtonConfigValidator',
    'Invalid button column config',
    BUTTON_MAPPING_ENTRY_ALLOWED_KEYS
);
