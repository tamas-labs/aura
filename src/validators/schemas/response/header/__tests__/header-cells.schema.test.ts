import { describe, it, expect, beforeEach } from 'vitest';
import { validateHeaderCells } from '../header-cells.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';
import { createPinia, setActivePinia } from 'pinia';

// Test constants
const TEST_STORE_ID = 'test-store';
const TEST_KEY = 'response.header.rows[0].cells';
const CUSTOM_KEY_ROW_2 = 'response.header.rows[2].cells';
const EXPECTED_ERROR_MESSAGE = 'Header cells validation failed';

describe('validateHeaderCells', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('valid cases', () => {
        it('should validate successfully for valid cells array (with all required fields)', () => {
            const row = {
                cells: [{ content: 'ID', field: 'id', key: 'id' }],
            };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).not.toThrow();
        });

        it('should validate successfully for multiple cells', () => {
            const row = {
                cells: [
                    { content: 'ID', field: 'id', key: 'id' },
                    { content: 'Name', field: 'name', key: 'name' },
                ],
            };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).not.toThrow();
        });

        it('should validate successfully for cells with complex objects', () => {
            const row = {
                cells: [
                    {
                        content: 'ID',
                        field: 'id',
                        key: 'id',
                        sortable: true,
                        searchable: true,
                        width: '100px',
                    },
                ],
            };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).not.toThrow();
        });
    });

    describe('invalid cases - structure', () => {
        // Renamed from 'missing cells'
        it('should throw error when cells is missing', () => {
            const row = {};

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should add error to error store when cells is missing', () => {
            const errorStoreId = 'test-store-missing-cells';
            const row = {};

            expect(() => {
                validateHeaderCells(row, errorStoreId, TEST_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors.length).toBeGreaterThan(0);
            expect(errorStore.errors[0]?.component).toBe('HeaderCellsValidator');
            expect(errorStore.errors[0]?.message).toBe('Invalid header cells structure');
        });
    });

    describe('invalid cases - null and undefined', () => {
        it('should throw error when cells is null', () => {
            const row = { cells: null };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should throw error when cells is undefined', () => {
            const row = { cells: undefined };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should add error to error store when cells is null', () => {
            const errorStoreId = 'test-store-null-cells';
            const row = { cells: null };

            expect(() => {
                validateHeaderCells(row, errorStoreId, TEST_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors.length).toBeGreaterThan(0);
            expect(errorStore.errors[0]?.metadata?.note).toBe(
                'Header cells must be a non-empty array of objects'
            );
        });
    });

    describe('invalid cases - empty array', () => {
        it('should throw error when cells is empty array', () => {
            const row = { cells: [] };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should include constraint metadata in error', () => {
            const errorStoreId = 'test-store-empty-cells';
            const row = { cells: [] };

            expect(() => {
                validateHeaderCells(row, errorStoreId, TEST_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors.length).toBeGreaterThan(0);
            expect(
                (errorStore.errors[0]?.metadata?.constraints as Record<string, unknown>)?.minLength
            ).toBe(1);
        });
    });

    describe('invalid cases - non-array types', () => {
        it('should throw error when cells is a string', () => {
            const row = { cells: 'invalid' };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should throw error when cells is a number', () => {
            const row = { cells: 123 };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should throw error when cells is a boolean', () => {
            const row = { cells: true };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should throw error when cells is a plain object', () => {
            const row = { cells: { content: 'ID' } };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });
    });

    describe('invalid cases - array with non-object elements', () => {
        it('should throw error when cells contains string elements', () => {
            const row = { cells: ['cell1', 'cell2'] };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });

        it('should throw error when cells contains number elements', () => {
            const row = { cells: [1, 2, 3] };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow(EXPECTED_ERROR_MESSAGE);
        });
    });

    describe('error store integration', () => {
        it('should contain correct error key path', () => {
            const errorStoreId = 'test-store-key-path';
            const customKey = CUSTOM_KEY_ROW_2;
            const row = { cells: [] };

            expect(() => {
                validateHeaderCells(row, errorStoreId, customKey);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors[0]?.key).toBe(customKey);
        });
    });

    describe('invalid cases - cell content', () => {
        it('should throw error when cell is missing mandatory field', () => {
            // Missing field/fields (not grouping because no colspan > 1)
            const row = {
                cells: [{ content: 'ID', key: 'id' }],
            };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow();
        });

        it('should validate all cells in array', () => {
            const row = {
                cells: [
                    { content: 'ID', field: 'id', key: 'id' }, // valid
                    { content: 'Name', fields: ['first', 'last'] }, // missing key (required with fields)
                ],
            };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow();
        });

        it('should pass correct rowIndex to validateHeaderCell', () => {
            const row = {
                cells: [
                    { content: 'ID', fields: ['a', 'b'] }, // missing key (required with fields)
                ],
            };

            // rowIndex = 5 passed
            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY, 5);
            }).toThrow();
        });

        it('should throw validation error for multiple missing keys', () => {
            // Zod validates the whole array at once, so it can find multiple errors
            const row = {
                cells: [
                    { content: 'ID', field: 'id' }, // missing key
                    { content: 'Name' }, // missing field and key
                ],
            };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow();
        });
    });

    describe('rowIndex parameter integration', () => {
        it('should use default rowIndex = 0 when not provided', () => {
            const row = {
                cells: [{ content: 'ID', fields: ['a'] }], // missing key (required with fields)
            };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).toThrow();
        });

        it('should use provided rowIndex in error messages', () => {
            const row = {
                cells: [{ content: 'ID', fields: ['a'] }], // missing key (required with fields)
            };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY, 10);
            }).toThrow();
        });
    });

    describe('integration with validateHeaderCell', () => {
        it('should validate cells with optional label field', () => {
            const row = {
                cells: [
                    { content: 'ID', field: 'id', key: 'id', label: 'Identifier' },
                    { content: 'Name', field: 'name', key: 'name', label: 'Full Name' },
                ],
            };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).not.toThrow();
        });

        it('should validate cells with extra properties', () => {
            const row = {
                cells: [
                    {
                        content: 'ID',
                        field: 'id',
                        key: 'id',
                        sortable: true,
                        searchable: true,
                        filterable: false,
                        width: '100px',
                        align: 'center',
                    },
                ],
            };

            expect(() => {
                validateHeaderCells(row, TEST_STORE_ID, TEST_KEY);
            }).not.toThrow();
        });
    });
});
