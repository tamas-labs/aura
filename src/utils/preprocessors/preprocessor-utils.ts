/**
 * Shared utility functions for the response preprocessor layer.
 *
 * Provides snake_case conversion helpers, header/item field collectors and a
 * unified icon/variant registry resolver used by both auto-generation and
 * normalization.
 */
import type { Header } from '../../types/api-response.types';
import { readOwnEntry } from '../safe-object.util';

/** Built-in action prefix: create form. */
export const CREATE_PREFIX = 'create';
/** Built-in action prefix: edit form. */
export const EDIT_PREFIX = 'edit';
/** Built-in action prefix: show/detail page. */
export const SHOW_PREFIX = 'show';
/** Built-in action prefix: destroy (modal-confirmed). */
export const DESTROY_PREFIX = 'destroy';

/** Bootstrap modal id of the built-in DestroyModal. */
export const DESTROY_MODAL_ID = 'destroyModal';

/** URL key used when a header cell declares none. */
export const DEFAULT_URL_KEY = 'id';

/**
 * Normalises a resource base path: trims leading/trailing slashes so route
 * concatenation produces a single separator.
 *
 * @param urlParameter - The resource path from config (e.g. '/admin/users/')
 * @returns The trimmed base (e.g. 'admin/users'), or '' when absent
 */
export function normaliseBase(urlParameter: string | null | undefined): string {
    let base = urlParameter ?? '';
    while (base.startsWith('/')) base = base.slice(1);
    while (base.endsWith('/')) base = base.slice(0, -1);
    return base;
}

/**
 * Reads the URL key declared on a header cell, falling back to 'id'.
 *
 * @param cell - The header cell object
 * @returns The cell's `key`, or 'id' when missing/empty
 */
export function resolveCellKey(cell: Record<string, unknown>): string {
    return typeof cell.key === 'string' && cell.key ? cell.key : DEFAULT_URL_KEY;
}

/**
 * Collects field name(s) from a single header cell (`field` + `fields[]`).
 *
 * @param cell - The header cell object
 * @returns Array of field name strings declared on the cell
 */
export function collectCellFields(cell: Record<string, unknown>): string[] {
    const fields: string[] = [];
    if (typeof cell.field === 'string') fields.push(cell.field);
    if (Array.isArray(cell.fields)) {
        for (const f of cell.fields) {
            if (typeof f === 'string') fields.push(f);
        }
    }
    return fields;
}

/**
 * Collects all field names from every header cell (both `field` and `fields[]`).
 *
 * @param header - The validated header object
 * @returns Flattened array of all declared field names
 */
export function collectHeaderFields(header: Header): string[] {
    const fields: string[] = [];
    for (const row of header.rows ?? []) {
        for (const cell of row.cells ?? []) {
            fields.push(...collectCellFields(cell as unknown as Record<string, unknown>));
        }
    }
    return fields;
}

/**
 * Builds the set of data keys present on the first item row.
 *
 * Used to distinguish real data fields from synthetic suffix fields
 * (e.g. `name_link`) during auto-generation.
 *
 * @param items - The items array from the API response
 * @returns Set of property keys from the first item (empty when no items)
 */
export function buildItemKeysSet(items: unknown[] | undefined): Set<string> {
    if (!items || items.length === 0) return new Set();
    const first = items[0];
    if (typeof first !== 'object' || first === null) return new Set();
    return new Set(Object.keys(first));
}

/**
 * Converts a snake_case string to camelCase.
 *
 * @param str - The snake_case input string
 * @returns The camelCase equivalent
 *
 * @example
 * ```ts
 * snakeToCamel('switch_user'); // 'switchUser'
 * snakeToCamel('destroy');     // 'destroy'
 * snakeToCamel('my_long_name'); // 'myLongName'
 * ```
 */
export function snakeToCamel(str: string): string {
    if (!str) return str;
    return str.replace(/_([a-z])/g, (_match, letter: string) => letter.toUpperCase());
}

/**
 * Converts a snake_case string to Title Case with spaces.
 *
 * @param str - The snake_case input string
 * @returns The Title Case equivalent
 *
 * @example
 * ```ts
 * snakeToTitleCase('switch_user'); // 'Switch User'
 * snakeToTitleCase('destroy');     // 'Destroy'
 * snakeToTitleCase('my_long_name'); // 'My Long Name'
 * ```
 */
