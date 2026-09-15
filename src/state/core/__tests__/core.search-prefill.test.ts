import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useCoreStore } from '../core.state';

/**
 * The core store's search pre-fill slot (`cellClickSearch`): pure UI state that carries a
 * Shift+clicked cell's value to the search input it is addressed to.
 */
describe('core store — search prefill', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should start without a request', () => {
        const store = useCoreStore('prefill-initial', {});

        expect(store.searchPrefill).toBeNull();
    });

    it('should store the target together with a growing id', () => {
        const store = useCoreStore('prefill-ids', {});

        store.requestSearchPrefill({ kind: 'column', field: 'name', term: 'John' });
        const first = store.searchPrefill;
        store.requestSearchPrefill({ kind: 'column', field: 'name', term: 'John' });

        expect(first).toEqual({ kind: 'column', field: 'name', term: 'John', id: 1 });
        expect(store.searchPrefill).toEqual({ kind: 'column', field: 'name', term: 'John', id: 2 });
    });
});
