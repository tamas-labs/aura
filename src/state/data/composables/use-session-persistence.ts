import { watch, unref, getCurrentScope, onScopeDispose } from 'vue';
import type { Ref } from 'vue';
import type { CoreStore } from '../../../types';
import type { SessionState } from '../../../types/session.types';
import type { FilterItem, RowId, SearchItem, SortItem } from '../../../types/api-response.types';
import { generateSessionKey, saveToSessionStorage } from '../../../utils';
// Imported from the file, not the `utils` barrel: the barrel is `export *` over every
// helper, so importing the composable through it would drag unrelated modules along.
import { useDebounce } from '../../../utils/composables/useDebounce';

/**
 * Debounce window of the session write, in milliseconds.
 *
 * Matches the 300 ms used by the search inputs closely enough to feel identical, while
 * staying short enough that a normal click-then-reload keeps the state.
 */
export const SESSION_SAVE_DEBOUNCE_MS = 250;

/** The reactive sources persisted into sessionStorage. */
export interface SessionSources {
    page: Ref<number>;
    limit: Ref<number>;
    sortItems: Ref<SortItem[]>;
    searchItems: Ref<SearchItem[]>;
    filterItems: Ref<FilterItem[]>;
    globalSearchTerm: Ref<string | null>;
    selectedRows: Ref<RowId[]>;
}

/** The arguments of `useSessionPersistence`, grouped into one options object. */
export interface SessionPersistenceOptions {
    /** Unique identifier of the owning store instance */
    storeId: string;
    /** Core store providing the `disableSession` / `sessionKey` config */
    core: CoreStore;
    /** True while a session restore is in progress — those writes are skipped */
    isRestoring: Ref<boolean>;
    /** The refs to watch and persist */
    sources: SessionSources;
}

/**
 * Persists the query state into sessionStorage, debounced.
 *
 * Every one of the seven sources used to trigger a full `JSON.stringify` +
 * `sessionStorage.setItem` on **every** change. `selectedRows` made that fire on every
 * row checkbox click, and a "select all" serialized the entire set — on the main
 * thread, since `setItem` is synchronous. (The real cost was higher than one write:
 * `saveToSessionStorage` probes availability with a `setItem`/`removeItem` pair first,
 * so each save meant two writes plus a removal.)
 *
 * The state snapshot is built inside the debounced callback, so a burst of changes
 * serializes **once**, from the final values.
 *
 * The pending write is flushed — never dropped — when the store's scope is disposed,
 * and on `pagehide` / `visibilitychange`, so a reload or tab close inside the debounce
 * window cannot lose the last change.
 *
 * @param options - Store identity, config source, restore flag and the watched refs
 * @returns `flush` (persist a pending write immediately) and `cancel` (drop it)
 */
export const useSessionPersistence = (
    options: SessionPersistenceOptions
): { flush: () => void; cancel: () => void } => {
    const { storeId, core, isRestoring, sources } = options;

    const isDisabled = (): boolean => unref(core.config.disableSession) === true;

    const save = (): void => {
        if (isDisabled()) {
            return;
        }

        const sessionState: SessionState = {
            page: sources.page.value,
            limit: sources.limit.value,
            sortItems: sources.sortItems.value,
            searchItems: sources.searchItems.value,
            filterItems: sources.filterItems.value,
            globalSearchTerm: sources.globalSearchTerm.value,
            selectedRows: sources.selectedRows.value,
        };

        saveToSessionStorage(
            generateSessionKey(storeId, unref(core.config.sessionKey)),
            sessionState
        );
    };

    const { debounced, cancel, flush } = useDebounce(save, SESSION_SAVE_DEBOUNCE_MS, {
        flushOnDispose: true,
    });

    watch(
        [
            sources.page,
            sources.limit,
            sources.sortItems,
            sources.searchItems,
            sources.filterItems,
            sources.globalSearchTerm,
            sources.selectedRows,
        ],
        () => {
            if (isDisabled() || isRestoring.value) {
                return;
            }
            debounced();
        },
        // `flush: 'sync'` keeps the debounce timer starting the moment the state changes
        { deep: true, flush: 'sync' }
    );

    // A reload or tab close does not dispose the scope, so the page-lifecycle events
    // are the only chance to persist a write still sitting in the debounce window.
    const flushOnHide = (): void => {
        if (document.visibilityState === 'hidden') {
            flush();
        }
    };

    // Only with an owning scope: without one there is nothing to unregister the
    // listeners, and a leaked page-level listener is worse than the missed flush.
    if (getCurrentScope()) {
        window.addEventListener('pagehide', flush);
        document.addEventListener('visibilitychange', flushOnHide);

        onScopeDispose(() => {
            window.removeEventListener('pagehide', flush);
            document.removeEventListener('visibilitychange', flushOnHide);
        });
    }

    return { flush, cancel };
};
