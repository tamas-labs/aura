import { describe, it, expect, beforeEach } from 'vitest';
import { validateFooterSettings } from '../footer-settings.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';
import { createPinia, setActivePinia } from 'pinia';

const TEST_STORE_ID = 'test-store';
const TEST_KEY = 'response.footer.settings';

describe('validateFooterSettings', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('valid cases', () => {
        it('should return undefined when settings is missing', () => {
            const result = validateFooterSettings({}, TEST_STORE_ID, TEST_KEY);
            expect(result).toBeUndefined();
        });

        it('should return null when settings is null', () => {
            const result = validateFooterSettings({ settings: null }, TEST_STORE_ID, TEST_KEY);
            expect(result).toBeNull();
        });

        it('should return undefined when settings is undefined', () => {
            const result = validateFooterSettings({ settings: undefined }, TEST_STORE_ID, TEST_KEY);
            expect(result).toBeUndefined();
        });

        it('should validate and return valid settings with sticky only', () => {
            const footer = {
                settings: {
                    sticky: true,
                },
            };

            const result = validateFooterSettings(footer, TEST_STORE_ID, TEST_KEY);
            expect(result).toEqual({ sticky: true });
        });

        it('should validate and return valid settings with height only', () => {
            const footer = {
                settings: {
                    height: 'auto',
                },
            };

            const result = validateFooterSettings(footer, TEST_STORE_ID, TEST_KEY);
            expect(result).toEqual({ height: 'auto', sticky: false });
        });

        it('should validate and return valid settings with both properties', () => {
            const footer = {
                settings: {
                    sticky: true,
                    height: '100px',
                },
            };

            const result = validateFooterSettings(footer, TEST_STORE_ID, TEST_KEY);
            expect(result).toEqual({
                sticky: true,
                height: '100px',
            });
        });

        it('should strip unknown properties from settings', () => {
            const footer = {
                settings: {
                    sticky: true,
                    unknownProp: 'should be removed',
                    extraField: 123,
                },
            };

            const result = validateFooterSettings(footer, TEST_STORE_ID, TEST_KEY);
            expect(result).toEqual({ sticky: true });
            expect(result).not.toHaveProperty('unknownProp');
            expect(result).not.toHaveProperty('extraField');
        });

        it('should strip searchableItems if provided (footer does not support it)', () => {
            const footer = {
                settings: {
                    sticky: true,
                    searchableItems: ['id', 'name'],
                },
            };

            const result = validateFooterSettings(
                footer as unknown as Record<string, unknown>,
                TEST_STORE_ID,
                TEST_KEY
            );
            expect(result).toEqual({ sticky: true });
            expect(result).not.toHaveProperty('searchableItems');
        });

        it('should handle null sticky value', () => {
            const footer = {
                settings: {
                    sticky: null,
                    height: '50px',
                },
            };

            const result = validateFooterSettings(
                footer as unknown as Record<string, unknown>,
                TEST_STORE_ID,
                TEST_KEY
            );
            expect(result).toEqual({ sticky: null, height: '50px' });
        });

        it('should handle null height value', () => {
            const footer = {
                settings: {
                    sticky: true,
                    height: null,
                },
            };

            const result = validateFooterSettings(
                footer as unknown as Record<string, unknown>,
                TEST_STORE_ID,
                TEST_KEY
            );
            expect(result).toEqual({ sticky: true, height: null });
        });
    });

    describe('invalid cases', () => {
        it('should throw error when sticky is invalid type (string)', () => {
            const footer = {
                settings: {
                    sticky: 'true',
                },
            };

            expect(() => {
                validateFooterSettings(
                    footer as unknown as Record<string, unknown>,
                    TEST_STORE_ID,
                    TEST_KEY
                );
            }).toThrow(/Footer settings validation failed/);

            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            expect(errorStore.hasErrors).toBe(true);
            expect(errorStore.errors[0]).toBeDefined();
            expect(errorStore.errors[0]?.component).toBe('FooterSettingsValidator');
            expect(errorStore.errors[0]?.type).toBe('validation');
            expect(errorStore.errors[0]?.key).toBe(`${TEST_KEY}.settings`);
        });

        it('should throw error when height is invalid type (number)', () => {
            const footer = {
                settings: {
                    height: 100,
                },
            };

            expect(() => {
                validateFooterSettings(
                    footer as unknown as Record<string, unknown>,
                    TEST_STORE_ID,
                    TEST_KEY
                );
            }).toThrow(/Footer settings validation failed/);

            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            expect(errorStore.hasErrors).toBe(true);
            expect(errorStore.errors[0]).toBeDefined();
            expect(errorStore.errors[0]?.component).toBe('FooterSettingsValidator');
        });

        it('should throw error when settings is not an object (string)', () => {
            const footer = {
                settings: 'invalid',
            };

            expect(() => {
                validateFooterSettings(
                    footer as unknown as Record<string, unknown>,
                    TEST_STORE_ID,
                    TEST_KEY
                );
            }).toThrow(/Footer settings validation failed/);

            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            expect(errorStore.hasErrors).toBe(true);
        });

        it('should throw error when settings is not an object (number)', () => {
            const footer = {
                settings: 123,
            };

            expect(() => {
                validateFooterSettings(
                    footer as unknown as Record<string, unknown>,
                    TEST_STORE_ID,
                    TEST_KEY
                );
            }).toThrow(/Footer settings validation failed/);
        });

        it('should throw error when settings is not an object (array)', () => {
            const footer = {
                settings: [],
            };

            expect(() => {
                validateFooterSettings(
                    footer as unknown as Record<string, unknown>,
                    TEST_STORE_ID,
                    TEST_KEY
                );
            }).toThrow(/Footer settings validation failed/);
        });
    });

    describe('edge cases', () => {
        it('should handle empty settings object', () => {
            const footer = {
                settings: {},
            };

            const result = validateFooterSettings(footer, TEST_STORE_ID, TEST_KEY);
            expect(result).toEqual({ sticky: false });
        });

        it('should add error to store with correct metadata', () => {
            const errorStoreId = 'test-error-metadata';
            const footer = {
                settings: {
                    sticky: 'invalid',
                },
            };

            expect(() => {
                validateFooterSettings(
                    footer as unknown as Record<string, unknown>,
                    errorStoreId,
                    TEST_KEY
                );
            }).toThrow();

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors).toHaveLength(1);

            const error = errorStore.errors[0];
            expect(error).toBeDefined();
            expect(error?.component).toBe('FooterSettingsValidator');
            expect(error?.message).toBe('Invalid footer settings structure');
            expect(error?.severity).toBe('warning');
            expect(error?.type).toBe('validation');
        });

        it('should not throw when settings has both null values', () => {
            const footer = {
                settings: {
                    sticky: null,
                    height: null,
                },
            };

            expect(() => {
                validateFooterSettings(
                    footer as unknown as Record<string, unknown>,
                    TEST_STORE_ID,
                    TEST_KEY
                );
            }).not.toThrow();
        });
    });
});
