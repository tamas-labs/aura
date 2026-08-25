import type { ZodType } from 'zod';
import { getErrorSink } from '../../../utils/error-sink';
import {
    DataAttributeValueZod,
    isDataAttribute,
} from '../../../zod/response/header/data-attribute.zod';
import {
    createNullObject,
    isForbiddenProtoKey,
    readOwnEntry,
} from '../../../../utils/safe-object.util';

/**
 * Removes unknown non-data-attribute keys from the config object.
 * Keeps all keys in allowedKeys and (by default) all data-* attributes.
 *
 * @param config - The raw config object to strip
 * @param allowedKeys - Set of allowed key names for this column type
 * @param preserveDataAttributes - Whether data-* attributes are allowed through (default true).
 *   Mapping-entry stripping calls this with `false` — data-* attributes are NOT supported
 *   inside `mapping` entries in the first iteration of the generic mapping feature.
 * @returns A new, null-prototype object containing only allowed keys (and, if enabled,
 *   data-* attributes)
 */
const stripUnknownNonDataKeys = (
    config: Record<string, unknown>,
    allowedKeys: Set<string>,
    preserveDataAttributes = true
): Record<string, unknown> => {
    const result = createNullObject();

    Object.keys(config).forEach(key => {
        // Refused ahead of `allowedKeys`, so the helper stays safe for any key set a
        // caller passes in — no column type has a prototype key among its allowed keys.
        if (isForbiddenProtoKey(key)) return;

        if (allowedKeys.has(key) || (preserveDataAttributes && isDataAttribute(key))) {
            result[key] = config[key];
        }
    });

    return result;
};

/**
 * Strips every entry of a `mapping` dictionary down to the type's own mapping-entry
 * key set (`entryAllowedKeys`) — the same key-stripping logic as the config's top-level
 * keys (`stripUnknownNonDataKeys`), but without data-* attributes (see the
 * `createConfigValidator` JSDoc: this is the security boundary).
 *
 * Non-object entries (e.g. `null`, an array) are passed through unchanged — reporting
 * those as errors is the entry zod schema's job; this layer only enforces the key
 * boundary.
 *
 * Unlike the config's own keys, the *entry keys* here are arbitrary response-supplied
 * strings (they are data values to match against), so they are the one place in the
 * factory where a `__proto__` key can actually arrive. Such entries are dropped, the same
 * way an unknown key inside an entry is dropped: silently, because this layer strips
 * rather than reports, and because no real data value is named `__proto__`.
 *
 * @param mapping - The raw, unvalidated `mapping` value extracted from the config (response-sourced)
 * @param entryAllowedKeys - The type's own mapping-entry key set
 * @returns A new, null-prototype mapping object with per-entry key stripping applied
 */
function stripMappingEntries(
    mapping: Record<string, unknown>,
    entryAllowedKeys: Set<string>
): Record<string, unknown> {
    const result = createNullObject();

    Object.keys(mapping).forEach(entryKey => {
        if (isForbiddenProtoKey(entryKey)) return;

        const entry = mapping[entryKey];
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
            result[entryKey] = entry;
            return;
        }
        result[entryKey] = stripUnknownNonDataKeys(
            entry as Record<string, unknown>,
            entryAllowedKeys,
            false
        );
    });

    return result;
}

