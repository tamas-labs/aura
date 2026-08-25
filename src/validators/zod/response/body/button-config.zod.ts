import { z } from 'zod';
import { BooleanZod } from '../../common/boolean.zod';
import { StringZod } from '../../common/string.zod';
import { BackgroundZod } from '../header/background.zod';
import { CellClassZod } from '../header/cell-class.zod';
import { BootstrapColorZod } from './bootstrap-color.zod';
import { ConditionalConfigZod } from './conditional-config.zod';
import { SharedFormattingShape } from './formatting-fields.zod';

/** Field name (item property path). Plain string — not display text, not HTML sanitized. */
const FieldNameZod = z.string().min(1).max(250);

/**
 * Pattern for a Bootstrap color name OR a config.variants registry key (btn-{variant}).
 * Shared by both the config level AND the mapping entry — kept in a module-level constant.
 */
const VARIANT_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const VARIANT_MESSAGE = 'Must be a Bootstrap color name or variants registry key';
const VariantZod = z.string().regex(VARIANT_REGEX, VARIANT_MESSAGE).nullable().optional();

/** Button size enum — shared by config level and mapping entry. */
const ButtonSizeZod = z.enum(['xs', 'sm', 'md', 'lg', 'xl']).nullable().optional();

/** Icon position enum — shared by config level and mapping entry. */
const IconPositionZod = z.enum(['start', 'end']).nullable().optional();

/**
 * Button Mapping Entry Zod Schema
 *
 * A `mapping` entry for the `button` type — value → presentation (variant/color/
 * background/size/rounded/pill/disabled/icon/iconPosition/title/route/class) mapping
 * (e.g. `status: "locked"` → `{ variant: 'danger', disabled: true, icon: 'lock' }`).
 *
 * The button mapping is **presentation-oriented**: there is NO `label`/`value` alias. Both the
 * button's selector and its label are the `field` (in `resolveFieldOrValueText`, `field` wins
 * over `value` — API stability), so a mapped label would never appear; the label stays the
 * `field`, and the mapping only tunes the appearance/URL/state.
 *
 * - `type`/`field`/`value`/`key`/`if`/`else`/`cellRules`/`mapping` are FORBIDDEN
 * - Not `.catchall` — plain `z.object` (default strip). The key boundary is
 *   `createConfigValidator`'s nested strip step (`BUTTON_MAPPING_ENTRY_ALLOWED_KEYS`).
 */
export const ButtonMappingEntryZod = z.object({
    variant: VariantZod,
    color: BootstrapColorZod.optional(),
    background: BackgroundZod.optional(),
    size: ButtonSizeZod,
    rounded: BooleanZod.optional(),
    pill: BooleanZod.optional(),
    disabled: BooleanZod.optional(),
    icon: StringZod(1, 100).optional(),
    iconPosition: IconPositionZod,
    title: StringZod(1, 500).optional(),
    route: StringZod(1, 1000).optional(),
    class: CellClassZod.optional(),
});

/**
 * Button Config Zod Schema
 *
 * - Validates a single 'button' type entry of body.columnConfigs
 * - Required field: type ('button' literal)
 * - field OR value OR route OR icon is required, UNLESS if/else conditional branches are provided
 * - Dual element model: the presence of `route` decides between `<a class="btn">` vs `<button>` (render layer)
 * - Same formatting set as `static` on the button text
 * - .catchall(z.unknown()) allows data-* attributes (the schema validator filters out the rest)
 *
 * Validation rules:
 * - type: exclusively the 'button' literal
 * - field: name of the item field to display (property path); max 250 characters, NOT sanitized (not display text)
 * - value: fixed text (static mode); max 1000 characters, HTML sanitized
 * - route: URL template; max 1000 characters, HTML sanitized
 * - variant: Bootstrap btn variant registry key (letters, numbers, hyphen, underscore)
 * - size: button size ('xs' | 'sm' | 'md' | 'lg' | 'xl')
 * - icon: config.icons registry key (resolved from the registry at render time); max 100 characters
 * - iconPosition: 'start' | 'end'
 * - rounded/pill/disabled: boolean
 * - htmlType: HTML button type ('button' | 'submit' | 'reset')
 * - title: tooltip; max 500 characters, HTML sanitized
 * - color/background/align/fontSize/…: content formatting (static parity)
 *
 * @example
 * ```ts
 * ButtonConfigZod.parse({ type: 'button', field: 'name', key: 'id', route: '/users/{id}/edit' }); // success
 * ButtonConfigZod.parse({ type: 'button', value: 'Details', route: '/details/{slug}', variant: 'outline-info' }); // success
 * ButtonConfigZod.parse({ type: 'button', icon: 'cog', variant: 'outline-secondary', rounded: true }); // success (icon-only)
 * ButtonConfigZod.parse({ type: 'button' }); // Error — sem field/value/route/icon, sem if/else
 * ButtonConfigZod.parse({ type: 'link', field: 'name' }); // Error (wrong type)
 * ```
 */
export const ButtonConfigZod = z
    .object({
        // Required field
        type: z.literal('button'),

        // Content — at least one of field/value/route/icon (enforced by superRefine)
        field: FieldNameZod.nullable().optional(),
        value: StringZod(1, 1000).optional(),

        // URL generation (key is provided by ConditionalConfigZod.merge())
        route: StringZod(1, 1000).optional(),

        // Button style
        variant: VariantZod,
        size: ButtonSizeZod,
        rounded: BooleanZod.optional(),
        pill: BooleanZod.optional(),

        // Icon (config.icons registry key)
        icon: StringZod(1, 100).optional(),
        iconPosition: IconPositionZod,

        // Button attributes
        disabled: BooleanZod.optional(),
        title: StringZod(1, 500).optional(),
        htmlType: z.enum(['button', 'submit', 'reset']).nullable().optional(),

        // Content formatting fields on the button text (shared, static-parity set — see formatting-fields.zod.ts)
        ...SharedFormattingShape,

        // Value mapping — processed by the generic mapping resolver (flatten layer).
        // Presentation-oriented (variant/size/disabled/icon/…), the selector is `field`
        // (the URL-keyed `key` is NOT a selector, see resolveMappingConfig TYPES_WITH_URL_KEY).
        mapping: z.record(z.string(), ButtonMappingEntryZod).nullable().optional(),
    })
    .merge(ConditionalConfigZod)
    .catchall(z.unknown())
    .superRefine((data, ctx) => {
        // At least one of field/value/route/icon/mapping is required, UNLESS conditional (if/else) branches are present
        const hasField = data.field !== undefined && data.field !== null;
        const hasValue = data.value !== undefined && data.value !== null;
        const hasRoute = data.route !== undefined && data.route !== null;
        const hasIcon = data.icon !== undefined && data.icon !== null;
        const hasMapping = data.mapping !== undefined && data.mapping !== null;
        const hasConditional =
            (Array.isArray(data.if) && data.if.length > 0) ||
            (data.else !== null && data.else !== undefined);

        if (!hasField && !hasValue && !hasRoute && !hasIcon && !hasMapping && !hasConditional) {
            ctx.addIssue({
                code: 'custom',
                path: ['field'],
                message:
                    '"field", "value", "route", "icon" or "mapping" is required unless "if" or "else" conditional branches are provided',
            });
        }
    });
