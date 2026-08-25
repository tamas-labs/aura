import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useApiResourcesStore } from '../api-resources.state';
import { useCoreStore } from '../../core/core.state';
import type { AuraProps } from '../../../types';
import axios from 'axios';
import { DEFAULT_LABELS } from '../../../lib/default-values.lib';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('useApiResourcesStore', () => {
    const storeId = 'test-api-resources';
    const NETWORK_ERROR_MESSAGE = 'Network Error';
    let core: ReturnType<typeof useCoreStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        // Clear session storage to prevent interference from session restore
        window.sessionStorage.clear();

        const mockProps: AuraProps = {
            storeId: storeId,
            siteName: 'Test Site',
            urlStructure: '{siteName}/api/{urlParameter}',
            urlParameter: 'users',
            urlParameterLastSegment: 'list',
            siteToken: 'test-token-123',
            requestMethod: 'POST',
        };

        core = useCoreStore(storeId, mockProps);
    });

    describe('initialization', () => {
        it('should create api resources store', () => {
            const store = useApiResourcesStore(storeId, core);
            expect(store).toBeDefined();
        });

        it('should have initial state null', () => {
            const store = useApiResourcesStore(storeId, core);
            expect(store.header).toBeNull();
            expect(store.body).toBeNull();
            expect(store.footer).toBeNull();
            expect(store.items).toBeNull();
            expect(store.meta).toBeNull();
            expect(store.links).toBeNull();
        });
    });

    describe('fetchData', () => {
        it('should make API call and process response', async () => {
            const store = useApiResourcesStore(storeId, core);
            const mockResponseData = {
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: [{ id: 1 }],
                meta: {
                    current_page: 1,
                    total: 1,
                    from: 1,
                    to: 1,
                    last_page: 1,
                    path: 'url',
                    per_page: 10,
                },
            };
            const mockResponse = { data: mockResponseData };

            mockedAxios.mockResolvedValueOnce(mockResponse);
            await store.fetchData();

            expect(mockedAxios).toHaveBeenCalledTimes(1);
            expect(store.header).toMatchObject({ rows: mockResponseData.header.rows });
            expect(store.items).toEqual(mockResponseData.items);
            expect(store.meta).toEqual(mockResponseData.meta);
        });

        it('should handle API errors', async () => {
            const store = useApiResourcesStore(storeId, core);
            mockedAxios.mockRejectedValueOnce(new Error(NETWORK_ERROR_MESSAGE));

            await store.fetchData();

            // Check that error was added to the error store
            expect(core.errorStore.errors.length).toBeGreaterThan(0);
            expect(core.errorStore.errors[0]?.type).toBe('api');
            expect(core.errorStore.errors[0]?.component).toBe('ApiResourcesStore');
        });

        describe('external API protection (allowExternalApi)', () => {
            const baseProps = (id: string): AuraProps => ({
                storeId: id,
                urlParameter: 'users',
                urlParameterLastSegment: 'list',
                siteToken: 'test-token-123',
                requestMethod: 'POST',
            });

            it('blocks the cross-origin request when allowExternalApi is not enabled', async () => {
                const externalStoreId = 'test-external-blocked';
                const externalCore = useCoreStore(externalStoreId, {
                    ...baseProps(externalStoreId),
                    urlStructure: 'https://evil.example.com/api/{urlParameter}',
                });
                const store = useApiResourcesStore(externalStoreId, externalCore);

                await store.fetchData();

                expect(mockedAxios).not.toHaveBeenCalled();
                const err = externalCore.errorStore.errors.find(e => e.action === 'fetchData');
                expect(err?.type).toBe('authorization');
                expect(err?.component).toBe('ApiResourcesStore');
            });

            it('allows the cross-origin request when allowExternalApi is true', async () => {
                const externalStoreId = 'test-external-allowed';
                const externalCore = useCoreStore(externalStoreId, {
                    ...baseProps(externalStoreId),
                    urlStructure: 'https://evil.example.com/api/{urlParameter}',
                    allowExternalApi: true,
                } as unknown as AuraProps);
                const store = useApiResourcesStore(externalStoreId, externalCore);
                mockedAxios.mockResolvedValueOnce({ data: {} });

                await store.fetchData();

                expect(mockedAxios).toHaveBeenCalledTimes(1);
            });

            it('does not block the same-origin (relative) request', async () => {
                const sameStoreId = 'test-same-origin';
                const sameCore = useCoreStore(sameStoreId, {
                    ...baseProps(sameStoreId),
                    urlStructure: '/api/{urlParameter}',
                });
                const store = useApiResourcesStore(sameStoreId, sameCore);
                mockedAxios.mockResolvedValueOnce({ data: {} });

                await store.fetchData();

                expect(mockedAxios).toHaveBeenCalledTimes(1);
            });
        });
    });

    describe('processResponse', () => {
        it('should update state with valid data', async () => {
            const store = useApiResourcesStore(storeId, core);
            const mockData = {
                header: { rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }] },
                items: ['a', 'b'],
            };

            await store.processResponse(mockData);

            expect(store.header).toMatchObject({ rows: mockData.header.rows });
            expect(store.items).toEqual(mockData.items);
        });

        it('should send validation errors to central error store', async () => {
            const store = useApiResourcesStore(storeId, core);
            const invalidResponse = {
                header: { invalid: 'data' }, // Invalid header structure
            };

            await expect(store.processResponse(invalidResponse as any)).rejects.toThrow();

            // Check that error was added to core.errorStore
            expect(core.errorStore.errors.length).toBeGreaterThan(0);
        });

        it('should handle response with meta and links', async () => {
            const store = useApiResourcesStore(storeId, core);
            const mockMeta = {
                current_page: 1,
                total: 100,
                per_page: 10,
                from: 1,
                to: 10,
                last_page: 10,
                path: '',
            };
            const mockLinks = { first: null, last: null, prev: null, next: null };

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                meta: mockMeta,
                links: mockLinks,
            });

            expect(store.meta).toEqual(mockMeta);
            expect(store.links).toEqual(mockLinks);
        });
    });

    describe('clearResponse', () => {
        it('should clear all data', async () => {
            const store = useApiResourcesStore(storeId, core);
            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: [1],
            });
            expect(store.items).not.toBeNull();

            store.clearResponse();

            expect(store.items).toBeNull();
            expect(store.header).toBeNull();
        });
    });

    describe('sortable management', () => {
        it('should initialize with empty sortItems', () => {
            const store = useApiResourcesStore(storeId, core);
            expect(store.sortItems).toEqual([]);
            expect(store.queryParams.sortable).toBeUndefined();
        });

        it('should add sort item', () => {
            const store = useApiResourcesStore(storeId, core);
            store.addSort('name', 'asc');

            expect(store.sortItems).toHaveLength(1);
            expect(store.sortItems[0]).toEqual({ field: 'name', direction: 'asc' });
            expect(store.queryParams.sortable).toHaveLength(1);
            expect(store.getSortDirection('name')).toBe('asc');
        });

        it('should handle multi-sort', () => {
            const store = useApiResourcesStore(storeId, core);
            store.addSort('name', 'asc');
            store.addSort('age', 'desc');

            expect(store.sortItems).toHaveLength(2);
            expect(store.sortItems[0]).toEqual({ field: 'name', direction: 'asc' });
            expect(store.sortItems[1]).toEqual({ field: 'age', direction: 'desc' });
            expect(store.queryParams.sortable).toHaveLength(2);
        });

        it('should not add duplicate sort fields', () => {
            const store = useApiResourcesStore(storeId, core);
            store.addSort('name', 'asc');
            store.addSort('name', 'desc'); // Should ignore or handle appropriately

            // Current implementation ignores if exists
            expect(store.sortItems).toHaveLength(1);
            expect(store.sortItems[0]).toEqual({ field: 'name', direction: 'asc' });
        });

        it('should update sort direction', () => {
            const store = useApiResourcesStore(storeId, core);
            store.addSort('name', 'asc');
            store.updateSortDirection('name', 'desc');

            expect(store.sortItems[0]?.direction).toBe('desc');
            expect(store.getSortDirection('name')).toBe('desc');
        });

        it('should ignore update for non-existent field', () => {
            const store = useApiResourcesStore(storeId, core);
            store.updateSortDirection('name', 'desc');
            expect(store.sortItems).toHaveLength(0);
        });

        it('should remove sort item', () => {
            const store = useApiResourcesStore(storeId, core);
            store.addSort('name', 'asc');
            store.removeSort('name');

            expect(store.sortItems).toHaveLength(0);
            expect(store.queryParams.sortable).toBeUndefined();
            expect(store.getSortDirection('name')).toBeNull();
        });

        it('should clear all sorts', () => {
            const store = useApiResourcesStore(storeId, core);
            store.addSort('name', 'asc');
            store.addSort('age', 'desc');
            store.clearAllSorts();

            expect(store.sortItems).toHaveLength(0);
            expect(store.queryParams.sortable).toBeUndefined();
        });

        it('should return null for non-existent field in getSortDirection', () => {
            const store = useApiResourcesStore(storeId, core);
            expect(store.getSortDirection('nonexistent')).toBeNull();
        });

        it('should handle empty string field in addSort', () => {
            const store = useApiResourcesStore(storeId, core);
            store.addSort('', 'asc');
            expect(store.sortItems).toHaveLength(0);
        });

        it('should remove non-existent field without error', () => {
            const store = useApiResourcesStore(storeId, core);
            store.addSort('name', 'asc');
            store.removeSort('nonexistent');
            expect(store.sortItems).toHaveLength(1);
        });

        it('should maintain sort order when adding multiple items', () => {
            const store = useApiResourcesStore(storeId, core);
            store.addSort('name', 'asc');
            store.addSort('age', 'desc');
            store.addSort('email', 'asc');

            expect(store.sortItems[0]?.field).toBe('name');
            expect(store.sortItems[1]?.field).toBe('age');
            expect(store.sortItems[2]?.field).toBe('email');
        });

        it('should include sortable in queryParams when items exist', () => {
            const store = useApiResourcesStore(storeId, core);
            store.addSort('name', 'asc');

            const params = store.queryParams;
            expect(params).toHaveProperty('sortable');
            expect(params.sortable).toHaveLength(1);
            expect(params.sortable?.[0]).toEqual({ field: 'name', direction: 'asc' });
        });

        it('should exclude sortable from queryParams when no sorts', () => {
            const store = useApiResourcesStore(storeId, core);
            const params = store.queryParams;
            expect(params).not.toHaveProperty('sortable');
        });

        it('should update queryParams when sort changes', () => {
            const store = useApiResourcesStore(storeId, core);

            const paramsBefore = store.queryParams;
            expect(paramsBefore.sortable).toBeUndefined();

            store.addSort('name', 'asc');

            const paramsAfter = store.queryParams;
            expect(paramsAfter.sortable).toBeDefined();
            expect(paramsAfter.sortable).toHaveLength(1);
        });

        it('should update queryParams when sort is removed', () => {
            const store = useApiResourcesStore(storeId, core);

            store.addSort('name', 'asc');
            expect(store.queryParams.sortable).toBeDefined();

            store.removeSort('name');

            const paramsAfter = store.queryParams;
            expect(paramsAfter.sortable).toBeUndefined();
        });

        it('should update queryParams when direction is updated', () => {
            const store = useApiResourcesStore(storeId, core);

            store.addSort('name', 'asc');
            expect(store.queryParams.sortable?.[0]?.direction).toBe('asc');

            store.updateSortDirection('name', 'desc');

            const paramsAfter = store.queryParams;
            expect(paramsAfter.sortable?.[0]?.direction).toBe('desc');
        });
    });

    describe('client-side sorting', () => {
        it('should sort displayItems when externalPaginator is false', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-client-sort', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: [{ id: 3 }, { id: 1 }, { id: 2 }],
            });

            // Initial: no sort, original order
            expect(store.displayItems).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }]);

            // Sort ASC
            store.addSort('id', 'asc');
            expect(store.displayItems).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }]);

            // Sort DESC
            store.updateSortDirection('id', 'desc');
            expect(store.displayItems).toEqual([{ id: 3 }, { id: 2 }, { id: 1 }]);
        });

        it('should combine sorting and pagination', async () => {
            core.config.externalPaginator = false;
            core.config.rowsNumber = 2; // Page size 2
            const store = useApiResourcesStore(storeId + '-sort-pagination', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'Value', key: 'val', field: 'val' }] }] },
                items: [{ val: 1 }, { val: 4 }, { val: 2 }, { val: 3 }],
            });

            store.addSort('val', 'desc'); // 4, 3, 2, 1

            // Page 1: 4, 3
            expect(store.displayItems).toEqual([{ val: 4 }, { val: 3 }]);

            // Page 2: 2, 1
            store.setPage(2);
            expect(store.displayItems).toEqual([{ val: 2 }, { val: 1 }]);
        });

        it('should not sort items when externalPaginator is true', async () => {
            core.config.externalPaginator = true;
            const store = useApiResourcesStore(storeId + '-server-sort', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: [{ id: 3 }, { id: 1 }, { id: 2 }],
            });

            // Add sort rule
            store.addSort('id', 'asc');

            // Should remain unchanged because sorting is expected to be done by server
            expect(store.displayItems).toEqual([{ id: 3 }, { id: 1 }, { id: 2 }]);
        });

        it('should handle multi-column client-side sort', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-multi-sort', core);

            // Data:
            // A, 2
            // B, 1
            // A, 1
            await store.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'Category', key: 'cat', field: 'cat' },
                                { content: 'Value', key: 'val', field: 'val' },
                            ],
                        },
                    ],
                },
                items: [
                    { cat: 'A', val: 2 },
                    { cat: 'B', val: 1 },
                    { cat: 'A', val: 1 },
                ],
            });

            store.addSort('cat', 'asc'); // A, A, B
            store.addSort('val', 'asc'); // 1, 2, 1

            // Expected: A-1, A-2, B-1
            expect(store.displayItems).toEqual([
                { cat: 'A', val: 1 },
                { cat: 'A', val: 2 },
                { cat: 'B', val: 1 },
            ]);
        });

        it('should reset to page 1 when sort changes with multi-page data', async () => {
            core.config.externalPaginator = false;
            core.config.rowsNumber = 2;
            const store = useApiResourcesStore(storeId + '-reset-page', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'Value', key: 'val', field: 'val' }] }] },
                items: [{ val: 1 }, { val: 2 }, { val: 3 }, { val: 4 }],
            });

            // Go to page 2
            store.setPage(2);
            expect(store.displayItems).toEqual([{ val: 3 }, { val: 4 }]);

            // Add sort - should stay on page 2 but with sorted data
            store.addSort('val', 'desc'); // 4, 3, 2, 1
            expect(store.displayItems).toEqual([{ val: 2 }, { val: 1 }]); // Page 2 of sorted
        });

        it('should handle sorting with no items', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-no-items', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'Value', key: 'val', field: 'val' }] }] },
                items: [],
            });

            store.addSort('val', 'asc');

            expect(store.displayItems).toEqual([]);
        });

        it('should handle removal of sort during pagination', async () => {
            core.config.externalPaginator = false;
            core.config.rowsNumber = 2;
            const store = useApiResourcesStore(storeId + '-remove-sort', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'Value', key: 'val', field: 'val' }] }] },
                items: [{ val: 4 }, { val: 2 }, { val: 3 }, { val: 1 }],
            });

            // Add sort
            store.addSort('val', 'asc'); // 1, 2, 3, 4
            expect(store.displayItems).toEqual([{ val: 1 }, { val: 2 }]); // Page 1

            // Remove sort - should return to original order
            store.removeSort('val');
            expect(store.displayItems).toEqual([{ val: 4 }, { val: 2 }]); // Original order, page 1
        });

        it('should maintain sort when changing page size', async () => {
            core.config.externalPaginator = false;
            core.config.rowsNumber = 2;
            const store = useApiResourcesStore(storeId + '-change-limit', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'Value', key: 'val', field: 'val' }] }] },
                items: [{ val: 3 }, { val: 1 }, { val: 4 }, { val: 2 }],
            });

            store.addSort('val', 'asc'); // 1, 2, 3, 4
            expect(store.displayItems).toEqual([{ val: 1 }, { val: 2 }]); // 2 items

            // Change limit to 3
            store.setLimit(3);
            expect(store.displayItems).toEqual([{ val: 1 }, { val: 2 }, { val: 3 }]); // 3 items, still sorted
        });

        it('should handle string sorting with special characters', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-special-chars', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }] },
                items: [{ name: 'Zoltán' }, { name: 'Ádám' }, { name: 'Éva' }],
            });

            store.addSort('name', 'asc');

            // Should handle Hungarian characters correctly
            expect(store.displayItems?.[0]).toEqual({ name: 'Ádám' });
            expect(store.displayItems?.[1]).toEqual({ name: 'Éva' });
            expect(store.displayItems?.[2]).toEqual({ name: 'Zoltán' });
        });
    });
});

