import type { ButtonConfig, LinkConfig } from '../../../../types/api-response.types';
import { formatValue, resolveContentStyles, buildFormatConfig } from '../../utils';
import type { SegmentFormatOptions } from './segment-renderer.types';
import { resolveRoute } from './resolve-route';
import { applyBaseContentAttrs, resolveFieldOrValueText } from './render-class-helpers';

/**
 * Shared preamble for the `link` and `button` renderers: resolves the displayed text
 * (`field`/`value` → `formatValue`), the content-level styles (`resolveContentStyles`)
 * and the `href` generated from `route`. The two renderers branch off from here (class
 * building, attributes, element type), so the shared part lives in one place (removes jscpd duplication).
 *
 * @param config - The `link` or `button` config (both carry `field`/`value`/`route`)
 * @param options - Render context (locale, dateStyle, timeZone, rawHtml, item, siteName)
 * @returns The formatted text, the content classes/styles, the resolved `href`, and the row's `item`
 */
export async function prepareActionRender(
    config: ButtonConfig | LinkConfig,
    options: SegmentFormatOptions
): Promise<{
    text: string;
    contentClasses: string[];
    styles: Record<string, string>;
    href: string | undefined;
    item: Record<string, unknown> | undefined;
}> {
    const { locale, dateStyle, timeZone, rawHtml, item, siteName } = options;

    const rawText = resolveFieldOrValueText(config, item);
    const text = await formatValue(rawText, buildFormatConfig(config), locale, undefined, {
        dateStyle,
        timeZone,
        rawHtml,
    });

    const { classes: contentClasses, styles } = resolveContentStyles(config);
    const href = config.route ? resolveRoute(config.route, item ?? {}, siteName) : undefined;

    return { text, contentClasses, styles, href, item };
}

/**
 * Initializes a content element's (`<a>`/`<button>`/`<span>`) attribute map with the shared
 * fields: `class`/`style` (empty values omitted) + optional `title`. The caller then appends
 * the type-specific attributes (`href`/`target`/`rel`/`type`/`disabled`/…).
 *
 * @param config - The config object (with an optional `title` field)
 * @param classes - The resolved CSS class list
 * @param styles - The resolved inline styles
 * @returns The mutable attribute map populated with the base attributes
 */
export function initContentAttrs(
    config: { title?: string | null },
    classes: string[],
    styles: Record<string, string>
): Record<string, unknown> {
    const attrs: Record<string, unknown> = {};
    applyBaseContentAttrs(attrs, classes, styles);
    if (config.title) attrs.title = config.title;
    return attrs;
}
