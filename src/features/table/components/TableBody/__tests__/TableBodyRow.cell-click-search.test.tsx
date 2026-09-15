import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableBodyRow } from '../TableBodyRow';
import { useApiResourcesStore, useCoreStore } from '../../../../../state';
import type { AuraProps } from '../../../../../types';
import type { HeaderCell } from '../../../../../types/api-response.types';

/**
 * `cellClickSearch` wiring on the row: the listener lives on the `<tr>`, finds the
 * clicked column from the cell's `data-key`, and asks the matching search input — via
 * the core store — to take the value. It never searches by itself. The resolution rules
 * are covered in `utils/__tests__/cell-click-search.test.ts`, the inputs' side in the
 * `*.prefill.test.tsx` suites.
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
        const shiftClick = (key: string) =>
            wrapper.find(`td[data-key="${key}"]`).trigger('click', { shiftKey: true });
        return { wrapper, core, resource, shiftClick };
    };

    it('should hand the value to the column search input without searching', async () => {
        const { core, resource, shiftClick } = mountRow('ccs-column', { cellClickSearch: true });

        await shiftClick('name');

        expect(core.searchPrefill).toMatchObject({ kind: 'column', field: 'name', term: 'John' });
        // No committed search means no filter badge.
        expect(resource.searchItems).toHaveLength(0);
        expect(resource.globalSearchTerm).toBeNull();
    });

    it('should hand the value to the global search input for a column without its own', async () => {
        const { core, resource, shiftClick } = mountRow('ccs-global', {
            cellClickSearch: true,
            showHeaderSearch: true,
        });

        await shiftClick('city');

        expect(core.searchPrefill).toMatchObject({ kind: 'global', term: 'Szeged' });
        expect(resource.globalSearchTerm).toBeNull();
    });

    it('should make a new request on every click, even for the same value', async () => {
        const { core, shiftClick } = mountRow('ccs-repeat', { cellClickSearch: true });

        await shiftClick('name');
        const firstId = core.searchPrefill?.id;
        await shiftClick('name');

        expect(core.searchPrefill?.id).toBeGreaterThan(firstId ?? Infinity);
    });

    it('should ignore the click when the column has no search input to fill', async () => {
        const { core, shiftClick } = mountRow('ccs-none', { cellClickSearch: true });

        await shiftClick('city');

        expect(core.searchPrefill).toBeNull();
    });

    it('should do nothing while the option is off', async () => {
        const { core, shiftClick } = mountRow('ccs-off', { showHeaderSearch: true });

        await shiftClick('name');
        await shiftClick('city');

        expect(core.searchPrefill).toBeNull();
    });

    it('should ignore a click without Shift', async () => {
        const { wrapper, core } = mountRow('ccs-plain', { cellClickSearch: true });

        await wrapper.find('td[data-key="name"]').trigger('click');

        expect(core.searchPrefill).toBeNull();
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
