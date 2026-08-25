import { type VNode } from 'vue';
import type { ReferenceConfig } from '../../../../types/api-response.types';
import { resolveValue } from '../../../../utils';
import type { SegmentFormatOptions } from './segment-renderer.types';
import { renderFormattedTextSpan } from './render-text-node.helper';

/** Default separator inserted between joined `fields` values. */
const DEFAULT_SEPARATOR = ' ';

/**
 * Resolves the raw (unformatted) text source for a reference cell.
 *
 * - `value` → fixed text takes top priority. This is the mapping `label`→`value`
 *   alias target (`resolveMappingConfig` normalizes matched entries' `label` into
 *   `value`) — without this branch, a mapping-resolved label would never render.
 * - `fields[]` → each value read from the item, empty values dropped, joined by
 *   `separator` (default " "). Takes precedence over `field`.
 * - `field` → the single value read from the item (kept as-is so number/date/
 *   currency formatting can apply downstream).
 *
 * @param config - The reference config object
 * @param item - Row data object (optional)
 * @returns The raw text source (string for multi-field, raw value for single)
 */
function resolveReferenceText(
    config: ReferenceConfig,
    item?: Record<string, unknown>
): string | number | boolean | null | undefined {
    if (config.value !== null && config.value !== undefined && config.value !== '') {
        return config.value;
    }

    if (!item) return null;

    if (Array.isArray(config.fields) && config.fields.length > 0) {
        const separator = config.separator ?? DEFAULT_SEPARATOR;
        const parts = config.fields
            .map(fieldName => resolveValue(item, fieldName))
            .filter(value => value !== null && value !== undefined && value !== '')
            .map(value => String(value));
        return parts.join(separator);
    }

    if (config.field) {
        return resolveValue(item, config.field) as string | number | boolean | null | undefined;
    }

    return null;
}

/**
 * Renders a `reference` type config segment into a `<span>` VNode.
 *
 * Reads the value(s) from the row item (`field` or joined `fields[]`) and formats
 * the result with the same formatter chain as `static` (case transforms, slice,
 * currency/date/phone/number, unit, padding), then applies content-level CSS
 * classes and inline styles from `resolveContentStyles()`.
 *
 * Conditional `if`/`else` resolution happens upstream in `buildFieldSegments`
 * (TableBodyRow), so this node only renders an already-flattened config.
 *
 * @param config - The reference column config object
 * @param options - Context including row item data, locale, dateStyle and timeZone
 * @returns A Promise resolving to a styled `<span>` VNode
 *
 * @example
 * ```ts
 * await renderReferenceNode(
 *     { type: 'reference', field: 'email', lowercase: true },
 *     { locale: 'en-US', item: { email: 'Anna@Example.com' } }
 * );
 * // → <span>anna@example.com</span>
 *
 * await renderReferenceNode(
 *     { type: 'reference', fields: ['city', 'country'], separator: ', ' },
 *     { locale: 'en-US', item: { city: 'Budapest', country: 'Hungary' } }
 * );
 * // → <span>Budapest, Hungary</span>
 *
 * await renderReferenceNode(
 *     { type: 'reference', field: 'status', value: 'Active', color: 'success' },
 *     { locale: 'en-US', item: { status: 'active' } }
 * );
 * // → <span class="text-success">Active</span> — `value` (mapping-alias target field) takes precedence over `field`
 * ```
 */
export async function renderReferenceNode(
    config: ReferenceConfig,
    options: SegmentFormatOptions
): Promise<VNode> {
    const rawText = resolveReferenceText(config, options.item);
    return renderFormattedTextSpan(rawText, config, options);
}
