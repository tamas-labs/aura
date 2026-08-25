import { describe, it, expect, beforeEach } from 'vitest';
import { validateBoolean } from '../boolean.schema';
import { useErrorHandlerStore } from '../../../../state/core/error-handler.state';
import { createPinia, setActivePinia } from 'pinia';

const TEST_STORE_ID = 'test-store';

describe('validateBoolean', () => {
    beforeEach(() => {
        // New Pinia instance before each test
        setActivePinia(createPinia());
    });

    it('should return true for valid true boolean', () => {
        const result = validateBoolean(true, TEST_STORE_ID, 'debug');
        expect(result).toBe(true);
    });

    it('should return false for valid false boolean', () => {
        const result = validateBoolean(false, TEST_STORE_ID, 'debug');
        expect(result).toBe(false);
    });

    it('should return null for null value', () => {
        const result = validateBoolean(null, TEST_STORE_ID, 'debug');
        expect(result).toBeNull();
    });

    it('should return false for undefined value (default)', () => {
        const result = validateBoolean(undefined, TEST_STORE_ID, 'debug');
        expect(result).toBe(false);
    });

    it('should return false and add error for invalid string value', () => {
        const errorStoreId = 'test-store-invalid-string';
        const result = validateBoolean('invalid', errorStoreId, 'debug');

        expect(result).toBe(false);

        // Check that the error was added
        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
        expect(errorStore.errors).toHaveLength(1);

        const firstError = errorStore.errors[0];
        expect(firstError).toBeDefined();
        expect(firstError?.severity).toBe('warning');
        expect(firstError?.component).toBe('BooleanValidator');
        expect(firstError?.type).toBe('validation');
        expect(firstError?.key).toBe('debug');
    });

    it('should return false and add error for invalid number value', () => {
        const errorStoreId = 'test-store-invalid-number';
        const result = validateBoolean(123, errorStoreId, 'debug');

        expect(result).toBe(false);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);

        const firstError = errorStore.errors[0];
        expect(firstError?.metadata?.receivedValue).toBe(123);
        expect(firstError?.metadata?.receivedType).toBe('number');
    });

    it('should return false and add error for invalid object value', () => {
        const errorStoreId = 'test-store-invalid-object';
        const result = validateBoolean({ foo: 'bar' }, errorStoreId, 'debug');

        expect(result).toBe(false);

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);

        const firstError = errorStore.errors[0];
        expect(firstError?.metadata?.receivedType).toBe('object');
    });

    it('should add multiple errors for multiple invalid validations', () => {
        const errorStoreId = 'test-store-multiple';

        validateBoolean('invalid1', errorStoreId, 'debug');
        validateBoolean(123, errorStoreId, 'showFooter');
        validateBoolean([], errorStoreId, 'showHeaderSearch');

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
        expect(errorStore.errors).toHaveLength(3);
    });

    it('should use separate error stores for different storeIds', () => {
        const storeId1 = 'test-store-1';
        const storeId2 = 'test-store-2';

        validateBoolean('invalid', storeId1, 'debug');
        validateBoolean(123, storeId2, 'showFooter');

        const errorStore1 = useErrorHandlerStore(storeId1);
        const errorStore2 = useErrorHandlerStore(storeId2);

        expect(errorStore1.errors).toHaveLength(1);
        expect(errorStore2.errors).toHaveLength(1);

        const error1 = errorStore1.errors[0];
        const error2 = errorStore2.errors[0];

        expect(error1?.metadata?.receivedValue).toBe('invalid');
        expect(error2?.metadata?.receivedValue).toBe(123);
    });

    it('should return false for invalid value with unknown key (not in defaults)', () => {
        const errorStoreId = 'test-store-unknown-key';
        const result = validateBoolean('invalid', errorStoreId, 'unknownBooleanKey');

        expect(result).toBe(false); // Falls back to false when key not in defaults

        const errorStore = useErrorHandlerStore(errorStoreId);
        expect(errorStore.hasErrors).toBe(true);
    });

    it.each(['constructor', '__proto__', 'toString'])(
        'should fall back to false for the inherited key %s',
        key => {
            // A raw `defaults[key]` lookup answers these names from `Object.prototype`
            expect(validateBoolean('invalid', 'test-store-proto-key', key)).toBe(false);
        }
    );
});
