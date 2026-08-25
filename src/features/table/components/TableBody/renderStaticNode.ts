import { h, type VNode } from 'vue';
import type { StaticConfig } from '../../../../types/api-response.types';
import { formatValue, resolveContentStyles, buildFormatConfig } from '../../utils';
import type { SegmentFormatOptions } from './segment-renderer.types';

/**
 * Renders a `static` type config segment into a `<span>` VNode.
 *
 * Formats the static value using `formatValue()` with locale/date options,
 * then applies CSS classes and inline styles from `resolveContentStyles()`.
 *
 * @param config - The static column config object
 * @param options - Locale, dateStyle and timeZone from the parent cell context
 * @returns A Promise resolving to a styled `<span>` VNode
 *
 * @example
 * ```ts
 * const node = await renderStaticNode(
 *     { type: 'static', value: 'ID:', class: 'fw-bold' },
 *     { locale: 'en-US' }
 * );
 * // → <span class="fw-bold">ID:</span>
 * ```
 */
export async function renderStaticNode(
    config: StaticConfig,
    options: SegmentFormatOptions
): Promise<VNode> {
    const { locale, dateStyle, timeZone, rawHtml } = options;

    const formatted = await formatValue(
        config.value,
        buildFormatConfig(config),
        locale,
        undefined,
        { dateStyle, timeZone, rawHtml }
    );

    const { classes, styles } = resolveContentStyles(config);
    const attrs: Record<string, unknown> = {};
    if (classes.length > 0) attrs.class = classes;
    if (Object.keys(styles).length > 0) attrs.style = styles;

    return h('span', attrs, formatted);
}
