import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import axios from 'axios';
import { useApiResourcesStore } from '../api-resources.state';
import { useCoreStore } from '../../core/core.state';
import type { AuraProps } from '../../../types';

vi.mock('axios');
const mockedAxios = vi.mocked(axios, true);

describe('useApiResourcesStore - row selection', () => {
    const storeId = 'test-api-resources-selection';
    let core: ReturnType<typeof useCoreStore>;
    let store: ReturnType<typeof useApiResourcesStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        window.sessionStorage.clear();
        vi.clearAllMocks();

        const mockProps: AuraProps = {
            storeId,
            siteName: 'Test Site',
            urlStructure: '{siteName}/api/{urlParameter}',
            urlParameter: 'users',
            urlParameterLastSegment: 'list',
            siteToken: 'test-token-123',
            requestMethod: 'POST',
            disableSession: true,
        };

        core = useCoreStore(storeId, mockProps);
        store = useApiResourcesStore(storeId, core);
    });

    describe('toggleRowSelection', () => {
        it('should add an unselected row', () => {
            store.toggleRowSelection(1);

            expect(store.selectedRows).toEqual([1]);
            expect(store.isRowSelected(1)).toBe(true);
        });

        it('should remove an already selected row', () => {
            store.toggleRowSelection(1);
            store.toggleRowSelection(1);

            expect(store.selectedRows).toEqual([]);
            expect(store.isRowSelected(1)).toBe(false);
        });

        it('should support string identifiers', () => {
            store.toggleRowSelection('abc');

            expect(store.isRowSelected('abc')).toBe(true);
        });
    });

    describe('selectRows / deselectRows', () => {
        it('should add multiple ids without duplicates', () => {
            store.toggleRowSelection(1);
            store.selectRows([1, 2, 3]);

            expect(store.selectedRows).toEqual([1, 2, 3]);
        });

        it('should remove the given ids only', () => {
            store.selectRows([1, 2, 3]);
            store.deselectRows([2]);

            expect(store.selectedRows).toEqual([1, 3]);
        });
    });

    describe('clearSelection', () => {
        it('should empty the selection', () => {
            store.selectRows([1, 2, 3]);
            store.clearSelection();

            expect(store.selectedRows).toEqual([]);
        });
    });

    describe('queryParams isolation', () => {
        it('should NOT include selected in queryParams (no auto-refetch on selection)', () => {
            store.selectRows([1, 2]);

            expect(store.queryParams).not.toHaveProperty('selected');
        });
    });

    describe('request payload injection', () => {
        it('should send selected in the request payload when non-empty', async () => {
            store.selectRows([1, 2, 3]);
            mockedAxios.mockResolvedValueOnce({ data: {} });

            await store.fetchData();

            const requestConfig = mockedAxios.mock.calls[0]?.[0] as {
                data?: Record<string, unknown>;
            };
            expect(requestConfig.data?.selected).toEqual([1, 2, 3]);
        });

        it('should omit selected when the selection is empty', async () => {
            mockedAxios.mockResolvedValueOnce({ data: {} });

            await store.fetchData();

            const requestConfig = mockedAxios.mock.calls[0]?.[0] as {
                data?: Record<string, unknown>;
            };
            expect(requestConfig.data).not.toHaveProperty('selected');
        });
    });

    describe('session persistence', () => {
        it('should persist and restore selected rows across store instances', () => {
            const sessionStoreId = 'test-selection-session';
            const sessionCoreId = 'test-selection-session-core';
            const sessionProps: AuraProps = {
                storeId: sessionStoreId,
                siteName: 'Test Site',
                // session ENABLED (no disableSession)
            };
            const core1 = useCoreStore(sessionCoreId, sessionProps);
            const first = useApiResourcesStore(sessionStoreId, core1);

            first.selectRows([7, 8]);
            first.$dispose();
            core1.$dispose();

            // Fresh Pinia → the new store instance re-runs restoreSession.
            setActivePinia(createPinia());
            const core2 = useCoreStore(sessionCoreId, sessionProps);
            const second = useApiResourcesStore(sessionStoreId, core2);

            expect(second.selectedRows).toEqual([7, 8]);
        });
    });
});
