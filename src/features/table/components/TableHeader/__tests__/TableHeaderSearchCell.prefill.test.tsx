import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { nextTick } from 'vue';
import { TableHeaderSearchCell } from '../TableHeaderSearchCell';
import type { HeaderCell } from '../../../../../types/api-response.types';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';

/**
 * The column search input's side of `cellClickSearch`: a Shift+clicked cell's value
 * lands in the input as editable text with the focus, and is searched only once the
 * user confirms it.
 */
describe('TableHeaderSearchCell — cell click prefill', () => {
    const storeId = 'header-search-prefill';
    let core: ReturnType<typeof useCoreStore>;
    let resource: ReturnType<typeof useApiResourcesStore>;
    let unmount: (() => void) | undefined;

    const ageCell: HeaderCell = {
        key: 'age',
        content: 'Age',
        field: 'age',
        searchable: true,
        number: true,
    };

    beforeEach(() => {
        setActivePinia(createPinia());
        core = useCoreStore(storeId, { storeId });
        resource = useApiResourcesStore(storeId, core);
    });

    afterEach(() => {
        unmount?.();
        unmount = undefined;
    });

    const mountCell = () => {
        const wrapper = mount(TableHeaderSearchCell, {
            props: { storeId, cell: ageCell },
            attachTo: document.body,
        });
        unmount = () => wrapper.unmount();
        return wrapper.find('input');
    };

    it('should take the value as editable text and focus the input, without searching', async () => {
        const input = mountCell();

        core.requestSearchPrefill({ kind: 'column', field: 'age', term: '42' });
        await flushPromises();

        const element = input.element as HTMLInputElement;
        expect(element.value).toBe('42');
        expect(document.activeElement).toBe(element);
        expect(element.selectionStart).toBe(2);
        expect(resource.getSearchTerm('age')).toBeNull();
    });

    it('should search the edited text on Enter, exactly for a number column', async () => {
        const input = mountCell();

        core.requestSearchPrefill({ kind: 'column', field: 'age', term: '15' });
        await flushPromises();
        await input.setValue('5');
        await input.trigger('keydown', { key: 'Enter' });

        expect(resource.searchItems).toEqual([{ field: 'age', term: '5', exact: true }]);
    });

    it('should fill the input again when the same value is clicked after an edit', async () => {
        const input = mountCell();

        core.requestSearchPrefill({ kind: 'column', field: 'age', term: '42' });
        await flushPromises();
        await input.setValue('4');
        core.requestSearchPrefill({ kind: 'column', field: 'age', term: '42' });
        await flushPromises();

        expect((input.element as HTMLInputElement).value).toBe('42');
    });

    it('should ignore requests addressed to another input', async () => {
        const input = mountCell();

        core.requestSearchPrefill({ kind: 'column', field: 'name', term: 'John' });
        core.requestSearchPrefill({ kind: 'global', term: 'Szeged' });
        await flushPromises();

        expect((input.element as HTMLInputElement).value).toBe('');
    });

    it('should drop a typed search still waiting for its debounce', async () => {
        vi.useFakeTimers();
        try {
            const input = mountCell();

            await input.setValue('7');
            core.requestSearchPrefill({ kind: 'column', field: 'age', term: '42' });
            await nextTick();
            vi.advanceTimersByTime(1000);

            expect(resource.getSearchTerm('age')).toBeNull();
            expect((input.element as HTMLInputElement).value).toBe('42');
        } finally {
            vi.useRealTimers();
        }
    });
});
