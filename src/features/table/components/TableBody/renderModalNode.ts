import { h, type VNode } from 'vue';
import type { ModalConfig, IconConfig } from '../../../../types/api-response.types';
import type { SegmentFormatOptions } from './segment-renderer.types';
import { resolveRoute } from './resolve-route';
import { resolveGlobalClassArray, resolveIconClasses } from './render-class-helpers';

/**
 * Builds the common Bootstrap 5 modal trigger attributes.
 *
 * @param id - Modal identifier (used in data-bs-target)
 * @param resolvedRoute - Optional resolved route URL for AJAX-loaded modal content
 * @returns Partial attribute map for the trigger element
 */
function buildModalTriggerAttrs(id: string, resolvedRoute?: string): Record<string, unknown> {
    const attrs: Record<string, unknown> = {
        'data-bs-toggle': 'modal',
        'data-bs-target': `#${id}`,
    };

    if (resolvedRoute) {
        attrs['data-route'] = resolvedRoute;
    }

    return attrs;
}

/**
 * The Enter key's `KeyboardEvent.key` value.
 *
 * WAI-ARIA requires an element carrying `role="button"` to respond to both Enter and
 * Space; a native `<a href>` covers only Enter, and an anchor without `href` covers
 * neither.
 */
const ENTER_KEY = 'Enter';

/** The Space key's `KeyboardEvent.key` value. */
const SPACE_KEY = ' ';

/**
 * Builds a keydown handler that activates a `role="button"` trigger.
 *
 * The trigger is opened by Bootstrap's own delegated **click** listener
 * (`[data-bs-toggle="modal"]`), so the handler forwards the keypress as a synthetic click
 * rather than reimplementing the modal logic. `preventDefault` stops Space from scrolling
 * the page and stops Enter from following an `href="#"`.
 *
 * @param keys - The key values that activate this trigger
 * @returns A keydown listener for the trigger element
 */
function createActivationHandler(keys: readonly string[]): (event: KeyboardEvent) => void {
    return (event: KeyboardEvent): void => {
        if (!keys.includes(event.key)) return;
        event.preventDefault();
        (event.currentTarget as HTMLElement | null)?.click();
    };
}

/**
 * Renders a modal icon trigger: `<a data-bs-* ><i .../></a>`.
 */
function renderIconTrigger(
    config: ModalConfig,
    content: IconConfig,
    modalAttrs: Record<string, unknown>,
    options: SegmentFormatOptions
): VNode {
    const classes = [
        ...resolveIconClasses(content),
        ...resolveGlobalClassArray(options.globalClasses?.icon),
    ];
    const iconAttrs: Record<string, unknown> = {};

    if (classes.length > 0) iconAttrs.class = classes;
    if (content.title) iconAttrs.title = content.title;
    if (content.alt) iconAttrs['aria-label'] = content.alt;

    // Forward data-* attributes from content
    for (const k of Object.keys(content as unknown as Record<string, unknown>)) {
        if (k.startsWith('data-')) {
            iconAttrs[k] = (content as unknown as Record<string, unknown>)[k];
        }
    }

    const iconEl = h('i', iconAttrs);

    // An anchor without `href` is not focusable, so the role alone would leave this
    // trigger unreachable from the keyboard: it needs both the tab stop and the
    // Enter/Space handler a native button would provide.
    const triggerAttrs: Record<string, unknown> = {
        ...modalAttrs,
        role: 'button',
        tabindex: '0',
        onKeydown: createActivationHandler([ENTER_KEY, SPACE_KEY]),
        style: { cursor: 'pointer' },
    };

    if (config.alt ?? content.alt) triggerAttrs['aria-label'] = config.alt ?? content.alt;

    return h('a', triggerAttrs, iconEl);
}

/**
 * Renders a modal button trigger: `<button data-bs-* >...</button>`.
 */
