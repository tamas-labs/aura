import { resolveValue } from '../../../../utils';

/**
 * Resolves a route template string by replacing `{key}` placeholders
 * with values from the row item, converting dot separators to slashes,
 * and optionally prepending a siteName base URL.
 *
 * Resolution order:
 * 1. `{placeholder}` → item value via resolveValue
 * 2. Remaining dot characters → `/`
 * 3. Leading `/` normalised (added if missing)
 * 4. siteName prepended when provided
 *
 * Missing keys result in an empty string placeholder replacement.
 *
 * @param route - URL template, e.g. 'items.{id}.edit' or '/items/{id}/edit'
 * @param item - Row data object
 * @param siteName - Optional base URL prefix
 * @returns Resolved URL string
 *
 * @example
 * ```ts
 * resolveRoute('items.{id}.edit', { id: 42 }, 'https://myapp.com');
 * // 'https://myapp.com/items/42/edit'
 *
 * resolveRoute('items.{id}.edit', { id: 5 }, null);
 * // '/items/5/edit'
 *
 * resolveRoute('/items/{id}/edit', { id: 3 }, undefined);
 * // '/items/3/edit'
 * ```
 */
export function resolveRoute(
    route: string,
    item: Record<string, unknown>,
    siteName?: string | null
): string {
    const resolved = route.replace(/\{([\w.]+)\}/g, (_match, key: string) => {
        const val = resolveValue(item, key);
        return val !== null && val !== undefined ? String(val) : '';
    });

    const slashed = resolved.replace(/\./g, '/');
    const normalizedRoute = slashed.startsWith('/') ? slashed : `/${slashed}`;

    if (siteName) {
        return `${siteName.replace(/\/$/, '')}${normalizedRoute}`;
    }

    return normalizedRoute;
}
