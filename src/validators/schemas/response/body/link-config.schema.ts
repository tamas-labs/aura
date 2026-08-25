import type { LinkConfig } from '../../../../types/api-response.types';
import { LinkConfigZod } from '../../../zod/response/body/link-config.zod';
import { createConfigValidator } from './create-config-validator';

const ALLOWED_KEYS = new Set([
    'type',
    'field',
    'value',
    'key',
    'route',
    'target',
    'rel',
    'title',
    'color',
    'variant',
    'align',
    'fontSize',
    'fontWeight',
    'italic',
    'lineHeight',
    'monospace',
    'text',
    'uppercase',
    'lowercase',
    'capitalize',
    'slice',
    'currency',
    'date',
    'phone',
    'unit',
    'class',
    'style',
    'mapping',
    'if',
    'else',
    'cellRules',
]);

/**
 * The `link` type's own mapping-entry key set — `createConfigValidator`'s
 * nested-strip step uses this to filter every entry of the `mapping` dictionary
 * (`data-*` is not allowed here). Presentation-oriented: there is NO `label`/`value`
 * (see `LinkMappingEntryZod` — the label remains the `field`).
 */
const LINK_MAPPING_ENTRY_ALLOWED_KEYS = new Set([
    'variant',
    'color',
    'class',
    'title',
    'route',
    'target',
    'rel',
]);

/**
 * Link Config Schema Validator — generated with the factory
 *
 * Validates a single 'link'-type entry of body.columnConfigs.
 * Uses centralized error handling via the error handler store.
 *
 * Validation rules:
 * - `type` is required, its value can only be 'link'
 * - `field`, `value`, or `route` is required — for conditional config it can be given in the `if`/`else` branches
 * - Unknown keys (not in ALLOWED_KEYS and not data-*) are silently removed
 * - `data-*` attributes are validated with DataAttributeValueZod
 * - On error, the detailed error message is added to the error store
 *
 * @param config - The config object to validate (a body.columnConfigs entry)
 * @param errorStoreId - Error handler store identifier
 * @param configKey - Validation context key (e.g. 'response.body.columnConfigs.name')
 *
 * @returns {LinkConfig} Validated and sanitized LinkConfig object
 *
 * @throws Error - If Zod validation fails or a data-* attribute is invalid
 *
 * @example
 * ```typescript
 * const config = { type: 'link', field: 'name', key: 'id', route: '/users/{id}' };
 * const valid = validateLinkConfig(config, 'store-id', 'response.body.columnConfigs.name');
 * // => { type: 'link', field: 'name', key: 'id', route: '/users/{id}' }
 *
 * const invalid = { type: 'link' }; // missing field, value and route
 * validateLinkConfig(invalid, 'store-id', 'response.body.columnConfigs.x');
 * // => throws Error, adds to error store
 * ```
 */
export const validateLinkConfig = createConfigValidator<LinkConfig>(
    LinkConfigZod,
    ALLOWED_KEYS,
    'LinkConfigValidator',
    'Invalid link column config',
    LINK_MAPPING_ENTRY_ALLOWED_KEYS
);
