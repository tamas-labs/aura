import { describe, it, expect, beforeEach } from 'vitest';
import { validateHeader } from '../header.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';
import { createPinia, setActivePinia } from 'pinia';
import type { ApiResponse } from '../../../../../types/api-response.types';

const TEST_STORE_ID = 'test-store';
const TEST_HEADER_KEY = 'response.header';
const HEADER_VALIDATION_ERROR = 'Header validation failed';

describe('validateHeader', () => {
    beforeEach(() => {
        // New Pinia instance before each test
        setActivePinia(createPinia());
    });

    it('should validate successfully for valid header object and return Header', () => {
        const apiResponse: ApiResponse = {
            header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
            items: [],
        };

        const result = validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);
        expect(result).toBeDefined();
        expect(result.rows).toBeDefined();
        expect(result.rows).toHaveLength(1);
    });

    it('should return sanitized header without unknown fields', () => {
        const apiResponse: ApiResponse = {
            header: {
                rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }],
                unknownProp: 'should be stripped',
                extraField: 123,
            },
            items: [],
        };

        const result = validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);
        expect(result).not.toHaveProperty('unknownProp');
        expect(result).not.toHaveProperty('extraField');
        expect(result.rows).toBeDefined();
    });

    it('should throw error for empty header object (missing rows)', () => {
        const apiResponse: ApiResponse = {
            header: {},
            items: [],
        };

        expect(() => {
            validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);
        }).toThrow('Header validation failed');
    });

    it('should throw error when header is missing', () => {
        const apiResponse: ApiResponse = {
            items: [],
        };

        expect(() => {
            validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);
        }).toThrow('Header validation failed: Header field is required in API response');
    });

    it('should throw error and add to error store when header is null', () => {
        const errorStoreId = 'test-store-null-header';
        const apiResponse: ApiResponse = {
            header: null as unknown as Record<string, unknown>,
            items: [],
        };

        expect(() => {
            validateHeader(apiResponse, errorStoreId, TEST_HEADER_KEY);
        }).toThrow();

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
        expect(errorStore.errors).toHaveLength(1);

        const firstError = errorStore.errors[0];
        expect(firstError).toBeDefined();
        expect(firstError?.severity).toBe('warning');
        expect(firstError?.component).toBe('HeaderValidator');
        expect(firstError?.type).toBe('validation');
        expect(firstError?.key).toBe(TEST_HEADER_KEY);
    });

    it('should throw error when header is not an object (string)', () => {
        const errorStoreId = 'test-store-string-header';
        const apiResponse: ApiResponse = {
            header: 'invalid' as unknown as Record<string, unknown>,
            items: [],
        };

        expect(() => {
            validateHeader(apiResponse, errorStoreId, TEST_HEADER_KEY);
        }).toThrow(HEADER_VALIDATION_ERROR);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it('should throw error when header is not an object (number)', () => {
        const errorStoreId = 'test-store-number-header';
        const apiResponse: ApiResponse = {
            header: 123 as unknown as Record<string, unknown>,
            items: [],
        };

        expect(() => {
            validateHeader(apiResponse, errorStoreId, TEST_HEADER_KEY);
        }).toThrow(HEADER_VALIDATION_ERROR);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it('should throw error when header is an array', () => {
        const errorStoreId = 'test-store-array-header';
        const apiResponse: ApiResponse = {
            header: [] as unknown as Record<string, unknown>,
            items: [],
        };

        expect(() => {
            validateHeader(apiResponse, errorStoreId, TEST_HEADER_KEY);
        }).toThrow(HEADER_VALIDATION_ERROR);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it('should validate complex nested header structure and strip unknown props', () => {
        const apiResponse: ApiResponse = {
            header: {
                rows: [
                    {
                        cells: [
                            { content: 'ID', field: 'id', key: 'id', sortable: true },
                            { content: 'Name', field: 'name', key: 'name', sortable: true },
                        ],
                    },
                ],
                extraProp: 'will be stripped',
            },
            items: [],
        };

        const result = validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);
        expect(result).toBeDefined();
        expect(result.rows).toHaveLength(1);
        expect(result).not.toHaveProperty('extraProp');
    });

    it('should preserve settings if provided', () => {
        const apiResponse: ApiResponse = {
            header: {
                rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }],
                settings: { sticky: true, height: '100px' },
            },
            items: [],
        };

        const result = validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);
        expect(result.settings).toEqual({ sticky: true, height: '100px' });
    });

    it('should add error metadata correctly', () => {
        const errorStoreId = 'test-store-metadata';
        const invalidHeader = null;
        const apiResponse: ApiResponse = {
            header: invalidHeader as unknown as Record<string, unknown>,
            items: [],
        };

        expect(() => {
            validateHeader(apiResponse, errorStoreId, TEST_HEADER_KEY);
        }).toThrow();

        const errorStore = useErrorHandlerStore(errorStoreId);
        const firstError = errorStore.errors[0];

        expect(firstError?.metadata?.receivedValue).toBe(invalidHeader);
        expect(firstError?.component).toBe('HeaderValidator');
        expect(firstError?.message).toBe('Invalid header structure in API response');
    });

    it('should use separate error stores for different storeIds', () => {
        const storeId1 = 'test-store-1';
        const storeId2 = 'test-store-2';

        const apiResponse1: ApiResponse = { items: [] };
        const apiResponse2: ApiResponse = {
            header: 'invalid' as unknown as Record<string, unknown>,
            items: [],
        };

        expect(() => validateHeader(apiResponse1, storeId1, 'header1')).toThrow();
        expect(() => validateHeader(apiResponse2, storeId2, 'header2')).toThrow();

        const errorStore1 = useErrorHandlerStore(storeId1);
        const errorStore2 = useErrorHandlerStore(storeId2);

        expect(errorStore1.errors).toHaveLength(1);
        expect(errorStore2.errors).toHaveLength(1);
        expect(errorStore1.errors[0]?.key).toBe('header1');
        expect(errorStore2.errors[0]?.key).toBe('header2');
    });

    it('should preserve header data in error metadata when validation fails', () => {
        const errorStoreId = 'test-store-preserve';
        const invalidHeader = 'string-header';
        const apiResponse: ApiResponse = {
            header: invalidHeader as unknown as Record<string, unknown>,
            items: [],
        };

        expect(() => {
            validateHeader(apiResponse, errorStoreId, TEST_HEADER_KEY);
        }).toThrow();

        const errorStore = useErrorHandlerStore(errorStoreId);
        const firstError = errorStore.errors[0];

        expect(firstError?.metadata?.receivedValue).toBe(invalidHeader);
    });

    it('should validate header with only undefined is missing (should fail)', () => {
        const apiResponse: ApiResponse = {
            header: undefined,
            items: [],
        };

        expect(() => {
            validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);
        }).toThrow('Header field is required in API response');
    });
});
