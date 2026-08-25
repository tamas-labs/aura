import { h, type VNode } from 'vue';
import type { IconConfig } from '../../../../types/api-response.types';
import { resolveContentStyles } from '../../utils';
import type { SegmentFormatOptions } from './segment-renderer.types';
import { resolveRoute } from './resolve-route';
import {
    resolveGlobalClassArray,
    resolveIconClasses,
    forwardDataAttributes,
    applyBaseContentAttrs,
} from './render-class-helpers';

/**
 * Builds the HTML attribute map for the `<i>` element.
 *
 * Includes class, inline styles, title, aria-label and any data-* attributes.
 *
 * @param config - The icon config object
 * @param classes - Resolved CSS class list
 * @param styles - Resolved inline styles from resolveContentStyles
 * @returns Record of HTML attributes
 */
function buildIconAttrs(
    config: IconConfig,
    classes: string[],
    styles: Record<string, string>
): Record<string, unknown> {
    const attrs: Record<string, unknown> = {};

    applyBaseContentAttrs(attrs, classes, styles);
    if (config.title) attrs.title = config.title;
    if (config.alt) attrs['aria-label'] = config.alt;

    forwardDataAttributes(config as unknown as Record<string, unknown>, attrs);

    return attrs;
}

/**
 * Renders an `icon` type config segment into a VNode.
 *
 * Produces an `<i>` element with resolved CSS classes and attributes.
 * When `route`, `key` and row `item` data are all available,
 * wraps the `<i>` in an `<a>` element with the fully resolved URL.
 *
 * The icon/variant/color fields are resolved into `class` by the
 * preprocessor layer (⑦.5) before this function is called.
 *
 * @param config - The icon column config object (preprocessed — class already resolved)
 * @param options - Context options including row item data, siteName and globalClasses
 * @returns A VNode — either `<i>` or `<a><i></a>`
 *
 * @example
 * ```ts
 * renderIconNode(
 *     { type: 'icon', class: ['fa-regular', 'fa-trash-can'], alt: 'Delete', title: 'Delete' },
 *     {}
 * );
 * // → <i class="fa-regular fa-trash-can" title="Delete" aria-label="Delete" />
 *
 * renderIconNode(
 *     { type: 'icon', class: ['fas', 'fa-edit'], route: 'items.{id}.edit', key: 'id' },
 *     { siteName: 'https://myapp.com', item: { id: 5 } }
 * );
 * // → <a href="https://myapp.com/items/5/edit"><i class="fas fa-edit" /></a>
 * ```
 */
export function renderIconNode(config: IconConfig, options: SegmentFormatOptions): VNode {
    const classes = [
        ...resolveIconClasses(config),
        ...resolveGlobalClassArray(options.globalClasses?.icon),
    ];
    const { styles } = resolveContentStyles(config);
    const attrs = buildIconAttrs(config, classes, styles);
    const iconEl = h('i', attrs);

    if (config.route && config.key && options.item) {
        return h('a', { href: resolveRoute(config.route, options.item, options.siteName) }, iconEl);
    }

    return iconEl;
}
