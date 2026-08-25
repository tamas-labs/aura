import type {
    Align,
    BootstrapColor,
    ButtonHtmlType,
    CssClass,
    CssNumericValue,
    IconPosition,
    Size,
} from '../primitives.types';
import type { BaseColumnConfig } from './base.types';

/**
 * Mapping entry for button configuration — value → presentation lookup resolved by the
 * generic `resolveMappingConfig` (flatten layer). Presentation-only: no `label`/`value`
 * alias (the button label stays the `field`, which is also the mapping selector; `field`
 * wins over `value` in `resolveFieldOrValueText`, so a mapped label could never render).
 * No `type`/`field`/`value`/`key`/`if`/`else`/`cellRules`/`mapping`.
 */
export interface ButtonMappingEntry {
    variant?: string | null;
    color?: BootstrapColor | null;
    background?: string | null;
    size?: Size | null;
    rounded?: boolean | null;
    pill?: boolean | null;
    disabled?: boolean | null;
    icon?: string | null;
    iconPosition?: IconPosition | null;
    title?: string | null;
    route?: string | null;
    class?: CssClass | null;
}

/**
 * Configuration for button columns.
 *
 * Renders a Bootstrap 5 button. With `route` → `<a class="btn" href>` (navigation
 * button); without `route` → `<button type="{htmlType}">` (real button). The label
 * comes from the item `field` or the static `value`, passing through the same
 * formatter chain as `static`. An optional `icon` (config.icons registry key) is
 * rendered as an `<i>` glyph before/after the text per `iconPosition`.
 */
export interface ButtonConfig extends BaseColumnConfig {
    type: 'button';
    /** Bootstrap button variant (primary, secondary, outline-*, link, …) */
    variant?: string | null;
    /** Button size (sm, md, lg) */
    size?: Size | null;
    /** URL template — its presence selects `<a class="btn">` over `<button>` */
    route?: string | null;
    /** Icon registry key (config.icons) rendered as an `<i>` glyph */
    icon?: string | null;
    /** Icon placement relative to the text ('start' default | 'end') */
    iconPosition?: IconPosition | null;
    /** Circular button (rounded-circle) */
    rounded?: boolean | null;
    /** Pill button (rounded-pill) */
    pill?: boolean | null;
    /** Disabled state */
    disabled?: boolean | null;
    /** Tooltip text */
    title?: string | null;
    /** HTML button type ('button' default | 'submit' | 'reset') — only on the `<button>` element */
    htmlType?: ButtonHtmlType | null;
    /** Fixed label text (static mode) */
    value?: string | null;
    /** Item field name whose value becomes the label */
    field?: string | null;
    /** Field key to use in URL generation */
    key?: string | null;

    // Formatting (static-parity — applied to the button label)
    /** Bootstrap color variant */
    color?: BootstrapColor | null;
    /** Background color (Bootstrap color or CSS color value) */
    background?: string | null;
    /** Text alignment */
    align?: Align | null;
    /** CSS font-size value (e.g. '12px', '1rem') */
    fontSize?: string | null;
    /** CSS font-weight value (100-900, normal, bold, lighter, bolder) */
    fontWeight?: CssNumericValue;
    /** Italic text style */
    italic?: boolean | null;
    /** Normal (upright) font style — resets italic (`font-style: normal`) */
    normal?: boolean | null;
    /** CSS line-height value (e.g. '1.5', '24px') */
    lineHeight?: CssNumericValue;
    /** Bootstrap text utility class (e.g. 'text-truncate') */
    text?: string | null;

    // Content Manipulation
    /** Transform to uppercase */
    uppercase?: boolean | null;
    /** Transform to lowercase */
    lowercase?: boolean | null;
    /** Capitalize first letter */
    capitalize?: boolean | null;
    /** Monospace font family */
    monospace?: boolean | null;
    /** Truncate text to length */
    slice?: number | null;

    // Special Formatting
    /** Format as number */
    number?: boolean | null;
    /** Format as currency */
    currency?: boolean | null;
    /** Format as date */
    date?: boolean | null;
    /** Format as phone number */
    phone?: boolean | null;
    /** Unit to append (e.g., 'kg', '%') */
    unit?: string | null;

    // Padding
    /** Start (left) padding length */
    padStart?: number | null;
    /** End (right) padding length */
    padEnd?: number | null;
    /** Character used for padding */
    chars?: string | null;

    /** Value-based presentation mapping, resolved by `resolveMappingConfig` after if/else flattening (selector: `field`) */
    mapping?: Record<string, ButtonMappingEntry> | null;
}
