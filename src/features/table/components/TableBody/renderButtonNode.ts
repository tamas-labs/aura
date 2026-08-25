import { h, type VNode } from 'vue';
import type { ButtonConfig } from '../../../../types/api-response.types';
import type { SegmentFormatOptions } from './segment-renderer.types';
import { resolveIconClassesFromRegistry } from '../../../../utils/preprocessors/preprocessor-utils';
import {
    resolveGlobalClassArray,
    forwardDataAttributes,
    substituteItemPlaceholders,
} from './render-class-helpers';
import { prepareActionRender, initContentAttrs } from './action-node-helpers';

/** Default HTML button type when `route` is absent. */
const DEFAULT_HTML_TYPE = 'button';

/**
 * Builds the CSS class list for the button element: the base `btn` class,
 * `btn-{variant}` / `btn-{size}` modifiers, rounded/pill utilities, content
 * styles and global button classes from config.
 *
 * @param config - The button config object
 * @param contentClasses - Classes resolved from resolveContentStyles
 * @param options - Context options (for globalClasses)
 * @returns Array of CSS class strings
 */
function buildButtonClasses(
    config: ButtonConfig,
    contentClasses: string[],
    options: SegmentFormatOptions
): string[] {
    const classes = ['btn'];
    if (config.variant) classes.push(`btn-${config.variant}`);
    if (config.size) classes.push(`btn-${config.size}`);
    if (config.rounded) classes.push('rounded-circle');
    if (config.pill) classes.push('rounded-pill');
    classes.push(...contentClasses);
    classes.push(...resolveGlobalClassArray(options.globalClasses?.button));
    return classes;
}

/**
 * Builds the `<i>` icon VNode for the button from the `icon` registry key,
 * or `null` when no icon is configured. The icon classes are resolved from
 * the `config.icons` registry (falling back to `icons.primary`).
 *
 * @param config - The button config object
 * @param options - Context options carrying the icon registry
 * @returns An `<i>` VNode or null
 */
function buildButtonIcon(config: ButtonConfig, options: SegmentFormatOptions): VNode | null {
    if (!config.icon) return null;
    const iconClasses = resolveIconClassesFromRegistry(
        config.icon,
        options.icons,
        undefined,
        undefined
    );
    if (iconClasses.length === 0) return null;
    return h('i', { class: iconClasses });
}

/**
 * Assembles the button children from the optional icon and the formatted text,
 * ordering them per `iconPosition` ('start' default | 'end') and inserting a
 * single space between icon and text when both are present.
 *
 * @param icon - The icon VNode (or null)
 * @param text - The formatted label text (may be empty)
 * @param iconPosition - Icon placement relative to the text
 * @returns Array of child VNodes / strings
 */
function buildButtonChildren(
    icon: VNode | null,
    text: string,
    iconPosition: ButtonConfig['iconPosition']
): (VNode | string)[] {
    if (!icon) return text ? [text] : [];
    if (!text) return [icon];
    return iconPosition === 'end' ? [text, ' ', icon] : [icon, ' ', text];
}

/**
 * Builds the HTML attribute map for the button/anchor element.
 *
 * For `<a>` (href present): sets `href`; when `disabled`, adds `aria-disabled`
 * (the `disabled` class is applied via the class list). For `<button>`: sets
 * `type` (htmlType, default 'button') and the native `disabled` attribute.
 * Forwards `data-*` attributes with `{field}` placeholder substitution.
 *
 * @param config - The button config object
 * @param href - Resolved href URL (undefined → render as `<button>`)
 * @param classes - Resolved CSS class list
 * @param styles - Resolved inline styles
 * @param item - Row data object (for data-* substitution)
 * @returns Record of HTML attributes
 */
function buildButtonAttrs(
    config: ButtonConfig,
    href: string | undefined,
    classes: string[],
    styles: Record<string, string>,
    item?: Record<string, unknown>
): Record<string, unknown> {
    const attrs = initContentAttrs(config, classes, styles);

    if (href) {
        attrs.href = href;
        if (config.disabled) attrs['aria-disabled'] = 'true';
    } else {
        attrs.type = config.htmlType ?? DEFAULT_HTML_TYPE;
        if (config.disabled) attrs.disabled = true;
    }

    forwardDataAttributes(config as unknown as Record<string, unknown>, attrs, value =>
        substituteItemPlaceholders(value, item)
    );

    return attrs;
}

/**
 * Renders a `button` type config segment into a VNode.
 *
 * Produces a Bootstrap 5 button. With `route` → an `<a class="btn" href>`
 * (navigation button); without `route` → a `<button type="{htmlType}">`
 * (real button, disabled/submit/reset capable). The label comes from the
 * `field` item value or the static `value`, formatted via `formatValue()`.
 * An optional `icon` (config.icons registry key) is rendered as an `<i>`
 * glyph before/after the text per `iconPosition`.
 *
 * Conditional `if`/`else` resolution happens upstream in `buildFieldSegments`
 * (TableBodyRow), so this node only renders an already-flattened config.
 *
 * @param config - The button column config object
 * @param options - Context including row item data, locale, siteName, globalClasses and icon registry
 * @returns A Promise resolving to a VNode — `<a class="btn">` (route) or `<button>` (no route)
 *
 * @example
 * ```ts
 * await renderButtonNode(
 *     { type: 'button', field: 'name', key: 'id', route: '/users/{id}/edit', variant: 'primary', size: 'sm' },
 *     { locale: 'en-US', item: { id: 5, name: 'Edit' } }
 * );
 * // → <a href="/users/5/edit" class="btn btn-primary btn-sm">Edit</a>
 *
 * await renderButtonNode(
 *     { type: 'button', icon: 'cog', variant: 'outline-secondary', title: 'Settings' },
 *     { locale: 'en-US', item: {}, icons: { cog: ['fas', 'fa-cog'], primary: ['fas', 'fa-file'] } }
 * );
 * // → <button type="button" class="btn btn-outline-secondary" title="Settings"><i class="fas fa-cog" /></button>
 * ```
 */
export async function renderButtonNode(
    config: ButtonConfig,
    options: SegmentFormatOptions
): Promise<VNode> {
    const { text, contentClasses, styles, href, item } = await prepareActionRender(config, options);
    const classes = buildButtonClasses(config, contentClasses, options);

    if (href && config.disabled) classes.push('disabled');

    const attrs = buildButtonAttrs(config, href, classes, styles, item);
    const icon = buildButtonIcon(config, options);
    const children = buildButtonChildren(icon, text, config.iconPosition);

    return h(href ? 'a' : 'button', attrs, children);
}
