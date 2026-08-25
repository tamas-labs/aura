import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableHeaderSearchCell } from '../TableHeaderSearchCell';
import type { HeaderCell } from '../../../../../types/api-response.types';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';

describe('TableHeaderSearchCell - Automatic Exact Search for Number Columns', () => {
    const storeId = 'test-table-header-search-cell-exact';
    let core: ReturnType<typeof useCoreStore>;
    let resource: ReturnType<typeof useApiResourcesStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        // Clear session storage to prevent interference from session restore
        window.sessionStorage.clear();
        core = useCoreStore(storeId, { storeId });
        resource = useApiResourcesStore(storeId, core);
    });

    describe('number column behavior', () => {
        it('should use exact match for number columns (Enter key)', async () => {
            const cell: HeaderCell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                searchable: true,
                number: true,
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

            const searchItems = resource.searchItems;
            expect(searchItems).toHaveLength(1);
            expect(searchItems[0]).toEqual({
                field: 'id',
                term: '123',
                exact: true,
            });
        });

        it('should use exact match for number columns (button click)', async () => {
            const cell: HeaderCell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                searchable: true,
                number: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            const searchBtn = wrapper.find('[data-testid="search-btn-id"]');

            await input.setValue('456');
            await searchBtn.trigger('click');

            const searchItems = resource.searchItems;
            expect(searchItems).toHaveLength(1);
            expect(searchItems[0]).toEqual({
                field: 'id',
                term: '456',
                exact: true,
            });
        });

        it('should update existing search with exact match for number columns', async () => {
            const cell: HeaderCell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                searchable: true,
                number: true,
            };

            resource.addSearch('id', '100', true);

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('200');
            await input.trigger('keydown', { key: 'Enter' });

            const searchItems = resource.searchItems;
            expect(searchItems).toHaveLength(1);
            expect(searchItems[0]).toEqual({
                field: 'id',
                term: '200',
                exact: true,
            });
        });

        it('should maintain exact: true after clear and re-search on number column', async () => {
            const cell: HeaderCell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                searchable: true,
                number: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            const clearBtn = wrapper.find('[data-testid="clear-btn-id"]');

            // First search
            await input.setValue('100');
            await input.trigger('keydown', { key: 'Enter' });
            expect(resource.searchItems[0]?.exact).toBe(true);

            // Clear
            await clearBtn.trigger('click');
            expect(resource.searchItems).toHaveLength(0);

            // Second search
            await input.setValue('200');
            await input.trigger('keydown', { key: 'Enter' });
            expect(resource.searchItems[0]?.exact).toBe(true);
        });
    });

    describe('non-number column behavior', () => {
        it('should NOT use exact match for non-number columns (Enter key)', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('John');
            await input.trigger('keydown', { key: 'Enter' });

            const searchItems = resource.searchItems;
            expect(searchItems).toHaveLength(1);
            expect(searchItems[0]).toEqual({
                field: 'name',
                term: 'John',
            });
            expect(Object.keys(searchItems[0]!)).not.toContain('exact');
        });

        it('should NOT use exact match for non-number columns (button click)', async () => {
            const cell: HeaderCell = {
                content: 'Email',
                key: 'email',
                field: 'email',
                searchable: true,
                number: false,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            const searchBtn = wrapper.find('[data-testid="search-btn-email"]');

            await input.setValue('test@example.com');
            await searchBtn.trigger('click');

            const searchItems = resource.searchItems;
            expect(searchItems).toHaveLength(1);
            expect(searchItems[0]?.exact).toBeUndefined();
        });

        it('should update existing search without exact for non-number columns', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            resource.addSearch('name', 'John');

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('Jane');
            await input.trigger('keydown', { key: 'Enter' });

            const searchItems = resource.searchItems;
            expect(searchItems).toHaveLength(1);
            expect(searchItems[0]).toEqual({
                field: 'name',
                term: 'Jane',
            });
            expect(Object.keys(searchItems[0]!)).not.toContain('exact');
        });
    });

    describe('queryParams integration', () => {
        it('should include exact: true in queryParams for number columns', async () => {
            const cell: HeaderCell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                searchable: true,
                number: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('999');
            await input.trigger('keydown', { key: 'Enter' });

            const queryParams = resource.queryParams;
            expect(queryParams.searchable).toBeDefined();
            expect((queryParams.searchable as any)[0]).toEqual({
                field: 'id',
                term: '999',
                exact: true,
            });
        });

        it('should NOT include exact in queryParams for non-number columns', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('Test');
            await input.trigger('keydown', { key: 'Enter' });

            const queryParams = resource.queryParams;
            expect(queryParams.searchable).toBeDefined();
            const searchable = queryParams.searchable as any;
            expect(searchable[0].exact).toBeUndefined();
        });
    });

    describe('edge cases', () => {
        it('should handle number: false explicitly as non-number column', async () => {
            const cell: HeaderCell = {
                content: 'Count',
                key: 'count',
                field: 'count',
                searchable: true,
                number: false,
            };

            const wrapper = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell,
                },
            });

            const input = wrapper.find('input');
            await input.setValue('5');
            await input.trigger('keydown', { key: 'Enter' });

            const searchItems = resource.searchItems;
            expect(searchItems[0]?.exact).toBeUndefined();
        });

        it('should handle mixed searches (number and non-number)', async () => {
            // First add number column search
            const numberCell: HeaderCell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                searchable: true,
                number: true,
            };

            const wrapper1 = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell: numberCell,
                },
            });

            const input1 = wrapper1.find('input');
            await input1.setValue('123');
            await input1.trigger('keydown', { key: 'Enter' });

            // Then add non-number column search
            const textCell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                searchable: true,
            };

            const wrapper2 = mount(TableHeaderSearchCell, {
                props: {
                    storeId,
                    cell: textCell,
                },
            });

            const input2 = wrapper2.find('input');
            await input2.setValue('John');
            await input2.trigger('keydown', { key: 'Enter' });

            const searchItems = resource.searchItems;
            expect(searchItems).toHaveLength(2);
            expect(searchItems[0]).toEqual({
                field: 'id',
                term: '123',
                exact: true,
            });
            expect(searchItems[1]).toEqual({
                field: 'name',
                term: 'John',
            });
            expect(Object.keys(searchItems[1]!)).not.toContain('exact');
        });
    });
});
