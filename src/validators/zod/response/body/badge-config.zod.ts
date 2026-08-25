import { z } from 'zod';
import { BooleanZod } from '../../common/boolean.zod';
import { StringZod } from '../../common/string.zod';
import { CellClassZod } from '../header/cell-class.zod';
import { BootstrapColorZod } from './bootstrap-color.zod';
import { ConditionalConfigZod } from './conditional-config.zod';
import { SharedFormattingShape } from './formatting-fields.zod';

/** Field name (item property path). Plain string — not display text, not HTML sanitized. */
const FieldNameZod = z.string().min(1).max(250);

/**
 * Badge Mapping Value Zod Schema
 *
 * A single `mapping` entry, or the config for `trueValue`/`falseValue`.
 * - label: displayed text (HTML sanitized)
 * - variant: Bootstrap color (the badge background becomes `text-bg-{variant}`)
 * - icon: config.icons registry key
 * - class: extra CSS class(es)
 * - Not `.catchall` — plain `z.object` (default strip): unknown keys are dropped already
 *   at the zod parse level. The actual key boundary is `createConfigValidator`'s nested
 *   strip step (`BADGE_MAPPING_ENTRY_ALLOWED_KEYS`, see badge-config.schema.ts).
 */
export const BadgeMappingValueZod = z.object({
    label: StringZod(1, 1000).optional(),
    variant: BootstrapColorZod.optional(),
    icon: StringZod(1, 100).optional(),
    class: CellClassZod.optional(),
});

/**
 * Badge Config Zod Schema
 *
 * - Validates a single 'badge' type entry of body.columnConfigs
 * - Required field: type ('badge' literal)
 * - field OR value OR mapping OR trueValue/falseValue is required, UNLESS if/else conditional branches are provided
 * - Three resolution modes (render layer): static (field/value + variant), mapping (value→config), boolean (trueValue/falseValue)
 * - Counter mode: prefix/suffix wrap the value, above maxValue renders `{maxValue}{suffix}`, showZero:false skips rendering at 0
 * - Same formatting set as `static` on the badge label
 * - .catchall(z.unknown()) allows data-* attributes (the schema validator filters out the rest)
 *
 * Validation rules:
 * - type: exclusively the 'badge' literal
 * - field: name of the item field to display (property path); max 250 characters, NOT sanitized (not display text)
 * - value: fixed text (static mode); max 1000 characters, HTML sanitized
 * - variant: Bootstrap color (base/fallback); the render produces `text-bg-{variant}`
 * - pill: rounded-pill boolean
 * - size: badge size ('xs' | 'sm' | 'md' | 'lg' | 'xl')
 * - mapping: value→BadgeMappingValue mapping
 * - trueValue/falseValue: boolean-branch BadgeMappingValue
 * - showZero: whether a 0 value should render (default true)
 * - maxValue: max displayed number; suffix: suffix (also applied when exceeded); prefix: prefix
 * - icon: config.icons registry key; iconPosition: 'start' | 'end'
 * - color/background/align/fontSize/…: content formatting (static parity)
 *
 * @example
 * ```ts
 * BadgeConfigZod.parse({ type: 'badge', field: 'status', variant: 'success' }); // success
 * BadgeConfigZod.parse({ type: 'badge', field: 'priority', mapping: { high: { variant: 'danger', label: 'High' } } }); // success
 * BadgeConfigZod.parse({ type: 'badge', field: 'unreadCount', pill: true, maxValue: 99, suffix: '+' }); // success
 * BadgeConfigZod.parse({ type: 'badge', value: 'NEW', variant: 'danger' }); // success
 * BadgeConfigZod.parse({ type: 'badge' }); // Error — none of field/value/mapping/trueValue/falseValue, nor if/else
 * BadgeConfigZod.parse({ type: 'link', field: 'name' }); // Error (wrong type)
 * ```
 */
export const BadgeConfigZod = z
    .object({
        // Required field
        type: z.literal('badge'),

        // Content — at least one of field/value/mapping/trueValue/falseValue (enforced by superRefine)
        field: FieldNameZod.nullable().optional(),
        value: StringZod(1, 1000).optional(),

        // Badge style
        variant: BootstrapColorZod.optional(),
        pill: BooleanZod.optional(),
        size: z.enum(['xs', 'sm', 'md', 'lg', 'xl']).nullable().optional(),

        // Value resolution modes
        mapping: z.record(z.string(), BadgeMappingValueZod).nullable().optional(),
        trueValue: BadgeMappingValueZod.nullable().optional(),
        falseValue: BadgeMappingValueZod.nullable().optional(),

        // Counter mode
        showZero: BooleanZod.optional(),
        maxValue: z.number().nullable().optional(),
        suffix: StringZod(1, 100).optional(),
        prefix: StringZod(1, 100).optional(),

        // Icon (config.icons registry key)
        icon: StringZod(1, 100).optional(),
        iconPosition: z.enum(['start', 'end']).nullable().optional(),

        // Content formatting fields on the badge label (shared, static-parity set — see formatting-fields.zod.ts)
        ...SharedFormattingShape,
    })
    .merge(ConditionalConfigZod)
    .catchall(z.unknown())
    .superRefine((data, ctx) => {
        // At least one of field/value/mapping/trueValue/falseValue is required, UNLESS conditional (if/else) branches are present
        const hasField = data.field !== undefined && data.field !== null;
        const hasValue = data.value !== undefined && data.value !== null;
        const hasMapping = data.mapping !== undefined && data.mapping !== null;
        const hasBoolean =
            (data.trueValue !== undefined && data.trueValue !== null) ||
            (data.falseValue !== undefined && data.falseValue !== null);
        const hasConditional =
            (Array.isArray(data.if) && data.if.length > 0) ||
            (data.else !== null && data.else !== undefined);

        if (!hasField && !hasValue && !hasMapping && !hasBoolean && !hasConditional) {
            ctx.addIssue({
                code: 'custom',
                path: ['field'],
                message:
                    '"field", "value", "mapping", "trueValue" or "falseValue" is required unless "if" or "else" conditional branches are provided',
            });
        }
    });
