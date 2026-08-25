import { describe, it, expect, beforeEach } from 'vitest';
import { validateFooter } from '../footer.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';
import { createPinia, setActivePinia } from 'pinia';
import type { ApiResponse } from '../../../../../types/api-response.types';

const TEST_STORE_ID = 'test-store';
const TEST_FOOTER_KEY = 'response.footer';
const FOOTER_VALIDATION_ERROR = 'Footer validation failed';

describe('validateFooter', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('valid cases', () => {
        it('should return undefined when footer is missing (footer is optional)', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                items: [],
            };

            const result = validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            expect(result).toBeUndefined();
        });

        it('should return undefined when footer is undefined (footer is optional)', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                items: [],
                footer: undefined,
            };

            const result = validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            expect(result).toBeUndefined();
        });

        it('should validate successfully for valid footer with rows only', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: { rows: [{ cells: [{ content: 'Total', field: 'total', key: 'total' }] }] },
                items: [],
            };

            const result = validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            expect(result).toBeDefined();
            expect(result?.rows).toBeDefined();
            expect(result?.rows).toHaveLength(1);
        });

        it('should validate successfully for valid footer with rows and settings', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: {
                    rows: [{ cells: [{ content: 'Total', field: 'total', key: 'total' }] }],
                    settings: { sticky: true, height: 'auto' },
                },
                items: [],
            };

            const result = validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            expect(result).toBeDefined();
            expect(result?.rows).toHaveLength(1);
            expect(result?.settings).toEqual({ sticky: true, height: 'auto' });
        });

        it('should return sanitized footer without unknown fields', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: {
                    rows: [{ cells: [{ content: 'Total', field: 'total', key: 'total' }] }],
                    unknownProp: 'should be stripped',
                    extraField: 123,
                },
                items: [],
            };

            const result = validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            expect(result).not.toHaveProperty('unknownProp');
            expect(result).not.toHaveProperty('extraField');
            expect(result?.rows).toBeDefined();
        });

        it('should validate footer with multiple rows', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: {
                    rows: [
                        { cells: [{ content: 'Subtotal', field: 'subtotal', key: 'subtotal' }] },
                        { cells: [{ content: 'Total', field: 'total', key: 'total' }] },
                    ],
                },
                items: [],
            };

            const result = validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            expect(result?.rows).toHaveLength(2);
        });

        it('should validate footer with null settings', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: {
                    rows: [{ cells: [{ content: 'Total', field: 'total', key: 'total' }] }],
                    settings: null,
                },
                items: [],
            };

            const result = validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            expect(result).toBeDefined();
            // Settings null should be preserved (not converted to undefined)
            expect(result?.settings).toBeNull();
        });
    });

    describe('invalid cases', () => {
        it('should throw error for empty footer object (missing rows)', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: {},
                items: [],
            };

            expect(() => {
                validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            }).toThrow(FOOTER_VALIDATION_ERROR);
        });

        it('should throw error and add to error store when footer is null', () => {
            const errorStoreId = 'test-store-null-footer';
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: null as unknown as Record<string, unknown>,
                items: [],
            };

            expect(() => {
                validateFooter(apiResponse, errorStoreId, TEST_FOOTER_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.hasErrors).toBe(true);
            expect(errorStore.errors).toHaveLength(1);

            const firstError = errorStore.errors[0];
            expect(firstError).toBeDefined();
            expect(firstError?.severity).toBe('warning');
            expect(firstError?.component).toBe('FooterValidator');
            expect(firstError?.type).toBe('validation');
            expect(firstError?.key).toBe(TEST_FOOTER_KEY);
        });

        it('should throw error when footer is not an object (string)', () => {
            const errorStoreId = 'test-store-string-footer';
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: 'invalid' as unknown as Record<string, unknown>,
                items: [],
            };

            expect(() => {
                validateFooter(apiResponse, errorStoreId, TEST_FOOTER_KEY);
            }).toThrow(FOOTER_VALIDATION_ERROR);

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.hasErrors).toBe(true);
        });

        it('should throw error when footer is not an object (number)', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: 123 as unknown as Record<string, unknown>,
                items: [],
            };

            expect(() => {
                validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            }).toThrow(FOOTER_VALIDATION_ERROR);
        });

        it('should throw error when footer is not an object (array)', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: [] as unknown as Record<string, unknown>,
                items: [],
            };

            expect(() => {
                validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            }).toThrow(FOOTER_VALIDATION_ERROR);
        });

        it('should throw error when footer has empty rows array', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: { rows: [] },
                items: [],
            };

            expect(() => {
                validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            }).toThrow(/must contain at least one row/);
        });

        it('should throw error when rows is not an array', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: { rows: 'invalid' as unknown as [] },
                items: [],
            };

            expect(() => {
                validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            }).toThrow(FOOTER_VALIDATION_ERROR);
        });
    });

    describe('edge cases', () => {
        it('should handle footer with settings but invalid settings structure', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: {
                    rows: [{ cells: [{ content: 'Total', field: 'total', key: 'total' }] }],
                    settings: { sticky: 'invalid' } as unknown as Record<string, unknown>,
                },
                items: [],
            };

            expect(() => {
                validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            }).toThrow(FOOTER_VALIDATION_ERROR);
        });

        it('should use correct key for row validation errors', () => {
            const errorStoreId = 'test-store-row-validation';
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: { rows: [] },
                items: [],
            };

            expect(() => {
                validateFooter(apiResponse, errorStoreId, TEST_FOOTER_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.hasErrors).toBe(true);
            // Error message should mention 'Footer' not 'Header'
            const error = errorStore.errors[0];
            expect(error?.component).toBe('FooterValidator');
        });

        it('should not throw error when footer is falsy but not explicitly present', () => {
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                items: [],
            };

            const result = validateFooter(apiResponse, TEST_STORE_ID, TEST_FOOTER_KEY);
            expect(result).toBeUndefined();

            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            expect(errorStore.hasErrors).toBe(false);
        });

        it('should error metadata contain correct component name', () => {
            const errorStoreId = 'test-store-component-name';
            const apiResponse: ApiResponse = {
                header: { rows: [{ cells: [{ content: 'ID', field: 'id', key: 'id' }] }] },
                footer: { rows: 'invalid' as unknown as [] },
                items: [],
            };

            expect(() => {
                validateFooter(apiResponse, errorStoreId, TEST_FOOTER_KEY);
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            const error = errorStore.errors[0];
            expect(error?.component).toBe('FooterValidator');
            expect(error?.message).toBe('Invalid footer structure in API response');
        });
    });
});
