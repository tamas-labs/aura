import type { BaseCellConfig } from '../../../../types/cell.types';
import { isBootstrapVariant } from './isBootstrapVariant';

/**
 * Definition for dataTypes classes from config.
 */
export interface DataTypesClasses {
    numbers?: string[];
    currency?: string[];
    unit?: string[];
}

/**
 * Extended config type with body cell properties.
 */
interface ExtendedCellConfig extends BaseCellConfig {
    number?: boolean | null;
    currency?: string | boolean | null;
    unit?: string | null;
    type?: string | null;
}

/**
 * Checks if number type classes should be applied.
 */
function shouldApplyNumberClasses(config: ExtendedCellConfig): boolean {
    return config.number === true || config.type === 'number';
}

/**
 * Checks if currency type classes should be applied.
 */
function shouldApplyCurrencyClasses(config: ExtendedCellConfig): boolean {
    return !!config.currency || config.type === 'currency';
}

/**
 * Checks if unit type classes should be applied.
 */
function shouldApplyUnitClasses(config: ExtendedCellConfig): boolean {
    return !!config.unit || config.type === 'unit';
}

/**
 * Applies data type classes (numbers, currency) to the class list.
 */
function applyDataTypeClasses(
    classList: string[],
    config: ExtendedCellConfig,
    dataTypes?: DataTypesClasses
): void {
    if (!dataTypes) return;

    if (shouldApplyNumberClasses(config) && dataTypes.numbers?.length) {
        classList.push(...dataTypes.numbers);
    }

    if (shouldApplyCurrencyClasses(config) && dataTypes.currency?.length) {
        classList.push(...dataTypes.currency);
    }

    if (shouldApplyUnitClasses(config) && dataTypes.unit?.length) {
        classList.push(...dataTypes.unit);
    }
}

/**
 * Applies custom CSS classes to the class list.
 */
function applyCustomClasses(
    classList: string[],
    classConfig: string | string[] | null | undefined
): void {
    if (!classConfig) return;

    if (Array.isArray(classConfig)) {
        classList.push(...classConfig);
    } else if (typeof classConfig === 'string') {
        classList.push(classConfig);
    }
}

/**
 * Applies typography and text transform classes to the class list.
 */
function applyTextClasses(classList: string[], config: BaseCellConfig): void {
    if (config.monospace) classList.push('font-monospace');
    if (config.uppercase) classList.push('text-uppercase');
    if (config.lowercase) classList.push('text-lowercase');
    if (config.capitalize) classList.push('text-capitalize');
    if (config.text) classList.push(config.text);
}

/**
 * Applies Bootstrap variant classes to the class list.
 */
function applyVariantClasses(
    classList: string[],
    config: BaseCellConfig,
    variants?: Record<string, string>
): void {
    if (config.background && isBootstrapVariant(config.background, variants)) {
        classList.push(`table-${config.background}`);
    }

    if (config.color && isBootstrapVariant(config.color, variants)) {
        classList.push(`text-${config.color}`);
    }
}

/**
 * Computes the CSS class list for a cell based on its configuration.
 *
 * @param config - The cell configuration object
 * @param variants - Optional bootstrap variants mapping
 * @param dataTypes - Optional data types (numbers, currency) class configuration
 * @returns Array of CSS classes
 *
 * @example
 * ```ts
 * const classes = computeClasses({ class: 'custom', monospace: true, uppercase: true });
 * // Returns: ['custom', 'font-monospace', 'text-uppercase']
 * ```
 */
export function computeClasses(
    config: BaseCellConfig,
    variants?: Record<string, string>,
    dataTypes?: DataTypesClasses
): string[] {
    const classList: string[] = [];
    const extendedConfig = config as ExtendedCellConfig;

    // DataType classes applied first (lower priority)
    applyDataTypeClasses(classList, extendedConfig, dataTypes);

    // Custom classes
    applyCustomClasses(classList, config.class);

    // Typography and text transform classes
    applyTextClasses(classList, config);

    // Bootstrap variant classes
    applyVariantClasses(classList, config, variants);

    return classList;
}
