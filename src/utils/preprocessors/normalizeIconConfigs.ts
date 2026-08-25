/**
 * Normalizes existing icon-type columnConfigs by resolving `icon`, `variant`
 * and `color` fields into a unified `class` array.
 *
 * After normalization the config only uses `class` for CSS — the rendering
 * layer does not need registry lookups.
 */
import type { Body, ColumnConfig } from '../../types/api-response.types';
import { resolveMergedIconClasses } from './preprocessor-utils';
import { createNullObject } from '../safe-object.util';

/**
 * Normalizes icon/variant/color fields in a single branch config into a `class` array.
 * Returns the branch unchanged (same reference) if none of those fields are present.
 *
 * @param branch - The branch config object (root config, if-branch element, or else-branch)
 * @param icons - Icon registry from config
 * @param variants - Variant registry from config
 * @returns Normalized branch object, or the original reference if nothing changed
 */
function normalizeBranchIcons(
    branch: Record<string, unknown>,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): Record<string, unknown> {
    const iconKey = branch.icon as string | null | undefined;
    const variantKey = (branch.variant ?? branch.color) as string | null | undefined;

    if (!iconKey && !variantKey) return branch;

    const normalized = { ...branch };
    normalized.class = resolveMergedIconClasses(branch, icons, variants);
    delete normalized.icon;
    delete normalized.variant;
    delete normalized.color;

    return normalized;
}

function normalizeIfBranches(
    rawIf: unknown,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): unknown[] | undefined {
    if (!Array.isArray(rawIf) || rawIf.length === 0) return undefined;
    let modified = false;
    const result = rawIf.map(branch => {
        if (!branch || typeof branch !== 'object') return branch;
        const normalized = normalizeBranchIcons(branch as Record<string, unknown>, icons, variants);
        if (normalized !== branch) modified = true;
        return normalized;
    });
    return modified ? result : undefined;
}

function normalizeElseBranch(
    rawElse: unknown,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): Record<string, unknown> | undefined {
    if (!rawElse || typeof rawElse !== 'object' || Array.isArray(rawElse)) return undefined;
    const normalized = normalizeBranchIcons(rawElse as Record<string, unknown>, icons, variants);
    return normalized !== rawElse ? normalized : undefined;
}

/**
 * Normalizes every entry of a `mapping` dictionary the same way as if/else branches
 * (`normalizeBranchIcons`) — each entry is treated as its own icon-bearing "branch".
 *
 * This runs at preprocessing time (once, per response), BEFORE `resolveMappingConfig`
 * merges a matched entry into the flattened render-time config — otherwise the
 * mapping-entry's `icon`/`variant`/`color` would never reach the registry lookup and
 * `renderIconNode`/`resolveIconClasses` (which only read `class`) would render an empty
 * `<i>`.
 *
 * Non-object entries (e.g. `null`) are passed through unchanged — the entry zod schema
 * is responsible for reporting those as errors.
 *
 * @param rawMapping - The (already response-validated + key-stripped) `mapping` value
 * @param icons - Icon registry from config
 * @param variants - Variant registry from config
 * @returns Normalized mapping object, or `undefined` if nothing changed
 */
function normalizeMappingEntries(
    rawMapping: unknown,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): Record<string, unknown> | undefined {
    if (!rawMapping || typeof rawMapping !== 'object' || Array.isArray(rawMapping))
        return undefined;

    const entries = rawMapping as Record<string, unknown>;
    let modified = false;
    const result = createNullObject<unknown>();

    for (const entryKey of Object.keys(entries)) {
        const entry = entries[entryKey];
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            result[entryKey] = entry;
            continue;
        }
        const normalizedEntry = normalizeBranchIcons(
            entry as Record<string, unknown>,
            icons,
            variants
        );
        if (normalizedEntry !== entry) modified = true;
        result[entryKey] = normalizedEntry;
    }

    return modified ? result : undefined;
}

function normalizeIconConfigEntry(
    iconConfig: Record<string, unknown>,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): Record<string, unknown> | null {
    const normalizedRoot = normalizeBranchIcons(iconConfig, icons, variants);
    const rootChanged = normalizedRoot !== iconConfig;
    const normalizedIf = normalizeIfBranches(iconConfig.if, icons, variants);
    const normalizedElse = normalizeElseBranch(iconConfig.else, icons, variants);
    const normalizedMapping = normalizeMappingEntries(iconConfig.mapping, icons, variants);

    if (!rootChanged && !normalizedIf && !normalizedElse && !normalizedMapping) return null;

    const finalConfig: Record<string, unknown> = rootChanged ? normalizedRoot : { ...iconConfig };
    if (normalizedIf !== undefined) finalConfig.if = normalizedIf;
    if (normalizedElse !== undefined) finalConfig.else = normalizedElse;
    if (normalizedMapping !== undefined) finalConfig.mapping = normalizedMapping;
    return finalConfig;
}

/**
 * Normalizes all `type: 'icon'` entries in `body.columnConfigs`.
 *
 * For each icon config that has `icon`, `variant` or `color` fields — at the
 * root level, within `if`/`else` conditional branches, OR within `mapping` dictionary
 * entries:
 * 1. Resolves `icon` → CSS classes via the icons registry
 * 2. Resolves `variant ?? color` → `text-{resolved}` via the variants registry
 * 3. Merges resolved classes with any existing `class` field (on the same branch/entry)
 * 4. Removes `icon`, `variant`, `color` fields from the config/branch/entry
 *
 * All other fields (`key`, `route`, `alt`, `title`, `data-*`) are preserved.
 *
 * `mapping` entries are normalized here (once, at preprocessing time) rather than at
 * render time, because `resolveMappingConfig` only merges the matched entry's keys into
 * the flattened config — it never re-runs registry resolution. Without this step a
 * mapping-resolved `icon`/`variant` would never become a `class` and `renderIconNode`
 * would render an empty `<i>`.
 *
 * @param body - The body object containing columnConfigs
 * @param icons - Icon registry from config (maps keys to CSS class arrays)
 * @param variants - Variant registry from config (maps keys to Bootstrap color names)
 * @returns The body with normalized icon configs, or unchanged body if nothing to normalize
 *
 * @example
 * ```ts
 * // Input:  { type: 'icon', icon: 'show', variant: 'info', alt: 'Show', key: 'id', route: '...' }
 * // Output: { type: 'icon', class: ['fas', 'fa-eye', 'text-info'], alt: 'Show', key: 'id', route: '...' }
 *
 * // Input:  { type: 'icon', key: 'status', mapping: { active: { icon: 'check', variant: 'success' } } }
 * // Output: { type: 'icon', key: 'status', mapping: { active: { class: ['fas', 'fa-check', 'text-success'] } } }
 * ```
 */
export function normalizeIconConfigs(
    body: Body | null,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined
): Body | null {
    if (!body?.columnConfigs) return body;

    const configs = body.columnConfigs;
    const keys = Object.keys(configs);
    let resultBody: Body | null = body;
    let modified = false;

    for (const key of keys) {
        const config = configs[key];
        if (!config || config.type !== 'icon') continue;

        const normalized = normalizeIconConfigEntry(
            config as unknown as Record<string, unknown>,
            icons,
            variants
        );
        if (!normalized) continue;

        if (!modified) {
            // Shallow clone body and columnConfigs on first modification
            resultBody = { ...body, columnConfigs: { ...body.columnConfigs } };
            modified = true;
        }

        (resultBody as Body).columnConfigs![key] = normalized as unknown as ColumnConfig;
    }

    return resultBody;
}
