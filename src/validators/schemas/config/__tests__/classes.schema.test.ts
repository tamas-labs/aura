import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateClasses } from '../classes.schema';
import { defaultConfigLib } from '../../../../lib/default-config.lib';

describe('validateClasses', () => {
    const storeId = 'test-store';
    const tableStripedClass = 'table-striped';
    const textEndClass = 'text-end';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('Valid cases', () => {
        it('should validate simple string array structure', () => {
            const input = {
                table: [tableStripedClass, 'table-hover'],
                icon: ['mx-2'],
            };

            const result = validateClasses(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate nested dataTypes object', () => {
            const input = {
                table: [tableStripedClass],
                dataTypes: {
                    numbers: [textEndClass],
                    currency: [textEndClass],
                },
            };

            const result = validateClasses(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate complex nested structure', () => {
            const input = {
                table: [tableStripedClass, 'table-hover', 'mt-2', 'mb-4'],
                icon: ['mx-2'],
                button: ['mx-1'],
                link: ['mx-1'],
                modal: ['fade', 'show'],
                dataTypes: {
                    numbers: [textEndClass],
                    currency: [textEndClass],
                    unit: [textEndClass],
                    percent: [textEndClass, 'fw-bold'],
                },
            };

            const result = validateClasses(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate dynamic keys', () => {
            const input = {
                customKey: ['custom-class-1', 'custom-class-2'],
                anotherKey: ['another-class'],
            };

            const result = validateClasses(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate long class names', () => {
            const input = {
                table: ['very-long-class-name-with-many-hyphens-and-characters'],
            };

            const result = validateClasses(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate many classes in array', () => {
            const input = {
                table: Array.from({ length: 100 }, (_, i) => `class-${i}`),
            };

            const result = validateClasses(input, storeId);

            expect(result).toEqual(input);
        });
    });

    describe('Null and undefined', () => {
        it('should return default config when value is null', () => {
            const result = validateClasses(null, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });

        it('should return default config when value is undefined', () => {
            const result = validateClasses(undefined, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });
    });

    describe('Invalid cases - empty arrays', () => {
        it('should return default config when array is empty', () => {
            const input = {
                table: [],
            };

            const result = validateClasses(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });

        it('should return default config when nested object has empty array', () => {
            const input = {
                dataTypes: {
                    numbers: [],
                },
            };

            const result = validateClasses(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });
    });

    describe('Invalid cases - empty strings', () => {
        it('should return default config when array contains empty string', () => {
            const input = {
                table: ['', tableStripedClass],
            };

            const result = validateClasses(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });

        it('should return default config when nested object array contains empty string', () => {
            const input = {
                dataTypes: {
                    numbers: [textEndClass, ''],
                },
            };

            const result = validateClasses(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });
    });

    describe('Invalid cases - dataTypes validation', () => {
        it('should return default config when dataTypes is a string array', () => {
            const input = {
                dataTypes: ['not-an-object'],
            };

            const result = validateClasses(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });

        it('should return default config when dataTypes is null', () => {
            const input = {
                dataTypes: null,
            };

            const result = validateClasses(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });

        it('should return default config when dataTypes is string', () => {
            const input = {
                dataTypes: 'invalid',
            };

            const result = validateClasses(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });
    });

    describe('Invalid cases - wrong types', () => {
        it('should return default config when value is string', () => {
            const result = validateClasses('invalid' as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });

        it('should return default config when value is number', () => {
            const result = validateClasses(123 as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });

        it('should return default config when value is boolean', () => {
            const result = validateClasses(true as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });

        it('should return default config when array value is not string', () => {
            const input = {
                table: [123, 'table-striped'],
            };

            const result = validateClasses(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });

        it('should return default config when array value is object', () => {
            const input = {
                table: [{ key: 'value' }, tableStripedClass],
            };

            const result = validateClasses(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });

        it('should return default config when nested value is not string array', () => {
            const input = {
                dataTypes: {
                    numbers: 'not-an-array',
                },
            };

            const result = validateClasses(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.classes);
        });
    });

    describe('Edge cases', () => {
        it('should validate empty object', () => {
            const input = {};

            const result = validateClasses(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate object with only dataTypes', () => {
            const input = {
                dataTypes: {
                    numbers: [textEndClass],
                },
            };

            const result = validateClasses(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate single class in array', () => {
            const input = {
                table: ['single-class'],
            };

            const result = validateClasses(input, storeId);

            expect(result).toEqual(input);
        });
    });
});
