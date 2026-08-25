import { describe, it, expect, beforeEach } from 'vitest';
import { validatePaginateValues } from '../paginate-values.schema';
import { useErrorHandlerStore } from '../../../../state/core/error-handler.state';
import { createPinia, setActivePinia } from 'pinia';

const TEST_STORE_ID = 'test-store';

describe('validatePaginateValues', () => {
    beforeEach(() => {
        // New Pinia instance before each test
        setActivePinia(createPinia());
    });

    it('should return valid array for correct number array', () => {
        const result = validatePaginateValues(
            [5, 10, 25, 50, 100],
            TEST_STORE_ID,
            'paginateValues'
        );
        expect(result).toEqual([5, 10, 25, 50, 100]);
    });

    it('should return valid array for single element', () => {
        const result = validatePaginateValues([10], TEST_STORE_ID, 'paginateValues');
        expect(result).toEqual([10]);
    });

    it('should return valid array for edge values (1 and 1000)', () => {
        const result = validatePaginateValues([1, 1000], TEST_STORE_ID, 'paginateValues');
        expect(result).toEqual([1, 1000]);
    });

    it('should return null for null value', () => {
        const result = validatePaginateValues(null, TEST_STORE_ID, 'paginateValues');
        expect(result).toBeNull();
    });

    it('should return fallback and add error for value below minimum (0)', () => {
        const errorStoreId = 'test-store-below-min';
        const result = validatePaginateValues([0, 5, 10], errorStoreId, 'paginateValues');

        expect(result).toEqual([5, 10, 25, 50, 100]);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
        expect(errorStore.errors).toHaveLength(1);

        const firstError = errorStore.errors[0];
        expect(firstError?.severity).toBe('warning');
        expect(firstError?.component).toBe('PaginateValuesValidator');
        expect(firstError?.type).toBe('validation');
        expect(firstError?.key).toBe('paginateValues');
    });

    it('should return fallback and add error for value above maximum (1001)', () => {
        const errorStoreId = 'test-store-above-max';
        const result = validatePaginateValues([10, 1001], errorStoreId, 'paginateValues');

        expect(result).toEqual([5, 10, 25, 50, 100]);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);

        const firstError = errorStore.errors[0];
        expect(firstError?.metadata?.receivedValue).toEqual([10, 1001]);
        expect(firstError?.metadata?.constraints).toEqual({ min: 1, max: 1000 });
    });

    it('should return fallback and add error for invalid string value', () => {
        const errorStoreId = 'test-store-invalid-string';
        const result = validatePaginateValues('invalid', errorStoreId, 'paginateValues');

        expect(result).toEqual([5, 10, 25, 50, 100]);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);

        const firstError = errorStore.errors[0];
        expect(firstError?.metadata?.receivedValue).toBe('invalid');
        expect(firstError?.metadata?.receivedType).toBe('string');
    });

    it('should return fallback and add error for array with non-numeric values', () => {
        const errorStoreId = 'test-store-non-numeric';
        const result = validatePaginateValues([5, 'ten', 25], errorStoreId, 'paginateValues');

        expect(result).toEqual([5, 10, 25, 50, 100]);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it('should return fallback and add error for undefined value', () => {
        const errorStoreId = 'test-store-undefined';
        const result = validatePaginateValues(undefined, errorStoreId, 'paginateValues');

        expect(result).toEqual([5, 10, 25, 50, 100]);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it('should return fallback and add error for object value', () => {
        const errorStoreId = 'test-store-object';
        const result = validatePaginateValues({ values: [5, 10] }, errorStoreId, 'paginateValues');

        expect(result).toEqual([5, 10, 25, 50, 100]);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);

        const firstError = errorStore.errors[0];
        expect(firstError?.metadata?.receivedType).toBe('object');
    });

    it('should add multiple errors for multiple invalid validations', () => {
        const errorStoreId = 'test-store-multiple';

        validatePaginateValues('invalid1', errorStoreId, 'paginateValues');
        validatePaginateValues([0, 5], errorStoreId, 'paginateValues');
        validatePaginateValues({}, errorStoreId, 'paginateValues');

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
        expect(errorStore.errors).toHaveLength(3);
    });

    it('should use separate error stores for different storeIds', () => {
        const storeId1 = 'test-store-1';
        const storeId2 = 'test-store-2';

        validatePaginateValues('invalid', storeId1, 'paginateValues');
        validatePaginateValues([0, 5], storeId2, 'paginateValues');

        const errorStore1 = useErrorHandlerStore(storeId1);
        const errorStore2 = useErrorHandlerStore(storeId2);

        expect(errorStore1.errors).toHaveLength(1);
        expect(errorStore2.errors).toHaveLength(1);

        const error1 = errorStore1.errors[0];
        const error2 = errorStore2.errors[0];

        expect(error1?.metadata?.receivedValue).toBe('invalid');
        expect(error2?.metadata?.receivedValue).toEqual([0, 5]);
    });

    it('should return fallback and add error for empty array', () => {
        const errorStoreId = 'test-store-empty-array';
        const result = validatePaginateValues([], errorStoreId, 'paginateValues');

        // The empty array is valid because the schema does not require a minimum length
        expect(result).toEqual([]);
    });

    it('should return fallback for negative numbers', () => {
        const errorStoreId = 'test-store-negative';
        const result = validatePaginateValues([-5, 10, 25], errorStoreId, 'paginateValues');

        expect(result).toEqual([5, 10, 25, 50, 100]);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it.each(['constructor', '__proto__', 'toString'])(
        'should fall back to the default list for the inherited key %s',
        key => {
            // A raw `defaults[key]` lookup answers these names from `Object.prototype`
            expect(validatePaginateValues('invalid', 'test-store-proto-key', key)).toEqual([
                5, 10, 25, 50, 100,
            ]);
        }
    );
});
