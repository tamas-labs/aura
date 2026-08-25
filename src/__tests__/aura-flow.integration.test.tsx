import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createPinia, setActivePinia, type Pinia } from 'pinia';
import axios from 'axios';
import { Aura } from '../features/table/Aura';
import { useCoreStore, useApiResourcesStore } from '../state';
import { DEFAULT_LABELS } from '../lib/default-values.lib';
import type { AuraProps } from '../types';

/**
 * Integration tests: the whole chain, not one layer of it.
 *
 * Every other suite mocks the layer below the one it covers — `Aura.test.tsx`
 * even mocks `useApiResourcesStore` itself. That leaves a blind spot exactly
 * where the two most expensive bugs lived: a failed request that blocks the
 * table with no way back, and two overlapping requests whose responses arrive
 * out of order. Both are chains, and a chain is not covered by testing its
 * links. Here **only axios is mocked**: the real stores, the real component
 * tree and the real render conditions run.
 */
vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

const CRITICAL_ERROR = '[data-testid="aura-critical-error"]';
const TABLE = '[data-testid="aura-table"]';
const RETRY = '[data-testid="aura-error-retry"]';
const DISMISS = '[data-testid="error-dismiss"]';

const ROWS_PER_PAGE = 10;

/** A complete, valid response whose single row names the page it came from */
const pageResponse = (page: number) => ({
    data: {
        header: { rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }] },
        items: [{ name: `Row on page ${page}` }],
        meta: {
            current_page: page,
            total: 30,
            per_page: ROWS_PER_PAGE,
            from: (page - 1) * ROWS_PER_PAGE + 1,
            to: page * ROWS_PER_PAGE,
            last_page: 3,
            path: '/api/users',
        },
    },
});

let storeCounter = 0;
let pinia: Pinia;

/**
 * Waits until the table reaches the expected state.
 *
 * Not a fixed number of `flushPromises` turns: `processResponse` imports its
 * validators lazily, and the first such import is I/O-bound — no amount of
 * microtask flushing gets past it, which is exactly how this suite first failed.
 *
 * @param predicate - The condition to wait for
 * @param what - What is being waited for, so a timeout names it
 */
const waitUntil = async (predicate: () => boolean, what: string) => {
    await vi.waitFor(
        () => {
            if (!predicate()) throw new Error(`still waiting for: ${what}`);
        },
        { timeout: 2000, interval: 5 }
    );

    await flushPromises();
};

/**
 * Gives a response that should be *ignored* every chance to land.
 *
 * Used before asserting that nothing happened — by this point the validator
 * modules are warm, so a response that was going to be applied would be.
 */
const settle = async () => {
    for (let turn = 0; turn < 5; turn += 1) {
        await new Promise(resolve => setTimeout(resolve, 1));
        await flushPromises();
    }
};

/** Mounts the real component with the real stores behind it */
const mountTable = () => {
    storeCounter += 1;
    const storeId = `integration-${storeCounter}`;

    const wrapper = mount(Aura, {
        props: {
            storeId,
            siteName: 'Test Site',
            urlStructure: '{siteName}/api/{urlParameter}',
            urlParameter: 'users',
            requestMethod: 'POST',
            disableSession: true,
            // Server-side pagination: every page is its own request, which is
            // what makes two page changes race in the first place. In
            // client-side mode the rows would be sliced locally out of the
            // single fixture row and page 3 would render empty.
            externalPaginator: true,
        },
        global: { plugins: [pinia] },
    });

    return { wrapper, storeId };
};

/** The very same store instances the mounted component is using */
const storesOf = (storeId: string) => {
    const core = useCoreStore(storeId, { storeId } as AuraProps);

    return { core, resource: useApiResourcesStore(storeId, core) };
};

/** A request the test resolves by hand, so two can be in flight at once */
const deferRequest = () => {
    let resolve!: (value: unknown) => void;
    const promise = new Promise(resolveResponse => {
        resolve = resolveResponse;
    });

    mockedAxios.mockReturnValueOnce(promise as never);

    return { resolve };
};

