import { h, type VNode } from 'vue';
import type { BadgeConfig, BadgeMappingValue } from '../../../../types/api-response.types';
import { formatValue, resolveContentStyles, buildFormatConfig } from '../../utils';
import { resolveValue, hasSafeOwnKey } from '../../../../utils';
import type { SegmentFormatOptions } from './segment-renderer.types';
import { resolveIconClassesFromRegistry } from '../../../../utils/preprocessors/preprocessor-utils';
import {
    resolveGlobalClassArray,
    forwardDataAttributes,
    applyBaseContentAttrs,
    substituteItemPlaceholders,
} from './render-class-helpers';

/** Default variant when a value cannot be styled but must remain visible. */
const FALLBACK_VARIANT = 'secondary';

/** Normalised string values interpreted as falsy in boolean mode. */
const FALSY_STRINGS = new Set(['false', '0', 'no', '']);

/** Raw value that can drive the badge. */
type RawValue = string | number | boolean | null | undefined;

/**
 * Resolved badge presentation state produced by {@link resolveBadgeState}.
 */
interface BadgeState {
    /** Display label (before the static formatter chain). */
    label: string;
    /** Bootstrap colour variant (→ `text-bg-{variant}`), or null. */
    variant: string | null;
    /** Icon registry key (config.icons), or null. */
    iconKey: string | null;
    /** Extra CSS classes from a mapping / boolean entry. */
    extraClass: unknown;
    /** When true, the badge renders nothing (e.g. `showZero: false` at 0). */
    hidden: boolean;
}

/**
 * Interprets a raw value as a boolean for `trueValue` / `falseValue` selection.
 *
 * Booleans map directly; numbers are truthy when non-zero; strings normalise
 * common truthy/falsy words (`true`/`1`/`yes` vs `false`/`0`/`no`/empty), any
 * other non-empty string is truthy.
 *
 * @param value - The raw value
 * @returns Whether the value is considered truthy
 */
function isTruthyValue(value: RawValue): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
        return !FALSY_STRINGS.has(value.trim().toLowerCase());
    }
    return Boolean(value);
}

/**
 * Builds a {@link BadgeState} from a `mapping` / `trueValue` / `falseValue` entry,
 * falling back to the config-level `variant`/`icon` and the raw value as label.
 *
 * @param entry - The mapping or boolean-branch entry
 * @param rawLabel - The raw value stringified (default label)
 * @param config - The badge config (for fallback variant/icon)
 * @returns The resolved badge state
 */
function stateFromEntry(
    entry: BadgeMappingValue,
    rawLabel: string,
    config: BadgeConfig
): BadgeState {
    return {
        label: entry.label ?? rawLabel,
        variant: entry.variant ?? config.variant ?? null,
        iconKey: entry.icon ?? config.icon ?? null,
        extraClass: entry.class,
        hidden: false,
    };
}

/**
 * Applies counter/plain-mode label shaping: numeric `showZero` suppression,
 * `maxValue` overflow (`{maxValue}{suffix}`) and `prefix`/`suffix` wrapping.
 *
 * @param value - The raw value
 * @param config - The badge config
 * @returns The counter/plain badge state
 */
function resolveCounterState(value: RawValue, config: BadgeConfig): BadgeState {
    const base: BadgeState = {
        label: '',
        variant: config.variant ?? null,
        iconKey: config.icon ?? null,
        extraClass: null,
        hidden: false,
    };

    const numeric = typeof value === 'number' ? value : Number(value);
    const isNumeric =
        value !== null && value !== undefined && value !== '' && !Number.isNaN(numeric);

    if (isNumeric && numeric === 0 && config.showZero === false) {
        return { ...base, hidden: true };
    }

    const prefix = config.prefix ?? '';

    // `suffix` is the overflow marker — only applied when clamping to maxValue
    if (
        isNumeric &&
        config.maxValue !== null &&
        config.maxValue !== undefined &&
        numeric > config.maxValue
    ) {
        return { ...base, label: `${prefix}${config.maxValue}${config.suffix ?? ''}` };
    }

    const core = value === null || value === undefined ? '' : String(value);
    return { ...base, label: `${prefix}${core}` };
}

/**
 * Resolves the full presentation state of a badge from its config and row value.
 *
 * Resolution order: boolean mode (when `trueValue`/`falseValue` is configured) →
 * `mapping` lookup (fallback: raw value + config variant) → counter/plain mode.
 *
 * @param config - The badge config
 * @param item - The row data object
 * @returns The resolved badge state
 */
function resolveBadgeState(config: BadgeConfig, item?: Record<string, unknown>): BadgeState {
    const raw: RawValue =
        config.field && item
            ? (resolveValue(item, config.field) as RawValue)
            : (config.value ?? null);
    const rawLabel = raw === null || raw === undefined ? '' : String(raw);

    // Boolean mode — triggered by trueValue/falseValue presence
    if (config.trueValue || config.falseValue) {
        const entry = isTruthyValue(raw) ? config.trueValue : config.falseValue;
        if (entry) return stateFromEntry(entry, rawLabel, config);
        // Only one branch configured and the other side matched → nothing to show
        return {
            label: '',
            variant: config.variant ?? null,
            iconKey: config.icon ?? null,
            extraClass: null,
            hidden: true,
        };
    }

    // Mapping mode — lookup by stringified value, fallback to raw + config variant
    if (config.mapping) {
        // Own-key lookup only — a cell value of `toString`/`constructor` would otherwise
        // find an inherited function, pass the truthiness check and render a blank badge
        // instead of falling back to the raw label below.
        const entry = hasSafeOwnKey(config.mapping, rawLabel) ? config.mapping[rawLabel] : null;
        if (entry) return stateFromEntry(entry, rawLabel, config);
        return {
            label: rawLabel,
            variant: config.variant ?? FALLBACK_VARIANT,
            iconKey: config.icon ?? null,
            extraClass: null,
            hidden: false,
        };
    }

    // Counter / plain mode
    return resolveCounterState(raw, config);
}

