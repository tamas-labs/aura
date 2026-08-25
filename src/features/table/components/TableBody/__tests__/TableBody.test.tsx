import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableBody } from '../TableBody';
import { useApiResourcesStore, useCoreStore } from '../../../../../state';

describe('TableBody', () => {
    let pinia: any;
    const storeId = 'test-store';

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
    });

    it('should render nothing when items are null', () => {
        const wrapper = mount(TableBody, {
            props: { storeId },
            global: { plugins: [pinia] },
        });

        expect(wrapper.find('[data-testid="table-body"]').exists()).toBe(false);
    });

    it('should render empty state when items are empty', async () => {
        const core = useCoreStore(storeId, {} as any);
        const resource = useApiResourcesStore(storeId, core);

        await resource.processResponse({
            header: {
                rows: [
                    {
                        cells: [{ key: 'id', content: 'ID', field: 'id' }],
                    },
                ],
            },
            items: [],
        });

        const wrapper = mount(TableBody, {
            props: { storeId },
            global: { plugins: [pinia] },
        });

        const tbody = wrapper.find('[data-testid="table-body"]');
        expect(tbody.exists()).toBe(true);

        const emptyRow = wrapper.find('[data-testid="table-body-empty-row"]');
        expect(emptyRow.exists()).toBe(true);

        const emptyCell = wrapper.find('[data-testid="table-body-empty-cell"]');
        expect(emptyCell.exists()).toBe(true);
        expect(emptyCell.text()).toContain('No data available to display');
    });

    it('should render tbody with rows when items match header columns', async () => {
        const core = useCoreStore(storeId, {} as any);
        const resource = useApiResourcesStore(storeId, core);

        const mockHeader = {
            rows: [
                {
                    cells: [
                        { key: 'id', content: 'ID', field: 'id' },
                        { key: 'name', content: 'Name', field: 'name' },
                    ],
                },
            ],
        };

        const mockItems = [
            { id: 1, name: 'Alice' },
            { id: 2, name: 'Bob' },
        ];

        await resource.processResponse({
            header: mockHeader,
            items: mockItems,
        });

        const wrapper = mount(TableBody, {
            props: { storeId },
            global: { plugins: [pinia] },
        });

        const tbody = wrapper.find('[data-testid="table-body"]');
        expect(tbody.exists()).toBe(true);

        const rows = wrapper.findAllComponents({ name: 'TableBodyRow' });
        expect(rows.length).toBe(2);
    });

    it('should filter columns based on key and field presence', async () => {
        const core = useCoreStore(storeId, {} as any);
        const resource = useApiResourcesStore(storeId, core);

        const mockHeader = {
            rows: [
                {
                    cells: [
                        { key: 'col1', content: 'Show', field: 'f1' }, // Valid column
                        { key: 'col2', content: 'No Field Prop', field: 'f2' }, // Has field but different key
                    ],
                },
            ],
        };

        const mockItems = [{ col1: 'val1', col2: 'val2' }];

        await resource.processResponse({
            header: mockHeader,
            items: mockItems,
        });

        const wrapper = mount(TableBody, {
            props: { storeId },
            global: { plugins: [pinia] },
        });

        const row = wrapper.findComponent({ name: 'TableBodyRow' });
        const columnsProp = row.props('columns');

        // Both columns have key and field, so both should pass
        expect(columnsProp.length).toBe(2);
        expect(columnsProp[0].key).toBe('col1');
        expect(columnsProp[1].key).toBe('col2');
    });

    it('should pick columns from the LAST row of header', async () => {
        const core = useCoreStore(storeId, {} as any);
        const resource = useApiResourcesStore(storeId, core);

        const mockHeader = {
            rows: [
                // First row (e.g. grouped headers)
                {
                    cells: [{ key: 'group1', content: 'Group', colspan: 2, field: 'g' }],
                },
                // Second (last) row - actual columns
                {
                    cells: [
                        { key: 'col1', content: 'Col 1', field: 'c1' },
                        { key: 'col2', content: 'Col 2', field: 'c2' },
                    ],
                },
            ],
        };

        await resource.processResponse({
            header: mockHeader,
            items: [{ c1: 'A', c2: 'B' }],
        });

        const wrapper = mount(TableBody, {
            props: { storeId },
            global: { plugins: [pinia] },
        });

        const row = wrapper.findComponent({ name: 'TableBodyRow' });
        const columnsProp = row.props('columns');

        expect(columnsProp.length).toBe(2);
        expect(columnsProp[0].key).toBe('col1');
        expect(columnsProp[1].key).toBe('col2');
    });

    it('should use displayItems instead of raw items', async () => {
        const core = useCoreStore(storeId + '-display', {} as any);
        core.config.externalPaginator = false;
        const resource = useApiResourcesStore(storeId + '-display', core);

        const mockHeader = {
            rows: [
                {
                    cells: [
                        { key: 'id', content: 'ID', field: 'id' },
                        { key: 'name', content: 'Name', field: 'name' },
                    ],
                },
            ],
        };

        // Create 25 items but only 10 should display (page 1, limit 10)
        const mockItems = Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            name: `User ${i + 1}`,
        }));

        await resource.processResponse({
            header: mockHeader,
            items: mockItems,
        });

        const wrapper = mount(TableBody, {
            props: { storeId: storeId + '-display' },
            global: { plugins: [pinia] },
        });

        // Should only render 10 rows (displayItems) not all 25 (items)
        const rows = wrapper.findAllComponents({ name: 'TableBodyRow' });
        expect(rows.length).toBe(10);
    });

    it('should update displayed items when page changes', async () => {
        const core = useCoreStore(storeId + '-pagination', {} as any);
        core.config.externalPaginator = false;
        const resource = useApiResourcesStore(storeId + '-pagination', core);

        const mockHeader = {
            rows: [
                {
                    cells: [{ key: 'id', content: 'ID', field: 'id' }],
                },
            ],
        };

        const mockItems = Array.from({ length: 30 }, (_, i) => ({
            id: i + 1,
        }));

        await resource.processResponse({
            header: mockHeader,
            items: mockItems,
        });

        const wrapper = mount(TableBody, {
            props: { storeId: storeId + '-pagination' },
            global: { plugins: [pinia] },
        });

        // Page 1: items 1-10
        let rows = wrapper.findAllComponents({ name: 'TableBodyRow' });
        expect(rows.length).toBe(10);

        // Change to page 2
        resource.setPage(2);
        await wrapper.vm.$nextTick();

        // Page 2: items 11-20
        rows = wrapper.findAllComponents({ name: 'TableBodyRow' });
        expect(rows.length).toBe(10);
    });

    describe('fields[] column support', () => {
        it('should include column with fields array and no field property', async () => {
            const core = useCoreStore(storeId + '-fields1', {} as any);
            const resource = useApiResourcesStore(storeId + '-fields1', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [{ key: 'fullId', content: 'ID', fields: ['idPrefix', 'id'] }],
                        },
                    ],
                },
                items: [{ id: 1 }],
            });

            const wrapper = mount(TableBody, {
                props: { storeId: storeId + '-fields1' },
                global: { plugins: [pinia] },
            });

            const row = wrapper.findComponent({ name: 'TableBodyRow' });
            const columnsProp = row.props('columns');

            expect(columnsProp).toHaveLength(1);
            expect(columnsProp[0].key).toBe('fullId');
            expect(columnsProp[0].fields).toEqual(['idPrefix', 'id']);
        });

        it('should include column with single-element fields array', async () => {
            // Note: fields: [] is rejected by Zod validation (min 1), so we test the minimum valid case
            const core = useCoreStore(storeId + '-fields2', {} as any);
            const resource = useApiResourcesStore(storeId + '-fields2', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { key: 'prefixedId', content: 'ID', fields: ['idPrefix'] },
                                { key: 'validField', content: 'Valid', field: 'name' },
                            ],
                        },
                    ],
                },
                items: [{ name: 'Alice' }],
                body: { columnConfigs: { idPrefix: { type: 'static', value: '#' } } },
            });

            const wrapper = mount(TableBody, {
                props: { storeId: storeId + '-fields2' },
                global: { plugins: [pinia] },
            });

            const row = wrapper.findComponent({ name: 'TableBodyRow' });
            const columnsProp = row.props('columns');

            expect(columnsProp).toHaveLength(2);
            expect(columnsProp[0].key).toBe('prefixedId');
            expect(columnsProp[1].key).toBe('validField');
        });

        it('should include mix of single-field and multi-field columns', async () => {
            const core = useCoreStore(storeId + '-fields3', {} as any);
            const resource = useApiResourcesStore(storeId + '-fields3', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { key: 'name', content: 'Name', field: 'name' },
                                { key: 'fullId', content: 'ID', fields: ['prefix', 'id'] },
                                { key: 'status', content: 'Status', field: 'status' },
                            ],
                        },
                    ],
                },
                items: [{ name: 'Alice', id: 1, status: 'active' }],
            });

            const wrapper = mount(TableBody, {
                props: { storeId: storeId + '-fields3' },
                global: { plugins: [pinia] },
            });

            const row = wrapper.findComponent({ name: 'TableBodyRow' });
            const columnsProp = row.props('columns');

            expect(columnsProp).toHaveLength(3);
            expect(columnsProp[0].key).toBe('name');
            expect(columnsProp[1].key).toBe('fullId');
            expect(columnsProp[2].key).toBe('status');
        });

        it('should include only the columns from the last header row', async () => {
            // Note: cells without field/fields are rejected by Zod validation, so this tests
            // the correct column selection from a multi-row header with a colspan grouping row
            const core = useCoreStore(storeId + '-fields4', {} as any);
            const resource = useApiResourcesStore(storeId + '-fields4', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            // Grouping row (colspan) - not picked as columns (not the last row)
                            cells: [{ key: 'group', content: 'Group', colspan: 2, field: 'g' }],
                        },
                        {
                            // Last row: actual data columns
                            cells: [
                                { key: 'f1', content: 'F1', field: 'f1' },
                                { key: 'f2', content: 'F2', fields: ['fa', 'fb'] },
                            ],
                        },
                    ],
                },
                items: [{ f1: 'val', fa: 'a', fb: 'b' }],
                body: { columnConfigs: { fa: { type: 'static', value: 'A' } } },
            });

            const wrapper = mount(TableBody, {
                props: { storeId: storeId + '-fields4' },
                global: { plugins: [pinia] },
            });

            const row = wrapper.findComponent({ name: 'TableBodyRow' });
            const columnsProp = row.props('columns');

            // Only last row's columns, not the grouping row
            expect(columnsProp).toHaveLength(2);
            expect(columnsProp[0].key).toBe('f1');
            expect(columnsProp[1].key).toBe('f2');
        });
    });

    describe('show: false column hiding', () => {
        it('should exclude columns with show:false from body columns', async () => {
            const core = useCoreStore(storeId, {} as any);
            const resource = useApiResourcesStore(storeId, core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { key: 'a', content: 'A', field: 'a' },
                                { key: 'b', content: 'B', field: 'b', show: false },
                                { key: 'c', content: 'C', field: 'c' },
                            ],
                        },
                    ],
                },
                items: [{ a: 1, b: 2, c: 3 }],
            });

            const wrapper = mount(TableBody, {
                props: { storeId },
                global: { plugins: [pinia] },
            });

            const row = wrapper.findComponent({ name: 'TableBodyRow' });
            const columnsProp = row.props('columns');
            expect(columnsProp.map((c: { key: string }) => c.key)).toEqual(['a', 'c']);

            // The hidden column's cell is not rendered
            const keys = wrapper
                .findAll('[data-testid="table-body-cell"]')
                .map(td => td.attributes('data-key'));
            expect(keys).toEqual(['a', 'c']);
        });

        it('should exclude hidden columns from empty-state colspan', async () => {
            const core = useCoreStore(storeId, {} as any);
            const resource = useApiResourcesStore(storeId, core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { key: 'a', content: 'A', field: 'a' },
                                { key: 'b', content: 'B', field: 'b', show: false },
                                { key: 'c', content: 'C', field: 'c' },
                            ],
                        },
                    ],
                },
                items: [],
            });

            const wrapper = mount(TableBody, {
                props: { storeId },
                global: { plugins: [pinia] },
            });

            const emptyCell = wrapper.find('[data-testid="table-body-empty-cell"]');
            expect(emptyCell.attributes('colspan')).toBe('2');
        });
    });

    describe('empty state text resolution', () => {
        /**
         * Priority: `labels.emptyState` → the deprecated `emptyStateMessage` → the default.
         */
        // The core store must be created DURING mount: useCoreStore reads the global
        // config off the current component instance, so a store created beforehand
        // would be cached by Pinia with an empty `$aura`.
        const mountEmpty = async (id: string, config: Record<string, unknown>) => {
            const wrapper = mount(TableBody, {
                props: { storeId: id },
                global: {
                    plugins: [pinia],
                    config: { globalProperties: { $aura: config } as never },
                },
            });

            const core = useCoreStore(id, {} as any);
            const resource = useApiResourcesStore(id, core);

            await resource.processResponse({
                header: { rows: [{ cells: [{ key: 'id', content: 'ID', field: 'id' }] }] },
                items: [],
            });
            await wrapper.vm.$nextTick();

            return wrapper;
        };

        it('should use labels.emptyState when provided', async () => {
            const wrapper = await mountEmpty('empty-labels', {
                labels: { emptyState: 'Nothing here yet' },
            });

            expect(wrapper.find('[data-testid="table-body-empty-cell"]').text()).toBe(
                'Nothing here yet'
            );
        });

        it('should keep honouring the deprecated emptyStateMessage alias', async () => {
            const wrapper = await mountEmpty('empty-alias', {
                emptyStateMessage: 'Legacy message',
            });

            expect(wrapper.find('[data-testid="table-body-empty-cell"]').text()).toBe(
                'Legacy message'
            );
        });

        it('should let labels.emptyState win over emptyStateMessage', async () => {
            const wrapper = await mountEmpty('empty-both', {
                emptyStateMessage: 'Legacy message',
                labels: { emptyState: 'New message' },
            });

            expect(wrapper.find('[data-testid="table-body-empty-cell"]').text()).toBe(
                'New message'
            );
        });

        it('should hide the text for an explicitly empty labels.emptyState', async () => {
            const wrapper = await mountEmpty('empty-blank-label', {
                emptyStateMessage: 'Legacy message',
                labels: { emptyState: '' },
            });

            expect(wrapper.find('[data-testid="table-body-empty-cell"]').text()).toBe('');
        });

        it('should fall back to the default for an empty emptyStateMessage', async () => {
            const wrapper = await mountEmpty('empty-blank-alias', { emptyStateMessage: '' });

            expect(wrapper.find('[data-testid="table-body-empty-cell"]').text()).toBe(
                'No data available to display.'
            );
        });

        it('should use the built-in default when neither is configured', async () => {
            const wrapper = await mountEmpty('empty-default', {});

            expect(wrapper.find('[data-testid="table-body-empty-cell"]').text()).toBe(
                'No data available to display.'
            );
        });
    });
});
