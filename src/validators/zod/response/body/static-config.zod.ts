import { z } from 'zod';
import { StringZod } from '../../common/string.zod';
import { ConditionalConfigZod } from './conditional-config.zod';
import { SharedFormattingShape } from './formatting-fields.zod';

/**
 * Static Config Zod Schema

 * - Validates a single 'static' type entry of body.columnConfigs
 * - Required fields: type ('static' literal); value is required, UNLESS if/else conditional branches are provided
 * - Every other field is optional
 * - .catchall(z.unknown()) allows data-* attributes (the schema validator filters out the rest)
 * - .superRefine(): value is required, unless if/else branches are present (then it can be given there)
 *
 * Validation rules:
 * - type: exclusively the 'static' literal
 * - value: required IF there is no if/else branch; can be null; max 1000 characters, HTML sanitized
 * - color: exclusively a Bootstrap color (primary, secondary, success, danger, warning, info, dark, light)
 * - background: Bootstrap color or CSS color (hex, rgb, named)
 * - align: 'start' | 'center' | 'end'
 * - fontSize: CSS font size (e.g. '12px', '1rem', 'small')
 * - fontWeight: CSS font-weight (100-900, normal, bold, lighter, bolder)
 * - italic: boolean
 * - normal: boolean (upright font style — `font-style: normal`, resets italic)
 * - lineHeight: CSS line height (e.g. '1.5', '24px', 'normal')
 * - text: Bootstrap text utility (e.g. 'text-truncate')
 * - uppercase/lowercase/capitalize/monospace/number/currency/date/phone: boolean
 * - slice: integer, 1-10000
 * - unit: free-form unit of measure text, max 50 characters, HTML sanitized
 * - padStart/padEnd: integer, 0-100
 * - chars: string, 1-10 characters
 * - class: CSS classes (string or array), HTML sanitized
 * - style: inline CSS string, HTML sanitized
 *
 * @example
 * ```ts
 * StaticConfigZod.parse({ type: 'static', value: 'ID:' }); // success
 * StaticConfigZod.parse({ type: 'static', value: 'active', color: 'success', uppercase: true }); // success
 * StaticConfigZod.parse({ type: 'static', value: '42', number: true, padStart: 5, chars: '0' }); // success
 * StaticConfigZod.parse({ type: 'static', key: 'id', if: [{ bigger: 5, value: 'ID:' }], else: { value: 'id' } }); // success — conditional config
 * StaticConfigZod.parse({ type: 'static' }); // Error — neither value nor if/else (superRefine)
 * StaticConfigZod.parse({ type: 'icon', value: 'test' }); // Error (wrong type)
 * ```
 */
export const StaticConfigZod = z
    .object({
        // Required fields
        type: z.literal('static'),
        // value: required if there is no if/else — enforced by superRefine
        value: StringZod(1, 1000).optional(),

        // Content formatting fields (shared, static-parity set — see formatting-fields.zod.ts)
        ...SharedFormattingShape,
    })
    .merge(ConditionalConfigZod)
    .catchall(z.unknown())
    .superRefine((data, ctx) => {
        // value is required, UNLESS conditional (if/else) branches are provided
        const hasValue = data.value !== undefined && data.value !== null;
        const hasConditional =
            (Array.isArray(data.if) && data.if.length > 0) ||
            (data.else !== null && data.else !== undefined);

        if (!hasValue && !hasConditional) {
            ctx.addIssue({
                code: 'custom',
                path: ['value'],
                message:
                    '"value" is required unless "if" or "else" conditional branches are provided',
            });
        }
    });