export function snakeToTitleCase(str: string): string {
    if (!str) return str;
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/** Registry key used when the requested key is absent. */
const REGISTRY_FALLBACK_KEY = 'primary';

/**
 * Reads one entry from a host-supplied registry with a response-sourced key.
 *
 * The key reaching these registries comes from the API response (a `*_icon` header field
 * name, a `_badge`/`_button` prefix, a config object's `icon`/`variant`), while the
 * registries themselves are ordinary object literals. Plain bracket access therefore walks
 * the prototype chain: `icons['constructor']` hands back the `Object` constructor, which is
 * truthy, survives the caller's presence check and then blows up in the spread
 * (`TypeError: Spread syntax requires ...iterable[Symbol.iterator] to be a function`). Both
 * the key and the fallback key go through the own-key guard, so an inherited name behaves
 * exactly like an unknown name.
 *
 * @param registry - The host-supplied registry being looked up in (may be absent)
 * @param key - The lookup key (response-sourced, may be absent)
 * @param fallbackKey - Key to read when `key` resolves to nothing (defaults to `primary`)
 * @returns The own entry for `key`, the own fallback entry, or `undefined`
 */
export function readRegistryEntry<T>(
    registry: Record<string, T> | undefined,
    key: string | null | undefined,
    fallbackKey: string = REGISTRY_FALLBACK_KEY
): T | undefined {
    return readOwnEntry(registry, key) ?? readOwnEntry(registry, fallbackKey);
}

/**
 * Resolves a combined CSS class array from the icon and variant registries.
 *
 * - Icon: looks up `icons[iconKey]`, falls back to `icons.primary`, returns empty if no registry.
 * - Variant: looks up `variants[variantKey]`, falls back to `variants.primary`,
 *   returns `text-{resolved}` or nothing.
 *
 * Both lookups go through {@link readRegistryEntry}, so an inherited name arriving from the
 * response (`constructor`, `toString`, `__proto__`, ...) resolves like an unknown key
 * instead of returning a prototype member.
 *
 * @param iconKey - Icon registry key (camelCase), or null/undefined to skip icon lookup
 * @param icons - Icon registry mapping keys to CSS class arrays
 * @param variantKey - Variant registry key (camelCase), or null/undefined to skip variant lookup
 * @param variants - Variant registry mapping keys to Bootstrap color names
 * @returns Combined CSS class array
 *
 * @example
 * ```ts
 * resolveIconClassesFromRegistry(
 *     'switchUser',
 *     { switchUser: ['fas', 'fa-user'], primary: ['fas', 'fa-file'] },
 *     'switchUser',
 *     { switchUser: 'danger', primary: 'primary' }
 * );
 * // ['fas', 'fa-user', 'text-danger']
 * ```
 */
export function resolveIconClassesFromRegistry(
    iconKey: string | null | undefined,
    icons: Record<string, string[]> | undefined,
    variantKey: string | null | undefined,
    variants: Record<string, string> | undefined
): string[] {
    const classes: string[] = [];

    if (iconKey && icons) {
        const iconClasses = readRegistryEntry(icons, iconKey);
        if (Array.isArray(iconClasses)) {
            classes.push(...iconClasses);
        }
    }

    if (variantKey && variants) {
        const resolved = readRegistryEntry(variants, variantKey);
        if (typeof resolved === 'string' && resolved) {
            classes.push(`text-${resolved}`);
        }
    }

    return classes;
}

/**
 * Resolves the merged CSS class array for an icon-bearing config object.
 *
 * Reads `icon` and `variant ?? color` from the source, looks them up via the
 * registries (`resolveIconClassesFromRegistry`), then prepends the resolved
 * registry classes to any existing `class` value (string or string[]).
 *
 * Used by both the icon and modal preprocessors when normalizing shorthand
 * fields into a unified `class` array.
 *
 * @param source - The config/branch/content object carrying `icon`/`variant`/`color`/`class`
 * @param icons - Icon registry from config
 * @param variants - Variant registry from config
 * @returns `[...registryClasses, ...existingClasses]`
 */
export function resolveMergedIconClasses(
    source: Record<string, unknown>,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): string[] {
    const iconKey = source.icon as string | null | undefined;
    const variantKey = (source.variant ?? source.color) as string | null | undefined;

    const registryClasses = resolveIconClassesFromRegistry(iconKey, icons, variantKey, variants);

    const existingClass = source.class;
    let existingClasses: string[] = [];
    if (Array.isArray(existingClass)) {
        existingClasses = existingClass as string[];
    } else if (typeof existingClass === 'string') {
        existingClasses = existingClass.split(/\s+/).filter(Boolean);
    }

    return [...registryClasses, ...existingClasses];
}
