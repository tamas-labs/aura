import type { CellFormattingOptions } from '../../../../types/api-response.types';
import { isBootstrapColor, parseStyleString } from './style-helpers';

/**
 * Result of the resolveFormattingStyles utility.
 * Contains CSS classes and inline styles derived from CellFormattingOptions.
 */
export interface FormattingResult {
    /** CSS class names to apply */
    classes: string[];
    /** Inline CSS styles to apply (camelCase keys) */
    styles: Record<string, string>;
}

/**
 * Resolves a border color value to a CSS string.
 * Bootstrap colors become CSS variables; raw CSS colors are used as-is.
 */
function resolveBorderColorCSS(borderColor: string | null | undefined): string {
    if (!borderColor) return 'currentColor';
    if (isBootstrapColor(borderColor)) return `var(--bs-${borderColor})`;
    return borderColor;
}

/**
 * Applies background and text color to the classes/styles targets.
 * Bootstrap colors become utility classes; raw CSS values become inline styles.
 */
function applyBackgroundAndColor(
    classes: string[],
    styles: Record<string, string>,
    opts: CellFormattingOptions
): void {
    if (opts.background) {
        if (isBootstrapColor(opts.background)) {
            classes.push(`bg-${opts.background}`);
        } else {
            styles.backgroundColor = opts.background;
        }
    }

    if (opts.color) {
        if (isBootstrapColor(opts.color)) {
            classes.push(`text-${opts.color}`);
        } else {
            styles.color = opts.color;
        }
    }
}

/**
 * Applies border styles (top/bottom/left/right) to the styles target.
 * Combines borderWidth and borderColor into shorthand properties.
 */
function applyBorderStyles(styles: Record<string, string>, opts: CellFormattingOptions): void {
    const borderColorCSS = resolveBorderColorCSS(opts.borderColor);
    const borderWidth = opts.borderWidth ?? '1px';
    const borderDeclaration = `${borderWidth} solid ${borderColorCSS}`;

    if (opts.borderTop) styles.borderTop = borderDeclaration;
    if (opts.borderBottom) styles.borderBottom = borderDeclaration;
    if (opts.borderLeft) styles.borderLeft = borderDeclaration;
    if (opts.borderRight) styles.borderRight = borderDeclaration;
}

/**
 * Applies custom CSS classes, inline style string, opacity, and padding
 * from the CellFormattingOptions to the classes/styles targets.
 */
function applyExtraOptions(
    classes: string[],
    styles: Record<string, string>,
    opts: CellFormattingOptions
): void {
    if (opts.class) {
        if (Array.isArray(opts.class)) {
            classes.push(...opts.class);
        } else {
            classes.push(...opts.class.split(/\s+/).filter(Boolean));
        }
    }

    if (opts.style && typeof opts.style === 'string') {
        parseStyleString(styles, opts.style);
    }

    if (opts.opacity !== null && opts.opacity !== undefined) {
        styles.opacity = String(opts.opacity);
    }

    if (opts.padding) {
        styles.padding = opts.padding;
    }
}

/**
 * Converts a `CellFormattingOptions` object into CSS classes and inline styles.
 *
 * - Bootstrap color names (e.g. "success-subtle") become utility classes (e.g. "bg-success-subtle")
 * - Raw CSS values (e.g. "#ff0000") become inline styles (e.g. `backgroundColor: '#ff0000'`)
 * - Borders become inline shorthand styles using CSS variables for Bootstrap colors
 * - `class` strings/arrays are merged into the class list
 * - `style` string declarations are parsed and merged into the inline styles
 * - `opacity` and `padding` become inline styles
 *
 * @param opts - The formatting options to convert, or null/undefined for empty result
 * @returns Object with `classes` (string array) and `styles` (Record of camelCase CSS props)
 *
 * @example
 * ```ts
 * resolveFormattingStyles({ background: 'success-subtle', borderBottom: true, borderColor: 'success', borderWidth: '3px' });
 * // → { classes: ['bg-success-subtle'], styles: { borderBottom: '3px solid var(--bs-success)' } }
 *
 * resolveFormattingStyles({ color: '#ff0000', opacity: 0.7, class: 'fw-bold' });
 * // → { classes: ['fw-bold'], styles: { color: '#ff0000', opacity: '0.7' } }
 *
 * resolveFormattingStyles({ color: 'danger-emphasis', class: ['fw-bold', 'text-truncate'] });
 * // → { classes: ['text-danger-emphasis', 'fw-bold', 'text-truncate'], styles: {} }
 *
 * resolveFormattingStyles(null);
 * // → { classes: [], styles: {} }
 * ```
 */
export function resolveFormattingStyles(
    opts: CellFormattingOptions | null | undefined
): FormattingResult {
    if (!opts) return { classes: [], styles: {} };

    const classes: string[] = [];
    const styles: Record<string, string> = {};

    applyBackgroundAndColor(classes, styles, opts);
    applyBorderStyles(styles, opts);
    applyExtraOptions(classes, styles, opts);

    return { classes, styles };
}
