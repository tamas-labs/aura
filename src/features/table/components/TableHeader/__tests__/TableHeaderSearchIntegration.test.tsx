import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableHeaderSearchCell } from '../TableHeaderSearchCell';
import type { HeaderCell } from '../../../../../types/api-response.types';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';

describe('TableHeaderSearchCell - Integration Tests', () => {
    const storeId = 'test-table-header-search-integration';
    let core: ReturnType<typeof useCoreStore>;
    let resource: ReturnType<typeof useApiResourcesStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        // Clear session storage to prevent interference from session restore
        window.sessionStorage.clear();
        core = useCoreStore(storeId, { storeId });
        resource = useApiResourcesStore(storeId, core);
    });

    describe('Real-world scenario: header with mixed column types', () => {
        it('should handle header from user example correctly', async () => {
            // User provided header structure
            const cells: HeaderCell[] = [
                {
                    field: 'id',
                    content: 'ID',
                    searchable: true,
                    sortable: true,
                    // Using legacy type property
                    type: 'number' as any,
                } as HeaderCell,
                {
                    field: 'name',
                    content: 'Name',
                    searchable: true,
                    key: 'name',
                },
                {
                    field: 'last',
                    content: 'Last',
                    searchable: false,
                    key: 'last',
                },
                {
                    field: 'handle',
                    content: 'Handle',
                    key: 'handle',
                },
            ];

            // Mount first cell (ID - number type)
            const wrapper1 = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell: cells[0]!,
                },
            });

            // Search for ID
            const input1 = wrapper1.find('input');
            await input1.setValue('1');
            await input1.trigger('keydown', { key: 'Enter' });

            // Mount second cell (Name - text)
            const wrapper2 = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell: cells[1]!,
                },
            });

            // Search for Name
            const input2 = wrapper2.find('input');
            await input2.setValue('John');
            await input2.trigger('keydown', { key: 'Enter' });

            // Verify queryParams structure
            const queryParams = resource.queryParams;
            expect(queryParams).toHaveProperty('searchable');

            const searchable = queryParams.searchable as any[];
            expect(searchable).toHaveLength(2);

            // ID search should have exact: true
            expect(searchable[0]).toEqual({
                field: 'id',
                term: '1',
                exact: true,
            });

            // Name search should NOT have exact property at all
            expect(searchable[1]).toEqual({
                field: 'name',
                term: 'John',
            });
            expect(Object.keys(searchable[1])).not.toContain('exact');

            // Verify JSON serialization (what will be sent to backend)
            const serialized = JSON.stringify(queryParams.searchable);
            expect(serialized).toBe(
                '[{"field":"id","term":"1","exact":true},{"field":"name","term":"John"}]'
            );
            expect(serialized).not.toContain('undefined');
            expect(serialized).not.toContain('__vue_devtool_undefined__');
        });

        it('should handle number: true property correctly', async () => {
            const cell: HeaderCell = {
                field: 'id',
                content: 'ID',
                key: 'id',
                searchable: true,
                number: true, // Standard property
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('123');
            await input.trigger('keydown', { key: 'Enter' });

            const queryParams = resource.queryParams;
            const searchable = queryParams.searchable as any[];

            expect(searchable[0]).toEqual({
                field: 'id',
                term: '123',
                exact: true,
            });
        });
    });

    describe('Complex search scenarios', () => {
        it('should handle multiple searches with clear operations', async () => {
            const idCell: HeaderCell = {
                field: 'id',
                content: 'ID',
                key: 'id',
                searchable: true,
                number: true,
            };

            const nameCell: HeaderCell = {
                field: 'name',
                content: 'Name',
                key: 'name',
                searchable: true,
            };

            const wrapper1 = mount(TableHeaderSearchCell, {
                props: { storeId, cell: idCell },
            });

            const wrapper2 = mount(TableHeaderSearchCell, {
                props: { storeId, cell: nameCell },
            });

            // Add both searches
            await wrapper1.find('input').setValue('10');
            await wrapper1.find('input').trigger('keydown', { key: 'Enter' });

            await wrapper2.find('input').setValue('Alice');
            await wrapper2.find('input').trigger('keydown', { key: 'Enter' });

            expect(resource.searchItems).toHaveLength(2);

            // Clear name search
            await wrapper2.find('[data-testid="clear-btn-name"]').trigger('click');

            expect(resource.searchItems).toHaveLength(1);
            expect(resource.searchItems[0]?.field).toBe('id');

            // Add name search again
            await wrapper2.find('input').setValue('Bob');
            await wrapper2.find('input').trigger('keydown', { key: 'Enter' });

            const queryParams = resource.queryParams;
            const searchable = queryParams.searchable as any[];

            expect(searchable).toHaveLength(2);
            expect(searchable[0]).toEqual({ field: 'id', term: '10', exact: true });
            expect(searchable[1]).toEqual({ field: 'name', term: 'Bob' });
        });

        it('should update searches correctly', async () => {
            const cell: HeaderCell = {
                field: 'id',
                content: 'ID',
                key: 'id',
                searchable: true,
                number: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: { storeId, cell },
            });

            const input = wrapper.find('input');

            // First search
            await input.setValue('100');
            await input.trigger('keydown', { key: 'Enter' });

            expect(resource.searchItems[0]).toEqual({
                field: 'id',
                term: '100',
                exact: true,
            });

            // Update search
            await input.setValue('200');
            await input.trigger('keydown', { key: 'Enter' });

            expect(resource.searchItems).toHaveLength(1);
            expect(resource.searchItems[0]).toEqual({
                field: 'id',
                term: '200',
                exact: true,
            });

            // Verify queryParams
            const queryParams = resource.queryParams;
            const searchable = queryParams.searchable as any[];
            expect(searchable[0]).toEqual({ field: 'id', term: '200', exact: true });
        });
    });

    describe('Edge cases with exact property', () => {
        it('should handle number: null as non-number column', async () => {
            const cell: HeaderCell = {
                field: 'count',
                content: 'Count',
                key: 'count',
                searchable: true,
                number: null,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: { storeId, cell },
            });

            await wrapper.find('input').setValue('5');
            await wrapper.find('input').trigger('keydown', { key: 'Enter' });

            const searchItem = resource.searchItems[0]!;
            expect(Object.keys(searchItem)).not.toContain('exact');
        });

        it('should handle missing number property as non-number column', async () => {
            const cell: HeaderCell = {
                field: 'description',
                content: 'Description',
                key: 'description',
                searchable: true,
                // number property not set
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: { storeId, cell },
            });

            await wrapper.find('input').setValue('text');
            await wrapper.find('input').trigger('keydown', { key: 'Enter' });

            const searchItem = resource.searchItems[0]!;
            expect(Object.keys(searchItem)).not.toContain('exact');
            expect(searchItem).toEqual({ field: 'description', term: 'text' });
        });
    });
});
