import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableBodyRow } from '../TableBodyRow';
import { useApiResourcesStore, useCoreStore } from '../../../../../state';
import type { AuraProps } from '../../../../../types';
import type { HeaderCell } from '../../../../../types/api-response.types';

/**
 * `cellClickSearch` wiring on the row: the listener lives on the `<tr>`, finds the
 * clicked column from the cell's `data-key`, and writes through the store — the search
 * inputs pick the value up from there. The resolution rules themselves are covered in
 * `utils/__tests__/cell-click-search.test.ts`.
 */
describe('TableBodyRow — cellClickSearch', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    const columns: HeaderCell[] = [
        { key: 'name', content: 'Name', field: 'name', searchable: true },
        { key: 'city', content: 'City', field: 'city' },
    ];

    const item = { id: 1, name: 'John', city: 'Szeged' };

    const mountRow = (storeId: string, config: AuraProps) => {
        const core = useCoreStore(storeId, config);
        const resource = useApiResourcesStore(storeId, core);
        const wrapper = mount(TableBodyRow, {
            props: { storeId, item, columns, rowIndex: 0 },
        });
        return { wrapper, resource };
    };

    it('should put the value into the column search on Shift+click', async () => {
        const { wrapper, resource } = mountRow('ccs-column', { cellClickSearch: true });

        await wrapper.find('td[data-key="name"]').trigger('click', { shiftKey: true });

        expect(resource.getSearchTerm('name')).toBe('John');
        expect(resource.globalSearchTerm).toBeNull();
    });

    it('should replace an existing term instead of adding a second search', async () => {
        const { wrapper, resource } = mountRow('ccs-replace', { cellClickSearch: true });
        resource.addSearch('name', 'Jane');

        await wrapper.find('td[data-key="name"]').trigger('click', { shiftKey: true });

        expect(resource.getSearchTerm('name')).toBe('John');
        expect(resource.searchItems).toHaveLength(1);
    });

    it('should use the global search for a column without its own search input', async () => {
        const { wrapper, resource } = mountRow('ccs-global', {
            cellClickSearch: true,
            showHeaderSearch: true,
        });

        await wrapper.find('td[data-key="city"]').trigger('click', { shiftKey: true });

        expect(resource.globalSearchTerm).toBe('Szeged');
        expect(resource.searchItems).toHaveLength(0);
    });

    it('should ignore the click when the column has no search input to fill', async () => {
        const { wrapper, resource } = mountRow('ccs-none', { cellClickSearch: true });

        await wrapper.find('td[data-key="city"]').trigger('click', { shiftKey: true });

        expect(resource.globalSearchTerm).toBeNull();
        expect(resource.searchItems).toHaveLength(0);
    });

    it('should do nothing while the option is off', async () => {
        const { wrapper, resource } = mountRow('ccs-off', { showHeaderSearch: true });

        await wrapper.find('td[data-key="name"]').trigger('click', { shiftKey: true });
        await wrapper.find('td[data-key="city"]').trigger('click', { shiftKey: true });

        expect(resource.searchItems).toHaveLength(0);
        expect(resource.globalSearchTerm).toBeNull();
    });

    it('should ignore a click without Shift', async () => {
        const { wrapper, resource } = mountRow('ccs-plain', { cellClickSearch: true });

        await wrapper.find('td[data-key="name"]').trigger('click');

        expect(resource.searchItems).toHaveLength(0);
    });

    it('should stop Shift+mousedown from extending the text selection only on a search cell', () => {
        const { wrapper } = mountRow('ccs-mousedown', { cellClickSearch: true });

        const pressShift = (key: string): boolean => {
            const event = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                shiftKey: true,
            });
            wrapper.find(`td[data-key="${key}"]`).element.dispatchEvent(event);
            return event.defaultPrevented;
        };

        expect(pressShift('name')).toBe(true);
        // `city` resolves to nothing (no column search, no global search), so the
        // browser's own Shift+mousedown behaviour stays intact.
        expect(pressShift('city')).toBe(false);
    });
});