/**
 * Generic factory for creating schema validator functions for body.columnConfigs entry types.
 *
 * Centralizes the common validation logic shared across all custom column types:
 * - Zod schema validation with centralized error reporting
 * - data-* attribute explicit validation via DataAttributeValueZod
 * - Unknown key stripping (only ALLOWED_KEYS and data-* attributes pass through)
 * - Prototype-key refusal (`__proto__`/`constructor`/`prototype` never survive the strip,
 *   and the returned object has a `null` prototype — see `utils/safe-object.util`)
 *
 * Use this factory when creating a new column type schema validator
 * (link, badge, button, progress, etc.) instead of duplicating the validation pattern.
 *
 * Generic `mapping` support (nested key-stripping): the zod `parse()` call above validates
 * the `mapping` entries (value validation + error reporting), but its result is discarded —
 * this factory strips the *original* config, and `stripUnknownNonDataKeys` only strips
 * top-level keys. Without an extra step, unknown keys inside `mapping` entries would leak
 * into the store (they get merged into the flattened config by `resolveMappingConfig` and
 * reach the renderer). The optional `mappingEntryAllowedKeys` parameter closes this gap:
 * when provided, every entry of a (top-level-stripped) `mapping` object is additionally
 * stripped to that type's own entry-key set — `data-*` attributes are NOT carried through
 * inside mapping entries. Both the zod entry schema AND this nested strip are required:
 * one validates values, the other enforces the key boundary.
 *
 * @param zodSchema - The Zod schema to validate the config against
 * @param allowedKeys - Set of allowed top-level key names (type-specific)
 * @param validatorName - The name used in error reports (e.g. 'StaticConfigValidator')
 * @param errorMessage - The human-readable error message for Zod validation failures
 * @param mappingEntryAllowedKeys - Optional: when the type supports `mapping`, the allowed
 *   key set for each mapping entry. Omit for types without `mapping` (backward compatible —
 *   existing callers are unaffected).
 * @param singleEntryKeys - Optional: top-level config keys whose value is itself a single
 *   entry object (not a `mapping` dictionary) sharing the same entry-key boundary — e.g. the
 *   badge `trueValue`/`falseValue`. Each named key is nested-stripped with
 *   `mappingEntryAllowedKeys` (same rules as a `mapping` entry: no `data-*`). Requires
 *   `mappingEntryAllowedKeys` to be set; omit for types without such keys.
 * @returns A validator function with signature (config, errorStoreId, configKey) => T
 *
 * @example
 * ```typescript
 * // Static column type
 * const STATIC_ALLOWED_KEYS = new Set(['type', 'value', 'color', 'class', 'if', 'else', 'cellRules']);
 * export const validateStaticConfig = createConfigValidator<StaticConfig>(
 *     StaticConfigZod,
 *     STATIC_ALLOWED_KEYS,
 *     'StaticConfigValidator',
 *     'Invalid static column config'
 * );
 *
 * // Icon column type
 * const ICON_ALLOWED_KEYS = new Set(['type', 'icon', 'class', 'variant', 'color', 'if', 'else', 'cellRules']);
 * export const validateIconConfig = createConfigValidator<IconConfig>(
 *     IconConfigZod,
 *     ICON_ALLOWED_KEYS,
 *     'IconConfigValidator',
 *     'Invalid icon column config'
 * );
 * ```
 */
export function createConfigValidator<T>(
    zodSchema: ZodType,
    allowedKeys: Set<string>,
    validatorName: string,
    errorMessage: string,
    mappingEntryAllowedKeys?: Set<string>,
    singleEntryKeys?: Set<string>
): (config: Record<string, unknown>, errorStoreId: string, configKey: string) => T {
    return (config: Record<string, unknown>, errorStoreId: string, configKey: string): T => {
        const errorStore = getErrorSink(errorStoreId);

        try {
            zodSchema.parse(config);
        } catch (error) {
            errorStore.addSchemaValidationError(
                validatorName,
                errorMessage,
                configKey,
                config,
                error instanceof Error ? error.message : 'Unknown validation error'
            );

            throw new Error(
                `${validatorName} validation failed at '${configKey}': ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }

        Object.keys(config).forEach(key => {
            if (!isDataAttribute(key)) return;

            const value = config[key];
            if (value === undefined || value === null) return;

            try {
                DataAttributeValueZod.parse(value);
            } catch (error) {
                errorStore.addSchemaValidationError(
                    validatorName,
                    `Invalid data attribute '${key}'`,
                    `${configKey}.${key}`,
                    value,
                    error instanceof Error ? error.message : 'Invalid data attribute value'
                );

                throw new Error(
                    `${validatorName} validation failed at '${configKey}.${key}': invalid data attribute`
                );
            }
        });

        const stripped = stripUnknownNonDataKeys(config, allowedKeys);

        const mapping = stripped.mapping;
        const hasMappingToStrip =
            mappingEntryAllowedKeys !== undefined &&
            mapping !== null &&
            mapping !== undefined &&
            typeof mapping === 'object' &&
            !Array.isArray(mapping);

        if (hasMappingToStrip) {
            stripped.mapping = stripMappingEntries(
                mapping as Record<string, unknown>,
                mappingEntryAllowedKeys as Set<string>
            );
        }

        if (mappingEntryAllowedKeys !== undefined && singleEntryKeys !== undefined) {
            singleEntryKeys.forEach(entryKey => {
                const entry = readOwnEntry(stripped, entryKey);
                if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return;
                stripped[entryKey] = stripUnknownNonDataKeys(
                    entry as Record<string, unknown>,
                    mappingEntryAllowedKeys,
                    false
                );
            });
        }

        return stripped as unknown as T;
    };
}
