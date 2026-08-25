import type { ContentFormattingOptions } from '../../../../types/api-response.types';
import type { FormattingResult } from './resolveFormattingStyles';
import { isBootstrapColor, parseStyleString, ALIGN_MAP } from './style-helpers';
import { readOwnEntry } from '../../../../utils';

/**
 * Applies a Bootstrap-or-CSS color value: Bootstrap names become utility classes,
 * all other values become inline styles.
 */
function applyColorProp(
    value: string | null | undefined,
    classPrefix: string,
    styleProp: string,
    classes: string[],
    styles: Record<string, string>
): void {
    if (!value) return;
    if (isBootstrapColor(value)) {
        classes.push(`${classPrefix}${value}`);
    } else {
        styles[styleProp] = value;
    }
}

/**
 * Appends user-provided CSS class(es) — string (space-separated) or array — to the class list.
 */
function appendCustomClasses(classes: string[], value: string | string[]): void {
    if (Array.isArray(value)) {
        classes.push(...value);
    } else {
        classes.push(...value.split(/\s+/).filter(Boolean));
    }
}

/**
 * Resolves visual CSS classes and inline styles from a content-level configuration.
 *
 * Used by column type renderers (static, icon, link, badge, button, etc.)
 * to style the inner content element (`<span>`, `<a>`, `<button>`).
 *
 * This is distinct from cell-level styling (`computeStyles`/`computeClasses`)
 * which applies to the `<td>` element, and from `resolveFormattingStyles`
 * which handles cellRules/rowRules formatting.
 *
 * - Bootstrap color names become utility classes (e.g. `text-primary`, `bg-success`)
 * - Raw CSS color values become inline styles (e.g. `color: '#ff0000'`)
 * - Typography properties (`fontSize`, `fontWeight`, `italic`, `normal`, `lineHeight`) become inline styles
 * - `monospace` → `font-monospace` CSS class
 * - `text` → added as CSS class (e.g. `text-truncate`)
 * - `class` strings/arrays are merged into the class list
 * - `style` strings are parsed into inline styles
 *
 * @param config - Content formatting options, or null/undefined for empty result
 * @returns Object with `classes` (string array) and `styles` (Record of camelCase CSS props)
 *
 * @example
 * ```ts
 * resolveContentStyles({ color: 'primary', italic: true, class: 'pe-1' });
 * // → { classes: ['text-primary', 'pe-1'], styles: { fontStyle: 'italic' } }
 *
 * resolveContentStyles({ color: '#ff0000', fontSize: '14px', monospace: true });
 * // → { classes: ['font-monospace'], styles: { color: '#ff0000', fontSize: '14px' } }
 *
 * resolveContentStyles({ background: 'success', fontWeight: 'bold', text: 'text-truncate' });
 * // → { classes: ['bg-success', 'text-truncate'], styles: { fontWeight: 'bold' } }
 *
 * resolveContentStyles(null);
 * // → { classes: [], styles: {} }
 * ```
 */
export function resolveContentStyles(
    config: ContentFormattingOptions | null | undefined
): FormattingResult {
    if (!config) return { classes: [], styles: {} };

    const classes: string[] = [];
    const styles: Record<string, string> = {};

    // Color & Background
    applyColorProp(config.color, 'text-', 'color', classes, styles);
    applyColorProp(config.background, 'bg-', 'backgroundColor', classes, styles);

    // Alignment
    if (config.align) {
        styles.textAlign = readOwnEntry(ALIGN_MAP, config.align) || config.align;
    }

    // Typography
    if (config.fontSize) {
        styles.fontSize = config.fontSize;
    }

    if (config.fontWeight) {
        styles.fontWeight = String(config.fontWeight);
    }

    if (config.italic) {
        styles.fontStyle = 'italic';
    }

    // `normal` is an explicit override: resets italic. Runs after `italic`,
    // so if both are set, `normal` wins.
    if (config.normal) {
        styles.fontStyle = 'normal';
    }

    if (config.lineHeight) {
        styles.lineHeight = String(config.lineHeight);
    }

    // Monospace
    if (config.monospace) {
        classes.push('font-monospace');
    }

    // Text utility
    if (config.text) {
        classes.push(config.text);
    }

    // Custom classes
    if (config.class) {
        appendCustomClasses(classes, config.class);
    }

    // Inline style string
    if (config.style && typeof config.style === 'string') {
        parseStyleString(styles, config.style);
    }

    return { classes, styles };
}
