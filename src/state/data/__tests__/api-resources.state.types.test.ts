import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import {
    useApiResourcesStore,
    type ApiResourcesStore,
    type QueryParams,
} from '../api-resources.state';
import { useCoreStore } from '../../core/core.state';
import type { AuraProps } from '../../../types';

/**
 * Type-specific tests for ApiResourcesStore.
 * These tests verify that the unwrapped types work correctly with Pinia.
 */
describe('ApiResourcesStore Types', () => {
    const storeId = 'test-types-store';
    let core: ReturnType<typeof useCoreStore>;

    beforeEach(() => {
        setActivePinia(createPinia());

        const mockProps: AuraProps = {
            storeId: storeId,
            siteName: 'Test',
            urlStructure: '{siteName}/api',
            urlParameter: 'test',
        };

        core = useCoreStore(storeId, mockProps);
    });

    describe('QueryParams interface', () => {
        it('should have readonly page property', () => {
            const store = useApiResourcesStore(storeId, core);

            // queryParams should be accessible without .value
            expect(store.queryParams).toBeDefined();
            expect(store.queryParams.page).toBe(1);

            // Type check: QueryParams should be readonly
            const params: QueryParams = store.queryParams;
            expect(params.page).toBe(1);
            expect(params.paginate).toBe(10);
        });

        it('should have readonly paginate property', () => {
            const store = useApiResourcesStore(storeId, core);

            expect(store.queryParams.paginate).toBeDefined();
            expect(typeof store.queryParams.paginate).toBe('number');
        });

        it('should not allow direct mutation (readonly)', () => {
            const store = useApiResourcesStore(storeId, core);
            const params = store.queryParams;

            // TypeScript should prevent this at compile time
            // Runtime it depends on readonly enforcement
            expect(params).toBeDefined();
            expect(Object.isFrozen(params)).toBe(false); // Computed ref is not frozen
        });
    });

    describe('ApiResourcesStore interface', () => {
        it('should conform to ApiResourcesStore interface', () => {
            const store = useApiResourcesStore(storeId, core);

            // Check all interface properties
            expect(store.queryParams).toBeDefined();
            expect(store.header).toBeDefined();
            expect(store.body).toBeDefined();
            expect(store.footer).toBeDefined();
            expect(store.items).toBeDefined();
            expect(store.meta).toBeDefined();
            expect(store.links).toBeDefined();
            expect(store.processResponse).toBeDefined();
            expect(store.clearResponse).toBeDefined();
            expect(store.fetchData).toBeDefined();
            expect(store.autoRefetch).toBeDefined();
            expect(store.$id).toBeDefined();
            expect(store.$dispose).toBeDefined();

            // Type check
            const typedStore: ApiResourcesStore = store;
            expect(typedStore).toBe(store);
        });

        it('should have unwrapped queryParams property', () => {
            const store = useApiResourcesStore(storeId, core);

            // Should be accessible directly without .value
            expect(store.queryParams.page).toBe(1);

            // Should not have .value property (unwrapped)
            expect((store.queryParams as unknown as { value?: unknown }).value).toBeUndefined();
        });

        it('should have unwrapped autoRefetch property', () => {
            const store = useApiResourcesStore(storeId, core);

            // Should be accessible directly without .value
            expect(store.autoRefetch).toBe(true);

            // Should not have .value property (unwrapped)
            expect((store.autoRefetch as unknown as { value?: unknown }).value).toBeUndefined();
        });

        it('should have fetchData method with correct signature', () => {
            const store = useApiResourcesStore(storeId, core);

            expect(typeof store.fetchData).toBe('function');

            // Should return Promise<void>
            const result = store.fetchData();
            expect(result).toBeInstanceOf(Promise);
        });

        it('should have Pinia built-in properties', () => {
            const store = useApiResourcesStore(storeId, core);

            // $id should contain store identifier
            expect(store.$id).toContain('api-resources');
            expect(store.$id).toContain(storeId);

            // $dispose should be a function
            expect(typeof store.$dispose).toBe('function');
        });
    });

    describe('Unwrap behavior', () => {
        it('should allow direct property access without .value', () => {
            const store = useApiResourcesStore(storeId, core);

            // All properties should be unwrapped
            const page = store.queryParams.page;
            const autoRefetch = store.autoRefetch;
            const header = store.header;

            expect(typeof page).toBe('number');
            expect(typeof autoRefetch).toBe('boolean');
            expect(header).toBeNull();
        });

        it('should allow boolean assignment to autoRefetch', () => {
            const store = useApiResourcesStore(storeId, core);

            expect(store.autoRefetch).toBe(true);

            // Should allow direct boolean assignment (unwrapped)
            store.autoRefetch = false;
            expect(store.autoRefetch).toBe(false);

            store.autoRefetch = true;
            expect(store.autoRefetch).toBe(true);
        });

        it('should reactively update when autoRefetch changes', () => {
            const store = useApiResourcesStore(storeId, core);

            const initialValue = store.autoRefetch;
            expect(initialValue).toBe(true);

            store.autoRefetch = false;
            expect(store.autoRefetch).toBe(false);
            expect(store.autoRefetch).not.toBe(initialValue);
        });
    });

    describe('Type safety', () => {
        it('should not accept invalid types for autoRefetch', () => {
            const store = useApiResourcesStore(storeId, core);

            // TypeScript should prevent these at compile time
            // At runtime, we can only verify the current type
            expect(typeof store.autoRefetch).toBe('boolean');
        });

        it('should ensure queryParams is readonly at type level', () => {
            const store = useApiResourcesStore(storeId, core);

            // TypeScript prevents direct mutation of readonly properties
            const params = store.queryParams;

            // These would fail at compile time:
            // params.page = 2;  // Error: Cannot assign to 'page' because it is a read-only property
            // params.paginate = 20;  // Error: Cannot assign to 'paginate' because it is a read-only property

            expect(params.page).toBe(1);
        });
    });

    describe('Store identity', () => {
        it('should have unique $id per storeId', () => {
            const store1 = useApiResourcesStore('store1', core);
            const store2 = useApiResourcesStore('store2', core);

            expect(store1.$id).not.toBe(store2.$id);
            expect(store1.$id).toContain('store1');
            expect(store2.$id).toContain('store2');
        });

        it('should return same instance for same storeId', () => {
            const store1 = useApiResourcesStore(storeId, core);
            const store2 = useApiResourcesStore(storeId, core);

            // Pinia returns the same instance for the same store ID
            expect(store1).toBe(store2);
            expect(store1.$id).toBe(store2.$id);
        });
    });

    describe('Type casting validation', () => {
        it('should successfully cast to ApiResourcesStore', () => {
            const store = useApiResourcesStore(storeId, core);

            // The return type should already be ApiResourcesStore
            const typedStore: ApiResourcesStore = store;

            expect(typedStore.queryParams).toBeDefined();
            expect(typedStore.header).toBeDefined();
            expect(typedStore.body).toBeDefined();
            expect(typedStore.footer).toBeDefined();
            expect(typedStore.items).toBeDefined();
            expect(typedStore.meta).toBeDefined();
            expect(typedStore.links).toBeDefined();
            expect(typedStore.processResponse).toBeDefined();
            expect(typedStore.clearResponse).toBeDefined();
            expect(typedStore.fetchData).toBeDefined();
            expect(typedStore.autoRefetch).toBeDefined();
        });

        // The store contract exposes it unwrapped, so a host can bind its own
        // indicator to `store.loading` without reaching for `.value`.
        it('should expose loading as an unwrapped boolean', () => {
            const store = useApiResourcesStore(storeId, core);

            expect(typeof store.loading).toBe('boolean');
            expect(store.loading).toBe(false);
        });

        it('should have all required ApiResourcesStore properties', () => {
            const store = useApiResourcesStore(storeId, core);

            const requiredProps = [
                'queryParams',
                'loading',
                'header',
                'body',
                'footer',
                'items',
                'meta',
                'links',
                'processResponse',
                'clearResponse',
                'fetchData',
                'autoRefetch',
                '$id',
                '$dispose',
            ];

            requiredProps.forEach(prop => {
                expect(store).toHaveProperty(prop);
            });
        });
    });
});
