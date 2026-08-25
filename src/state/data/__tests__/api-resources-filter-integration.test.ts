import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';
import { useApiResourcesStore } from '../api-resources.state';
import { useCoreStore } from '../../core/core.state';
import type { AuraProps } from '../../../types';

describe('useApiResourcesStore - Client-side Filter Integration', () => {
    const storeId = 'test-client-side-filter';
    let core: ReturnType<typeof useCoreStore>;
    let store: ReturnType<typeof useApiResourcesStore>;

    const mockItems = [
        { id: 1, name: 'Alpha', status: 'active', role: 'admin', count: 100 },
        { id: 2, name: 'Bravo', status: 'inactive', role: 'user', count: 200 },
        { id: 3, name: 'Charlie', status: 'active', role: 'admin', count: 150 },
        { id: 4, name: 'Delta', status: 'pending', role: 'user', count: 250 },
        { id: 5, name: 'Echo', status: 'active', role: 'guest', count: 120 },
    ];

    const minimalHeader = {
        rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }],
    };

    beforeEach(async () => {
        setActivePinia(createPinia());
        // Clear session storage to prevent interference
        window.sessionStorage.clear();

        const mockProps: AuraProps = {
            storeId: storeId,
            siteName: 'Test',
            externalPaginator: false, // Important for client-side tests
            disableSession: true, // Disable session for pure unit tests
        };

        core = useCoreStore(storeId, mockProps);
        store = useApiResourcesStore(storeId, core);

        // Manually set items via processResponse
        await store.processResponse({
            header: minimalHeader,
            items: mockItems,
        } as any);

        // Ensure initial state
        store.setLimit(2);
        store.setPage(1);
    });

    describe('basic filtering', () => {
        it('should filter items by single value', async () => {
            store.addFilter('status', ['active']);

            await flushPromises();

            // Items with status='active': Alpha, Charlie, Echo (3 items)
            // Limit is 2, page 1 should contain Alpha, Charlie
            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2);
            expect((displayed?.[0] as any).name).toBe('Alpha');
            expect((displayed?.[1] as any).name).toBe('Charlie');

            const meta = store.displayMeta;
            expect(meta?.total).toBe(3);
            expect(meta?.last_page).toBe(2);
        });

        it('should filter items by multiple values (OR within field)', () => {
            store.addFilter('status', ['active', 'pending']);

            // Items: Alpha, Charlie, Delta, Echo (4 items)
            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2); // Page 1 with limit 2
            expect((displayed?.[0] as any).name).toBe('Alpha');
            expect((displayed?.[1] as any).name).toBe('Charlie');

            const meta = store.displayMeta;
            expect(meta?.total).toBe(4);
        });

        it('should show correct items on page 2 after filtering', () => {
            store.addFilter('status', ['active']);
            store.setPage(2);

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(1); // Only Echo on page 2
            expect((displayed?.[0] as any).name).toBe('Echo');
        });

        it('should return all items when no filter is active', () => {
            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2); // Page 1 with limit 2
            expect((displayed?.[0] as any).name).toBe('Alpha');
            expect((displayed?.[1] as any).name).toBe('Bravo');
        });

        it('should return empty array when no items match filter', () => {
            store.addFilter('status', ['archived']);

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(0);

            const meta = store.displayMeta;
            expect(meta?.total).toBe(0);
            expect(meta?.last_page).toBe(1);
        });
    });

    describe('multiple field filtering (AND logic)', () => {
        it('should apply AND logic between different fields', () => {
            store.addFilter('status', ['active']);
            store.addFilter('role', ['admin']);

            // Only Alpha and Charlie are active admins
            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2);
            expect((displayed?.[0] as any).name).toBe('Alpha');
            expect((displayed?.[1] as any).name).toBe('Charlie');

            const meta = store.displayMeta;
            expect(meta?.total).toBe(2);
        });

        it('should return empty when AND conditions cannot be satisfied', () => {
            store.addFilter('status', ['inactive']);
            store.addFilter('role', ['admin']);

            // No items match both criteria
            const displayed = store.displayItems;
            expect(displayed).toHaveLength(0);
        });

        it('should handle multiple values in multiple fields', () => {
            store.addFilter('status', ['active', 'inactive']);
            store.addFilter('role', ['admin', 'user']);

            // Alpha (active, admin), Bravo (inactive, user), Charlie (active, admin)
            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2); // Page 1
            expect((displayed?.[0] as any).name).toBe('Alpha');
            expect((displayed?.[1] as any).name).toBe('Bravo');

            const meta = store.displayMeta;
            expect(meta?.total).toBe(3);
        });
    });

    describe('page reset on filter change', () => {
        it('should reset page to 1 when filter is added', async () => {
            store.setPage(2);
            expect(store.queryParams.page).toBe(2);

            store.addFilter('status', ['active']);

            await flushPromises();

            expect(store.queryParams.page).toBe(1);
        });

        it('should reset page to 1 when filter is updated', async () => {
            store.addFilter('status', ['active']);
            store.setPage(2);
            expect(store.queryParams.page).toBe(2);

            store.updateFilterValues('status', ['inactive']);

            await flushPromises();

            expect(store.queryParams.page).toBe(1);
        });

        it('should reset page to 1 when filter is removed', async () => {
            store.addFilter('status', ['active']);
            store.setPage(2);
            expect(store.queryParams.page).toBe(2);

            store.removeFilter('status');

            await flushPromises();

            expect(store.queryParams.page).toBe(1);
        });

        it('should reset page to 1 when all filters are cleared', async () => {
            store.addFilter('status', ['active']);
            store.addFilter('role', ['admin']);
            store.setPage(2);

            store.clearAllFilters();

            await flushPromises();

            expect(store.queryParams.page).toBe(1);
        });
    });

    describe('filtering with sorting', () => {
        it('should combine filtering and sorting', () => {
            store.addFilter('status', ['active']);
            store.addSort('name', 'desc'); // Echo, Charlie, Alpha

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2); // Page 1
            expect((displayed?.[0] as any).name).toBe('Echo');
            expect((displayed?.[1] as any).name).toBe('Charlie');
        });

        it('should sort filtered results by numeric field', () => {
            store.addFilter('status', ['active']);
            store.addSort('count', 'asc'); // 100 (Alpha), 120 (Echo), 150 (Charlie)

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2); // Page 1
            expect((displayed?.[0] as any).name).toBe('Alpha');
            expect((displayed?.[1] as any).name).toBe('Echo');
        });

        it('should apply filter after sort (correct order)', () => {
            // Sort first, then filter
            store.addSort('count', 'asc');
            store.addFilter('role', ['admin']);

            // Admins by count asc: Alpha (100), Charlie (150)
            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2);
            expect((displayed?.[0] as any).name).toBe('Alpha');
            expect((displayed?.[1] as any).name).toBe('Charlie');
        });
    });

    describe('filtering with search', () => {
        it('should combine filter and search (AND logic)', () => {
            store.addFilter('status', ['active']);
            store.addSearch('name', 'Char', false); // Only Charlie matches this substring

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(1);
            expect((displayed?.[0] as any).name).toBe('Charlie');
        });

        it('should return empty when filter and search do not match any items', () => {
            store.addFilter('status', ['inactive']);
            store.addSearch('name', 'Alpha'); // Alpha is active, not inactive

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(0);
        });

        it('should apply both filter and search on multiple fields', () => {
            store.addFilter('role', ['admin', 'user']);
            store.addSearch('status', 'active', true); // exact match to avoid matching 'inactive'

            // active admins/users: Alpha, Charlie (Bravo is inactive, not active)
            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2);
            expect((displayed?.[0] as any).name).toBe('Alpha');
            expect((displayed?.[1] as any).name).toBe('Charlie');
        });
    });

    describe('filter + search + sort combination', () => {
        it('should apply all three operations together', () => {
            store.addFilter('status', ['active', 'pending']);
            store.addSearch('name', 'a'); // Alpha, Charlie, Delta contains 'a'
            store.addSort('count', 'desc'); // Descending by count

            // Matching items: Alpha (100), Charlie (150), Delta (250)
            // After filter (active/pending) + search ('a'): Alpha, Charlie, Delta
            // After sort (count desc): Delta (250), Charlie (150), Alpha (100)
            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2); // Page 1
            expect((displayed?.[0] as any).name).toBe('Delta');
            expect((displayed?.[1] as any).name).toBe('Charlie');

            const meta = store.displayMeta;
            expect(meta?.total).toBe(3);
        });

        it('should maintain correct order through operations', () => {
            // Add operations in different order
            store.addSort('name', 'asc');
            store.addFilter('role', ['admin']);
            store.addSearch('status', 'active');

            // active admins: Alpha, Charlie
            // Sorted by name asc: Alpha, Charlie
            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2);
            expect((displayed?.[0] as any).name).toBe('Alpha');
            expect((displayed?.[1] as any).name).toBe('Charlie');
        });
    });

    describe('displayMeta with filtering', () => {
        it('should calculate correct total after filtering', () => {
            store.addFilter('status', ['active']);

            const meta = store.displayMeta;
            expect(meta?.total).toBe(3);
            expect(meta?.last_page).toBe(2); // 3 items with limit 2
            expect(meta?.current_page).toBe(1);
            expect(meta?.per_page).toBe(2);
        });

        it('should calculate correct from/to values after filtering', () => {
            store.addFilter('status', ['active']);
            store.setPage(1);

            const meta = store.displayMeta;
            expect(meta?.from).toBe(1);
            expect(meta?.to).toBe(2);
        });

        it('should show correct last page after filtering', () => {
            store.addFilter('role', ['user']); // Bravo, Delta (2 items)

            const meta = store.displayMeta;
            expect(meta?.last_page).toBe(1); // 2 items with limit 2
        });
    });

    describe('edge cases', () => {
        it('should handle empty items array', async () => {
            await store.processResponse({
                header: minimalHeader,
                items: [],
            } as any);

            store.addFilter('status', ['active']);

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(0);
        });

        it('should handle filter on non-existent field', () => {
            store.addFilter('nonexistent', ['value']);

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(0); // Nothing matches
        });

        it('should preserve filter state across page changes', () => {
            store.addFilter('status', ['active']);

            store.setPage(1);
            let displayed = store.displayItems;
            expect(displayed).toHaveLength(2);

            store.setPage(2);
            displayed = store.displayItems;
            expect(displayed).toHaveLength(1);

            // Filter should still be active
            expect(store.getFilterValues('status')).toEqual(['active']);
        });

        it('should handle removing filter while on affected page', async () => {
            store.addFilter('status', ['active']); // 3 items
            store.setPage(2); // Echo

            let displayed = store.displayItems;
            expect(displayed).toHaveLength(1);

            store.removeFilter('status'); // Now 5 items total

            // Wait for watcher
            await flushPromises();

            // Should reset to page 1
            expect(store.queryParams.page).toBe(1);
        });
    });

    describe('external paginator handling', () => {
        it('should NOT filter items when externalPaginator is true', async () => {
            setActivePinia(createPinia());

            const mockPropsExternal: AuraProps = {
                storeId: 'test-filter-external',
                siteName: 'Test',
                externalPaginator: true,
            };

            const coreExternal = useCoreStore('test-filter-external', mockPropsExternal);
            const storeExternal = useApiResourcesStore('test-filter-external', coreExternal);

            await storeExternal.processResponse({
                header: {
                    rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }],
                },
                items: [
                    { id: 1, name: 'Alpha', status: 'active', role: 'admin', count: 100 },
                    { id: 2, name: 'Bravo', status: 'inactive', role: 'user', count: 200 },
                    { id: 3, name: 'Charlie', status: 'active', role: 'admin', count: 150 },
                    { id: 4, name: 'Delta', status: 'pending', role: 'user', count: 250 },
                    { id: 5, name: 'Echo', status: 'active', role: 'guest', count: 120 },
                ],
            } as any);

            storeExternal.addFilter('status', ['active']);

            // With externalPaginator: true, displayItems should return all items
            // because backend handles filtering
            const displayed = storeExternal.displayItems;
            expect(displayed).toHaveLength(5); // All items, no client-side filtering
        });

        it('should still include filterable in queryParams when externalPaginator is true', async () => {
            setActivePinia(createPinia());

            const mockPropsExternal: AuraProps = {
                storeId: 'test-filter-external-params',
                siteName: 'Test',
                externalPaginator: true,
            };

            const coreExternal = useCoreStore('test-filter-external-params', mockPropsExternal);
            const storeExternal = useApiResourcesStore('test-filter-external-params', coreExternal);

            storeExternal.addFilter('status', ['active']);

            expect(storeExternal.queryParams.filterable).toBeDefined();
            expect(storeExternal.queryParams.filterable).toHaveLength(1);
            expect(storeExternal.queryParams.filterable![0]).toEqual({
                field: 'status',
                values: ['active'],
            });
        });

        it('should NOT reset page when externalPaginator is true and filter is added', async () => {
            setActivePinia(createPinia());

            const mockPropsExternal: AuraProps = {
                storeId: 'test-filter-external-page-add',
                siteName: 'Test',
                externalPaginator: true,
            };

            const coreExternal = useCoreStore('test-filter-external-page-add', mockPropsExternal);
            const storeExternal = useApiResourcesStore(
                'test-filter-external-page-add',
                coreExternal
            );

            storeExternal.setPage(3);
            expect(storeExternal.queryParams.page).toBe(3);

            storeExternal.addFilter('status', ['active']);

            // Wait for potential watcher
            await flushPromises();

            // Page should NOT reset because externalPaginator is true
            expect(storeExternal.queryParams.page).toBe(3);
        });

        it('should NOT reset page when externalPaginator is true and filter is updated', async () => {
            setActivePinia(createPinia());

            const mockPropsExternal: AuraProps = {
                storeId: 'test-filter-external-page-update',
                siteName: 'Test',
                externalPaginator: true,
            };

            const coreExternal = useCoreStore(
                'test-filter-external-page-update',
                mockPropsExternal
            );
            const storeExternal = useApiResourcesStore(
                'test-filter-external-page-update',
                coreExternal
            );

            storeExternal.addFilter('status', ['active']);
            storeExternal.setPage(3);
            expect(storeExternal.queryParams.page).toBe(3);

            storeExternal.updateFilterValues('status', ['inactive']);

            // Wait for potential watcher
            await flushPromises();

            // Page should NOT reset because externalPaginator is true
            expect(storeExternal.queryParams.page).toBe(3);
        });

        it('should NOT reset page when externalPaginator is true and filter is removed', async () => {
            setActivePinia(createPinia());

            const mockPropsExternal: AuraProps = {
                storeId: 'test-filter-external-page-remove',
                siteName: 'Test',
                externalPaginator: true,
            };

            const coreExternal = useCoreStore(
                'test-filter-external-page-remove',
                mockPropsExternal
            );
            const storeExternal = useApiResourcesStore(
                'test-filter-external-page-remove',
                coreExternal
            );

            storeExternal.addFilter('status', ['active']);
            storeExternal.setPage(3);
            expect(storeExternal.queryParams.page).toBe(3);

            storeExternal.removeFilter('status');

            // Wait for potential watcher
            await flushPromises();

            // Page should NOT reset because externalPaginator is true
            expect(storeExternal.queryParams.page).toBe(3);
        });
    });
});
