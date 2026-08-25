import { z } from 'zod';
import { BooleanZod } from '../../common/boolean.zod';
import { StringZod } from '../../common/string.zod';
import { AlignZod } from '../header/align.zod';
import { ColorZod } from '../header/color.zod';
import { FontSizeZod } from '../header/font-size.zod';
import { FontWeightZod } from '../header/font-weight.zod';
import { LineHeightZod } from '../header/line-height.zod';
import { TextUtilityZod } from '../header/text-utility.zod';
import { SliceZod } from '../header/slice.zod';
import { CellClassZod } from '../header/cell-class.zod';
import { StyleZod } from '../header/style.zod';
import { StaticUnitZod } from './static-unit.zod';
import { ConditionalConfigZod } from './conditional-config.zod';
import { CellRulesZod } from './cell-rules.zod';

/**
 * Pattern for a Bootstrap color name OR a config.variants registry key (link-{variant}).
 * Shared by both the config level AND the mapping entry — kept in a module-level constant.
 */
const VARIANT_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const VARIANT_MESSAGE = 'Must be a Bootstrap color name or variants registry key';
const VariantZod = z.string().regex(VARIANT_REGEX, VARIANT_MESSAGE).nullable().optional();

/** Link target enum — shared by config level and mapping entry. */
const LinkTargetZod = z.enum(['_blank', '_self', '_parent', '_top']).nullable().optional();

/**
 * Link Mapping Entry Zod Schema
 *
 * A `mapping` entry for the `link` type — value → presentation (variant/color/class/
 * title/route/target/rel) mapping (e.g. `status: "active"` → `{ variant: 'success', route: '/activate/{id}' }`).
 *
 * The link mapping is **presentation-oriented**: there is NO `label`/`value` alias. Both the
 * link's selector and its displayed text are the `field` (in `resolveFieldOrValueText`, `field`
 * wins over `value` — API stability), so a mapped label would never appear; that's why the
 * label stays the `field`, and the mapping only tunes the appearance/URL.
 *
 * - `type`/`field`/`value`/`key`/`if`/`else`/`cellRules`/`mapping` are FORBIDDEN
 * - Not `.catchall` — plain `z.object` (default strip). The key boundary is
 *   `createConfigValidator`'s nested strip step (`LINK_MAPPING_ENTRY_ALLOWED_KEYS`).
 */
export const LinkMappingEntryZod = z.object({
    variant: VariantZod,
    color: ColorZod.optional(),
    class: CellClassZod.optional(),
    title: StringZod(1, 500).optional(),
    route: StringZod(1, 1000).optional(),
    target: LinkTargetZod,
    rel: StringZod(1, 250).optional(),
});

/**
 * Link Config Zod Schema
 *
 * - Validates a single 'link' type entry of body.columnConfigs
 * - Required field: type ('link' literal)
 * - field OR value OR route is required, UNLESS if/else conditional branches are provided
 * - Every other field is optional
 * - .catchall(z.unknown()) allows data-* attributes (the schema validator filters out the rest)
 * - .superRefine(): at least one of field/value/route/if/else is required
 *
 * Validation rules:
 * - type: exclusively the 'link' literal
 * - field: name of the field to display from items; max 250 characters, HTML sanitized
 * - value: fixed text (static mode); max 1000 characters, HTML sanitized
 * - key: field used in the URL (default 'id'); provided by ConditionalConfigZod.merge()
 * - route: URL template; max 1000 characters, HTML sanitized
 * - target: link target ('_blank' | '_self' | '_parent' | '_top')
 * - rel: link relationship; max 250 characters, HTML sanitized
 * - title: tooltip text; max 500 characters, HTML sanitized
 * - color: Bootstrap color OR CSS color (hex, rgb, named)
 * - variant: Bootstrap link variant registry key (letters, numbers, hyphen, underscore)
 * - align/fontSize/fontWeight/italic/lineHeight/text: content formatting
 * - uppercase/lowercase/capitalize/monospace/currency/date/phone: boolean
 * - slice: integer, 1-10000
 * - unit: unit of measure, max 50 characters, HTML sanitized
 * - class: CSS classes (string or array), HTML sanitized
 * - style: inline CSS string, HTML sanitized
 * - cellRules: conditional cell formatting
 *
 * @example
 * ```ts
 * LinkConfigZod.parse({ type: 'link', field: 'name', key: 'id', route: '/users/{id}' }); // success
 * LinkConfigZod.parse({ type: 'link', value: 'View Profile', route: '/profiles/{slug}', key: 'slug' }); // success
 * LinkConfigZod.parse({ type: 'link', field: 'website', target: '_blank', rel: 'noopener' }); // success
 * LinkConfigZod.parse({ type: 'link' }); // Error — none of field/value/route, nor if/else (superRefine)
 * LinkConfigZod.parse({ type: 'icon', field: 'name' }); // Error (wrong type)
 * ```
 */
export const LinkConfigZod = z
    .object({
        // Required field
        type: z.literal('link'),

        // Content — at least one of field/value/route (enforced by superRefine)
        field: StringZod(1, 250).optional(),
        value: StringZod(1, 1000).optional(),

        // URL generation (key is provided by ConditionalConfigZod.merge())
        route: StringZod(1, 1000).optional(),

        // Link attributes
        target: LinkTargetZod,
        rel: StringZod(1, 250).optional(),
        title: StringZod(1, 500).optional(),

        // Formatting
        color: ColorZod.optional(),
        variant: VariantZod,
        align: AlignZod.optional(),
        fontSize: FontSizeZod.optional(),
        fontWeight: FontWeightZod.optional(),
        italic: BooleanZod.optional(),
        lineHeight: LineHeightZod.optional(),
        text: TextUtilityZod.optional(),

        // Content manipulation
        uppercase: BooleanZod.optional(),
        lowercase: BooleanZod.optional(),
        capitalize: BooleanZod.optional(),
        monospace: BooleanZod.optional(),
        slice: SliceZod.optional(),

        // Special formatting
        currency: BooleanZod.optional(),
        date: BooleanZod.optional(),
        phone: BooleanZod.optional(),
        unit: StaticUnitZod.optional(),

        // Other (BaseColumnConfig fields)
        class: CellClassZod.optional(),
        style: StyleZod.optional(),

        // Value mapping — processed by the generic mapping resolver (flatten layer).
        // Presentation-oriented (variant/color/route/target/…), the selector is `field`
        // (the URL-keyed `key` is NOT a selector, see resolveMappingConfig TYPES_WITH_URL_KEY).
        mapping: z.record(z.string(), LinkMappingEntryZod).nullable().optional(),

        // Conditional cell formatting
        cellRules: CellRulesZod.optional(),
    })
    .merge(ConditionalConfigZod)
    .catchall(z.unknown())
    .superRefine((data, ctx) => {
        // At least one of field/value/route/mapping is required, UNLESS conditional (if/else) branches are present
        const hasField = data.field !== undefined && data.field !== null;
        const hasValue = data.value !== undefined && data.value !== null;
        const hasRoute = data.route !== undefined && data.route !== null;
        const hasMapping = data.mapping !== undefined && data.mapping !== null;
        const hasConditional =
            (Array.isArray(data.if) && data.if.length > 0) ||
            (data.else !== null && data.else !== undefined);

        if (!hasField && !hasValue && !hasRoute && !hasMapping && !hasConditional) {
            ctx.addIssue({
                code: 'custom',
                path: ['field'],
                message:
                    '"field", "value", "route" or "mapping" is required unless "if" or "else" conditional branches are provided',
            });
        }
    });
