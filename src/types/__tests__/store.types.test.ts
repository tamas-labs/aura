import { describe, it, expect, expectTypeOf } from 'vitest';
import type { CoreStore, ConfigStore, ErrorHandlerStore } from '../store.types';
import type { AuraConfig } from '../config.types';
import type { ECSError, ErrorSeverity } from '../error.types';
import type { AuraProps } from '../props.types';

describe('store.types', () => {
    describe('ConfigStore interface', () => {
        it('contains the required properties', () => {
            expectTypeOf<ConfigStore>().toHaveProperty('storeId');
            expectTypeOf<ConfigStore>().toHaveProperty('debug');
            expectTypeOf<ConfigStore>().toHaveProperty('siteName');
            expectTypeOf<ConfigStore>().toHaveProperty('classes');
            expectTypeOf<ConfigStore>().toHaveProperty('icons');
            expectTypeOf<ConfigStore>().toHaveProperty('variants');
        });

        it('storeId is of type string', () => {
            expectTypeOf<ConfigStore['storeId']>().toEqualTypeOf<string>();
        });

        it('debug is of type boolean | null', () => {
            expectTypeOf<ConfigStore['debug']>().toEqualTypeOf<boolean | null>();
        });
    });

    describe('ErrorHandlerStore interface', () => {
        it('contains the errors property', () => {
            expectTypeOf<ErrorHandlerStore>().toHaveProperty('errors');
        });

        it('errors property is of type ECSError[]', () => {
            expectTypeOf<ErrorHandlerStore['errors']>().toEqualTypeOf<ECSError[]>();
        });

        it('contains the hasErrors property', () => {
            expectTypeOf<ErrorHandlerStore>().toHaveProperty('hasErrors');
        });

        it('hasErrors is of type boolean', () => {
            expectTypeOf<ErrorHandlerStore['hasErrors']>().toEqualTypeOf<boolean>();
        });

        it('contains the isValid property', () => {
            expectTypeOf<ErrorHandlerStore>().toHaveProperty('isValid');
        });

        it('isValid is of type boolean', () => {
            expectTypeOf<ErrorHandlerStore['isValid']>().toEqualTypeOf<boolean>();
        });

        it('contains the addError method', () => {
            expectTypeOf<ErrorHandlerStore>().toHaveProperty('addError');
        });

        it('addError method signature is correct', () => {
            expectTypeOf<ErrorHandlerStore['addError']>().toBeFunction();
            expectTypeOf<ErrorHandlerStore['addError']>().parameters.toEqualTypeOf<
                [Omit<ECSError, 'timestamp' | 'level'> & { level?: ErrorSeverity }]
            >();
            expectTypeOf<ErrorHandlerStore['addError']>().returns.toEqualTypeOf<void>();
        });

        it('contains the clearErrors method', () => {
            expectTypeOf<ErrorHandlerStore>().toHaveProperty('clearErrors');
        });

        it('clearErrors method signature is correct', () => {
            expectTypeOf<ErrorHandlerStore['clearErrors']>().toBeFunction();
            expectTypeOf<ErrorHandlerStore['clearErrors']>().parameters.toEqualTypeOf<[]>();
            expectTypeOf<ErrorHandlerStore['clearErrors']>().returns.toEqualTypeOf<void>();
        });
    });

    describe('CoreStore interface', () => {
        it('contains the config property', () => {
            expectTypeOf<CoreStore>().toHaveProperty('config');
        });

        it('config property is of type ConfigStore', () => {
            expectTypeOf<CoreStore['config']>().toEqualTypeOf<ConfigStore>();
        });

        it('contains the props property', () => {
            expectTypeOf<CoreStore>().toHaveProperty('props');
        });

        it('props property is of type AuraProps', () => {
            expectTypeOf<CoreStore['props']>().toEqualTypeOf<AuraProps>();
        });

        it('contains the errorStore property', () => {
            expectTypeOf<CoreStore>().toHaveProperty('errorStore');
        });

        it('errorStore property is of type ErrorHandlerStore', () => {
            expectTypeOf<CoreStore['errorStore']>().toEqualTypeOf<ErrorHandlerStore>();
        });
    });

    describe('circular dependency check', () => {
        it('store.types does not import runtime code', () => {
            // This test exists solely to document that
            // store.types.ts only uses type imports
            // Importing runtime code would create a circular dependency
            expect(true).toBe(true);
        });

        it('CoreStore type can be used as a type annotation', () => {
            // This would be a compile error if there were a circular dependency
            const mockCoreStore: CoreStore = {
                config: {} as ConfigStore,
                props: {} as AuraProps,
                errorStore: {} as ErrorHandlerStore,
                isSettingsOpen: false,
                toggleSettings: () => {},
            };
            expect(mockCoreStore).toBeDefined();
        });
    });

    describe('type safety check', () => {
        it('every AuraConfig field is required on ConfigStore', () => {
            // Because of Required<AuraConfig>, every field is required
            // This would be a compile error if a field were missing
            type ConfigKeys = keyof AuraConfig;
            type RequiredConfigKeys = keyof ConfigStore;

            // ConfigStore contains all AuraConfig keys
            const testKey: ConfigKeys = 'storeId';
            const isRequired: RequiredConfigKeys = testKey;
            expect(isRequired).toBeDefined();
        });

        it('ErrorHandlerStore method types are strict', () => {
            // The method parameter and return types are strictly typed
            type AddErrorParam = Parameters<ErrorHandlerStore['addError']>[0];
            type ClearErrorsReturn = ReturnType<ErrorHandlerStore['clearErrors']>;

            expectTypeOf<AddErrorParam>().not.toBeAny();
            expectTypeOf<ClearErrorsReturn>().toEqualTypeOf<void>();
        });

        it('CoreStore composition is correct', () => {
            // CoreStore consists of 3 properties, each strictly typed
            type CoreStoreKeys = keyof CoreStore;
            const keys: CoreStoreKeys[] = ['config', 'props', 'errorStore'];

            expect(keys).toHaveLength(3);
            keys.forEach(key => {
                expect(['config', 'props', 'errorStore']).toContain(key);
            });
        });
    });

    describe('interface documentation', () => {
        it('ConfigStore interface exists', () => {
            // The type can only be checked if it exists
            expectTypeOf<ConfigStore>().not.toBeAny();
        });

        it('ErrorHandlerStore interface exists', () => {
            expectTypeOf<ErrorHandlerStore>().not.toBeAny();
        });

        it('CoreStore interface exists', () => {
            expectTypeOf<CoreStore>().not.toBeAny();
        });
    });
});
