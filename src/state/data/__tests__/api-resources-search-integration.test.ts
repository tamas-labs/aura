import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';
import { useApiResourcesStore } from '../api-resources.state';
import { useCoreStore } from '../../core/core.state';
import type { AuraProps } from '../../../types';

describe('useApiResourcesStore - Client-side Search Integration', () => {
    const storeId = 'test-client-side-search';
    let core: ReturnType<typeof useCoreStore>;
    let store: ReturnType<typeof useApiResourcesStore>;

    const mockItems = [
        { id: 1, name: 'Alpha', category: 'A', price: 100 },
        { id: 2, name: 'Bravo', category: 'B', price: 200 },
        { id: 3, name: 'Charlie', category: 'A', price: 150 },
        { id: 4, name: 'Delta', category: 'B', price: 250 },
        { id: 5, name: 'Echo', category: 'A', price: 120 },
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
        it('should filter items when active search exists', async () => {
            store.addSearch('category', 'A');

            // Wait for search processing
            await flushPromises();

            // Limit is 2, items matching 'A' are 3 (Alpha, Charlie, Echo)
            // Page 1 should contain Alpha, Charlie

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2);
            expect((displayed?.[0] as any).name).toBe('Alpha');
            expect((displayed?.[1] as any).name).toBe('Charlie');

            // Check meta
            const meta = store.displayMeta;
            expect(meta?.total).toBe(3);
            expect(meta?.last_page).toBe(2);
        });

        it('should show correct items on page 2 after filtering', () => {
            store.addSearch('category', 'A');
            store.setPage(2);

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(1); // Only Echo on page 2
            expect((displayed?.[0] as any).name).toBe('Echo');
        });

        it('should return all items when no search is active', () => {
            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2); // Page 1 with limit 2
            expect((displayed?.[0] as any).name).toBe('Alpha');
            expect((displayed?.[1] as any).name).toBe('Bravo');
        });

        it('should return empty array when no items match search', () => {
            store.addSearch('name', 'Nonexistent');

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(0);

            const meta = store.displayMeta;
            expect(meta?.total).toBe(0);
            expect(meta?.last_page).toBe(1);
        });
    });

    describe('page reset on search', () => {
        it('should reset page to 1 when search is added', async () => {
            store.setPage(2);
            expect(store.queryParams.page).toBe(2);

            store.addSearch('name', 'Alpha');

            // Wait for watcher
            await flushPromises();

            expect(store.queryParams.page).toBe(1);
        });

        it('should reset page to 1 when search is updated', async () => {
            store.addSearch('name', 'Alpha');
            store.setPage(2);
            expect(store.queryParams.page).toBe(2);

            store.updateSearchTerm('name', 'Bravo');

            // Wait for watcher
            await flushPromises();

            expect(store.queryParams.page).toBe(1);
        });

        it('should reset page to 1 when search is removed', async () => {
            store.addSearch('category', 'A');
            store.setPage(2);
            expect(store.queryParams.page).toBe(2);

            store.removeSearch('category');

            // Wait for watcher
            await flushPromises();

            expect(store.queryParams.page).toBe(1);
        });

        it('should reset page to 1 when all searches are cleared', async () => {
            store.addSearch('category', 'A');
            store.addSearch('name', 'Alpha');
            store.setPage(2);

            store.clearAllSearches();

            // Wait for watcher
            await flushPromises();

            expect(store.queryParams.page).toBe(1);
        });
    });

    describe('filtering with sorting', () => {
        it('should combine filtering and sorting', () => {
            store.addSearch('category', 'A');
            store.addSort('name', 'desc'); // Echo, Charlie, Alpha

            // Limit is 2. Page 1 -> Echo, Charlie
            const displayed = store.displayItems;

            expect(displayed).toHaveLength(2);
            expect((displayed?.[0] as any).name).toBe('Echo');
            expect((displayed?.[1] as any).name).toBe('Charlie');
        });

        it('should sort filtered results by multiple fields', () => {
            store.addSearch('category', 'A');
            store.addSort('price', 'asc'); // 100 (Alpha), 120 (Echo), 150 (Charlie)

            const displayed = store.displayItems;

            expect(displayed).toHaveLength(2);
            expect((displayed?.[0] as any).name).toBe('Alpha');
            expect((displayed?.[1] as any).name).toBe('Echo');
        });
    });

    describe('multiple search criteria', () => {
        it('should filter by multiple criteria (AND logic)', () => {
            store.addSearch('category', 'A');
            store.addSearch('name', 'Echo');

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(1);
            expect((displayed?.[0] as any).name).toBe('Echo');
        });

        it('should show no results when multiple criteria do not match', () => {
            store.addSearch('category', 'A');
            store.addSearch('name', 'Bravo'); // Bravo is category B, not A

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(0);
        });
    });

    describe('displayMeta with filtering', () => {
        it('should calculate correct total after filtering', () => {
            store.addSearch('category', 'A'); // 3 items

            const meta = store.displayMeta;
            expect(meta?.total).toBe(3);
        });

        it('should calculate correct last_page after filtering', () => {
            store.addSearch('category', 'A'); // 3 items, limit 2

            const meta = store.displayMeta;
            expect(meta?.last_page).toBe(2); // ceil(3/2)
        });

        it('should calculate correct from/to values after filtering', () => {
            store.addSearch('category', 'A'); // 3 items, limit 2, page 1

            const meta = store.displayMeta;
            expect(meta?.from).toBe(1);
            expect(meta?.to).toBe(2);
        });

        it('should handle from/to on last page with filtering', () => {
            store.addSearch('category', 'A'); // 3 items
            store.setPage(2);

            const meta = store.displayMeta;
            expect(meta?.from).toBe(3);
            expect(meta?.to).toBe(3);
        });

        it('should handle empty result set meta correctly', () => {
            store.addSearch('name', 'Nonexistent');

            const meta = store.displayMeta;
            expect(meta?.total).toBe(0);
            expect(meta?.from).toBe(null);
            expect(meta?.to).toBe(null);
            expect(meta?.last_page).toBe(1);
        });
    });

    describe('queryParams integration', () => {
        it('should include searchable in queryParams when search is active', () => {
            store.addSearch('name', 'Alpha');

            expect(store.queryParams.searchable).toBeDefined();
            expect(store.queryParams.searchable).toHaveLength(1);
            expect((store.queryParams.searchable as any)[0].field).toBe('name');
            expect((store.queryParams.searchable as any)[0].term).toBe('Alpha');
        });

        it('should not include searchable in queryParams when no search is active', () => {
            expect(store.queryParams.searchable).toBeUndefined();
        });

        it('should update queryParams when search changes', () => {
            store.addSearch('name', 'Alpha');
            expect((store.queryParams.searchable as any)[0].term).toBe('Alpha');

            store.updateSearchTerm('name', 'Bravo');
            expect((store.queryParams.searchable as any)[0].term).toBe('Bravo');
        });
    });

    describe('external paginator handling', () => {
        it('should NOT filter items when externalPaginator is true', async () => {
            // Re-create store with externalPaginator: true
            setActivePinia(createPinia());

            const mockPropsExternal: AuraProps = {
                storeId: 'test-external',
                siteName: 'Test',
                externalPaginator: true,
            };

            const coreExternal = useCoreStore('test-external', mockPropsExternal);
            const storeExternal = useApiResourcesStore('test-external', coreExternal);

            await storeExternal.processResponse({
                header: minimalHeader,
                items: mockItems,
            } as any);

            storeExternal.addSearch('category', 'A');

            // With externalPaginator: true, displayItems should return all items
            // because backend handles filtering
            const displayed = storeExternal.displayItems;
            expect(displayed).toHaveLength(5); // All items, no client-side filtering
        });

        it('should NOT reset page when externalPaginator is true', async () => {
            setActivePinia(createPinia());

            const mockPropsExternal: AuraProps = {
                storeId: 'test-external-2',
                siteName: 'Test',
                externalPaginator: true,
            };

            const coreExternal = useCoreStore('test-external-2', mockPropsExternal);
            const storeExternal = useApiResourcesStore('test-external-2', coreExternal);

            await storeExternal.processResponse({
                header: minimalHeader,
                items: mockItems,
            } as any);

            storeExternal.setPage(3);
            expect(storeExternal.queryParams.page).toBe(3);

            storeExternal.addSearch('name', 'Alpha');

            // Wait for potential watcher
            await flushPromises();

            // Page should NOT reset because externalPaginator is true
            expect(storeExternal.queryParams.page).toBe(3);
        });
    });

    describe('global search with nested fields', () => {
        const nestedMockItems = [
            {
                id: 1,
                name: 'Alpha',
                hello: { first_level: ['', 'Hello'] },
                world: ['', '', { first_level: 'World' }],
            },
            {
                id: 2,
                name: 'Bravo',
                hello: { first_level: ['', 'Greetings'] },
                world: ['', '', { first_level: 'Earth' }],
            },
            {
                id: 3,
                name: 'Charlie',
                hello: { first_level: ['', 'Hi'] },
                world: ['', '', { first_level: 'Planet' }],
            },
        ];

        it('should support global search on nested field paths', async () => {
            // Header with searchableItems including nested paths
            // Important: The nested paths must also exist as cell.field values
            const headerWithNestedSearch = {
                rows: [
                    {
                        cells: [
                            { content: 'Name', key: 'name', field: 'name' },
                            {
                                content: 'Hello',
                                key: 'hello',
                                field: 'hello.first_level.1',
                                object: true,
                            },
                            {
                                content: 'World',
                                key: 'world',
                                field: 'world.2.first_level',
                                object: true,
                            },
                        ],
                    },
                ],
                settings: {
                    searchableItems: ['name', 'hello.first_level.1', 'world.2.first_level'],
                },
            };

            await store.processResponse({
                header: headerWithNestedSearch,
                items: nestedMockItems,
            } as any);

            // Search for "Hello" which is at hello.first_level.1
            store.setGlobalSearch('Hello');
            await flushPromises();

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(1);
            expect((displayed?.[0] as any).name).toBe('Alpha');
        });

        it('should find matches in nested array-object paths', async () => {
            const headerWithNestedSearch = {
                rows: [
                    {
                        cells: [
                            { content: 'Name', key: 'name', field: 'name' },
                            {
                                content: 'World',
                                key: 'world',
                                field: 'world.2.first_level',
                                object: true,
                            },
                        ],
                    },
                ],
                settings: {
                    searchableItems: ['world.2.first_level'],
                },
            };

            await store.processResponse({
                header: headerWithNestedSearch,
                items: nestedMockItems,
            } as any);

            // Search for "Earth" which is at world.2.first_level
            store.setGlobalSearch('Earth');
            await flushPromises();

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(1);
            expect((displayed?.[0] as any).name).toBe('Bravo');
        });

        it('should support partial matches on nested fields', async () => {
            const headerWithNestedSearch = {
                rows: [
                    {
                        cells: [
                            { content: 'Name', key: 'name', field: 'name' },
                            {
                                content: 'Hello',
                                key: 'hello',
                                field: 'hello.first_level.1',
                                object: true,
                            },
                        ],
                    },
                ],
                settings: {
                    searchableItems: ['hello.first_level.1'],
                },
            };

            await store.processResponse({
                header: headerWithNestedSearch,
                items: nestedMockItems,
            } as any);

            // Search for "i" which matches "Hi" and "Greetings"
            store.setGlobalSearch('i');
            await flushPromises();

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(2);
            const names = displayed?.map((item: any) => item.name);
            expect(names).toContain('Bravo'); // Greetings
            expect(names).toContain('Charlie'); // Hi
        });

        it('should search across multiple nested and normal fields', async () => {
            const headerWithMixedSearch = {
                rows: [
                    {
                        cells: [
                            { content: 'Name', key: 'name', field: 'name' },
                            {
                                content: 'Hello',
                                key: 'hello',
                                field: 'hello.first_level.1',
                                object: true,
                            },
                        ],
                    },
                ],
                settings: {
                    searchableItems: ['name', 'hello.first_level.1'],
                },
            };

            await store.processResponse({
                header: headerWithMixedSearch,
                items: nestedMockItems,
            } as any);

            // Search for "a" which matches "Alpha" (name) and "Bravo" (name)
            store.setGlobalSearch('a');
            await flushPromises();

            const displayed = store.displayItems;
            expect(displayed?.length).toBeGreaterThanOrEqual(2);
        });

        it('should handle missing nested paths gracefully', async () => {
            const headerWithNonExistentPath = {
                rows: [
                    {
                        cells: [
                            { content: 'Name', key: 'name', field: 'name' },
                            {
                                content: 'Non-existent',
                                key: 'nonexistent',
                                field: 'nonexistent.path.value',
                                object: true,
                            },
                        ],
                    },
                ],
                settings: {
                    searchableItems: ['name', 'nonexistent.path.value'],
                },
            };

            await store.processResponse({
                header: headerWithNonExistentPath,
                items: nestedMockItems,
            } as any);

            // Search should only work on 'name' field
            store.setGlobalSearch('Alpha');
            await flushPromises();

            const displayed = store.displayItems;
            expect(displayed).toHaveLength(1);
            expect((displayed?.[0] as any).name).toBe('Alpha');
        });
    });
});
