import type { BaseCellConfig } from '../../../../types/cell.types';
import { isBootstrapVariant } from './isBootstrapVariant';
import { readOwnEntry } from '../../../../utils';

/**
 * Mapping of alignment values to CSS text-align values.
 */
const ALIGN_MAP: Record<string, string> = {
    start: 'left',
    center: 'center',
    end: 'right',
};

/**
 * Computes the inline style object for a cell based on its configuration.
 *
 * @param config - The cell configuration object
 * @param variants - Optional bootstrap variants mapping
 * @returns CSS style object
 *
 * @example
 * ```ts
 * const style = computeStyles({ width: '100px', align: 'center', italic: true });
 * // Returns: { width: '100px', textAlign: 'center', fontStyle: 'italic' }
 * ```
 */
export function computeStyles(
    config: BaseCellConfig,
    variants?: Record<string, string>
): Record<string, string | number | undefined> {
    const style: Record<string, string | number | undefined> = {};

    if (config.width) {
        style.width = config.width;
    }

    if (config.align) {
        style.textAlign = readOwnEntry(ALIGN_MAP, config.align) || config.align;
    }

    if (config.color && !isBootstrapVariant(config.color, variants)) {
        style.color = config.color;
    }

    if (config.background && !isBootstrapVariant(config.background, variants)) {
        style.backgroundColor = config.background;
    }

    if (config.fontSize) {
        style.fontSize = config.fontSize;
    }

    if (config.fontWeight) {
        style.fontWeight = config.fontWeight;
    }

    if (config.lineHeight) {
        style.lineHeight = config.lineHeight;
    }

    if (config.italic) {
        style.fontStyle = 'italic';
    }

    // `normal` is an explicit override: resets italic (`font-style: normal`).
    // Runs after `italic`, so if both are set, `normal` wins.
    if (config.normal) {
        style.fontStyle = 'normal';
    }

    return style;
}