describe('Aura integration', () => {
    /**
     * Warms the lazily imported response validators.
     *
     * `processResponse` pulls them in with dynamic `import()`, and in the test
     * runner a cold import only resolves while the test body is itself awaiting
     * it. A fire-and-forget fetch — from `onMounted` or from a click handler —
     * would otherwise stay pending no matter how long the test waits, which is
     * how this suite first failed. One awaited call in advance puts the modules
     * in the cache; from then on the component's own fetches settle normally.
     */
    beforeAll(async () => {
        setActivePinia(createPinia());
        const core = useCoreStore('warmup', { storeId: 'warmup' } as AuraProps);

        await useApiResourcesStore('warmup', core).processResponse(pageResponse(1).data as never);
    });

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
        vi.clearAllMocks();
        window.sessionStorage.clear();
    });

    /**
     * A failed request replaces the table — the toolbar and its refresh button
     * included — so whether the user can get back at all is a property of the
     * whole chain: the store reports the error, `Aura` swaps the render, the
     * error UI offers a control, and the next request has to clear the error
     * that the previous one left behind.
     */
    describe('recovering from a blocking error', () => {
        it('should replace the table with the error state after a failed request', async () => {
            mockedAxios.mockRejectedValueOnce(new Error('Network Error'));

            const { wrapper } = mountTable();
            await waitUntil(() => wrapper.find(CRITICAL_ERROR).exists(), 'the error state');

            expect(wrapper.find(CRITICAL_ERROR).exists()).toBe(true);
            expect(wrapper.find(TABLE).exists()).toBe(false);
            // The user-facing message, not the axios wording
            expect(wrapper.text()).toContain(DEFAULT_LABELS.apiErrorNetwork);
        });

        it('should bring the table back when the retry succeeds', async () => {
            mockedAxios.mockRejectedValueOnce(new Error('Network Error'));

            const { wrapper, storeId } = mountTable();
            await waitUntil(() => wrapper.find(RETRY).exists(), 'the retry button');

            const retry = wrapper.find(RETRY);
            expect(retry.exists()).toBe(true);

            mockedAxios.mockResolvedValueOnce(pageResponse(1));
            await retry.trigger('click');
            await waitUntil(() => wrapper.find(TABLE).exists(), 'the table');

            expect(wrapper.find(CRITICAL_ERROR).exists()).toBe(false);
            expect(wrapper.find(TABLE).exists()).toBe(true);
            expect(wrapper.text()).toContain('Row on page 1');
            expect(storesOf(storeId).core.errorStore.hasErrors).toBe(false);
        });

        it('should keep the error state when the retry fails as well', async () => {
            mockedAxios.mockRejectedValueOnce(new Error('Network Error'));

            const { wrapper, storeId } = mountTable();
            await waitUntil(() => wrapper.find(RETRY).exists(), 'the retry button');

            mockedAxios.mockRejectedValueOnce(new Error('Network Error'));
            await wrapper.find(RETRY).trigger('click');
            await settle();

            expect(wrapper.find(CRITICAL_ERROR).exists()).toBe(true);
            // One alert, not one per attempt: the fetch clears its own previous
            // error before reporting the new one.
            expect(storesOf(storeId).core.errorStore.errors).toHaveLength(1);
        });

        it('should offer a dismiss button for the fetch error', async () => {
            mockedAxios.mockRejectedValueOnce(new Error('Network Error'));

            const { wrapper } = mountTable();
            await waitUntil(() => wrapper.find(DISMISS).exists(), 'the dismiss button');

            // The dismiss button only renders for errors that have a key, and
            // `fetchData` does not supply one — the store generates it.
            expect(wrapper.find(DISMISS).exists()).toBe(true);

            await wrapper.find(DISMISS).trigger('click');
            await waitUntil(() => wrapper.find(TABLE).exists(), 'the table');

            expect(wrapper.find(CRITICAL_ERROR).exists()).toBe(false);
            expect(wrapper.find(TABLE).exists()).toBe(true);
        });
    });

    /**
     * Paging twice in quick succession is the everyday version of the race: the
     * request for the page the user left can answer after the one they are on.
     * The result that must survive is the one started last, not the one that
     * arrived last.
     */
    describe('overlapping requests', () => {
        const startOnPageOne = async () => {
            mockedAxios.mockResolvedValueOnce(pageResponse(1));
            const mounted = mountTable();
            await waitUntil(() => mounted.wrapper.text().includes('Row on page 1'), 'page 1 rows');

            return mounted;
        };

        it('should keep the newest page when an older response arrives last', async () => {
            const { wrapper, storeId } = await startOnPageOne();
            const { resource } = storesOf(storeId);

            // Two overlapping requests: a tick apart, so the queryParams watcher
            // fires for both instead of collapsing them into one.
            const secondPage = deferRequest();
            resource.setPage(2);
            await nextTick();

            const thirdPage = deferRequest();
            resource.setPage(3);
            await nextTick();

            expect(mockedAxios).toHaveBeenCalledTimes(3);

            // The newest request answers first, the superseded one after it
            thirdPage.resolve(pageResponse(3));
            await waitUntil(() => wrapper.text().includes('Row on page 3'), 'page 3 rows');

            secondPage.resolve(pageResponse(2));
            await settle();

            expect(resource.items).toEqual([{ name: 'Row on page 3' }]);
            expect(resource.meta?.current_page).toBe(3);
            expect(wrapper.text()).toContain('Row on page 3');
            expect(wrapper.text()).not.toContain('Row on page 2');
        });

        it('should not report the superseded request as an error', async () => {
            const { wrapper, storeId } = await startOnPageOne();
            const { core, resource } = storesOf(storeId);

            const secondPage = deferRequest();
            resource.setPage(2);
            await nextTick();

            const thirdPage = deferRequest();
            resource.setPage(3);
            await nextTick();

            thirdPage.resolve(pageResponse(3));
            await waitUntil(() => wrapper.text().includes('Row on page 3'), 'page 3 rows');

            // The abandoned request fails — for a cancelled request that is the
            // normal outcome. It must not blow away the table the user is
            // already looking at.
            secondPage.resolve(Promise.reject(new Error('canceled')));
            await settle();

            expect(core.errorStore.hasErrors).toBe(false);
            expect(wrapper.find(CRITICAL_ERROR).exists()).toBe(false);
            expect(wrapper.text()).toContain('Row on page 3');
        });
    });
});
