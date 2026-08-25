import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useApiResourcesStore } from '../api-resources.state';
import { useCoreStore } from '../../core/core.state';
import type { AuraProps } from '../../../types';

describe('useApiResourcesStore - extractFilterElements integration', () => {
    const storeId = 'test-filter-elements';
    let core: ReturnType<typeof useCoreStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        window.sessionStorage.clear();

        const mockProps: AuraProps = {
            storeId: storeId,
            siteName: 'Test Site',
        };

        core = useCoreStore(storeId, mockProps);
    });

    describe('processResponse with filterable columns', () => {
        it('should auto-generate elements for filterable columns without elements', async () => {
            const store = useApiResourcesStore(storeId, core);

            const mockResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'Status',
                                    key: 'status',
                                    field: 'status',
                                    filterable: true,
                                },
                            ],
                        },
                    ],
                },
                items: [
                    { id: 1, status: 'active' },
                    { id: 2, status: 'inactive' },
                    { id: 3, status: 'active' },
                    { id: 4, status: 'pending' },
                ],
            };

            await store.processResponse(mockResponse);

            expect(store.header).not.toBeNull();
            const firstCell = store.header!.rows![0]!.cells![0];
            expect(firstCell!.elements).toEqual(['active', 'inactive', 'pending']);
        });

        it('should not overwrite existing elements', async () => {
            const store = useApiResourcesStore(storeId, core);

            const existingElements = ['custom1', 'custom2'];
            const mockResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'Status',
                                    key: 'status',
                                    field: 'status',
                                    filterable: true,
                                    elements: existingElements,
                                },
                            ],
                        },
                    ],
                },
                items: [{ status: 'active' }, { status: 'inactive' }],
            };

            await store.processResponse(mockResponse);

            const firstCell = store.header!.rows![0]!.cells![0];
            expect(firstCell!.elements).toEqual(existingElements);
        });

        it('should handle multiple filterable columns', async () => {
            const store = useApiResourcesStore(storeId, core);

            const mockResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'Status',
                                    key: 'status',
                                    field: 'status',
                                    filterable: true,
                                },
                                {
                                    content: 'Role',
                                    key: 'role',
                                    field: 'role',
                                    filterable: true,
                                },
                            ],
                        },
                    ],
                },
                items: [
                    { status: 'active', role: 'admin' },
                    { status: 'inactive', role: 'user' },
                    { status: 'active', role: 'editor' },
                ],
            };

            await store.processResponse(mockResponse);

            const firstCell = store.header!.rows![0]!.cells![0];
            const secondCell = store.header!.rows![0]!.cells![1];
            expect(firstCell!.elements).toEqual(['active', 'inactive']);
            expect(secondCell!.elements).toEqual(['admin', 'editor', 'user']);
        });

        it('should not generate elements when filterable is false', async () => {
            const store = useApiResourcesStore(storeId, core);

            const mockResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'Status',
                                    key: 'status',
                                    field: 'status',
                                    filterable: false,
                                },
                            ],
                        },
                    ],
                },
                items: [{ status: 'active' }, { status: 'inactive' }],
            };

            await store.processResponse(mockResponse);

            const firstCell = store.header!.rows![0]!.cells![0];
            expect(firstCell!.elements).toBeUndefined();
        });

        it('should handle empty items array', async () => {
            const store = useApiResourcesStore(storeId, core);

            const mockResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'Status',
                                    key: 'status',
                                    field: 'status',
                                    filterable: true,
                                },
                            ],
                        },
                    ],
                },
                items: [],
            };

            await store.processResponse(mockResponse);

            // Should not generate elements from empty items
            const firstCell = store.header!.rows![0]!.cells![0];
            expect(firstCell!.elements).toBeUndefined();
        });

        it('should handle nested field values', async () => {
            const store = useApiResourcesStore(storeId, core);

            const mockResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'User Role',
                                    key: 'user.role',
                                    field: 'user.role',
                                    filterable: true,
                                },
                            ],
                        },
                    ],
                },
                items: [
                    { user: { role: 'Admin' } },
                    { user: { role: 'User' } },
                    { user: { role: 'Editor' } },
                ],
            };

            await store.processResponse(mockResponse);

            const firstCell = store.header!.rows![0]!.cells![0];
            expect(firstCell!.elements).toEqual(['Admin', 'Editor', 'User']);
        });

        it('should handle numeric values', async () => {
            const store = useApiResourcesStore(storeId, core);

            const mockResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'Priority',
                                    key: 'priority',
                                    field: 'priority',
                                    filterable: true,
                                },
                            ],
                        },
                    ],
                },
                items: [{ priority: 3 }, { priority: 1 }, { priority: 2 }],
            };

            await store.processResponse(mockResponse);

            const firstCell = store.header!.rows![0]!.cells![0];
            expect(firstCell!.elements).toEqual([1, 2, 3]);
        });

        it('should ignore non-string and non-number values', async () => {
            const store = useApiResourcesStore(storeId, core);

            const mockResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'Status',
                                    key: 'status',
                                    field: 'status',
                                    filterable: true,
                                },
                            ],
                        },
                    ],
                },
                items: [
                    { status: 'active' },
                    { status: null },
                    { status: undefined },
                    { status: { object: true } },
                    { status: true },
                    { status: 'inactive' },
                ],
            };

            await store.processResponse(mockResponse);

            const firstCell = store.header!.rows![0]!.cells![0];
            expect(firstCell!.elements).toEqual(['active', 'inactive']);
        });

        it('should work without items in response', async () => {
            const store = useApiResourcesStore(storeId, core);

            const mockResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'Status',
                                    key: 'status',
                                    field: 'status',
                                    filterable: true,
                                },
                            ],
                        },
                    ],
                },
                // No items property
            };

            await store.processResponse(mockResponse);

            // Should not crash, elements should remain undefined
            const firstCell = store.header!.rows![0]!.cells![0];
            expect(firstCell!.elements).toBeUndefined();
        });
    });
});