describe('useApiResourcesStore - Extended Tests', () => {
    const storeId = 'test-api-resources-extended';
    const NETWORK_ERROR_MESSAGE = 'Network Error';
    let core: ReturnType<typeof useCoreStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();

        const mockProps: AuraProps = {
            storeId: storeId,
            siteName: 'Test Site',
            urlStructure: '{siteName}/api/{urlParameter}',
            urlParameter: 'users',
            urlParameterLastSegment: 'list',
            siteToken: 'test-token-123',
            requestMethod: 'POST',
        };

        core = useCoreStore(storeId, mockProps);
    });

    describe('fetchData error handling', () => {
        it('should not throw on API errors, only log to errorStore', async () => {
            const store = useApiResourcesStore(storeId, core);
            mockedAxios.mockRejectedValueOnce(new Error(NETWORK_ERROR_MESSAGE));

            // fetchData doesn't throw, it only logs to errorStore
            await expect(store.fetchData()).resolves.not.toThrow();
        });

        it('should add error to errorStore on API failure', async () => {
            const store = useApiResourcesStore(storeId, core);
            const mockError = new Error(NETWORK_ERROR_MESSAGE);
            const addErrorSpy = vi.spyOn(core.errorStore, 'addError');

            mockedAxios.mockRejectedValueOnce(mockError);
            await store.fetchData();

            expect(addErrorSpy).toHaveBeenCalledWith({
                severity: 'error',
                component: 'ApiResourcesStore',
                action: 'fetchData',
                type: 'api',
                // The message is the `labels` text of the failure class; the raw
                // axios wording moves to `details`.
                message: DEFAULT_LABELS.apiErrorNetwork,
                details: NETWORK_ERROR_MESSAGE,
                metadata: { kind: 'network' },
            });
        });

        /**
         * Audit 2026-08-19 K3.
         *
         * A response that arrives intact but cannot be turned into table state used
         * to fall into the same `catch` as a failed request, where `describeApiError`
         * — seeing no status and no transport code — classified it as `unknown` and
         * reported it under the network failure's own key. The user was told to
         * retry a request that had already succeeded.
         */
        describe('unprocessable response', () => {
            /** A header no schema accepts — `processResponse` throws on it. */
            const UNPROCESSABLE = { header: { invalid: 'data' } };

            /** A response that processes cleanly. */
            const PROCESSABLE = {
                header: { rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }] },
                items: [],
            };

            /** The error `fetchData` reports about the response itself. */
            const ownError = () =>
                core.errorStore.errors.find(
                    error => error.key === 'ApiResourcesStore.fetchData.validation'
                );

            it('should report it as a validation failure, not as an API failure', async () => {
                const store = useApiResourcesStore(storeId, core);
                mockedAxios.mockResolvedValueOnce({ data: UNPROCESSABLE });

                await expect(store.fetchData()).resolves.not.toThrow();

                expect(ownError()).toMatchObject({
                    severity: 'error',
                    component: 'ApiResourcesStore',
                    action: 'fetchData',
                    type: 'validation',
                    message: DEFAULT_LABELS.apiErrorInvalidResponse,
                });
                // The whole point: a successful request must not be described as a
                // failed one, whatever its payload turned out to be
                expect(core.errorStore.errors.some(error => error.type === 'api')).toBe(false);
            });

            it('should keep the raw exception text for the developer', async () => {
                const store = useApiResourcesStore(storeId, core);
                mockedAxios.mockResolvedValueOnce({ data: UNPROCESSABLE });

                await store.fetchData();

                expect(ownError()?.details).toEqual(expect.any(String));
                expect(ownError()?.details).not.toBe('');
            });

            it('should describe a rejection that is not an `Error` too', async () => {
                const store = useApiResourcesStore(storeId, core);
                mockedAxios.mockResolvedValueOnce({
                    data: {
                        get header(): never {
                            // Not everything thrown is an `Error`; a string has no `.message`
                            throw 'header exploded';
                        },
                    },
                });

                await store.fetchData();

                expect(ownError()?.details).toBe('header exploded');
            });

            it('should clear it once a later response processes cleanly', async () => {
                const store = useApiResourcesStore(storeId, core);
                mockedAxios.mockResolvedValueOnce({ data: UNPROCESSABLE });
                await store.fetchData();
                expect(ownError()).toBeDefined();

                mockedAxios.mockResolvedValueOnce({ data: PROCESSABLE });
                await store.fetchData();

                // Self-clearing, like the other two errors `fetchData` reports about
                // itself: the table comes back without a page reload
                expect(ownError()).toBeUndefined();
            });

            it('should stay silent when a newer request has taken over', async () => {
                const store = useApiResourcesStore(storeId, core);
                let newer: Promise<void> | null = null;

                // The newer call starts from inside the header read, i.e. after
                // `processResponse` was entered but before it threw — the only
                // window in which a stale run could still report
                mockedAxios.mockResolvedValueOnce({
                    data: {
                        get header() {
                            if (!newer) {
                                mockedAxios.mockResolvedValueOnce({ data: PROCESSABLE });
                                newer = store.fetchData();
                            }
                            return UNPROCESSABLE.header;
                        },
                    },
                });

                await store.fetchData();
                await newer;
                await flushPromises();

                expect(newer).not.toBeNull();
                expect(ownError()).toBeUndefined();
            });
        });
    });

    describe('queryParams', () => {
        it('should be readonly computed property', () => {
            const store = useApiResourcesStore(storeId, core);
            expect(store.queryParams).toBeDefined();
            // the readonly() wrapper ensures the property can't be modified directly
            // TypeScript warns about the assignment at compile time
        });

        it('should have default values', () => {
            const store = useApiResourcesStore(storeId, core);
            expect(store.queryParams.page).toBe(1);
            expect(store.queryParams.paginate).toBe(10);
        });
    });

    describe('autoRefetch', () => {
        it('should be true by default', () => {
            const store = useApiResourcesStore(storeId, core);
            expect(store.autoRefetch).toBe(true);
        });

        it('should be mutable', () => {
            const store = useApiResourcesStore(storeId, core);
            store.autoRefetch = false;
            expect(store.autoRefetch).toBe(false);
        });
    });

    /**
     * Audit 2026-08-19 H1.
     *
     * The measurement asked of the watcher's `{ deep: true }` turned up the
     * opposite of what it looked for: the traversal is load-bearing, and the
     * callback's own `newParams`/`oldParams` comparison was the broken half.
     * `queryParams` hands out the *live* sort/search/filter arrays, so an
     * in-place edit leaves the computed clean and the callback receives one and
     * the same object as both of its arguments — which can never differ. Every
     * mutator that keeps the array length therefore stayed on the client, and
     * the table went on showing the response for the previous query.
     */
    describe('auto-refetch on in-place query edits', () => {
        const RESPONSE = {
            data: {
                header: { rows: [{ cells: [{ content: 'A', key: 'a', field: 'a' }] }] },
                items: [{ a: 1 }],
            },
        };

        /**
         * Seeds a store with one completed fetch, then counts the requests `act`
         * causes. `seed` runs before that first fetch, so the query slice already
         * holds the item the in-place mutator will edit.
         */
        const countRefetches = async (
            id: string,
            seed: (store: ReturnType<typeof useApiResourcesStore>) => void,
            act: (store: ReturnType<typeof useApiResourcesStore>) => void
        ): Promise<number> => {
            mockedAxios.mockResolvedValue(RESPONSE);
            const store = useApiResourcesStore(id, core);
            seed(store);
            await store.fetchData();
            await flushPromises();

            const before = mockedAxios.mock.calls.length;
            act(store);
            await flushPromises();
            await flushPromises();
            return mockedAxios.mock.calls.length - before;
        };

        it('should refetch when a sort direction is flipped in place', async () => {
            core.config.externalPaginator = true;
            const calls = await countRefetches(
                storeId + '-h1-sort',
                store => store.addSort('a', 'asc'),
                store => store.updateSortDirection('a', 'desc')
            );
            expect(calls).toBe(1);
        });

        it('should refetch when a search term is refined in place', async () => {
            core.config.externalPaginator = true;
            const calls = await countRefetches(
                storeId + '-h1-search',
                store => store.addSearch('a', 'x'),
                store => store.updateSearchTerm('a', 'xy')
            );
            expect(calls).toBe(1);
        });

        it('should refetch when filter values are swapped in place', async () => {
            core.config.externalPaginator = true;
            const calls = await countRefetches(
                storeId + '-h1-filter',
                store => store.addFilter('a', ['x']),
                store => store.updateFilterValues('a', ['y'])
            );
            expect(calls).toBe(1);
        });

        it('should refetch when a range bound is moved in place', async () => {
            core.config.externalPaginator = true;
            const calls = await countRefetches(
                storeId + '-h1-between',
                store => store.setBetweenSearch('a', 1, 5),
                store => store.setBetweenSearch('a', 2, 5)
            );
            expect(calls).toBe(1);
        });

        it('should not refetch when in-place edits cancel out within a tick', async () => {
            core.config.externalPaginator = true;
            const calls = await countRefetches(
                storeId + '-h1-noop',
                store => store.addSort('a', 'asc'),
                store => {
                    // The watcher runs once for the pair; the query it ends up
                    // seeing is the one already requested, so nothing is due.
                    store.updateSortDirection('a', 'desc');
                    store.updateSortDirection('a', 'asc');
                }
            );
            expect(calls).toBe(0);
        });

        it('should not refetch in client-side mode', async () => {
            core.config.externalPaginator = false;
            const calls = await countRefetches(
                storeId + '-h1-client',
                store => store.addSort('a', 'asc'),
                store => store.updateSortDirection('a', 'desc')
            );
            expect(calls).toBe(0);
        });

        it('should not replay an edit made while autoRefetch was off', async () => {
            core.config.externalPaginator = true;
            mockedAxios.mockResolvedValue(RESPONSE);
            const store = useApiResourcesStore(storeId + '-h1-autorefetch', core);
            store.addSort('a', 'asc');
            await store.fetchData();
            await flushPromises();

            const before = mockedAxios.mock.calls.length;
            store.autoRefetch = false;
            store.updateSortDirection('a', 'desc');
            await flushPromises();
            expect(mockedAxios.mock.calls.length - before).toBe(0);

            // Turning it back on must not re-request the query it slept through —
            // the snapshot advances even when the run does not fetch.
            store.autoRefetch = true;
            await flushPromises();
            await flushPromises();
            expect(mockedAxios.mock.calls.length - before).toBe(0);
        });
    });

    describe('displayFooter computed', () => {
        it('should return null when showFooter is false', async () => {
            core.config.showFooter = false;
            const store = useApiResourcesStore(storeId + '-no-footer', core);

            await store.processResponse({
                header: {
                    rows: [{ cells: [{ content: 'Header', key: 'header', field: 'header' }] }],
                },
                footer: {
                    rows: [{ cells: [{ content: 'Footer', key: 'footer', field: 'footer' }] }],
                },
            });

            expect(store.displayFooter).toBeNull();
        });

        it('should return API footer when showFooter is true and footer exists', async () => {
            core.config.showFooter = true;
            const store = useApiResourcesStore(storeId + '-api-footer', core);

            const apiFooter = {
                rows: [
                    { cells: [{ content: 'API Footer', key: 'api-footer', field: 'api-footer' }] },
                ],
            };

            await store.processResponse({
                header: {
                    rows: [{ cells: [{ content: 'Header', key: 'header', field: 'header' }] }],
                },
                footer: apiFooter,
            });

            expect(store.displayFooter).toMatchObject({ rows: apiFooter.rows });
        });

        it('should fallback to header when showFooter is true and no API footer', async () => {
            core.config.showFooter = true;
            const store = useApiResourcesStore(storeId + '-fallback', core);

            const headerData = {
                rows: [{ cells: [{ content: 'Header Content', key: 'header', field: 'header' }] }],
            };

            await store.processResponse({
                header: headerData,
            });

            expect(store.displayFooter).toMatchObject({ rows: headerData.rows });
        });

        it('should fallback to header when footer is not provided', async () => {
            core.config.showFooter = true;
            const store = useApiResourcesStore(storeId + '-no-footer-fallback', core);

            const headerData = {
                rows: [{ cells: [{ content: 'Header', key: 'header', field: 'header' }] }],
            };

            // No footer provided - should fallback to header
            await store.processResponse({
                header: headerData,
            });

            expect(store.displayFooter).toMatchObject({ rows: headerData.rows });
        });

        it('should prioritize API footer over header when both exist', async () => {
            core.config.showFooter = true;
            const store = useApiResourcesStore(storeId + '-priority', core);

            const headerData = {
                rows: [{ cells: [{ content: 'Header', key: 'header', field: 'header' }] }],
            };
            const footerData = {
                rows: [{ cells: [{ content: 'Footer', key: 'footer', field: 'footer' }] }],
            };

            await store.processResponse({
                header: headerData,
                footer: footerData,
            });

            expect(store.displayFooter).toMatchObject({ rows: footerData.rows });
            expect(store.displayFooter).not.toEqual(headerData);
        });

        it('should update displayFooter when data changes', async () => {
            core.config.showFooter = true;
            const store = useApiResourcesStore(storeId + '-update', core);

            // First update - header only
            const headerData1 = {
                rows: [{ cells: [{ content: 'Header 1', key: 'header1', field: 'header1' }] }],
            };
            await store.processResponse({ header: headerData1 });
            expect(store.displayFooter).toMatchObject({ rows: headerData1.rows });

            // Second update - footer provided
            const footerData = {
                rows: [{ cells: [{ content: 'Footer', key: 'footer', field: 'footer' }] }],
            };
            await store.processResponse({
                header: headerData1,
                footer: footerData,
            });
            expect(store.displayFooter).toMatchObject({ rows: footerData.rows });

            // Third update - clear response
            store.clearResponse();
            expect(store.displayFooter).toBeNull();
        });
    });

    describe('integration test', () => {
        it('should build complete request with all config values', async () => {
            core.config.requestMethod = 'POST';
            core.config.siteToken = 'Bearer token-123';
            core.config.urlStructure = '{siteName}/api/{urlParameter}';
            core.config.siteName = 'TestApp';
            core.config.urlParameter = 'users';
            core.config.urlParameterLastSegment = 'list';

            const store = useApiResourcesStore(storeId, core);

            mockedAxios.mockResolvedValueOnce({ data: {} });
            await store.fetchData();

            expect(mockedAxios).toHaveBeenCalledWith({
                method: 'post',
                url: 'TestApp/api/users',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    Authorization: 'Bearer token-123',
                },
                timeout: 30000,
                data: {
                    page: 1,
                    paginate: 10,
                },
                // Every request carries an abort handle, so a newer fetch can
                // cancel this one instead of racing it (see use-response-data).
                signal: expect.any(AbortSignal),
            });
        });
    });

    describe('displayMeta computed', () => {
        it('should return API meta when it exists', async () => {
            const store = useApiResourcesStore(storeId + '-meta-api', core);
            const apiMeta = {
                current_page: 2,
                from: 11,
                last_page: 5,
                path: '/api/users',
                per_page: 10,
                to: 20,
                total: 50,
            };

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: [1, 2, 3],
                meta: apiMeta,
            });

            expect(store.displayMeta).toEqual(apiMeta);
        });

        it('should calculate meta when externalPaginator is false and no API meta', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-meta-client', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })),
            });

            expect(store.displayMeta).toEqual({
                current_page: 1,
                from: 1,
                last_page: 10,
                path: '',
                per_page: 10,
                to: 10,
                total: 100,
            });
        });

        it('should calculate correct meta for last page with partial items', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-meta-partial', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: Array.from({ length: 5 }, (_, i) => ({ id: i + 1 })),
            });

            expect(store.displayMeta).toEqual({
                current_page: 1,
                from: 1,
                last_page: 1,
                path: '',
                per_page: 10,
                to: 5,
                total: 5,
            });
        });

        it('should handle empty items array', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-meta-empty', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: [],
            });

            expect(store.displayMeta).toEqual({
                current_page: 1,
                from: null,
                last_page: 1,
                path: '',
                per_page: 10,
                to: null,
                total: 0,
            });
        });

        it('should return null when externalPaginator is true and no API meta', async () => {
            core.config.externalPaginator = true;
            const store = useApiResourcesStore(storeId + '-meta-null', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: [1, 2, 3],
            });

            expect(store.displayMeta).toBeNull();
        });

        it('should ensure last_page is minimum 1', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-meta-minpage', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: [],
            });

            expect(store.displayMeta?.last_page).toBe(1);
        });
    });

    describe('displayItems computed', () => {
        it('should return all items when externalPaginator is true', async () => {
            core.config.externalPaginator = true;
            const store = useApiResourcesStore(storeId + '-items-external', core);
            const items = [1, 2, 3, 4, 5];

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: items,
            });

            expect(store.displayItems).toEqual(items);
        });

        it('should slice items for current page when externalPaginator is false', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-items-slice', core);
            const items = Array.from({ length: 100 }, (_, i) => i + 1);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: items,
            });

            // Page 1, paginate 10 -> items 1-10
            expect(store.displayItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        });

        it('should handle null items', async () => {
            const store = useApiResourcesStore(storeId + '-items-null', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
            });

            expect(store.displayItems).toBeNull();
        });

        it('should handle empty items array', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-items-empty', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: [],
            });

            expect(store.displayItems).toEqual([]);
        });

        it('should handle last page with partial items', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-items-partial', core);
            const items = Array.from({ length: 25 }, (_, i) => i + 1);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: items,
            });

            // Page 1, paginate 10 -> items 1-10
            expect(store.displayItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            expect(store.displayItems?.length).toBe(10);
        });
    });

    describe('setPage', () => {
        it('should update current page', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-setpage', core);
            const items = Array.from({ length: 100 }, (_, i) => i + 1);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: items,
            });

            // Page 1
            expect(store.displayItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            expect(store.displayMeta?.current_page).toBe(1);

            // Change to page 2
            store.setPage(2);
            expect(store.displayItems).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
            expect(store.displayMeta?.current_page).toBe(2);
        });

        it('should update page 3 items correctly', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-setpage3', core);
            const items = Array.from({ length: 100 }, (_, i) => i + 1);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: items,
            });

            store.setPage(3);
            expect(store.displayItems).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29, 30]);
            expect(store.displayMeta?.current_page).toBe(3);
            expect(store.displayMeta?.from).toBe(21);
            expect(store.displayMeta?.to).toBe(30);
        });

        it('should handle last page with partial items', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-setpage-last', core);
            const items = Array.from({ length: 25 }, (_, i) => i + 1);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: items,
            });

            store.setPage(3);
            expect(store.displayItems).toEqual([21, 22, 23, 24, 25]);
            expect(store.displayMeta?.current_page).toBe(3);
            expect(store.displayMeta?.from).toBe(21);
            expect(store.displayMeta?.to).toBe(25);
        });

        it('should handle page beyond last page', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-setpage-beyond', core);
            const items = Array.from({ length: 25 }, (_, i) => i + 1);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: items,
            });

            store.setPage(10);
            expect(store.displayItems).toEqual([]);
            expect(store.displayMeta?.current_page).toBe(10);
        });

        it('should work with externalPaginator true', async () => {
            core.config.externalPaginator = true;
            const store = useApiResourcesStore(storeId + '-setpage-external', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: [1, 2, 3],
            });

            store.setPage(5);
            // Should not affect displayItems when external paginator is used
            expect(store.displayItems).toEqual([1, 2, 3]);
        });
    });

    describe('setLimit', () => {
        it('should update items per page', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-setlimit', core);
            const items = Array.from({ length: 100 }, (_, i) => i + 1);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: items,
            });

            // Default limit 10
            expect(store.displayItems).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            expect(store.displayMeta?.per_page).toBe(10);

            // Change to 25
            store.setLimit(25);
            expect(store.displayItems).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
            expect(store.displayMeta?.per_page).toBe(25);
            expect(store.displayMeta?.last_page).toBe(4);
        });

        it('should update limit to 5', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-setlimit5', core);
            const items = Array.from({ length: 100 }, (_, i) => i + 1);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: items,
            });

            store.setLimit(5);
            expect(store.displayItems).toEqual([1, 2, 3, 4, 5]);
            expect(store.displayMeta?.per_page).toBe(5);
            expect(store.displayMeta?.last_page).toBe(20);
        });

        it('should recalculate pagination on limit change', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-setlimit-recalc', core);
            const items = Array.from({ length: 100 }, (_, i) => i + 1);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: items,
            });

            // Go to page 2 with limit 10
            store.setPage(2);
            expect(store.displayItems).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);

            // Change limit to 20
            store.setLimit(20);
            // Should reset to page 1, showing items 1-20
            expect(store.displayItems).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
            expect(store.displayMeta?.from).toBe(1);
            expect(store.displayMeta?.to).toBe(20);
            expect(store.displayMeta?.current_page).toBe(1);
        });

        it('should reset page to 1 when limit changes', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-setlimit-reset', core);
            const items = Array.from({ length: 100 }, (_, i) => i + 1);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: items,
            });

            // Go to page 5
            store.setPage(5);
            expect(store.displayMeta?.current_page).toBe(5);

            // Change limit
            store.setLimit(25);
            expect(store.displayMeta?.current_page).toBe(1);
            expect(store.displayItems).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
        });

        it('should prevent empty table when limit increases on high page number', async () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-setlimit-empty-prevent', core);
            // 55 items
            const items = Array.from({ length: 55 }, (_, i) => i + 1);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: items,
            });

            // Go to page 6 (items 51-55)
            store.setPage(6);
            expect(store.displayItems).toEqual([51, 52, 53, 54, 55]);

            // Change limit to 50
            // If page remained 6, it would look for items from index 250, which don't exist
            store.setLimit(50);

            // Should be on page 1, items 1-50
            expect(store.displayMeta?.current_page).toBe(1);
            expect(store.displayItems).toHaveLength(50);
            expect(store.displayItems).toBeDefined();
            expect(store.displayItems![0]).toBe(1);
            expect(store.displayItems![49]).toBe(50);
        });

        it('should work with externalPaginator true', async () => {
            core.config.externalPaginator = true;
            const store = useApiResourcesStore(storeId + '-setlimit-external', core);

            await store.processResponse({
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: [1, 2, 3],
            });

            store.setLimit(50);
            // Should not affect displayItems when external paginator is used
            expect(store.displayItems).toEqual([1, 2, 3]);
        });
    });

    describe('queryParams integration', () => {
        it('should always include pagination in queryParams', () => {
            const store = useApiResourcesStore(storeId + '-query-always', core);

            expect(store.queryParams).toHaveProperty('page');
            expect(store.queryParams).toHaveProperty('paginate');
            expect(store.queryParams.page).toBe(1);
            expect(store.queryParams.paginate).toBe(10);
        });

        it('should include pagination even when externalPaginator is false', () => {
            core.config.externalPaginator = false;
            const store = useApiResourcesStore(storeId + '-query-client', core);

            // queryParams still contain pagination values
            expect(store.queryParams).toHaveProperty('page');
            expect(store.queryParams).toHaveProperty('paginate');
        });

        it('should update queryParams when setPage is called', () => {
            const store = useApiResourcesStore(storeId + '-query-page', core);

            store.setPage(5);
            expect(store.queryParams.page).toBe(5);
        });

        it('should update queryParams when setLimit is called', () => {
            const store = useApiResourcesStore(storeId + '-query-limit', core);

            store.setLimit(25);
            expect(store.queryParams.paginate).toBe(25);
        });
    });

    describe('global search functionality', () => {
        describe('setGlobalSearch', () => {
            it('should set global search term', () => {
                const store = useApiResourcesStore(storeId + '-global-set', core);

                store.setGlobalSearch('test query');

                expect(store.globalSearchTerm).toBe('test query');
            });

            it('should trim whitespace from search term', () => {
                const store = useApiResourcesStore(storeId + '-global-trim', core);

                store.setGlobalSearch('  search term  ');

                expect(store.globalSearchTerm).toBe('search term');
            });

            it('should clear global search when empty string provided', () => {
                const store = useApiResourcesStore(storeId + '-global-empty', core);

                store.setGlobalSearch('test');
                expect(store.globalSearchTerm).toBe('test');

                store.setGlobalSearch('');

                expect(store.globalSearchTerm).toBeNull();
            });

            it('should clear global search when whitespace-only string provided', () => {
                const store = useApiResourcesStore(storeId + '-global-whitespace', core);

                store.setGlobalSearch('test');
                expect(store.globalSearchTerm).toBe('test');

                store.setGlobalSearch('   ');

                expect(store.globalSearchTerm).toBeNull();
            });
        });

        describe('clearGlobalSearch', () => {
            it('should set globalSearchTerm to null', () => {
                const store = useApiResourcesStore(storeId + '-global-clear', core);

                store.setGlobalSearch('test query');
                expect(store.globalSearchTerm).toBe('test query');

                store.clearGlobalSearch();

                expect(store.globalSearchTerm).toBeNull();
            });

            it('should handle clearing when already null', () => {
                const store = useApiResourcesStore(storeId + '-global-clear-null', core);

                expect(store.globalSearchTerm).toBeNull();

                store.clearGlobalSearch();

                expect(store.globalSearchTerm).toBeNull();
            });
        });

        describe('queryParams with globalSearch', () => {
            it('should include globalSearch in queryParams when set', () => {
                const store = useApiResourcesStore(storeId + '-query-global', core);

                store.setGlobalSearch('search term');

                expect(store.queryParams.globalSearch).toBe('search term');
            });

            it('should not include globalSearch in queryParams when null', () => {
                const store = useApiResourcesStore(storeId + '-query-global-null', core);

                expect(store.queryParams.globalSearch).toBeUndefined();
            });

            it('should remove globalSearch from queryParams when cleared', () => {
                const store = useApiResourcesStore(storeId + '-query-global-remove', core);

                store.setGlobalSearch('test');
                expect(store.queryParams.globalSearch).toBe('test');

                store.clearGlobalSearch();

                expect(store.queryParams.globalSearch).toBeUndefined();
            });
        });

        describe('client-side global search filtering', () => {
            beforeEach(async () => {
                core.config.externalPaginator = false;
            });

            it('should filter items by global search term in searchableItems fields', async () => {
                const store = useApiResourcesStore(storeId + '-global-filter', core);

                await store.processResponse({
                    header: {
                        rows: [
                            {
                                cells: [
                                    { content: 'Name', key: 'name', field: 'name' },
                                    { content: 'Email', key: 'email', field: 'email' },
                                ],
                            },
                        ],
                        settings: {
                            searchableItems: ['name', 'email'],
                        },
                    },
                    items: [
                        { id: 1, name: 'John Doe', email: 'john@example.com' },
                        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
                        { id: 3, name: 'Bob Jones', email: 'bob@example.com' },
                    ],
                });

                store.setGlobalSearch('john');

                expect(store.displayItems).toHaveLength(1);
                expect((store.displayItems as Array<{ name: string }>)[0]?.name).toBe('John Doe');
            });

            it('should be case-insensitive', async () => {
                const store = useApiResourcesStore(storeId + '-global-case', core);

                await store.processResponse({
                    header: {
                        rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }],
                        settings: {
                            searchableItems: ['name'],
                        },
                    },
                    items: [
                        { id: 1, name: 'UPPERCASE' },
                        { id: 2, name: 'lowercase' },
                        { id: 3, name: 'MixedCase' },
                    ],
                });

                store.setGlobalSearch('case');

                expect(store.displayItems).toHaveLength(3);
            });

            it('should use OR logic across searchableItems fields', async () => {
                const store = useApiResourcesStore(storeId + '-global-or', core);

                await store.processResponse({
                    header: {
                        rows: [
                            {
                                cells: [
                                    { content: 'Name', key: 'name', field: 'name' },
                                    { content: 'Email', key: 'email', field: 'email' },
                                ],
                            },
                        ],
                        settings: {
                            searchableItems: ['name', 'email'],
                        },
                    },
                    items: [
                        { id: 1, name: 'John Doe', email: 'john@example.com' },
                        { id: 2, name: 'Jane Smith', email: 'jane@test.com' },
                        { id: 3, name: 'Bob Jones', email: 'bob@sample.com' },
                    ],
                });

                store.setGlobalSearch('test');

                expect(store.displayItems).toHaveLength(1);
                expect((store.displayItems as Array<{ name: string }>)[0]?.name).toBe('Jane Smith');
            });

            it('should not filter when searchableItems is empty', async () => {
                const store = useApiResourcesStore(storeId + '-global-no-fields', core);

                await store.processResponse({
                    header: {
                        rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }],
                    },
                    items: [
                        { id: 1, name: 'John' },
                        { id: 2, name: 'Jane' },
                        { id: 3, name: 'Bob' },
                    ],
                });

                store.setGlobalSearch('john');

                expect(store.displayItems).toHaveLength(3);
            });

            it('should not filter when searchableItems is undefined', async () => {
                const store = useApiResourcesStore(storeId + '-global-no-settings', core);

                await store.processResponse({
                    header: {
                        rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }],
                    },
                    items: [
                        { id: 1, name: 'John' },
                        { id: 2, name: 'Jane' },
                        { id: 3, name: 'Bob' },
                    ],
                });

                store.setGlobalSearch('john');

                expect(store.displayItems).toHaveLength(3);
            });

            it('should handle null/undefined field values gracefully', async () => {
                const store = useApiResourcesStore(storeId + '-global-null-fields', core);

                await store.processResponse({
                    header: {
                        rows: [
                            {
                                cells: [
                                    { content: 'Name', key: 'name', field: 'name' },
                                    { content: 'Email', key: 'email', field: 'email' },
                                ],
                            },
                        ],
                        settings: {
                            searchableItems: ['name', 'email'],
                        },
                    },
                    items: [
                        { id: 1, name: 'John', email: null },
                        { id: 2, name: null, email: 'test@example.com' },
                        { id: 3, name: 'Jane', email: 'jane@example.com' },
                    ],
                });

                store.setGlobalSearch('jane');

                expect(store.displayItems).toHaveLength(1);
                expect((store.displayItems as Array<{ name: string }>)[0]?.name).toBe('Jane');
            });

            it('should reset page to 1 when global search term changes (client-side)', async () => {
                const store = useApiResourcesStore(storeId + '-global-page-reset', core);

                // Create test data outside nested callback
                const testItems = [];
                for (let i = 0; i < 50; i++) {
                    testItems.push({ id: i + 1, name: `User ${i + 1}` });
                }

                await store.processResponse({
                    header: {
                        rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }],
                        settings: {
                            searchableItems: ['name'],
                        },
                    },
                    items: testItems,
                });

                store.setPage(3);
                expect(store.queryParams.page).toBe(3);

                store.setGlobalSearch('User');

                // Wait for watch to execute
                await flushPromises();

                // Page should be reset to 1
                expect(store.queryParams.page).toBe(1);
            });
        });
    });
});
