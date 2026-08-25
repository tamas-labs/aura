import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateIcons } from '../icons.schema';
import { defaultConfigLib } from '../../../../lib/default-config.lib';

describe('validateIcons', () => {
    const storeId = 'test-store';
    const fasFilter = ['fas', 'fa-filter'];
    const fasGears = ['fas', 'fa-gears'];

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('Valid cases', () => {
        it('should validate simple string array structure', () => {
            const input = {
                filterable: fasFilter,
                settings: fasGears,
            };

            const result = validateIcons(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate nested sortable object', () => {
            const input = {
                sortable: {
                    up: ['fas', 'fa-caret-up'],
                    down: ['fas', 'fa-caret-down'],
                    both: ['fas', 'fa-sort'],
                },
            };

            const result = validateIcons(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate complex nested structure', () => {
            const input = {
                sortable: {
                    up: ['fas', 'fa-caret-up'],
                    down: ['fas', 'fa-caret-down'],
                    both: ['fas', 'fa-sort'],
                },
                filterable: fasFilter,
                settings: fasGears,
                save: ['fas', 'fa-floppy-disk'],
                close: ['fas', 'fa-circle-left'],
            };

            const result = validateIcons(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate dynamic keys', () => {
            const input = {
                customIcon: ['custom-icon-1', 'custom-icon-2'],
                anotherIcon: ['another-icon'],
            };

            const result = validateIcons(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate long icon names', () => {
            const input = {
                longName: ['very-long-icon-name-with-many-hyphens-and-characters'],
            };

            const result = validateIcons(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate many icons in array', () => {
            const input = {
                multiIcon: Array.from({ length: 50 }, (_, i) => `icon-${i}`),
            };

            const result = validateIcons(input, storeId);

            expect(result).toEqual(input);
        });
    });

    describe('Null and undefined', () => {
        it('should return default config when value is null', () => {
            const result = validateIcons(null, storeId);

            expect(result).toEqual(defaultConfigLib.icons);
        });

        it('should return default config when value is undefined', () => {
            const result = validateIcons(undefined, storeId);

            expect(result).toEqual(defaultConfigLib.icons);
        });
    });

    describe('Invalid cases - empty arrays', () => {
        it('should return default config when array is empty', () => {
            const input = {
                filterable: [],
            };

            const result = validateIcons(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.icons);
        });

        it('should return default config when nested object has empty array', () => {
            const input = {
                sortable: {
                    up: [],
                },
            };

            const result = validateIcons(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.icons);
        });
    });

    describe('Invalid cases - empty strings', () => {
        it('should return default config when array contains empty string', () => {
            const input = {
                filterable: ['', fasFilter[0]],
            };

            const result = validateIcons(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.icons);
        });

        it('should return default config when nested object array contains empty string', () => {
            const input = {
                sortable: {
                    up: [fasGears[0], ''],
                },
            };

            const result = validateIcons(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.icons);
        });
    });

    describe('Invalid cases - wrong types', () => {
        it('should return default config when value is string', () => {
            const result = validateIcons('invalid' as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.icons);
        });

        it('should return default config when value is number', () => {
            const result = validateIcons(123 as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.icons);
        });

        it('should return default config when value is boolean', () => {
            const result = validateIcons(true as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.icons);
        });

        it('should return default config when array value is not string', () => {
            const input = {
                filterable: [123, fasFilter[0]],
            };

            const result = validateIcons(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.icons);
        });

        it('should return default config when array value is object', () => {
            const input = {
                filterable: [{ key: 'value' }, fasFilter[0]],
            };

            const result = validateIcons(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.icons);
        });

        it('should return default config when nested value is not string array', () => {
            const input = {
                sortable: {
                    up: 'not-an-array',
                },
            };

            const result = validateIcons(input as unknown, storeId);

            expect(result).toEqual(defaultConfigLib.icons);
        });
    });

    describe('Edge cases', () => {
        it('should validate empty object', () => {
            const input = {};

            const result = validateIcons(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate object with only nested structure', () => {
            const input = {
                sortable: {
                    up: fasFilter,
                },
            };

            const result = validateIcons(input, storeId);

            expect(result).toEqual(input);
        });

        it('should validate single icon in array', () => {
            const input = {
                singleIcon: ['single-icon'],
            };

            const result = validateIcons(input, storeId);

            expect(result).toEqual(input);
        });
    });
});
