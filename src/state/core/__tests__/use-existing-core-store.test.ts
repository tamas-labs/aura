import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCoreStore, useExistingCoreStore } from '../core.state';
import { useErrorHandlerStore } from '../error-handler.state';
import type { AuraProps } from '../../../types';

describe('useExistingCoreStore', () => {
    const storeId = 'existing-core-store-test';
    const props: AuraProps = { siteName: 'Test Site', debug: false };

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('when the root component already created the store', () => {
        it('should return the very same store instance', () => {
            const created = useCoreStore(storeId, props);
            const read = useExistingCoreStore(storeId);

            expect(read).toBe(created);
        });

        it('should expose the config the root was initialized with', () => {
            useCoreStore(storeId, props);

            expect(useExistingCoreStore(storeId).config.siteName).toBe('Test Site');
        });

        it('should not report anything', () => {
            useCoreStore(storeId, props);
            const errorsBefore = useErrorHandlerStore(`${storeId}-errors`).errors.length;

            useExistingCoreStore(storeId);

            expect(useErrorHandlerStore(`${storeId}-errors`).errors).toHaveLength(errorsBefore);
        });

        it('should keep returning the root config on repeated reads', () => {
            useCoreStore(storeId, props);

            // Mirrors the real call pattern: one read per child component, per render
            const reads = [1, 2, 3].map(() => useExistingCoreStore(storeId));

            expect(reads.every(store => store.config.siteName === 'Test Site')).toBe(true);
        });
    });

    describe('when the store does not exist yet', () => {
        it('should report a warning naming the store', () => {
            useExistingCoreStore(storeId);

            const errors = useErrorHandlerStore(`${storeId}-errors`).errors;
            const reported = errors.find(error => error.component === 'CoreStore');

            expect(reported).toBeDefined();
            expect(reported?.severity).toBe('warning');
            expect(reported?.message).toContain(storeId);
        });

        it('should still return a usable store so the component can render', () => {
            const store = useExistingCoreStore(storeId);

            expect(store.config).toBeDefined();
            expect(store.toggleSettings).toBeTypeOf('function');
        });

        it('should not block rendering (warning severity, not error)', () => {
            useExistingCoreStore(storeId);

            const errorStore = useErrorHandlerStore(`${storeId}-errors`);
            const blocking = errorStore.errors.filter(
                error => error.severity === 'error' || error.severity === 'critical'
            );

            expect(blocking).toHaveLength(0);
        });

        it('should report only on the first read, not on every subsequent one', () => {
            useExistingCoreStore(storeId);
            const afterFirst = useErrorHandlerStore(`${storeId}-errors`).errors.length;

            // The first call created the store, so the second one finds it in place
            useExistingCoreStore(storeId);

            expect(useErrorHandlerStore(`${storeId}-errors`).errors).toHaveLength(afterFirst);
        });
    });
});
