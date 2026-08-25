import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableBodyRow } from '../TableBodyRow';
import { useApiResourcesStore, useCoreStore } from '../../../../../state';
import type { HeaderCell } from '../../../../../types/api-response.types';
import type { AuraProps } from '../../../../../types';

describe('TableBodyRow', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });
    const mockColumns: HeaderCell[] = [
        { key: 'id', content: 'ID', field: 'id' },
        { key: 'name', content: 'Name', field: 'name' },
        { key: 'age', content: 'Age', field: 'age' },
    ];

    const mockItem = {
        id: 1,
        name: 'John Doe',
        age: 30,
        extra: 'ignored',
    };

    describe('rendering', () => {
        it('should render tr element', () => {
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: 'test-store',
                    item: mockItem,
                    columns: mockColumns,
                    rowIndex: 0,
                },
            });

            expect(wrapper.find('tr').exists()).toBe(true);
        });

        it('should render correct number of cells', () => {
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: 'test-store',
                    item: mockItem,
                    columns: mockColumns,
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            expect(cells.length).toBe(mockColumns.length);
        });

        it('should render a select cell for a selectable column', () => {
            const columns: HeaderCell[] = [
                { key: 'select', content: '', field: 'id', selectable: true },
                { key: 'name', content: 'Name', field: 'name' },
            ];

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: 'test-store-body-select',
                    item: mockItem,
                    columns,
                    rowIndex: 0,
                },
            });

            expect(wrapper.find('[data-testid="table-select-cell"]').exists()).toBe(true);
            expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
            // The selectable column does not become a TableBodyCell.
            expect(wrapper.findAllComponents({ name: 'TableBodyCell' }).length).toBe(1);
        });

        it('should pass correct values to cells', () => {
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: 'test-store',
                    item: mockItem,
                    columns: mockColumns,
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });

            expect(cells[0]?.props('value')).toBe(1);
            expect(cells[0]?.props('columnKey')).toBe('id');

            expect(cells[1]?.props('value')).toBe('John Doe');
            expect(cells[1]?.props('columnKey')).toBe('name');

            expect(cells[2]?.props('value')).toBe(30);
            expect(cells[2]?.props('columnKey')).toBe('age');
        });

        it('should render empty row if no columns provided', () => {
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: 'test-store',
                    item: mockItem,
                    columns: [],
                    rowIndex: 0,
                },
            });

            expect(wrapper.find('tr').exists()).toBe(true);
            expect(wrapper.findAll('td').length).toBe(0);
        });

        it('should have correct data attributes', () => {
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: 'test-store',
                    item: mockItem,
                    columns: mockColumns,
                    rowIndex: 5,
                },
            });

            const tr = wrapper.find('tr');
            expect(tr.attributes('data-testid')).toBe('table-body-row');
            expect(tr.attributes('data-row-index')).toBe('5');
        });
    });

    describe('object field support', () => {
        const nestedMockItem = {
            id: 1,
            hello: {
                first_level: ['', 'Hello'],
            },
            world: ['', '', { first_level: 'World' }],
        };

        const nestedColumns: HeaderCell[] = [
            {
                key: 'hello',
                field: 'hello.first_level.1',
                content: 'Hello',
                object: true,
            },
            {
                key: 'world',
                field: 'world.2.first_level',
                content: 'World',
                object: true,
            },
            {
                key: 'missing',
                field: 'non.existent.path',
                content: 'Missing',
                object: true,
            },
        ];

        it('should resolve nested object paths correctly', () => {
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: 'test-store',
                    item: nestedMockItem,
                    columns: nestedColumns,
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });

            // Check first cell: hello.first_level.1 -> "Hello"
            expect(cells[0]?.props('value')).toBe('Hello');
            expect(cells[0]?.props('columnKey')).toBe('hello');

            // Check second cell: world.2.first_level -> "World"
            expect(cells[1]?.props('value')).toBe('World');
            expect(cells[1]?.props('columnKey')).toBe('world');
        });

        it('should handle missing nested paths gracefully', () => {
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: 'test-store',
                    item: nestedMockItem,
                    columns: nestedColumns,
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });

            // Check third cell: non.existent.path -> undefined (resolveValue returns undefined for non-existent paths)
            // Note: The value might be `null` or `undefined` depending on implementation
            const thirdCellValue = cells[2]?.props('value');
            expect(thirdCellValue === null || thirdCellValue === undefined).toBe(true);
        });
    });

    describe('multi-field column support', () => {
        const storeId = 'row-multifield-store';

        it('should pass fieldSegments prop for fields[] column', async () => {
            const core = useCoreStore(storeId, {} as any);
            const resource = useApiResourcesStore(storeId, core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { key: 'fullId', content: 'Full ID', fields: ['idPrefix', 'id'] },
                            ],
                        },
                    ],
                },
                items: [{ id: 42 }],
                body: {
                    columnConfigs: {
                        idPrefix: { type: 'static', value: 'ID:' },
                    },
                },
            });

            const multiFieldColumn: HeaderCell = {
                key: 'fullId',
                content: 'Full ID',
                fields: ['idPrefix', 'id'],
            };

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId,
                    item: { id: 42 },
                    columns: [multiFieldColumn],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            expect(cells).toHaveLength(1);

            // Multi-field column: fieldSegments prop should be set, value should not be main content
            const fieldSegments = cells[0]?.props('fieldSegments');
            expect(Array.isArray(fieldSegments)).toBe(true);
            expect(fieldSegments).toHaveLength(2);
        });

        it('should build config segment for field in body.columnConfigs', async () => {
            const core = useCoreStore(storeId + '-cfg', {} as any);
            const resource = useApiResourcesStore(storeId + '-cfg', core);

            await resource.processResponse({
                header: {
                    rows: [
                        { cells: [{ key: 'refCol', content: 'Ref', fields: ['prefix', 'id'] }] },
                    ],
                },
                items: [{ id: 1 }],
                body: {
                    columnConfigs: {
                        prefix: { type: 'static', value: 'REF:' },
                    },
                },
            });

            const column: HeaderCell = {
                key: 'refCol',
                content: 'Ref',
                fields: ['prefix', 'id'],
            };

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-cfg',
                    item: { id: 7 },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const fieldSegments = cells[0]?.props('fieldSegments');

            // First segment: from columnConfigs (config type)
            expect(fieldSegments[0].type).toBe('config');
            expect(fieldSegments[0].value).toBe('REF:');
            expect(fieldSegments[0].config.type).toBe('static');
        });

        it('should build value segment for field not in body.columnConfigs', async () => {
            const core = useCoreStore(storeId + '-val', {} as any);
            const resource = useApiResourcesStore(storeId + '-val', core);

            await resource.processResponse({
                header: {
                    rows: [{ cells: [{ key: 'idCol', content: 'ID', fields: ['prefix', 'id'] }] }],
                },
                items: [{ id: 99 }],
                body: {
                    columnConfigs: {
                        prefix: { type: 'static', value: 'X:' },
                    },
                },
            });

            const column: HeaderCell = {
                key: 'idCol',
                content: 'ID',
                fields: ['prefix', 'id'],
            };

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-val',
                    item: { id: 99 },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const fieldSegments = cells[0]?.props('fieldSegments');

            // Second segment: from item data (value type)
            expect(fieldSegments[1].type).toBe('value');
            expect(fieldSegments[1].value).toBe(99);
            expect(fieldSegments[1].config).toBeUndefined();
        });

        it('should build all value segments when body.columnConfigs is empty', async () => {
            const core = useCoreStore(storeId + '-noconf', {} as any);
            const resource = useApiResourcesStore(storeId + '-noconf', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    key: 'fullName',
                                    content: 'Full Name',
                                    fields: ['first', 'last'],
                                },
                            ],
                        },
                    ],
                },
                items: [{ first: 'John', last: 'Doe' }],
            });

            const column: HeaderCell = {
                key: 'fullName',
                content: 'Full Name',
                fields: ['first', 'last'],
            };

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-noconf',
                    item: { first: 'John', last: 'Doe' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const fieldSegments = cells[0]?.props('fieldSegments');

            expect(fieldSegments).toHaveLength(2);
            expect(fieldSegments[0].type).toBe('value');
            expect(fieldSegments[0].value).toBe('John');
            expect(fieldSegments[1].type).toBe('value');
            expect(fieldSegments[1].value).toBe('Doe');
        });

        it('should still use value prop for single-field column (backward compat)', async () => {
            const core = useCoreStore(storeId + '-compat', {} as any);
            const resource = useApiResourcesStore(storeId + '-compat', core);

            await resource.processResponse({
                header: { rows: [{ cells: [{ key: 'name', content: 'Name', field: 'name' }] }] },
                items: [{ name: 'Alice' }],
                body: {
                    columnConfigs: {
                        prefix: { type: 'static', value: 'P:' },
                    },
                },
            });

            const singleColumn: HeaderCell = {
                key: 'name',
                content: 'Name',
                field: 'name',
            };

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-compat',
                    item: { name: 'Alice' },
                    columns: [singleColumn],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            expect(cells).toHaveLength(1);

            // Single-field: fieldSegments should be undefined, value should be set
            const fieldSegments = cells[0]?.props('fieldSegments');
            const value = cells[0]?.props('value');

            expect(fieldSegments).toBeUndefined();
            expect(value).toBe('Alice');
        });

        it('should use fieldSegments when field matches a columnConfig entry (field shorthand)', async () => {
            const core = useCoreStore(storeId + '-shorthand', {} as any);
            const resource = useApiResourcesStore(storeId + '-shorthand', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [{ key: 'show_action', content: 'Show', field: 'show' }],
                        },
                    ],
                },
                items: [{ id: 1 }],
                body: {
                    columnConfigs: {
                        show: { type: 'icon', icon: 'eye', variant: 'info' },
                    },
                },
            });

            const column: HeaderCell = {
                key: 'show_action',
                content: 'Show',
                field: 'show',
            };

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-shorthand',
                    item: { id: 1 },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            expect(cells).toHaveLength(1);

            // field: 'show' maps to columnConfigs['show'] → fieldSegments should be set
            const fieldSegments = cells[0]?.props('fieldSegments');
            expect(Array.isArray(fieldSegments)).toBe(true);
            expect(fieldSegments).toHaveLength(1);
            expect(fieldSegments[0].type).toBe('config');
            expect(fieldSegments[0].config.type).toBe('icon');
        });

        it('should fall back to value prop when field has no matching columnConfig (backward compat)', async () => {
            const core = useCoreStore(storeId + '-shorthand-bc', {} as any);
            const resource = useApiResourcesStore(storeId + '-shorthand-bc', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [{ key: 'status', content: 'Status', field: 'status' }],
                        },
                    ],
                },
                items: [{ status: 'active' }],
                body: {
                    columnConfigs: {
                        other: { type: 'static', value: 'X' },
                    },
                },
            });

            const column: HeaderCell = {
                key: 'status',
                content: 'Status',
                field: 'status',
            };

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-shorthand-bc',
                    item: { status: 'active' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            expect(cells).toHaveLength(1);

            // 'status' not in columnConfigs → falls back to value prop
            expect(cells[0]?.props('fieldSegments')).toBeUndefined();
            expect(cells[0]?.props('value')).toBe('active');
        });

        it('should handle mixed: field-shorthand and single-field columns in same row', async () => {
            const core = useCoreStore(storeId + '-shorthand-mixed', {} as any);
            const resource = useApiResourcesStore(storeId + '-shorthand-mixed', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { key: 'name', content: 'Name', field: 'name' },
                                { key: 'edit_action', content: 'Edit', field: 'edit' },
                            ],
                        },
                    ],
                },
                items: [{ name: 'Alice', id: 1 }],
                body: {
                    columnConfigs: {
                        edit: { type: 'icon', icon: 'pencil', variant: 'primary' },
                    },
                },
            });

            const columns: HeaderCell[] = [
                { key: 'name', content: 'Name', field: 'name' },
                { key: 'edit_action', content: 'Edit', field: 'edit' },
            ];

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-shorthand-mixed',
                    item: { name: 'Alice', id: 1 },
                    columns,
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            expect(cells).toHaveLength(2);

            // name: no matching columnConfig → value prop
            expect(cells[0]?.props('value')).toBe('Alice');
            expect(cells[0]?.props('fieldSegments')).toBeUndefined();

            // edit: matches columnConfigs['edit'] → fieldSegments prop
            const segments = cells[1]?.props('fieldSegments');
            expect(Array.isArray(segments)).toBe(true);
            expect(segments[0].config.type).toBe('icon');
        });

        it('should handle mixed single-field and multi-field columns in same row', async () => {
            const core = useCoreStore(storeId + '-mixed', {} as any);
            const resource = useApiResourcesStore(storeId + '-mixed', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { key: 'name', content: 'Name', field: 'name' },
                                { key: 'fullId', content: 'Full ID', fields: ['idPrefix', 'id'] },
                            ],
                        },
                    ],
                },
                items: [{ id: 5, name: 'Bob' }],
                body: {
                    columnConfigs: {
                        idPrefix: { type: 'static', value: '#' },
                    },
                },
            });

            const columns: HeaderCell[] = [
                { key: 'name', content: 'Name', field: 'name' },
                { key: 'fullId', content: 'Full ID', fields: ['idPrefix', 'id'] },
            ];

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-mixed',
                    item: { id: 5, name: 'Bob' },
                    columns,
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            expect(cells).toHaveLength(2);

            // First column: single field
            expect(cells[0]?.props('value')).toBe('Bob');
            expect(cells[0]?.props('fieldSegments')).toBeUndefined();

            // Second column: multi-field
            const segments = cells[1]?.props('fieldSegments');
            expect(Array.isArray(segments)).toBe(true);
            expect(segments).toHaveLength(2);
            expect(segments[0].type).toBe('config'); // idPrefix from columnConfigs
            expect(segments[1].type).toBe('value'); // id from item
        });
    });

    describe('mapping resolution (resolveMappingConfig, applied after resolveConditionalConfig)', () => {
        const storeId = 'row-mapping-store';

        // Wiring point 2 (single-field branch) only runs if `column.field` does NOT
        // match a `body.columnConfigs` key (otherwise the field-shorthand branch
        // — buildFieldSegments — takes over, see the 'multi-field' tests below). So
        // in these tests, `type`/`mapping`/`if`/`else` are defined directly on the
        // HeaderCell (column), without `body.columnConfigs`.
        it('should resolve a mapping match on a single-field icon column (wiring point 2)', () => {
            const column = {
                key: 'status',
                content: 'Status',
                type: 'icon',
                icon: 'question',
                mapping: { active: { icon: 'check', variant: 'success' } },
            } as unknown as HeaderCell;

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-single-icon',
                    item: { status: 'active' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const cellConfig = cells[0]?.props('cellConfig');

            expect(cellConfig.icon).toBe('check');
            expect(cellConfig.variant).toBe('success');
            expect(cellConfig).not.toHaveProperty('mapping');
        });

        it('should resolve a link mapping via the field selector, leaving the URL key intact (wiring point 2)', () => {
            const column = {
                key: 'row',
                content: 'Status',
                type: 'link',
                field: 'status',
                mapping: {
                    active: { variant: 'success', route: '/activate/{id}' },
                },
            } as unknown as HeaderCell;

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-single-link',
                    item: { status: 'active', id: 7 },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const cellConfig = cells[0]?.props('cellConfig');

            // Selector = field ('status'); presentation merged, mapping key dropped.
            expect(cellConfig.variant).toBe('success');
            expect(cellConfig.route).toBe('/activate/{id}');
            expect(cellConfig).not.toHaveProperty('mapping');
        });

        it('should NOT use the URL key as the mapping selector for a link (field-only)', () => {
            const column = {
                key: 'row',
                content: 'Status',
                type: 'link',
                // no `field` → for link/button the selector never falls back to `key`
                mapping: { active: { variant: 'success' } },
            } as unknown as HeaderCell;
            // item.row === 'active' WOULD match if `key` ('row') were used as the
            // selector (as it is for icon) — for link it must not.
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-single-link-nokey',
                    item: { row: 'active' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const cellConfig = cells[0]?.props('cellConfig');

            // `column.key` ('row') is the URL key, not a selector; item.row === 'active'
            // must NOT trigger a mapping match for link.
            expect(cellConfig).not.toHaveProperty('variant');
        });

        it('should resolve a button mapping via the field selector (presentation + disabled)', () => {
            const column = {
                key: 'row',
                content: 'State',
                type: 'button',
                field: 'state',
                mapping: {
                    locked: { variant: 'danger', disabled: true, icon: 'lock' },
                },
            } as unknown as HeaderCell;

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-single-button',
                    item: { state: 'locked', id: 3 },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const cellConfig = cells[0]?.props('cellConfig');

            expect(cellConfig.variant).toBe('danger');
            expect(cellConfig.disabled).toBe(true);
            expect(cellConfig.icon).toBe('lock');
            expect(cellConfig).not.toHaveProperty('mapping');
        });

        it('should apply mapping to a multi-field (fields[]) config segment (icon normalized to class by the preprocessor)', async () => {
            const core = useCoreStore(storeId + '-multi', {} as any);
            // `icon`/`variant` inside a mapping entry are resolved into `class` by
            // `normalizeIconConfigs` at preprocessing time (before `resolveMappingConfig`
            // runs at render time) — see the dedicated 'DOM-level icon-mapping rendering'
            // describe block below for the full-pipeline regression test.
            core.config.icons = { check: ['fas', 'fa-check'] };
            const resource = useApiResourcesStore(storeId + '-multi', core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [{ key: 'row', content: 'Row', fields: ['statusIcon', 'name'] }],
                        },
                    ],
                },
                items: [{ status: 'active', name: 'Alice' }],
                body: {
                    columnConfigs: {
                        statusIcon: {
                            type: 'icon',
                            key: 'status',
                            mapping: { active: { icon: 'check' } },
                        },
                    },
                },
            });

            const column: HeaderCell = {
                key: 'row',
                content: 'Row',
                fields: ['statusIcon', 'name'],
            };
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-multi',
                    item: { status: 'active', name: 'Alice' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const fieldSegments = cells[0]?.props('fieldSegments');

            // By the time resolveMappingConfig merges the matched entry into the
            // flattened config, the entry already carries a registry-resolved `class`
            // (not the raw `icon` string) — the preprocessor normalized it.
            expect(fieldSegments[0].config.class).toEqual(['fas', 'fa-check']);
            expect(fieldSegments[0].config).not.toHaveProperty('icon');
            expect(fieldSegments[0].config).not.toHaveProperty('mapping');
        });

        it('should apply if/else flattening BEFORE mapping resolution (branch mapping wins) (wiring point 2)', () => {
            const column = {
                key: 'role',
                content: 'Status',
                type: 'icon',
                if: [
                    {
                        eq: 'admin',
                        key: 'status',
                        mapping: { active: { icon: 'shield-check' } },
                    },
                ],
                else: { icon: 'times' },
            } as unknown as HeaderCell;

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-precedence',
                    item: { status: 'active', role: 'admin' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const cellConfig = cells[0]?.props('cellConfig');

            expect(cellConfig.icon).toBe('shield-check');
            expect(cellConfig).not.toHaveProperty('mapping');
        });

        it('should inherit the root-level mapping into a branch that does not override it (wiring point 2)', () => {
            const column = {
                key: 'status',
                content: 'Status',
                type: 'icon',
                mapping: { active: { icon: 'check' } },
                if: [{ eq: 'active', key: 'flag', class: ['ms-1'] }],
            } as unknown as HeaderCell;

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-inherit',
                    item: { status: 'active', flag: true },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const cellConfig = cells[0]?.props('cellConfig');

            // The if-branch (matched on root `key: 'status'`) sets its own `key: 'flag'` and
            // `class`, but does NOT redefine `mapping` — so the root `mapping` is inherited
            // into the flattened config. Post-flatten, the mapping selector is `field ?? key`
            // = 'flag', and item.flag (true → "true") is not a key in the (inherited) mapping,
            // so resolveMappingConfig no-ops: the mapping key is dropped, the branch's own
            // `class` is left untouched.
            expect(cellConfig.class).toEqual(['ms-1']);
            expect(cellConfig).not.toHaveProperty('mapping');
        });

        it('should resolve a mapping-driven `value` on an else-branch (reference type) (wiring point 2)', () => {
            const column = {
                key: 'status',
                content: 'Status',
                type: 'reference',
                if: [{ eq: 'active', value: 'Aktív' }],
                else: {
                    key: 'status',
                    mapping: { unknown: { label: 'Ismeretlen' } },
                },
            } as unknown as HeaderCell;

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-else-ref',
                    item: { status: 'unknown' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const cellConfig = cells[0]?.props('cellConfig');

            expect(cellConfig.value).toBe('Ismeretlen');
            expect(cellConfig).not.toHaveProperty('label');
        });

        it('should leave badge mapping untouched (renderer-local, excluded from resolveMappingConfig) (wiring point 2)', () => {
            const column = {
                key: 'priority',
                content: 'Priority',
                type: 'badge',
                mapping: { high: { variant: 'danger', label: 'Magas' } },
            } as unknown as HeaderCell;

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-badge',
                    item: { priority: 'high' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const cellConfig = cells[0]?.props('cellConfig');

            // Badge is a TYPES_WITH_LOCAL_MAPPING type — the generic resolver leaves the
            // `mapping` dict on the config untouched (badge resolves it locally at render time).
            expect(cellConfig).toHaveProperty('mapping');
            expect(cellConfig.mapping.high.variant).toBe('danger');
            expect(cellConfig).not.toHaveProperty('variant');
        });
    });

    // -------------------------------------------------------------------------
    // DOM-level end-to-end integration (reviewer-found regression):
    // full pipeline `body.columnConfigs` (raw icon/variant registry keys inside
    // `mapping`) → preprocessResponse (normalizeIconConfigs mapping normalization)
    // → resolveMappingConfig (render-time merge) → renderIconNode → actual <i class>.
    // This is the level that originally missed the bug: unit tests on the flattened
    // config props (`cellConfig.icon`/`cellConfig.variant`) passed even though the
    // preprocessor never touched `mapping` entries and the DOM rendered an empty
    // `<i class="mx-2">` (no glyph/color classes) at runtime.
    // -------------------------------------------------------------------------
    describe('DOM-level icon-mapping rendering (full pipeline, reviewer repro)', () => {
        const domStoreId = 'row-mapping-dom-store';
        const testIcons = { check: ['fas', 'fa-check'], destroy: ['fas', 'fa-trash'] };
        const testVariants = { success: 'success', danger: 'danger' };

        it('should render registry-resolved icon+variant classes on a mapping match (field-shorthand path)', async () => {
            const id = domStoreId + '-match';
            const core = useCoreStore(id, {} as any);
            core.config.icons = testIcons;
            core.config.variants = testVariants;
            const resource = useApiResourcesStore(id, core);

            await resource.processResponse({
                header: {
                    rows: [{ cells: [{ key: 'status', content: 'Status', field: 'status' }] }],
                },
                items: [{ status: 'active' }],
                body: {
                    columnConfigs: {
                        status: {
                            type: 'icon',
                            key: 'status',
                            mapping: { active: { icon: 'check', variant: 'success' } },
                        },
                    },
                },
            });

            const column: HeaderCell = { key: 'status', content: 'Status', field: 'status' };
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: id,
                    item: { status: 'active' },
                    columns: [column],
                    rowIndex: 0,
                },
                attachTo: document.body,
            });

            await flushPromises();

            const icon = wrapper.find('i');
            expect(icon.exists()).toBe(true);
            expect(icon.classes()).toContain('fas');
            expect(icon.classes()).toContain('fa-check');
            expect(icon.classes()).toContain('text-success');

            wrapper.unmount();
        });

        it('should render a different mapping entry glyph/color for a different item value', async () => {
            const id = domStoreId + '-second-entry';
            const core = useCoreStore(id, {} as any);
            core.config.icons = testIcons;
            core.config.variants = testVariants;
            const resource = useApiResourcesStore(id, core);

            await resource.processResponse({
                header: {
                    rows: [{ cells: [{ key: 'status', content: 'Status', field: 'status' }] }],
                },
                items: [{ status: 'deleted' }],
                body: {
                    columnConfigs: {
                        status: {
                            type: 'icon',
                            key: 'status',
                            mapping: {
                                active: { icon: 'check', variant: 'success' },
                                deleted: { icon: 'destroy', variant: 'danger' },
                            },
                        },
                    },
                },
            });

            const column: HeaderCell = { key: 'status', content: 'Status', field: 'status' };
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: id,
                    item: { status: 'deleted' },
                    columns: [column],
                    rowIndex: 0,
                },
                attachTo: document.body,
            });

            await flushPromises();

            const icon = wrapper.find('i');
            expect(icon.classes()).toContain('fas');
            expect(icon.classes()).toContain('fa-trash');
            expect(icon.classes()).toContain('text-danger');
            expect(icon.classes()).not.toContain('fa-check');

            wrapper.unmount();
        });

        it('control: root-level icon/variant (no mapping) renders the same way', async () => {
            const id = domStoreId + '-control-root';
            const core = useCoreStore(id, {} as any);
            core.config.icons = testIcons;
            core.config.variants = testVariants;
            const resource = useApiResourcesStore(id, core);

            await resource.processResponse({
                header: {
                    rows: [{ cells: [{ key: 'status', content: 'Status', field: 'status' }] }],
                },
                items: [{ status: 'active' }],
                body: {
                    columnConfigs: {
                        status: { type: 'icon', icon: 'check', variant: 'success' },
                    },
                },
            });

            const column: HeaderCell = { key: 'status', content: 'Status', field: 'status' };
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: id,
                    item: { status: 'active' },
                    columns: [column],
                    rowIndex: 0,
                },
                attachTo: document.body,
            });

            await flushPromises();

            const icon = wrapper.find('i');
            expect(icon.exists()).toBe(true);
            expect(icon.classes()).toContain('fas');
            expect(icon.classes()).toContain('fa-check');
            expect(icon.classes()).toContain('text-success');

            wrapper.unmount();
        });

        it('should render an empty (glyph-less) icon on a mapping no-match, not throw', async () => {
            const id = domStoreId + '-no-match';
            const core = useCoreStore(id, {} as any);
            core.config.icons = testIcons;
            core.config.variants = testVariants;
            const resource = useApiResourcesStore(id, core);

            await resource.processResponse({
                header: {
                    rows: [{ cells: [{ key: 'status', content: 'Status', field: 'status' }] }],
                },
                items: [{ status: 'unknown' }],
                body: {
                    columnConfigs: {
                        status: {
                            type: 'icon',
                            key: 'status',
                            mapping: { active: { icon: 'check', variant: 'success' } },
                        },
                    },
                },
            });

            const column: HeaderCell = { key: 'status', content: 'Status', field: 'status' };
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: id,
                    item: { status: 'unknown' },
                    columns: [column],
                    rowIndex: 0,
                },
                attachTo: document.body,
            });

            await flushPromises();

            const icon = wrapper.find('i');
            expect(icon.exists()).toBe(true);
            expect(icon.classes()).not.toContain('fa-check');
            expect(icon.classes()).not.toContain('text-success');

            wrapper.unmount();
        });
    });

    // -------------------------------------------------------------------------
    // DOM-level `custom` type rendering (full pipeline). Exercises the field-
    // shorthand path → body.columnConfigs (custom) → renderCustomNode via the
    // TableBodyCell SEGMENT_RENDERERS dispatch, including the host renderer
    // registry plumbed through SegmentFormatOptions (config.renderers).
    // -------------------------------------------------------------------------
    describe('DOM-level custom type rendering (full pipeline)', () => {
        const customStoreId = 'row-custom-dom-store';

        it('renders template-mode substituted text', async () => {
            const id = customStoreId + '-template';
            const core = useCoreStore(id, {} as any);
            const resource = useApiResourcesStore(id, core);

            await resource.processResponse({
                header: {
                    rows: [{ cells: [{ key: 'status', content: 'Status', field: 'status' }] }],
                },
                items: [{ status: 'active' }],
                body: {
                    columnConfigs: {
                        status: {
                            type: 'custom',
                            key: 'status',
                            field: 'status',
                            template: "<span class='{class}'>{icon} {value}</span>",
                            mapping: { active: { class: 'text-success', icon: '✓' } },
                        },
                    },
                },
            });

            const column: HeaderCell = { key: 'status', content: 'Status', field: 'status' };
            const wrapper = mount(TableBodyRow, {
                props: { storeId: id, item: { status: 'active' }, columns: [column], rowIndex: 0 },
                attachTo: document.body,
            });

            await flushPromises();
            expect(wrapper.text()).toContain('✓ active');

            wrapper.unmount();
        });

        it('invokes a host renderer from config.renderers', async () => {
            const id = customStoreId + '-renderer';
            const core = useCoreStore(id, {} as any);
            core.config.renderers = {
                userCard: (value: unknown) => `Card:${String(value)}`,
            };
            const resource = useApiResourcesStore(id, core);

            await resource.processResponse({
                header: { rows: [{ cells: [{ key: 'name', content: 'Name', field: 'name' }] }] },
                items: [{ name: 'Anna' }],
                body: {
                    columnConfigs: {
                        name: { type: 'custom', key: 'name', field: 'name', renderer: 'userCard' },
                    },
                },
            });

            const column: HeaderCell = { key: 'name', content: 'Name', field: 'name' };
            const wrapper = mount(TableBodyRow, {
                props: { storeId: id, item: { name: 'Anna' }, columns: [column], rowIndex: 0 },
                attachTo: document.body,
            });

            await flushPromises();
            expect(wrapper.text()).toContain('Card:Anna');

            wrapper.unmount();
        });
    });

    describe('conditional config segment fallback (failing if, no else)', () => {
        const storeId = 'row-empty-config-segment';

        it('builds an empty config segment when a field config condition fails with no else', async () => {
            const core = useCoreStore(storeId, {} as any);
            const resource = useApiResourcesStore(storeId, core);

            await resource.processResponse({
                header: {
                    rows: [
                        { cells: [{ key: 'row', content: 'Row', fields: ['statusIcon', 'name'] }] },
                    ],
                },
                items: [{ status: 'inactive', name: 'Alice' }],
                body: {
                    columnConfigs: {
                        // `if` matches only 'active'; there is no `else`.
                        statusIcon: {
                            type: 'icon',
                            key: 'status',
                            if: [{ eq: 'active', icon: 'check' }],
                        },
                    },
                },
            });

            const column: HeaderCell = {
                key: 'row',
                content: 'Row',
                fields: ['statusIcon', 'name'],
            };

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId,
                    item: { status: 'inactive', name: 'Alice' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const fieldSegments = cells[0]?.props('fieldSegments');

            // statusIcon: condition failed, no else → empty config segment
            expect(fieldSegments[0].type).toBe('config');
            expect(fieldSegments[0].value).toBe('');
            expect(fieldSegments[0].config).toBeUndefined();
            // name: plain value segment, unaffected
            expect(fieldSegments[1].type).toBe('value');
            expect(fieldSegments[1].value).toBe('Alice');
        });
    });

    describe('rowRules (conditional <tr> formatting)', () => {
        const storeId = 'row-rowrules-store';

        it('applies only a class (no inline style) for a bootstrap-color rowRules match', async () => {
            const core = useCoreStore(storeId + '-class', {} as any);
            const resource = useApiResourcesStore(storeId + '-class', core);

            await resource.processResponse({
                header: { rows: [{ cells: [{ key: 'name', content: 'Name', field: 'name' }] }] },
                items: [{ status: 'active', name: 'Alice' }],
                body: {
                    // bootstrap color → bg-success class only, no inline style
                    rowRules: { key: 'status', if: [{ eq: 'active', background: 'success' }] },
                },
            });

            const column: HeaderCell = { key: 'name', content: 'Name', field: 'name' };
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-class',
                    item: { status: 'active', name: 'Alice' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const tr = wrapper.find('tr');
            expect(tr.classes()).toContain('bg-success');
            expect(tr.attributes('style')).toBeUndefined();
        });

        it('applies only an inline style (no class) for a raw-value rowRules match', async () => {
            const core = useCoreStore(storeId + '-style', {} as any);
            const resource = useApiResourcesStore(storeId + '-style', core);

            await resource.processResponse({
                header: { rows: [{ cells: [{ key: 'name', content: 'Name', field: 'name' }] }] },
                items: [{ status: 'active', name: 'Alice' }],
                body: {
                    // raw hex color → inline style only, no utility class
                    rowRules: { key: 'status', if: [{ eq: 'active', color: '#123456' }] },
                },
            });

            const column: HeaderCell = { key: 'name', content: 'Name', field: 'name' };
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-style',
                    item: { status: 'active', name: 'Alice' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const tr = wrapper.find('tr');
            expect(tr.attributes('style')).toContain('color');
            expect(tr.classes().some(c => c.startsWith('bg-'))).toBe(false);
        });

        it('leaves the <tr> unstyled when rowRules is present but no condition matches', async () => {
            const core = useCoreStore(storeId + '-nomatch', {} as any);
            const resource = useApiResourcesStore(storeId + '-nomatch', core);

            await resource.processResponse({
                header: { rows: [{ cells: [{ key: 'name', content: 'Name', field: 'name' }] }] },
                items: [{ status: 'inactive', name: 'Bob' }],
                body: {
                    rowRules: {
                        key: 'status',
                        if: [{ eq: 'active', background: 'success' }],
                    },
                },
            });

            const column: HeaderCell = { key: 'name', content: 'Name', field: 'name' };
            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: storeId + '-nomatch',
                    item: { status: 'inactive', name: 'Bob' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const tr = wrapper.find('tr');
            expect(tr.classes()).not.toContain('bg-success');
            expect(tr.attributes('style')).toBeUndefined();
        });
    });

    describe('single-field column with a failing conditional (no else)', () => {
        it('falls back to the raw column config when resolveConditionalConfig returns null', () => {
            // Single-field column (no `fields`, `field` not in columnConfigs) whose
            // `if` matches nothing and has no `else` → resolveConditionalConfig → null
            // → mappedColumnConfig is null → cellConfig falls back to the column itself.
            const column = {
                key: 'status',
                content: 'Status',
                type: 'icon',
                icon: 'question',
                key_selector: 'status',
                if: [{ eq: 'active', key: 'status', icon: 'check' }],
            } as unknown as HeaderCell;

            const wrapper = mount(TableBodyRow, {
                props: {
                    storeId: 'row-single-null-conditional',
                    item: { status: 'inactive' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const cells = wrapper.findAllComponents({ name: 'TableBodyCell' });
            const cellConfig = cells[0]?.props('cellConfig');

            // Fallback: the original column config is used (icon 'question' retained).
            expect(cellConfig.icon).toBe('question');
        });
    });

    describe('over-nested conditional config', () => {
        /** Builds an if-chain `levels` deep, all branches matching `name === 'val'`. */
        const deepConditional = (levels: number): Record<string, unknown> => {
            let node: Record<string, unknown> = { eq: 'val', value: 'deep' };

            for (let i = 0; i < levels; i++) {
                node = { eq: 'val', key: 'name', if: [node] };
            }

            return { key: 'name', if: [node] };
        };

        /**
         * The depth cap truncates the config silently; the only trace used to be a
         * `console.warn`, which the production build strips. It must reach the
         * error store instead — this asserts the callback is actually wired at the
         * render call sites, not just supported by the util.
         */
        it('should record the truncation in the error store', () => {
            const storeId = 'row-max-depth';
            const column = {
                key: 'name',
                content: 'Name',
                field: 'name',
                ...deepConditional(6),
            } as unknown as HeaderCell;

            mount(TableBodyRow, {
                props: {
                    storeId,
                    item: { id: 1, name: 'val' },
                    columns: [column],
                    rowIndex: 0,
                },
            });

            const core = useCoreStore(storeId, {} as AuraProps);
            const recorded = core.errorStore.getErrorsByKey('conditionalConfig.maxDepth');

            expect(recorded).toHaveLength(1);
            expect(recorded[0]?.severity).toBe('warning');
        });
    });
    describe('prototype-chain column keys', () => {
        // Regression guard: `body.columnConfigs` is a response object and the field name is a
        // response header value, so a plain bracket read answered `constructor` with the
        // `Object` function — the field then took the config branch and rendered empty
        // instead of falling through to the item data.
        const storeId = 'row-proto-key-store';

        it('should treat an inherited field name as having no columnConfig', async () => {
            const core = useCoreStore(storeId, {} as AuraProps);
            const resource = useApiResourcesStore(storeId, core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    key: 'constructor',
                                    content: 'Ctor',
                                    fields: ['constructor', 'id'],
                                },
                            ],
                        },
                    ],
                },
                items: [{ id: 5 }],
                body: {
                    columnConfigs: {
                        id: { type: 'static', value: 'ID:' },
                    },
                },
            });

            const column: HeaderCell = {
                key: 'constructor',
                content: 'Ctor',
                fields: ['constructor', 'id'],
            };

            const wrapper = mount(TableBodyRow, {
                props: { storeId, item: { id: 5 }, columns: [column], rowIndex: 0 },
            });
            await flushPromises();

            const cell = wrapper.findAllComponents({ name: 'TableBodyCell' })[0];
            const fieldSegments = cell?.props('fieldSegments') as { type: string }[];

            expect(fieldSegments[0]?.type).toBe('value');
            expect(cell?.props('cellRules')).toBeUndefined();
        });
    });
});
