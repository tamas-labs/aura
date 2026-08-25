/**
 * Bootstrap 5.3 color names, including subtle, emphasis, and special variants.
 * Shared between resolveFormattingStyles (cell-level) and resolveContentStyles (content-level).
 */
export const BOOTSTRAP_COLOR_NAMES = new Set([
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'light',
    'dark',
    'primary-subtle',
    'secondary-subtle',
    'success-subtle',
    'danger-subtle',
    'warning-subtle',
    'info-subtle',
    'light-subtle',
    'dark-subtle',
    'primary-emphasis',
    'secondary-emphasis',
    'success-emphasis',
    'danger-emphasis',
    'warning-emphasis',
    'info-emphasis',
    'dark-emphasis',
    'black',
    'white',
    'muted',
    'body',
    'body-secondary',
    'body-tertiary',
    'black-50',
    'white-50',
]);

/**
 * Mapping of alignment values to CSS text-align values.
 *
 * @example
 * ```ts
 * ALIGN_MAP['start'];  // 'left'
 * ALIGN_MAP['center']; // 'center'
 * ALIGN_MAP['end'];    // 'right'
 * ```
 */
export const ALIGN_MAP: Record<string, string> = {
    start: 'left',
    center: 'center',
    end: 'right',
};

/**
 * Checks whether a color string is a known Bootstrap 5.3 color name.
 *
 * @param value - The color value to check
 * @returns True if the value is a recognized Bootstrap color name
 *
 * @example
 * ```ts
 * isBootstrapColor('primary');        // true
 * isBootstrapColor('success-subtle'); // true
 * isBootstrapColor('#ff0000');        // false
 * isBootstrapColor(null);             // false
 * ```
 */
export function isBootstrapColor(value: string | null | undefined): boolean {
    if (!value) return false;
    return BOOTSTRAP_COLOR_NAMES.has(value);
}

/**
 * Converts a CSS property name in kebab-case to camelCase.
 *
 * @param prop - The CSS property name in kebab-case
 * @returns The property name in camelCase
 *
 * @example
 * ```ts
 * kebabToCamelCase('background-color'); // 'backgroundColor'
 * kebabToCamelCase('font-weight');      // 'fontWeight'
 * kebabToCamelCase('color');            // 'color'
 * ```
 */
export function kebabToCamelCase(prop: string): string {
    return prop.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

/**
 * Parses an inline CSS style string and merges its declarations into the styles target.
 *
 * @param styles - The target styles object to merge into (mutated in place)
 * @param styleStr - The CSS style string to parse
 *
 * @example
 * ```ts
 * const styles: Record<string, string> = {};
 * parseStyleString(styles, 'color: red; font-weight: bold');
 * // styles → { color: 'red', fontWeight: 'bold' }
 * ```
 */
export function parseStyleString(styles: Record<string, string>, styleStr: string): void {
    styleStr.split(';').forEach(declaration => {
        const colonIdx = declaration.indexOf(':');
        if (colonIdx === -1) return;

        const prop = declaration.slice(0, colonIdx).trim();
        const val = declaration.slice(colonIdx + 1).trim();

        if (prop && val) {
            styles[kebabToCamelCase(prop)] = val;
        }
    });
}
