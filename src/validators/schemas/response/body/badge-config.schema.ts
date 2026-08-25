import type { BadgeConfig } from '../../../../types/api-response.types';
import { BadgeConfigZod } from '../../../zod/response/body/badge-config.zod';
import { createConfigValidator } from './create-config-validator';

const ALLOWED_KEYS = new Set([
    'type',
    'field',
    'value',
    'key',
    'variant',
    'pill',
    'size',
    'mapping',
    'trueValue',
    'falseValue',
    'showZero',
    'maxValue',
    'suffix',
    'prefix',
    'icon',
    'iconPosition',
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
    'if',
    'else',
    'cellRules',
]);

/**
 * The `badge` type's own mapping-entry key set — `createConfigValidator`'s
 * nested-strip step uses this to filter every entry of the `mapping` dictionary
 * (`data-*` attributes are not allowed here, see the `create-config-validator.ts` JSDoc).
 * Note: badge processes the validated data with the renderer-local `resolveBadgeState`
 * (NOT the generic `resolveMappingConfig`, see `TYPES_WITH_LOCAL_MAPPING`)
 * — this nested strip is the key boundary for the data that ends up in the store,
 * regardless of which resolver processes the mapping.
 *
 * The same key set applies to the `trueValue`/`falseValue` boolean-branch objects
 * as well (also `BadgeMappingValueZod`): `createConfigValidator`'s `singleEntryKeys`
 * parameter (`BADGE_SINGLE_ENTRY_KEYS`) performs the same nested strip on these too —
 * so `mapping` and the boolean branch get a uniform key boundary.
 */
const BADGE_MAPPING_ENTRY_ALLOWED_KEYS = new Set(['label', 'variant', 'icon', 'class']);

/**
 * The badge's top-level keys whose value is a single `BadgeMappingValue` entry
 * (not a `mapping` dictionary): the boolean-branch `trueValue`/`falseValue`. The
 * factory performs a nested strip on these with the `BADGE_MAPPING_ENTRY_ALLOWED_KEYS`
 * key set.
 */
const BADGE_SINGLE_ENTRY_KEYS = new Set(['trueValue', 'falseValue']);

/**
 * Badge Config Schema Validator — generated with the factory
 *
 * Validates a single 'badge'-type entry of body.columnConfigs.
 * Uses centralized error handling via the error handler store.
 *
 * Validation rules:
 * - `type` is required, its value can only be 'badge'
 * - `field`, `value`, `mapping`, `trueValue`, or `falseValue` is required — for conditional config it can be given in the `if`/`else` branches
 * - Unknown keys (not in ALLOWED_KEYS and not data-*) are silently removed
 * - `data-*` attributes are validated with DataAttributeValueZod
 * - On error, the detailed error message is added to the error store
 *
 * @param config - The config object to validate (a body.columnConfigs entry)
 * @param errorStoreId - Error handler store identifier
 * @param configKey - Validation context key (e.g. 'response.body.columnConfigs.status')
 *
 * @returns {BadgeConfig} Validated and sanitized BadgeConfig object
 *
 * @throws Error - If Zod validation fails or a data-* attribute is invalid
 *
 * @example
 * ```typescript
 * const config = { type: 'badge', field: 'status', variant: 'success' };
 * const valid = validateBadgeConfig(config, 'store-id', 'response.body.columnConfigs.status');
 * // => { type: 'badge', field: 'status', variant: 'success' }
 *
 * const invalid = { type: 'badge' }; // missing field, value, mapping, trueValue and falseValue
 * validateBadgeConfig(invalid, 'store-id', 'response.body.columnConfigs.x');
 * // => throws Error, adds to error store
 * ```
 */
export const validateBadgeConfig = createConfigValidator<BadgeConfig>(
    BadgeConfigZod,
    ALLOWED_KEYS,
    'BadgeConfigValidator',
    'Invalid badge column config',
    BADGE_MAPPING_ENTRY_ALLOWED_KEYS,
    BADGE_SINGLE_ENTRY_KEYS
);
