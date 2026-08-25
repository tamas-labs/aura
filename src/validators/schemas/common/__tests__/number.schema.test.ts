import { describe, it, expect, beforeEach } from 'vitest';
import { validateNumber } from '../number.schema';
import { useErrorHandlerStore } from '../../../../state/core/error-handler.state';
import { createPinia, setActivePinia } from 'pinia';

const TEST_STORE_ID = 'test-store';

describe('validateNumber', () => {
    beforeEach(() => {
        // New Pinia instance before each test
        setActivePinia(createPinia());
    });

    it('should return valid number within range', () => {
        const result = validateNumber(10, TEST_STORE_ID, 'rowsNumber');
        expect(result).toBe(10);
    });

    it('should return valid number for minimum value (1)', () => {
        const result = validateNumber(1, TEST_STORE_ID, 'rowsNumber');
        expect(result).toBe(1);
    });

    it('should return valid number for maximum value (1000)', () => {
        const result = validateNumber(1000, TEST_STORE_ID, 'rowsNumber');
        expect(result).toBe(1000);
    });

    it('should return null for null value', () => {
        const result = validateNumber(null, TEST_STORE_ID, 'rowsNumber');
        expect(result).toBeNull();
    });

    it('should return fallback and add error for value below minimum (0)', () => {
        const errorStoreId = 'test-store-below-min';
        const result = validateNumber(0, errorStoreId, 'rowsNumber');

        expect(result).toBe(10);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
        expect(errorStore.errors).toHaveLength(1);

        const firstError = errorStore.errors[0];
        expect(firstError?.severity).toBe('warning');
        expect(firstError?.component).toBe('NumberValidator');
        expect(firstError?.type).toBe('validation');
        expect(firstError?.key).toBe('rowsNumber');
    });

    it('should return fallback and add error for value above maximum (1001)', () => {
        const errorStoreId = 'test-store-above-max';
        const result = validateNumber(1001, errorStoreId, 'rowsNumber');

        expect(result).toBe(10);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);

        const firstError = errorStore.errors[0];
        expect(firstError?.metadata?.receivedValue).toBe(1001);
        expect(firstError?.metadata?.constraints).toEqual({ min: 1, max: 1000 });
    });

    it('should return fallback and add error for negative number', () => {
        const errorStoreId = 'test-store-negative';
        const result = validateNumber(-5, errorStoreId, 'rowsNumber');

        expect(result).toBe(10);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it('should return fallback and add error for invalid string value', () => {
        const errorStoreId = 'test-store-invalid-string';
        const result = validateNumber('invalid', errorStoreId, 'rowsNumber');

        expect(result).toBe(10);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);

        const firstError = errorStore.errors[0];
        expect(firstError?.metadata?.receivedValue).toBe('invalid');
        expect(firstError?.metadata?.receivedType).toBe('string');
    });

    it('should return fallback and add error for undefined value', () => {
        const errorStoreId = 'test-store-undefined';
        const result = validateNumber(undefined, errorStoreId, 'rowsNumber');

        expect(result).toBe(10);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it('should return fallback and add error for object value', () => {
        const errorStoreId = 'test-store-object';
        const result = validateNumber({ value: 10 }, errorStoreId, 'rowsNumber');

        expect(result).toBe(10);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);

        const firstError = errorStore.errors[0];
        expect(firstError?.metadata?.receivedType).toBe('object');
    });

    it('should return fallback and add error for array value', () => {
        const errorStoreId = 'test-store-array';
        const result = validateNumber([10], errorStoreId, 'rowsNumber');

        expect(result).toBe(10);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it('should return fallback and add error for boolean value', () => {
        const errorStoreId = 'test-store-boolean';
        const result = validateNumber(true, errorStoreId, 'rowsNumber');

        expect(result).toBe(10);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it('should return fallback and add error for NaN', () => {
        const errorStoreId = 'test-store-nan';
        const result = validateNumber(NaN, errorStoreId, 'rowsNumber');

        expect(result).toBe(10);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it('should return fallback and add error for Infinity', () => {
        const errorStoreId = 'test-store-infinity';
        const result = validateNumber(Infinity, errorStoreId, 'rowsNumber');

        expect(result).toBe(10);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it('should add multiple errors for multiple invalid validations', () => {
        const errorStoreId = 'test-store-multiple';

        validateNumber('invalid1', errorStoreId, 'rowsNumber');
        validateNumber(0, errorStoreId, 'rowsNumber');
        validateNumber(1001, errorStoreId, 'rowsNumber');

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
        expect(errorStore.errors).toHaveLength(3);
    });

    it('should use separate error stores for different storeIds', () => {
        const storeId1 = 'test-store-1';
        const storeId2 = 'test-store-2';

        validateNumber('invalid', storeId1, 'rowsNumber');
        validateNumber(0, storeId2, 'rowsNumber');

        const errorStore1 = useErrorHandlerStore(storeId1);
        const errorStore2 = useErrorHandlerStore(storeId2);

        expect(errorStore1.errors).toHaveLength(1);
        expect(errorStore2.errors).toHaveLength(1);

        const error1 = errorStore1.errors[0];
        const error2 = errorStore2.errors[0];

        expect(error1?.metadata?.receivedValue).toBe('invalid');
        expect(error2?.metadata?.receivedValue).toBe(0);
    });

    it('should accept valid numbers in middle range', () => {
        const result25 = validateNumber(25, TEST_STORE_ID, 'rowsNumber');
        const result50 = validateNumber(50, TEST_STORE_ID, 'rowsNumber');
        const result100 = validateNumber(100, TEST_STORE_ID, 'rowsNumber');
        const result500 = validateNumber(500, TEST_STORE_ID, 'rowsNumber');

        expect(result25).toBe(25);
        expect(result50).toBe(50);
        expect(result100).toBe(100);
        expect(result500).toBe(500);
    });

    it('should return fallback for decimal numbers (if not allowed by Zod)', () => {
        const errorStoreId = 'test-store-decimal';
        const result = validateNumber(10.5, errorStoreId, 'rowsNumber');

        // If the Zod schema accepts decimals, this is 10.5, otherwise fallback
        // The current NumberZod does not forbid decimals, so it accepts it
        expect(result).toBe(10.5);
    });

    it.each(['constructor', '__proto__', 'toString'])(
        'should fall back to 10 for the inherited key %s',
        key => {
            // A raw `defaults[key]` lookup answers these names from `Object.prototype`
            expect(validateNumber('invalid', 'test-store-proto-key', key)).toBe(10);
        }
    );
});
