import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { GlobalSearch } from '../GlobalSearch';
import { useCoreStore, useApiResourcesStore } from '../../../../../state';
import type { AuraProps } from '../../../../../types';

const INPUT = '[data-testid="global-search-input"]';
const BUTTON = '[data-testid="global-search-button"]';

/**
 * The global search input's side of `cellClickSearch`: a Shift+clicked cell's value
 * lands in the input as editable text with the focus, is searched only once the user
 * confirms it, and — while unedited — is not held back by the minimum length.
 */
describe('GlobalSearch — cell click prefill', () => {
    const storeId = 'global-search-prefill';
    let core: ReturnType<typeof useCoreStore>;
    let resource: ReturnType<typeof useApiResourcesStore>;
    let unmount: (() => void) | undefined;

    beforeEach(() => {
        setActivePinia(createPinia());
        core = useCoreStore(storeId, { storeId } as AuraProps);
        resource = useApiResourcesStore(storeId, core);
    });

    afterEach(() => {
        unmount?.();
        unmount = undefined;
    });

    const mountSearch = () => {
        const wrapper = mount(GlobalSearch, { props: { storeId }, attachTo: document.body });
        unmount = () => wrapper.unmount();
        return wrapper;
    };

    it('should take the value as editable text and focus the input, without searching', async () => {
        const wrapper = mountSearch();

        core.requestSearchPrefill({ kind: 'global', term: 'Kiss Gucy Illés' });
        await flushPromises();

        const element = wrapper.find(INPUT).element as HTMLInputElement;
        expect(element.value).toBe('Kiss Gucy Illés');
        expect(document.activeElement).toBe(element);
        expect(element.selectionStart).toBe('Kiss Gucy Illés'.length);
        expect(resource.globalSearchTerm).toBeNull();
    });

    it('should let an unedited short value be searched despite the minimum length', async () => {
        const wrapper = mountSearch();

        core.requestSearchPrefill({ kind: 'global', term: '5' });
        await flushPromises();

        expect(wrapper.find(BUTTON).attributes('disabled')).toBeUndefined();

        await wrapper.find(INPUT).trigger('keydown', { key: 'Enter' });
        expect(resource.globalSearchTerm).toBe('5');
    });

    it('should apply the minimum length again once the text is edited', async () => {
        const wrapper = mountSearch();
        const input = wrapper.find(INPUT);

        core.requestSearchPrefill({ kind: 'global', term: 'Kiss Gucy Illés' });
        await flushPromises();

        await input.setValue('Ki');
        await input.trigger('keydown', { key: 'Enter' });
        expect(resource.globalSearchTerm).toBeNull();
        expect(wrapper.find(BUTTON).attributes('disabled')).toBeDefined();

        await input.setValue('Kiss');
        await input.trigger('keydown', { key: 'Enter' });
        expect(resource.globalSearchTerm).toBe('Kiss');
    });

    it('should ignore a request addressed to a column search input', async () => {
        const wrapper = mountSearch();

        core.requestSearchPrefill({ kind: 'column', field: 'name', term: 'John' });
        await flushPromises();

        expect((wrapper.find(INPUT).element as HTMLInputElement).value).toBe('');
    });
});
