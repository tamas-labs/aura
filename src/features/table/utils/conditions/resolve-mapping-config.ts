import { resolveValue, hasSafeOwnKey } from '../../../../utils';

/**
 * The types that have their own (renderer-local) mapping semantics, so the generic
 * resolver doesn't touch them — their `mapping` key remains unchanged in the returned
 * config:
 * - `badge`: value→state mapping (see `renderBadgeNode.resolveBadgeState`)
 * - `progress`: range-keyed (`"min-max"`) color/label mapping (see `renderProgressNode`)
 * - `custom`: template parameter set (exact OR range → placeholder substitution,
 *   see `renderCustomNode.resolveCustomTemplateHtml`)
 *
 * For these, the generic (exact-match, config-merge) resolver would behave INCORRECTLY:
 * range keys don't exact-match, so `mapping` would be stripped before the renderer-local
 * resolver ever sees it.
 */
const TYPES_WITH_LOCAL_MAPPING = new Set(['badge', 'progress', 'custom']);

/**
 * The types where `key` is the field key for URL generation (default `id`), NOT the
 * mapping selector. For these, mapping runs exclusively on `field` (no `key` fallback)
 * — otherwise the `field ?? key` rule would also use the URL key as the selector
 * (a conflict). Currently: `link`, `button`.
 */
const TYPES_WITH_URL_KEY = new Set(['link', 'button']);

/**
 * Computes the mapping lookup key based on the config's selector.
 *
 * The selector is generally `field ?? key`, but for URL-keyed types
 * (`TYPES_WITH_URL_KEY` — link/button) it's exclusively `field` (there, `key` is the
 * URL key, not a selector).
 *
 * Falls through to the no-match branch (returning `null`) if the selector isn't a
 * string, or the item value behind it is `null`/`undefined`. The found value is
 * converted via `String()` for the lookup (a number/boolean value can also become a
 * stringified key).
 */
function resolveSelectorValue(
    config: Record<string, unknown>,
    item: Record<string, unknown>
): string | null {
    const type = config.type;
    const fieldOnly = typeof type === 'string' && TYPES_WITH_URL_KEY.has(type);
    const selector = fieldOnly ? config.field : (config.field ?? config.key);
    if (typeof selector !== 'string') return null;

    const resolved = resolveValue(item, selector);
    if (resolved === null || resolved === undefined) return null;

    return String(resolved);
}

/**
 * Normalizes the entry's `label` key to `value` before merging (the fixed text source
 * for every type is `value` — this lets the user-friendly `label` alias work the same
 * way as with badge mapping). If the entry has both `label` and `value`, `value` wins
 * and `label` is discarded.
 */
function normalizeEntry(entry: Record<string, unknown>): Record<string, unknown> {
    if (!('label' in entry)) return entry;

    const result: Record<string, unknown> = { ...entry };
    const label = result.label;
    delete result.label;

    if ('value' in result) return result;

    result.value = label;
    return result;
}

/**
 * Removes the `mapping` key from the config — returns a new object, does not
 * mutate the input.
 */
function stripMapping(config: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = { ...config };
    delete result.mapping;
    return result;
}

/**
 * Generic, type-independent mapping resolver in the flatten layer.
 *
 * Looks up the config's `mapping` dictionary for the entry belonging to the item
 * value determined by the selector (`field ?? key`), and — if found — merges it on
 * top of the config (the entry's keys win). The `mapping` key is always removed from
 * the return value, except for types with their own (excluded) mapping semantics.
 *
 * Resolution runs AFTER conditional (`if`/`else`) flattening — that's the caller's
 * (`TableBodyRow`) responsibility; this function only works on an already-flat config.
 *
 * @param config - A (presumably already if/else-flattened) columnConfig
 * @param item - The row's data object
 * @returns A new config object — never `null`, never mutates the input `config`/`item` objects
 *
 * @example
 * ```ts
 * // Match: the entry wins, the mapping key is removed, label → value
 * resolveMappingConfig(
 *     { type: 'icon', key: 'status', mapping: { active: { icon: 'check', variant: 'success' } } },
 *     { status: 'active' }
 * );
 * // → { type: 'icon', key: 'status', icon: 'check', variant: 'success' }
 *
 * // No-match: the mapping key is removed, everything else unchanged
 * resolveMappingConfig(
 *     { type: 'icon', key: 'status', mapping: { active: { icon: 'check' } } },
 *     { status: 'unknown' }
 * );
 * // → { type: 'icon', key: 'status' }
 *
 * // Excluded type (badge): the config is unchanged, the mapping key is also kept
 * resolveMappingConfig(
 *     { type: 'badge', field: 'priority', mapping: { high: { variant: 'danger' } } },
 *     { priority: 'high' }
 * );
 * // → { type: 'badge', field: 'priority', mapping: { high: { variant: 'danger' } } }
 * ```
 */
export function resolveMappingConfig(
    config: Record<string, unknown>,
    item: Record<string, unknown>
): Record<string, unknown> {
    const mapping = config.mapping;
    const hasValidMapping =
        mapping !== null &&
        mapping !== undefined &&
        typeof mapping === 'object' &&
        !Array.isArray(mapping);

    if (!hasValidMapping) {
        return { ...config };
    }

    const type = config.type;
    if (typeof type === 'string' && TYPES_WITH_LOCAL_MAPPING.has(type)) {
        return { ...config };
    }

    const configWithoutMapping = stripMapping(config);
    const selectorValue = resolveSelectorValue(config, item);
    if (selectorValue === null) {
        return configWithoutMapping;
    }

    // Own-key lookup only: the selector value comes from the row, so a plain bracket read
    // would let a cell containing `__proto__` match `Object.prototype` — an object, not an
    // array, not null, i.e. a "valid entry" as far as the check below is concerned.
    const mappingRecord = mapping as Record<string, unknown>;
    const entry = hasSafeOwnKey(mappingRecord, selectorValue)
        ? mappingRecord[selectorValue]
        : undefined;
    const isValidEntry = entry !== null && typeof entry === 'object' && !Array.isArray(entry);
    if (!isValidEntry) {
        return configWithoutMapping;
    }

    return {
        ...configWithoutMapping,
        ...normalizeEntry(entry as Record<string, unknown>),
    };
}
