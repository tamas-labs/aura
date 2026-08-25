import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';
import { useApiResourcesStore } from '../api-resources.state';
import { useCoreStore } from '../../core/core.state';
import type { AuraProps } from '../../../types';

describe('useApiResourcesStore - Filter functionality', () => {
    const storeId = 'test-api-resources-filter';
    let core: ReturnType<typeof useCoreStore>;
    let store: ReturnType<typeof useApiResourcesStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        // Clear session storage to prevent interference
        window.sessionStorage.clear();

        const mockProps: AuraProps = {
            storeId: storeId,
            siteName: 'Test Site',
            urlStructure: '{siteName}/api/{urlParameter}',
            urlParameter: 'users',
            urlParameterLastSegment: 'list',
            siteToken: 'test-token-123',
            requestMethod: 'POST',
            disableSession: true, // Disable session for pure unit tests
        };

        core = useCoreStore(storeId, mockProps);
        store = useApiResourcesStore(storeId, core);
    });

    describe('addFilter', () => {
        describe('valid cases', () => {
            it('should add new filter with single value', () => {
                store.addFilter('status', ['active']);

                expect(store.filterItems).toHaveLength(1);
                expect(store.filterItems[0]).toEqual({
                    field: 'status',
                    values: ['active'],
                });
            });

            it('should add filter with multiple values', () => {
                store.addFilter('role', ['admin', 'user']);

                expect(store.filterItems).toHaveLength(1);
                expect(store.filterItems[0]).toEqual({
                    field: 'role',
                    values: ['admin', 'user'],
                });
            });

            it('should add multiple filters for different fields', () => {
                store.addFilter('status', ['active']);
                store.addFilter('role', ['admin']);

                expect(store.filterItems).toHaveLength(2);
                expect(store.filterItems[0]).toEqual({
                    field: 'status',
                    values: ['active'],
                });
                expect(store.filterItems[1]).toEqual({
                    field: 'role',
                    values: ['admin'],
                });
            });

            it('should handle numeric values in filter', () => {
                store.addFilter('count', [100, 200]);

                expect(store.filterItems).toHaveLength(1);
                expect(store.filterItems[0]?.values).toEqual([100, 200]);
            });

            it('should handle mixed type values', () => {
                store.addFilter('value', ['test', 123, true, null]);

                expect(store.filterItems).toHaveLength(1);
                expect(store.filterItems[0]?.values).toEqual(['test', 123, true, null]);
            });
        });

        describe('invalid/edge cases', () => {
            it('should not add filter when field is empty', () => {
                store.addFilter('', ['test']);

                expect(store.filterItems).toHaveLength(0);
            });

            it('should remove filter when values array is empty', () => {
                store.addFilter('status', ['active']);
                expect(store.filterItems).toHaveLength(1);

                store.addFilter('status', []);
                expect(store.filterItems).toHaveLength(0);
            });

            it('should remove filter when values is null', () => {
                store.addFilter('status', ['active']);
                expect(store.filterItems).toHaveLength(1);

                store.addFilter('status', null as any);
                expect(store.filterItems).toHaveLength(0);
            });

            it('should not add duplicate filter for same field', () => {
                store.addFilter('status', ['active']);
                store.addFilter('status', ['inactive']);

                expect(store.filterItems).toHaveLength(1);
                expect(store.filterItems[0]?.values).toEqual(['active']);
            });
        });
    });

    describe('updateFilterValues', () => {
        describe('valid cases', () => {
            it('should update values of existing filter', () => {
                store.addFilter('status', ['active']);
                store.updateFilterValues('status', ['inactive']);

                expect(store.filterItems).toHaveLength(1);
                expect(store.filterItems[0]?.values).toEqual(['inactive']);
            });

            it('should update to multiple values', () => {
                store.addFilter('role', ['admin']);
                store.updateFilterValues('role', ['admin', 'user', 'guest']);

                expect(store.filterItems).toHaveLength(1);
                expect(store.filterItems[0]?.values).toEqual(['admin', 'user', 'guest']);
            });

            it('should update from multiple to single value', () => {
                store.addFilter('status', ['active', 'inactive', 'pending']);
                store.updateFilterValues('status', ['active']);

                expect(store.filterItems).toHaveLength(1);
                expect(store.filterItems[0]?.values).toEqual(['active']);
            });
        });

        describe('invalid/edge cases', () => {
            it('should remove filter when values array is empty', () => {
                store.addFilter('status', ['active']);
                store.updateFilterValues('status', []);

                expect(store.filterItems).toHaveLength(0);
            });

            it('should remove filter when values is null', () => {
                store.addFilter('status', ['active']);
                store.updateFilterValues('status', null as any);

                expect(store.filterItems).toHaveLength(0);
            });

            it('should do nothing when field does not exist', () => {
                store.addFilter('status', ['active']);
                store.updateFilterValues('role', ['admin']);

                expect(store.filterItems).toHaveLength(1);
                expect(store.filterItems[0]?.field).toBe('status');
            });
        });
    });

    describe('removeFilter', () => {
        it('should remove filter for specific field', () => {
            store.addFilter('status', ['active']);
            store.addFilter('role', ['admin']);

            store.removeFilter('status');

            expect(store.filterItems).toHaveLength(1);
            expect(store.filterItems[0]?.field).toBe('role');
        });

        it('should handle removing non-existent filter', () => {
            store.addFilter('status', ['active']);

            store.removeFilter('nonexistent');

            expect(store.filterItems).toHaveLength(1);
        });

        it('should clear all when last filter is removed', () => {
            store.addFilter('status', ['active']);

            store.removeFilter('status');

            expect(store.filterItems).toHaveLength(0);
        });
    });

    describe('clearAllFilters', () => {
        it('should clear all filters', () => {
            store.addFilter('status', ['active']);
            store.addFilter('role', ['admin']);
            store.addFilter('count', [100]);

            store.clearAllFilters();

            expect(store.filterItems).toHaveLength(0);
        });

        it('should handle clearing when no filters exist', () => {
            store.clearAllFilters();

            expect(store.filterItems).toHaveLength(0);
        });
    });

    describe('getFilterValues', () => {
        it('should return filter values for existing field', () => {
            store.addFilter('status', ['active', 'pending']);

            const values = store.getFilterValues('status');

            expect(values).toEqual(['active', 'pending']);
        });

        it('should return null for non-existent field', () => {
            store.addFilter('status', ['active']);

            const values = store.getFilterValues('role');

            expect(values).toBeNull();
        });

        it('should return null when no filters exist', () => {
            const values = store.getFilterValues('status');

            expect(values).toBeNull();
        });

        it('should return current values after update', () => {
            store.addFilter('status', ['active']);
            store.updateFilterValues('status', ['inactive', 'pending']);

            const values = store.getFilterValues('status');

            expect(values).toEqual(['inactive', 'pending']);
        });
    });

    describe('queryParams integration', () => {
        it('should include filterable in queryParams when filters exist', () => {
            store.addFilter('status', ['active']);

            expect(store.queryParams.filterable).toBeDefined();
            expect(store.queryParams.filterable).toHaveLength(1);
            expect(store.queryParams.filterable![0]).toEqual({
                field: 'status',
                values: ['active'],
            });
        });

        it('should not include filterable in queryParams when no filters', () => {
            expect(store.queryParams.filterable).toBeUndefined();
        });

        it('should update queryParams when filters change', () => {
            store.addFilter('status', ['active']);
            expect(store.queryParams.filterable).toHaveLength(1);

            store.addFilter('role', ['admin']);
            expect(store.queryParams.filterable).toHaveLength(2);

            store.removeFilter('status');
            expect(store.queryParams.filterable).toHaveLength(1);

            store.clearAllFilters();
            expect(store.queryParams.filterable).toBeUndefined();
        });

        it('should include filters alongside other query params', () => {
            store.addFilter('status', ['active']);
            store.addSearch('name', 'John');
            store.addSort('created_at', 'desc');

            expect(store.queryParams.filterable).toBeDefined();
            expect(store.queryParams.searchable).toBeDefined();
            expect(store.queryParams.sortable).toBeDefined();
        });
    });

    describe('page reset on filter change', () => {
        beforeEach(() => {
            // Re-initialize with client-side pagination
            const mockProps: AuraProps = {
                storeId: storeId + '-page-reset',
                siteName: 'Test Site',
                externalPaginator: false, // Client-side pagination
                disableSession: true,
            };

            core = useCoreStore(storeId + '-page-reset', mockProps);
            store = useApiResourcesStore(storeId + '-page-reset', core);
        });

        it('should reset page to 1 when filter is added (client-side)', async () => {
            store.setPage(3);
            expect(store.queryParams.page).toBe(3);

            store.addFilter('status', ['active']);

            // Wait for watcher to execute
            await flushPromises();

            expect(store.queryParams.page).toBe(1);
        });

        it('should reset page to 1 when filter is removed (client-side)', async () => {
            store.addFilter('status', ['active']);
            store.setPage(2);
            expect(store.queryParams.page).toBe(2);

            store.removeFilter('status');

            // Wait for watcher
            await flushPromises();

            expect(store.queryParams.page).toBe(1);
        });

        it('should reset page to 1 when filter values are updated (client-side)', async () => {
            store.addFilter('status', ['active']);
            store.setPage(4);
            expect(store.queryParams.page).toBe(4);

            store.updateFilterValues('status', ['inactive']);

            // Wait for watcher
            await flushPromises();

            expect(store.queryParams.page).toBe(1);
        });
    });

    describe('filter state persistence', () => {
        it('should maintain filter state after other operations', () => {
            store.addFilter('status', ['active']);
            store.addSearch('name', 'John');
            store.setPage(2);

            expect(store.filterItems).toHaveLength(1);
            expect(store.filterItems[0]?.values).toEqual(['active']);
        });

        it('should handle complex filter scenarios', () => {
            // Add multiple filters
            store.addFilter('status', ['active', 'pending']);
            store.addFilter('role', ['admin', 'user']);
            store.addFilter('verified', [true]);

            expect(store.filterItems).toHaveLength(3);

            // Update one
            store.updateFilterValues('status', ['active']);
            expect(store.filterItems).toHaveLength(3);
            expect(store.getFilterValues('status')).toEqual(['active']);

            // Remove one
            store.removeFilter('verified');
            expect(store.filterItems).toHaveLength(2);

            // Clear all
            store.clearAllFilters();
            expect(store.filterItems).toHaveLength(0);
        });
    });
});
