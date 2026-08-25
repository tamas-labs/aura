import { computed, type ComputedRef, toValue, type MaybeRefOrGetter } from 'vue';
import type { BaseCellConfig } from '../../../../types/cell.types';
import { computeStyles } from './computeStyles';
import { computeClasses, type DataTypesClasses } from './computeClasses';

/**
 * Return type of useCellStyles composable.
 */
export interface UseCellStylesReturn {
    /** Reactive computed style object */
    styles: ComputedRef<Record<string, string | number | undefined>>;
    /** Reactive computed class list */
    classes: ComputedRef<string[]>;
    /** Merged attributes for rendering */
    styleAttributes: ComputedRef<{
        class: string[];
        style: (Record<string, string | number | undefined> | string | null | undefined)[];
    }>;
}

/**
 * Vue composable for reactive cell style handling.
 *
 * @param config - The cell configuration (can be ref, getter or plain object)
 * @param variants - Optional bootstrap variants mapping (can be ref, getter or plain object)
 * @param dataTypes - Optional data types (numbers, currency) class configuration
 * @returns Reactive style and class computeds
 *
 * @example
 * ```ts
 * const { styles, classes, styleAttributes } = useCellStyles(() => props.cell, variants, dataTypes);
 *
 * return () => h('td', {
 *     class: styleAttributes.value.class,
 *     style: styleAttributes.value.style,
 * }, content);
 * ```
 */
export function useCellStyles(
    config: MaybeRefOrGetter<BaseCellConfig>,
    variants?: MaybeRefOrGetter<Record<string, string> | undefined>,
    dataTypes?: MaybeRefOrGetter<DataTypesClasses | undefined>
): UseCellStylesReturn {
    const styles = computed(() => {
        const configValue = toValue(config);
        const variantsValue = toValue(variants);
        return computeStyles(configValue, variantsValue);
    });

    const classes = computed(() => {
        const configValue = toValue(config);
        const variantsValue = toValue(variants);
        const dataTypesValue = toValue(dataTypes);
        return computeClasses(configValue, variantsValue, dataTypesValue);
    });

    const styleAttributes = computed(() => {
        const configValue = toValue(config);
        return {
            class: classes.value,
            style: [styles.value, configValue.style],
        };
    });

    return {
        styles,
        classes,
        styleAttributes,
    };
}
