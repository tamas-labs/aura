import type { Align, BootstrapColor, CssNumericValue } from '../primitives.types';
import type { BaseColumnConfig } from './base.types';

/**
 * Template-parameter set for a `custom` mapping entry.
 *
 * Unlike other types' mapping entries (config-merge dialect), a `custom` mapping entry is a
 * **template-parameter bag**: its keys are placeholder names substituted into the `template`
 * string (`{class}`, `{icon}`, `{label}`, …). Keys are therefore free (per-template), so no
 * key-allowlist nested-strip applies here; values are restricted to primitives (enforced by
 * `CustomTemplateParamsZod`) and the final DOMPurify pass over the substituted HTML is the
 * security boundary. Documented placeholder targets:
 */
export interface CustomTemplateParams {
    /** CSS class placeholder (`{class}`) */
    class?: string | null;
    /** Icon glyph/text placeholder (`{icon}`) */
    icon?: string | null;
    /** Display label placeholder (`{label}`) */
    label?: string | null;
    /** Any other placeholder name → primitive value */
    [key: string]: string | number | boolean | null | undefined;
}

/**
 * Configuration for custom rendered columns.
 *
 * Four rendering modes (priority order): `renderer` (host fn → HTML) → `callback` (host fn →
 * text) → `template` (HTML string + placeholder/mapping substitution) → default (plain value).
 * See `.claude/docs/types/custom.md`.
 */
export interface CustomConfig extends BaseColumnConfig {
    type: 'custom';
    /** Single field name to read from the row item (the primary value source). */
    field?: string | null;
    /** Multiple field names — passed to the `renderer` as an array of resolved values. */
    fields?: string[] | null;
    /** Fixed text value (fallback value source when no `field`/`fields`). */
    value?: string | null;
    /** Name of the renderer function in `config.renderers` (returns HTML → sanitized). */
    renderer?: string | null;
    /** Name of the callback function in `config.callbacks` (returns plain text). */
    callback?: string | null;
    /** HTML template string with `{value}`/`{field}`/`{class}`/`{icon}`/… placeholders. */
    template?: string | null;
    /** Extra parameters forwarded to the `callback` (3rd argument). */
    params?: Record<string, unknown> | null;
    /** Value-based template-parameter mapping (exact or `"min-max"` range keys). */
    mapping?: Record<string, CustomTemplateParams> | null;
    /** Field key to use in URL generation */
    key?: string | null;

    // Formatting (static parity — applied to callback/default text output)
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
    /** Start (left) padding length */
    padStart?: number | null;
    /** End (right) padding length */
    padEnd?: number | null;
    /** Character used for padding */
    chars?: string | null;
}
