import { h, type VNode } from 'vue';
import type { CustomConfig, CustomTemplateParams } from '../../../../types/api-response.types';
import { formatRaw, resolveContentStyles } from '../../utils';
import {
    resolveValue,
    createNullObject,
    hasSafeOwnKey,
    isForbiddenProtoKey,
    readOwnEntry,
} from '../../../../utils';
import type { SegmentFormatOptions } from './segment-renderer.types';
import {
    resolveFieldOrValueText,
    applyBaseContentAttrs,
    forwardDataAttributes,
    substituteItemPlaceholders,
} from './render-class-helpers';
import { renderFormattedTextSpan } from './render-text-node.helper';
import { parseRange } from './mapping-range.helpers';

/** Template placeholder token pattern: `{value}`, `{field}`, `{class}`, any parameter name. */
const PLACEHOLDER_PATTERN = /\{([\w.]+)\}/g;

/**
 * Resolves the first argument of `renderer`: for `fields[]`, an array of resolved values,
 * otherwise the single `field`/`value` value.
 */
function resolveRendererArg(config: CustomConfig, item?: Record<string, unknown>): unknown {
    if (Array.isArray(config.fields) && config.fields.length > 0 && item) {
        return config.fields.map(fieldName => resolveValue(item, fieldName));
    }
    return resolveFieldOrValueText(config, item);
}

/**
 * Looks up the `custom` `mapping` entry for a value: first by exact key match
 * (`String(value)`), then by `"min-max"` range match (like progress).
 */
function resolveTemplateMappingEntry(
    mapping: Record<string, CustomTemplateParams> | null | undefined,
    value: unknown
): CustomTemplateParams | null {
    if (!mapping) return null;

    const key = value !== null && value !== undefined ? String(value) : '';
    if (hasSafeOwnKey(mapping, key)) return mapping[key] ?? null;

    const numeric = Number(value);
    if (!Number.isNaN(numeric) && value !== '' && value !== null) {
        for (const [rangeKey, entry] of Object.entries(mapping)) {
            const range = parseRange(rangeKey);
            if (range && numeric >= range[0] && numeric <= range[1]) return entry ?? null;
        }
    }
    return null;
}

/**
 * Builds the parameter dictionary for template substitution (null-prototype, primitive values).
 * Base entries: `value`/`field`/`class`/`icon`; the found mapping entry's keys override/extend them.
 */
function buildTemplateParams(
    config: CustomConfig,
    item?: Record<string, unknown>
): Record<string, string> {
    const params = createNullObject<string>();
    const rawValue = resolveFieldOrValueText(config, item);

    params.value = rawValue !== null && rawValue !== undefined ? String(rawValue) : '';
    params.field = config.field ?? '';
    params.class = '';
    params.icon = '';

    const entry = resolveTemplateMappingEntry(config.mapping, rawValue);
    if (entry) {
        for (const entryKey of Object.keys(entry)) {
            if (isForbiddenProtoKey(entryKey)) continue;
            const entryValue = entry[entryKey];
            if (entryValue !== null && entryValue !== undefined) {
                params[entryKey] = String(entryValue);
            }
        }
    }
    return params;
}

/** Substitutes `{placeholder}` tokens from the parameter dictionary; unknown key → empty string. */
function substituteTemplate(template: string, params: Record<string, string>): string {
    return template.replace(PLACEHOLDER_PATTERN, (_match, key: string) =>
        hasSafeOwnKey(params, key) ? (params[key] ?? '') : ''
    );
}

/**
 * Resolves the `template` mode's HTML string (BEFORE sanitization): builds the template
 * parameter dictionary (value/field/class/icon + mapping entry) and substitutes the placeholders.
 * Exported separately for testability (DOMPurify sanitization is unreliable in the happy-dom
 * test environment, so we verify the placeholder/mapping logic on this pure string).
 *
 * @param config - The custom config (`template` + optional `mapping`)
 * @param item - The row (item) object
 * @returns The substituted, NOT YET sanitized HTML string
 */
export function resolveCustomTemplateHtml(
    config: CustomConfig,
    item?: Record<string, unknown>
): string {
    return substituteTemplate(config.template ?? '', buildTemplateParams(config, item));
}

/**
 * Sanitizes an (already produced) HTML string (DOMPurify, with the cell-level `raw` whitelist)
 * and renders it into a `<span>` as `innerHTML`, along with content styles and `data-*` attributes.
 */
