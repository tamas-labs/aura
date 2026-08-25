import { h, type VNode } from 'vue';
import type { LinkConfig } from '../../../../types/api-response.types';
import type { SegmentFormatOptions } from './segment-renderer.types';
import {
    resolveGlobalClassArray,
    forwardDataAttributes,
    substituteItemPlaceholders,
} from './render-class-helpers';
import { prepareActionRender, initContentAttrs } from './action-node-helpers';

/**
 * Builds the CSS class list for the link element: content styles + the
 * `link-{variant}` Bootstrap class + global link classes from config.
 *
 * @param config - The link config object
 * @param contentClasses - Classes resolved from resolveContentStyles
 * @param options - Context options (for globalClasses)
 * @returns Array of CSS class strings
 */
function buildLinkClasses(
    config: LinkConfig,
    contentClasses: string[],
    options: SegmentFormatOptions
): string[] {
    const classes = [...contentClasses];
    if (config.variant) classes.push(`link-${config.variant}`);
    classes.push(...resolveGlobalClassArray(options.globalClasses?.link));
    return classes;
}

/**
 * Builds the HTML attribute map for the link/span element.
 *
 * For `<a>` elements (href present) adds target/rel/title; `rel` defaults to
 * "noopener noreferrer" for `target="_blank"` when not explicitly provided.
 * Forwards data-* attributes with `{field}` placeholder substitution.
 *
 * @param config - The link config object
 * @param href - Resolved href URL (undefined → render as span without link attrs)
 * @param classes - Resolved CSS class list
 * @param styles - Resolved inline styles
 * @param item - Row data object (for data-* substitution)
 * @returns Record of HTML attributes
 */
function buildLinkAttrs(
    config: LinkConfig,
    href: string | undefined,
    classes: string[],
    styles: Record<string, string>,
    item?: Record<string, unknown>
): Record<string, unknown> {
    const attrs = initContentAttrs(config, classes, styles);

    if (href) {
        attrs.href = href;
        if (config.target) attrs.target = config.target;
        const rel = config.rel ?? (config.target === '_blank' ? 'noopener noreferrer' : undefined);
        if (rel) attrs.rel = rel;
    }

    forwardDataAttributes(config as unknown as Record<string, unknown>, attrs, value =>
        substituteItemPlaceholders(value, item)
    );

    return attrs;
}

/**
 * Renders a `link` type config segment into a VNode.
 *
 * Produces an `<a href="...">text</a>` element. The text comes from the
 * `field` item value or the static `value`, formatted via `formatValue()`.
 * The href is built from `route` (with `{key}` placeholders resolved against
 * the row item). When no `route` is provided, renders a plain `<span>` instead
 * of an empty anchor.
 *
 * @param config - The link column config object
 * @param options - Context options including row item data, siteName, locale and globalClasses
 * @returns A Promise resolving to a VNode — `<a>` (with route) or `<span>` (without)
 *
 * @example
 * ```ts
 * await renderLinkNode(
 *     { type: 'link', field: 'name', key: 'id', route: '/users/{id}' },
 *     { locale: 'en-US', item: { id: 5, name: 'Anna' } }
 * );
 * // → <a href="/users/5">Anna</a>
 *
 * await renderLinkNode(
 *     { type: 'link', field: 'website', target: '_blank' },
 *     { locale: 'en-US', item: { website: 'example.com' } }
 * );
 * // → <span>example.com</span>  (no route → no anchor)
 * ```
 */
export async function renderLinkNode(
    config: LinkConfig,
    options: SegmentFormatOptions
): Promise<VNode> {
    const { text, contentClasses, styles, href, item } = await prepareActionRender(config, options);
    const classes = buildLinkClasses(config, contentClasses, options);

    const attrs = buildLinkAttrs(config, href, classes, styles, item);

    return h(href ? 'a' : 'span', attrs, text);
}
