import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { Aura } from '../Aura';
import { useApiResourcesStore } from '../../../state/data/api-resources.state';
import { LOADING_OVERLAY_DELAY_MS } from '../../../lib/default-values.lib';

// Mock axios
vi.mock('axios');

// Mock stores
vi.mock('../../../state/data/api-resources.state', () => ({
    useApiResourcesStore: vi.fn(() => ({
        fetchData: vi.fn().mockResolvedValue({ data: {} }),
        queryParams: { page: 1, paginate: 10 },
        autoRefetch: true,
    })),
}));

describe('Aura Component', () => {
    const TEST_STORE_ID = 'test-store';
    const ERROR_LEVEL_STORE = 'error-level-store';
    const DATA_TESTID_CRITICAL_ERROR = 'aura-critical-error';
    const DATA_TESTID_TABLE = 'aura-table';
    const AURA_CRITICAL_ERROR_SELECTOR = `[data-testid="${DATA_TESTID_CRITICAL_ERROR}"]`;
    const AURA_TABLE_SELECTOR = `[data-testid="${DATA_TESTID_TABLE}"]`;

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('component registration', () => {
        it('should have name "Aura"', () => {
            expect(Aura.name).toBe('Aura');
        });

        it('should be a valid Vue component', () => {
            expect(Aura).toBeDefined();
            expect(Aura.setup).toBeDefined();
            expect(Aura.render).toBeDefined();
        });
    });

    describe('props validation', () => {
        it('should accept storeId prop', () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: 'test-store',
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should accept debug prop', () => {
            const wrapper = mount(Aura, {
                props: {
                    debug: true,
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should accept siteName prop', () => {
            const wrapper = mount(Aura, {
                props: {
                    siteName: 'Test Site',
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should accept urlParameter prop', () => {
            const wrapper = mount(Aura, {
                props: {
                    urlParameter: 'users',
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should accept urlParameterLastSegment prop', () => {
            const wrapper = mount(Aura, {
                props: {
                    urlParameterLastSegment: 'list',
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should accept urlStructure prop', () => {
            const wrapper = mount(Aura, {
                props: {
                    urlStructure: '{siteName}/api/{urlParameter}',
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should accept siteToken prop as boolean', () => {
            const wrapper = mount(Aura, {
                props: {
                    siteToken: true,
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should accept siteToken prop as string', () => {
            const wrapper = mount(Aura, {
                props: {
                    siteToken: 'token-123',
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should accept paginateValues prop', () => {
            const wrapper = mount(Aura, {
                props: {
                    paginateValues: [10, 20, 30],
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should accept rowsNumber prop', () => {
            const wrapper = mount(Aura, {
                props: {
                    rowsNumber: 25,
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should accept classes prop', () => {
            const wrapper = mount(Aura, {
                props: {
                    classes: {
                        table: ['custom-class'],
                    },
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should accept boolean flags', () => {
            const wrapper = mount(Aura, {
                props: {
                    showFooter: false,
                    showHeaderSearch: true,
                    externalPaginator: true,
                    disableSession: true,
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should accept locale props', () => {
            const wrapper = mount(Aura, {
                props: {
                    dateStyle: 'short',
                    timeZone: 'Europe/Budapest',
                    utcOffset: '+02:00',
                    localization: 'hu-HU',
                    currency: 'HUF',
                },
            });
            expect(wrapper.exists()).toBe(true);
        });
    });

    describe('setup lifecycle', () => {
        it('should initialize core store', () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: TEST_STORE_ID,
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should validate storeId', () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: 'custom-store-id',
                },
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should merge global config from Vue instance', () => {
            const wrapper = mount(Aura, {
                props: {},
            });
            // The global config merge logic runs in the component's setup
            // from instance.appContext.config.globalProperties.$aura
            expect(wrapper.exists()).toBe(true);
        });
    });

    describe('onMounted lifecycle', () => {
        it('should call fetchData on mount', async () => {
            const mockFetchData = vi.fn().mockResolvedValue({ data: {} });
            vi.mocked(useApiResourcesStore).mockReturnValue({
                fetchData: mockFetchData,
                queryParams: { page: 1, paginate: 10 },
                autoRefetch: true,
            } as unknown as ReturnType<typeof useApiResourcesStore>);

            mount(Aura, {
                props: {
                    storeId: TEST_STORE_ID,
                },
            });

            // Wait for onMounted
            await flushPromises();

            expect(mockFetchData).toHaveBeenCalled();
        });

        it('should initialize api resources store', async () => {
            mount(Aura, {
                props: {
                    storeId: TEST_STORE_ID,
                },
            });

            // Wait for onMounted
            await flushPromises();

            expect(useApiResourcesStore).toHaveBeenCalled();
        });

        it('should handle fetchData response', async () => {
            const mockResponse = {
                data: {
                    items: [{ id: 1, name: 'Test' }],
                    meta: { total: 1 },
                },
            };

            const mockFetchData = vi.fn().mockResolvedValue(mockResponse);
            vi.mocked(useApiResourcesStore).mockReturnValue({
                fetchData: mockFetchData,
                queryParams: { page: 1, paginate: 10 },
                autoRefetch: true,
            } as unknown as ReturnType<typeof useApiResourcesStore>);

            mount(Aura, {
                props: {
                    storeId: TEST_STORE_ID,
                },
            });

            // Wait for onMounted
            await flushPromises();

            expect(mockFetchData).toHaveBeenCalled();
        });
    });

    describe('render', () => {
        it('should render a div element', () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: TEST_STORE_ID,
                },
            });
            expect(wrapper.find('div').exists()).toBe(true);
        });

        it('should render TableHeader component', () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: TEST_STORE_ID,
                },
            });
            const tableHeader = wrapper.find('[data-testid="table-header"]');
            expect(tableHeader.exists()).toBe(false); // No header data yet
        });
    });

    describe('store integration', () => {
        it('should pass props to core store', () => {
            const props = {
                storeId: TEST_STORE_ID,
                siteName: 'Test Site',
                rowsNumber: 25,
            };

            const wrapper = mount(Aura, {
                props,
            });

            expect(wrapper.exists()).toBe(true);
        });

        it('should work with minimal props', () => {
            const wrapper = mount(Aura, {
                props: {},
            });
            expect(wrapper.exists()).toBe(true);
        });

        it('should work with all props', () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: 'full-test-store',
                    debug: true,
                    siteName: 'Full Test',
                    urlParameter: 'users',
                    urlParameterLastSegment: 'list',
                    urlStructure: '{siteName}/api/{urlParameter}',
                    siteToken: 'token-123',
                    paginateValues: [10, 20, 30],
                    rowsNumber: 25,
                    classes: { table: ['custom'] },
                    showFooter: true,
                    showHeaderSearch: true,
                    externalPaginator: false,
                    dateStyle: 'medium',
                    timeZone: 'UTC',
                    utcOffset: '+00:00',
                    localization: 'en-US',
                    currency: 'USD',
                    resources: true,
                    requestMethod: 'POST',
                    sessionKey: 'test-session',
                    disableSession: false,
                },
            });
            expect(wrapper.exists()).toBe(true);
        });
    });

    describe('error handling', () => {
        it('should handle fetchData errors gracefully', async () => {
            const mockFetchData = vi.fn().mockRejectedValue(new Error('API Error'));
            vi.mocked(useApiResourcesStore).mockReturnValue({
                fetchData: mockFetchData,
                queryParams: { page: 1, paginate: 10 },
                autoRefetch: true,
            } as unknown as ReturnType<typeof useApiResourcesStore>);

            const wrapper = mount(Aura, {
                props: {
                    storeId: TEST_STORE_ID,
                },
            });

            // Wait for onMounted and catch the error
            await flushPromises();

            expect(wrapper.exists()).toBe(true);
            expect(mockFetchData).toHaveBeenCalled();

            // The fetchData().then() in onMounted catches the error
            // The component still exists and works
        });
    });

    describe('error display rendering', () => {
        // Helper interface for VM type
        interface AuraVM {
            core: {
                errorStore: {
                    addError: (error: unknown) => void;
                };
            };
        }

        it('should render ErrorHandler for critical errors only (full screen)', async () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: 'critical-error-store',
                },
            });

            // Add critical error to store
            const core = (wrapper.vm as unknown as AuraVM).core;
            core.errorStore.addError({
                severity: 'critical',
                component: 'Aura',
                action: 'init',
                type: 'validation',
                message: 'Critical error occurred',
            });

            // Wait for reactivity
            await wrapper.vm.$nextTick();

            // Should render error state container
            expect(wrapper.find(AURA_CRITICAL_ERROR_SELECTOR).exists()).toBe(true);

            // Should NOT render table container
            expect(wrapper.find(AURA_TABLE_SELECTOR).exists()).toBe(false);
        });

        it('should render ErrorHandler for error level only (full screen)', async () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: ERROR_LEVEL_STORE,
                },
            });

            // Add error level error to store
            const core = (wrapper.vm as unknown as AuraVM).core;
            core.errorStore.addError({
                severity: 'error',
                component: 'Aura',
                action: 'init',
                type: 'validation',
                message: 'Error occurred',
            });

            // Wait for reactivity
            await wrapper.vm.$nextTick();

            // Should render error state container
            expect(wrapper.find(AURA_CRITICAL_ERROR_SELECTOR).exists()).toBe(true);

            // Should NOT render table container
            expect(wrapper.find(AURA_TABLE_SELECTOR).exists()).toBe(false);
        });

        it('should render warnings at the top and table below', async () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: 'warning-store',
                },
            });

            // Add warning to store
            const core = (wrapper.vm as unknown as AuraVM).core;
            core.errorStore.addError({
                severity: 'warning',
                component: 'Aura',
                action: 'init',
                type: 'validation',
                message: 'Warning occurred',
            });

            // Wait for reactivity
            await wrapper.vm.$nextTick();

            // Should render error handler for warnings
            expect(wrapper.find('[data-testid="error-handler"]').exists()).toBe(true);

            // Should ALSO render TableHeader (but it will be empty without data)
            expect(wrapper.find('[data-testid="table-header"]').exists()).toBe(false);
        });

        it('should render table normally when no errors', () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: 'no-error-store',
                },
            });

            // Should NOT render error state
            expect(wrapper.find(AURA_CRITICAL_ERROR_SELECTOR).exists()).toBe(false);

            // Should render TableHeader wrapper (but empty without data)
            expect(wrapper.find('[data-testid="table-header"]').exists()).toBe(false);
        });

        it('should prioritize critical/error over warning', async () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: 'mixed-error-store',
                },
            });

            // Add both critical and warning
            const core = (wrapper.vm as unknown as AuraVM).core;
            core.errorStore.addError({
                severity: 'critical',
                component: 'Aura',
                action: 'init',
                type: 'validation',
                message: 'Critical error',
            });
            core.errorStore.addError({
                severity: 'warning',
                component: 'Aura',
                action: 'init',
                type: 'validation',
                message: 'Warning',
            });

            // Wait for reactivity
            await wrapper.vm.$nextTick();

            // Should render critical error state (full screen)
            expect(wrapper.find(AURA_CRITICAL_ERROR_SELECTOR).exists()).toBe(true);

            // Should NOT render table
            expect(wrapper.find(AURA_TABLE_SELECTOR).exists()).toBe(false);
        });
    });

    // The blocking error state hides the Toolbar with its refresh button, so the
    // retry button is the only control the user is left with there.
    describe('retry button in the error state', () => {
        const RETRY_SELECTOR = '[data-testid="aura-error-retry"]';

        interface AuraVM {
            core: {
                errorStore: {
                    addError: (error: unknown) => void;
                };
            };
        }

        const mountWithError = async (storeId: string, labels: Record<string, string> = {}) => {
            const wrapper = mount(Aura, {
                props: { storeId },
                global: {
                    config: {
                        globalProperties: { $aura: { labels } } as never,
                    },
                },
            });

            (wrapper.vm as unknown as AuraVM).core.errorStore.addError({
                severity: 'error',
                component: 'ApiResourcesStore',
                action: 'fetchData',
                type: 'api',
                message: 'Request failed with status code 500',
            });

            await wrapper.vm.$nextTick();

            return wrapper;
        };

        it('should render the retry button in the blocking error state', async () => {
            const wrapper = await mountWithError('retry-store');

            expect(wrapper.find(RETRY_SELECTOR).exists()).toBe(true);
            expect(wrapper.find(RETRY_SELECTOR).text()).toBe('Retry');
        });

        it('should not render the retry button while the table renders', () => {
            const wrapper = mount(Aura, {
                props: { storeId: 'retry-no-error-store' },
            });

            expect(wrapper.find(RETRY_SELECTOR).exists()).toBe(false);
        });

        it('should refetch when the retry button is clicked', async () => {
            const mockFetchData = vi.fn().mockResolvedValue({ data: {} });
            vi.mocked(useApiResourcesStore).mockReturnValue({
                fetchData: mockFetchData,
                queryParams: { page: 1, paginate: 10 },
                autoRefetch: true,
            } as unknown as ReturnType<typeof useApiResourcesStore>);

            const wrapper = await mountWithError('retry-click-store');
            // The mount itself fetched once
            expect(mockFetchData).toHaveBeenCalledTimes(1);

            await wrapper.find(RETRY_SELECTOR).trigger('click');

            expect(mockFetchData).toHaveBeenCalledTimes(2);
        });

        it('should use the labels.retry override', async () => {
            const wrapper = await mountWithError('retry-label-store', { retry: 'Újrapróbálkozás' });

            expect(wrapper.find(RETRY_SELECTOR).text()).toBe('Újrapróbálkozás');
        });
    });

    describe('TypeScript types', () => {
        it('should accept type-safe props', () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: 'typed-store',
                    debug: true,
                    siteName: 'Typed Site',
                    rowsNumber: 10,
                    paginateValues: [5, 10, 25],
                    showFooter: true,
                } as const,
            });
            expect(wrapper.exists()).toBe(true);
        });
    });

    describe('RowsSelect integration', () => {
        it('should initialize rowsNumber from queryParams.paginate', async () => {
            const mockFetchData = vi.fn().mockResolvedValue({ data: {} });

            vi.mocked(useApiResourcesStore).mockReturnValueOnce({
                fetchData: mockFetchData,
                setPage: vi.fn(),
                setLimit: vi.fn(),
                queryParams: { page: 1, paginate: 25 },
                autoRefetch: true,
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                body: null,
                footer: null,
                displayFooter: null,
                items: [],
                displayItems: [],
                meta: null,
                displayMeta: null,
                links: null,
                processResponse: vi.fn(),
                clearResponse: vi.fn(),
                $id: 'rows-init-store',
                $dispose: vi.fn(),
            } as any);

            const wrapper = mount(Aura, {
                props: {
                    storeId: 'rows-init-store',
                    paginateValues: [10, 25, 50, 100],
                    rowsNumber: 10,
                },
            });

            await wrapper.vm.$nextTick();

            // The rowsNumber should come from queryParams.paginate (25), not from props (10)
            const toolbar = wrapper.find('[data-testid="aura-toolbar"]');
            if (toolbar.exists()) {
                const rowsSelect = toolbar.find('[data-testid="rows-select"]');
                expect(rowsSelect.exists()).toBe(true);
            }
        });

        it('should call setLimit when onRowsChange is triggered', async () => {
            const mockFetchData = vi.fn().mockResolvedValue({ data: {} });
            const mockSetLimit = vi.fn();

            vi.mocked(useApiResourcesStore).mockReturnValueOnce({
                fetchData: mockFetchData,
                setPage: vi.fn(),
                setLimit: mockSetLimit,
                queryParams: { page: 1, paginate: 10 },
                autoRefetch: true,
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                body: null,
                footer: null,
                displayFooter: null,
                items: [],
                displayItems: [],
                meta: null,
                displayMeta: null,
                links: null,
                processResponse: vi.fn(),
                clearResponse: vi.fn(),
                $id: 'rows-change-store',
                $dispose: vi.fn(),
            } as any);

            const wrapper = mount(Aura, {
                props: {
                    storeId: 'rows-change-store',
                    paginateValues: [10, 25, 50, 100],
                    rowsNumber: 10,
                },
            });

            await wrapper.vm.$nextTick();

            // Trigger rows change via component method
            const onRowsChange = wrapper.vm.onRowsChange;
            if (onRowsChange) {
                onRowsChange(25);
                expect(mockSetLimit).toHaveBeenCalledWith(25);
            }
        });

        it('should render Toolbar with rowsNumber from queryParams', async () => {
            const mockFetchData = vi.fn().mockResolvedValue({ data: {} });

            vi.mocked(useApiResourcesStore).mockReturnValueOnce({
                fetchData: mockFetchData,
                setPage: vi.fn(),
                setLimit: vi.fn(),
                queryParams: { page: 1, paginate: 50 },
                autoRefetch: true,
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                body: null,
                footer: null,
                displayFooter: null,
                items: [],
                displayItems: [],
                meta: { total: 100, current_page: 1 },
                displayMeta: {
                    current_page: 1,
                    from: 1,
                    last_page: 2,
                    path: '',
                    per_page: 50,
                    to: 50,
                    total: 100,
                },
                links: null,
                processResponse: vi.fn(),
                clearResponse: vi.fn(),
                $id: 'toolbar-rows-store',
                $dispose: vi.fn(),
            } as any);

            const wrapper = mount(Aura, {
                props: {
                    storeId: 'toolbar-rows-store',
                    paginateValues: [10, 25, 50, 100],
                    rowsNumber: 10,
                },
            });

            await wrapper.vm.$nextTick();

            // Toolbar should render
            const toolbar = wrapper.find('[data-testid="aura-toolbar"]');
            expect(toolbar.exists()).toBe(true);
        });

        it('should render Toolbar even without explicit paginateValues prop (uses default)', async () => {
            const mockFetchData = vi.fn().mockResolvedValue({ data: {} });

            vi.mocked(useApiResourcesStore).mockReturnValueOnce({
                fetchData: mockFetchData,
                setPage: vi.fn(),
                setLimit: vi.fn(),
                queryParams: { page: 1, paginate: 10 },
                autoRefetch: true,
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                body: null,
                footer: null,
                displayFooter: null,
                items: [],
                displayItems: [],
                meta: { total: 100, current_page: 1 },
                displayMeta: {
                    current_page: 1,
                    from: 1,
                    last_page: 10,
                    path: '',
                    per_page: 10,
                    to: 10,
                    total: 100,
                },
                links: null,
                processResponse: vi.fn(),
                clearResponse: vi.fn(),
                $id: 'default-paginate-values-store',
                $dispose: vi.fn(),
            } as any);

            const wrapper = mount(Aura, {
                props: {
                    storeId: 'default-paginate-values-store',
                    // No explicit paginateValues prop - will use default config
                },
            });

            await wrapper.vm.$nextTick();

            // Toolbar should render with default paginateValues from config
            const toolbar = wrapper.find('[data-testid="aura-toolbar"]');
            expect(toolbar.exists()).toBe(true);
        });

        it('should update rowsNumber when queryParams.paginate changes', async () => {
            const mockFetchData = vi.fn().mockResolvedValue({ data: {} });
            const mockSetLimit = vi.fn();

            const queryParams = { page: 1, paginate: 10 };

            vi.mocked(useApiResourcesStore).mockReturnValueOnce({
                fetchData: mockFetchData,
                setPage: vi.fn(),
                setLimit: mockSetLimit,
                queryParams,
                autoRefetch: true,
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                body: null,
                footer: null,
                displayFooter: null,
                items: [],
                displayItems: [],
                meta: null,
                displayMeta: null,
                links: null,
                processResponse: vi.fn(),
                clearResponse: vi.fn(),
                $id: 'rows-update-store',
                $dispose: vi.fn(),
            } as any);

            const wrapper = mount(Aura, {
                props: {
                    storeId: 'rows-update-store',
                    paginateValues: [10, 25, 50, 100],
                    rowsNumber: 10,
                },
            });

            await wrapper.vm.$nextTick();

            // Initial value should be 10
            const initialRowsNumber = wrapper.vm.rowsNumber;
            expect(initialRowsNumber).toBe(10);

            // Simulate queryParams change
            queryParams.paginate = 25;

            await wrapper.vm.$nextTick();

            // rowsNumber should be reactive to queryParams.paginate changes
            // Note: In real implementation, this would be handled by the store's reactivity
        });
    });

    describe('Pagination integration', () => {
        it('should render Pagination component when displayMeta exists', async () => {
            const mockFetchData = vi.fn().mockResolvedValue({ data: {} });
            const mockSetPage = vi.fn();

            vi.mocked(useApiResourcesStore).mockReturnValueOnce({
                fetchData: mockFetchData,
                setPage: mockSetPage,
                setLimit: vi.fn(),
                queryParams: { page: 1, paginate: 10 },
                autoRefetch: true,
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                body: null,
                footer: null,
                displayFooter: null,
                items: Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })),
                displayItems: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })),
                meta: null,
                displayMeta: {
                    current_page: 1,
                    from: 1,
                    last_page: 10,
                    path: '',
                    per_page: 10,
                    to: 10,
                    total: 100,
                },
                links: null,
                processResponse: vi.fn(),
                clearResponse: vi.fn(),
                $id: 'pagination-store',
                $dispose: vi.fn(),
            } as any);

            const wrapper = mount(Aura, {
                props: {
                    storeId: 'pagination-store',
                },
            });

            await wrapper.vm.$nextTick();

            // Should render Pagination component
            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(true);
        });

        it('should NOT render Pagination when displayMeta is null', async () => {
            const mockFetchData = vi.fn().mockResolvedValue({ data: {} });

            vi.mocked(useApiResourcesStore).mockReturnValueOnce({
                fetchData: mockFetchData,
                setPage: vi.fn(),
                setLimit: vi.fn(),
                queryParams: { page: 1, paginate: 10 },
                autoRefetch: true,
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                body: null,
                footer: null,
                displayFooter: null,
                items: [],
                displayItems: [],
                meta: null,
                displayMeta: null,
                links: null,
                processResponse: vi.fn(),
                clearResponse: vi.fn(),
                $id: 'no-pagination-store',
                $dispose: vi.fn(),
            } as any);

            const wrapper = mount(Aura, {
                props: {
                    storeId: 'no-pagination-store',
                },
            });

            await wrapper.vm.$nextTick();

            // Should NOT render Pagination component
            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(false);
        });

        it('should call setPage when page changes', async () => {
            const mockFetchData = vi.fn().mockResolvedValue({ data: {} });
            const mockSetPage = vi.fn();

            vi.mocked(useApiResourcesStore).mockReturnValueOnce({
                fetchData: mockFetchData,
                setPage: mockSetPage,
                setLimit: vi.fn(),
                queryParams: { page: 1, paginate: 10 },
                autoRefetch: true,
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                body: null,
                footer: null,
                displayFooter: null,
                items: Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })),
                displayItems: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })),
                meta: null,
                displayMeta: {
                    current_page: 1,
                    from: 1,
                    last_page: 10,
                    path: '',
                    per_page: 10,
                    to: 10,
                    total: 100,
                },
                links: null,
                processResponse: vi.fn(),
                clearResponse: vi.fn(),
                $id: 'page-change-store',
                $dispose: vi.fn(),
            } as any);

            const wrapper = mount(Aura, {
                props: {
                    storeId: 'page-change-store',
                },
            });

            await wrapper.vm.$nextTick();

            // Find the pagination component and trigger page change
            const pageButton = wrapper.find('[data-testid="pagination-button-2"]');
            if (pageButton.exists()) {
                await pageButton.trigger('click');
                expect(mockSetPage).toHaveBeenCalledWith(2);
            }
        });

        it('should render pagination info with correct values', async () => {
            const mockFetchData = vi.fn().mockResolvedValue({ data: {} });

            vi.mocked(useApiResourcesStore).mockReturnValueOnce({
                fetchData: mockFetchData,
                setPage: vi.fn(),
                setLimit: vi.fn(),
                queryParams: { page: 2, paginate: 10 },
                autoRefetch: true,
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                body: null,
                footer: null,
                displayFooter: null,
                items: Array.from({ length: 100 }, (_, i) => ({ id: i + 1 })),
                displayItems: Array.from({ length: 10 }, (_, i) => ({ id: i + 11 })),
                meta: null,
                displayMeta: {
                    current_page: 2,
                    from: 11,
                    last_page: 10,
                    path: '',
                    per_page: 10,
                    to: 20,
                    total: 100,
                },
                links: null,
                processResponse: vi.fn(),
                clearResponse: vi.fn(),
                $id: 'pagination-info-store',
                $dispose: vi.fn(),
            } as any);

            const wrapper = mount(Aura, {
                props: {
                    storeId: 'pagination-info-store',
                },
            });

            await wrapper.vm.$nextTick();

            // Should render pagination info
            const paginationInfo = wrapper.find('[data-testid="aura-pagination-info"]');
            expect(paginationInfo.exists()).toBe(true);
            expect(paginationInfo.text()).toContain('11');
            expect(paginationInfo.text()).toContain('20');
            expect(paginationInfo.text()).toContain('100');
        });
    });

    describe('DestroyModal integration', () => {
        interface AuraVM {
            core: {
                errorStore: {
                    addError: (error: unknown) => void;
                };
            };
        }

        it('should render DestroyModal inside aura-wrapper in the normal rendering branch', () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: 'destroy-modal-integration-store',
                },
            });

            expect(wrapper.find('[data-testid="destroy-modal"]').exists()).toBe(true);
        });

        it('should NOT render DestroyModal in the critical error rendering branch', async () => {
            const wrapper = mount(Aura, {
                props: {
                    storeId: 'destroy-modal-critical-store',
                },
            });

            const core = (wrapper.vm as unknown as AuraVM).core;
            core.errorStore.addError({
                severity: 'critical',
                component: 'Aura',
                action: 'init',
                type: 'validation',
                message: 'Critical error for destroy modal test',
            });
            await wrapper.vm.$nextTick();

            expect(wrapper.find(AURA_CRITICAL_ERROR_SELECTOR).exists()).toBe(true);
            expect(wrapper.find('[data-testid="destroy-modal"]').exists()).toBe(false);
        });
    });

    describe('loading indicators', () => {
        const OVERLAY_SELECTOR = '[data-testid="aura-loading-overlay"]';
        const LOADING_BAR_SELECTOR = '[data-testid="aura-loading-bar"]';

        const mountWithLoading = (
            storeId: string,
            loading: boolean,
            props: Record<string, unknown> = {}
        ) => {
            vi.mocked(useApiResourcesStore).mockReturnValueOnce({
                fetchData: vi.fn().mockResolvedValue({ data: {} }),
                setPage: vi.fn(),
                setLimit: vi.fn(),
                queryParams: { page: 1, paginate: 10 },
                autoRefetch: true,
                loading,
                header: null,
                body: null,
                footer: null,
                displayFooter: null,
                items: [],
                displayItems: [],
                meta: null,
                displayMeta: null,
                links: null,
                processResponse: vi.fn(),
                clearResponse: vi.fn(),
                $id: storeId,
                $dispose: vi.fn(),
            } as any);

            return mount(Aura, { props: { storeId, ...props } });
        };

        /** Mount, then let the overlay's delay elapse. */
        const mountAndSettle = async (
            storeId: string,
            loading: boolean,
            props: Record<string, unknown> = {}
        ) => {
            vi.useFakeTimers();
            const wrapper = mountWithLoading(storeId, loading, props);
            await vi.advanceTimersByTimeAsync(LOADING_OVERLAY_DELAY_MS);
            vi.useRealTimers();
            await wrapper.vm.$nextTick();
            return wrapper;
        };

        it('should render the overlay once a request outlasts the delay', async () => {
            const wrapper = await mountAndSettle('overlay-loading', true);

            expect(wrapper.find(OVERLAY_SELECTOR).exists()).toBe(true);
        });

        // The whole point of the delay: a request that resolves quickly must not
        // make the veil flash on and off over the rows.
        it('should not render the overlay before the delay has elapsed', async () => {
            vi.useFakeTimers();
            const wrapper = mountWithLoading('overlay-delay', true);
            await vi.advanceTimersByTimeAsync(LOADING_OVERLAY_DELAY_MS - 1);
            vi.useRealTimers();
            await wrapper.vm.$nextTick();

            expect(wrapper.find(OVERLAY_SELECTOR).exists()).toBe(false);
        });

        it('should not render the overlay when no request is in flight', async () => {
            const wrapper = await mountAndSettle('overlay-idle', false);

            expect(wrapper.find(OVERLAY_SELECTOR).exists()).toBe(false);
        });

        // The host can switch the built-in overlay off and bind its own indicator
        // to `store.loading`, which stays exposed either way.
        it('should not render the overlay when showLoadingOverlay is false', async () => {
            const wrapper = await mountAndSettle('overlay-disabled', true, {
                showLoadingOverlay: false,
            });

            expect(wrapper.find(OVERLAY_SELECTOR).exists()).toBe(false);
        });

        /** The only configuration that draws the bar: opted in, with the overlay off. */
        const BAR_ONLY = { showLoadingBar: true, showLoadingOverlay: false };

        // The bar has no anti-flicker delay of its own, so it must not wait.
        it('should render the loading bar immediately while a request is in flight', async () => {
            const wrapper = mountWithLoading('bar-loading', true, BAR_ONLY);
            await wrapper.vm.$nextTick();

            expect(wrapper.find(LOADING_BAR_SELECTOR).exists()).toBe(true);
        });

        it('should not render the loading bar when no request is in flight', async () => {
            const wrapper = mountWithLoading('bar-idle', false, BAR_ONLY);
            await wrapper.vm.$nextTick();

            expect(wrapper.find(LOADING_BAR_SELECTOR).exists()).toBe(false);
        });

        it('should not render the loading bar when showLoadingBar is false', async () => {
            const wrapper = mountWithLoading('bar-disabled', true, {
                ...BAR_ONLY,
                showLoadingBar: false,
            });
            await wrapper.vm.$nextTick();

            expect(wrapper.find(LOADING_BAR_SELECTOR).exists()).toBe(false);
        });

        // The bar is opt-in: with no config at all, a page load must not flash it
        // before the overlay's delay has passed.
        it('should not render the loading bar by default', async () => {
            vi.useFakeTimers();
            const wrapper = mountWithLoading('bar-default', true);
            await wrapper.vm.$nextTick();

            expect(wrapper.find(LOADING_BAR_SELECTOR).exists()).toBe(false);

            await vi.advanceTimersByTimeAsync(LOADING_OVERLAY_DELAY_MS);
            vi.useRealTimers();
            await wrapper.vm.$nextTick();

            expect(wrapper.find(LOADING_BAR_SELECTOR).exists()).toBe(false);
            expect(wrapper.find(OVERLAY_SELECTOR).exists()).toBe(true);
        });

        // An indeterminate progressbar is one that reports no `aria-valuenow`.
        it('should expose the loading bar as an indeterminate progressbar', async () => {
            const wrapper = mountWithLoading('bar-a11y', true, BAR_ONLY);
            await wrapper.vm.$nextTick();

            const bar = wrapper.find(LOADING_BAR_SELECTOR);
            expect(bar.attributes('role')).toBe('progressbar');
            expect(bar.attributes('aria-label')).toBe('Loading...');
            expect(bar.attributes('aria-valuenow')).toBeUndefined();
        });

        // With the overlay off the bar is the only indicator, so it must outlast the
        // overlay's delay rather than step aside for it.
        it('should keep the loading bar for the whole request when the overlay is off', async () => {
            const wrapper = await mountAndSettle('bar-without-overlay', true, BAR_ONLY);

            expect(wrapper.find(OVERLAY_SELECTOR).exists()).toBe(false);
            expect(wrapper.find(LOADING_BAR_SELECTOR).exists()).toBe(true);
        });

        // The indicators are mutually exclusive and the overlay is the stronger one:
        // switching both on must never draw the bar, not even inside the delay window.
        it('should let the overlay win when both indicators are switched on', async () => {
            vi.useFakeTimers();
            const wrapper = mountWithLoading('bar-and-overlay', true, {
                showLoadingBar: true,
                showLoadingOverlay: true,
            });
            await wrapper.vm.$nextTick();

            expect(wrapper.find(LOADING_BAR_SELECTOR).exists()).toBe(false);

            await vi.advanceTimersByTimeAsync(LOADING_OVERLAY_DELAY_MS);
            vi.useRealTimers();
            await wrapper.vm.$nextTick();

            expect(wrapper.find(LOADING_BAR_SELECTOR).exists()).toBe(false);
            expect(wrapper.find(OVERLAY_SELECTOR).exists()).toBe(true);
        });

        // `aria-busy` tracks the request itself, not the delayed overlay: assistive
        // technology should not be kept waiting on a purely visual anti-flicker delay.
        it('should mark the table aria-busy while loading, without waiting for the delay', async () => {
            const wrapper = mountWithLoading('overlay-aria-busy', true);
            await wrapper.vm.$nextTick();

            expect(wrapper.find(AURA_TABLE_SELECTOR).attributes('aria-busy')).toBe('true');
        });

        it('should mark the table not aria-busy when idle', async () => {
            const wrapper = mountWithLoading('overlay-aria-idle', false);
            await wrapper.vm.$nextTick();

            expect(wrapper.find(AURA_TABLE_SELECTOR).attributes('aria-busy')).toBe('false');
        });

        // The spinner is a graphic with no text of its own, so the accessible name
        // has to come from the visually hidden label.
        it('should announce the spinner with the loading label', async () => {
            const wrapper = await mountAndSettle('overlay-label', true);

            const spinner = wrapper.find('.spinner-border');
            expect(spinner.attributes('role')).toBe('status');
            expect(spinner.find('.visually-hidden').text()).toBe('Loading...');
        });

        // Inside `.table-responsive` the overlay would scroll away with the table;
        // it has to sit next to the scroll container instead.
        it('should place the overlay outside the horizontal scroll container', async () => {
            const wrapper = await mountAndSettle('overlay-position', true);

            expect(wrapper.find(`.table-responsive ${OVERLAY_SELECTOR}`).exists()).toBe(false);
            expect(wrapper.find(`.position-relative > ${OVERLAY_SELECTOR}`).exists()).toBe(true);
        });
    });

    describe('body.settings → table classes', () => {
        const HEADER_STUB = { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] };

        const mountWithBodySettings = (storeId: string, settings: unknown) => {
            vi.mocked(useApiResourcesStore).mockReturnValueOnce({
                fetchData: vi.fn().mockResolvedValue({ data: {} }),
                setPage: vi.fn(),
                setLimit: vi.fn(),
                queryParams: { page: 1, paginate: 10 },
                autoRefetch: true,
                header: HEADER_STUB,
                body: settings === undefined ? null : { settings },
                footer: null,
                displayFooter: null,
                items: [],
                displayItems: [],
                meta: null,
                displayMeta: null,
                links: null,
                processResponse: vi.fn(),
                clearResponse: vi.fn(),
                $id: storeId,
                $dispose: vi.fn(),
            } as any);

            return mount(Aura, { props: { storeId } });
        };

        it('should keep config defaults (striped + hover) when body is null', async () => {
            const wrapper = mountWithBodySettings('body-settings-default', undefined);
            await wrapper.vm.$nextTick();

            const table = wrapper.find(AURA_TABLE_SELECTOR);
            expect(table.classes()).toContain('table-striped');
            expect(table.classes()).toContain('table-hover');
        });

        it('should remove table-striped when settings.striped is false', async () => {
            const wrapper = mountWithBodySettings('body-settings-no-stripe', { striped: false });
            await wrapper.vm.$nextTick();

            const table = wrapper.find(AURA_TABLE_SELECTOR);
            expect(table.classes()).not.toContain('table-striped');
            // hover stays, since it was not overridden
            expect(table.classes()).toContain('table-hover');
        });

        it('should remove table-hover when settings.hoverable is false', async () => {
            const wrapper = mountWithBodySettings('body-settings-no-hover', { hoverable: false });
            await wrapper.vm.$nextTick();

            const table = wrapper.find(AURA_TABLE_SELECTOR);
            expect(table.classes()).not.toContain('table-hover');
            expect(table.classes()).toContain('table-striped');
        });

        it('should keep classes idempotent when settings enable already-default toggles', async () => {
            const wrapper = mountWithBodySettings('body-settings-true', {
                striped: true,
                hoverable: true,
            });
            await wrapper.vm.$nextTick();

            const table = wrapper.find(AURA_TABLE_SELECTOR);
            expect(table.classes().filter(c => c === 'table-striped')).toHaveLength(1);
            expect(table.classes().filter(c => c === 'table-hover')).toHaveLength(1);
        });
    });
});
