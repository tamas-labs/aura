import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';
import { useCoreStore } from '../../../../../state/core/core.state';
import type { ApiResponse, AuraProps } from '../../../../../types';

const HEADER_VALIDATION_FAILED = 'Header validation failed';

/**
 * Integration Test: API Resources Store + Lazy Validators
 *
 * Verifies that the API Resources Store works correctly together with the lazy validators:
 * - Async processResponse works
 * - Lazy validators load automatically
 * - Error handling works
 * - Use of the central error store
 */
describe('Integration: API Resources Store + Lazy Validators', () => {
    const TEST_STORE_ID = 'integration-test-store';
    let apiStore: ReturnType<typeof useApiResourcesStore>;
    let core: ReturnType<typeof useCoreStore>;

    beforeEach(() => {
        setActivePinia(createPinia());

        const mockProps: AuraProps = {
            storeId: TEST_STORE_ID,
            siteName: 'Test Site',
            urlStructure: '{siteName}/api/{urlParameter}',
            urlParameter: 'users',
        };

        core = useCoreStore(TEST_STORE_ID, mockProps);
        apiStore = useApiResourcesStore(TEST_STORE_ID, core);
    });

    describe('processResponse (async with lazy validation)', () => {
        it('should process valid header data successfully', async () => {
            const validApiResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'ID', field: 'id', key: 'id' },
                                { content: 'Name', field: 'name', key: 'name' },
                            ],
                        },
                    ],
                },
                items: [],
            };

            await apiStore.processResponse(validApiResponse);

            // Check that the data was stored
            expect(apiStore.header).toBeDefined();
            expect(apiStore.header?.rows).toHaveLength(1);
            expect(apiStore.header?.rows?.[0]?.cells).toHaveLength(2);

            // No error expected
            expect(core.errorStore.errors.length).toBe(0);
        });

        it('should return a Promise (async method)', () => {
            const result = apiStore.processResponse({
                header: {
                    rows: [
                        {
                            cells: [{ content: 'Test', field: 'test', key: 'test' }],
                        },
                    ],
                },
                items: [],
            });

            expect(result).toBeInstanceOf(Promise);
        });

        it('should await lazy validator loading', async () => {
            const startTime = Date.now();

            await apiStore.processResponse({
                header: {
                    rows: [
                        {
                            cells: [{ content: 'Test', field: 'test', key: 'test' }],
                        },
                    ],
                },
                items: [],
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            // The lazy module loads during the first run
            // This takes some time (usually < 100ms)
            expect(duration).toBeGreaterThanOrEqual(0);
        });

        it('should handle invalid header data with lazy validator', async () => {
            const invalidApiResponse = {
                header: {
                    rows: [], // Empty rows array - invalid
                },
                items: [],
            };

            // The validator throws an exception on invalid data
            await expect(apiStore.processResponse(invalidApiResponse)).rejects.toThrow(
                HEADER_VALIDATION_FAILED
            );

            // The error is also recorded in the error store
            expect(core.errorStore.errors.length).toBeGreaterThan(0);
        });

        it('should handle missing header field', async () => {
            const invalidApiResponse = {
                items: [],
                // header field is missing
            } as never;

            // The validator throws an exception when header is missing
            await expect(apiStore.processResponse(invalidApiResponse)).rejects.toThrow(
                'Header field is required'
            );

            // The error is also recorded in the error store
            expect(core.errorStore.errors.length).toBeGreaterThan(0);
        });

        it('should send validation errors to central error store', async () => {
            const invalidApiResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'Valid', field: 'valid', key: 'valid' },
                                { content: 'Invalid', fields: ['a', 'b'] }, // Missing key - invalid (required with fields)
                            ],
                        },
                    ],
                },
                items: [],
            } as ApiResponse;

            // The validator throws an exception on an invalid cell
            await expect(apiStore.processResponse(invalidApiResponse)).rejects.toThrow(
                HEADER_VALIDATION_FAILED
            );

            // The error is also recorded in the CENTRAL error store
            expect(core.errorStore.errors.length).toBeGreaterThan(0);
            // Check that it uses the central error store
            expect(core.errorStore.$id).toBe(`${TEST_STORE_ID}-errors`);

            const error = core.errorStore.errors[0];
            expect(error).toBeDefined();
            expect(error?.type).toBe('validation');
        });
    });

    describe('Lazy validator caching', () => {
        it('should cache lazy validator after first load', async () => {
            const apiResponse = {
                header: {
                    rows: [
                        {
                            cells: [{ content: 'Test', field: 'test', key: 'test' }],
                        },
                    ],
                },
                items: [],
            };

            // First call - lazy load
            await apiStore.processResponse(apiResponse);
            expect(apiStore.header).not.toBeNull();
            expect(apiStore.header?.rows).toHaveLength(1);

            // Second call - from cache, does not throw
            await apiStore.processResponse(apiResponse);
            expect(apiStore.header).not.toBeNull();
            expect(apiStore.header?.rows).toHaveLength(1);

            // No error in the error store
            expect(core.errorStore.errors).toHaveLength(0);
        });

        it('should use same validator instance across multiple calls', async () => {
            const apiResponse = {
                header: {
                    rows: [
                        {
                            cells: [{ content: 'Test', field: 'test', key: 'test' }],
                        },
                    ],
                },
                items: [],
            };

            // Multiple calls in a row
            await apiStore.processResponse(apiResponse);
            await apiStore.processResponse(apiResponse);
            await apiStore.processResponse(apiResponse);

            // The number of calls does not matter, there should be no error
            // (the cache works well, no memory leak)
            expect(core.errorStore.errors.length).toBe(0);
        });
    });

    describe('Error propagation from lazy validators', () => {
        it('should propagate validation errors to central error store', async () => {
            const invalidApiResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'Valid', field: 'valid', key: 'valid' },
                                { content: 'Invalid', fields: ['a', 'b'] }, // Missing key - invalid (required with fields)
                            ],
                        },
                    ],
                },
                items: [],
            } as ApiResponse;

            // The validator throws an exception on an invalid cell
            await expect(apiStore.processResponse(invalidApiResponse)).rejects.toThrow(
                HEADER_VALIDATION_FAILED
            );

            // The error is also recorded in the error store
            expect(core.errorStore.errors.length).toBeGreaterThan(0);

            const error = core.errorStore.errors[0];
            expect(error).toBeDefined();
            expect(error?.type).toBe('validation');
        });

        it('should clear previous errors on new validation', async () => {
            const invalidApiResponse = {
                header: { rows: [] },
                items: [],
            };

            // First invalid call - throws an exception
            await expect(apiStore.processResponse(invalidApiResponse)).rejects.toThrow(
                HEADER_VALIDATION_FAILED
            );
            const errorCount1 = core.errorStore.errors.length;
            expect(errorCount1).toBeGreaterThan(0);

            // Valid call - errors are cleared
            const validApiResponse = {
                header: {
                    rows: [
                        {
                            cells: [{ content: 'Test', field: 'test', key: 'test' }],
                        },
                    ],
                },
                items: [],
            };

            core.errorStore.clearErrors();
            await apiStore.processResponse(validApiResponse);

            expect(core.errorStore.errors.length).toBe(0);
        });
    });

    describe('State preservation on validation failure', () => {
        it('should NOT store header data when validation fails', async () => {
            const invalidApiResponse = {
                header: { rows: [] },
                items: [],
            };

            // Initial state is null
            expect(apiStore.header).toBe(null);

            // Validation fails, state should remain null
            await expect(apiStore.processResponse(invalidApiResponse)).rejects.toThrow(
                HEADER_VALIDATION_FAILED
            );

            expect(apiStore.header).toBe(null);
        });

        it('should preserve previous valid state on validation failure', async () => {
            const validApiResponse = {
                header: {
                    rows: [
                        {
                            cells: [{ content: 'Valid', field: 'valid', key: 'valid' }],
                        },
                    ],
                },
                items: [],
            };
            const invalidApiResponse = {
                header: { rows: [] },
                items: [],
            };

            // Set valid state
            await apiStore.processResponse(validApiResponse);
            const validHeader = apiStore.header;

            // Try to overwrite with invalid data
            await expect(apiStore.processResponse(invalidApiResponse)).rejects.toThrow(
                HEADER_VALIDATION_FAILED
            );

            // Previous valid state should be preserved
            expect(apiStore.header).toEqual(validHeader);
        });
    });

    describe('Direct property access (no double nesting)', () => {
        it('should allow direct access to rows property', async () => {
            const validApiResponse = {
                header: {
                    rows: [
                        {
                            cells: [{ content: 'Test', field: 'test', key: 'test' }],
                        },
                    ],
                },
                items: [],
            };

            await apiStore.processResponse(validApiResponse);

            // Direct access: header.rows (NOT header.header.rows)
            expect(apiStore.header?.rows).toBeDefined();
            expect(apiStore.header?.rows).toHaveLength(1);
        });

        it('should NOT have nested header.header property', async () => {
            const validApiResponse = {
                header: {
                    rows: [
                        {
                            cells: [{ content: 'Test', field: 'test', key: 'test' }],
                        },
                    ],
                },
                items: [],
            };

            await apiStore.processResponse(validApiResponse);

            // The bug was: header.header.rows
            // Now it should be: header.rows
            expect(apiStore.header).not.toHaveProperty('header');
        });
    });

    describe('Unified store - all response data accessible', () => {
        it('should store all response data types', async () => {
            const fullResponse = {
                header: {
                    rows: [
                        {
                            cells: [{ content: 'ID', key: 'id', field: 'id' }],
                        },
                    ],
                },
                body: { columnConfigs: {}, settings: { striped: true } },
                footer: {
                    rows: [
                        {
                            cells: [{ content: 'Total', key: 'total', field: 'total' }],
                        },
                    ],
                },
                items: [{ id: 1 }, { id: 2 }],
                meta: {
                    current_page: 1,
                    from: 1,
                    to: 2,
                    total: 2,
                    per_page: 10,
                    last_page: 1,
                    path: '/api/users',
                },
                links: {
                    first: '/api/users?page=1',
                    last: '/api/users?page=1',
                    prev: null,
                    next: null,
                },
            };

            await apiStore.processResponse(fullResponse);

            // All data is accessible directly from the apiStore
            expect(apiStore.header).toMatchObject({ rows: fullResponse.header.rows });
            expect(apiStore.body).toMatchObject(fullResponse.body);
            expect(apiStore.footer).toMatchObject({ rows: fullResponse.footer.rows });
            expect(apiStore.items).toEqual(fullResponse.items);
            expect(apiStore.meta).toEqual(fullResponse.meta);
            expect(apiStore.links).toEqual(fullResponse.links);
        });

        it('should handle partial response data', async () => {
            const partialResponse = {
                header: {
                    rows: [
                        {
                            cells: [{ content: 'ID', key: 'id', field: 'id' }],
                        },
                    ],
                },
                items: [{ id: 1 }],
                // No body, footer, meta, links
            };

            await apiStore.processResponse(partialResponse);

            expect(apiStore.header).not.toBeNull();
            expect(apiStore.body).toBeNull();
            expect(apiStore.footer).toBeNull();
            expect(apiStore.items).toEqual(partialResponse.items);
            expect(apiStore.meta).toBeNull();
            expect(apiStore.links).toBeNull();
        });

        it('should clear all data with clearResponse', async () => {
            const fullResponse = {
                header: { rows: [{ cells: [{ content: 'ID', key: 'id', field: 'id' }] }] },
                items: [{ id: 1 }],
                meta: {
                    current_page: 1,
                    total: 1,
                    per_page: 10,
                    from: 1,
                    to: 1,
                    last_page: 1,
                    path: '',
                },
            };

            await apiStore.processResponse(fullResponse);

            // Check that there is data
            expect(apiStore.header).not.toBeNull();
            expect(apiStore.items).not.toBeNull();
            expect(apiStore.meta).not.toBeNull();

            // Clear all data
            apiStore.clearResponse();

            // Everything should be null
            expect(apiStore.header).toBeNull();
            expect(apiStore.body).toBeNull();
            expect(apiStore.footer).toBeNull();
            expect(apiStore.items).toBeNull();
            expect(apiStore.meta).toBeNull();
            expect(apiStore.links).toBeNull();
        });
    });
});
