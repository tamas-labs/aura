import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useCoreStore } from '../../core/core.state';
import { useApiResourcesStore } from '../api-resources.state';

describe('ApiResourcesStore - Exact Search Handling', () => {
    const storeId = 'test-api-resources-exact';
    let core: ReturnType<typeof useCoreStore>;
    let resource: ReturnType<typeof useApiResourcesStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        // Clear session storage to prevent interference from session restore
        window.sessionStorage.clear();
        core = useCoreStore(storeId, { storeId });
        resource = useApiResourcesStore(storeId, core);
    });

    describe('addSearch', () => {
        it('should NOT include exact property if it is undefined', () => {
            resource.addSearch('name', 'John', undefined);

            expect(resource.searchItems).toHaveLength(1);
            const searchItem = resource.searchItems[0]!;

            // Verify the object does NOT have 'exact' key
            expect(Object.keys(searchItem)).not.toContain('exact');
            expect(searchItem).toEqual({
                field: 'name',
                term: 'John',
            });
            // Double check: accessing exact should be undefined
            expect(searchItem.exact).toBeUndefined();
        });

        it('should include exact property if it is true', () => {
            resource.addSearch('id', '1', true);

            expect(resource.searchItems[0]!).toEqual({
                field: 'id',
                term: '1',
                exact: true,
            });
            expect(Object.keys(resource.searchItems[0]!)).toContain('exact');
        });

        it('should include exact property if it is false', () => {
            resource.addSearch('email', 'test', false);

            expect(resource.searchItems[0]!).toEqual({
                field: 'email',
                term: 'test',
                exact: false,
            });
            expect(Object.keys(resource.searchItems[0]!)).toContain('exact');
        });

        it('should NOT add search if term is empty string', () => {
            resource.addSearch('name', '', undefined);
            expect(resource.searchItems).toHaveLength(0);
        });

        it('should NOT add duplicate field', () => {
            resource.addSearch('name', 'John', undefined);
            resource.addSearch('name', 'Jane', undefined);

            expect(resource.searchItems).toHaveLength(1);
            expect(resource.searchItems[0]?.term).toBe('John');
        });
    });

    describe('updateSearchTerm', () => {
        it('should update term and keep existing exact if undefined passed', () => {
            resource.addSearch('id', '1', true);
            resource.updateSearchTerm('id', '2', undefined);

            expect(resource.searchItems[0]!).toEqual({
                field: 'id',
                term: '2',
                exact: true,
            });
        });

        it('should update exact if passed as true', () => {
            resource.addSearch('id', '1', false);
            resource.updateSearchTerm('id', '1', true);

            expect(resource.searchItems[0]!).toEqual({
                field: 'id',
                term: '1',
                exact: true,
            });
        });

        it('should update exact if passed as false', () => {
            resource.addSearch('id', '1', true);
            resource.updateSearchTerm('id', '1', false);

            expect(resource.searchItems[0]!).toEqual({
                field: 'id',
                term: '1',
                exact: false,
            });
        });

        it('should remove search if term is empty string', () => {
            resource.addSearch('name', 'John', undefined);
            resource.updateSearchTerm('name', '', undefined);

            expect(resource.searchItems).toHaveLength(0);
        });

        it('should do nothing if field does not exist', () => {
            resource.addSearch('name', 'John', undefined);
            resource.updateSearchTerm('email', 'test@example.com', true);

            expect(resource.searchItems).toHaveLength(1);
            expect(resource.searchItems[0]?.field).toBe('name');
        });
    });

    describe('queryParams integration', () => {
        it('should NOT include undefined exact in queryParams', () => {
            resource.addSearch('name', 'John', undefined);

            const queryParams = resource.queryParams;
            expect(queryParams.searchable).toBeDefined();

            const searchable = queryParams.searchable as any[];
            expect(searchable[0]).toEqual({
                field: 'name',
                term: 'John',
            });
            expect(Object.keys(searchable[0])).not.toContain('exact');
        });

        it('should include exact: true in queryParams', () => {
            resource.addSearch('id', '123', true);

            const queryParams = resource.queryParams;
            const searchable = queryParams.searchable as any[];

            expect(searchable[0]).toEqual({
                field: 'id',
                term: '123',
                exact: true,
            });
        });

        it('should include exact: false in queryParams', () => {
            resource.addSearch('email', 'test', false);

            const queryParams = resource.queryParams;
            const searchable = queryParams.searchable as any[];

            expect(searchable[0]).toEqual({
                field: 'email',
                term: 'test',
                exact: false,
            });
        });

        it('should handle mixed searches correctly in queryParams', () => {
            resource.addSearch('id', '1', true);
            resource.addSearch('name', 'John', undefined);
            resource.addSearch('active', 'yes', false);

            const queryParams = resource.queryParams;
            const searchable = queryParams.searchable as any[];

            expect(searchable).toHaveLength(3);
            expect(searchable[0]).toEqual({ field: 'id', term: '1', exact: true });
            expect(searchable[1]).toEqual({ field: 'name', term: 'John' });
            expect(searchable[2]).toEqual({ field: 'active', term: 'yes', exact: false });
        });
    });

    describe('JSON serialization', () => {
        it('should serialize without __vue_devtool_undefined__', () => {
            resource.addSearch('name', 'John', undefined);

            const searchItems = resource.searchItems;
            const serialized = JSON.stringify(searchItems);

            expect(serialized).not.toContain('undefined');
            expect(serialized).not.toContain('__vue_devtool_undefined__');
            expect(serialized).toBe('[{"field":"name","term":"John"}]');
        });

        it('should serialize exact: true correctly', () => {
            resource.addSearch('id', '1', true);

            const serialized = JSON.stringify(resource.searchItems);
            expect(serialized).toBe('[{"field":"id","term":"1","exact":true}]');
        });
    });
});
