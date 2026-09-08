import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { reactive, type WatchSource } from 'vue';
import { Aura } from '../Aura';
import type * as ComposablesModule from '../utils/composables';
import { useReservedHeight, type ReservedHeightDeps } from '../utils/composables';

vi.mock('axios');

const state = vi.hoisted(() => ({
    resource: null as Record<string, unknown> | null,
}));

vi.mock('../../../state/data/api-resources.state', () => ({
    useApiResourcesStore: vi.fn(() => state.resource),
}));

vi.mock('../utils/composables', async importOriginal => {
    const actual = await importOriginal<typeof ComposablesModule>();
    return { ...actual, useReservedHeight: vi.fn(actual.useReservedHeight) };
});

/**
 * What invalidates the height held for the table area.
 *
 * The measurement itself is covered by `useReservedHeight`'s own suite; happy-dom
 * reports `offsetHeight: 0`, so a mounted table can never measure anything. What is
 * testable here — and what the two bugs were about — is *which* changes the component
 * feeds into the composable as reset sources: paging must keep the reading (that is
 * the whole point of it), everything that reshapes the row set must drop it.
 */
describe('Aura reserved height wiring', () => {
    /** Only what `Aura`'s `setup` reads off the api-resources store. */
    const createResource = () =>
        reactive({
            fetchData: vi.fn().mockResolvedValue({ data: {} }),
            queryParams: { page: 1, paginate: 10 },
            autoRefetch: true,
            loading: false,
            items: [] as unknown[],
            displayItems: [] as unknown[],
            displayMeta: null,
            body: null,
            sortItems: [] as unknown[],
            searchItems: [] as unknown[],
            filterItems: [] as unknown[],
            globalSearchTerm: null as string | null,
        });

    let resource: ReturnType<typeof createResource>;

    /** The dependencies `setup` handed to the composable on mount. */
    const reservedHeightDeps = (): ReservedHeightDeps => {
        const call = vi.mocked(useReservedHeight).mock.calls[0];
        if (!call) throw new Error('useReservedHeight was not called');
        return call[0];
    };

    /** The reset sources as of now, collapsed into one comparable value. */
    const resetKey = () =>
        JSON.stringify(
            reservedHeightDeps().resetSources.map(source =>
                (source as Extract<WatchSource, () => unknown>)()
            )
        );

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        resource = createResource();
        state.resource = resource as unknown as Record<string, unknown>;
        mount(Aura, { props: { storeId: 'reserved-height-store' } });
    });

    // The bug: a server-side table hands back a fresh `items` array on every page,
    // so keying the reset on it dropped the reading exactly on the short last page.
    it('should keep the reading while only the page changes', () => {
        const before = resetKey();

        resource.queryParams = { page: 4, paginate: 10 };
        resource.items = [{ id: 1 }];
        resource.displayItems = [{ id: 1 }];

        expect(resetKey()).toBe(before);
    });

    it('should keep the reading when a refresh replaces the rows with the same query', () => {
        const before = resetKey();

        resource.items = [{ id: 9 }];
        resource.displayItems = [{ id: 9 }];

        expect(resetKey()).toBe(before);
    });

    it('should drop the reading when the page size changes', () => {
        const before = resetKey();

        resource.queryParams = { page: 1, paginate: 50 };

        expect(resetKey()).not.toBe(before);
    });

    // The reported symptom: a full page was measured, then the global search cut the
    // list down to one row and the table kept holding the full page's height open.
    it('should drop the reading when the global search narrows the set', () => {
        const before = resetKey();

        resource.globalSearchTerm = 'foo';

        expect(resetKey()).not.toBe(before);
    });

    it('should drop the reading when a column search or filter narrows the set', () => {
        const afterSearch = (() => {
            const before = resetKey();
            resource.searchItems = [{ column: 'name', term: 'a' }];
            expect(resetKey()).not.toBe(before);
            return resetKey();
        })();

        resource.filterItems = [{ column: 'status', values: ['active'] }];

        expect(resetKey()).not.toBe(afterSearch);
    });

    // An in-place edit keeps the array reference, which is what makes the store's own
    // `queryParams` computed miss it — the key has to walk the arrays to see it.
    it('should drop the reading when a search term is refined in place', () => {
        resource.searchItems = [{ column: 'name', term: 'a' }];
        const before = resetKey();

        (resource.searchItems[0] as { term: string }).term = 'ab';

        expect(resetKey()).not.toBe(before);
    });

    it('should cap the reservation at the viewport height', () => {
        expect(reservedHeightDeps().maxHeight?.()).toBe(window.innerHeight);
    });
});
