import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateStringArray } from '../string-array.schema';
import { useErrorHandlerStore } from '../../../../state/core/error-handler.state';

describe('validateStringArray', () => {
    const errorStoreId = 'test-string-array-errors';
    const key = 'rawHtmlAllowedTags';
    const fallback = ['a', 'b'];

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('valid inputs', () => {
        it('érvényes string tömböt változatlanul visszaad', () => {
            expect(validateStringArray(['b', 'i', 'u'], errorStoreId, key, fallback)).toEqual([
                'b',
                'i',
                'u',
            ]);
        });

        it('üres tömböt elfogad', () => {
            expect(validateStringArray([], errorStoreId, key, fallback)).toEqual([]);
        });

        it('null értéket átenged', () => {
            expect(validateStringArray(null, errorStoreId, key, fallback)).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('nem-tömb esetén a fallbacket adja és hibát logol', () => {
            const result = validateStringArray('nope', errorStoreId, key, fallback);
            expect(result).toEqual(fallback);

            const errorStore = useErrorHandlerStore(errorStoreId);
            expect(errorStore.errors.length).toBeGreaterThan(0);
            expect(errorStore.errors[0]?.type).toBe('validation');
        });

        it('nem-string elemeket tartalmazó tömbnél fallback', () => {
            const result = validateStringArray([1, 2] as unknown, errorStoreId, key, fallback);
            expect(result).toEqual(fallback);
        });

        it('üres string elemnél fallback (min(1))', () => {
            const result = validateStringArray([''], errorStoreId, key, fallback);
            expect(result).toEqual(fallback);
        });
    });
});
