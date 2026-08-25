import { h, type VNode } from 'vue';
import type {
    ProgressConfig,
    ProgressBar,
    ProgressMappingValue,
} from '../../../../types/api-response.types';
import { resolveContentStyles } from '../../utils';
import { resolveValue } from '../../../../utils';
import type { SegmentFormatOptions } from './segment-renderer.types';
import {
    resolveGlobalClassArray,
    forwardDataAttributes,
    substituteItemPlaceholders,
} from './render-class-helpers';
import { parseRange } from './mapping-range.helpers';

/** Default colour when no mapping/threshold/variant resolves. */
const FALLBACK_VARIANT = 'primary';
/** Bootstrap progress wrapper class. */
const PROGRESS_CLASS = 'progress';
/** Bootstrap progress-bar (filled inner) class. */
const PROGRESS_BAR_CLASS = 'progress-bar';
/** Percent sign appended to percentage labels. */
const PERCENT = '%';

/** Resolved numeric state of a progress value. */
interface ProgressValueState {
    /** The raw numeric value (NaN coerced to 0). */
    numeric: number;
    /** Lower bound (default 0). */
    min: number;
    /** Upper bound (number or resolved field, default 100). */
    max: number;
    /** Clamped fill percentage in [0, 100]. */
    percent: number;
}

/**
 * Clamps a number into the [0, 100] range.
 *
 * @param n - The value to clamp
 * @returns The clamped value
 */
function clampPercent(n: number): number {
    return Math.min(100, Math.max(0, n));
}

/**
 * Formats a number with a fixed number of decimals.
 *
 * @param n - The value
 * @param decimals - Decimal places (default 0)
 * @returns The formatted numeric string
 */
function formatNumber(n: number, decimals?: number | null): string {
    return n.toFixed(decimals ?? 0);
}

/**
 * Resolves the effective maximum: a literal number, a row field value, or 100.
 *
 * @param config - The progress config
 * @param item - The row data object
 * @returns The resolved maximum (falls back to 100 for missing/invalid fields)
 */
function resolveMax(config: ProgressConfig, item?: Record<string, unknown>): number {
    const { max } = config;
    if (typeof max === 'number') return max;
    if (typeof max === 'string' && item) {
        const resolved = Number(resolveValue(item, max));
        return Number.isNaN(resolved) ? 100 : resolved;
    }
    return 100;
}

/**
 * Resolves the numeric value, bounds and fill percentage from a config and row.
 *
 * The value comes from the item `field` (when present) or the static `value`.
 * `percent = clamp((value - min) / (max - min) * 100, 0, 100)`; a non-positive
 * span (`max <= min`) yields 0% (division-by-zero guard).
 *
 * @param config - The progress config
 * @param item - The row data object
 * @returns The resolved value state
 */
function resolveProgressValue(
    config: ProgressConfig,
    item?: Record<string, unknown>
): ProgressValueState {
    const raw = config.field && item ? resolveValue(item, config.field) : config.value;
    const parsed = Number(raw);
    const numeric = Number.isNaN(parsed) ? 0 : parsed;
    const min = config.min ?? 0;
    const max = resolveMax(config, item);
    const span = max - min;
    const percent = span <= 0 ? 0 : clampPercent(((numeric - min) / span) * 100);
    return { numeric, min, max, percent };
}

/**
 * Finds the `mapping` entry whose range contains the value.
 *
 * @param config - The progress config
 * @param value - The numeric value
 * @returns The matching mapping entry, or null
 */
function resolveMappingEntry(config: ProgressConfig, value: number): ProgressMappingValue | null {
    if (!config.mapping) return null;
    for (const [key, entry] of Object.entries(config.mapping)) {
        const range = parseRange(key);
        if (range && value >= range[0] && value <= range[1]) return entry;
    }
    return null;
}

/**
 * Finds the `thresholds` variant whose [min, max] range contains the value.
 *
 * @param config - The progress config
 * @param value - The numeric value
 * @returns The threshold variant name, or null
 */
function resolveThresholdVariant(config: ProgressConfig, value: number): string | null {
    if (!config.thresholds) return null;
    for (const [variant, range] of Object.entries(config.thresholds)) {
        if (Array.isArray(range) && value >= range[0] && value <= range[1]) return variant;
    }
    return null;
}

