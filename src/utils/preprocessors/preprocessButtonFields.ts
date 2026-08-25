/**
 * Auto-generates `body.columnConfigs` entries for `_button` suffixed fields.
 *
 * Scans header cells for `field` / `fields[]` values ending in `_button`. The
 * prefix (the part before `_button`) and the cell `key` (URL key, default `id`)
 * drive the generated config. Routes are built relative to the resource base
 * (`urlParameter`, the `{current_url}` equivalent); `siteName` prefixing and
 * `{key}` placeholder resolution happen later in `resolveRoute`.
 *
 * Unlike `_link`, a generated button always receives a Bootstrap `variant`
 * (an unstyled `.btn` would be invisible). The variant is resolved from the
 * `variants` registry using the prefix (e.g. `edit` → `variants.edit`), falling
 * back to `variants.primary` and then the literal `'primary'`.
 *
 * Shapes:
 * 1. **Built-in action prefixes** (Laravel resource conventions):
 *    - `create_button`  → button → `{base}/create`
 *    - `edit_button`    → button → `{base}/{key}/edit`
 *    - `show_button`    → button → `{base}/{key}`
 *    - `destroy_button` → **modal trigger** (`id: destroyModal`) → `{base}/{key}/destroy`,
 *      with a `{ type: 'button' }` content
 * 2. **Header-column prefix** (a column with that `field` exists in the header,
 *    e.g. `name_button` with a `name` column) → `{ field: prefix }` button to
 *    `{base}/{key}/{prefix}`. The cell content is read per-row from `items`.
 * 3. **Other prefixes** (no matching header column) → static label text (the
 *    literal prefix) linking to `{base}/{key}/{prefix}`.
 */
import type { Body, ButtonConfig, ColumnConfig, Header } from '../../types/api-response.types';
import {
    collectCellFields,
    collectHeaderFields,
    normaliseBase,
    readRegistryEntry,
    resolveCellKey,
    snakeToCamel,
    CREATE_PREFIX,
    EDIT_PREFIX,
    SHOW_PREFIX,
    DESTROY_PREFIX,
    DESTROY_MODAL_ID,
} from './preprocessor-utils';
import { createNullObject, readOwnEntry } from '../safe-object.util';

/** Suffix that triggers auto-generation. */
const BUTTON_SUFFIX = '_button';

/** Fallback Bootstrap variant when the registry resolves nothing. */
const FALLBACK_VARIANT = 'primary';

/**
 * Resolves the Bootstrap button variant for a `_button` prefix from the
 * `variants` registry: `variants[camelCase(prefix)]`, falling back to
 * `variants.primary`, then the literal `'primary'`. The lookup goes through
 * {@link readRegistryEntry}, so a prefix named after a prototype member resolves
 * like an unknown one.
 *
 * @param prefix - The part before `_button` (e.g. 'edit', 'switch_user')
 * @param variants - Variant registry mapping keys to Bootstrap variant names
 * @returns The resolved Bootstrap variant name
 */
function resolveButtonVariant(
    prefix: string,
    variants: Record<string, string> | undefined
): string {
    const camelKey = snakeToCamel(prefix);
    return readRegistryEntry(variants, camelKey, FALLBACK_VARIANT) ?? FALLBACK_VARIANT;
}

/**
 * Builds the generated config for a single `_button` prefix.
 *
 * @param prefix - The part before `_button` (e.g. 'name', 'edit')
 * @param cellKey - The URL key for this cell (the `{key}` placeholder name)
 * @param base - The normalised resource base path
 * @param headerFields - Set of all field names declared in the header
 * @param variant - The resolved Bootstrap variant for the button
 * @returns A button config (or a modal config for `destroy`)
 */
