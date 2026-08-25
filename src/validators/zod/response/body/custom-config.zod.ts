import { z } from 'zod';
import { StringZod } from '../../common/string.zod';
import { ConditionalConfigZod } from './conditional-config.zod';
import { SharedFormattingShape } from './formatting-fields.zod';

/** Field name (item property path, e.g. 'user.name'). Plain string — not display text, not HTML sanitized. */
const FieldNameZod = z.string().min(1).max(250);

/** Renderer/callback function name in `config.renderers` / `config.callbacks`. Plain identifier string. */
const FunctionNameZod = z.string().min(1).max(250);

/**
 * Custom Template Params Zod Schema — a single `mapping` entry for the `custom` type.
 *
 * A DIFFERENT dialect from the `mapping` of other types: here there is no config-merge; instead
 * the entry's keys are the `template`'s placeholders (`{class}`, `{icon}`, `{label}`, …). The keys
 * are therefore free-form (per template), so there is no key-allowlist nested-strip; the values are
 * EXCLUSIVELY primitives (string/number/boolean), and the final DOMPurify pass on the substituted
 * HTML is the security boundary (see `.claude/docs/types/custom.md`).
 */
export const CustomTemplateParamsZod = z.record(
    z.string(),
    z.union([z.string().max(2000), z.number(), z.boolean()]).nullable()
);

/**
 * Custom Config Zod Schema
 *
 * - Validates a single 'custom' type entry of body.columnConfigs
 * - Four rendering modes (priority): `renderer` → `callback` → `template` → default
 * - Required: at least one of `renderer` / `callback` / `template` / `field` / `fields` /
 *   `value` / conditional (if/else) branches (superRefine)
 * - `renderer` / `callback`: the NAME of the function in the `config.renderers` /
 *   `config.callbacks` host registry (the API can only reference by name — it cannot inject code)
 * - `template`: HTML string with placeholders; the substitution goes through DOMPurify AFTERWARDS
 * - `mapping`: value→template-parameter mapping (exact OR `"min-max"` range key)
 * - `params`: extra data for the callback (arbitrary JSON)
 * - .catchall(z.unknown()) allows data-* attributes (the schema validator filters out the rest)
 *
 * @example
 * ```ts
 * CustomConfigZod.parse({ type: 'custom', field: 'data', renderer: 'myRenderer' }); // success
 * CustomConfigZod.parse({ type: 'custom', field: 'status', template: "<b>{value}</b>" }); // success
 * CustomConfigZod.parse({ type: 'custom', field: 'price', callback: 'formatPrice', params: { currency: 'HUF' } }); // success
 * CustomConfigZod.parse({ type: 'custom' }); // Error — none of renderer/callback/template/field/fields/value, nor if/else
 * ```
 */
export const CustomConfigZod = z
    .object({
        // Required field
        type: z.literal('custom'),

        // Value source (item field[s] or fixed text)
        field: FieldNameZod.nullable().optional(),
        fields: z.array(FieldNameZod).min(1).max(50).nullable().optional(),
        value: StringZod(1, 5000).optional(),

        // Rendering modes
        renderer: FunctionNameZod.nullable().optional(),
        callback: FunctionNameZod.nullable().optional(),
        template: StringZod(1, 10000).optional(),
        params: z.record(z.string(), z.unknown()).nullable().optional(),
        mapping: z.record(z.string(), CustomTemplateParamsZod).nullable().optional(),

        // Formatting (for the callback/default text output — static parity, shared shape)
        ...SharedFormattingShape,
    })
    .merge(ConditionalConfigZod)
    .catchall(z.unknown())
    .superRefine((data, ctx) => {
        // At least one rendering source is required, UNLESS conditional (if/else) branches are present
        const hasRenderer = data.renderer !== undefined && data.renderer !== null;
        const hasCallback = data.callback !== undefined && data.callback !== null;
        const hasTemplate = data.template !== undefined && data.template !== null;
        const hasField = data.field !== undefined && data.field !== null;
        const hasFields = Array.isArray(data.fields) && data.fields.length > 0;
        const hasValue = data.value !== undefined && data.value !== null;
        const hasConditional =
            (Array.isArray(data.if) && data.if.length > 0) ||
            (data.else !== null && data.else !== undefined);

        if (
            !hasRenderer &&
            !hasCallback &&
            !hasTemplate &&
            !hasField &&
            !hasFields &&
            !hasValue &&
            !hasConditional
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['field'],
                message:
                    '"renderer", "callback", "template", "field", "fields" or "value" is required unless "if" or "else" conditional branches are provided',
            });
        }
    });