/**
 * Resolves the bar colour by priority: mapping entry → thresholds → config
 * `variant` → fallback `primary`.
 *
 * @param config - The progress config
 * @param value - The numeric value
 * @param mappingEntry - The matched mapping entry (or null)
 * @returns The Bootstrap colour variant name
 */
function resolveProgressColor(
    config: ProgressConfig,
    value: number,
    mappingEntry: ProgressMappingValue | null
): string {
    if (mappingEntry?.variant) return mappingEntry.variant;
    const threshold = resolveThresholdVariant(config, value);
    if (threshold) return threshold;
    return config.variant ?? FALLBACK_VARIANT;
}

/**
 * Substitutes `{value}`, `{max}` and `{percent}` tokens in a label template,
 * each formatted with the config `decimals`.
 *
 * @param template - The label template string
 * @param config - The progress config (for decimals)
 * @param state - The resolved value state
 * @returns The interpolated label
 */
function substituteLabelTemplate(
    template: string,
    config: ProgressConfig,
    state: ProgressValueState
): string {
    const decimals = config.decimals ?? 0;
    return template
        .replace(/\{value\}/g, formatNumber(state.numeric, decimals))
        .replace(/\{max\}/g, formatNumber(state.max, decimals))
        .replace(/\{percent\}/g, formatNumber(state.percent, decimals));
}

/**
 * Builds the default label from `showValue`/`showPercent` flags (used when no
 * explicit `label` is configured).
 *
 * @param config - The progress config
 * @param state - The resolved value state
 * @returns The composed label (empty when neither flag is set)
 */
function buildFlagLabel(config: ProgressConfig, state: ProgressValueState): string {
    const decimals = config.decimals ?? 0;
    const prefix = config.prefix ?? '';
    const suffix = config.suffix ?? '';
    const parts: string[] = [];
    if (config.showValue) parts.push(`${prefix}${formatNumber(state.numeric, decimals)}${suffix}`);
    if (config.showPercent) parts.push(`${formatNumber(state.percent, decimals)}${PERCENT}`);
    return parts.join(' ');
}

/**
 * Resolves the progress label per the "label is master" rule: a matched mapping
 * label wins; then a `label` string template; `label: true` → `{prefix}{percent}{suffix ?? '%'}`;
 * otherwise the `showValue`/`showPercent` flag label.
 *
 * @param config - The progress config
 * @param state - The resolved value state
 * @param mappingEntry - The matched mapping entry (or null)
 * @returns The label text (may be empty)
 */
function resolveProgressLabel(
    config: ProgressConfig,
    state: ProgressValueState,
    mappingEntry: ProgressMappingValue | null
): string {
    if (mappingEntry?.label) return substituteLabelTemplate(mappingEntry.label, config, state);

    const { label } = config;
    if (typeof label === 'string') return substituteLabelTemplate(label, config, state);
    if (label === true) {
        const decimals = config.decimals ?? 0;
        return `${config.prefix ?? ''}${formatNumber(state.percent, decimals)}${config.suffix ?? PERCENT}`;
    }
    return buildFlagLabel(config, state);
}

/**
 * Builds the CSS class list for a filled progress bar: the base class, the
 * `bg-{variant}` colour, and optional striped/animated modifiers (animated only
 * applies alongside striped, per Bootstrap).
 *
 * @param variant - The resolved colour variant
 * @param config - The progress config (striped/animated)
 * @returns The class array
 */
function buildBarClasses(variant: string, config: ProgressConfig): string[] {
    const classes = [PROGRESS_BAR_CLASS, `bg-${variant}`];
    if (config.striped) classes.push('progress-bar-striped');
    if (config.striped && config.animated) classes.push('progress-bar-animated');
    return classes;
}

/**
 * Builds the ARIA/role attributes for a progress track.
 *
 * @param state - The resolved value state
 * @returns The attribute map
 */
function buildAriaAttrs(state: ProgressValueState): Record<string, unknown> {
    return {
        role: 'progressbar',
        'aria-valuenow': state.numeric,
        'aria-valuemin': state.min,
        'aria-valuemax': state.max,
    };
}

/**
 * Renders a single (non-stacked) progress bar VNode, honouring `labelPosition`
 * ('inside' default → label inside the bar; 'outside' → label after the track).
 *
 * @param config - The progress config
 * @param options - The segment format options
 * @returns The progress VNode
 */
