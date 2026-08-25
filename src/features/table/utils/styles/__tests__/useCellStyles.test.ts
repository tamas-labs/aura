import { describe, it, expect } from 'vitest';
import { ref, computed } from 'vue';
import { useCellStyles } from '../useCellStyles';
import type { BaseCellConfig } from '../../../../../types/cell.types';

describe('useCellStyles', () => {
    describe('valid cases', () => {
        it('should accept plain object input', () => {
            const config: BaseCellConfig = {
                key: 'test',
                width: '100px',
                align: 'center',
            };

            const { styles, classes, styleAttributes } = useCellStyles(config);

            expect(styles.value).toEqual({
                width: '100px',
                textAlign: 'center',
            });
            expect(classes.value).toEqual([]);
            expect(styleAttributes.value.class).toEqual([]);
            expect(styleAttributes.value.style).toEqual([
                { width: '100px', textAlign: 'center' },
                undefined,
            ]);
        });

        it('should accept ref input', () => {
            const config = ref<BaseCellConfig>({
                key: 'test',
                color: '#ff0000',
                monospace: true,
            });

            const { styles, classes } = useCellStyles(config);

            expect(styles.value).toEqual({ color: '#ff0000' });
            expect(classes.value).toEqual(['font-monospace']);
        });

        it('should accept getter function input', () => {
            const config: BaseCellConfig = {
                key: 'test',
                width: '150px',
                uppercase: true,
            };

            const { styles, classes } = useCellStyles(() => config);

            expect(styles.value).toEqual({ width: '150px' });
            expect(classes.value).toEqual(['text-uppercase']);
        });

        it('should return correct styleAttributes structure', () => {
            const config: BaseCellConfig = {
                key: 'test',
                width: '100px',
                class: 'custom',
                style: { border: '1px solid #ccc' },
            };

            const { styleAttributes } = useCellStyles(config);

            expect(styleAttributes.value).toHaveProperty('class');
            expect(styleAttributes.value).toHaveProperty('style');
            expect(Array.isArray(styleAttributes.value.class)).toBe(true);
            expect(Array.isArray(styleAttributes.value.style)).toBe(true);
        });

        it('should include custom style in styleAttributes', () => {
            const config: BaseCellConfig = {
                key: 'test',
                width: '100px',
                style: { border: '1px solid #ccc' },
            };

            const { styleAttributes } = useCellStyles(config);

            expect(styleAttributes.value.style).toEqual([
                { width: '100px' },
                { border: '1px solid #ccc' },
            ]);
        });

        it('should handle string style in config', () => {
            const config: BaseCellConfig = {
                key: 'test',
                width: '100px',
                style: 'border: 1px solid #ccc',
            };

            const { styleAttributes } = useCellStyles(config);

            expect(styleAttributes.value.style).toEqual([
                { width: '100px' },
                'border: 1px solid #ccc',
            ]);
        });
    });

    describe('reactivity', () => {
        it('should react to ref changes', () => {
            const config = ref<BaseCellConfig>({
                key: 'test',
                width: '100px',
            });

            const { styles } = useCellStyles(config);

            expect(styles.value).toEqual({ width: '100px' });

            // Change the ref value
            config.value = {
                key: 'test',
                width: '200px',
            };

            expect(styles.value).toEqual({ width: '200px' });
        });

        it('should react to nested property changes in ref', () => {
            const config = ref<BaseCellConfig>({
                key: 'test',
                align: 'start',
            });

            const { styles } = useCellStyles(config);

            expect(styles.value).toEqual({ textAlign: 'left' });

            // Change nested property
            config.value.align = 'end';

            expect(styles.value).toEqual({ textAlign: 'right' });
        });

        it('should react to class changes', () => {
            const config = ref<BaseCellConfig>({
                key: 'test',
                monospace: false,
            });

            const { classes } = useCellStyles(config);

            expect(classes.value).toEqual([]);

            config.value.monospace = true;

            expect(classes.value).toEqual(['font-monospace']);
        });

        it('should react to getter function changes', () => {
            const config = ref<BaseCellConfig>({
                key: 'test',
                width: '100px',
            });

            const { styles } = useCellStyles(() => config.value);

            expect(styles.value).toEqual({ width: '100px' });

            config.value = {
                key: 'test',
                width: '300px',
                color: '#000',
            };

            expect(styles.value).toEqual({
                width: '300px',
                color: '#000',
            });
        });
    });

    describe('edge cases', () => {
        it('should handle empty config', () => {
            const config: BaseCellConfig = { key: 'test' };

            const { styles, classes, styleAttributes } = useCellStyles(config);

            expect(styles.value).toEqual({});
            expect(classes.value).toEqual([]);
            expect(styleAttributes.value.class).toEqual([]);
            expect(styleAttributes.value.style).toEqual([{}, undefined]);
        });

        it('should handle computed ref', () => {
            const baseConfig = ref<BaseCellConfig>({
                key: 'test',
                width: '100px',
            });

            const computedConfig = computed(() => ({
                ...baseConfig.value,
                align: 'center' as const,
            }));

            const { styles } = useCellStyles(computedConfig);

            expect(styles.value).toEqual({
                width: '100px',
                textAlign: 'center',
            });

            baseConfig.value.width = '200px';

            expect(styles.value).toEqual({
                width: '200px',
                textAlign: 'center',
            });
        });

        it('should handle config with all properties', () => {
            const config: BaseCellConfig = {
                key: 'test',
                width: '150px',
                align: 'end',
                color: '#333',
                background: '#f5f5f5',
                fontSize: '14px',
                fontWeight: 'bold',
                lineHeight: 1.5,
                italic: true,
                monospace: true,
                uppercase: true,
                class: ['custom-1', 'custom-2'],
                text: 'text-nowrap',
                style: { border: '1px solid #ccc' },
            };

            const { styles, classes, styleAttributes } = useCellStyles(config);

            expect(styles.value).toEqual({
                width: '150px',
                textAlign: 'right',
                color: '#333',
                backgroundColor: '#f5f5f5',
                fontSize: '14px',
                fontWeight: 'bold',
                lineHeight: 1.5,
                fontStyle: 'italic',
            });

            expect(classes.value).toEqual([
                'custom-1',
                'custom-2',
                'font-monospace',
                'text-uppercase',
                'text-nowrap',
            ]);

            expect(styleAttributes.value.class).toEqual([
                'custom-1',
                'custom-2',
                'font-monospace',
                'text-uppercase',
                'text-nowrap',
            ]);

            expect(styleAttributes.value.style).toEqual([
                {
                    width: '150px',
                    textAlign: 'right',
                    color: '#333',
                    backgroundColor: '#f5f5f5',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    lineHeight: 1.5,
                    fontStyle: 'italic',
                },
                { border: '1px solid #ccc' },
            ]);
        });
    });

    describe('bootstrap variants integration', () => {
        const variants = {
            primary: 'primary',
            secondary: 'secondary',
            success: 'success',
            danger: 'danger',
            warning: 'warning',
            info: 'info',
        };

        it('should pass variants to computeStyles and computeClasses', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
                color: 'danger',
            };

            const { styles, classes } = useCellStyles(config, variants);

            // Should NOT include inline styles for variants
            expect(styles.value).toEqual({});
            // Should include Bootstrap classes for variants
            expect(classes.value).toEqual(['table-primary', 'text-danger']);
        });

        it('should handle ref variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'success',
            };
            const variantsRef = ref(variants);

            const { styles, classes } = useCellStyles(config, variantsRef);

            expect(styles.value).toEqual({});
            expect(classes.value).toEqual(['table-success']);
        });

        it('should handle getter function variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                color: 'warning',
            };

            const { styles, classes } = useCellStyles(config, () => variants);

            expect(styles.value).toEqual({});
            expect(classes.value).toEqual(['text-warning']);
        });

        it('should react to variants ref changes', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
            };
            const variantsRef = ref<Record<string, string>>(variants);

            const { styles, classes } = useCellStyles(config, variantsRef);

            expect(classes.value).toEqual(['table-primary']);

            // Remove variants
            variantsRef.value = {};

            // Should now use inline style
            expect(styles.value).toEqual({ backgroundColor: 'primary' });
            expect(classes.value).toEqual([]);
        });

        it('should handle mix of variant and non-variant colors', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
                color: 'white',
            };

            const { styles, classes } = useCellStyles(config, variants);

            // primary is variant, white is not
            expect(styles.value).toEqual({ color: 'white' });
            expect(classes.value).toEqual(['table-primary']);
        });

        it('should handle CSS colors when variants provided', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: '#fff000',
                color: 'rgb(255, 255, 255)',
            };

            const { styles, classes } = useCellStyles(config, variants);

            // Both should be inline styles as they're not variants
            expect(styles.value).toEqual({
                backgroundColor: '#fff000',
                color: 'rgb(255, 255, 255)',
            });
            expect(classes.value).toEqual([]);
        });

        it('should combine variants with other classes and styles', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
                color: 'danger',
                class: 'fw-bold',
                fontSize: '14px',
                monospace: true,
            };

            const { styles, classes, styleAttributes } = useCellStyles(config, variants);

            expect(styles.value).toEqual({ fontSize: '14px' });
            expect(classes.value).toEqual([
                'fw-bold',
                'font-monospace',
                'table-primary',
                'text-danger',
            ]);
            expect(styleAttributes.value.class).toEqual([
                'fw-bold',
                'font-monospace',
                'table-primary',
                'text-danger',
            ]);
            expect(styleAttributes.value.style).toEqual([{ fontSize: '14px' }, undefined]);
        });

        it('should work without variants (backward compatibility)', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
                color: 'danger',
            };

            const { styles, classes } = useCellStyles(config);

            // Without variants, should use inline styles
            expect(styles.value).toEqual({
                backgroundColor: 'primary',
                color: 'danger',
            });
            expect(classes.value).toEqual([]);
        });

        it('should handle undefined variants', () => {
            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
            };

            const { styles, classes } = useCellStyles(config, undefined);

            expect(styles.value).toEqual({ backgroundColor: 'primary' });
            expect(classes.value).toEqual([]);
        });

        it('should handle computed variants', () => {
            const baseVariants = ref<Record<string, string>>(variants);
            const computedVariants = computed(() => baseVariants.value);

            const config: BaseCellConfig = {
                key: 'test',
                background: 'primary',
            };

            const { styles, classes } = useCellStyles(config, computedVariants);

            expect(styles.value).toEqual({});
            expect(classes.value).toEqual(['table-primary']);

            // Change the base variants
            baseVariants.value = {};

            expect(styles.value).toEqual({ backgroundColor: 'primary' });
            expect(classes.value).toEqual([]);
        });
    });

    describe('dataTypes cases', () => {
        it('should pass dataTypes to computeClasses', () => {
            const config = { key: 'test', number: true } as any;
            const dataTypes = { numbers: ['text-end'] };

            const { classes } = useCellStyles(config, undefined, dataTypes);

            expect(classes.value).toEqual(['text-end']);
        });

        it('should handle reactive dataTypes', () => {
            const config = { key: 'test', number: true } as any;
            const dataTypes = ref({ numbers: ['text-end'] });

            const { classes } = useCellStyles(config, undefined, dataTypes);

            expect(classes.value).toEqual(['text-end']);

            dataTypes.value = { numbers: ['text-center'] };

            expect(classes.value).toEqual(['text-center']);
        });
    });
});
