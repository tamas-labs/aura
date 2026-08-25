import type { IconConfig } from '../../../../types/api-response.types';
import { resolveValue } from '../../../../utils';

/**
 * Normalises a global class value from `config.classes` to a string array.
 *
 * Accepts string[] (returned as-is), space-separated string (split), or
 * any falsy / non-iterable value (returns empty array).
 *
 * @param value - The raw global class value (string, string[] or anything else)
 * @returns Array of CSS class strings
 */
export function resolveGlobalClassArray(value: unknown): string[] {
    if (!value) return [];
    if (Array.isArray(value)) return (value as string[]).filter(s => typeof s === 'string');
    if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
    return [];
}

/**
 * Resolves the CSS class list for an icon element from its `class` field.
 *
 * The preprocessor layer (⑦.5) has already resolved `icon`/`variant`/`color`
 * fields into the `class` array, so this only reads `config.class`.
 *
 * @param config - The icon config object (preprocessed)
 * @returns Array of CSS class strings
 */
export function resolveIconClasses(config: IconConfig): string[] {
    if (!config.class) return [];
    if (Array.isArray(config.class)) return [...config.class];
    return String(config.class).split(/\s+/).filter(Boolean);
}

/**
 * Applies the shared content-element attributes (`class` and inline `style`)
 * onto an attribute map, omitting empty values.
 *
 * @param attrs - The target attribute map (mutated in place)
 * @param classes - Resolved CSS class list
 * @param styles - Resolved inline styles
 */
export function applyBaseContentAttrs(
    attrs: Record<string, unknown>,
    classes: string[],
    styles: Record<string, string>
): void {
    if (classes.length > 0) attrs.class = classes;
    if (Object.keys(styles).length > 0) attrs.style = styles;
}

/**
 * Resolves the display text source for a field-or-value config: the `field`
 * value read from the row item when both are present, otherwise the static
 * `value`. Shared by the link and button renderers.
 *
 * @param config - Config carrying optional `field` (item property) and `value` (literal)
 * @param item - Row data object (optional)
 * @returns The raw (unformatted) text source
 */
export function resolveFieldOrValueText(
    config: { field?: string | null; value?: string | null },
    item?: Record<string, unknown>
): string | number | boolean | null | undefined {
    if (config.field && item) {
        return resolveValue(item, config.field) as string | number | boolean | null | undefined;
    }
    return config.value ?? null;
}

/**
 * Substitutes `{placeholder}` tokens in a string with row item values.
 *
 * Used for `data-*` attribute values (e.g. `"data-user-id": "{id}"`). Non-string
 * values and missing items are returned unchanged. Shared by the link and button
 * renderers.
 *
 * @param value - The raw attribute value
 * @param item - Row data object (optional)
 * @returns The value with placeholders resolved
 */
export function substituteItemPlaceholders(
    value: unknown,
    item?: Record<string, unknown>
): unknown {
    if (typeof value !== 'string' || !item) return value;
    return value.replace(/\{([\w.]+)\}/g, (_match, key: string) => {
        const resolved = resolveValue(item, key);
        return resolved !== null && resolved !== undefined ? String(resolved) : '';
    });
}

/**
 * Forwards `data-*` attributes from a config object onto an attribute map.
 *
 * An optional `transform` callback is applied to each value — used by the link
 * renderer for `{field}` placeholder substitution; the icon renderer passes
 * values through unchanged.
 *
 * @param config - The source config object
 * @param attrs - The target attribute map (mutated in place)
 * @param transform - Optional value transformer applied per attribute
 */
export function forwardDataAttributes(
    config: Record<string, unknown>,
    attrs: Record<string, unknown>,
    transform?: (value: unknown) => unknown
): void {
    for (const k of Object.keys(config)) {
        if (k.startsWith('data-')) {
            const value = config[k];
            attrs[k] = transform ? transform(value) : value;
        }
    }
}
