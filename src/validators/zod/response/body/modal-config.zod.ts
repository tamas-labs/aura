import { z } from 'zod';
import { StringZod } from '../../common/string.zod';
import { SizeZod } from '../header/size.zod';
import { CellClassZod } from '../header/cell-class.zod';
import { StyleZod } from '../header/style.zod';
import { ConditionalConfigZod } from './conditional-config.zod';
import { CellRulesZod } from './cell-rules.zod';

/**
 * Modal Config Zod Schema
 *
 * - Validates a single 'modal' type entry of body.columnConfigs
 * - Required field: type ('modal' literal)
 * - id is REQUIRED, UNLESS if/else conditional branches are provided (then it can be given in the branches)
 * - At least one trigger form is required: icon shorthand, button shorthand, content object, or conditional branches
 * - Shorthand fields (icon, button) are normalized into a content object by the preprocessor
 * - .catchall(z.unknown()) allows data-* attributes (the schema validator filters out the rest)
 *
 * Validation rules:
 * - type: exclusively the 'modal' literal
 * - id: modal identifier; max 250 characters, HTML sanitized (superRefine enforces the requirement)
 * - route: URL template with placeholders; max 1000 characters, HTML sanitized
 * - content: nested trigger config object (type: 'icon' | 'button' | 'link')
 * - icon: shorthand icon trigger — normalized to content by the preprocessor
 * - variant: Bootstrap color OR config.variants registry key; letters, numbers, hyphen, underscore
 * - button: shorthand button style (e.g. "outline-primary") — normalized to content by the preprocessor
 * - value: displayed text for the button/link shorthand
 * - size: trigger size (xs, sm, md, lg, xl)
 * - target: link target (_blank, _self, _parent, _top)
 * - alt: alt text; max 500 characters, HTML sanitized
 * - title: tooltip text; max 500 characters, HTML sanitized
 * - cellRules: conditional cell formatting
 *
 * @example
 * ```ts
 * // Icon shorthand
 * ModalConfigZod.parse({ type: 'modal', id: 'edit-modal', icon: 'pencil', variant: 'primary' }); // success
 *
 * // Button shorthand
 * ModalConfigZod.parse({ type: 'modal', id: 'confirm-modal', button: 'danger', value: 'Delete' }); // success
 *
 * // Nested content
 * ModalConfigZod.parse({ type: 'modal', id: 'view-modal', content: { type: 'icon', icon: 'eye' } }); // success
 *
 * // Conditional config — id can be given inside the branches
 * ModalConfigZod.parse({ type: 'modal', key: 'status', if: [{ eq: 'active', id: 'modal-a' }], else: { id: 'modal-b' } }); // success
 *
 * // Error cases
 * ModalConfigZod.parse({ type: 'modal', icon: 'pencil' }); // Error — no id and no if/else
 * ModalConfigZod.parse({ type: 'modal', id: 'modal-1' }); // Error — no trigger (icon/button/content) and no if/else
 * ModalConfigZod.parse({ type: 'icon', id: 'modal-1', icon: 'pencil' }); // Error — wrong type
 * ```
 */
export const ModalConfigZod = z
    .object({
        // Required field
        type: z.literal('modal'),

        // Modal identifier — superRefine enforces the requirement
        id: StringZod(1, 250).optional(),

        // Linking
        route: StringZod(1, 1000).optional(),

        // Nested trigger content
        content: z.record(z.string(), z.unknown()).optional().nullable(),

        // Shorthand icon trigger — normalized to content by the preprocessor
        icon: StringZod(1, 250).optional(),

        // Shorthand variant — normalized to a class by the preprocessor
        // Bootstrap color name OR config.variants registry key; CSS syntax (#fff, rgb(...)) rejected
        variant: z
            .string()
            .regex(
                /^[a-zA-Z][a-zA-Z0-9_-]*$/,
                'Must be a Bootstrap color name or variants registry key'
            )
            .nullable()
            .optional(),

        // Shorthand button trigger — normalized to content by the preprocessor
        button: StringZod(1, 100).optional(),

        // Displayed text for the button shorthand
        value: StringZod(1, 1000).optional(),

        // Trigger size
        size: SizeZod.optional(),

        // Link target
        target: z.enum(['_blank', '_self', '_parent', '_top']).nullable().optional(),

        // CSS
        class: CellClassZod.optional(),
        style: StyleZod.optional(),

        // Accessibility
        alt: StringZod(1, 500).optional(),
        title: StringZod(1, 500).optional(),

        // Conditional cell formatting
        cellRules: CellRulesZod.optional(),
    })
    .merge(ConditionalConfigZod)
    .catchall(z.unknown())
    .superRefine((data, ctx) => {
        const hasConditional =
            (Array.isArray(data.if) && data.if.length > 0) ||
            (data.else !== null && data.else !== undefined);

        // id is REQUIRED, unless conditional branches are provided
        const hasId = data.id !== undefined && data.id !== null;
        if (!hasId && !hasConditional) {
            ctx.addIssue({
                code: 'custom',
                path: ['id'],
                message: '"id" is required unless "if" or "else" conditional branches are provided',
            });
        }

        // At least one trigger form OR a conditional branch is required
        const hasTrigger =
            (data.icon !== undefined && data.icon !== null) ||
            (data.button !== undefined && data.button !== null) ||
            (data.content !== undefined && data.content !== null);

        if (!hasTrigger && !hasConditional) {
            ctx.addIssue({
                code: 'custom',
                path: ['icon'],
                message:
                    '"icon", "button", or "content" is required unless "if" or "else" conditional branches are provided',
            });
        }
    });