function renderSanitizedHtmlNode(
    html: string,
    config: CustomConfig,
    item?: Record<string, unknown>,
    rawHtml?: SegmentFormatOptions['rawHtml']
): VNode {
    const sanitized = formatRaw(html, { ...rawHtml });

    const { classes, styles } = resolveContentStyles(config);
    const attrs: Record<string, unknown> = {};
    applyBaseContentAttrs(attrs, classes, styles);
    forwardDataAttributes(config as unknown as Record<string, unknown>, attrs, value =>
        substituteItemPlaceholders(value, item)
    );

    return h('span', { ...attrs, innerHTML: sanitized });
}

/**
 * Looks up a host-registered function by the name the response asked for.
 *
 * `config.renderer` / `config.callback` are response-supplied strings, so a plain bracket
 * read finds `Object` for `'constructor'` and a real method for `'toString'` — both are
 * functions, so the mode would fire and print garbage (`[object Object]`) instead of falling
 * through to the next rendering mode. The own-key guard makes an inherited name behave like
 * an unknown one; the `typeof` check keeps a non-function entry from being called.
 *
 * @param registry - The host-supplied `renderers`/`callbacks` registry (may be absent)
 * @param name - The function name from the response config (may be absent)
 * @returns The registered function, or `undefined` when the name resolves to nothing
 */
function resolveRegistryFunction<T>(
    registry: Record<string, T> | undefined,
    name: string | null | undefined
): T | undefined {
    const fn = readOwnEntry(registry, name);
    return typeof fn === 'function' ? fn : undefined;
}

/**
 * Renders a `custom` type config segment into a VNode.
 *
 * Four rendering modes (priority): `renderer` (host fn → HTML) → `callback` (host fn → text)
 * → `template` (HTML + placeholder/mapping substitution) → default (raw value). All HTML
 * output (renderer, template) goes through DOMPurify before entering the DOM as `innerHTML`;
 * the callback/default text output goes through the `static` formatting chain and is escaped by Vue.
 *
 * `renderer`/`callback` refer to the NAME in the `config.renderers`/`config.callbacks` host
 * registry (`options.renderers`/`options.callbacks`) — an unknown name falls back to the next
 * mode, ultimately to the default text display. Conditional `if`/`else` resolution happens
 * upstream (`buildFieldSegments`), so this node already receives a flattened config.
 *
 * @param config - The custom column config object
 * @param options - Locale/dateStyle/timeZone/rawHtml/item + the `renderers`/`callbacks` registry
 * @returns Rendered VNode (Promise)
 *
 * @example
 * ```ts
 * // template mode
 * await renderCustomNode(
 *     { type: 'custom', field: 'status', template: "<span class='{class}'>{icon} {value}</span>",
 *       mapping: { active: { class: 'text-success', icon: '✓' } } },
 *     { locale: 'en-US', item: { status: 'active' } }
 * );
 * // → <span><span class="text-success">✓ active</span></span> (sanitized)
 * ```
 */
export async function renderCustomNode(
    config: CustomConfig,
    options: SegmentFormatOptions
): Promise<VNode> {
    const { item, rawHtml, renderers, callbacks } = options;

    // 1. renderer mode — host fn → HTML → sanitize
    const rendererFn = resolveRegistryFunction(renderers, config.renderer);
    if (rendererFn) {
        const html = String(
            rendererFn(
                resolveRendererArg(config, item),
                item ?? {},
                config as unknown as Record<string, unknown>
            )
        );
        return renderSanitizedHtmlNode(html, config, item, rawHtml);
    }

    // 2. callback mode — host fn → text → static formatting
    const callbackFn = resolveRegistryFunction(callbacks, config.callback);
    if (callbackFn) {
        const value = resolveFieldOrValueText(config, item);
        const params = (config.params ?? {}) as Record<string, unknown>;
        const text = callbackFn(value, item ?? {}, params);
        return renderFormattedTextSpan(text, config, options);
    }

    // 3. template mode — placeholder/mapping substitution → sanitize
    if (config.template) {
        const html = resolveCustomTemplateHtml(config, item);
        return renderSanitizedHtmlNode(html, config, item, rawHtml);
    }

    // 4. default — raw value with static formatting
    return renderFormattedTextSpan(resolveFieldOrValueText(config, item), config, options);
}
