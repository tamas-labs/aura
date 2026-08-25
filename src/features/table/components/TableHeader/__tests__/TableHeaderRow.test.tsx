import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableHeaderRow } from '../TableHeaderRow';
import { TableHeaderCell } from '../TableHeaderCell';
import type { HeaderRow } from '../../../../../types/api-response.types';

describe('TableHeaderRow', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('rendering', () => {
        it('should render tr element', () => {
            const row: HeaderRow = {
                cells: [
                    { content: 'Name', key: 'name' },
                    { content: 'Email', key: 'email' },
                ],
            };

            const wrapper = mount(TableHeaderRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId: 'test-store',
                },
            });

            const tr = wrapper.find('tr');
            expect(tr.exists()).toBe(true);
        });

        it('should render with data-testid attribute', () => {
            const row: HeaderRow = {
                cells: [{ content: 'ID', key: 'id' }],
            };

            const wrapper = mount(TableHeaderRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId: 'test-store',
                },
            });

            expect(wrapper.find('[data-testid="table-header-row"]').exists()).toBe(true);
        });

        it('should render with data-row-index attribute', () => {
            const row: HeaderRow = {
                cells: [{ content: 'ID', key: 'id' }],
            };

            const wrapper = mount(TableHeaderRow, {
                props: {
                    row,
                    rowIndex: 2,
                    storeId: 'test-store',
                },
            });

            const tr = wrapper.find('tr');
            expect(tr.attributes('data-row-index')).toBe('2');
        });

        it('should render correct number of cells', () => {
            const row: HeaderRow = {
                cells: [
                    { content: 'ID', key: 'id' },
                    { content: 'Name', key: 'name' },
                    { content: 'Email', key: 'email' },
                ],
            };

            const wrapper = mount(TableHeaderRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId: 'test-store',
                },
            });

            const cells = wrapper.findAllComponents(TableHeaderCell);
            expect(cells).toHaveLength(3);
        });

        it('should pass correct props to each cell', () => {
            const row: HeaderRow = {
                cells: [
                    { content: 'ID', key: 'id' },
                    { content: 'Name', key: 'name' },
                ],
            };

            const wrapper = mount(TableHeaderRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId: 'test-store',
                },
            });

            const cells = wrapper.findAllComponents(TableHeaderCell);

            expect(cells[0]!.props('cell')).toEqual({ content: 'ID', key: 'id' });
            expect(cells[0]!.props('cellIndex')).toBe(0);

            expect(cells[1]!.props('cell')).toEqual({ content: 'Name', key: 'name' });
            expect(cells[1]!.props('cellIndex')).toBe(1);
        });

        it('should render single cell', () => {
            const row: HeaderRow = {
                cells: [{ content: 'Single', key: 'single' }],
            };

            const wrapper = mount(TableHeaderRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId: 'test-store',
                },
            });

            const cells = wrapper.findAllComponents(TableHeaderCell);
            expect(cells).toHaveLength(1);
        });

        it('should render many cells', () => {
            const cells = Array.from({ length: 10 }, (_, i) => ({
                content: `Cell ${i}`,
                key: `cell-${i}`,
            }));

            const row: HeaderRow = { cells };

            const wrapper = mount(TableHeaderRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId: 'test-store',
                },
            });

            const renderedCells = wrapper.findAllComponents(TableHeaderCell);
            expect(renderedCells).toHaveLength(10);
        });
    });

    describe('edge cases', () => {
        it('should render empty tr when cells array is empty', () => {
            const row: HeaderRow = {
                cells: [],
            };

            const wrapper = mount(TableHeaderRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId: 'test-store',
                },
            });

            const tr = wrapper.find('tr');
            expect(tr.exists()).toBe(true);

            const cells = wrapper.findAllComponents(TableHeaderCell);
            expect(cells).toHaveLength(0);
        });

        it('should render empty tr when cells is undefined', () => {
            const row: HeaderRow = {};

            const wrapper = mount(TableHeaderRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId: 'test-store',
                },
            });

            const tr = wrapper.find('tr');
            expect(tr.exists()).toBe(true);

            const cells = wrapper.findAllComponents(TableHeaderCell);
            expect(cells).toHaveLength(0);
        });

        it('should handle row with different rowIndex values', () => {
            const row: HeaderRow = {
                cells: [{ content: 'Test', key: 'test' }],
            };

            const wrapper1 = mount(TableHeaderRow, {
                props: { row, rowIndex: 0, storeId: 'test-store' },
            });
            expect(wrapper1.find('tr').attributes('data-row-index')).toBe('0');

            const wrapper2 = mount(TableHeaderRow, {
                props: { row, rowIndex: 5, storeId: 'test-store' },
            });
            expect(wrapper2.find('tr').attributes('data-row-index')).toBe('5');
        });
    });

    describe('cell with complex properties', () => {
        it('should render cells with colspan and rowspan', () => {
            const row: HeaderRow = {
                cells: [
                    { content: 'ID', key: 'id', rowspan: 2 },
                    { content: 'Price', key: 'price', colspan: 3 },
                ],
            };

            const wrapper = mount(TableHeaderRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId: 'test-store',
                },
            });

            const cells = wrapper.findAllComponents(TableHeaderCell);
            expect(cells).toHaveLength(2);

            const firstCell = wrapper.find('th[data-key="id"]');
            expect(firstCell.attributes('rowspan')).toBe('2');

            const secondCell = wrapper.find('th[data-key="price"]');
            expect(secondCell.attributes('colspan')).toBe('3');
        });

        it('should render cells with styling', () => {
            const row: HeaderRow = {
                cells: [
                    {
                        content: 'Styled',
                        key: 'styled',
                        width: '100px',
                        align: 'center',
                        class: 'fw-bold',
                    },
                ],
            };

            const wrapper = mount(TableHeaderRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId: 'test-store',
                },
            });

            const cell = wrapper.find('th');
            expect(cell.attributes('style')).toContain('width: 100px');
            expect(cell.attributes('style')).toContain('text-align: center');
            expect(cell.classes()).toContain('fw-bold');
        });
    });

    describe('selectable delegation', () => {
        it('should render a select-all cell for a selectable column', () => {
            const row: HeaderRow = {
                cells: [
                    { content: '', key: 'select', field: 'id', selectable: true },
                    { content: 'Name', key: 'name', field: 'name' },
                ],
            };

            const wrapper = mount(TableHeaderRow, {
                props: { row, rowIndex: 0, storeId: 'test-store-select' },
            });

            expect(wrapper.find('[data-testid="table-select-all-cell"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="select-all"]').exists()).toBe(true);
        });
    });
});
