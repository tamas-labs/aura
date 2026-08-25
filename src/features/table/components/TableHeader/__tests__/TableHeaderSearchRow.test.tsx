import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableHeaderSearchRow } from '../TableHeaderSearchRow';
import type { HeaderCell } from '../../../../../types/api-response.types';

describe('TableHeaderSearchRow', () => {
    const storeId = 'test-table-header-search-row';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('rendering', () => {
        it('should render tr element', () => {
            const cells: HeaderCell[] = [
                { content: 'Name', key: 'name', field: 'name', searchable: true },
            ];

            const wrapper = mount(TableHeaderSearchRow, {
                props: {
                    storeId,
                    cells,
                },
            });

            expect(wrapper.find('tr').exists()).toBe(true);
            expect(wrapper.find('[data-testid="table-header-search-row"]').exists()).toBe(true);
        });

        it('should render search cells for searchable columns', () => {
            const cells: HeaderCell[] = [
                { content: 'Name', key: 'name', field: 'name', searchable: true },
                { content: 'Email', key: 'email', field: 'email', searchable: true },
            ];

            const wrapper = mount(TableHeaderSearchRow, {
                props: {
                    storeId,
                    cells,
                },
            });

            expect(wrapper.findAll('[data-testid="table-header-search-cell"]')).toHaveLength(2);
        });

        it('should render empty th for non-searchable columns', () => {
            const cells: HeaderCell[] = [
                { content: 'Name', key: 'name', field: 'name', searchable: true },
                { content: 'Age', key: 'age', field: 'age', searchable: false },
                { content: 'Email', key: 'email', field: 'email', searchable: true },
            ];

            const wrapper = mount(TableHeaderSearchRow, {
                props: {
                    storeId,
                    cells,
                },
            });

            const thElements = wrapper.findAll('th');
            expect(thElements).toHaveLength(3);
            expect(wrapper.findAll('[data-testid="table-header-search-cell"]')).toHaveLength(2);
        });

        it('should maintain colspan for non-searchable columns', () => {
            const cells: HeaderCell[] = [
                { content: 'Name', key: 'name', field: 'name', searchable: true },
                { content: 'Info', key: 'info', field: 'info', colspan: 2 },
            ];

            const wrapper = mount(TableHeaderSearchRow, {
                props: {
                    storeId,
                    cells,
                },
            });

            const thElements = wrapper.findAll('th');
            expect(thElements[1]?.attributes('colspan')).toBe('2');
            // A spanning cell labels a group of columns
            expect(thElements[1]?.attributes('scope')).toBe('colgroup');
        });

        it('should mark the placeholder cells as column headers', () => {
            const cells: HeaderCell[] = [
                { content: 'Name', key: 'name', field: 'name', searchable: true },
                { content: 'Age', key: 'age', field: 'age', searchable: false },
            ];

            const wrapper = mount(TableHeaderSearchRow, {
                props: {
                    storeId,
                    cells,
                },
            });

            expect(wrapper.findAll('th')[1]?.attributes('scope')).toBe('col');
        });

        it('should maintain rowspan for non-searchable columns', () => {
            const cells: HeaderCell[] = [
                { content: 'Name', key: 'name', field: 'name', searchable: true },
                { content: 'Actions', key: 'actions', rowspan: 2 },
            ];

            const wrapper = mount(TableHeaderSearchRow, {
                props: {
                    storeId,
                    cells,
                },
            });

            const thElements = wrapper.findAll('th');
            expect(thElements[1]?.attributes('rowspan')).toBe('2');
        });

        it('should maintain width for non-searchable columns', () => {
            const cells: HeaderCell[] = [
                { content: 'Name', key: 'name', field: 'name', searchable: true },
                { content: 'ID', key: 'id', field: 'id', width: '100px' },
            ];

            const wrapper = mount(TableHeaderSearchRow, {
                props: {
                    storeId,
                    cells,
                },
            });

            const thElements = wrapper.findAll('th');
            expect(thElements[1]?.attributes('style')).toContain('width: 100px');
        });
    });

    describe('between (range) delegation', () => {
        it('should render a between cell for searchable + between columns', () => {
            const cells: HeaderCell[] = [
                {
                    content: 'Age',
                    key: 'age',
                    field: 'age',
                    searchable: true,
                    between: true,
                    number: true,
                },
            ];

            const wrapper = mount(TableHeaderSearchRow, {
                props: { storeId, cells },
            });

            expect(wrapper.find('[data-testid="table-header-between-cell"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="table-header-search-cell"]').exists()).toBe(false);
        });

        it('should render a plain search cell when between is absent', () => {
            const cells: HeaderCell[] = [
                { content: 'Name', key: 'name', field: 'name', searchable: true },
            ];

            const wrapper = mount(TableHeaderSearchRow, {
                props: { storeId, cells },
            });

            expect(wrapper.find('[data-testid="table-header-search-cell"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="table-header-between-cell"]').exists()).toBe(false);
        });

        it('should mix between and plain search cells in one row', () => {
            const cells: HeaderCell[] = [
                { content: 'Name', key: 'name', field: 'name', searchable: true },
                {
                    content: 'Age',
                    key: 'age',
                    field: 'age',
                    searchable: true,
                    between: true,
                    number: true,
                },
            ];

            const wrapper = mount(TableHeaderSearchRow, {
                props: { storeId, cells },
            });

            expect(wrapper.findAll('[data-testid="table-header-search-cell"]')).toHaveLength(1);
            expect(wrapper.findAll('[data-testid="table-header-between-cell"]')).toHaveLength(1);
        });
    });

    describe('edge cases', () => {
        it('should render nothing when cells array is empty', () => {
            const wrapper = mount(TableHeaderSearchRow, {
                props: {
                    storeId,
                    cells: [],
                },
            });

            expect(wrapper.find('tr').exists()).toBe(false);
        });

        it('should handle mixed searchable and non-searchable columns', () => {
            const cells: HeaderCell[] = [
                { content: 'ID', key: 'id', field: 'id' },
                { content: 'Name', key: 'name', field: 'name', searchable: true },
                { content: 'Age', key: 'age', field: 'age' },
                { content: 'Email', key: 'email', field: 'email', searchable: true },
                { content: 'Status', key: 'status', field: 'status' },
            ];

            const wrapper = mount(TableHeaderSearchRow, {
                props: {
                    storeId,
                    cells,
                },
            });

            expect(wrapper.findAll('th')).toHaveLength(5);
            expect(wrapper.findAll('[data-testid="table-header-search-cell"]')).toHaveLength(2);
        });

        it('should use cell key as key prop when field is missing', () => {
            const cells: HeaderCell[] = [{ content: 'Name', key: 'name-key', searchable: true }];

            const wrapper = mount(TableHeaderSearchRow, {
                props: {
                    storeId,
                    cells,
                },
            });

            expect(wrapper.find('[data-testid="table-header-search-cell"]').exists()).toBe(true);
        });

        it('should use index as key when both key and field are missing', () => {
            const cells: HeaderCell[] = [
                { content: 'Name', key: 'name1', searchable: true },
                { content: 'Email', key: 'email1' },
            ];

            const wrapper = mount(TableHeaderSearchRow, {
                props: {
                    storeId,
                    cells,
                },
            });

            expect(wrapper.find('tr').exists()).toBe(true);
        });
    });
});
