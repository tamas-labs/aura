import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia, getActivePinia } from 'pinia';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { useErrorHandlerStore } from '../error-handler.state';
import type { AuraConfig } from '../../../types/config.types';

/**
 * Lifetime of the error reporter.
 *
 * The store setup runs once per `storeId` (Pinia caches the instance), so the
 * reporter must be tied to the store's own effect scope. Binding it to a
 * component lifecycle used to destroy it on the first unmount, after which every
 * further error was dropped in silence while `errorReporting` was still `true`.
 */
describe('error handler store — reporter lifecycle', () => {
    const STORE_ID = 'reporter-lifecycle-store';
    const ENDPOINT = 'https://errors.example.com/collect';
    const BATCH_SIZE = 10;

    const config: AuraConfig = {
        errorReporting: true,
        errorReportingEndpoint: ENDPOINT,
    };

    let fetchMock: ReturnType<typeof vi.fn>;

    /** A host component that creates the store from its own setup. */
    const Host = defineComponent({
        setup() {
            const store = useErrorHandlerStore(STORE_ID, config);
            return () => h('div', String(store.errors.length));
        },
    });

    /** Fill exactly one batch so the reporter flushes. */
    const reportOneBatch = (
        store: ReturnType<typeof useErrorHandlerStore>,
        label: string
    ): void => {
        for (let i = 0; i < BATCH_SIZE; i++) {
            store.addError({
                severity: 'error',
                component: 'Aura',
                action: 'fetch',
                type: 'network',
                message: `${label}-${i}`,
            });
        }
    };

    const settle = () => new Promise(resolve => setTimeout(resolve, 20));

    beforeEach(() => {
        setActivePinia(createPinia());
        fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should keep reporting after the host component unmounts and mounts again', async () => {
        const wrapper = mount(Host);
        const store = useErrorHandlerStore(STORE_ID);

        reportOneBatch(store, 'before');
        await settle();
        expect(fetchMock).toHaveBeenCalledTimes(1);

        wrapper.unmount();
        await settle();

        // Pinia hands back the cached store — with the old `onUnmounted` binding
        // its reporter was already destroyed at this point.
        mount(Host);
        reportOneBatch(store, 'after');
        await settle();

        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it('should not destroy the reporter on unmount alone', async () => {
        const wrapper = mount(Host);
        const store = useErrorHandlerStore(STORE_ID);

        wrapper.unmount();
        await settle();

        // No component is mounted at all now, yet reporting must still work.
        reportOneBatch(store, 'unmounted');
        await settle();

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should destroy the reporter when the store scope is disposed', async () => {
        mount(Host);
        const store = useErrorHandlerStore(STORE_ID);

        store.$dispose();
        await settle();

        reportOneBatch(store, 'disposed');
        await settle();

        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('should flush pending errors when the store scope is disposed', async () => {
        mount(Host);
        const store = useErrorHandlerStore(STORE_ID);

        // Half a batch — not enough to trigger a send on its own.
        store.addError({
            severity: 'error',
            component: 'Aura',
            action: 'fetch',
            type: 'network',
            message: 'pending',
        });
        expect(fetchMock).not.toHaveBeenCalled();

        store.$dispose();
        await settle();

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('should not emit a Vue lifecycle warning when created outside a component', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        useErrorHandlerStore('outside-component-store', config);

        // The previous `onUnmounted` call warned here on every store creation —
        // the stderr noise in the test output — and the `try/catch` around it
        // never fired, because Vue warns instead of throwing.
        const lifecycleWarnings = warnSpy.mock.calls.filter(([first]) =>
            String(first).includes('is called when there is no active component instance')
        );

        expect(lifecycleWarnings).toEqual([]);
        warnSpy.mockRestore();
    });

    it('should register the cleanup on the store scope, not on a component', async () => {
        // Creating the store outside any component still yields a working
        // reporter with cleanup attached: the pinia scope is always active here.
        const store = useErrorHandlerStore(STORE_ID, config);

        reportOneBatch(store, 'no-component');
        await settle();
        expect(fetchMock).toHaveBeenCalledTimes(1);

        expect(getActivePinia()).toBeDefined();
        store.$dispose();
        await settle();

        reportOneBatch(store, 'after-dispose');
        await settle();
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
