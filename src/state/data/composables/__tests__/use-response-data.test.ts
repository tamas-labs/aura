import { describe, it, expect, beforeEach, vi } from 'vitest';
import { computed, ref } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import axios from 'axios';
import { useResponseData } from '../use-response-data';
import { DEFAULT_LABELS } from '../../../../lib/default-values.lib';
import { useCoreStore } from '../../../core/core.state';
import type { AuraProps } from '../../../../types';
import type {
    FilterItem,
    Footer,
    Header,
    PaginationMeta,
    RowId,
    SearchItem,
    SortItem,
} from '../../../../types/api-response.types';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

interface TestRow {
    id: number;
    name: string;
    city?: string | null;
    status?: string;
}

const ROWS: TestRow[] = [
    { id: 1, name: 'Alice', city: 'Budapest', status: 'active' },
    { id: 2, name: 'Bob', city: 'Debrecen', status: 'inactive' },
    { id: 3, name: 'Carol', city: 'Budapest', status: 'active' },
    { id: 4, name: 'Dave', city: null, status: 'inactive' },
];

/** An axios-shaped rejection carrying an HTTP status */
const serverError = (status: number) =>
    Object.assign(new Error(`Request failed with status code ${status}`), {
        response: { status },
    });

const headerWithSearchable = (searchableItems?: string[]): Header => ({
    rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }],
    settings: searchableItems ? { searchableItems } : null,
});

const footerWithRow = (): Footer => ({
    rows: [{ cells: [{ content: 'Sum', key: 'sum', field: 'sum' }] }],
});

const apiMeta: PaginationMeta = {
    current_page: 2,
    from: 11,
    last_page: 9,
    path: '/api/users',
    per_page: 10,
    to: 20,
    total: 87,
};

let storeCounter = 0;

/**
 * Builds the slice with hand-made query refs, so it is exercised on its own rather
 * than through the orchestrator (`api-resources.state`).
 */
const setup = (props: Partial<AuraProps> = {}) => {
    storeCounter += 1;
    const storeId = `response-data-${storeCounter}`;
    const core = useCoreStore(storeId, {
        storeId,
        siteName: 'Test Site',
        urlStructure: '{siteName}/api/{urlParameter}',
        urlParameter: 'users',
        requestMethod: 'POST',
        disableSession: true,
        ...props,
    } as AuraProps);

    const page = ref(1);
    const limit = ref(10);
    const sortItems = ref<SortItem[]>([]);
    const searchItems = ref<SearchItem[]>([]);
    const filterItems = ref<FilterItem[]>([]);
    const globalSearchTerm = ref<string | null>(null);
    const selectedRows = ref<RowId[]>([]);
    const queryParams = computed<Record<string, unknown>>(() => ({
        page: page.value,
        paginate: limit.value,
    }));

    const slice = useResponseData({
        core,
        queryParams,
        page,
        limit,
        sortItems,
        searchItems,
        filterItems,
        globalSearchTerm,
        selectedRows,
    });

    return {
        core,
        slice,
        page,
        limit,
        sortItems,
        searchItems,
        filterItems,
        globalSearchTerm,
        selectedRows,
    };
};

const ids = (items: unknown[] | null): number[] => (items ?? []).map(item => (item as TestRow).id);

