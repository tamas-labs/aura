import type { ProgressConfig } from '../../../../types/api-response.types';
import { ProgressConfigZod } from '../../../zod/response/body/progress-config.zod';
import { createConfigValidator } from './create-config-validator';

const ALLOWED_KEYS = new Set([
    'type',
    'field',
    'value',
    'key',
    'max',
    'min',
    'variant',
    'height',
    'striped',
    'animated',
    'label',
    'labelPosition',
    'mapping',
    'thresholds',
    'stacked',
    'bars',
    'showValue',
    'showPercent',
    'decimals',
    'suffix',
    'prefix',
    'color',
    'background',
    'align',
    'fontSize',
    'fontWeight',
    'italic',
    'lineHeight',
    'text',
    'monospace',
    'class',
    'style',
    'if',
    'else',
    'cellRules',
]);

/**
 * The `progress` type's range-`mapping` entry own key set — `createConfigValidator`'s
 * nested-strip step uses this to filter every entry of the `mapping` dictionary
 * (`data-*` attributes are not allowed here, see the `create-config-validator.ts` JSDoc).
 * Progress's `mapping` is a range dialect (key `"min-max"`), different from the generic
 * `resolveMappingConfig` resolver — but the nested strip still applies the same way, because
 * the entry is a free-key object just like in the badge/icon case.
 *
 * Note: `bars[]` (stacked bars) and `thresholds` do NOT go through a nested strip — the former
 * is an array of fixed-key (`field`/`variant`/`label`) `z.object`s (the zod strip is enough), the
 * latter contains `variant → [min,max]` tuples (there is no free-key entry in it).
 */
const PROGRESS_MAPPING_ENTRY_ALLOWED_KEYS = new Set(['variant', 'label', 'class']);

/**
 * Progress Config Schema Validator — generated with the factory
 *
 * Validates a single 'progress'-type entry of body.columnConfigs.
 * Uses centralized error handling via the error handler store.
 *
 * Validation rules:
 * - `type` is required, its value can only be 'progress'
 * - `field`, `value`, or `stacked`+`bars` is required — for conditional config it can be given in the `if`/`else` branches
 * - Unknown keys (not in ALLOWED_KEYS and not data-*) are silently removed
 * - Entries of the `mapping` dictionary go through a nested strip (`PROGRESS_MAPPING_ENTRY_ALLOWED_KEYS`)
 * - `data-*` attributes are validated with DataAttributeValueZod
 * - On error, the detailed error message is added to the error store
 *
 * @param config - The config object to validate (a body.columnConfigs entry)
 * @param errorStoreId - Error handler store identifier
 * @param configKey - Validation context key (e.g. 'response.body.columnConfigs.completion')
 *
 * @returns {ProgressConfig} Validated and sanitized ProgressConfig object
 *
 * @throws Error - If Zod validation fails or a data-* attribute is invalid
 *
 * @example
 * ```typescript
 * const config = { type: 'progress', field: 'completionRate', variant: 'success' };
 * const valid = validateProgressConfig(config, 'store-id', 'response.body.columnConfigs.completion');
 * // => { type: 'progress', field: 'completionRate', variant: 'success' }
 *
 * const invalid = { type: 'progress' }; // missing field, value and stacked+bars
 * validateProgressConfig(invalid, 'store-id', 'response.body.columnConfigs.x');
 * // => throws Error, adds to error store
 * ```
 */
export const validateProgressConfig = createConfigValidator<ProgressConfig>(
    ProgressConfigZod,
    ALLOWED_KEYS,
    'ProgressConfigValidator',
    'Invalid progress column config',
    PROGRESS_MAPPING_ENTRY_ALLOWED_KEYS
);
