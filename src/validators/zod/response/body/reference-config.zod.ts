import { z } from 'zod';
import { StringZod } from '../../common/string.zod';
import { ConditionalConfigZod } from './conditional-config.zod';
import { SharedContentFormattingShape, SharedFormattingShape } from './formatting-fields.zod';

/** Field name (item property path, e.g. 'user.name'). Plain string — not display text, not HTML sanitized. */
const FieldNameZod = z.string().min(1).max(250);

/**
 * Reference Mapping Entry Zod Schema
 *
 * A `mapping` entry for the `reference` type — value → displayed label
 * ("translation") + formatting mapping (e.g. `status: "active"` → `{ label: 'Active', color: 'success' }`).
 *
 * - `type`/`field`/`fields`/`separator`/`key`/`if`/`else`/`cellRules`/`mapping` are FORBIDDEN
 *   (no type switching, no additional value source or conditional branch from one entry)
 * - There is NO `variant` (reference formatters use `color`, not `variant`)
 * - `label`: the displayed text — the pure resolver (`resolveMappingConfig`) normalizes it to `value`
 * - Not `.catchall` — plain `z.object` (default strip)
 */
export const ReferenceMappingEntryZod = z.object({
    label: StringZod(1, 1000).optional(),

    // Formatting — the shared content-level set (without style/cellRules, see formatting-fields.zod.ts)
    ...SharedContentFormattingShape,
});

/**
 * Reference Config Zod Schema
 *
 * - Validates a single 'reference' type entry of body.columnConfigs
 * - Same formatting set as `static`, but the value source is an item field (not a literal `value`)
 * - Required: at least one of `field` / `fields` / `mapping` / `value` / conditional (if/else) branches (superRefine)
 * - `field`: a single item field name (dotted path OK)
 * - `fields`: multiple field names (array) to concatenate; if provided, this wins over `field`
 * - `separator`: the text separating `fields` values (default in the render layer: " ")
 * - `key`: the conditional (if/else) evaluator reads the value from this (e.g. the `empty` operator)
 * - `value`: fixed text — the target field for the mapping `label`→`value` normalization; the
 *   renderer (`renderReferenceNode`) puts it ahead of `field`/`fields` if present
 * - `mapping`: value→ReferenceMappingEntry mapping (processed by the generic mapping resolver,
 *   see `resolveMappingConfig` — runs AFTER the `if`/`else` flattening)
 * - Every formatting field is optional (identical to `static`'s zod schemas)
 * - .catchall(z.unknown()) allows data-* attributes (the schema validator filters out the rest)
 *
 * @example
 * ```ts
 * ReferenceConfigZod.parse({ type: 'reference', field: 'email', lowercase: true }); // success
 * ReferenceConfigZod.parse({ type: 'reference', fields: ['city', 'country'], separator: ', ' }); // success
 * ReferenceConfigZod.parse({ type: 'reference', key: 'status', mapping: { active: { label: 'Active', color: 'success' } } }); // success — mapping
 * ReferenceConfigZod.parse({ type: 'reference', value: 'N/A' }); // success — fixed text
 * ReferenceConfigZod.parse({ type: 'reference' }); // Error — none of field, fields, mapping, value, nor if/else
 * ReferenceConfigZod.parse({ type: 'static', field: 'x' }); // Error (wrong type)
 * ```
 */
export const ReferenceConfigZod = z
    .object({
        // Required field
        type: z.literal('reference'),

        // Value source (item field[s])
        field: FieldNameZod.nullable().optional(),
        fields: z.array(FieldNameZod).min(1).max(50).nullable().optional(),
        separator: StringZod(1, 50).optional(),
        // key: for conditional evaluation (also provided by ConditionalConfigZod.merge(), but documented explicitly)

        // Fixed text — the target field for the mapping `label`→`value` normalization (renderer priority: value → fields → field)
        value: StringZod(1, 1000).optional(),

        // Content formatting fields (shared, static-parity set — see formatting-fields.zod.ts)
        ...SharedFormattingShape,

        // Value mapping — processed by the generic mapping resolver (flatten layer)
        mapping: z.record(z.string(), ReferenceMappingEntryZod).nullable().optional(),
    })
    .merge(ConditionalConfigZod)
    .catchall(z.unknown())
    .superRefine((data, ctx) => {
        // At least one value source is required: field OR fields OR mapping OR value OR a conditional (if/else) branch
        const hasField = data.field !== undefined && data.field !== null;
        const hasFields = Array.isArray(data.fields) && data.fields.length > 0;
        const hasMapping = data.mapping !== undefined && data.mapping !== null;
        const hasValue = data.value !== undefined && data.value !== null;
        const hasConditional =
            (Array.isArray(data.if) && data.if.length > 0) ||
            (data.else !== null && data.else !== undefined);

        if (!hasField && !hasFields && !hasMapping && !hasValue && !hasConditional) {
            ctx.addIssue({
                code: 'custom',
                path: ['field'],
                message:
                    '"field", "fields", "mapping" or "value" is required unless "if" or "else" conditional branches are provided',
            });
        }
    });
