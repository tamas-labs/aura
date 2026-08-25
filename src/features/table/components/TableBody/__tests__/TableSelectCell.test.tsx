import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableSelectCell } from '../TableSelectCell';
import type { HeaderCell } from '../../../../../types/api-response.types';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';

describe('TableSelectCell', () => {
    const storeId = 'test-table-select-cell';
    let core: ReturnType<typeof useCoreStore>;
    let resource: ReturnType<typeof useApiResourcesStore>;

    const selectableCell: HeaderCell = {
        content: '',
        key: 'select',
        field: 'id',
        selectable: true,
    };

    beforeEach(() => {
        setActivePinia(createPinia());
        window.sessionStorage.clear();
        core = useCoreStore(storeId, { storeId });
        resource = useApiResourcesStore(storeId, core);
    });

    const mountCell = (item: Record<string, unknown>) =>
        mount(TableSelectCell, {
            props: { storeId, cell: selectableCell, item, cellIndex: 0 },
        });

    it('should render a checkbox td', () => {
        const wrapper = mountCell({ id: 1 });

        expect(wrapper.find('[data-testid="table-select-cell"]').exists()).toBe(true);
        expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
    });

    it('should reflect the store selection state', () => {
        resource.toggleRowSelection(1);
        const wrapper = mountCell({ id: 1 });

        expect((wrapper.find('input').element as HTMLInputElement).checked).toBe(true);
    });

    it('should toggle the row selection on change', async () => {
        const wrapper = mountCell({ id: 42 });

        await wrapper.find('input').setValue(true);

        expect(resource.isRowSelected(42)).toBe(true);

        await wrapper.find('input').setValue(false);
        expect(resource.isRowSelected(42)).toBe(false);
    });

    it('should resolve the row id from the cell field (not "id")', async () => {
        const uuidCell: HeaderCell = {
            content: '',
            key: 'select',
            field: 'uuid',
            selectable: true,
        };
        const wrapper = mount(TableSelectCell, {
            props: { storeId, cell: uuidCell, item: { uuid: 'u-9', id: 1 }, cellIndex: 0 },
        });

        await wrapper.find('input').setValue(true);

        expect(resource.isRowSelected('u-9')).toBe(true);
        expect(resource.isRowSelected(1)).toBe(false);
    });

    it('should disable the checkbox when the row id is unresolvable', () => {
        const wrapper = mountCell({ name: 'no-id' });

        expect(wrapper.find('input').attributes('disabled')).toBeDefined();
    });

    it('should use the English default aria-label on the checkbox', () => {
        const wrapper = mountCell({ id: 1 });

        expect(wrapper.find('input').attributes('aria-label')).toBe('Select row');
    });

    it('should use the labels.selectRow override from the global config', () => {
        const wrapper = mount(TableSelectCell, {
            props: {
                storeId: 'test-table-select-cell-labels',
                cell: selectableCell,
                item: { id: 1 },
                cellIndex: 0,
            },
            global: {
                config: {
                    globalProperties: {
                        $aura: { labels: { selectRow: 'Sor kijelölése' } },
                    } as never,
                },
            },
        });

        expect(wrapper.find('input').attributes('aria-label')).toBe('Sor kijelölése');
    });
});
