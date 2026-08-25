import type {
    Align,
    BootstrapColor,
    CssClass,
    CssNumericValue,
    IconPosition,
    Size,
} from '../primitives.types';
import type { BaseColumnConfig } from './base.types';

/**
 * Mapping value for badge configuration.
 */
export interface BadgeMappingValue {
    label?: string | null;
    variant?: BootstrapColor | null;
    icon?: string | null;
    class?: CssClass | null;
}

/**
 * Configuration for badge columns.
 *
 * Renders a Bootstrap 5 badge (`<span class="badge text-bg-{variant}">`). The
 * label and colour derive from the value via three resolution modes: static
 * (`field`/`value` + fixed `variant`), value→config `mapping`, or boolean
 * `trueValue`/`falseValue`. Numeric counter mode adds `prefix`/`suffix`,
 * `maxValue` overflow (`{maxValue}{suffix}`) and `showZero`. An optional `icon`
 * (config.icons registry key) is rendered as an `<i>` glyph per `iconPosition`.
 * The resolved label passes through the same formatter chain as `static`.
 */
export interface BadgeConfig extends BaseColumnConfig {
    type: 'badge';
    /** Bootstrap colour variant (base / fallback), rendered as `text-bg-{variant}` */
    variant?: BootstrapColor | null;
    /** Pill badge (rounded-pill) */
    pill?: boolean | null;
    /** Badge size (sm, md, lg) */
    size?: Size | null;
    /** Value-based mapping configuration */
    mapping?: Record<string, BadgeMappingValue> | null;
    /** Config used when the value is truthy (boolean mode) */
    trueValue?: BadgeMappingValue | null;
    /** Config used when the value is falsy (boolean mode) */
    falseValue?: BadgeMappingValue | null;
    /** Whether to render when the numeric value is 0 (default true) */
    showZero?: boolean | null;
    /** Maximum displayed number; above it → `{maxValue}{suffix}` (e.g. 99 → "99+") */
    maxValue?: number | null;
    /** Overflow marker appended after `maxValue` when the value exceeds it (e.g. "+") */
    suffix?: string | null;
    /** Prefix prepended to the label (e.g. "#") */
    prefix?: string | null;
    /** Icon registry key (config.icons) rendered as an `<i>` glyph */
    icon?: string | null;
    /** Icon placement relative to the text ('start' default | 'end') */
    iconPosition?: IconPosition | null;
    /** Item field name whose value drives the badge (resolved value) */
    field?: string | null;
    /** Fixed label text (static mode) */
    value?: string | null;

    // Formatting (static-parity — applied to the badge label)
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
}
