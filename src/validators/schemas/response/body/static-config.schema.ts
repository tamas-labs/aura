import type { StaticConfig } from '../../../../types/api-response.types';
import { StaticConfigZod } from '../../../zod/response/body/static-config.zod';
import { createConfigValidator } from './create-config-validator';

const ALLOWED_KEYS = new Set([
    'type',
    'value',
    'color',
    'background',
    'align',
    'fontSize',
    'fontWeight',
    'italic',
    'normal',
    'lineHeight',
    'text',
    'uppercase',
    'lowercase',
    'capitalize',
    'monospace',
    'slice',
    'number',
    'currency',
    'date',
    'phone',
    'unit',
    'padStart',
    'padEnd',
    'chars',
    'key',
    'class',
    'style',
    'if',
    'else',
    'cellRules',
]);

/**
 * Static Config Schema Validator — generated with the factory
 *
 * Validates a single 'static'-type entry of body.columnConfigs.
 * Uses centralized error handling via the error handler store.
 *
 * Validation rules:
 * - `type` is required, its value can only be 'static'
 * - `value` is optional — for conditional config it can be given in the `if`/`else` branches; if given, max 1000 characters
 * - Unknown keys (not in ALLOWED_KEYS and not data-*) are silently removed
 * - `data-*` attributes are validated with DataAttributeValueZod
 * - On error, the detailed error message is added to the error store
 *
 * @param config - The config object to validate (a body.columnConfigs entry)
 * @param errorStoreId - Error handler store identifier
 * @param configKey - Validation context key (e.g. 'response.body.columnConfigs.idPrefix')
 *
 * @returns {StaticConfig} Validated and sanitized StaticConfig object
 *
 * @throws Error - If Zod validation fails or a data-* attribute is invalid
 *
 * @example
 * ```typescript
 * const config = { type: 'static', value: 'ID:', class: ['pe-1', 'text-muted'] };
 * const valid = validateStaticConfig(config, 'store-id', 'response.body.columnConfigs.idPrefix');
 * // => { type: 'static', value: 'ID:', class: ['pe-1', 'text-muted'] }
 *
 * const invalid = { type: 'static' }; // missing value
 * validateStaticConfig(invalid, 'store-id', 'response.body.columnConfigs.x');
 * // => throws Error, adds to error store
 * ```
 */
export const validateStaticConfig = createConfigValidator<StaticConfig>(
    StaticConfigZod,
    ALLOWED_KEYS,
    'StaticConfigValidator',
    'Invalid static column config'
);
