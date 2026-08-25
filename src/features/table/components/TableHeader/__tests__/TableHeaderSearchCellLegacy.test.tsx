import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableHeaderSearchCell } from '../TableHeaderSearchCell';
import type { HeaderCell } from '../../../../../types/api-response.types';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';

describe('TableHeaderSearchCell - Legacy Support', () => {
    const storeId = 'test-table-header-search-cell-legacy';
    let core: ReturnType<typeof useCoreStore>;
    let resource: ReturnType<typeof useApiResourcesStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        core = useCoreStore(storeId, { storeId });
        resource = useApiResourcesStore(storeId, core);
    });

    describe('legacy "type" property', () => {
        it('should treat cell with type="number" as exact match', async () => {
            const cell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                searchable: true,
                type: 'number', // Legacy property not in HeaderCell interface
            } as any as HeaderCell;

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    cell,
                    storeId,
                },
            });

            // Simulate typing '123'
            const input = wrapper.find('input');
            await input.setValue('123');

            // Simulate Enter key
            await input.trigger('keydown', { key: 'Enter' });

            // Verify store
            const searchTerm = resource.searchItems.find(i => i.field === 'id');
            expect(searchTerm).toBeDefined();
            expect(searchTerm?.term).toBe('123');
            expect(searchTerm?.exact).toBe(true);
        });
    });
});
