import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useConfigStore } from '../../core/config.state';
import { defaultConfigLib } from '../../../lib/default-config.lib';
import type { AuraConfig } from '../../../types/config.types';

describe('useConfigStore', () => {
    const storeId = 'test-config-store';
    const errorHandlerStoreId = 'test-error-handler';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('initialization with default config', () => {
        it('should create config store with default values', () => {
            const configStore = useConfigStore(storeId, defaultConfigLib, errorHandlerStoreId);

            expect(configStore.debug).toBe(false);
            expect(configStore.siteName).toBeDefined();
            expect(configStore.href).toBeDefined();
            expect(configStore.rowsNumber).toBe(10);
            expect(configStore.paginateValues).toEqual([5, 10, 25, 50, 100]);
            expect(configStore.showFooter).toBe(true);
            expect(configStore.externalPaginator).toBe(false);
            expect(configStore.showHeaderSearch).toBe(false);
            expect(configStore.showLoadingOverlay).toBe(true);
            expect(configStore.showToolbarTitle).toBe(true);
            expect(configStore.toolbarTitleContent).toBe('');
        });

        it('should validate and store classes', () => {
            const configStore = useConfigStore(storeId, defaultConfigLib, errorHandlerStoreId);

            expect(configStore.classes).toBeDefined();
            expect(typeof configStore.classes).toBe('object');
            expect(configStore.classes).toHaveProperty('table');
        });

        it('should validate and store icons', () => {
            const configStore = useConfigStore(storeId, defaultConfigLib, errorHandlerStoreId);

            expect(configStore.icons).toBeDefined();
            expect(typeof configStore.icons).toBe('object');
            expect(configStore.icons).toHaveProperty('filterable');
        });

        it('should validate and store variants', () => {
            const configStore = useConfigStore(storeId, defaultConfigLib, errorHandlerStoreId);

            expect(configStore.variants).toBeDefined();
            expect(typeof configStore.variants).toBe('object');
            expect(configStore.variants).toHaveProperty('primary');
        });
    });

    describe('sessionKey', () => {
        it('should default to null (key derived from the storeId)', () => {
            const configStore = useConfigStore(storeId, defaultConfigLib, errorHandlerStoreId);

            expect(configStore.sessionKey).toBeNull();
        });

        it('should accept an explicit sessionKey', () => {
            const configStore = useConfigStore(
                storeId,
                { ...defaultConfigLib, sessionKey: 'users-state' },
                errorHandlerStoreId
            );

            expect(configStore.sessionKey).toBe('users-state');
        });

        // `validateString` has no entry for sessionKey in its `defaults` map, so an
        // invalid value falls back to '' — which `generateSessionKey` treats as "not
        // set" and resolves to the storeId-derived key.
        it('should reject a non-string sessionKey', () => {
            const configStore = useConfigStore(
                storeId,
                { ...defaultConfigLib, sessionKey: 42 as never },
                errorHandlerStoreId
            );

            expect(configStore.sessionKey).toBe('');
        });
    });

    describe('initialization with custom config', () => {
        it('should accept custom rowsNumber', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                rowsNumber: 25,
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.rowsNumber).toBe(25);
        });

        it('should accept custom paginateValues', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                paginateValues: [10, 20, 30],
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.paginateValues).toEqual([10, 20, 30]);
        });

        it('should accept custom boolean flags', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                debug: true,
                showFooter: false,
                externalPaginator: true,
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.debug).toBe(true);
            expect(configStore.showFooter).toBe(false);
            expect(configStore.externalPaginator).toBe(true);
        });

        it('should accept custom siteName', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                siteName: 'Custom Site Name',
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.siteName).toBe('Custom Site Name');
        });

        it('should accept siteToken as boolean', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                siteToken: true,
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.siteToken).toBe(true);
        });

        it('should accept siteToken as string', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                siteToken: 'my-secret-token',
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.siteToken).toBe('my-secret-token');
        });
    });

    describe('validation behavior', () => {
        it('should validate urlParameter', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                urlParameter: 'custom-parameter',
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.urlParameter).toBe('custom-parameter');
        });

        it('should validate urlParameterLastSegment', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                urlParameterLastSegment: 'api-endpoint',
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.urlParameterLastSegment).toBe('api-endpoint');
        });

        it('should validate urlStructure', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                urlStructure: '{siteName}/custom/{urlParameter}',
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.urlStructure).toBe('{siteName}/custom/{urlParameter}');
        });

        it('should validate and store resources flag', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                resources: true,
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.resources).toBe(true);
        });

        it('should validate and store disableSession flag', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                disableSession: true,
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.disableSession).toBe(true);
        });

        it('should validate and store allowExternalApi flag', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                allowExternalApi: true,
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.allowExternalApi).toBe(true);
        });

        it('should expose default rawHtml whitelist (style engedélyezett)', () => {
            const configStore = useConfigStore(storeId, defaultConfigLib, errorHandlerStoreId);

            expect(configStore.rawHtmlAllowedTags).toContain('b');
            expect(configStore.rawHtmlAllowedAttr).toContain('style');
            expect(configStore.rawHtmlAllowDataAttr).toBe(true);
        });

        it('should validate and store custom rawHtml whitelist', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                rawHtmlAllowedTags: ['b', 'i'],
                rawHtmlAllowedAttr: ['class'],
                rawHtmlAllowDataAttr: false,
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.rawHtmlAllowedTags).toEqual(['b', 'i']);
            expect(configStore.rawHtmlAllowedAttr).toEqual(['class']);
            expect(configStore.rawHtmlAllowDataAttr).toBe(false);
        });

        it('should fall back to defaults for invalid rawHtmlAllowedTags', () => {
            const customConfig = {
                ...defaultConfigLib,
                rawHtmlAllowedTags: 'not-an-array',
            } as unknown as AuraConfig;
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(Array.isArray(configStore.rawHtmlAllowedTags)).toBe(true);
            expect(configStore.rawHtmlAllowedTags).toContain('b');
        });

        it('should validate and store errorReporting flag', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                errorReporting: true,
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.errorReporting).toBe(true);
        });
    });

    describe('header settings validation', () => {
        it('should validate actionButtons', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                actionButtons: ['refresh'],
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.actionButtons).toEqual(['refresh']);
        });

        it('should validate showHeaderSearch', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                showHeaderSearch: true,
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.showHeaderSearch).toBe(true);
        });

        it('should validate showLoadingOverlay', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                showLoadingOverlay: false,
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.showLoadingOverlay).toBe(false);
        });

        it('should validate showToolbarTitle', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                showToolbarTitle: true,
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.showToolbarTitle).toBe(true);
        });

        it('should validate toolbarTitleContent', () => {
            const customConfig: AuraConfig = {
                ...defaultConfigLib,
                toolbarTitleContent: 'Custom Title',
            };
            const configStore = useConfigStore(storeId, customConfig, errorHandlerStoreId);

            expect(configStore.toolbarTitleContent).toBe('Custom Title');
        });
    });
});