/**
 * Builds the CSS class list for the badge `<span>`: the base `badge` class,
 * `text-bg-{variant}` colour, pill/size modifiers, mapping-entry classes,
 * content styles and global badge classes from config.
 *
 * @param state - The resolved badge state (variant + extra class)
 * @param config - The badge config (pill/size)
 * @param contentClasses - Classes resolved from resolveContentStyles
 * @param options - Context options (for globalClasses)
 * @returns Array of CSS class strings
 */
function buildBadgeClasses(
    state: BadgeState,
    config: BadgeConfig,
    contentClasses: string[],
    options: SegmentFormatOptions
): string[] {
    const classes = ['badge'];
    if (state.variant) classes.push(`text-bg-${state.variant}`);
    if (config.pill) classes.push('rounded-pill');
    if (config.size) classes.push(`badge-${config.size}`);
    classes.push(...resolveGlobalClassArray(state.extraClass));
    classes.push(...contentClasses);
    classes.push(...resolveGlobalClassArray(options.globalClasses?.badge));
    return classes;
}

/**
 * Assembles the badge children from the optional icon and formatted text,
 * ordering them per `iconPosition` ('start' default | 'end') with a single
 * space between icon and text when both are present.
 *
 * @param icon - The icon VNode (or null)
 * @param text - The formatted label text (may be empty)
 * @param iconPosition - Icon placement relative to the text
 * @returns Array of child VNodes / strings
 */
function buildBadgeChildren(
    icon: VNode | null,
    text: string,
    iconPosition: BadgeConfig['iconPosition']
): (VNode | string)[] {
    if (!icon) return text ? [text] : [];
    if (!text) return [icon];
    return iconPosition === 'end' ? [text, ' ', icon] : [icon, ' ', text];
}

/**
 * Renders a `badge` type config segment into a `<span class="badge">` VNode.
 *
 * The label and colour derive from the value via three resolution modes:
 * static (`field`/`value` + `variant`), value→config `mapping`, or boolean
 * `trueValue`/`falseValue`. Numeric counter mode applies `prefix`/`suffix`,
 * `maxValue` overflow and `showZero`. The resolved label passes through the
 * `static` formatter chain; an optional `icon` (config.icons registry key) is
 * rendered as an `<i>` glyph per `iconPosition`. When the state is hidden
 * (e.g. `showZero: false` at 0), an empty comment node is returned.
 *
 * Conditional `if`/`else` resolution happens upstream in `buildFieldSegments`
 * (TableBodyRow), so this node only renders an already-flattened config.
 *
 * @param config - The badge column config object
 * @param options - Context including row item data, locale, globalClasses and icon registry
 * @returns A Promise resolving to a `<span class="badge">` VNode (or an empty node when hidden)
 *
 * @example
 * ```ts
 * await renderBadgeNode(
 *     { type: 'badge', field: 'priority', mapping: { high: { variant: 'danger', label: 'Magas' } } },
 *     { locale: 'en-US', item: { priority: 'high' } }
 * );
 * // → <span class="badge text-bg-danger">Magas</span>
 *
 * await renderBadgeNode(
 *     { type: 'badge', field: 'unread', variant: 'primary', pill: true, maxValue: 9, suffix: '+' },
 *     { locale: 'en-US', item: { unread: 15 } }
 * );
 * // → <span class="badge text-bg-primary rounded-pill">9+</span>
 * ```
 */
export async function renderBadgeNode(
    config: BadgeConfig,
    options: SegmentFormatOptions
): Promise<VNode> {
    const { locale, dateStyle, timeZone, rawHtml, item } = options;

    const state = resolveBadgeState(config, item);
    if (state.hidden) return h('span', { style: { display: 'none' } });

    const text = await formatValue(state.label, buildFormatConfig(config), locale, undefined, {
        dateStyle,
        timeZone,
        rawHtml,
    });

    const { classes: contentClasses, styles } = resolveContentStyles(config);
    const classes = buildBadgeClasses(state, config, contentClasses, options);

    const attrs: Record<string, unknown> = {};
    applyBaseContentAttrs(attrs, classes, styles);
    forwardDataAttributes(config as unknown as Record<string, unknown>, attrs, value =>
        substituteItemPlaceholders(value, item)
    );

    const iconClasses = state.iconKey
        ? resolveIconClassesFromRegistry(state.iconKey, options.icons, undefined, undefined)
        : [];
    const icon = iconClasses.length > 0 ? h('i', { class: iconClasses }) : null;
    const children = buildBadgeChildren(icon, text, config.iconPosition);

    return h('span', attrs, children);
}
