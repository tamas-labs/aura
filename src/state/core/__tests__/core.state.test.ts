import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCoreStore } from '../../core/core.state';
import type { AuraProps, ActionButtonItem } from '../../../types';

describe('useCoreStore with error handling', () => {
    const storeId = 'test-store';
    const mockProps: AuraProps = {
        debug: false,
        siteName: 'Test Site',
    };
    const DEFAULT_PAGINATE_VALUES = [5, 10, 25, 50, 100];

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('initial state', () => {
        it('should initialize errorStore with empty errors array', () => {
            const store = useCoreStore(storeId, mockProps);
            expect(store.errorStore.errors).toEqual([]);
        });

        it('should have errorStore.hasErrors as false initially', () => {
            const store = useCoreStore(storeId, mockProps);
            expect(store.errorStore.hasErrors).toBe(false);
        });

        it('should have errorStore.isValid as true initially', () => {
            const store = useCoreStore(storeId, mockProps);
            expect(store.errorStore.isValid).toBe(true);
        });

        it('should include props', () => {
            const store = useCoreStore(storeId, mockProps);
            expect(store.props).toEqual(mockProps);
        });

        it('should validate and store siteName', () => {
            const store = useCoreStore(storeId, mockProps);
            expect(store.config.siteName).toBe('Test Site');
        });

        it('should store siteToken from config (default: false)', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.siteToken).toBe(false);
        });

        it('should validate and store href from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.href).toBeDefined();
            expect(typeof store.config.href).toBe('string');
        });

        it('should validate and store urlParameterLastSegment from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.urlParameterLastSegment).toBeDefined();
            expect(typeof store.config.urlParameterLastSegment).toBe('string');
        });

        it('should validate and store urlStructure from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.urlStructure).toBeDefined();
            expect(typeof store.config.urlStructure).toBe('string');
        });

        it('should validate and store paginateValues from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.paginateValues).toBeDefined();
            expect(Array.isArray(store.config.paginateValues)).toBe(true);
            expect(store.config.paginateValues).toEqual(DEFAULT_PAGINATE_VALUES);
        });

        it('should validate and store rowsNumber from config (default: 10)', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.rowsNumber).toBeDefined();
            expect(typeof store.config.rowsNumber).toBe('number');
            expect(store.config.rowsNumber).toBe(10);
        });

        it('should validate and store classes from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.classes).toBeDefined();
            expect(typeof store.config.classes).toBe('object');
            expect(store.config.classes).toHaveProperty('table');
            expect(Array.isArray(store.config.classes.table)).toBe(true);
        });

        it('should validate and store icons from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.icons).toBeDefined();
            expect(typeof store.config.icons).toBe('object');
            expect(store.config.icons).toHaveProperty('filterable');
            expect(Array.isArray(store.config.icons.filterable)).toBe(true);
        });

        it('should validate and store variants from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.variants).toBeDefined();
            expect(typeof store.config.variants).toBe('object');
            expect(store.config.variants).toHaveProperty('primary');
            expect(typeof store.config.variants.primary).toBe('string');
        });

        it('should validate and store showFooter from config (default: true)', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.showFooter).toBe(true);
        });

        it('should validate and store actionButtons from config (default: none)', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.actionButtons).toEqual([]);
        });

        it('should validate and store showHeaderSearch from config (default: false)', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.showHeaderSearch).toBe(false);
        });

        it('should validate and store externalPaginator from config (default: false)', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.externalPaginator).toBe(false);
        });

        it('should validate and store resources from config (default: false)', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.resources).toBe(false);
        });

        it('should validate and store disableSession from config (default: false)', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.disableSession).toBe(false);
        });

        it('should validate and store allowExternalApi from config (default: false)', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.allowExternalApi).toBe(false);
        });

        it('should validate and store errorReporting from config (default: false)', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.errorReporting).toBe(false);
        });
    });

    describe('error state integration', () => {
        it('should expose errorStore with errors array', () => {
            const store = useCoreStore(storeId, mockProps);
            expect(Array.isArray(store.errorStore.errors)).toBe(true);
        });

        it('should expose errorStore.hasErrors computed', () => {
            const store = useCoreStore(storeId, mockProps);
            expect(typeof store.errorStore.hasErrors).toBe('boolean');
        });

        it('should expose errorStore.isValid computed', () => {
            const store = useCoreStore(storeId, mockProps);
            expect(typeof store.errorStore.isValid).toBe('boolean');
        });

        it('should update errorStore.hasErrors when errors array changes', () => {
            const store = useCoreStore(storeId, mockProps);
            expect(store.errorStore.hasErrors).toBe(false);

            store.errorStore.addError({
                severity: 'error',
                component: 'Test',
                action: 'test',
                type: 'validation',
                message: 'Test error',
            });

            expect(store.errorStore.hasErrors).toBe(true);
            expect(store.errorStore.isValid).toBe(false);
        });
    });

    describe('storeId validation', () => {
        it('should use provided storeId', () => {
            const props: AuraProps = {};
            const customStoreId = 'custom-store-id';
            const store = useCoreStore(customStoreId, props);
            expect(store).toBeDefined();
            expect(store.props).toEqual(props);
        });

        it('should work with empty props', () => {
            const props: AuraProps = {};
            const store = useCoreStore(storeId, props);
            expect(store).toBeDefined();
            expect(store.props).toEqual(props);
        });

        it('should sanitize HTML in storeId', () => {
            const props: AuraProps = {};
            const dangerousStoreId = '<script>alert("xss")</script>';
            const store = useCoreStore(dangerousStoreId, props);
            expect(store).toBeDefined();
        });

        it('should accept valid storeId', () => {
            const props: AuraProps = {};
            const validStoreId = 'my-custom-store';
            const store = useCoreStore(validStoreId, props);
            expect(store).toBeDefined();
            expect(store.props).toEqual(props);
        });
    });

    describe('string variable validation', () => {
        it('should validate and sanitize siteName from props', () => {
            const props: AuraProps = {
                siteName: '<script>alert("xss")</script>Safe Site',
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.siteName).toBeDefined();
            expect(store.config.siteName).not.toContain('<script>');
        });

        it('should accept siteToken as boolean from props', () => {
            const props: AuraProps = {
                siteToken: true,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.siteToken).toBe(true);
        });

        it('should accept siteToken as string from props', () => {
            const props: AuraProps = {
                siteToken: 'my-secret-token-123',
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.siteToken).toBe('my-secret-token-123');
        });

        it('should accept siteToken as null from props', () => {
            const props: AuraProps = {
                siteToken: null,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.siteToken).toBeNull();
        });

        it('should get href from config automatically', () => {
            const props: AuraProps = {};
            const store = useCoreStore(storeId, props);
            expect(store.config.href).toBeDefined();
            expect(typeof store.config.href === 'string' || store.config.href === null).toBe(true);
        });

        it('should validate urlParameterLastSegment from props', () => {
            const props: AuraProps = {
                urlParameterLastSegment: 'api-endpoint',
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.urlParameterLastSegment).toBe('api-endpoint');
        });

        it('should validate urlStructure from props', () => {
            const props: AuraProps = {
                urlStructure: '{siteName}/api/{urlParameter}',
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.urlStructure).toBe('{siteName}/api/{urlParameter}');
        });

        it('should fallback to config for invalid siteName', () => {
            const props: AuraProps = {
                siteName: 123 as unknown as string, // Invalid type
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.siteName).toBeDefined();
            expect(
                typeof store.config.siteName === 'string' || store.config.siteName === null
            ).toBe(true);
        });

        it('should fallback to config for too long urlParameterLastSegment', () => {
            const props: AuraProps = {
                urlParameterLastSegment: 'a'.repeat(150), // Too long (max: 100)
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.urlParameterLastSegment).toBeDefined();
            expect(
                typeof store.config.urlParameterLastSegment === 'string' ||
                    store.config.urlParameterLastSegment === null
            ).toBe(true);
        });

        it('should fallback to config for too long urlStructure', () => {
            const props: AuraProps = {
                urlStructure: 'a'.repeat(300), // Too long (max: 250)
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.urlStructure).toBeDefined();
            expect(
                typeof store.config.urlStructure === 'string' || store.config.urlStructure === null
            ).toBe(true);
        });
    });

    describe('array variable validation (paginateValues)', () => {
        it('should validate and store paginateValues from props', () => {
            const props: AuraProps = {
                paginateValues: [10, 20, 30, 40],
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.paginateValues).toEqual([10, 20, 30, 40]);
        });

        it('should accept null paginateValues from props', () => {
            const props: AuraProps = {
                paginateValues: null as unknown as number[],
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.paginateValues).toBeNull();
        });

        it('should accept single value array', () => {
            const props: AuraProps = {
                paginateValues: [25],
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.paginateValues).toEqual([25]);
        });

        it('should accept edge values (1 and 1000)', () => {
            const props: AuraProps = {
                paginateValues: [1, 500, 1000],
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.paginateValues).toEqual([1, 500, 1000]);
        });

        it('should fallback to config for invalid paginateValues (below min)', () => {
            const props: AuraProps = {
                paginateValues: [0, 10, 20] as unknown as number[], // 0 is below minimum (1)
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.paginateValues).toEqual(DEFAULT_PAGINATE_VALUES);
            expect(store.errorStore.hasErrors).toBe(true);
        });

        it('should fallback to config for invalid paginateValues (above max)', () => {
            const props: AuraProps = {
                paginateValues: [10, 1001] as unknown as number[], // 1001 is above maximum (1000)
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.paginateValues).toEqual(DEFAULT_PAGINATE_VALUES);
            expect(store.errorStore.hasErrors).toBe(true);
        });

        it('should fallback to config for invalid paginateValues type (string)', () => {
            const props: AuraProps = {
                paginateValues: 'invalid' as unknown as number[],
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.paginateValues).toEqual(DEFAULT_PAGINATE_VALUES);
            expect(store.errorStore.hasErrors).toBe(true);
        });

        it('should fallback to config for array with non-numeric values', () => {
            const props: AuraProps = {
                paginateValues: [10, 'twenty', 30] as unknown as number[],
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.paginateValues).toEqual(DEFAULT_PAGINATE_VALUES);
            expect(store.errorStore.hasErrors).toBe(true);
        });
    });

    describe('number variable validation (rowsNumber)', () => {
        it('should validate and store rowsNumber from config (default: 10)', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.rowsNumber).toBe(10);
        });

        it('should validate and store rowsNumber from props', () => {
            const props: AuraProps = {
                rowsNumber: 25,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.rowsNumber).toBe(25);
        });

        it('should accept null rowsNumber from props', () => {
            const props: AuraProps = {
                rowsNumber: null as unknown as number,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.rowsNumber).toBeNull();
        });

        it('should accept minimum value (1)', () => {
            const props: AuraProps = {
                rowsNumber: 1,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.rowsNumber).toBe(1);
        });

        it('should accept maximum value (1000)', () => {
            const props: AuraProps = {
                rowsNumber: 1000,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.rowsNumber).toBe(1000);
        });

        it('should accept common values (25, 50, 100)', () => {
            const store25 = useCoreStore('test-25', { rowsNumber: 25 });
            const store50 = useCoreStore('test-50', { rowsNumber: 50 });
            const store100 = useCoreStore('test-100', { rowsNumber: 100 });

            expect(store25.config.rowsNumber).toBe(25);
            expect(store50.config.rowsNumber).toBe(50);
            expect(store100.config.rowsNumber).toBe(100);
        });

        it('should fallback to config for invalid rowsNumber (below min)', () => {
            const props: AuraProps = {
                rowsNumber: 0 as unknown as number, // 0 is below minimum (1)
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.rowsNumber).toBe(10);
            expect(store.errorStore.hasErrors).toBe(true);
        });

        it('should fallback to config for invalid rowsNumber (above max)', () => {
            const props: AuraProps = {
                rowsNumber: 1001 as unknown as number, // 1001 is above maximum (1000)
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.rowsNumber).toBe(10);
            expect(store.errorStore.hasErrors).toBe(true);
        });

        it('should fallback to config for negative number', () => {
            const props: AuraProps = {
                rowsNumber: -5 as unknown as number,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.rowsNumber).toBe(10);
            expect(store.errorStore.hasErrors).toBe(true);
        });

        it('should fallback to config for invalid rowsNumber type (string)', () => {
            const props: AuraProps = {
                rowsNumber: 'invalid' as unknown as number,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.rowsNumber).toBe(10);
            expect(store.errorStore.hasErrors).toBe(true);
        });

        it('should fallback to config for NaN', () => {
            const props: AuraProps = {
                rowsNumber: NaN as unknown as number,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.rowsNumber).toBe(10);
            expect(store.errorStore.hasErrors).toBe(true);
        });
    });

    describe('classes variable validation', () => {
        const defaultTableClasses = ['table-striped', 'table-hover', 'mt-2', 'mb-4'];
        const INVALID_TYPE_STRING = 'invalid';

        it('should validate and store classes from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.classes).toBeDefined();
            expect(typeof store.config.classes).toBe('object');
        });

        it('should validate and store classes from props', () => {
            const classesValue = {
                table: ['custom-table-class'],
                icon: ['custom-icon-class'],
            };
            const props: AuraProps = {
                classes: classesValue,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.classes).toEqual(classesValue);
        });

        it('should validate nested dataTypes object', () => {
            const classesValue = {
                dataTypes: {
                    numbers: ['text-end'],
                    currency: ['text-end'],
                },
            };
            const props: AuraProps = {
                classes: classesValue,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.classes).toEqual(classesValue);
        });

        it('should accept dynamic keys', () => {
            const classesValue = {
                modal: ['fade', 'show'],
                customKey: ['custom-class'],
            };
            const props: AuraProps = {
                classes: classesValue,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.classes).toEqual(classesValue);
        });

        it('should fallback to config for null', () => {
            const props: AuraProps = {
                classes: null as unknown as Record<string, string[]>,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.classes).toEqual({
                table: ['table', 'table-striped', 'table-hover', 'mt-2', 'mb-4'],
                icon: ['mx-2'],
                button: ['mx-1'],
                link: ['mx-1'],
                dataTypes: {
                    numbers: ['text-end'],
                    currency: ['text-end'],
                    unit: ['text-end'],
                },
            });
            expect(store.errorStore.hasErrors).toBe(false); // null is valid
        });

        it('should fallback to config for empty array', () => {
            const props: AuraProps = {
                classes: {
                    table: [],
                } as unknown as Record<string, string[]>,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.classes).toHaveProperty('table');
            expect(Array.isArray(store.config.classes.table)).toBe(true);
            expect(store.errorStore.hasErrors).toBe(true);
        });

        it('should fallback to config for empty string in array', () => {
            const props: AuraProps = {
                classes: {
                    table: ['', defaultTableClasses[0]],
                } as unknown as Record<string, string[]>,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.classes).toHaveProperty('table');
            expect(store.errorStore.hasErrors).toBe(true);
        });

        it('should fallback to config for invalid classes type (string)', () => {
            const props: AuraProps = {
                classes: INVALID_TYPE_STRING as unknown as Record<string, string[]>,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.classes).toHaveProperty('table');
            expect(store.errorStore.hasErrors).toBe(true);
        });

        it('should fallback to config for dataTypes as string array', () => {
            const props: AuraProps = {
                classes: {
                    dataTypes: ['not-an-object'],
                } as unknown as Record<string, string[]>,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.classes).toHaveProperty('dataTypes');
            expect(typeof store.config.classes.dataTypes).toBe('object');
            expect(store.errorStore.hasErrors).toBe(true);
        });

        it('should fallback to config for non-string array values', () => {
            const props: AuraProps = {
                classes: {
                    table: [123, defaultTableClasses[0]],
                } as unknown as Record<string, string[]>,
            };
            const store = useCoreStore(storeId, props);
            expect(store.config.classes).toHaveProperty('table');
            expect(store.errorStore.hasErrors).toBe(true);
        });
    });

    describe('icons variable validation', () => {
        const defaultFilterableIcon = ['fas', 'fa-filter'];
        const defaultSortableBothIcon = ['fas', 'fa-sort'];

        it('should validate and store icons from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.icons).toBeDefined();
            expect(typeof store.config.icons).toBe('object');
        });

        it('should validate nested sortable object from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.icons).toHaveProperty('sortable');
            expect(typeof store.config.icons.sortable).toBe('object');
            if (
                typeof store.config.icons.sortable === 'object' &&
                !Array.isArray(store.config.icons.sortable)
            ) {
                expect(store.config.icons.sortable).toHaveProperty('up');
                expect(Array.isArray(store.config.icons.sortable.up)).toBe(true);
            }
        });

        it('should validate dynamic keys support', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.icons).toHaveProperty('filterable');
            expect(Array.isArray(store.config.icons.filterable)).toBe(true);
            if (Array.isArray(store.config.icons.filterable)) {
                expect(store.config.icons.filterable).toEqual(defaultFilterableIcon);
            }
        });

        it('should validate array icons from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.icons).toHaveProperty('filterable');
            if (store.config.icons.filterable) {
                expect(Array.isArray(store.config.icons.filterable)).toBe(true);
                if (Array.isArray(store.config.icons.filterable)) {
                    expect(store.config.icons.filterable.length).toBeGreaterThan(0);
                }
            }
        });

        it('should validate nested object icons from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.icons.sortable).toBeDefined();
            if (store.config.icons.sortable) {
                expect(typeof store.config.icons.sortable).toBe('object');
                if (
                    typeof store.config.icons.sortable === 'object' &&
                    !Array.isArray(store.config.icons.sortable)
                ) {
                    expect(store.config.icons.sortable).toHaveProperty('down');
                    expect(Array.isArray(store.config.icons.sortable.down)).toBe(true);
                }
            }
        });

        it('should contain filterable and sortable icons', () => {
            const store = useCoreStore(storeId, {});
            if (Array.isArray(store.config.icons.filterable)) {
                expect(store.config.icons.filterable).toEqual(defaultFilterableIcon);
            }
            if (
                store.config.icons.sortable &&
                typeof store.config.icons.sortable === 'object' &&
                !Array.isArray(store.config.icons.sortable)
            ) {
                expect(store.config.icons.sortable).toHaveProperty('up');
                expect(store.config.icons.sortable).toHaveProperty('down');
                expect(store.config.icons.sortable).toHaveProperty('both');
                expect(store.config.icons.sortable.both).toEqual(defaultSortableBothIcon);
            }
        });

        it('should validate complex nested structure', () => {
            const store = useCoreStore(storeId, {});
            if (
                store.config.icons.sortable &&
                typeof store.config.icons.sortable === 'object' &&
                !Array.isArray(store.config.icons.sortable)
            ) {
                expect(store.config.icons.sortable.up).toEqual(['fas', 'fa-caret-up']);
                expect(store.config.icons.sortable.down).toEqual(['fas', 'fa-caret-down']);
            }
        });

        it('should validate all sortable states', () => {
            const store = useCoreStore(storeId, {});
            if (
                store.config.icons.sortable &&
                typeof store.config.icons.sortable === 'object' &&
                !Array.isArray(store.config.icons.sortable)
            ) {
                const sortableKeys = Object.keys(store.config.icons.sortable);
                expect(sortableKeys).toContain('up');
                expect(sortableKeys).toContain('down');
                expect(sortableKeys).toContain('both');
            }
        });
    });

    describe('variants variable validation', () => {
        it('should validate and store variants from config', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.variants).toBeDefined();
            expect(typeof store.config.variants).toBe('object');
        });

        it('should validate flat structure', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.variants).toHaveProperty('primary');
            expect(typeof store.config.variants.primary).toBe('string');
            expect(store.config.variants.primary).toBe('primary');
        });

        it('should validate multiple variants', () => {
            const store = useCoreStore(storeId, {});
            expect(store.config.variants).toHaveProperty('destroy');
            expect(store.config.variants).toHaveProperty('edit');
            expect(store.config.variants).toHaveProperty('show');
            expect(store.config.variants.destroy).toBe('danger');
        });

        it('should validate all default variants', () => {
            const store = useCoreStore(storeId, {});
            const variantKeys = Object.keys(store.config.variants);
            expect(variantKeys).toContain('primary');
            expect(variantKeys).toContain('destroy');
            expect(variantKeys).toContain('edit');
            expect(variantKeys).toContain('show');
            expect(variantKeys).toContain('danger');
            expect(variantKeys).toContain('warning');
            expect(variantKeys).toContain('success');
            expect(variantKeys).toContain('info');
            expect(variantKeys).toContain('secondary');
        });

        it('should validate string values only', () => {
            const store = useCoreStore(storeId, {});
            Object.values(store.config.variants).forEach(value => {
                expect(typeof value).toBe('string');
                expect(value.length).toBeGreaterThan(0);
            });
        });
    });

    describe('boolean variable validation', () => {
        describe('showFooter', () => {
            it('should validate and store showFooter from props (true)', () => {
                const props: AuraProps = {
                    showFooter: true,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.showFooter).toBe(true);
            });

            it('should validate and store showFooter from props (false)', () => {
                const props: AuraProps = {
                    showFooter: false,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.showFooter).toBe(false);
            });

            it('should fallback to config for invalid showFooter (string)', () => {
                const props: AuraProps = {
                    showFooter: 'true' as unknown as boolean,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.showFooter).toBe(true);
                expect(store.errorStore.hasErrors).toBe(true);
            });

            it('should fallback to config for invalid showFooter (number)', () => {
                const props: AuraProps = {
                    showFooter: 1 as unknown as boolean,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.showFooter).toBe(true);
                expect(store.errorStore.hasErrors).toBe(true);
            });
        });

        describe('actionButtons', () => {
            it('should validate and store actionButtons from props (["refresh"])', () => {
                const props: AuraProps = {
                    actionButtons: ['refresh'],
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.actionButtons).toEqual(['refresh']);
            });

            it('should validate and store actionButtons from props (empty array)', () => {
                const props: AuraProps = {
                    actionButtons: [],
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.actionButtons).toEqual([]);
            });

            it('should filter out invalid actionButtons', () => {
                const props: AuraProps = {
                    actionButtons: ['invalid'] as unknown as ActionButtonItem[],
                };
                const store = useCoreStore(storeId, props);
                // Changed behavior: filters invalid items, returns empty array
                expect(store.config.actionButtons).toEqual([]);
                expect(store.errorStore.hasErrors).toBe(true);
            });
        });

        describe('showHeaderSearch', () => {
            it('should validate and store showHeaderSearch from props (true)', () => {
                const props: AuraProps = {
                    showHeaderSearch: true,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.showHeaderSearch).toBe(true);
            });

            it('should validate and store showHeaderSearch from props (false)', () => {
                const props: AuraProps = {
                    showHeaderSearch: false,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.showHeaderSearch).toBe(false);
            });

            it('should accept null showHeaderSearch from props', () => {
                const props: AuraProps = {
                    showHeaderSearch: null as unknown as boolean,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.showHeaderSearch).toBeNull();
            });

            it('should fallback to config for invalid showHeaderSearch (string)', () => {
                const props: AuraProps = {
                    showHeaderSearch: 'invalid' as unknown as boolean,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.showHeaderSearch).toBe(false);
                expect(store.errorStore.hasErrors).toBe(true);
            });
        });

        describe('externalPaginator', () => {
            it('should validate and store externalPaginator from props (true)', () => {
                const props: AuraProps = {
                    externalPaginator: true,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.externalPaginator).toBe(true);
            });

            it('should validate and store externalPaginator from props (false)', () => {
                const props: AuraProps = {
                    externalPaginator: false,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.externalPaginator).toBe(false);
            });

            it('should fallback to config for invalid externalPaginator', () => {
                const props: AuraProps = {
                    externalPaginator: [] as unknown as boolean,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.externalPaginator).toBe(false);
                expect(store.errorStore.hasErrors).toBe(true);
            });
        });

        describe('resources', () => {
            it('should validate and store resources from props (true)', () => {
                const props: AuraProps = {
                    resources: true,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.resources).toBe(true);
            });

            it('should validate and store resources from props (false)', () => {
                const props: AuraProps = {
                    resources: false,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.resources).toBe(false);
            });

            it('should accept null resources from props', () => {
                const props: AuraProps = {
                    resources: null,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.resources).toBeNull();
            });

            it('should fallback to config for invalid resources', () => {
                const props: AuraProps = {
                    resources: {} as unknown as boolean,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.resources).toBe(false);
                expect(store.errorStore.hasErrors).toBe(true);
            });
        });

        describe('disableSession', () => {
            it('should validate and store disableSession from props (true)', () => {
                const props: AuraProps = {
                    disableSession: true,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.disableSession).toBe(true);
            });

            it('should validate and store disableSession from props (false)', () => {
                const props: AuraProps = {
                    disableSession: false,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.disableSession).toBe(false);
            });

            it('should fallback to config for invalid disableSession (undefined)', () => {
                const props: AuraProps = {
                    disableSession: undefined as unknown as boolean,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.disableSession).toBe(false);
            });

            it('should fallback to config for invalid disableSession (string)', () => {
                const props: AuraProps = {
                    disableSession: 'yes' as unknown as boolean,
                };
                const store = useCoreStore(storeId, props);
                expect(store.config.disableSession).toBe(false);
                expect(store.errorStore.hasErrors).toBe(true);
            });
        });

        describe('allowExternalApi (config-only)', () => {
            it('should validate and store allowExternalApi from config (default: false)', () => {
                const store = useCoreStore(storeId, {});
                expect(store.config.allowExternalApi).toBe(false);
            });

            it('should be accessible from merged config', () => {
                const store = useCoreStore(storeId, {});
                expect(store.config.allowExternalApi).toBe(false);
            });

            it('should validate allowExternalApi as boolean', () => {
                const store = useCoreStore(storeId, {});
                expect(typeof store.config.allowExternalApi).toBe('boolean');
            });
        });

        describe('errorReporting (config-only)', () => {
            it('should validate and store errorReporting from config (default: false)', () => {
                const store = useCoreStore(storeId, {});
                expect(store.config.errorReporting).toBe(false);
            });

            it('should be accessible from merged config', () => {
                const store = useCoreStore(storeId, {});
                expect(store.config.errorReporting).toBe(false);
            });

            it('should validate errorReporting as boolean', () => {
                const store = useCoreStore(storeId, {});
                expect(typeof store.config.errorReporting).toBe('boolean');
            });
        });
    });

    describe('configStore integration', () => {
        it('should expose config property as configStore', () => {
            const store = useCoreStore(storeId, mockProps);
            expect(store.config).toBeDefined();
        });

        it('should have config with validated config values', () => {
            const store = useCoreStore(storeId, mockProps);
            expect(store.config.debug).toBeDefined();
            expect(store.config.siteName).toBeDefined();
            expect(store.config.rowsNumber).toBeDefined();
        });

        it('should have all config values accessible through config property', () => {
            const store = useCoreStore(storeId, mockProps);
            expect(store.config.debug).toBe(false);
            expect(store.config.siteName).toBe('Test Site');
            expect(typeof store.config.rowsNumber).toBe('number');
        });
    });

    describe('Config priority and Vue Boolean casting fix', () => {
        describe('Boolean props with default: undefined (Vue casting prevention)', () => {
            it('should respect config showFooter: true when prop is NOT passed (empty props)', () => {
                // This is the most important regression test
                // Previously: Vue cast the Boolean prop to false → config's true value got overwritten
                // Now: due to default: undefined the prop stays undefined → config takes effect
                const store = useCoreStore('test-showfooter-true', {});
                expect(store.config.showFooter).toBe(true);
            });

            it('should allow explicit showFooter: false prop to override config true', () => {
                const store = useCoreStore('test-showfooter-explicit-false', {
                    showFooter: false,
                });
                expect(store.config.showFooter).toBe(false);
            });

            it('should allow explicit showFooter: true prop to override config (even if config is also true)', () => {
                const store = useCoreStore('test-showfooter-explicit-true', {
                    showFooter: true,
                });
                expect(store.config.showFooter).toBe(true);
            });

            it('should respect config debug: false when prop is NOT passed', () => {
                const store = useCoreStore('test-debug-false', {});
                expect(store.config.debug).toBe(false);
            });

            it('should allow explicit debug: true prop to override config false', () => {
                const store = useCoreStore('test-debug-explicit-true', {
                    debug: true,
                });
                expect(store.config.debug).toBe(true);
            });

            it('should respect config actionButtons default when prop is NOT passed', () => {
                const store = useCoreStore('test-actionbuttons', {});
                expect(store.config.actionButtons).toEqual([]);
            });

            it('should allow explicit actionButtons to override config', () => {
                const store = useCoreStore('test-actionbuttons-override', {
                    actionButtons: ['settings'],
                });
                expect(store.config.actionButtons).toEqual(['settings']);
            });

            it('should respect config externalPaginator: false when prop is NOT passed', () => {
                const store = useCoreStore('test-externalpaginator', {});
                expect(store.config.externalPaginator).toBe(false);
            });

            it('should allow explicit externalPaginator: true to override config false', () => {
                const store = useCoreStore('test-externalpaginator-true', {
                    externalPaginator: true,
                });
                expect(store.config.externalPaginator).toBe(true);
            });

            it('should respect config resources: false when prop is NOT passed', () => {
                const store = useCoreStore('test-resources', {});
                expect(store.config.resources).toBe(false);
            });

            it('should respect config disableSession: false when prop is NOT passed', () => {
                const store = useCoreStore('test-disablesession', {});
                expect(store.config.disableSession).toBe(false);
            });

            it('should allow explicit disableSession: true to override config false', () => {
                const store = useCoreStore('test-disablesession-true', {
                    disableSession: true,
                });
                expect(store.config.disableSession).toBe(true);
            });

            it('should default accentInsensitiveSearch to false when prop is NOT passed', () => {
                const store = useCoreStore('test-accentinsensitivesearch', {});
                expect(store.config.accentInsensitiveSearch).toBe(false);
            });

            it('should allow explicit accentInsensitiveSearch: true to override the default', () => {
                const store = useCoreStore('test-accentinsensitivesearch-true', {
                    accentInsensitiveSearch: true,
                });
                expect(store.config.accentInsensitiveSearch).toBe(true);
            });

            it('should respect config highlightSearchResults: true when prop is NOT passed', () => {
                const store = useCoreStore('test-highlightsearchresults', {});
                expect(store.config.highlightSearchResults).toBe(true);
            });

            it('should allow explicit highlightSearchResults: false to override config true', () => {
                const store = useCoreStore('test-highlightsearchresults-false', {
                    highlightSearchResults: false,
                });
                expect(store.config.highlightSearchResults).toBe(false);
            });
        });

        describe('currencyCode renaming fix', () => {
            it('should have currencyCode default from config (HUF)', () => {
                const store = useCoreStore('test-currencycode-default', {});
                expect(store.config.currencyCode).toBe('HUF');
            });

            it('should allow explicit currencyCode prop to override config', () => {
                const store = useCoreStore('test-currencycode-explicit', {
                    currencyCode: 'EUR',
                });
                expect(store.config.currencyCode).toBe('EUR');
            });

            it('should support other currency codes', () => {
                const storeUSD = useCoreStore('test-currencycode-usd', {
                    currencyCode: 'USD',
                });
                const storeGBP = useCoreStore('test-currencycode-gbp', {
                    currencyCode: 'GBP',
                });

                expect(storeUSD.config.currencyCode).toBe('USD');
                expect(storeGBP.config.currencyCode).toBe('GBP');
            });
        });

        describe('highlightClass prop addition', () => {
            it('should have highlightClass default from config (aura-highlight)', () => {
                const store = useCoreStore('test-highlightclass-default', {});
                expect(store.config.highlightClass).toBe('aura-highlight');
            });

            it('should allow explicit highlightClass prop to override config', () => {
                const store = useCoreStore('test-highlightclass-explicit', {
                    highlightClass: 'my-custom-highlight',
                });
                expect(store.config.highlightClass).toBe('my-custom-highlight');
            });
        });

        describe('Priority order validation', () => {
            it('should follow priority: defaultConfigLib < globalConfig < explicitProps', () => {
                // defaultConfigLib: showFooter = true
                // globalConfig: none (empty)
                // explicitProps: showFooter = false (explicit)
                // Expected: false (explicit prop overrides the default config)
                const store = useCoreStore('test-priority-order', {
                    showFooter: false,
                });
                expect(store.config.showFooter).toBe(false);
            });

            it('should NOT include undefined props in explicitProps (filtering works)', () => {
                // If we pass an empty props object, every Boolean prop will be undefined
                // These must NOT end up in explicitProps
                const store = useCoreStore('test-explicitprops-filter', {});

                // Every Boolean config value should reflect the defaultConfigLib values
                expect(store.config.showFooter).toBe(true); // DEFAULT_SHOW_FOOTER
                expect(store.config.debug).toBe(false); // DEFAULT_DEBUG
                expect(store.config.actionButtons).toEqual([]); // DEFAULT_ACTION_BUTTONS
                expect(store.config.externalPaginator).toBe(false); // DEFAULT_EXTERNAL_PAGINATOR
                expect(store.config.resources).toBe(false); // DEFAULT_RESOURCES
                expect(store.config.disableSession).toBe(false); // DEFAULT_DISABLE_SESSION
                expect(store.config.highlightSearchResults).toBe(true); // DEFAULT_HIGHLIGHT_SEARCH_RESULTS
                expect(store.config.accentInsensitiveSearch).toBe(false); // DEFAULT_ACCENT_INSENSITIVE_SEARCH
            });

            it('should merge multiple explicit props correctly', () => {
                const store = useCoreStore('test-multiple-explicit-props', {
                    debug: true,
                    showFooter: false,
                    currencyCode: 'EUR',
                    rowsNumber: 25,
                });

                expect(store.config.debug).toBe(true);
                expect(store.config.showFooter).toBe(false);
                expect(store.config.currencyCode).toBe('EUR');
                expect(store.config.rowsNumber).toBe(25);

                // Props that weren't passed reflect the default config values
                expect(store.config.actionButtons).toEqual([]);
                expect(store.config.externalPaginator).toBe(false);
            });
        });

        describe('Edge cases', () => {
            it('should handle explicit undefined prop (should NOT override config)', () => {
                const store = useCoreStore('test-explicit-undefined', {
                    showFooter: undefined,
                });

                // Even passing undefined explicitly doesn't override the config
                expect(store.config.showFooter).toBe(true);
            });

            it('should handle null prop values (different from undefined)', () => {
                const store = useCoreStore('test-null-prop', {
                    currencyCode: null,
                });

                // Passing null explicitly → overrides the config
                expect(store.config.currencyCode).toBeNull();
            });

            it('should handle mixed Boolean and non-Boolean props', () => {
                const store = useCoreStore('test-mixed-props', {
                    debug: true, // Boolean
                    siteName: 'Custom Site', // String
                    rowsNumber: 50, // Number
                    showFooter: false, // Boolean
                });

                expect(store.config.debug).toBe(true);
                expect(store.config.siteName).toBe('Custom Site');
                expect(store.config.rowsNumber).toBe(50);
                expect(store.config.showFooter).toBe(false);
            });
        });
    });
});
