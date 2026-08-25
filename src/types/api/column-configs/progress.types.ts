import type {
    Align,
    BootstrapColor,
    CssClass,
    CssNumericValue,
    LabelPosition,
    LabelType,
} from '../primitives.types';
import type { BaseColumnConfig } from './base.types';

/**
 * Configuration for a single bar in a stacked progress bar.
 */
export interface ProgressBar {
    field: string;
    variant?: BootstrapColor | null;
    label?: string | null;
}

/**
 * Mapping value for progress configuration.
 */
export interface ProgressMappingValue {
    variant?: BootstrapColor | null;
    label?: string | null;
    class?: CssClass | null;
}

/**
 * Value type for progress max property - can be a number or a field name.
 */
export type ProgressMaxValue = number | string;

/**
 * Configuration for progress bar columns.
 */
export interface ProgressConfig extends BaseColumnConfig {
    type: 'progress';
    /** Item field name whose numeric value drives the bar */
    field?: string | null;
    /** Fixed numeric value (static mode) */
    value?: number | null;
    /** Maximum value or field name */
    max?: ProgressMaxValue | null;
    min?: number | null;
    variant?: BootstrapColor | null;
    height?: string | null;
    striped?: boolean | null;
    animated?: boolean | null;
    label?: LabelType;
    labelPosition?: LabelPosition | null;
    /** Range-based mapping configuration (key format: "min-max") */
    mapping?: Record<string, ProgressMappingValue> | null;
    /** Threshold-based coloring */
    thresholds?: Record<string, [number, number]> | null;
    /** Stacked progress bars */
    stacked?: boolean | null;
    bars?: ProgressBar[] | null;
    showValue?: boolean | null;
    showPercent?: boolean | null;
    decimals?: number | null;
    suffix?: string | null;
    prefix?: string | null;

    // Content styling (static-parity — applied to the label)
    /** Bootstrap color variant (label text colour) */
    color?: BootstrapColor | null;
    /** Background color (Bootstrap color or CSS color value) */
    background?: string | null;
    /** Text alignment */
    align?: Align | null;
    /** CSS font-size value (e.g. '12px', '1rem') */
    fontSize?: string | null;
    /** CSS font-weight value (100-900, normal, bold, lighter, bolder) */
    fontWeight?: CssNumericValue;
    /** Italic text style */
    italic?: boolean | null;
    /** CSS line-height value (e.g. '1.5', '24px') */
    lineHeight?: CssNumericValue;
    /** Bootstrap text utility class (e.g. 'text-truncate') */
    text?: string | null;
    /** Monospace font family */
    monospace?: boolean | null;
}
