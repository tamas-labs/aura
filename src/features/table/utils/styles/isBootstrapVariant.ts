/**
 * Checks if a given color value is a defined Bootstrap variant.
 *
 * @param value - The color value to check (e.g. 'primary', '#fff', 'red')
 * @param variants - The variants object from config
 * @returns True if the value is a variant key, false otherwise
 *
 * @example
 * ```ts
 * isBootstrapVariant('primary', { primary: 'primary' }); // true
 * isBootstrapVariant('#fff', { primary: 'primary' }); // false
 * ```
 */
export function isBootstrapVariant(
    value: string | null | undefined,
    variants: Record<string, string> | undefined
): boolean {
    if (!value || !variants) {
        return false;
    }
    return Object.prototype.hasOwnProperty.call(variants, value);
}
