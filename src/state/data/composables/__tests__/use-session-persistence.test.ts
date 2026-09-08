import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { effectScope, ref } from 'vue';
import type { EffectScope, Ref } from 'vue';
import { SESSION_SAVE_DEBOUNCE_MS, useSessionPersistence } from '../use-session-persistence';
import type { SessionSources } from '../use-session-persistence';
import { generateSessionKey, loadFromSessionStorage } from '../../../../utils';
import type { CoreStore } from '../../../../types';

const STORE_ID = 'persistence-test';
const STORAGE_KEY = generateSessionKey(STORE_ID);

/** Minimal core store stand-in — the composable only reads these two config refs. */
const createCore = (disableSession = false, sessionKey: string | null = null): CoreStore =>
    ({
        config: {
            disableSession: ref(disableSession),
            sessionKey: ref(sessionKey),
        },
    }) as unknown as CoreStore;

const createSources = (): SessionSources => ({
    page: ref(1),
    limit: ref(10),
    sortItems: ref([]),
    searchItems: ref([]),
    filterItems: ref([]),
    globalSearchTerm: ref(null),
    selectedRows: ref([]),
    hiddenColumns: ref([]),
});

interface Harness {
    scope: EffectScope;
    sources: SessionSources;
    isRestoring: Ref<boolean>;
}

const activeScopes: EffectScope[] = [];

const setup = (core: CoreStore = createCore()): Harness => {
    const sources = createSources();
    const isRestoring = ref(false);
    const scope = effectScope();

    scope.run(() => {
        useSessionPersistence({ storeId: STORE_ID, core, isRestoring, sources });
    });
    activeScopes.push(scope);

    return { scope, sources, isRestoring };
};

type SetItemSpy = { mock: { calls: unknown[][] } };

/** Number of writes that actually landed on this table's session key. */
const countSessionWrites = (spy: SetItemSpy): number =>
    spy.mock.calls.filter(call => call[0] === STORAGE_KEY).length;

const readPage = (): number | undefined => {
    const saved = loadFromSessionStorage(STORAGE_KEY);
    return saved && typeof saved === 'object' && 'page' in saved
        ? (saved as { page: number }).page
        : undefined;
};

describe('useSessionPersistence', () => {
    let setItemSpy: SetItemSpy;

    beforeEach(() => {
        vi.useFakeTimers();
        window.sessionStorage.clear();
        // Spied on the storage instance, not on `Storage.prototype`: happy-dom resolves
        // the prototype method once, so a re-installed prototype spy silently stops
        // recording after the first `restoreAllMocks()`.
        setItemSpy = vi.spyOn(window.sessionStorage, 'setItem');
    });

    afterEach(() => {
        // Every harness scope is stopped, otherwise its watcher and page-event
        // listeners would stay alive and write into the next test.
        activeScopes.splice(0).forEach(scope => scope.stop());
        window.sessionStorage.clear();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    describe('debouncing', () => {
        it('should not write before the debounce window elapses', () => {
            const { sources } = setup();

            sources.page.value = 3;
            vi.advanceTimersByTime(SESSION_SAVE_DEBOUNCE_MS - 1);

            expect(countSessionWrites(setItemSpy)).toBe(0);

            vi.advanceTimersByTime(1);
            expect(countSessionWrites(setItemSpy)).toBe(1);
        });

        it('should collapse a burst of selection changes into a single write', () => {
            const { sources } = setup();

            // A "select all" over 50 rows: one mutation per row
            for (let index = 0; index < 50; index += 1) {
                sources.selectedRows.value = [...sources.selectedRows.value, index];
            }

            vi.advanceTimersByTime(SESSION_SAVE_DEBOUNCE_MS);

            expect(countSessionWrites(setItemSpy)).toBe(1);
            const saved = loadFromSessionStorage(STORAGE_KEY) as { selectedRows: number[] };
            expect(saved.selectedRows).toHaveLength(50);
        });

        it('should persist the final values of a burst, not the intermediate ones', () => {
            const { sources } = setup();

            sources.page.value = 2;
            sources.page.value = 5;
            sources.page.value = 9;
            vi.advanceTimersByTime(SESSION_SAVE_DEBOUNCE_MS);

            expect(countSessionWrites(setItemSpy)).toBe(1);
            expect(readPage()).toBe(9);
        });

        it('should write again for a change after the window', () => {
            const { sources } = setup();

            sources.page.value = 2;
            vi.advanceTimersByTime(SESSION_SAVE_DEBOUNCE_MS);
            sources.page.value = 4;
            vi.advanceTimersByTime(SESSION_SAVE_DEBOUNCE_MS);

            expect(readPage()).toBe(4);
            expect(countSessionWrites(setItemSpy)).toBe(2);
        });
    });

    describe('forced flush', () => {
        it('should flush a pending write when the scope is disposed', () => {
            const { scope, sources } = setup();

            sources.page.value = 7;
            scope.stop();

            // No timer ran — the write happened during teardown
            expect(readPage()).toBe(7);
        });

        it('should flush a pending write on pagehide', () => {
            const { sources } = setup();

            sources.page.value = 6;
            window.dispatchEvent(new Event('pagehide'));

            expect(readPage()).toBe(6);
        });

        it('should flush a pending write when the page becomes hidden', () => {
            const { sources } = setup();
            const visibility = vi.spyOn(document, 'visibilityState', 'get');

            sources.page.value = 8;
            visibility.mockReturnValue('visible');
            document.dispatchEvent(new Event('visibilitychange'));
            expect(readPage()).toBeUndefined();

            visibility.mockReturnValue('hidden');
            document.dispatchEvent(new Event('visibilitychange'));
            expect(readPage()).toBe(8);
        });

        it('should stop listening to page events after dispose', () => {
            const { scope, sources } = setup();

            sources.page.value = 3;
            scope.stop();
            const writesAfterDispose = countSessionWrites(setItemSpy);

            window.dispatchEvent(new Event('pagehide'));

            expect(countSessionWrites(setItemSpy)).toBe(writesAfterDispose);
        });

        it('should not write anything when there is nothing pending', () => {
            setup();

            window.dispatchEvent(new Event('pagehide'));
            vi.advanceTimersByTime(SESSION_SAVE_DEBOUNCE_MS);

            expect(countSessionWrites(setItemSpy)).toBe(0);
        });
    });

    describe('skipped writes', () => {
        it('should not persist while the session is disabled', () => {
            const { sources } = setup(createCore(true));

            sources.page.value = 4;
            vi.advanceTimersByTime(SESSION_SAVE_DEBOUNCE_MS);

            expect(countSessionWrites(setItemSpy)).toBe(0);
            expect(loadFromSessionStorage(STORAGE_KEY)).toBeNull();
        });

        it('should not persist while a restore is in progress', () => {
            const { sources, isRestoring } = setup();

            isRestoring.value = true;
            sources.page.value = 4;
            vi.advanceTimersByTime(SESSION_SAVE_DEBOUNCE_MS);

            expect(countSessionWrites(setItemSpy)).toBe(0);
        });
    });

    describe('session key', () => {
        it('should honour an explicit sessionKey', () => {
            const { sources } = setup(createCore(false, 'explicit-key'));

            sources.page.value = 2;
            vi.advanceTimersByTime(SESSION_SAVE_DEBOUNCE_MS);

            expect(loadFromSessionStorage('explicit-key')).toBeTruthy();
            expect(loadFromSessionStorage(STORAGE_KEY)).toBeNull();
        });
    });
});
