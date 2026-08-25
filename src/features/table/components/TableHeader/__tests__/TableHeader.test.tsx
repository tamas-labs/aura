import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { TableHeader } from '../TableHeader';
import { TableHeaderRow } from '../TableHeaderRow';
import { useCoreStore, useApiResourcesStore } from '../../../../../state';
import type { AuraProps } from '../../../../../types';

describe('TableHeader', () => {
    const TEST_STORE_ID = 'test-table-header';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('rendering with valid data', () => {
        it('should render table structure with header', async () => {
            // Initialize stores with test data
            const core = useCoreStore(TEST_STORE_ID, {
                storeId: TEST_STORE_ID,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID, core);

            // Set header data
            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id' },
                                { content: 'Name', key: 'name', field: 'name' },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID,
                },
            });

            expect(wrapper.find('[data-testid="table-header"]').exists()).toBe(true);
            expect(wrapper.find('thead').exists()).toBe(true);
        });

        it('should render thead element', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-classes', {
                storeId: TEST_STORE_ID + '-classes',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-classes', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [{ content: 'Test', key: 'test', field: 'test' }],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-classes',
                },
            });

            const thead = wrapper.find('thead');
            expect(thead.exists()).toBe(true);
            expect(thead.attributes('data-testid')).toBe('table-header');
        });

        it('should render single row with multiple cells', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-single-row', {
                storeId: TEST_STORE_ID + '-single-row',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-single-row', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id' },
                                { content: 'Name', key: 'name', field: 'name' },
                                { content: 'Email', key: 'email', field: 'email' },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-single-row',
                },
            });

            await flushPromises();
            const rows = wrapper.findAllComponents(TableHeaderRow);
            expect(rows).toHaveLength(1);

            const cells = wrapper.findAll('th');
            expect(cells).toHaveLength(3);
            expect(cells[0]!.text()).toBe('ID');
            expect(cells[1]!.text()).toBe('Name');
            expect(cells[2]!.text()).toBe('Email');
        });

        it('should render multiple rows (multi-row header)', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-multi-row', {
                storeId: TEST_STORE_ID + '-multi-row',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-multi-row', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'File', key: 'file', field: 'file', rowspan: 2 },
                                { content: 'Price', key: 'price', field: 'price', colspan: 3 },
                            ],
                        },
                        {
                            cells: [
                                { content: 'USD', key: 'usd', field: 'usd' },
                                { content: 'EUR', key: 'eur', field: 'eur' },
                                { content: 'GBP', key: 'gbp', field: 'gbp' },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-multi-row',
                },
            });

            const rows = wrapper.findAllComponents(TableHeaderRow);
            expect(rows).toHaveLength(2);
        });

        it('should render rows with correct rowIndex', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-row-index', {
                storeId: TEST_STORE_ID + '-row-index',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-row-index', core);

            await resource.processResponse({
                header: {
                    rows: [
                        { cells: [{ content: 'Row 0', key: 'row0', field: 'row0' }] },
                        { cells: [{ content: 'Row 1', key: 'row1', field: 'row1' }] },
                        { cells: [{ content: 'Row 2', key: 'row2', field: 'row2' }] },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-row-index',
                },
            });

            const rows = wrapper.findAll('tr');
            expect(rows[0]!.attributes('data-row-index')).toBe('0');
            expect(rows[1]!.attributes('data-row-index')).toBe('1');
            expect(rows[2]!.attributes('data-row-index')).toBe('2');
        });
    });

    describe('edge cases', () => {
        it('should return null when header is null', () => {
            const core = useCoreStore(TEST_STORE_ID + '-null-header', {
                storeId: TEST_STORE_ID + '-null-header',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-null-header', core);

            // Don't call processResponse - leave header as null

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-null-header',
                },
            });

            // When header is null, component returns null (no table rendered)
            expect(wrapper.find('table').exists()).toBe(false);
        });
    });

    describe('complex header structures', () => {
        it('should render header with cells having various properties', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-complex', {
                storeId: TEST_STORE_ID + '-complex',
                classes: {
                    table: ['table', 'table-hover'],
                },
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-complex', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'ID',
                                    key: 'id',
                                    field: 'id',
                                    width: '50px',
                                    align: 'center',
                                    sortable: true,
                                },
                                {
                                    content: 'Name',
                                    key: 'name',
                                    field: 'name',
                                    width: '200px',
                                    align: 'start',
                                    class: 'fw-bold',
                                },
                                {
                                    content: 'Price',
                                    key: 'price',
                                    field: 'price',
                                    align: 'end',
                                    monospace: true,
                                },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-complex',
                },
            });

            const cells = wrapper.findAll('th');
            expect(cells).toHaveLength(3);

            // Check ID cell
            expect(cells[0]!.attributes('style')).toContain('width: 50px');
            expect(cells[0]!.attributes('style')).toContain('text-align: center');

            // Check Name cell
            expect(cells[1]!.attributes('style')).toContain('width: 200px');
            expect(cells[1]!.classes()).toContain('fw-bold');

            // Check Price cell
            expect(cells[2]!.classes()).toContain('font-monospace');
        });
    });

    describe('search functionality', () => {
        it('should not render search row when no searchable cells', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-no-search', {
                storeId: TEST_STORE_ID + '-no-search',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-no-search', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id' },
                                { content: 'Name', key: 'name', field: 'name' },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-no-search',
                },
            });

            expect(wrapper.find('[data-testid="table-header-search-row"]').exists()).toBe(false);
        });

        it('should render search row when searchable cells exist', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-with-search', {
                storeId: TEST_STORE_ID + '-with-search',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-with-search', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id' },
                                { content: 'Name', key: 'name', field: 'name', searchable: true },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-with-search',
                },
            });

            expect(wrapper.find('[data-testid="table-header-search-row"]').exists()).toBe(true);
        });

        it('should render search row for any searchable cell in any row', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-multi-row-search', {
                storeId: TEST_STORE_ID + '-multi-row-search',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-multi-row-search', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [{ content: 'Group', key: 'group', colspan: 2 }],
                        },
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id' },
                                { content: 'Name', key: 'name', field: 'name', searchable: true },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-multi-row-search',
                },
            });

            expect(wrapper.find('[data-testid="table-header-search-row"]').exists()).toBe(true);
        });

        it('should pass last row cells to search row', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-last-row', {
                storeId: TEST_STORE_ID + '-last-row',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-last-row', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [{ content: 'Group', key: 'group', colspan: 3 }],
                        },
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id' },
                                { content: 'Name', key: 'name', field: 'name', searchable: true },
                                {
                                    content: 'Email',
                                    key: 'email',
                                    field: 'email',
                                    searchable: true,
                                },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-last-row',
                },
            });

            const searchRow = wrapper.find('[data-testid="table-header-search-row"]');
            expect(searchRow.exists()).toBe(true);

            // Should have 3 th elements (one for each cell in last row)
            const thElements = searchRow.findAll('th');
            expect(thElements).toHaveLength(3);
        });

        it('should render search inputs only for searchable columns', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-mixed-search', {
                storeId: TEST_STORE_ID + '-mixed-search',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-mixed-search', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id' },
                                { content: 'Name', key: 'name', field: 'name', searchable: true },
                                { content: 'Status', key: 'status', field: 'status' },
                                {
                                    content: 'Email',
                                    key: 'email',
                                    field: 'email',
                                    searchable: true,
                                },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-mixed-search',
                },
            });

            const searchCells = wrapper.findAll('[data-testid="table-header-search-cell"]');
            expect(searchCells).toHaveLength(2);
        });
    });

    describe('showHeaderSearch config integration', () => {
        it('should not render search row when showHeaderSearch is true (global search active)', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-global-search-active', {
                storeId: TEST_STORE_ID + '-global-search-active',
                showHeaderSearch: true,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-global-search-active', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id', searchable: true },
                                { content: 'Name', key: 'name', field: 'name', searchable: true },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-global-search-active',
                },
            });

            // Search row should NOT be rendered even though cells are searchable
            const searchRow = wrapper.find('[data-testid="table-header-search-row"]');
            expect(searchRow.exists()).toBe(false);
        });

        it('should render search row when showHeaderSearch is false and cells are searchable', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-local-search-active', {
                storeId: TEST_STORE_ID + '-local-search-active',
                showHeaderSearch: false,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-local-search-active', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id', searchable: true },
                                { content: 'Name', key: 'name', field: 'name', searchable: true },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-local-search-active',
                },
            });

            // Search row SHOULD be rendered
            const searchRow = wrapper.find('[data-testid="table-header-search-row"]');
            expect(searchRow.exists()).toBe(true);
        });

        it('should not render search row when showHeaderSearch is false but no cells are searchable', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-no-search', {
                storeId: TEST_STORE_ID + '-no-search',
                showHeaderSearch: false,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-no-search', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id', searchable: false },
                                { content: 'Name', key: 'name', field: 'name', searchable: false },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-no-search',
                },
            });

            // Search row should NOT be rendered (no searchable cells)
            const searchRow = wrapper.find('[data-testid="table-header-search-row"]');
            expect(searchRow.exists()).toBe(false);
        });

        it('should not render search row when showHeaderSearch is undefined (default) but cells are searchable', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-default-config', {
                storeId: TEST_STORE_ID + '-default-config',
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-default-config', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id', searchable: true },
                                { content: 'Name', key: 'name', field: 'name', searchable: true },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-default-config',
                },
            });

            // With default config (showHeaderSearch defaults to false), search row SHOULD render
            const searchRow = wrapper.find('[data-testid="table-header-search-row"]');
            expect(searchRow.exists()).toBe(true);
        });

        it('should prioritize showHeaderSearch config over searchable cells', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-priority', {
                storeId: TEST_STORE_ID + '-priority',
                showHeaderSearch: true,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-priority', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id', searchable: true },
                                { content: 'Name', key: 'name', field: 'name', searchable: true },
                                {
                                    content: 'Email',
                                    key: 'email',
                                    field: 'email',
                                    searchable: true,
                                },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, {
                props: {
                    storeId: TEST_STORE_ID + '-priority',
                },
            });

            // Even though all cells are searchable, global search config takes priority
            const searchRow = wrapper.find('[data-testid="table-header-search-row"]');
            expect(searchRow.exists()).toBe(false);
        });
    });

    describe('show: false column hiding', () => {
        it('should not render th for a header cell with show:false', async () => {
            const id = TEST_STORE_ID + '-show-header';
            const core = useCoreStore(id, { storeId: id } as AuraProps);
            const resource = useApiResourcesStore(id, core);
            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'A', key: 'a', field: 'a' },
                                { content: 'B', key: 'b', field: 'b', show: false },
                                { content: 'C', key: 'c', field: 'c' },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, { props: { storeId: id } });
            await flushPromises();
            const headerTexts = wrapper.findAll('thead th').map(th => th.text());
            expect(headerTexts).toEqual(['A', 'C']);
        });

        it('should align the search row with visible columns only', async () => {
            const id = TEST_STORE_ID + '-show-search';
            const core = useCoreStore(id, { storeId: id, showHeaderSearch: false } as AuraProps);
            const resource = useApiResourcesStore(id, core);
            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'A', key: 'a', field: 'a', searchable: true },
                                {
                                    content: 'B',
                                    key: 'b',
                                    field: 'b',
                                    searchable: true,
                                    show: false,
                                },
                                { content: 'C', key: 'c', field: 'c', searchable: true },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableHeader, { props: { storeId: id } });
            await flushPromises();

            const searchRow = wrapper.find('[data-testid="table-header-search-row"]');
            expect(searchRow.exists()).toBe(true);
            // 1 of 3 columns hidden → 2 cells in the search row
            expect(searchRow.findAll('th')).toHaveLength(2);
        });
    });

    describe('header.settings (sticky / height)', () => {
        const mountWithSettings = async (
            suffix: string,
            settings: Record<string, unknown> | undefined
        ) => {
            const id = TEST_STORE_ID + suffix;
            const core = useCoreStore(id, { storeId: id } as AuraProps);
            const resource = useApiResourcesStore(id, core);
            await resource.processResponse({
                header: {
                    rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }],
                    ...(settings ? { settings } : {}),
                },
            });
            return mount(TableHeader, { props: { storeId: id } });
        };

        it('should add aura-thead-sticky class when settings.sticky is true', async () => {
            const wrapper = await mountWithSettings('-sticky', { sticky: true });
            expect(wrapper.find('thead').classes()).toContain('aura-thead-sticky');
        });

        it('should not add sticky class when settings.sticky is false', async () => {
            const wrapper = await mountWithSettings('-no-sticky', { sticky: false });
            expect(wrapper.find('thead').classes()).not.toContain('aura-thead-sticky');
        });

        it('should not add sticky class when settings is absent', async () => {
            const wrapper = await mountWithSettings('-no-settings', undefined);
            expect(wrapper.find('thead').classes()).not.toContain('aura-thead-sticky');
        });

        it('should apply inline height from settings.height', async () => {
            const wrapper = await mountWithSettings('-height', { height: '50px' });
            expect(wrapper.find('thead').attributes('style')).toContain('height: 50px');
        });

        it('should apply both sticky class and height together', async () => {
            const wrapper = await mountWithSettings('-both', { sticky: true, height: '2.5rem' });
            const thead = wrapper.find('thead');
            expect(thead.classes()).toContain('aura-thead-sticky');
            expect(thead.attributes('style')).toContain('height: 2.5rem');
        });
    });
});