function renderButtonTrigger(
    config: ModalConfig,
    content: Record<string, unknown>,
    modalAttrs: Record<string, unknown>,
    options: SegmentFormatOptions
): VNode {
    const variant = content.variant as string | null | undefined;
    const value = content.value as string | null | undefined;
    const size = content.size as string | null | undefined;

    const classes: string[] = ['btn'];
    if (variant) classes.push(`btn-${variant}`);
    if (size) classes.push(`btn-${size}`);
    classes.push(...resolveGlobalClassArray(options.globalClasses?.button));

    const buttonAttrs: Record<string, unknown> = {
        ...modalAttrs,
        type: 'button',
        class: classes,
    };

    if (config.alt) buttonAttrs['aria-label'] = config.alt;
    if (config.title) buttonAttrs.title = config.title;

    return h('button', buttonAttrs, value ?? '');
}

/**
 * Renders a modal link trigger: `<a data-bs-* >...</a>`.
 */
function renderLinkTrigger(
    config: ModalConfig,
    content: Record<string, unknown>,
    modalAttrs: Record<string, unknown>,
    options: SegmentFormatOptions
): VNode {
    const value = content.value as string | null | undefined;

    // `href="#"` makes the anchor focusable and Enter already produces a click, so only
    // Space — which `role="button"` implies but an anchor never handles — is missing.
    const linkAttrs: Record<string, unknown> = {
        ...modalAttrs,
        href: '#',
        role: 'button',
        onKeydown: createActivationHandler([SPACE_KEY]),
    };

    if (config.alt) linkAttrs['aria-label'] = config.alt;
    if (config.title) linkAttrs.title = config.title;

    const globalLinkClasses = resolveGlobalClassArray(options.globalClasses?.link);
    if (globalLinkClasses.length > 0) linkAttrs.class = globalLinkClasses;

    return h('a', linkAttrs, value ?? '');
}

/**
 * Renders a `modal` type config segment into a VNode.
 *
 * Produces a Bootstrap 5 modal trigger element with `data-bs-toggle="modal"`
 * and `data-bs-target="#{id}"` attributes. The trigger type is determined
 * by `config.content.type` (icon | button | link).
 *
 * If `config.route` is provided and row `item` data is available, the resolved
 * route is attached as `data-route` for AJAX-loaded modal content.
 *
 * The preprocessor layer (⑦.5) has already resolved shorthand fields
 * (icon/variant/button) into a normalized `content` object before this
 * function is called.
 *
 * @param config - The modal column config object (preprocessed — content already normalized)
 * @param options - Context options including row item data and siteName
 * @returns A VNode — trigger element with Bootstrap 5 modal attributes, or empty span if no content
 *
 * @example
 * ```ts
 * renderModalNode(
 *     { type: 'modal', id: 'edit-modal', content: { type: 'icon', class: ['fas', 'fa-edit'] } },
 *     { item: { id: 5 } }
 * );
 * // → <a data-bs-toggle="modal" data-bs-target="#edit-modal" role="button" tabindex="0">
 * //     <i class="fas fa-edit" />
 * //   </a>
 *
 * renderModalNode(
 *     { type: 'modal', id: 'view-modal', content: { type: 'button', variant: 'primary' }, route: 'items.{id}' },
 *     { item: { id: 3 }, siteName: 'https://app.com' }
 * );
 * // → <button type="button" class="btn btn-primary" data-bs-toggle="modal"
 * //           data-bs-target="#view-modal" data-route="https://app.com/items/3" />
 * ```
 */
export function renderModalNode(config: ModalConfig, options: SegmentFormatOptions): VNode {
    const content = config.content as Record<string, unknown> | null | undefined;

    if (!content || !config.id) {
        return h('span');
    }

    const resolvedRoute =
        config.route && options.item
            ? resolveRoute(config.route, options.item, options.siteName)
            : undefined;

    const modalAttrs = buildModalTriggerAttrs(config.id, resolvedRoute);

    const contentType = content.type as string | undefined;

    if (contentType === 'icon') {
        return renderIconTrigger(config, content as unknown as IconConfig, modalAttrs, options);
    }

    if (contentType === 'button') {
        return renderButtonTrigger(config, content, modalAttrs, options);
    }

    if (contentType === 'link') {
        return renderLinkTrigger(config, content, modalAttrs, options);
    }

    return h('span');
}
