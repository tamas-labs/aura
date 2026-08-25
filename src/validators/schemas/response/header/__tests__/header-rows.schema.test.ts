import { describe, it, expect, beforeEach } from 'vitest';
import { validateHeaderRows } from '../header-rows.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';
import { createPinia, setActivePinia } from 'pinia';

const TEST_STORE_ID = 'test-store';
const TEST_KEY = 'response.header.rows';
const EXPECTED_ERROR_MESSAGE = 'Header rows validation failed';

describe('validateHeaderRows', () => {
    beforeEach(() => {
        // New Pinia instance before each test
        setActivePinia(createPinia());
    });

    describe('valid cases', () => {
        it('should validate successfully for valid rows array', () => {
            const header = {
                rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }],
            };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).not.toThrow();
        });

        it('should validate successfully for multiple rows', () => {
            const header = {
                rows: [
                    { cells: [{ content: 'ID', field: 'id', key: 'id' }] },
                    { cells: [{ content: 'Name', field: 'name', key: 'name' }] },
                ],
            };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).not.toThrow();
        });

        it('should validate successfully for rows with complex objects', () => {
            const header = {
                rows: [
                    {
                        cells: [{ content: 'ID', field: 'id', key: 'id', sortable: true }],
                        settings: { align: 'left' },
                        metadata: { count: 5 },
                    },
                ],
            };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).not.toThrow();
        });
    });

    describe('invalid cases - missing rows', () => {
        it('should throw error when rows is missing', () => {
            const header = {};

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should add error to error store when rows is missing', () => {
            const errorStoreId = 'test-store-missing-rows';
            const header = {};

            expect(() => {
                validateHeaderRows(header, errorStoreId, TEST_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors.length).toBeGreaterThan(0);
            expect(errorStore.errors[0]?.component).toBe('HeaderRowsValidator');
            expect(errorStore.errors[0]?.message).toBe('Invalid header rows structure');
        });
    });

    describe('invalid cases - null and undefined', () => {
        it('should throw error when rows is null', () => {
            const header = { rows: null };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should throw error when rows is undefined', () => {
            const header = { rows: undefined };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should add error to error store when rows is null', () => {
            const errorStoreId = 'test-store-null-rows';
            const header = { rows: null };

            expect(() => {
                validateHeaderRows(header, errorStoreId, TEST_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors.length).toBeGreaterThan(0);
            expect(errorStore.errors[0]?.metadata?.note).toBe(
                'Header rows must be a non-empty array of objects'
            );
        });
    });

    describe('invalid cases - empty array', () => {
        it('should throw error when rows is empty array', () => {
            const header = { rows: [] };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should include constraint metadata in error', () => {
            const errorStoreId = 'test-store-empty-rows';
            const header = { rows: [] };

            expect(() => {
                validateHeaderRows(header, errorStoreId, TEST_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors.length).toBeGreaterThan(0);
            expect(
                (errorStore.errors[0]?.metadata?.constraints as Record<string, unknown>)?.minLength
            ).toBe(1);
        });
    });

    describe('invalid cases - non-array types', () => {
        it('should throw error when rows is a string', () => {
            const header = { rows: 'invalid' };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should throw error when rows is a number', () => {
            const header = { rows: 123 };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should throw error when rows is a boolean', () => {
            const header = { rows: true };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should throw error when rows is a plain object', () => {
            const header = { rows: { cells: [] } };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });
    });

    describe('invalid cases - array with non-object elements', () => {
        it('should throw error when rows contains string elements', () => {
            const header = { rows: ['row1', 'row2'] };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should throw error when rows contains number elements', () => {
            const header = { rows: [1, 2, 3] };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should throw error when rows contains null elements', () => {
            const header = { rows: [null] };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should throw error when rows contains nested arrays', () => {
            const header = { rows: [[[{ content: 'ID' }]]] };

            expect(() => {
                validateHeaderRows(header, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });
    });

    describe('error metadata', () => {
        it('should include correct component name in error', () => {
            const errorStoreId = 'test-store-metadata';
            const header = { rows: [] };

            expect(() => {
                validateHeaderRows(header, errorStoreId, TEST_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors[0]?.component).toBe('HeaderRowsValidator');
        });

        it('should include correct key in error', () => {
            const errorStoreId = 'test-store-key';
            const customKey = 'custom.header.rows';
            const header = {};

            expect(() => {
                validateHeaderRows(header, errorStoreId, customKey);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors[0]?.key).toBe(customKey);
        });

        it('should include received value in error metadata', () => {
            const errorStoreId = 'test-store-value';
            const header = { rows: 'invalid-value' };

            expect(() => {
                validateHeaderRows(header, errorStoreId, TEST_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors[0]?.metadata?.receivedValue).toBe('invalid-value');
        });
    });

    describe('separate error stores', () => {
        it('should use separate error stores for different storeIds', () => {
            const errorStoreId1 = 'test-store-1';
            const errorStoreId2 = 'test-store-2';
            const header = {};

            expect(() => validateHeaderRows(header, errorStoreId1, TEST_KEY)).toThrow();
            expect(() => validateHeaderRows(header, errorStoreId2, TEST_KEY)).toThrow();

            const errorStore1 = useErrorHandlerStore(errorStoreId1);
            const errorStore2 = useErrorHandlerStore(errorStoreId2);

            expect(errorStore1.errors.length).toBeGreaterThan(0);
            expect(errorStore2.errors.length).toBeGreaterThan(0);
            expect(errorStore1.errors).not.toBe(errorStore2.errors);
        });
    });

    describe('error message details', () => {
        it('should include Zod error details in error message', () => {
            const errorStoreId = 'test-store-details';
            const header = { rows: [] };

            expect(() => {
                validateHeaderRows(header, errorStoreId, TEST_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors[0]?.details).toBeDefined();
            expect(errorStore.errors[0]?.details).toContain('at least one row');
        });

        it('should provide helpful error message for invalid type', () => {
            const errorStoreId = 'test-store-type-error';
            const header = { rows: 'not-an-array' };

            expect(() => {
                validateHeaderRows(header, errorStoreId, TEST_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors[0]?.details).toContain('array');
        });
    });
});
