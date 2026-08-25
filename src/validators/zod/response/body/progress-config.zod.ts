import { z } from 'zod';
import { BooleanZod } from '../../common/boolean.zod';
import { StringZod } from '../../common/string.zod';
import { AlignZod } from '../header/align.zod';
import { BackgroundZod } from '../header/background.zod';
import { FontSizeZod } from '../header/font-size.zod';
import { FontWeightZod } from '../header/font-weight.zod';
import { LineHeightZod } from '../header/line-height.zod';
import { TextUtilityZod } from '../header/text-utility.zod';
import { CellClassZod } from '../header/cell-class.zod';
import { StyleZod } from '../header/style.zod';
import { BootstrapColorZod } from './bootstrap-color.zod';
import { ConditionalConfigZod } from './conditional-config.zod';
import { CellRulesZod } from './cell-rules.zod';

/** Field name (item property path). Plain string — not display text, not HTML sanitized. */
const FieldNameZod = z.string().min(1).max(250);

/** Non-nullable Bootstrap color enum (for use as a record key / tuple member). */
const BootstrapColorEnumZod = BootstrapColorZod.unwrap();

/**
 * Progress Mapping Value Zod Schema
 *
 * A range-`mapping` entry (key format: `"min-max"`, e.g. `"0-25"`).
 * - variant: Bootstrap color (the progress bar's `bg-{variant}`)
 * - label: displayed text (overrides the config-label logic on a match)
 * - class: extra CSS class(es)
 * The actual key boundary is `createConfigValidator`'s nested-strip step
 * (`PROGRESS_MAPPING_ENTRY_ALLOWED_KEYS`, see progress-config.schema.ts).
 */
export const ProgressMappingValueZod = z.object({
    variant: BootstrapColorZod.optional(),
    label: StringZod(1, 1000).optional(),
    class: CellClassZod.optional(),
});

/**
 * Progress Bar Zod Schema — a single stacked bar definition (`bars[]` element).
 * - field: item field the bar's value comes from (required)
 * - variant: bar color
 * - label: text inside the bar
 */
export const ProgressBarZod = z.object({
    field: FieldNameZod,
    variant: BootstrapColorZod.optional(),
    label: StringZod(1, 1000).optional(),
});

/**
 * Progress Config Zod Schema
 *
 * - Validates a single 'progress' type entry of body.columnConfigs
 * - Required field: type ('progress' literal)
 * - `field` OR `value` OR (`stacked` + `bars`) is required, UNLESS if/else conditional branches are provided
 * - `max`: number OR field name (item property the maximum comes from); default 100
 * - Three color sources (render layer, priority: mapping → thresholds → variant → 'primary'):
 *   - `mapping`: range-keyed (`"min-max"`) → variant/label/class
 *   - `thresholds`: variant → [min, max] range
 *   - `variant`: static default
 * - `label` is the master (template `{value}`/`{max}`/`{percent}`, `decimals` for number formatting)
 * - `stacked` + `bars`: multiple bars, auto-normalized width
 * - .catchall(z.unknown()) allows data-* attributes (the schema validator filters out the rest)
 *
 * @example
 * ```ts
 * ProgressConfigZod.parse({ type: 'progress', field: 'completionRate', variant: 'success' }); // success
 * ProgressConfigZod.parse({ type: 'progress', value: 65, label: '65%' }); // success
 * ProgressConfigZod.parse({ type: 'progress', stacked: true, bars: [{ field: 'a' }] }); // success
 * ProgressConfigZod.parse({ type: 'progress' }); // Error — sem field/value/stacked+bars, sem if/else
 * ```
 */
export const ProgressConfigZod = z
    .object({
        // Required field
        type: z.literal('progress'),

        // Content — at least one of field/value/stacked+bars (enforced by superRefine)
        field: FieldNameZod.nullable().optional(),
        value: z.number().nullable().optional(),

        // Value range
        max: z.union([z.number(), FieldNameZod]).nullable().optional(),
        min: z.number().nullable().optional(),

        // Style
        variant: BootstrapColorZod.optional(),
        height: StringZod(1, 50).optional(),
        striped: BooleanZod.optional(),
        animated: BooleanZod.optional(),

        // Label
        label: z
            .union([z.boolean(), StringZod(1, 1000)])
            .nullable()
            .optional(),
        labelPosition: z.enum(['inside', 'outside']).nullable().optional(),

        // Color sources
        mapping: z.record(z.string(), ProgressMappingValueZod).nullable().optional(),
        thresholds: z
            .partialRecord(BootstrapColorEnumZod, z.tuple([z.number(), z.number()]))
            .nullable()
            .optional(),

        // Stacked multi-bar
        stacked: BooleanZod.optional(),
        bars: z.array(ProgressBarZod).min(1).max(50).nullable().optional(),

        // Numeric formatting
        showValue: BooleanZod.optional(),
        showPercent: BooleanZod.optional(),
        decimals: z.number().int().min(0).max(20).nullable().optional(),
        suffix: StringZod(1, 100).optional(),
        prefix: StringZod(1, 100).optional(),

        // Content formatting on the label (part of static parity)
        color: BootstrapColorZod.optional(),
        background: BackgroundZod.optional(),
        align: AlignZod.optional(),
        fontSize: FontSizeZod.optional(),
        fontWeight: FontWeightZod.optional(),
        italic: BooleanZod.optional(),
        lineHeight: LineHeightZod.optional(),
        text: TextUtilityZod.optional(),
        monospace: BooleanZod.optional(),

        // Other (BaseColumnConfig — key is provided by ConditionalConfigZod.merge())
        class: CellClassZod.optional(),
        style: StyleZod.optional(),

        // Conditional cell formatting
        cellRules: CellRulesZod.optional(),
    })
    .merge(ConditionalConfigZod)
    .catchall(z.unknown())
    .superRefine((data, ctx) => {
        // At least one of field/value/(stacked+bars) is required, UNLESS conditional (if/else) branches are present
        const hasField = data.field !== undefined && data.field !== null;
        const hasValue = data.value !== undefined && data.value !== null;
        const hasBars = data.stacked === true && Array.isArray(data.bars) && data.bars.length > 0;
        const hasConditional =
            (Array.isArray(data.if) && data.if.length > 0) ||
            (data.else !== null && data.else !== undefined);

        if (!hasField && !hasValue && !hasBars && !hasConditional) {
            ctx.addIssue({
                code: 'custom',
                path: ['field'],
                message:
                    '"field", "value" or "stacked" with "bars" is required unless "if" or "else" conditional branches are provided',
            });
        }
    });
