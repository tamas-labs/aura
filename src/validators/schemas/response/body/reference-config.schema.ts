import type { ReferenceConfig } from '../../../../types/api-response.types';
import { ReferenceConfigZod } from '../../../zod/response/body/reference-config.zod';
import { createConfigValidator } from './create-config-validator';

const ALLOWED_KEYS = new Set([
    'type',
    'field',
    'fields',
    'separator',
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
    'mapping',
    'if',
    'else',
    'cellRules',
]);

/**
 * The `reference` type's own mapping-entry key set — `createConfigValidator`'s
 * nested-strip step uses this to filter every entry of the `mapping` dictionary
 * (`data-*` attributes are not allowed here, see the `create-config-validator.ts` JSDoc).
 */
const REFERENCE_MAPPING_ENTRY_ALLOWED_KEYS = new Set([
    'label',
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
]);

/**
 * Reference Config Schema Validator — generated with the factory
 *
 * Validates a single 'reference'-type entry of body.columnConfigs.
 * Uses centralized error handling via the error handler store.
 *
 * Validation rules:
 * - `type` is required, its value can only be 'reference'
 * - At least one value source is required: `field` OR `fields` OR `mapping` OR `value` OR a conditional (`if`/`else`) branch
 * - `field`/`fields` are item field names; `separator` joins `fields`
 * - `value`: fixed text — `renderReferenceNode` puts it before `field`/`fields` if present
 * - Unknown keys (not in ALLOWED_KEYS and not data-*) are silently removed
 * - `data-*` attributes are validated with DataAttributeValueZod
 * - `mapping` entries are nested-stripped (`REFERENCE_MAPPING_ENTRY_ALLOWED_KEYS`) — `data-*` is not allowed inside mapping entries
 * - On error, the detailed error message is added to the error store
 *
 * @param config - The config object to validate (a body.columnConfigs entry)
 * @param errorStoreId - Error handler store identifier
 * @param configKey - Validation context key (e.g. 'response.body.columnConfigs.fullName')
 *
 * @returns {ReferenceConfig} Validated and sanitized ReferenceConfig object
 *
 * @throws Error - If Zod validation fails or a data-* attribute is invalid
 *
 * @example
 * ```typescript
 * const config = { type: 'reference', fields: ['firstName', 'lastName'], separator: ' ' };
 * const valid = validateReferenceConfig(config, 'store-id', 'response.body.columnConfigs.fullName');
 * // => { type: 'reference', fields: ['firstName', 'lastName'], separator: ' ' }
 *
 * const invalid = { type: 'reference' }; // neither field, fields, nor if/else
 * validateReferenceConfig(invalid, 'store-id', 'response.body.columnConfigs.x');
 * // => throws Error, adds to error store
 * ```
 */
export const validateReferenceConfig = createConfigValidator<ReferenceConfig>(
    ReferenceConfigZod,
    ALLOWED_KEYS,
    'ReferenceConfigValidator',
    'Invalid reference column config',
    REFERENCE_MAPPING_ENTRY_ALLOWED_KEYS
);
