/**
 * Auto-generates `body.columnConfigs` entries for `_icon` suffixed fields.
 *
 * Scans header cells for `field` / `fields[]` values ending in `_icon`. The
 * prefix (the part before `_icon`) drives the generated config: it is both the
 * icon/variant registry key (glyph + colour) and the action selector.
 *
 * Fields present in `items[0]` (real data) or already in `columnConfigs` are
 * skipped.
 *
 * Shapes:
 * 1. **Built-in action prefixes** (Laravel resource conventions, routes relative
 *    to the resource base `urlParameter`):
 *    - `create_icon`  → icon link → `{base}/create`
 *    - `edit_icon`    → icon link → `{base}/{key}/edit`
 *    - `show_icon`    → icon link → `{base}/{key}`
 *    - `destroy_icon` → **modal trigger** (`id: destroyModal`) → `{base}/{key}/destroy`
 * 2. **Other prefixes** (e.g. `status_icon`, `switch_user_icon`) → a plain icon
 *    glyph with no route (status indicator, does not navigate).
 *
 * The cell `key` (default `id`) is the URL placeholder name. `siteName` prefixing
 * and `{key}` resolution happen later in `resolveRoute`.
 */
import type { Body, ColumnConfig, Header, IconConfig } from '../../types/api-response.types';
import {
    snakeToCamel,
    snakeToTitleCase,
    resolveIconClassesFromRegistry,
    collectCellFields,
    buildItemKeysSet,
    normaliseBase,
    resolveCellKey,
    CREATE_PREFIX,
    EDIT_PREFIX,
    SHOW_PREFIX,
    DESTROY_PREFIX,
    DESTROY_MODAL_ID,
} from './preprocessor-utils';
import { createNullObject, readOwnEntry } from '../safe-object.util';

/** Suffix that triggers auto-generation. */
const ICON_SUFFIX = '_icon';

/**
 * Builds the base icon content object (`class`/`alt`/`title`) shared by the
 * plain icon configs and the destroy-modal icon content.
 */
function buildIconContent(classes: string[], label: string): IconConfig {
    return { type: 'icon', class: classes, alt: label, title: label };
}

/**
 * Builds the generated config for a single `_icon` prefix.
 *
 * @param prefix - The part before `_icon` (e.g. 'edit', 'switch_user')
 * @param cellKey - The URL key for this cell (the `{key}` placeholder name)
 * @param base - The normalised resource base path
 * @param classes - Resolved icon CSS classes (glyph + variant colour)
 * @param label - Human label for `alt`/`title` (Title Case of the prefix)
 * @returns An icon config (or a modal config for `destroy`)
 */
function buildIconAutoConfig(
    prefix: string,
    cellKey: string,
    base: string,
    classes: string[],
    label: string
): ColumnConfig {
    const content = buildIconContent(classes, label);

    // create has no `{key}` placeholder, but renderIconNode requires `route` AND
    // `key` to wrap the <i> in an <a> — so we still attach the key (harmless).
    if (prefix === CREATE_PREFIX) {
        return { ...content, key: cellKey, route: `${base}/create` };
    }
    if (prefix === EDIT_PREFIX) {
        return { ...content, key: cellKey, route: `${base}/{${cellKey}}/edit` };
    }
    if (prefix === SHOW_PREFIX) {
        return { ...content, key: cellKey, route: `${base}/{${cellKey}}` };
    }
    if (prefix === DESTROY_PREFIX) {
        return {
            type: 'modal',
            id: DESTROY_MODAL_ID,
            key: cellKey,
            route: `${base}/{${cellKey}}/destroy`,
            content: buildIconContent(classes, label),
        };
    }

    // Generic prefix: status indicator glyph, no navigation.
    return content;
}

/**
 * Generates configs for every `_icon` field on a single header cell, writing
 * them into the shared `generated` accumulator. Skips fields that are real data
 * (present in items) or already have a config (existing or generated).
 *
 * @param cell - The header cell object
 * @param base - The normalised resource base path
 * @param itemKeys - Set of property keys present on the first item row
 * @param icons - Icon registry from config
 * @param variants - Variant registry from config
 * @param existingConfigs - Configs already present in the body
 * @param generated - Accumulator for newly generated configs (mutated)
 */
function generateCellIconConfigs(
    cell: Record<string, unknown>,
    base: string,
    itemKeys: Set<string>,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined,
    existingConfigs: Record<string, ColumnConfig>,
    generated: Record<string, ColumnConfig>
): void {
    const cellKey = resolveCellKey(cell);

    for (const field of collectCellFields(cell)) {
        if (!field.endsWith(ICON_SUFFIX)) continue;
        if (itemKeys.has(field)) continue; // real data field
        if (readOwnEntry(existingConfigs, field) || readOwnEntry(generated, field)) continue;

        const prefix = field.slice(0, -ICON_SUFFIX.length);
        const camelKey = snakeToCamel(prefix);
        const label = snakeToTitleCase(prefix);
        const classes = resolveIconClassesFromRegistry(camelKey, icons, camelKey, variants);

        generated[field] = buildIconAutoConfig(prefix, cellKey, base, classes, label);
    }
}

/**
 * Preprocesses `_icon` suffixed fields in the API response header.
 *
 * For each `_icon` field that is not a real data field and has no existing
 * columnConfig, generates the appropriate config (see module docs). The function
 * is pure — it shallow-clones the body only when new entries are added.
 *
 * @param header - Validated header from the API response
 * @param body - Validated body (may be null — created if entries are generated)
 * @param items - The items array from the API response
 * @param icons - Icon registry from config
 * @param variants - Variant registry from config
 * @param urlParameter - Resource base path from config (the `{current_url}` equivalent for routes)
 * @returns The body with auto-generated configs, or the original body if none apply
 *
 * @example
 * ```ts
 * // header has 'switch_user_icon' (no route), 'edit_icon' and 'destroy_icon'
 * const body = preprocessIconFields(header, null, items, icons, variants, 'admin/users');
 * // switch_user_icon → { type: 'icon', class: [...], alt: 'Switch User', title: 'Switch User' }
 * // edit_icon        → { type: 'icon', class: [...], key: 'id', route: 'admin/users/{id}/edit', ... }
 * // destroy_icon     → { type: 'modal', id: 'destroyModal', key: 'id',
 * //                      route: 'admin/users/{id}/destroy', content: { type: 'icon', class: [...] } }
 * ```
 */
export function preprocessIconFields(
    header: Header,
    body: Body | null,
    items: unknown[] | undefined,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined,
    urlParameter?: string | null
): Body | null {
    const base = normaliseBase(urlParameter);
    const itemKeys = buildItemKeysSet(items);
    const existingConfigs = body?.columnConfigs ?? {};
    const generated = createNullObject<ColumnConfig>();

    for (const row of header.rows ?? []) {
        for (const cell of row.cells ?? []) {
            generateCellIconConfigs(
                cell as unknown as Record<string, unknown>,
                base,
                itemKeys,
                icons,
                variants,
                existingConfigs,
                generated
            );
        }
    }

    if (Object.keys(generated).length === 0) return body;

    return body
        ? { ...body, columnConfigs: { ...body.columnConfigs, ...generated } }
        : { columnConfigs: generated };
}
