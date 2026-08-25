import { z } from 'zod';
import { StringZod } from '../../common/string.zod';
import { SizeZod } from '../header/size.zod';
import { CellClassZod } from '../header/cell-class.zod';
import { StyleZod } from '../header/style.zod';
import { ConditionalConfigZod } from './conditional-config.zod';
import { CellRulesZod } from './cell-rules.zod';

/**
 * Pattern for a Bootstrap color name OR a config.variants/config.icons registry key.
 * CSS syntax (#fff, rgb(...)) is rejected; identifier-like names are allowed
 * (letters, numbers, hyphen, underscore). The same pattern applies to the `variant`/`color`
 * fields (both at the config level AND in the mapping entry) — kept in a module-level constant.
 */
const VARIANT_OR_COLOR_REGEX = /^[a-zA-Z][a-zA-Z0-9_-]*$/;
const VARIANT_OR_COLOR_MESSAGE = 'Must be a Bootstrap color name or variants registry key';

/** Reusable variant/color field schema (shared by config level and mapping entry). */
const VariantOrColorZod = z
    .string()
    .regex(VARIANT_OR_COLOR_REGEX, VARIANT_OR_COLOR_MESSAGE)
    .nullable()
    .optional();

/**
 * Icon Mapping Entry Zod Schema
 *
 * A `mapping` entry for the `icon` type — value → icon-config mapping
 * (e.g. `status: "active"` → `{ icon: 'check', variant: 'success' }`).
 *
 * - `type` is FORBIDDEN (type switching from a mapping entry is not allowed — that's what if/else is for)
 * - There is NO `label` (an icon is not textual content, there's no displayed text)
 * - Not `.catchall` — plain `z.object` (default strip): `key`, `route`, `if`/`else` are also not allowed
 */
export const IconMappingEntryZod = z.object({
    icon: StringZod(1, 250).optional(),
    variant: VariantOrColorZod,
    color: VariantOrColorZod,
    class: CellClassZod.optional(),
    title: StringZod(1, 500).optional(),
    alt: StringZod(1, 500).optional(),
});

/**
 * Icon Config Zod Schema
 *
 * - Validates a single 'icon' type entry of body.columnConfigs
 * - Required field: type ('icon' literal)
 * - icon OR class OR mapping is required, UNLESS if/else conditional branches are provided
 * - Every other field is optional
 * - .catchall(z.unknown()) allows data-* attributes (the schema validator filters out the rest)
 * - .superRefine(): icon/class/mapping is required, unless if/else branches are present (then it can be provided there)
 *
 * Validation rules:
 * - type: exclusively the 'icon' literal
 * - icon: icon name from config.icons; max 250 characters, HTML sanitized, nullable
 * - class: CSS classes (string or array), HTML sanitized
 * - variant: Bootstrap color OR config.variants registry key (e.g. 'show', 'destroy'); max 250 characters, nullable
 * - color: Bootstrap color OR registry key — alternative to variant; same resolution chain
 * - size: icon size (xs, sm, md, lg, xl)
 * - alt: alt text; max 500 characters, HTML sanitized
 * - title: tooltip text; max 500 characters, HTML sanitized
 * - route: URL template; max 1000 characters, HTML sanitized
 * - style: inline CSS string, HTML sanitized
 * - mapping: value→IconMappingEntry mapping (processed by the generic mapping resolver,
 *   see `resolveMappingConfig` — runs AFTER the `if`/`else` flattening)
 * - cellRules: conditional cell formatting
 *
 * @example
 * ```ts
 * IconConfigZod.parse({ type: 'icon', icon: 'check' }); // success
 * IconConfigZod.parse({ type: 'icon', icon: 'edit', variant: 'primary', route: '/users/{id}/edit' }); // success
 * IconConfigZod.parse({ type: 'icon', class: ['fa-regular', 'fa-trash-can', 'text-danger'] }); // success
 * IconConfigZod.parse({ type: 'icon', key: 'status', if: [{ eq: 'active', icon: 'check' }], else: { icon: 'times' } }); // success — conditional config
 * IconConfigZod.parse({ type: 'icon', key: 'status', mapping: { active: { icon: 'check', variant: 'success' } } }); // success — mapping
 * IconConfigZod.parse({ type: 'icon' }); // Error — none of icon, class, mapping, nor if/else (superRefine)
 * IconConfigZod.parse({ type: 'static', icon: 'check' }); // Error (wrong type)
 * ```
 */
export const IconConfigZod = z
    .object({
        // Required field
        type: z.literal('icon'),

        // Main content — icon or class is required (enforced by superRefine)
        icon: StringZod(1, 250).optional(),
        class: CellClassZod.optional(),

        // Formatting — variant/color accept both a Bootstrap color name AND a config.variants registry key
        variant: VariantOrColorZod,
        color: VariantOrColorZod,
        size: SizeZod.optional(),

        // Accessibility
        alt: StringZod(1, 500).optional(),
        title: StringZod(1, 500).optional(),

        // Linking
        route: StringZod(1, 1000).optional(),

        // Other (key is provided by ConditionalConfigZod.merge())
        style: StyleZod.optional(),

        // Value mapping — processed by the generic mapping resolver (flatten layer)
        mapping: z.record(z.string(), IconMappingEntryZod).nullable().optional(),

        // Conditional cell formatting
        cellRules: CellRulesZod.optional(),
    })
    .merge(ConditionalConfigZod)
    .catchall(z.unknown())
    .superRefine((data, ctx) => {
        // icon/class/mapping is required, UNLESS conditional (if/else) branches are provided
        const hasIcon = data.icon !== undefined && data.icon !== null;
        const hasClass = data.class !== undefined && data.class !== null;
        const hasMapping = data.mapping !== undefined && data.mapping !== null;
        const hasConditional =
            (Array.isArray(data.if) && data.if.length > 0) ||
            (data.else !== null && data.else !== undefined);

        if (!hasIcon && !hasClass && !hasMapping && !hasConditional) {
            ctx.addIssue({
                code: 'custom',
                path: ['icon'],
                message:
                    '"icon", "class" or "mapping" is required unless "if" or "else" conditional branches are provided',
            });
        }
    });
