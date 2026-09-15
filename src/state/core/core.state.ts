import { defineStore, getActivePinia } from 'pinia';
import { getCurrentInstance, ref } from 'vue';
import type { AuraProps } from '../../types';
import type { AuraConfig } from '../../types/config.types';
import type { SearchPrefillRequest, SearchPrefillTarget } from '../../types/store.types';
import { defaultConfigLib } from '../../lib/default-config.lib';
import { useErrorHandlerStore } from './error-handler.state';
import { useConfigStore } from './config.state';

/**
 * Core Store factory
 * @param storeId - Unique store identifier
 * @param props - Full Aura props object
 * @returns Pinia store instance
 *
 * @remarks
 * The core store contains the core config merge logic and integrates two stores:
 * - errorStore: dedicated error handler store (useErrorHandlerStore) for handling errors across the whole body
 * - config: dedicated config store (useConfigStore) with the validated config values
 *
 * The config store holds every validated config value as a ref.
 * The error functions are accessible via the errorStore property.
 */
export const useCoreStore = (storeId: string, props: AuraProps) => {
    return defineStore(storeId, () => {
        // Define the error handler store identifier
        const errorHandlerStoreId = `${storeId}-errors`;

        // Read the global config from the Vue app instance
        const instance = getCurrentInstance();
        const globalConfig =
            (instance?.appContext.config.globalProperties.$aura as AuraConfig) || {};

        // Config merge: defaultConfigLib < globalConfig
        // The global config overrides the default config values
        const mergedConfig = { ...defaultConfigLib, ...globalConfig } as AuraConfig;

        // Only the props that were actually passed (not undefined values)
        // For Boolean props, default: undefined ensures only the actually-passed values are included
        const explicitProps = Object.fromEntries(
            Object.entries(props).filter(([_, value]) => value !== undefined)
        ) as Partial<AuraProps>;

        // Config merge: globalConfig < explicitProps (only explicitly passed, not Vue defaults)
        // The props override the global config values
        const mergedConfigAndProps = { ...mergedConfig, ...explicitProps } as AuraConfig;

        // Load the error handler store with the merged config (for error reporting settings)
        const errorStore = useErrorHandlerStore(errorHandlerStoreId, mergedConfigAndProps);

        // Define the config store identifier
        const configStoreId = `${storeId}-config`;

        // Load the config store - with validated config values
        const configStore = useConfigStore(
            configStoreId,
            mergedConfigAndProps,
            errorHandlerStoreId
        );

        // UI state: Settings panel
        const isSettingsOpen = ref(false);

        const toggleSettings = () => {
            isSettingsOpen.value = !isSettingsOpen.value;
        };

        // UI state: a search input pre-fill asked for by a Shift+clicked body cell. It is
        // the input's text only — nothing here reaches the query, the session or a badge.
        const searchPrefill = ref<SearchPrefillRequest | null>(null);
        let lastPrefillId = 0;

        const requestSearchPrefill = (target: SearchPrefillTarget) => {
            lastPrefillId += 1;
            searchPrefill.value = { ...target, id: lastPrefillId };
        };

        return {
            // Access to the config store (contains all validated config values)
            config: configStore,
            props,

            // Access to the error handler store
            errorStore,

            // UI state
            isSettingsOpen,
            toggleSettings,
            searchPrefill,
            requestSearchPrefill,
        };
    })();
};

/**
 * The props object handed to `useCoreStore` when only reading an already-initialized store.
 *
 * Pinia caches per store id, so the setup — and with it this object — is never used once the
 * root component has created the store. A single shared constant keeps that fact in one place
 * instead of 19 inline `{} as AuraProps` casts.
 */
const NO_PROPS = {} as AuraProps;

/**
 * Read-only accessor for an already-initialized core store.
 *
 * @param storeId - The store identifier the root component was mounted with
 * @returns The existing Pinia store instance
 *
 * @remarks
 * Child components do not own the config — `Aura.tsx` creates the core store from the real
 * props, and every child only ever reads it back. `useCoreStore(storeId, props)` is the wrong
 * signature for that job: it demands props the caller does not have, which is why the call
 * sites used to pass `{} as AuraProps`. This accessor states the actual intent and keeps the
 * cast in exactly one place.
 *
 * If the store does not exist yet, the call still returns a usable (default-config) store so
 * the component can render, but reports a warning first — that situation means a child was
 * mounted outside its root, which is a wiring mistake worth surfacing rather than silently
 * papering over with an empty config.
 */
export const useExistingCoreStore = (storeId: string) => {
    const pinia = getActivePinia();

    // Only report when the absence is provable: no active pinia at all is a different
    // failure, and `useCoreStore` below raises Pinia's own (clearer) error for it.
    if (pinia && !(storeId in pinia.state.value)) {
        useErrorHandlerStore(`${storeId}-errors`).addError({
            severity: 'warning',
            component: 'CoreStore',
            action: 'read',
            type: 'client',
            message: `Core store "${storeId}" was read before it was initialized`,
            details:
                'A child component resolved the core store before the Aura root created it. ' +
                'The store falls back to the default config, so the rendered output may ignore ' +
                'the props and global config of this table.',
        });
    }

    return useCoreStore(storeId, NO_PROPS);
};
