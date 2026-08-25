/**
 * Auto-generates `body.columnConfigs` entries for `_progress` suffixed fields.
 *
 * Scans header cells for `field` / `fields[]` values ending in `_progress` and
 * turns each into a plain `{ type: 'progress' }` config with default settings.
 * Like `_badge` (and unlike `_link` / `_button` / `_icon`), a progress bar never
 * navigates: there are **no routes, no action prefixes and no modal trigger**,
 * and there is **no variant registry** either — an auto-generated progress bar is
 * always a plain field bar (the render layer's `primary` fallback colours it).
 *
 * Field resolution (the value the bar fills to):
 * - Strip `_progress` → prefix (`completion_progress` → `completion`).
 * - If a header column with that `field` exists → read `field: prefix`
 *   (per-row value from `items`, consistent with `_badge`).
 * - Otherwise → read the full suffixed field itself (`field: 'completion_progress'`),
 *   i.e. the backend sends the progress value under the suffixed key.
 */
import type { Body, ColumnConfig, Header, ProgressConfig } from '../../types/api-response.types';
import { collectCellFields, collectHeaderFields } from './preprocessor-utils';
import { createNullObject, readOwnEntry } from '../safe-object.util';

/** Suffix that triggers auto-generation. */
const PROGRESS_SUFFIX = '_progress';

/**
 * Builds the generated progress config for a single `_progress` prefix.
 *
 * @param prefix - The part before `_progress` (e.g. 'completion')
 * @param field - The full suffixed field name (e.g. 'completion_progress')
 * @param headerFields - Set of all field names declared in the header
 * @returns A progress config reading either the prefix column or the suffixed field
 */
function buildAutoConfig(prefix: string, field: string, headerFields: Set<string>): ProgressConfig {
    // Prefer a real prefix column (per-row value); otherwise read the suffixed field itself.
    const sourceField = headerFields.has(prefix) ? prefix : field;
    return { type: 'progress', field: sourceField };
}

/**
 * Generates configs for every `_progress` field on a single header cell, writing
 * them into the shared `generated` accumulator. Skips fields that already have a
 * config (existing or generated).
 *
 * @param cell - The header cell object
 * @param headerFields - Set of all field names declared in the header
 * @param existingConfigs - Configs already present in the body
 * @param generated - Accumulator for newly generated configs (mutated)
 */
function generateCellProgressConfigs(
    cell: Record<string, unknown>,
    headerFields: Set<string>,
    existingConfigs: Record<string, ColumnConfig>,
    generated: Record<string, ColumnConfig>
): void {
    for (const field of collectCellFields(cell)) {
        if (!field.endsWith(PROGRESS_SUFFIX)) continue;
        if (readOwnEntry(existingConfigs, field) || readOwnEntry(generated, field)) continue;

        const prefix = field.slice(0, -PROGRESS_SUFFIX.length);
        generated[field] = buildAutoConfig(prefix, field, headerFields);
    }
}

/**
 * Preprocesses `_progress` suffixed fields in the API response header.
 *
 * For each `_progress` field without an existing columnConfig, generates a plain
 * progress config (see module docs). Existing and already-processed fields are
 * skipped. The function is pure — it shallow-clones the body only when new
 * entries are added.
 *
 * @param header - Validated header from the API response
 * @param body - Validated body (may be null — created if entries are generated)
 * @returns The body with auto-generated configs, or the original body if none apply
 *
 * @example
 * ```ts
 * // header has 'completion_progress' (no 'completion' column) and 'cpu_progress' (with a 'cpu' column)
 * const body = preprocessProgressFields(header, null);
 * // completion_progress → { type: 'progress', field: 'completion_progress' }
 * // cpu_progress        → { type: 'progress', field: 'cpu' }
 * ```
 */
export function preprocessProgressFields(header: Header, body: Body | null): Body | null {
    const headerFields = new Set(collectHeaderFields(header));
    const existingConfigs = body?.columnConfigs ?? {};
    const generated = createNullObject<ColumnConfig>();

    for (const row of header.rows ?? []) {
        for (const cell of row.cells ?? []) {
            generateCellProgressConfigs(
                cell as unknown as Record<string, unknown>,
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
