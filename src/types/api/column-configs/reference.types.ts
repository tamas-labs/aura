import type { Align, BootstrapColor, CssClass, CssNumericValue } from '../primitives.types';
import type { BaseColumnConfig } from './base.types';

/**
 * Mapping entry for reference configuration — value → display-label lookup resolved by
 * the generic `resolveMappingConfig` (flatten layer). `label` is normalized into the
 * config's `value` field by the resolver; the formatting fields mirror `ReferenceConfig`.
 * No `type`/`field`/`fields`/`separator`/`key`/`if`/`else`/`cellRules`/`mapping`: an entry
 * cannot switch type, introduce a new value source, or nest further conditions/mappings.
 */
export interface ReferenceMappingEntry {
    label?: string | null;

    // Formatting (mirrors ReferenceConfig)
    color?: BootstrapColor | null;
    background?: string | null;
    align?: Align | null;
    fontSize?: string | null;
    fontWeight?: CssNumericValue;
    italic?: boolean | null;
    normal?: boolean | null;
    lineHeight?: CssNumericValue;
    text?: string | null;
    uppercase?: boolean | null;
    lowercase?: boolean | null;
    capitalize?: boolean | null;
    monospace?: boolean | null;
    slice?: number | null;
    number?: boolean | null;
    currency?: boolean | null;
    date?: boolean | null;
    phone?: boolean | null;
    unit?: string | null;
    padStart?: number | null;
    padEnd?: number | null;
    chars?: string | null;
    class?: CssClass | null;
}

/**
 * Configuration for reference columns (displaying values from other fields).
 *
 * Unlike `static` (which renders a literal `value`), a reference renders the
 * value(s) read from the row item: a single `field`, or several `fields[]`
 * joined by `separator`. The resolved text passes through the same formatter
 * chain as `static` (case transforms, slice, currency/date/phone/number, unit,
 * padding) plus content-level visual formatting.
 */
export interface ReferenceConfig extends BaseColumnConfig {
    type: 'reference';
    /** Field name to read from the row item */
    field?: string | null;
    /** Multiple field names to join (takes precedence over `field`) */
    fields?: string[] | null;
    /** Separator inserted between joined `fields` values (default " ") */
    separator?: string | null;
    /** Field key used by conditional (if/else) evaluation, e.g. the `empty` operator */
    key?: string | null;
    /**
     * Fixed text value — the `resolveMappingConfig` `label`→`value` alias target.
     * Takes precedence over `fields`/`field` in `renderReferenceNode`.
     */
    value?: string | null;
    /** Value-based mapping configuration, resolved by `resolveMappingConfig` after if/else flattening */
    mapping?: Record<string, ReferenceMappingEntry> | null;

    // Formatting
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