function renderSingleProgress(config: ProgressConfig, options: SegmentFormatOptions): VNode {
    const { item } = options;
    const state = resolveProgressValue(config, item);
    const mappingEntry = resolveMappingEntry(config, state.numeric);
    const variant = resolveProgressColor(config, state.numeric, mappingEntry);
    const label = resolveProgressLabel(config, state, mappingEntry);

    const { classes: contentClasses, styles: contentStyles } = resolveContentStyles(config);
    const barClasses = [
        ...buildBarClasses(variant, config),
        ...resolveGlobalClassArray(mappingEntry?.class),
        ...contentClasses,
    ];
    const bar = h(
        'div',
        { class: barClasses, style: { width: `${state.percent}${PERCENT}`, ...contentStyles } },
        config.labelPosition === 'outside' ? [] : [label]
    );

    const trackAttrs: Record<string, unknown> = {
        class: PROGRESS_CLASS,
        style: config.height ? { height: config.height } : undefined,
        ...buildAriaAttrs(state),
    };
    const track = h('div', trackAttrs, [bar]);

    if (config.labelPosition === 'outside' && label) {
        return h('div', {}, [track, h('span', { class: 'progress-label' }, label)]);
    }
    return track;
}

/**
 * Renders the stacked (multi-bar) progress markup (Bootstrap 5.3
 * `.progress-stacked`). Each bar's width is auto-normalised to its share of the
 * sum of all bar values (`barValue / Σ * 100`); a zero sum yields empty bars.
 *
 * @param config - The progress config
 * @param options - The segment format options
 * @returns The stacked progress VNode
 */
function renderStackedProgress(config: ProgressConfig, options: SegmentFormatOptions): VNode {
    const { item } = options;
    const bars = config.bars ?? [];
    const values = bars.map(bar => {
        const parsed = Number(item ? resolveValue(item, bar.field) : NaN);
        return Number.isNaN(parsed) ? 0 : parsed;
    });
    const total = values.reduce((sum, v) => sum + v, 0);

    const segments = bars.map((bar: ProgressBar, index: number) => {
        const width = total > 0 ? ((values[index] ?? 0) / total) * 100 : 0;
        const barClasses = [PROGRESS_BAR_CLASS, `bg-${bar.variant ?? FALLBACK_VARIANT}`];
        const inner = h('div', { class: barClasses }, bar.label ? [bar.label] : []);
        return h(
            'div',
            { class: PROGRESS_CLASS, role: 'progressbar', style: { width: `${width}${PERCENT}` } },
            [inner]
        );
    });

    const attrs: Record<string, unknown> = {
        class: 'progress-stacked',
        style: config.height ? { height: config.height } : undefined,
    };
    return h('div', attrs, segments);
}

/**
 * Renders a `progress` type config segment into a Bootstrap 5 progress bar VNode.
 *
 * Single-bar mode fills to `field`/`value` as a percentage of `[min, max]`
 * (`max` may be a literal or a row field, default 100). Colour resolves by
 * priority mapping (range key) → thresholds → `variant` → `primary`. The label
 * follows the "label is master" rule (`label` template / `true` / flags), with a
 * matched mapping label taking precedence. Stacked mode (`stacked: true` + `bars`)
 * renders auto-normalised side-by-side bars.
 *
 * Conditional `if`/`else` resolution happens upstream in `buildFieldSegments`
 * (TableBodyRow), so this node only renders an already-flattened config.
 *
 * @param config - The progress column config object
 * @param options - Context including row item data and locale
 * @returns The progress VNode
 *
 * @example
 * ```ts
 * renderProgressNode(
 *     { type: 'progress', field: 'cpu', thresholds: { success: [0, 50], danger: [51, 100] }, label: true },
 *     { locale: 'en-US', item: { cpu: 72 } }
 * );
 * // → <div class="progress" role="progressbar" aria-valuenow="72" ...>
 * //     <div class="progress-bar bg-danger" style="width:72%">72%</div></div>
 * ```
 */
export function renderProgressNode(config: ProgressConfig, options: SegmentFormatOptions): VNode {
    const node = config.stacked
        ? renderStackedProgress(config, options)
        : renderSingleProgress(config, options);

    // Forward data-* attributes (with {field} placeholder substitution) onto the root node.
    const dataAttrs: Record<string, unknown> = {};
    forwardDataAttributes(config as unknown as Record<string, unknown>, dataAttrs, value =>
        substituteItemPlaceholders(value, options.item)
    );
    if (Object.keys(dataAttrs).length > 0) {
        return h('div', dataAttrs, [node]);
    }
    return node;
}
