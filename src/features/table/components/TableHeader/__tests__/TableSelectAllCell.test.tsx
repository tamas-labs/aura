import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableSelectAllCell } from '../TableSelectAllCell';
import type { HeaderCell } from '../../../../../types/api-response.types';
import type { AuraProps } from '../../../../../types';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';

describe('TableSelectAllCell', () => {
    const storeId = 'test-table-select-all-cell';
    let core: ReturnType<typeof useCoreStore>;
    let resource: ReturnType<typeof useApiResourcesStore>;

    const selectableCell: HeaderCell = {
        content: '',
        key: 'select',
        field: 'id',
        selectable: true,
    };

    const header = {
        rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }],
    };
    const items = [
        { id: 1, name: 'A' },
        { id: 2, name: 'B' },
        { id: 3, name: 'C' },
    ];

    beforeEach(async () => {
        setActivePinia(createPinia());
        window.sessionStorage.clear();

        const props: AuraProps = {
            storeId,
            siteName: 'Test',
            externalPaginator: false,
            disableSession: true,
        };
        core = useCoreStore(storeId, props);
        resource = useApiResourcesStore(storeId, core);
        await resource.processResponse({ header, items } as never);
    });

    const mountCell = () =>
        mount(TableSelectAllCell, {
            props: { storeId, cell: selectableCell, cellIndex: 0 },
        });

    it('should render a select-all checkbox th', () => {
        const wrapper = mountCell();

        expect(wrapper.find('[data-testid="table-select-all-cell"]').exists()).toBe(true);
        expect(wrapper.find('[data-testid="select-all"]').exists()).toBe(true);
    });

    it('should select all displayed rows on change', async () => {
        const wrapper = mountCell();

        await wrapper.find('input').setValue(true);

        expect(resource.selectedRows).toEqual([1, 2, 3]);
    });

    it('should be checked when all displayed rows are selected', () => {
        resource.selectRows([1, 2, 3]);
        const wrapper = mountCell();

        expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true);
    });

    it('should be indeterminate when only some rows are selected', () => {
        resource.selectRows([1]);
        const wrapper = mountCell();

        expect((wrapper.find('input').element as HTMLInputElement).indeterminate).toBe(true);
    });

    it('should deselect all displayed rows when already all selected', async () => {
        resource.selectRows([1, 2, 3]);
        const wrapper = mountCell();

        await wrapper.find('input').setValue(false);

        expect(resource.selectedRows).toEqual([]);
    });

    it('should honour colspan/rowspan from the cell', () => {
        const spanningCell: HeaderCell = { ...selectableCell, colspan: 2, rowspan: 3 };
        const wrapper = mount(TableSelectAllCell, {
            props: { storeId, cell: spanningCell, cellIndex: 0 },
        });

        const th = wrapper.find('th');
        expect(th.attributes('colspan')).toBe('2');
        expect(th.attributes('rowspan')).toBe('3');
    });

    it('should use the English default aria-label on the checkbox', () => {
        const wrapper = mountCell();

        expect(wrapper.find('input').attributes('aria-label')).toBe('Select all rows');
    });

    it('should use the labels.selectAllRows override from the global config', () => {
        const wrapper = mount(TableSelectAllCell, {
            props: {
                storeId: 'test-table-select-all-cell-labels',
                cell: selectableCell,
                cellIndex: 0,
            },
            global: {
                config: {
                    globalProperties: {
                        $aura: { labels: { selectAllRows: 'Összes sor kijelölése' } },
                    } as never,
                },
            },
        });

        expect(wrapper.find('input').attributes('aria-label')).toBe('Összes sor kijelölése');
    });

    it('should mark the select-all cell as a column header', () => {
        const wrapper = mount(TableSelectAllCell, {
            props: { storeId, cell: selectableCell, cellIndex: 0 },
        });

        expect(wrapper.find('th').attributes('scope')).toBe('col');
    });
});
