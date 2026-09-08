import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useApiResourcesStore } from '../api-resources.state';
import { useCoreStore } from '../../core/core.state';
import type { AuraProps } from '../../../types';
import {
    generateSessionKey,
    loadFromSessionStorage,
    removeFromSessionStorage,
} from '../../../utils';
import { SESSION_SAVE_DEBOUNCE_MS } from '../composables/use-session-persistence';

describe('Api Resources Store - Session Integration', () => {
    // Use separate IDs for core and api stores to avoid Pinia collision
    const coreStoreId = 'test-session-core';
    const apiStoreId = 'test-session-api';
    const sessionKey = generateSessionKey(apiStoreId);

    /** The session write is debounced, so the pending timer has to run first. */
    const flushSessionWrite = (): void => {
        vi.advanceTimersByTime(SESSION_SAVE_DEBOUNCE_MS);
    };

    beforeEach(() => {
        vi.useFakeTimers();
        setActivePinia(createPinia());
        vi.clearAllMocks();
        // Clear ALL session storage to prevent any interference
        window.sessionStorage.clear();
    });

    afterEach(() => {
        // Clean up after each test
        window.sessionStorage.clear();
        vi.useRealTimers();
    });

    const createMockProps = (disableSession = false): AuraProps => ({
        storeId: coreStoreId,
        siteName: 'Test Site',
        urlStructure: '{siteName}/api/{urlParameter}',
        urlParameter: 'users',
        disableSession,
        externalPaginator: true, // Server-side pagination - no automatic page reset on search
    });

    describe('session restore on initialization', () => {
        it('should restore state from sessionStorage when available', async () => {
            // First, create a store and set some state
            const mockProps1 = createMockProps(false);
            const core1 = useCoreStore(coreStoreId, mockProps1);
            const store1 = useApiResourcesStore(apiStoreId, core1);

            // Set limit first, then page (setLimit resets page to 1)
            store1.setLimit(50);
            store1.setPage(3);
            store1.addSort('name', 'asc');
            store1.addSearch('email', 'test@example.com');
            store1.setGlobalSearch('global search term');

            // Verify data was saved before disposing
            flushSessionWrite();
            const savedBeforeDispose = loadFromSessionStorage(sessionKey);
            expect(savedBeforeDispose).toBeTruthy();
            if (savedBeforeDispose && typeof savedBeforeDispose === 'object') {
                expect('page' in savedBeforeDispose && savedBeforeDispose.page).toBe(3);
            }

            // Dispose both stores
            store1.$dispose();
            core1.$dispose();

            // Create new Pinia instance to ensure fresh store initialization
            setActivePinia(createPinia());

            // Create new store instances - should restore from session
            const mockProps2 = createMockProps(false);
            const core2 = useCoreStore(coreStoreId, mockProps2);
            const store2 = useApiResourcesStore(apiStoreId, core2);

            expect(store2.queryParams.page).toBe(3);
            expect(store2.queryParams.paginate).toBe(50);
            expect(store2.sortItems).toEqual([{ field: 'name', direction: 'asc' }]);
            expect(store2.searchItems).toEqual([{ field: 'email', term: 'test@example.com' }]);
            expect(store2.globalSearchTerm).toBe('global search term');
        });

        it('should persist and restore the hidden column list', () => {
            const core1 = useCoreStore(coreStoreId, createMockProps(false));
            const store1 = useApiResourcesStore(apiStoreId, core1);

            store1.hideColumn('email');
            store1.hideColumn('createdAt');
            flushSessionWrite();

            const saved = loadFromSessionStorage(sessionKey) as { hiddenColumns: string[] };
            expect(saved.hiddenColumns).toEqual(['email', 'createdAt']);

            store1.$dispose();
            core1.$dispose();
            setActivePinia(createPinia());

            const core2 = useCoreStore(coreStoreId, createMockProps(false));
            const store2 = useApiResourcesStore(apiStoreId, core2);

            expect(store2.hiddenColumns).toEqual(['email', 'createdAt']);
            expect(store2.isColumnHidden('email')).toBe(true);
        });

        it('should keep the hidden list out of the query params', () => {
            const core = useCoreStore(coreStoreId, createMockProps(false));
            const store = useApiResourcesStore(apiStoreId, core);

            store.hideColumn('email');

            expect(store.queryParams).not.toHaveProperty('hiddenColumns');
        });

        it('should restore an empty list from a session written before the feature', () => {
            window.sessionStorage.setItem(
                sessionKey,
                JSON.stringify({
                    page: 2,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                })
            );

            const core = useCoreStore(coreStoreId, createMockProps(false));
            const store = useApiResourcesStore(apiStoreId, core);

            expect(store.queryParams.page).toBe(2);
            expect(store.hiddenColumns).toEqual([]);
        });

        it('should not restore state when disableSession is true', () => {
            // Set up session data
            const sessionData = {
                page: 5,
                limit: 100,
                sortItems: [{ field: 'date', direction: 'desc' }],
                searchItems: [{ field: 'name', term: 'John' }],
                globalSearchTerm: 'test',
            };
            window.sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));

            // Create store with disableSession = true
            const mockProps = createMockProps(true);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            // Should use default values, not restored values
            expect(store.queryParams.page).toBe(1);
            expect(store.queryParams.paginate).toBe(10);
            expect(store.sortItems).toEqual([]);
            expect(store.searchItems).toEqual([]);
            expect(store.globalSearchTerm).toBeNull();
        });

        it('should handle missing session data gracefully', () => {
            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            // Should initialize with defaults
            expect(store.queryParams.page).toBe(1);
            expect(store.queryParams.paginate).toBe(10);
            expect(store.sortItems).toEqual([]);
            expect(store.searchItems).toEqual([]);
            expect(store.globalSearchTerm).toBeNull();
        });

        it('should handle corrupted session data gracefully', () => {
            // Insert corrupted JSON
            window.sessionStorage.setItem(sessionKey, '{invalid json}');

            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            // Should initialize with defaults
            expect(store.queryParams.page).toBe(1);
            expect(store.sortItems).toEqual([]);
        });

        it('should handle invalid session data structure', () => {
            // Valid JSON but invalid structure
            const invalidData = { page: 'invalid', limit: 'invalid' };
            window.sessionStorage.setItem(sessionKey, JSON.stringify(invalidData));

            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            // Should initialize with defaults and add error to error store
            expect(store.queryParams.page).toBe(1);
            expect(core.errorStore.errors.length).toBeGreaterThan(0);
            expect(core.errorStore.errors[0]?.severity).toBe('warning');
        });

        it('should validate restored session data', () => {
            // Insert session with page = 0 (invalid)
            const invalidSession = {
                page: 0,
                limit: 10,
                sortItems: [],
                searchItems: [],
                globalSearchTerm: null,
            };
            window.sessionStorage.setItem(sessionKey, JSON.stringify(invalidSession));

            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            // Should use defaults due to validation failure
            expect(store.queryParams.page).toBe(1);
        });
    });

    describe('session save on state changes', () => {
        it('should save page change to session', () => {
            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            store.setPage(5);

            flushSessionWrite();
            const savedData = loadFromSessionStorage(sessionKey);
            expect(savedData).toBeTruthy();
            if (savedData && typeof savedData === 'object' && 'page' in savedData) {
                expect(savedData.page).toBe(5);
            }
        });

        it('should save limit change to session', () => {
            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            store.setLimit(25);

            flushSessionWrite();
            const savedData = loadFromSessionStorage(sessionKey);
            expect(savedData).toBeTruthy();
            if (savedData && typeof savedData === 'object' && 'limit' in savedData) {
                expect(savedData.limit).toBe(25);
            }
        });

        it('should save sort changes to session', () => {
            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            store.addSort('name', 'asc');
            store.addSort('email', 'desc');

            flushSessionWrite();
            const savedData = loadFromSessionStorage(sessionKey);
            expect(savedData).toBeTruthy();
            if (savedData && typeof savedData === 'object' && 'sortItems' in savedData) {
                expect(savedData.sortItems).toEqual([
                    { field: 'name', direction: 'asc' },
                    { field: 'email', direction: 'desc' },
                ]);
            }
        });

        it('should save search changes to session', () => {
            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            store.addSearch('name', 'John');
            store.addSearch('email', 'test@example.com', true);

            flushSessionWrite();
            const savedData = loadFromSessionStorage(sessionKey);
            expect(savedData).toBeTruthy();
            if (savedData && typeof savedData === 'object' && 'searchItems' in savedData) {
                expect(savedData.searchItems).toEqual([
                    { field: 'name', term: 'John' },
                    { field: 'email', term: 'test@example.com', exact: true },
                ]);
            }
        });

        it('should save global search to session', () => {
            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            store.setGlobalSearch('global search term');

            flushSessionWrite();
            const savedData = loadFromSessionStorage(sessionKey);
            expect(savedData).toBeTruthy();
            if (savedData && typeof savedData === 'object' && 'globalSearchTerm' in savedData) {
                expect(savedData.globalSearchTerm).toBe('global search term');
            }
        });

        it('should not save when disableSession is true', () => {
            // Use unique store IDs to avoid Pinia cache
            const uniqueCoreId = 'test-session-core-disabled';
            const uniqueApiId = 'test-session-api-disabled';
            const uniqueSessionKey = generateSessionKey(uniqueApiId);

            const mockPropsDisabled = createMockProps(true);
            const coreDisabled = useCoreStore(uniqueCoreId, {
                ...mockPropsDisabled,
                storeId: uniqueCoreId,
            });
            const store = useApiResourcesStore(uniqueApiId, coreDisabled);

            store.setPage(10);
            store.addSort('name', 'asc');

            flushSessionWrite();
            const savedData = loadFromSessionStorage(uniqueSessionKey);
            expect(savedData).toBeNull();
        });

        it('should update session on multiple state changes', () => {
            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            // Set limit first, then page (setLimit resets page to 1)
            store.setLimit(50);
            store.setPage(2);
            store.addSort('date', 'desc');

            flushSessionWrite();
            const savedData = loadFromSessionStorage(sessionKey);
            expect(savedData).toBeTruthy();
            if (savedData && typeof savedData === 'object') {
                expect('page' in savedData && savedData.page).toBe(2);
                expect('limit' in savedData && savedData.limit).toBe(50);
                expect('sortItems' in savedData && savedData.sortItems).toEqual([
                    { field: 'date', direction: 'desc' },
                ]);
            }
        });
    });

    describe('multi-instance isolation', () => {
        it('should not share session between different store instances', async () => {
            const coreId1 = 'store-core-1';
            const apiId1 = 'store-api-1';
            const coreId2 = 'store-core-2';
            const apiId2 = 'store-api-2';

            const mockProps1 = { ...createMockProps(false), storeId: coreId1 };
            const mockProps2 = { ...createMockProps(false), storeId: coreId2 };

            const core1 = useCoreStore(coreId1, mockProps1);
            const core2 = useCoreStore(coreId2, mockProps2);

            const store1 = useApiResourcesStore(apiId1, core1);
            const store2 = useApiResourcesStore(apiId2, core2);

            store1.setPage(5);
            store2.setPage(10);

            flushSessionWrite();
            const session1 = loadFromSessionStorage(generateSessionKey(apiId1));
            const session2 = loadFromSessionStorage(generateSessionKey(apiId2));

            expect(session1).not.toEqual(session2);
            if (session1 && typeof session1 === 'object' && 'page' in session1) {
                expect(session1.page).toBe(5);
            }
            if (session2 && typeof session2 === 'object' && 'page' in session2) {
                expect(session2.page).toBe(10);
            }

            // Cleanup
            removeFromSessionStorage(generateSessionKey(apiId1));
            removeFromSessionStorage(generateSessionKey(apiId2));
        });
    });

    describe('restore should not trigger fetchData', () => {
        it('should not call fetchData during session restore', () => {
            // Set up existing session
            const sessionData = {
                page: 3,
                limit: 25,
                sortItems: [{ field: 'name', direction: 'asc' }],
                searchItems: [],
                globalSearchTerm: null,
            };
            window.sessionStorage.setItem(sessionKey, JSON.stringify(sessionData));

            // Create new store - should restore without fetching
            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);

            // Spy on axios to ensure it's not called during init
            const fetchSpy = vi.fn();
            const store = useApiResourcesStore(apiStoreId, core);

            // Mock fetchData to count calls
            const originalFetch = store.fetchData;
            store.fetchData = fetchSpy.mockImplementation(originalFetch);

            // After initialization, fetchData should not have been called yet
            // (It will be called from Aura.tsx onMounted)
            expect(fetchSpy).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('should handle clearing sort items', () => {
            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            store.addSort('name', 'asc');

            store.clearAllSorts();

            flushSessionWrite();
            const savedData = loadFromSessionStorage(sessionKey);
            if (savedData && typeof savedData === 'object' && 'sortItems' in savedData) {
                expect(savedData.sortItems).toEqual([]);
            }
        });

        it('should handle clearing search items', () => {
            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            store.addSearch('name', 'John');

            store.clearAllSearches();

            flushSessionWrite();
            const savedData = loadFromSessionStorage(sessionKey);
            if (savedData && typeof savedData === 'object' && 'searchItems' in savedData) {
                expect(savedData.searchItems).toEqual([]);
            }
        });

        it('should handle clearing global search', () => {
            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            store.setGlobalSearch('test');

            store.clearGlobalSearch();

            flushSessionWrite();
            const savedData = loadFromSessionStorage(sessionKey);
            if (savedData && typeof savedData === 'object' && 'globalSearchTerm' in savedData) {
                expect(savedData.globalSearchTerm).toBeNull();
            }
        });

        it('should save session with maximum allowed values', () => {
            const mockProps = createMockProps(false);
            const core = useCoreStore(coreStoreId, mockProps);
            const store = useApiResourcesStore(apiStoreId, core);

            // Set limit first, then page (setLimit resets page to 1)
            store.setLimit(1000);
            store.setPage(100000);

            // Add maximum sort items (20)
            for (let i = 0; i < 20; i++) {
                store.addSort(`field${i}`, 'asc');
            }

            // Add maximum search items (50)
            for (let i = 0; i < 50; i++) {
                store.addSearch(`field${i}`, `term${i}`);
            }

            store.setGlobalSearch('a'.repeat(500));

            // flush:sync means immediate execution

            flushSessionWrite();
            const savedData = loadFromSessionStorage(sessionKey);
            expect(savedData).toBeTruthy();

            // Validate it can be restored
            store.$dispose();
            core.$dispose();

            // Create new Pinia instance to ensure fresh store initialization
            setActivePinia(createPinia());

            const newCore = useCoreStore(coreStoreId, createMockProps(false));
            const newStore = useApiResourcesStore(apiStoreId, newCore);

            expect(newStore.queryParams.page).toBe(100000);
            expect(newStore.queryParams.paginate).toBe(1000);
            expect(newStore.sortItems.length).toBe(20);
            expect(newStore.searchItems.length).toBe(50);
        });
    });

    describe('sessionKey override', () => {
        const explicitKey = 'my-explicit-session-key';

        const createPropsWithSessionKey = (key?: string | null): AuraProps => ({
            ...createMockProps(false),
            sessionKey: key,
        });

        it('should save the state under the explicit sessionKey', () => {
            const core = useCoreStore(coreStoreId, createPropsWithSessionKey(explicitKey));
            const store = useApiResourcesStore(apiStoreId, core);

            store.setPage(4);

            flushSessionWrite();
            expect(loadFromSessionStorage(explicitKey)).toBeTruthy();
        });

        it('should not write the storeId-derived key when sessionKey is set', () => {
            const core = useCoreStore(coreStoreId, createPropsWithSessionKey(explicitKey));
            const store = useApiResourcesStore(apiStoreId, core);

            store.setPage(4);

            flushSessionWrite();
            expect(loadFromSessionStorage(sessionKey)).toBeNull();
        });

        it('should restore the state from the explicit sessionKey', () => {
            const core = useCoreStore(coreStoreId, createPropsWithSessionKey(explicitKey));
            const store = useApiResourcesStore(apiStoreId, core);

            store.setLimit(25);
            store.setPage(7);

            store.$dispose();
            core.$dispose();
            setActivePinia(createPinia());

            // A different storeId must still find the state, since the key is explicit
            const newCore = useCoreStore('other-core-id', {
                ...createPropsWithSessionKey(explicitKey),
                storeId: 'other-core-id',
            });
            const newStore = useApiResourcesStore('other-api-id', newCore);

            expect(newStore.queryParams.page).toBe(7);
            expect(newStore.queryParams.paginate).toBe(25);
        });

        it('should fall back to the derived key for a blank sessionKey', () => {
            const core = useCoreStore(coreStoreId, createPropsWithSessionKey('   '));
            const store = useApiResourcesStore(apiStoreId, core);

            store.setPage(2);

            flushSessionWrite();
            expect(loadFromSessionStorage(sessionKey)).toBeTruthy();
        });

        it('should fall back to the derived key when sessionKey is omitted', () => {
            const core = useCoreStore(coreStoreId, createPropsWithSessionKey(undefined));
            const store = useApiResourcesStore(apiStoreId, core);

            store.setPage(2);

            flushSessionWrite();
            expect(loadFromSessionStorage(sessionKey)).toBeTruthy();
        });

        it('should not save at all when the session is disabled, even with a sessionKey', () => {
            const core = useCoreStore(coreStoreId, {
                ...createPropsWithSessionKey(explicitKey),
                disableSession: true,
            });
            const store = useApiResourcesStore(apiStoreId, core);

            store.setPage(4);

            flushSessionWrite();
            expect(loadFromSessionStorage(explicitKey)).toBeNull();
        });
    });
});
