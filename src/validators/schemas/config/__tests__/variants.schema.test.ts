import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateVariants } from '../variants.schema';
import { defaultConfigLib } from '../../../../lib/default-config.lib';

describe('validateVariants', () => {
    const storeId = 'test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('Valid cases', () => {
        it('should validate simple flat structure', () => {
            const input = {
                primary: 'primary',
                destroy: 'danger',
                edit: 'primary',
            };

            const result = validateVariants(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate default config structure', () => {
            const input = {
                primary: 'primary',
                destroy: 'danger',
                edit: 'primary',
                show: 'info',
                switchUser: 'danger',
                danger: 'danger',
                warning: 'warning',
                success: 'success',
                info: 'info',
                secondary: 'secondary',
            };

            const result = validateVariants(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate dynamic keys', () => {
            const input = {
                customVariant: 'custom-class',
                anotherVariant: 'another-class',
            };

            const result = validateVariants(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate long variant names', () => {
            const input = {
                veryLongVariantName: 'very-long-class-name-with-many-hyphens',
            };

            const result = validateVariants(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate single variant', () => {
            const input = {
                single: 'single-class',
            };

            const result = validateVariants(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate many variants', () => {
            const input = Object.fromEntries(
                Array.from({ length: 50 }, (_, i) => [`variant${i}`, `class${i}`])
            );

            const result = validateVariants(input, storeId);

            expect(result).toEqual(input);
        });
    });

    describe('Null and undefined', () => {
        it('should return default config when value is null', () => {
            const result = validateVariants(null, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });

        it('should return default config when value is undefined', () => {
            const result = validateVariants(undefined, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });
    });

    describe('Invalid cases - empty strings', () => {
        it('should return default config when key is empty string', () => {
            const input = {
                '': 'value',
            };

            const result = validateVariants(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });

        it('should return default config when value is empty string', () => {
            const input = {
                primary: '',
            };

            const result = validateVariants(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });

        it('should return default config when both key and value are empty', () => {
            const input = {
                '': '',
            };

            const result = validateVariants(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });
    });

    describe('Invalid cases - wrong types', () => {
        it('should return default config when value is string', () => {
            const result = validateVariants('invalid' as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });

        it('should return default config when value is number', () => {
            const result = validateVariants(123 as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });

        it('should return default config when value is boolean', () => {
            const result = validateVariants(true as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });

        it('should return default config when value is array', () => {
            const result = validateVariants(['primary', 'danger'] as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });

        it('should return default config when object value is not string', () => {
            const input = {
                primary: 123,
            };

            const result = validateVariants(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });

        it('should return default config when object value is boolean', () => {
            const input = {
                primary: true,
            };

            const result = validateVariants(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });

        it('should return default config when object value is array', () => {
            const input = {
                primary: ['class1', 'class2'],
            };

            const result = validateVariants(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });

        it('should return default config when object value is nested object', () => {
            const input = {
                primary: {
                    nested: 'value',
                },
            };

            const result = validateVariants(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.variants);
        });
    });

    describe('Edge cases', () => {
        it('should validate empty object', () => {
            const input = {};

            const result = validateVariants(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate object with whitespace in values', () => {
            const input = {
                primary: 'primary danger',
                secondary: 'btn btn-secondary',
            };

            const result = validateVariants(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate object with special characters', () => {
            const input = {
                'variant-1': 'class-1',
                variant_2: 'class_2',
                'variant.3': 'class.3',
            };

            const result = validateVariants(input, storeId);

            expect(result).toEqual(input);
        });
    });
});