describe('useResponseData', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        window.sessionStorage.clear();
    });

    describe('initial state', () => {
        it('should start with every response ref empty', () => {
            const { slice } = setup();

            expect(slice.header.value).toBeNull();
            expect(slice.body.value).toBeNull();
            expect(slice.footer.value).toBeNull();
            expect(slice.items.value).toBeNull();
            expect(slice.meta.value).toBeNull();
            expect(slice.links.value).toBeNull();
        });
    });

    describe('displayFooter', () => {
        it('should be null when showFooter is off', () => {
            const { slice } = setup({ showFooter: false });
            slice.header.value = headerWithSearchable();

            expect(slice.displayFooter.value).toBeNull();
        });

        it('should use the API footer when it has rows', () => {
            const { slice } = setup();
            slice.header.value = headerWithSearchable();
            slice.footer.value = footerWithRow();

            expect(slice.displayFooter.value).toBe(slice.footer.value);
        });

        // Without an API footer the header doubles as the footer, so a wide table
        // keeps its column labels visible at the bottom.
        it('should fall back to the header when there is no API footer', () => {
            const { slice } = setup();
            slice.header.value = headerWithSearchable();

            expect(slice.displayFooter.value).toBe(slice.header.value);
        });

        it('should fall back to the header when the API footer has no rows', () => {
            const { slice } = setup();
            slice.header.value = headerWithSearchable();
            slice.footer.value = { rows: [] };

            expect(slice.displayFooter.value).toBe(slice.header.value);
        });

        it('should be null when neither the footer nor the header has rows', () => {
            const { slice } = setup();
            slice.header.value = { rows: [] };

            expect(slice.displayFooter.value).toBeNull();
        });
    });

    describe('displayMeta', () => {
        it('should return the API meta untouched', () => {
            const { slice } = setup({ externalPaginator: true });
            slice.meta.value = apiMeta;

            expect(slice.displayMeta.value).toEqual(apiMeta);
        });

        it('should compute the meta from the items in client mode', () => {
            const { slice, limit, page } = setup();
            slice.items.value = ROWS;
            limit.value = 3;
            page.value = 2;

            expect(slice.displayMeta.value).toMatchObject({
                current_page: 2,
                per_page: 3,
                total: 4,
                last_page: 2,
                from: 4,
                to: 4,
            });
        });

        // `from`/`to` are rendered as "showing X–Y", which has no meaning with no
        // rows — hence null instead of 1/0.
        it('should report null bounds and a single page for no items', () => {
            const { slice } = setup();
            slice.items.value = [];

            expect(slice.displayMeta.value).toMatchObject({
                total: 0,
                last_page: 1,
                from: null,
                to: null,
            });
        });

        it('should count the processed items, not the raw ones', () => {
            const { slice, searchItems } = setup();
            slice.items.value = ROWS;
            searchItems.value = [{ field: 'city', term: 'Budapest' }];

            expect(slice.displayMeta.value?.total).toBe(2);
        });

        it('should be null in server mode until the API sends meta', () => {
            const { slice } = setup({ externalPaginator: true });
            slice.items.value = ROWS;

            expect(slice.displayMeta.value).toBeNull();
        });
    });

    describe('displayItems', () => {
        it('should be null while there are no items', () => {
            const { slice } = setup();

            expect(slice.displayItems.value).toBeNull();
        });

        it('should return every item in server mode', () => {
            const { slice, limit } = setup({ externalPaginator: true });
            slice.items.value = ROWS;
            limit.value = 2;

            expect(ids(slice.displayItems.value)).toEqual([1, 2, 3, 4]);
        });

        it('should slice the current page in client mode', () => {
            const { slice, limit } = setup();
            slice.items.value = ROWS;
            limit.value = 2;

            expect(ids(slice.displayItems.value)).toEqual([1, 2]);
        });

        it('should slice the second page in client mode', () => {
            const { slice, limit, page } = setup();
            slice.items.value = ROWS;
            limit.value = 2;
            page.value = 2;

            expect(ids(slice.displayItems.value)).toEqual([3, 4]);
        });

        it('should return an empty page beyond the last one', () => {
            const { slice, limit, page } = setup();
            slice.items.value = ROWS;
            limit.value = 2;
            page.value = 5;

            expect(slice.displayItems.value).toEqual([]);
        });
    });

    describe('client-side processing pipeline', () => {
        it('should apply the per-field search', () => {
            const { slice, searchItems } = setup();
            slice.items.value = ROWS;
            searchItems.value = [{ field: 'name', term: 'ali' }];

            expect(ids(slice.displayItems.value)).toEqual([1]);
        });

        it('should apply the value filters', () => {
            const { slice, filterItems } = setup();
            slice.items.value = ROWS;
            filterItems.value = [{ field: 'status', values: ['inactive'] }];

            expect(ids(slice.displayItems.value)).toEqual([2, 4]);
        });

        // externalPaginator defaults to false, so this exercises the client-side path
        // `FilterCalendar` relies on: the store only ever holds the selected day as a
        // bare `yyyy-mm-dd`, and a full-timestamp row must still match that whole day.
        it('should match a filterable date column by calendar day rather than exact value', () => {
            const { slice, filterItems } = setup();
            slice.header.value = {
                rows: [
                    {
                        cells: [
                            {
                                content: 'Created at',
                                key: 'created_at',
                                field: 'created_at',
                                filterable: true,
                                date: true,
                            },
                        ],
                    },
                ],
            };
            slice.items.value = [
                { id: 1, created_at: '2026-03-15T09:00:00' },
                { id: 2, created_at: '2026-03-15T23:59:59' },
                { id: 3, created_at: '2026-03-16T00:00:00' },
            ];
            filterItems.value = [{ field: 'created_at', values: ['2026-03-15'] }];

            expect(ids(slice.displayItems.value)).toEqual([1, 2]);
        });

        it('should sort the items', () => {
            const { slice, sortItems } = setup();
            slice.items.value = ROWS;
            sortItems.value = [{ field: 'name', direction: 'desc' }];

            expect(ids(slice.displayItems.value)).toEqual([4, 3, 2, 1]);
        });

        // The sort follows `config.localization`, the same locale the dates and
        // numbers are formatted in. In Hungarian collation `cs` is a letter of
        // its own and sorts after every plain `c` word; in English it is c + s.
        it('should sort with the configured locale', () => {
            const words = [{ name: 'cukor' }, { name: 'csokor' }, { name: 'cica' }];
            const byName: SortItem[] = [{ field: 'name', direction: 'asc' }];

            const hungarian = setup({ localization: 'hu-HU' });
            hungarian.slice.items.value = words;
            hungarian.sortItems.value = byName;

            const english = setup({ localization: 'en-US' });
            english.slice.items.value = words;
            english.sortItems.value = byName;

            const names = (items: unknown[] | null): string[] =>
                (items ?? []).map(item => (item as { name: string }).name);

            expect(names(hungarian.slice.displayItems.value)).toEqual(['cica', 'cukor', 'csokor']);
            expect(names(english.slice.displayItems.value)).toEqual(['cica', 'csokor', 'cukor']);
        });

        // Filtering happens before the page slice — otherwise page 1 would show
        // whatever survived of the first `limit` raw rows.
        it('should filter before paginating', () => {
            const { slice, filterItems, limit } = setup();
            slice.items.value = ROWS;
            filterItems.value = [{ field: 'status', values: ['inactive'] }];
            limit.value = 1;

            expect(ids(slice.displayItems.value)).toEqual([2]);
        });

        describe('global search', () => {
            it('should only look at the fields listed in searchableItems', () => {
                const { slice, globalSearchTerm } = setup();
                slice.items.value = ROWS;
                slice.header.value = headerWithSearchable(['city']);
                globalSearchTerm.value = 'bob';

                // "Bob" is a name, and `name` is not searchable here
                expect(slice.displayItems.value).toEqual([]);
            });

            it('should match case-insensitively', () => {
                const { slice, globalSearchTerm } = setup();
                slice.items.value = ROWS;
                slice.header.value = headerWithSearchable(['name']);
                globalSearchTerm.value = 'BOB';

                expect(ids(slice.displayItems.value)).toEqual([2]);
            });

            it('should skip null values instead of stringifying them', () => {
                const { slice, globalSearchTerm } = setup();
                slice.items.value = ROWS;
                slice.header.value = headerWithSearchable(['city']);
                globalSearchTerm.value = 'null';

                expect(slice.displayItems.value).toEqual([]);
            });

            // No searchable fields means the table cannot know what to match, and
            // filtering everything out would look like data loss.
            it('should not filter when searchableItems is missing', () => {
                const { slice, globalSearchTerm } = setup();
                slice.items.value = ROWS;
                slice.header.value = headerWithSearchable();
                globalSearchTerm.value = 'nothing-matches-this';

                expect(ids(slice.displayItems.value)).toEqual([1, 2, 3, 4]);
            });

            it('should not filter when searchableItems is empty', () => {
                const { slice, globalSearchTerm } = setup();
                slice.items.value = ROWS;
                slice.header.value = headerWithSearchable([]);
                globalSearchTerm.value = 'nothing-matches-this';

                expect(ids(slice.displayItems.value)).toEqual([1, 2, 3, 4]);
            });

            it('should combine with the per-field search', () => {
                const { slice, globalSearchTerm, searchItems } = setup();
                slice.items.value = ROWS;
                slice.header.value = headerWithSearchable(['city']);
                globalSearchTerm.value = 'budapest';
                searchItems.value = [{ field: 'name', term: 'carol' }];

                expect(ids(slice.displayItems.value)).toEqual([3]);
            });
        });

        describe('accentInsensitiveSearch', () => {
            const ACCENTED: TestRow[] = [
                { id: 1, name: 'Kovács Béla', city: 'Győr' },
                { id: 2, name: 'Kovacs Bela', city: 'Gyor' },
            ];

            it('should keep accents significant by default', () => {
                const { slice, globalSearchTerm } = setup();
                slice.items.value = ACCENTED;
                slice.header.value = headerWithSearchable(['city']);
                globalSearchTerm.value = 'gyor';

                expect(ids(slice.displayItems.value)).toEqual([2]);
            });

            it('should ignore accents in the global search when enabled', () => {
                const { slice, globalSearchTerm } = setup({ accentInsensitiveSearch: true });
                slice.items.value = ACCENTED;
                slice.header.value = headerWithSearchable(['city']);
                globalSearchTerm.value = 'gyor';

                expect(ids(slice.displayItems.value)).toEqual([1, 2]);
            });

            it('should ignore accents in the per-field search when enabled', () => {
                const { slice, searchItems } = setup({ accentInsensitiveSearch: true });
                slice.items.value = ACCENTED;
                searchItems.value = [{ field: 'name', term: 'bela' }];

                expect(ids(slice.displayItems.value)).toEqual([1, 2]);
            });

            it('should keep accents significant in the per-field search by default', () => {
                const { slice, searchItems } = setup();
                slice.items.value = ACCENTED;
                searchItems.value = [{ field: 'name', term: 'bela' }];

                expect(ids(slice.displayItems.value)).toEqual([2]);
            });

            // Both search paths read the same flag, so an accented term entered in
            // one of them must not be narrowed by the other.
            it('should apply the same rule to both search paths at once', () => {
                const { slice, globalSearchTerm, searchItems } = setup({
                    accentInsensitiveSearch: true,
                });
                slice.items.value = ACCENTED;
                slice.header.value = headerWithSearchable(['city']);
                globalSearchTerm.value = 'győr';
                searchItems.value = [{ field: 'name', term: 'kovács' }];

                expect(ids(slice.displayItems.value)).toEqual([1, 2]);
            });
        });
    });

    describe('processResponse', () => {
        it('should store the validated header, items, meta and links', async () => {
            const { slice } = setup();

            await slice.processResponse({
                header: headerWithSearchable(),
                items: ROWS,
                meta: apiMeta,
                links: { first: '/first', last: '/last', prev: null, next: '/next' },
            });

            expect(slice.header.value?.rows).toHaveLength(1);
            expect(slice.items.value).toEqual(ROWS);
            expect(slice.meta.value).toEqual(apiMeta);
            expect(slice.links.value?.next).toBe('/next');
        });

        it('should keep the previous items when the response has none', async () => {
            const { slice } = setup();
            slice.items.value = ROWS;

            await slice.processResponse({ header: headerWithSearchable() });

            expect(slice.items.value).toEqual(ROWS);
        });

        it('should store the footer sent by the API', async () => {
            const { slice } = setup();

            await slice.processResponse({
                header: headerWithSearchable(),
                footer: footerWithRow(),
            });

            expect(slice.footer.value?.rows).toHaveLength(1);
        });
    });

    describe('fetchData', () => {
        it('should send the composed query params', async () => {
            const { slice, page } = setup();
            page.value = 3;
            mockedAxios.mockResolvedValueOnce({ data: {} });

            await slice.fetchData();

            const requestConfig = mockedAxios.mock.calls[0]?.[0] as {
                data?: Record<string, unknown>;
            };
            expect(requestConfig.data).toMatchObject({ page: 3, paginate: 10 });
        });

        // The selection is attached at request time only: it is not part of the
        // reactive `queryParams`, so selecting a row never triggers a refetch.
        it('should attach the selection to the payload', async () => {
            const { slice, selectedRows } = setup();
            selectedRows.value = [1, 2];
            mockedAxios.mockResolvedValueOnce({ data: {} });

            await slice.fetchData();

            const requestConfig = mockedAxios.mock.calls[0]?.[0] as {
                data?: Record<string, unknown>;
            };
            expect(requestConfig.data?.selected).toEqual([1, 2]);
        });

        it('should omit selected for an empty selection', async () => {
            const { slice } = setup();
            mockedAxios.mockResolvedValueOnce({ data: {} });

            await slice.fetchData();

            const requestConfig = mockedAxios.mock.calls[0]?.[0] as {
                data?: Record<string, unknown>;
            };
            expect(requestConfig.data).not.toHaveProperty('selected');
        });

        it('should route a request failure into the error store', async () => {
            const { slice, core } = setup();
            mockedAxios.mockRejectedValueOnce(new Error('Network Error'));

            await slice.fetchData();

            const error = core.errorStore.errors.find(item => item.action === 'fetchData');
            expect(error?.type).toBe('api');
            // The user-facing text, not the axios wording — the raw message is
            // kept in `details`.
            expect(error?.message).toBe(DEFAULT_LABELS.apiErrorNetwork);
            expect(error?.details).toBe('Network Error');
            expect(error?.metadata).toMatchObject({ kind: 'network' });
        });

        it('should use the labels override for the failure message', async () => {
            const { slice, core } = setup({
                labels: { apiErrorServer: 'A szerver hibázott ({status}).' },
            } as Partial<AuraProps>);
            mockedAxios.mockRejectedValueOnce(serverError(500));

            await slice.fetchData();

            const error = core.errorStore.errors.find(item => item.action === 'fetchData');
            expect(error?.message).toBe('A szerver hibázott (500).');
        });

        // A request failure blocks the whole table (severity `error` swaps it for
        // the error UI), but it only describes one attempt. Without this the table
        // would stay blocked after a successful retry, until a page reload.
        it('should clear its previous failure after a successful retry', async () => {
            const { slice, core } = setup();
            mockedAxios.mockRejectedValueOnce(new Error('Network Error'));

            await slice.fetchData();
            expect(core.errorStore.errors.some(item => item.type === 'api')).toBe(true);

            mockedAxios.mockResolvedValueOnce({
                data: { header: headerWithSearchable(), items: ROWS },
            });
            await slice.fetchData();

            expect(core.errorStore.errors.some(item => item.type === 'api')).toBe(false);
            expect(slice.items.value).toEqual(ROWS);
        });

        // The retry button makes this path a single click away, so each attempt
        // replaces the previous alert instead of stacking an identical one.
        it('should report the latest failure only, when the retry fails as well', async () => {
            const { slice, core } = setup();
            mockedAxios.mockRejectedValueOnce(new Error('Network Error'));
            await slice.fetchData();

            mockedAxios.mockRejectedValueOnce(serverError(503));
            await slice.fetchData();

            const apiErrors = core.errorStore.errors.filter(item => item.type === 'api');
            expect(apiErrors).toHaveLength(1);
            expect(apiErrors[0]?.message).toBe(
                DEFAULT_LABELS.apiErrorServer.replace('{status}', '503')
            );
            expect(apiErrors[0]?.metadata).toMatchObject({ kind: 'server', status: 503 });
        });

        // The cross-origin block returns before the request, so a stale one can
        // only be cleared by a later request that did go out — staged here the way
        // fetchData reports it, key included.
        it('should clear a previous cross-origin block after a successful request', async () => {
            const { slice, core } = setup();
            core.errorStore.addError({
                severity: 'error',
                component: 'ApiResourcesStore',
                action: 'fetchData',
                type: 'authorization',
                message: 'External API request blocked',
            });
            mockedAxios.mockResolvedValueOnce({ data: {} });

            await slice.fetchData();

            expect(core.errorStore.errors.some(item => item.type === 'authorization')).toBe(false);
        });

        it('should only clear the errors it reported itself', async () => {
            const { slice, core } = setup();
            core.errorStore.addError({
                severity: 'warning',
                component: 'ConfigValidator',
                action: 'validate',
                type: 'validation',
                message: 'Unknown icon set',
                key: 'icons',
            });
            mockedAxios.mockResolvedValueOnce({ data: {} });

            await slice.fetchData();

            expect(core.errorStore.errors.some(item => item.key === 'icons')).toBe(true);
        });
    });

    describe('loading', () => {
        it('should start false', () => {
            const { slice } = setup();

            expect(slice.loading.value).toBe(false);
        });

        it('should be true while the request is in flight and false after it succeeds', async () => {
            const { slice } = setup();
            let resolveRequest: (value: { data: unknown }) => void = () => {};
            mockedAxios.mockReturnValueOnce(
                new Promise(resolve => {
                    resolveRequest = resolve;
                }) as ReturnType<typeof axios>
            );

            const pending = slice.fetchData();
            expect(slice.loading.value).toBe(true);

            resolveRequest({ data: { header: headerWithSearchable(), items: ROWS } });
            await pending;

            expect(slice.loading.value).toBe(false);
        });

        // A failure must release it too, otherwise the overlay would sit on top of
        // the error state forever.
        it('should be false after a failed request', async () => {
            const { slice } = setup();
            mockedAxios.mockRejectedValueOnce(new Error('Network Error'));

            await slice.fetchData();

            expect(slice.loading.value).toBe(false);
        });

        // The cross-origin guard returns before the request is sent, which is the
        // one exit path that does not go through the axios promise.
        it('should be false after a cross-origin block', async () => {
            const { slice } = setup({
                urlStructure: 'https://evil.example.com/api/{urlParameter}',
            });

            await slice.fetchData();

            expect(mockedAxios).not.toHaveBeenCalled();
            expect(slice.loading.value).toBe(false);
        });

        // The reason `loading` counts requests instead of holding a boolean: the
        // first response must not report the table as settled while a second
        // request is still running.
        it('should stay true until the last of two overlapping requests settles', async () => {
            const { slice } = setup();
            let resolveFirst: (value: { data: unknown }) => void = () => {};
            let resolveSecond: (value: { data: unknown }) => void = () => {};
            mockedAxios
                .mockReturnValueOnce(
                    new Promise(resolve => {
                        resolveFirst = resolve;
                    }) as ReturnType<typeof axios>
                )
                .mockReturnValueOnce(
                    new Promise(resolve => {
                        resolveSecond = resolve;
                    }) as ReturnType<typeof axios>
                );

            const first = slice.fetchData();
            const second = slice.fetchData();
            expect(slice.loading.value).toBe(true);

            resolveFirst({ data: {} });
            await first;
            expect(slice.loading.value).toBe(true);

            resolveSecond({ data: {} });
            await second;
            expect(slice.loading.value).toBe(false);
        });
    });

    // Responses do not necessarily come back in the order the requests went out
    // (two quick page changes on a slow connection), so the store must not take
    // "the last response to arrive" for "the current one".
    describe('request concurrency', () => {
        /** Hands back a request promise plus its settle handles. */
        const deferRequest = () => {
            let settle: {
                resolve: (value: { data: unknown }) => void;
                reject: (reason: unknown) => void;
            };
            const promise = new Promise<{ data: unknown }>((resolve, reject) => {
                settle = { resolve, reject };
            });
            mockedAxios.mockReturnValueOnce(promise as ReturnType<typeof axios>);
            return settle!;
        };

        const signalOfCall = (index: number): AbortSignal =>
            (mockedAxios.mock.calls[index]?.[0] as unknown as { signal: AbortSignal }).signal;

        it('should send an abort handle with the request', async () => {
            const { slice } = setup();
            mockedAxios.mockResolvedValueOnce({ data: {} });

            await slice.fetchData();

            expect(signalOfCall(0)).toBeInstanceOf(AbortSignal);
            expect(signalOfCall(0).aborted).toBe(false);
        });

        // The bandwidth half of the fix: the older request's rows are already
        // outdated, so it is taken off the wire rather than merely ignored.
        it('should cancel the request in flight when a newer one starts', async () => {
            const { slice } = setup();
            const first = deferRequest();
            const second = deferRequest();

            const firstCall = slice.fetchData();
            const secondCall = slice.fetchData();

            expect(signalOfCall(0).aborted).toBe(true);
            expect(signalOfCall(1).aborted).toBe(false);

            first.resolve({ data: {} });
            second.resolve({ data: {} });
            await Promise.all([firstCall, secondCall]);
        });

        // The audit's scenario: the user is on page 2, but page 1's response
        // arrives later and used to win, showing the wrong rows.
        it('should discard a superseded response that arrives last', async () => {
            const { slice } = setup();
            const first = deferRequest();
            const second = deferRequest();

            const firstCall = slice.fetchData();
            const secondCall = slice.fetchData();

            second.resolve({ data: { header: headerWithSearchable(), items: [ROWS[1]] } });
            await secondCall;

            first.resolve({ data: { header: headerWithSearchable(), items: [ROWS[0]] } });
            await firstCall;

            expect(ids(slice.items.value)).toEqual([2]);
        });

        // The same guard the other way round: the superseded response comes back
        // first, so it must not even briefly land in the store.
        it('should discard a superseded response that arrives first', async () => {
            const { slice } = setup();
            const first = deferRequest();
            const second = deferRequest();

            const firstCall = slice.fetchData();
            const secondCall = slice.fetchData();

            first.resolve({ data: { header: headerWithSearchable(), items: [ROWS[0]] } });
            await firstCall;
            expect(slice.items.value).toBeNull();

            second.resolve({ data: { header: headerWithSearchable(), items: [ROWS[1]] } });
            await secondCall;

            expect(ids(slice.items.value)).toEqual([2]);
        });

        // A cancelled request rejects. Reporting that would replace the table
        // with an error UI describing a request nobody is waiting for.
        it('should not report the failure of a superseded request', async () => {
            const { slice, core } = setup();
            const first = deferRequest();
            const second = deferRequest();

            const firstCall = slice.fetchData();
            const secondCall = slice.fetchData();

            second.resolve({ data: { header: headerWithSearchable(), items: ROWS } });
            await secondCall;

            first.reject(new Error('canceled'));
            await firstCall;

            expect(core.errorStore.errors.some(item => item.type === 'api')).toBe(false);
            expect(ids(slice.items.value)).toEqual([1, 2, 3, 4]);
        });

        // The failure of the newest request is still reported: staleness must not
        // become a blanket excuse for swallowing errors.
        it('should report the failure of the newest request', async () => {
            const { slice, core } = setup();
            const first = deferRequest();
            const second = deferRequest();

            const firstCall = slice.fetchData();
            const secondCall = slice.fetchData();

            first.resolve({ data: { header: headerWithSearchable(), items: ROWS } });
            await firstCall;

            second.reject(new Error('Network Error'));
            await secondCall;

            const error = core.errorStore.errors.find(item => item.action === 'fetchData');
            expect(error?.message).toBe(DEFAULT_LABELS.apiErrorNetwork);
            expect(error?.details).toBe('Network Error');
        });

        // Once everything has settled the next request starts from a clean slate:
        // it must not be cancelled by the handle of an already finished one.
        it('should not cancel a request after the previous one has settled', async () => {
            const { slice } = setup();
            mockedAxios.mockResolvedValueOnce({ data: {} });
            await slice.fetchData();

            mockedAxios.mockResolvedValueOnce({ data: {} });
            await slice.fetchData();

            expect(signalOfCall(0).aborted).toBe(false);
            expect(signalOfCall(1).aborted).toBe(false);
        });
    });

    describe('clearResponse', () => {
        it('should reset every response ref', async () => {
            const { slice } = setup();
            await slice.processResponse({
                header: headerWithSearchable(),
                items: ROWS,
                meta: apiMeta,
            });

            slice.clearResponse();

            expect(slice.header.value).toBeNull();
            expect(slice.body.value).toBeNull();
            expect(slice.footer.value).toBeNull();
            expect(slice.items.value).toBeNull();
            expect(slice.meta.value).toBeNull();
            expect(slice.links.value).toBeNull();
        });
    });
});
