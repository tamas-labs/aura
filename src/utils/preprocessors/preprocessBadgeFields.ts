/**
 * Auto-generates `body.columnConfigs` entries for `_badge` suffixed fields.
 *
 * Scans header cells for `field` / `fields[]` values ending in `_badge` and
 * turns each into a plain `{ type: 'badge' }` config with default settings.
 * Unlike `_link` / `_button`, a badge never navigates: there are **no routes,
 * no action prefixes (`create`/`edit`/`show`/`destroy`) and no modal trigger**.
 * The only per-prefix logic is field resolution and the Bootstrap variant.
 *
 * Field resolution (the value the badge displays):
 * - Strip `_badge` → prefix (`status_badge` → `status`).
 * - If a header column with that `field` exists → read `field: prefix`
 *   (per-row value from `items`, consistent with `_link` / `_button`).
 * - Otherwise → read the full suffixed field itself (`field: 'status_badge'`),
 *   i.e. the backend sends the badge value under the suffixed key.
 *
 * Variant (default badge colour):
 * - Resolved from the `variants` registry by prefix
 *   (`variants[camelCase(prefix)]`), falling back to `variants.secondary`
 *   then the literal `'secondary'`. Mapping / boolean / counter modes cannot be
 *   inferred, so an auto-generated badge is always a plain field badge.
 */
import type {
    BadgeConfig,
    BootstrapColor,
    Body,
    ColumnConfig,
    Header,
} from '../../types/api-response.types';
import {
    collectCellFields,
    collectHeaderFields,
    readRegistryEntry,
    snakeToCamel,
} from './preprocessor-utils';
import { createNullObject, readOwnEntry } from '../safe-object.util';

/** Suffix that triggers auto-generation. */
const BADGE_SUFFIX = '_badge';

/** Fallback Bootstrap variant when the registry resolves nothing. */
const FALLBACK_VARIANT = 'secondary';

/**
 * Resolves the Bootstrap badge variant for a `_badge` prefix from the
 * `variants` registry: `variants[camelCase(prefix)]`, falling back to
 * `variants.secondary`, then the literal `'secondary'`. The lookup goes through
 * {@link readRegistryEntry}, so a prefix named after a prototype member resolves
 * like an unknown one.
 *
 * @param prefix - The part before `_badge` (e.g. 'status', 'user_role')
 * @param variants - Variant registry mapping keys to Bootstrap variant names
 * @returns The resolved Bootstrap variant name
 */
function resolveBadgeVariant(prefix: string, variants: Record<string, string> | undefined): string {
    const camelKey = snakeToCamel(prefix);
    return readRegistryEntry(variants, camelKey, FALLBACK_VARIANT) ?? FALLBACK_VARIANT;
}

/**
 * Builds the generated badge config for a single `_badge` prefix.
 *
 * @param prefix - The part before `_badge` (e.g. 'status')
 * @param field - The full suffixed field name (e.g. 'status_badge')
 * @param headerFields - Set of all field names declared in the header
 * @param variant - The resolved Bootstrap variant for the badge
 * @returns A badge config reading either the prefix column or the suffixed field
 */
function buildAutoConfig(
    prefix: string,
    field: string,
    headerFields: Set<string>,
    variant: string
): BadgeConfig {
    // Prefer a real prefix column (per-row value); otherwise read the suffixed field itself.
    const sourceField = headerFields.has(prefix) ? prefix : field;
    // The registry variant is a plain string; the preprocessor runs after validation,
    // so an invalid colour just yields a harmless non-existent `text-bg-*` class.
    return { type: 'badge', field: sourceField, variant: variant as BootstrapColor };
}

/**
 * Generates configs for every `_badge` field on a single header cell, writing
 * them into the shared `generated` accumulator. Skips fields that already have
 * a config (existing or generated).
 *
 * @param cell - The header cell object
 * @param headerFields - Set of all field names declared in the header
 * @param variants - Variant registry from config
 * @param existingConfigs - Configs already present in the body
 * @param generated - Accumulator for newly generated configs (mutated)
 */
function generateCellBadgeConfigs(
    cell: Record<string, unknown>,
    headerFields: Set<string>,
    variants: Record<string, string> | undefined,
    existingConfigs: Record<string, ColumnConfig>,
    generated: Record<string, ColumnConfig>
): void {
    for (const field of collectCellFields(cell)) {
        if (!field.endsWith(BADGE_SUFFIX)) continue;
        if (readOwnEntry(existingConfigs, field) || readOwnEntry(generated, field)) continue;

        const prefix = field.slice(0, -BADGE_SUFFIX.length);
        const variant = resolveBadgeVariant(prefix, variants);
        generated[field] = buildAutoConfig(prefix, field, headerFields, variant);
    }
}

/**
 * Preprocesses `_badge` suffixed fields in the API response header.
 *
 * For each `_badge` field without an existing columnConfig, generates a plain
 * badge config (see module docs). Existing and already-processed fields are
 * skipped. The function is pure — it shallow-clones the body only when new
 * entries are added.
 *
 * @param header - Validated header from the API response
 * @param body - Validated body (may be null — created if entries are generated)
 * @param variants - Variant registry from config (drives the badge variant)
 * @returns The body with auto-generated configs, or the original body if none apply
 *
 * @example
 * ```ts
 * // header has 'status_badge' (no 'status' column) and 'role_badge' (with a 'role' column)
 * const body = preprocessBadgeFields(header, null, { role: 'info' });
 * // status_badge → { type: 'badge', field: 'status_badge', variant: 'secondary' }
 * // role_badge   → { type: 'badge', field: 'role',         variant: 'info' }
 * ```
 */
export function preprocessBadgeFields(
    header: Header,
    body: Body | null,
    variants: Record<string, string> | undefined
): Body | null {
    const headerFields = new Set(collectHeaderFields(header));
    const existingConfigs = body?.columnConfigs ?? {};
    const generated = createNullObject<ColumnConfig>();

    for (const row of header.rows ?? []) {
        for (const cell of row.cells ?? []) {
            generateCellBadgeConfigs(
                cell as unknown as Record<string, unknown>,
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
