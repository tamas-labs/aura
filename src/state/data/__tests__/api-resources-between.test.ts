import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useApiResourcesStore } from '../api-resources.state';
import { useCoreStore } from '../../core/core.state';
import type { AuraProps } from '../../../types';

describe('useApiResourcesStore - between (range) search', () => {
    const storeId = 'test-api-resources-between';
    let core: ReturnType<typeof useCoreStore>;
    let store: ReturnType<typeof useApiResourcesStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        window.sessionStorage.clear();

        const mockProps: AuraProps = {
            storeId,
            siteName: 'Test Site',
            urlStructure: '{siteName}/api/{urlParameter}',
            urlParameter: 'users',
            urlParameterLastSegment: 'list',
            siteToken: 'test-token-123',
            requestMethod: 'POST',
            disableSession: true,
        };

        core = useCoreStore(storeId, mockProps);
        store = useApiResourcesStore(storeId, core);
    });

    describe('setBetweenSearch', () => {
        it('should add a new range search item with both bounds', () => {
            store.setBetweenSearch('age', 18, 65);

            expect(store.searchItems).toHaveLength(1);
            expect(store.searchItems[0]).toEqual({ field: 'age', min: 18, max: 65 });
        });

        it('should add a range with only the lower bound', () => {
            store.setBetweenSearch('age', 18, null);

            expect(store.searchItems[0]).toEqual({ field: 'age', min: 18, max: null });
        });

        it('should treat empty-string bounds as null', () => {
            store.setBetweenSearch('age', '', '65');

            expect(store.searchItems[0]).toEqual({ field: 'age', min: null, max: '65' });
        });

        it('should remove the search item when both bounds are null', () => {
            store.setBetweenSearch('age', 18, 65);
            store.setBetweenSearch('age', null, null);

            expect(store.searchItems).toHaveLength(0);
        });

        it('should remove the search item when both bounds are empty strings', () => {
            store.setBetweenSearch('age', 18, 65);
            store.setBetweenSearch('age', '', '');

            expect(store.searchItems).toHaveLength(0);
        });

        it('should update an existing range for the same field', () => {
            store.setBetweenSearch('age', 18, 65);
            store.setBetweenSearch('age', 20, 30);

            expect(store.searchItems).toHaveLength(1);
            expect(store.searchItems[0]).toEqual({ field: 'age', min: 20, max: 30 });
        });

        it('should convert an existing text search into a range (dropping term/exact)', () => {
            store.addSearch('age', '25', true);
            store.setBetweenSearch('age', 20, 30);

            expect(store.searchItems).toHaveLength(1);
            expect(store.searchItems[0]).toEqual({ field: 'age', min: 20, max: 30 });
            expect(store.searchItems[0]).not.toHaveProperty('term');
            expect(store.searchItems[0]).not.toHaveProperty('exact');
        });

        it('should ignore empty field', () => {
            store.setBetweenSearch('', 1, 2);

            expect(store.searchItems).toHaveLength(0);
        });
    });

    describe('getBetweenRange', () => {
        it('should return null when no range search exists', () => {
            expect(store.getBetweenRange('age')).toBeNull();
        });

        it('should return null for a plain text search', () => {
            store.addSearch('name', 'John');

            expect(store.getBetweenRange('name')).toBeNull();
        });

        it('should return the bounds for an existing range', () => {
            store.setBetweenSearch('age', 18, 65);

            expect(store.getBetweenRange('age')).toEqual({ min: 18, max: 65 });
        });

        it('should normalise an absent bound to null', () => {
            store.setBetweenSearch('age', 18, null);

            expect(store.getBetweenRange('age')).toEqual({ min: 18, max: null });
        });
    });

    describe('query params integration', () => {
        it('should expose range items in searchable query params', () => {
            store.setBetweenSearch('age', 18, 65);

            expect(store.queryParams.searchable).toEqual([{ field: 'age', min: 18, max: 65 }]);
        });
    });
});
