/**
 * Cell / Content Formatting Types
 */

import type { Align, CssClass, CssNumericValue } from './primitives.types';
import type { ConditionalConfig } from './conditional.types';

/**
 * Style options applicable to table cells and rows.
 */
export interface CellFormattingOptions {
    background?: string | null;
    color?: string | null;
    borderTop?: boolean | null;
    borderBottom?: boolean | null;
    borderLeft?: boolean | null;
    borderRight?: boolean | null;
    borderColor?: string | null;
    borderWidth?: string | null;
    padding?: string | null;
    class?: CssClass | null;
    style?: string | null;
    opacity?: number | null;
}

/**
 * Conditional rules for cell styling.
 */
export type CellRules = CellFormattingOptions & ConditionalConfig<CellFormattingOptions>;

/**
 * Conditional rules for row styling.
 */
export type RowRules = CellFormattingOptions & ConditionalConfig<CellFormattingOptions>;

/**
 * Visual CSS formatting options for column type content elements.
 *
 * Used by column type renderers (static, icon, link, badge, button, etc.)
 * to style the inner content element (`<span>`, `<a>`, `<button>`).
 *
 * This is distinct from `CellFormattingOptions` which styles the `<td>` cell container,
 * and from `BaseCellConfig` which styles the header/footer cell elements.
 */
export interface ContentFormattingOptions {
    /** Text color (Bootstrap color name or CSS color value) */
    color?: string | null;
    /** Background color (Bootstrap color name or CSS color value) */
    background?: string | null;
    /** Text alignment */
    align?: Align | null;
    /** CSS font-size value (e.g. '12px', '1rem', 'small') */
    fontSize?: string | null;
    /** CSS font-weight value (number 100-900 or keyword: normal, bold, lighter, bolder) */
    fontWeight?: CssNumericValue;
    /** Italic text style */
    italic?: boolean | null;
    /** Normal (upright) font style — resets italic (`font-style: normal`) */
    normal?: boolean | null;
    /** CSS line-height value (e.g. '1.5', '24px', 'normal') */
    lineHeight?: CssNumericValue;
    /** Monospace font family */
    monospace?: boolean | null;
    /** CSS class name(s) */
    class?: CssClass | null;
    /** Inline CSS style string */
    style?: string | null;
    /** Bootstrap text utility class (e.g. 'text-truncate') */
    text?: string | null;
}
