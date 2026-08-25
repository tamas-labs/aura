import type { Align, CssClass, CssNumericValue, LinkTarget } from '../primitives.types';
import type { BaseColumnConfig } from './base.types';

/**
 * Mapping entry for link configuration — value → presentation lookup resolved by the
 * generic `resolveMappingConfig` (flatten layer). Presentation-only: no `label`/`value`
 * alias (the link label stays the `field`, which is also the mapping selector; `field`
 * wins over `value` in `resolveFieldOrValueText`, so a mapped label could never render).
 * No `type`/`field`/`value`/`key`/`if`/`else`/`cellRules`/`mapping`.
 */
export interface LinkMappingEntry {
    variant?: string | null;
    color?: string | null;
    class?: CssClass | null;
    title?: string | null;
    route?: string | null;
    target?: LinkTarget | null;
    rel?: string | null;
}

/**
 * Configuration for link columns.
 */
export interface LinkConfig extends BaseColumnConfig {
    type: 'link';
    /** URL template */
    route?: string | null;
    target?: LinkTarget | null;
    /** Link relationship; auto-set to "noopener noreferrer" for target="_blank" when omitted */
    rel?: string | null;
    title?: string | null;
    /** Static text value */
    value?: string | null;
    /** Field name to display */
    field?: string | null;
    /** Field key to use in URL generation */
    key?: string | null;

    // Formatting
    /** Bootstrap color (color name or CSS color value) */
    color?: string | null;
    /** Bootstrap link variant — resolved into `link-{variant}` class */
    variant?: string | null;
    /** Text alignment */
    align?: Align | null;
    /** CSS font-size value (e.g. '12px', '1rem') */
    fontSize?: string | null;
    /** CSS font-weight value (100-900, normal, bold, lighter, bolder) */
    fontWeight?: CssNumericValue;
    /** Italic text style */
    italic?: boolean | null;
    /** CSS line-height value (e.g. '1.5', '24px') */
    lineHeight?: CssNumericValue;
    /** Monospace font family */
    monospace?: boolean | null;
    /** Bootstrap text utility class (e.g. 'text-truncate') */
    text?: string | null;

    // Content Manipulation
    /** Transform to uppercase */
    uppercase?: boolean | null;
    /** Transform to lowercase */
    lowercase?: boolean | null;
    /** Capitalize first letter */
    capitalize?: boolean | null;
    /** Truncate text to length */
    slice?: number | null;

    // Special Formatting
    /** Format as currency */
    currency?: boolean | null;
    /** Format as date */
    date?: boolean | null;
    /** Format as phone number */
    phone?: boolean | null;
    /** Unit to append (e.g., 'kg', '%') */
    unit?: string | null;

    /** Value-based presentation mapping, resolved by `resolveMappingConfig` after if/else flattening (selector: `field`) */
    mapping?: Record<string, LinkMappingEntry> | null;
}
