import { describe, it, expect, beforeEach, vi } from 'vitest';
import { flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { useApiResourcesStore } from '../api-resources.state';
import { useCoreStore } from '../../core/core.state';
import type { AuraProps } from '../../../types';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

/**
 * Auto-refetch gating.
 *
 * A query-param change only warrants a request in server-side mode. Client-side
 * mode re-slices the `items` it already holds, so a request there costs a
 * round-trip for a response the store throws away — and raises `loading`, which
 * is what put a loading indicator on a synchronous page change.
 */
describe('useApiResourcesStore — auto-refetch gating', () => {
    const RESPONSE = {
        data: {
            header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
            items: [{ id: 1 }, { id: 2 }, { id: 3 }],
        },
    };

    const createCore = (storeId: string, externalPaginator: boolean) => {
        const props: AuraProps = {
            storeId,
            siteName: 'Test Site',
            urlStructure: '{siteName}/api/{urlParameter}',
            urlParameter: 'users',
            externalPaginator,
            disableSession: true,
        };

        return useCoreStore(storeId, props);
    };

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        window.sessionStorage.clear();
        mockedAxios.mockResolvedValue(RESPONSE);
    });

    describe('client-side mode (externalPaginator: false)', () => {
        it('should not refetch when the page changes', async () => {
            const store = useApiResourcesStore(
                'refetch-client-page',
                createCore('refetch-client-page', false)
            );

            await store.fetchData();
            await flushPromises();
            const callsAfterInitialFetch = mockedAxios.mock.calls.length;

            store.setPage(2);
            await flushPromises();

            expect(mockedAxios.mock.calls.length).toBe(callsAfterInitialFetch);
        });

        it('should not refetch when the page size changes', async () => {
            const store = useApiResourcesStore(
                'refetch-client-limit',
                createCore('refetch-client-limit', false)
            );

            await store.fetchData();
            await flushPromises();
            const callsAfterInitialFetch = mockedAxios.mock.calls.length;

            store.setLimit(25);
            await flushPromises();

            expect(mockedAxios.mock.calls.length).toBe(callsAfterInitialFetch);
        });

        it('should not refetch when the global search term changes', async () => {
            const store = useApiResourcesStore(
                'refetch-client-search',
                createCore('refetch-client-search', false)
            );

            await store.fetchData();
            await flushPromises();
            const callsAfterInitialFetch = mockedAxios.mock.calls.length;

            store.setGlobalSearch('anything');
            await flushPromises();

            expect(mockedAxios.mock.calls.length).toBe(callsAfterInitialFetch);
        });

        // Gating the watcher must not cut off the paths that legitimately fetch:
        // the initial mount and whatever the host wires to the refresh button.
        it('should still fetch when called explicitly', async () => {
            const store = useApiResourcesStore(
                'refetch-client-explicit',
                createCore('refetch-client-explicit', false)
            );

            await store.fetchData();
            await flushPromises();
            const callsAfterInitialFetch = mockedAxios.mock.calls.length;

            await store.fetchData();
            await flushPromises();

            expect(mockedAxios.mock.calls.length).toBe(callsAfterInitialFetch + 1);
        });

        // The state still has to move — the client-side slice reads it.
        it('should still advance the page state without a request', async () => {
            const store = useApiResourcesStore(
                'refetch-client-state',
                createCore('refetch-client-state', false)
            );

            await store.fetchData();
            await flushPromises();

            store.setPage(3);
            await flushPromises();

            expect(store.queryParams.page).toBe(3);
        });
    });

    describe('server-side mode (externalPaginator: true)', () => {
        it('should refetch when the page changes', async () => {
            const store = useApiResourcesStore(
                'refetch-server-page',
                createCore('refetch-server-page', true)
            );

            await store.fetchData();
            await flushPromises();
            const callsAfterInitialFetch = mockedAxios.mock.calls.length;

            store.setPage(2);
            await flushPromises();

            expect(mockedAxios.mock.calls.length).toBe(callsAfterInitialFetch + 1);
        });

        it('should refetch when the page size changes', async () => {
            const store = useApiResourcesStore(
                'refetch-server-limit',
                createCore('refetch-server-limit', true)
            );

            await store.fetchData();
            await flushPromises();
            const callsAfterInitialFetch = mockedAxios.mock.calls.length;

            store.setLimit(25);
            await flushPromises();

            expect(mockedAxios.mock.calls.length).toBeGreaterThan(callsAfterInitialFetch);
        });

        it('should not refetch while autoRefetch is off', async () => {
            const store = useApiResourcesStore(
                'refetch-server-disabled',
                createCore('refetch-server-disabled', true)
            );

            await store.fetchData();
            await flushPromises();
            const callsAfterInitialFetch = mockedAxios.mock.calls.length;

            store.autoRefetch = false;
            store.setPage(2);
            await flushPromises();

            expect(mockedAxios.mock.calls.length).toBe(callsAfterInitialFetch);
        });
    });
});
