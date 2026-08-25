import { describe, it, expect, beforeEach } from 'vitest';
import { validateHeaderSettings } from '../header-settings.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';
import { createPinia, setActivePinia } from 'pinia';
import type { HeaderRow } from '../../../../../types/api-response.types';

const TEST_STORE_ID = 'test-store';
const TEST_KEY = 'response.header.settings';

describe('validateHeaderSettings', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should pass validation when settings is missing', () => {
        expect(() => {
            validateHeaderSettings({}, TEST_STORE_ID, TEST_KEY);
        }).not.toThrow();
    });

    it('should pass validation when settings is null', () => {
        expect(() => {
            validateHeaderSettings({ settings: null }, TEST_STORE_ID, TEST_KEY);
        }).not.toThrow();
    });

    it('should pass validation when settings is undefined', () => {
        expect(() => {
            validateHeaderSettings(
                { settings: undefined as unknown as Record<string, unknown> },
                TEST_STORE_ID,
                TEST_KEY
            );
        }).not.toThrow();
    });

    it('should pass validation with valid settings', () => {
        const header = {
            settings: {
                sticky: true,
                height: 'auto',
            },
        };

        expect(() => {
            validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY);
        }).not.toThrow();
    });

    it('should throw error and add to store when sticky is invalid', () => {
        const header = {
            settings: {
                sticky: 'true', // Invalid: string instead of boolean
            },
        };

        expect(() => {
            validateHeaderSettings(
                header as unknown as Record<string, unknown>,
                TEST_STORE_ID,
                TEST_KEY
            );
        }).toThrow(/Header settings validation failed/);

        const errorStore = useErrorHandlerStore(TEST_STORE_ID);
        expect(errorStore.hasErrors).toBe(true);
        expect(errorStore.errors[0]).toBeDefined();
        expect(errorStore.errors[0]?.component).toBe('HeaderSettingsValidator');
        expect(errorStore.errors[0]?.key).toBe(TEST_KEY);
    });

    it('should throw error and add to store when height is invalid', () => {
        const header = {
            settings: {
                height: 100, // Invalid: number instead of string
            },
        };

        expect(() => {
            validateHeaderSettings(
                header as unknown as Record<string, unknown>,
                TEST_STORE_ID,
                TEST_KEY
            );
        }).toThrow(/Header settings validation failed/);

        const errorStore = useErrorHandlerStore(TEST_STORE_ID);
        expect(errorStore.hasErrors).toBe(true);
        expect(errorStore.errors[0]).toBeDefined();
    });

    it('should throw error when settings is not an object', () => {
        const header = {
            settings: 'invalid', // Invalid: string instead of object
        };

        expect(() => {
            validateHeaderSettings(
                header as unknown as Record<string, unknown>,
                TEST_STORE_ID,
                TEST_KEY
            );
        }).toThrow(/Header settings validation failed/);

        const errorStore = useErrorHandlerStore(TEST_STORE_ID);
        expect(errorStore.hasErrors).toBe(true);
        expect(errorStore.errors[0]).toBeDefined();
    });

    describe('searchableItems validation', () => {
        const validRows: HeaderRow[] = [
            {
                cells: [
                    { field: 'id', content: 'ID', key: 'id' },
                    { field: 'name', content: 'Name', key: 'name' },
                    { field: 'email', content: 'Email', key: 'email' },
                ],
            },
        ];

        it('should pass when searchableItems are all valid fields', () => {
            const header = {
                settings: {
                    searchableItems: ['id', 'name'],
                },
            };

            expect(() => {
                validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY, validRows);
            }).not.toThrow();
        });

        it('should pass when searchableItems contains one valid field', () => {
            const header = {
                settings: {
                    searchableItems: ['id'],
                },
            };

            expect(() => {
                validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY, validRows);
            }).not.toThrow();
        });

        it('should pass when searchableItems contains all available fields', () => {
            const header = {
                settings: {
                    searchableItems: ['id', 'name', 'email'],
                },
            };

            expect(() => {
                validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY, validRows);
            }).not.toThrow();
        });

        it('should pass when no searchableItems provided', () => {
            const header = {
                settings: {
                    sticky: true,
                },
            };

            expect(() => {
                validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY, validRows);
            }).not.toThrow();
        });

        it('should throw when searchableItems contains invalid field', () => {
            const header = {
                settings: {
                    searchableItems: ['id', 'invalid_field'],
                },
            };

            expect(() => {
                validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY, validRows);
            }).toThrow(/Invalid searchable items/);

            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            expect(errorStore.hasErrors).toBe(true);
            expect(errorStore.errors[0]).toBeDefined();
            expect(errorStore.errors[0]?.component).toBe('HeaderSettingsValidator');
            expect(errorStore.errors[0]?.key).toBe(`${TEST_KEY}.searchableItems`);
        });

        it('should throw when searchableItems contains multiple invalid fields', () => {
            const header = {
                settings: {
                    searchableItems: ['invalid1', 'invalid2'],
                },
            };

            expect(() => {
                validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY, validRows);
            }).toThrow(/Invalid searchable items/);

            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            expect(errorStore.hasErrors).toBe(true);
        });

        it('should throw when searchableItems contains mix of valid and invalid fields', () => {
            const header = {
                settings: {
                    searchableItems: ['id', 'invalid', 'name'],
                },
            };

            expect(() => {
                validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY, validRows);
            }).toThrow(/Invalid searchable items/);

            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            expect(errorStore.hasErrors).toBe(true);
        });

        it('should handle empty rows array', () => {
            const header = {
                settings: {
                    searchableItems: ['id'],
                },
            };

            expect(() => {
                validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY, []);
            }).toThrow(/Invalid searchable items/);

            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            expect(errorStore.hasErrors).toBe(true);
        });

        it('should handle rows without cells', () => {
            const rowsWithoutCells: HeaderRow[] = [{ cells: undefined }];
            const header = {
                settings: {
                    searchableItems: ['id'],
                },
            };

            expect(() => {
                validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY, rowsWithoutCells);
            }).toThrow(/Invalid searchable items/);
        });

        it('should handle cells without field property', () => {
            const rowsWithoutField: HeaderRow[] = [
                {
                    cells: [{ content: 'ID', key: 'id' }],
                },
            ];
            const header = {
                settings: {
                    searchableItems: ['id'],
                },
            };

            expect(() => {
                validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY, rowsWithoutField);
            }).toThrow(/Invalid searchable items/);
        });

        it('should handle multiple rows with different fields', () => {
            const multipleRows: HeaderRow[] = [
                {
                    cells: [
                        { field: 'id', content: 'ID', key: 'id' },
                        { field: 'name', content: 'Name', key: 'name' },
                    ],
                },
                {
                    cells: [
                        { field: 'email', content: 'Email', key: 'email' },
                        { field: 'status', content: 'Status', key: 'status' },
                    ],
                },
            ];

            const header = {
                settings: {
                    searchableItems: ['id', 'status'],
                },
            };

            expect(() => {
                validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY, multipleRows);
            }).not.toThrow();
        });

        it('should validate searchableItems case-sensitively', () => {
            const header = {
                settings: {
                    searchableItems: ['ID'], // uppercase, but field is lowercase 'id'
                },
            };

            expect(() => {
                validateHeaderSettings(header, TEST_STORE_ID, TEST_KEY, validRows);
            }).toThrow(/Invalid searchable items/);
        });
    });
});
