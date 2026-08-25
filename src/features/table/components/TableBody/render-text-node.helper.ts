import { h, type VNode } from 'vue';
import { formatValue, buildFormatConfig, resolveContentStyles } from '../../utils';
import type { ContentFormattingOptions } from '../../../../types/api-response.types';
import type { SegmentFormatOptions } from './segment-renderer.types';
import { applyBaseContentAttrs } from './render-class-helpers';

/** The formatting source accepted by `buildFormatConfig` (the non-exported internal type inferred). */
type FormatConfigSource = Parameters<typeof buildFormatConfig>[0];

/**
 * Renders an already-resolved raw value into a formatted `<span>`.
 *
 * The same formatting chain as `static` (case transforms, slice, currency/date/phone/number,
 * unit, padding) runs on `rawText`, after which the content-level CSS classes/inline styles
 * (`resolveContentStyles`) are applied to the `<span>`. Shared between the `reference` and
 * `custom` (callback/default mode) renderers — resolving the raw value differs per type, but
 * this formatting tail is identical (jscpd-free).
 *
 * @param rawText - The already-resolved raw value (an item field or fixed text)
 * @param config - The config carrying the formatting fields (BuildFormatConfig + ContentFormatting)
 * @param options - Locale/dateStyle/timeZone/rawHtml context
 * @returns Formatted, styled `<span>` VNode
 */
export async function renderFormattedTextSpan(
    rawText: string | number | boolean | null | undefined,
    config: FormatConfigSource & ContentFormattingOptions,
    options: SegmentFormatOptions
): Promise<VNode> {
    const { locale, dateStyle, timeZone, rawHtml } = options;

    const formatted = await formatValue(rawText, buildFormatConfig(config), locale, undefined, {
        dateStyle,
        timeZone,
        rawHtml,
    });

    const { classes, styles } = resolveContentStyles(config);
    const attrs: Record<string, unknown> = {};
    applyBaseContentAttrs(attrs, classes, styles);

    return h('span', attrs, formatted);
}
