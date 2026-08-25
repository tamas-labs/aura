import type { CustomConfig } from '../../../../types/api-response.types';
import { CustomConfigZod } from '../../../zod/response/body/custom-config.zod';
import { createConfigValidator } from './create-config-validator';

const ALLOWED_KEYS = new Set([
    'type',
    'field',
    'fields',
    'value',
    'renderer',
    'callback',
    'template',
    'params',
    'mapping',
    'key',
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
    'class',
    'style',
    'if',
    'else',
    'cellRules',
]);

/**
 * Custom Config Schema Validator — generated with the factory
 *
 * Validates a single 'custom'-type entry of body.columnConfigs.
 *
 * Validation rules:
 * - `type` is required, its value can only be 'custom'
 * - at least one of `renderer`/`callback`/`template`/`field`/`fields`/`value` is required —
 *   for conditional config it can be given in the `if`/`else` branches
 * - Unknown top-level keys (not in ALLOWED_KEYS and not data-*) are silently removed
 *
 * Note on `mapping`: the `custom` `mapping` is a **template-parameter set** (the entry's
 * keys are the `template`'s free placeholder names), so there is NO `mappingEntryAllowedKeys`
 * nested-strip — entry values are restricted to primitives by `CustomTemplateParamsZod` (zod
 * fails on a non-primitive value → the config is rejected), and the final security boundary is
 * DOMPurify-sanitizing the substituted HTML in the renderer (see `.claude/docs/types/custom.md`).
 *
 * @param config - The config object to validate (a body.columnConfigs entry)
 * @param errorStoreId - Error handler store identifier
 * @param configKey - Validation context key
 *
 * @returns {CustomConfig} Validated and stripped CustomConfig object
 *
 * @throws Error - If Zod validation fails or a data-* attribute is invalid
 *
 * @example
 * ```typescript
 * const config = { type: 'custom', field: 'status', template: "<b>{value}</b>" };
 * const valid = validateCustomConfig(config, 'store-id', 'response.body.columnConfigs.status');
 * // => { type: 'custom', field: 'status', template: "<b>{value}</b>" }
 *
 * const invalid = { type: 'custom' }; // missing renderer/callback/template/field/fields/value
 * validateCustomConfig(invalid, 'store-id', 'response.body.columnConfigs.x');
 * // => throws Error, adds to error store
 * ```
 */
export const validateCustomConfig = createConfigValidator<CustomConfig>(
    CustomConfigZod,
    ALLOWED_KEYS,
    'CustomConfigValidator',
    'Invalid custom column config'
);
