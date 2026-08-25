import { z } from 'zod';
import { CellClassZod } from '../header/cell-class.zod';
import { StyleZod } from '../header/style.zod';
import { BooleanZod } from '../../common/boolean.zod';
import { StringZod } from '../../common/string.zod';

/**
 * Cell Formatting Options Zod Schema
 *
 * Validates the formatting options usable in the if/else branches of cellRules and rowRules.
 * Every field is optional and nullable, since formatting pieces can be given individually.
 *
 * Validation rules:
 * - `background`: Bootstrap color or CSS color, max 100 characters, nullable
 * - `color`: text color, max 100 characters, nullable
 * - `borderTop/Bottom/Left/Right`: boolean — whether to show the border on that side, nullable
 * - `borderColor`: border color (Bootstrap or CSS), max 100 characters, nullable
 * - `borderWidth`: border thickness (e.g. "3px"), max 20 characters, nullable
 * - `padding`: inner padding CSS value (e.g. "8px 16px"), max 100 characters, nullable
 * - `class`: CSS classes (string or string array), HTML sanitized, nullable
 * - `style`: inline CSS string, max 1000 characters, HTML sanitized, nullable
 * - `opacity`: opacity, number between 0 and 1, nullable
 *
 * @example
 * ```ts
 * CellFormattingOptionsZod.parse({
 *     background: 'success-subtle',
 *     borderBottom: true,
 *     borderColor: 'success',
 *     borderWidth: '3px',
 * }); // success
 *
 * CellFormattingOptionsZod.parse({}); // success — every field is optional
 *
 * CellFormattingOptionsZod.parse({
 *     background: null,
 *     color: 'danger-emphasis',
 *     opacity: 0.7,
 *     class: ['fw-bold', 'text-truncate'],
 * }); // success
 *
 * CellFormattingOptionsZod.parse({ opacity: 1.5 }); // Error — opacity max 1
 * CellFormattingOptionsZod.parse({ opacity: -0.1 }); // Error — opacity min 0
 * ```
 */
export const CellFormattingOptionsZod = z.object({
    /** Background color: Bootstrap color (e.g. "success-subtle") or CSS color (e.g. "#ff0000") */
    background: StringZod(1, 100).optional(),

    /** Text color: Bootstrap color (e.g. "danger-emphasis") or CSS color */
    color: StringZod(1, 100).optional(),

    /** Show the top border */
    borderTop: BooleanZod.optional(),

    /** Show the bottom border */
    borderBottom: BooleanZod.optional(),

    /** Show the left border */
    borderLeft: BooleanZod.optional(),

    /** Show the right border */
    borderRight: BooleanZod.optional(),

    /** Border color: Bootstrap color or CSS color, max 100 characters */
    borderColor: StringZod(1, 100).optional(),

    /** Border thickness, e.g. "3px", max 20 characters */
    borderWidth: StringZod(1, 20).optional(),

    /** Inner padding CSS value, e.g. "8px 16px", max 100 characters */
    padding: StringZod(1, 100).optional(),

    /** Extra CSS classes (string or string array) */
    class: CellClassZod.optional(),

    /** Inline CSS styles */
    style: StyleZod.optional(),

    /** Opacity: number between 0 and 1 */
    opacity: z.number().min(0).max(1).nullable().optional(),
});
