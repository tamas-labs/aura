/**
 * Auto-generates `body.columnConfigs` entries for `_link` suffixed fields.
 *
 * Scans header cells for `field` / `fields[]` values ending in `_link`. The
 * prefix (the part before `_link`) and the cell `key` (URL key, default `id`)
 * drive the generated config. Routes are built relative to the resource base
 * (`urlParameter`, the `{current_url}` equivalent); `siteName` prefixing and
 * `{key}` placeholder resolution happen later in `resolveRoute`.
 *
 * Shapes:
 * 1. **Built-in action prefixes** (Laravel resource conventions):
 *    - `create_link`  → link → `{base}/create`
 *    - `edit_link`    → link → `{base}/{key}/edit`
 *    - `show_link`    → link → `{base}/{key}`
 *    - `destroy_link` → **modal trigger** (`id: destroyModal`) → `{base}/{key}/destroy`
 * 2. **Header-column prefix** (a column with that `field` exists in the header,
 *    e.g. `name_link` with a `name` column) → `{ field: prefix }` link to
 *    `{base}/{key}/{prefix}`. The cell content is read per-row from `items`
 *    (e.g. `name` = "Ada Lovelace" / "Alan Turing").
 * 3. **Other prefixes** (no matching header column) → static label text (the
 *    literal prefix) linking to `{base}/{key}/{prefix}`.
 */
import type { Body, ColumnConfig, Header } from '../../types/api-response.types';
import {
    collectCellFields,
    collectHeaderFields,
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
const LINK_SUFFIX = '_link';

/**
 * Builds the generated config for a single `_link` prefix.
 *
 * @param prefix - The part before `_link` (e.g. 'name', 'edit')
 * @param cellKey - The URL key for this cell (the `{key}` placeholder name)
 * @param base - The normalised resource base path
 * @param headerFields - Set of all field names declared in the header
 * @returns A link config (or a modal config for `destroy`)
 */
function buildAutoConfig(
    prefix: string,
    cellKey: string,
    base: string,
    headerFields: Set<string>
): ColumnConfig {
    if (prefix === CREATE_PREFIX) {
        return { type: 'link', value: prefix, route: `${base}/create` };
    }
    if (prefix === EDIT_PREFIX) {
        return { type: 'link', value: prefix, key: cellKey, route: `${base}/{${cellKey}}/edit` };
    }
    if (prefix === SHOW_PREFIX) {
        return { type: 'link', value: prefix, key: cellKey, route: `${base}/{${cellKey}}` };
    }
    if (prefix === DESTROY_PREFIX) {
        return {
            type: 'modal',
            id: DESTROY_MODAL_ID,
            key: cellKey,
            route: `${base}/{${cellKey}}/destroy`,
            content: { type: 'link', value: prefix },
        };
    }

    // Generic prefix: the suffix is appended to the URL. If a header column with
    // that field exists, display its per-row value; otherwise static label text.
    const route = `${base}/{${cellKey}}/${prefix}`;
    if (headerFields.has(prefix)) {
        return { type: 'link', field: prefix, key: cellKey, route };
    }
    return { type: 'link', value: prefix, key: cellKey, route };
}

/**
 * Generates configs for every `_link` field on a single header cell, writing
 * them into the shared `generated` accumulator. Skips fields that already have
 * a config (existing or generated).
 *
 * @param cell - The header cell object
 * @param base - The normalised resource base path
 * @param headerFields - Set of all field names declared in the header
 * @param existingConfigs - Configs already present in the body
 * @param generated - Accumulator for newly generated configs (mutated)
 */
function generateCellLinkConfigs(
    cell: Record<string, unknown>,
    base: string,
    headerFields: Set<string>,
    existingConfigs: Record<string, ColumnConfig>,
    generated: Record<string, ColumnConfig>
): void {
    const cellKey = resolveCellKey(cell);

    for (const field of collectCellFields(cell)) {
        if (!field.endsWith(LINK_SUFFIX)) continue;
        if (readOwnEntry(existingConfigs, field) || readOwnEntry(generated, field)) continue;

        const prefix = field.slice(0, -LINK_SUFFIX.length);
        generated[field] = buildAutoConfig(prefix, cellKey, base, headerFields);
    }
}

/**
 * Preprocesses `_link` suffixed fields in the API response header.
 *
 * For each `_link` field without an existing columnConfig, generates the
 * appropriate config (see module docs). Existing and already-processed fields
 * are skipped. The function is pure — it shallow-clones the body only when new
 * entries are added.
 *
 * @param header - Validated header from the API response
 * @param body - Validated body (may be null — created if entries are generated)
 * @param urlParameter - The resource base path from config (the `{current_url}` equivalent)
 * @returns The body with auto-generated configs, or the original body if none apply
 *
 * @example
 * ```ts
 * // header has 'name_link' (with a 'name' column), 'edit_link' and 'destroy_link'
 * const body = preprocessLinkFields(header, null, 'admin/users');
 * // name_link    → { type: 'link', field: 'name', key: 'id', route: 'admin/users/{id}/name' }
 * // edit_link    → { type: 'link', value: 'edit', key: 'id', route: 'admin/users/{id}/edit' }
 * // destroy_link → { type: 'modal', id: 'destroyModal', key: 'id',
 * //                  route: 'admin/users/{id}/destroy', content: { type: 'link', value: 'destroy' } }
 * ```
 */
export function preprocessLinkFields(
    header: Header,
    body: Body | null,
    urlParameter: string | null | undefined
): Body | null {
    const base = normaliseBase(urlParameter);
    const headerFields = new Set(collectHeaderFields(header));
    const existingConfigs = body?.columnConfigs ?? {};
    const generated = createNullObject<ColumnConfig>();

    for (const row of header.rows ?? []) {
        for (const cell of row.cells ?? []) {
            generateCellLinkConfigs(
                cell as unknown as Record<string, unknown>,
                base,
                headerFields,
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