function buildAutoConfig(
    prefix: string,
    cellKey: string,
    base: string,
    headerFields: Set<string>,
    variant: string
): ColumnConfig {
    if (prefix === CREATE_PREFIX) {
        return { type: 'button', value: prefix, variant, route: `${base}/create` };
    }
    if (prefix === EDIT_PREFIX) {
        return {
            type: 'button',
            value: prefix,
            variant,
            key: cellKey,
            route: `${base}/{${cellKey}}/edit`,
        };
    }
    if (prefix === SHOW_PREFIX) {
        return {
            type: 'button',
            value: prefix,
            variant,
            key: cellKey,
            route: `${base}/{${cellKey}}`,
        };
    }
    if (prefix === DESTROY_PREFIX) {
        return {
            type: 'modal',
            id: DESTROY_MODAL_ID,
            key: cellKey,
            route: `${base}/{${cellKey}}/destroy`,
            content: { type: 'button', value: prefix, variant },
        };
    }

    // Generic prefix: the suffix is appended to the URL. If a header column with
    // that field exists, display its per-row value; otherwise static label text.
    const route = `${base}/{${cellKey}}/${prefix}`;
    const shared: ButtonConfig = { type: 'button', variant, key: cellKey, route };
    if (headerFields.has(prefix)) {
        return { ...shared, field: prefix };
    }
    return { ...shared, value: prefix };
}

/**
 * Generates configs for every `_button` field on a single header cell, writing
 * them into the shared `generated` accumulator. Skips fields that already have
 * a config (existing or generated).
 *
 * @param cell - The header cell object
 * @param base - The normalised resource base path
 * @param headerFields - Set of all field names declared in the header
 * @param variants - Variant registry from config
 * @param existingConfigs - Configs already present in the body
 * @param generated - Accumulator for newly generated configs (mutated)
 */
function generateCellButtonConfigs(
    cell: Record<string, unknown>,
    base: string,
    headerFields: Set<string>,
    variants: Record<string, string> | undefined,
    existingConfigs: Record<string, ColumnConfig>,
    generated: Record<string, ColumnConfig>
): void {
    const cellKey = resolveCellKey(cell);

    for (const field of collectCellFields(cell)) {
        if (!field.endsWith(BUTTON_SUFFIX)) continue;
        if (readOwnEntry(existingConfigs, field) || readOwnEntry(generated, field)) continue;

        const prefix = field.slice(0, -BUTTON_SUFFIX.length);
        const variant = resolveButtonVariant(prefix, variants);
        generated[field] = buildAutoConfig(prefix, cellKey, base, headerFields, variant);
    }
}

/**
 * Preprocesses `_button` suffixed fields in the API response header.
 *
 * For each `_button` field without an existing columnConfig, generates the
 * appropriate config (see module docs). Existing and already-processed fields
 * are skipped. The function is pure — it shallow-clones the body only when new
 * entries are added.
 *
 * @param header - Validated header from the API response
 * @param body - Validated body (may be null — created if entries are generated)
 * @param variants - Variant registry from config (drives the button variant)
 * @param urlParameter - The resource base path from config (the `{current_url}` equivalent)
 * @returns The body with auto-generated configs, or the original body if none apply
 *
 * @example
 * ```ts
 * // header has 'name_button' (with a 'name' column), 'edit_button' and 'destroy_button'
 * const body = preprocessButtonFields(header, null, { edit: 'primary', destroy: 'danger' }, 'admin/users');
 * // name_button    → { type: 'button', variant: 'primary', field: 'name', key: 'id', route: 'admin/users/{id}/name' }
 * // edit_button    → { type: 'button', value: 'edit', variant: 'primary', key: 'id', route: 'admin/users/{id}/edit' }
 * // destroy_button → { type: 'modal', id: 'destroyModal', key: 'id',
 * //                   route: 'admin/users/{id}/destroy', content: { type: 'button', value: 'destroy', variant: 'danger' } }
 * ```
 */
export function preprocessButtonFields(
    header: Header,
    body: Body | null,
    variants: Record<string, string> | undefined,
    urlParameter: string | null | undefined
): Body | null {
    const base = normaliseBase(urlParameter);
    const headerFields = new Set(collectHeaderFields(header));
    const existingConfigs = body?.columnConfigs ?? {};
    const generated = createNullObject<ColumnConfig>();

    for (const row of header.rows ?? []) {
        for (const cell of row.cells ?? []) {
            generateCellButtonConfigs(
                cell as unknown as Record<string, unknown>,
                base,
                headerFields,
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
