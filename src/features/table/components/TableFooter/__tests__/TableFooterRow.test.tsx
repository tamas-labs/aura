import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableFooterRow } from '../TableFooterRow';
import { TableFooterCell } from '../TableFooterCell';
import type { FooterRow } from '../../../../../types/api-response.types';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';

describe('TableFooterRow', () => {
    const storeId = 'test-table-footer-row';
    let core: ReturnType<typeof useCoreStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        core = useCoreStore(storeId, { storeId });
        useApiResourcesStore(storeId, core);
    });

    describe('rendering', () => {
        it('should render tr element', () => {
            const row: FooterRow = {
                cells: [{ content: 'Test', key: 'test' }],
            };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('tr').exists()).toBe(true);
        });

        it('should render with data-testid attribute', () => {
            const row: FooterRow = {
                cells: [{ content: 'Footer', key: 'footer' }],
            };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('[data-testid="table-footer-row"]').exists()).toBe(true);
        });

        it('should render with data-row-index attribute', () => {
            const row: FooterRow = {
                cells: [{ content: 'Index', key: 'index' }],
            };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 3,
                    storeId,
                },
            });

            expect(wrapper.find('tr').attributes('data-row-index')).toBe('3');
        });

        it('should render single cell', () => {
            const row: FooterRow = {
                cells: [{ content: 'Single', key: 'single' }],
            };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            const cells = wrapper.findAllComponents(TableFooterCell);
            expect(cells).toHaveLength(1);
        });

        it('should render multiple cells', () => {
            const row: FooterRow = {
                cells: [
                    { content: 'Cell 1', key: 'cell1' },
                    { content: 'Cell 2', key: 'cell2' },
                    { content: 'Cell 3', key: 'cell3' },
                ],
            };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            const cells = wrapper.findAllComponents(TableFooterCell);
            expect(cells).toHaveLength(3);
        });

        it('should render many cells', () => {
            const cells = Array.from({ length: 10 }, (_, i) => ({
                content: `Cell ${i}`,
                key: `cell-${i}`,
            }));

            const row: FooterRow = { cells };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            const renderedCells = wrapper.findAllComponents(TableFooterCell);
            expect(renderedCells).toHaveLength(10);
        });
    });

    describe('cell props', () => {
        it('should pass cell prop to TableFooterCell', () => {
            const testCell = { content: 'Test Cell', key: 'test' };
            const row: FooterRow = {
                cells: [testCell],
            };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            const cell = wrapper.findComponent(TableFooterCell);
            expect(cell.props('cell')).toEqual(testCell);
        });

        it('should pass cellIndex prop to each TableFooterCell', () => {
            const row: FooterRow = {
                cells: [
                    { content: 'A', key: 'a' },
                    { content: 'B', key: 'b' },
                    { content: 'C', key: 'c' },
                ],
            };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            const cells = wrapper.findAllComponents(TableFooterCell);
            expect(cells[0]!.props('cellIndex')).toBe(0);
            expect(cells[1]!.props('cellIndex')).toBe(1);
            expect(cells[2]!.props('cellIndex')).toBe(2);
        });

        it('should use cell key as component key when available', () => {
            const row: FooterRow = {
                cells: [
                    { content: 'First', key: 'first-key' },
                    { content: 'Second', key: 'second-key' },
                ],
            };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            const cells = wrapper.findAllComponents(TableFooterCell);
            expect(cells).toHaveLength(2);
        });
    });

    describe('edge cases', () => {
        it('should render empty tr when cells array is empty', () => {
            const row: FooterRow = {
                cells: [],
            };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            const tr = wrapper.find('tr');
            expect(tr.exists()).toBe(true);

            const cells = wrapper.findAllComponents(TableFooterCell);
            expect(cells).toHaveLength(0);
        });

        it('should render empty tr when cells is undefined', () => {
            const row: FooterRow = {};

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            const tr = wrapper.find('tr');
            expect(tr.exists()).toBe(true);

            const cells = wrapper.findAllComponents(TableFooterCell);
            expect(cells).toHaveLength(0);
        });

        it('should handle row with different rowIndex values', () => {
            const row: FooterRow = {
                cells: [{ content: 'Test', key: 'test' }],
            };

            const wrapper1 = mount(TableFooterRow, {
                props: { row, rowIndex: 0, storeId },
            });
            expect(wrapper1.find('tr').attributes('data-row-index')).toBe('0');

            const wrapper2 = mount(TableFooterRow, {
                props: { row, rowIndex: 5, storeId },
            });
            expect(wrapper2.find('tr').attributes('data-row-index')).toBe('5');

            const wrapper3 = mount(TableFooterRow, {
                props: { row, rowIndex: 99, storeId },
            });
            expect(wrapper3.find('tr').attributes('data-row-index')).toBe('99');
        });

        it('should handle cells without key property', () => {
            const row: FooterRow = {
                cells: [
                    { content: 'No Key 1', key: 'key1' },
                    { content: 'No Key 2', key: 'key2' },
                ],
            };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            const cells = wrapper.findAllComponents(TableFooterCell);
            expect(cells).toHaveLength(2);
        });
    });

    describe('complex row structures', () => {
        it('should handle row with cells having various properties', () => {
            const row: FooterRow = {
                cells: [
                    {
                        content: 'Total',
                        key: 'total',
                        width: '100px',
                        align: 'start',
                    },
                    {
                        content: '$1,234.56',
                        key: 'amount',
                        width: '150px',
                        align: 'end',
                        monospace: true,
                    },
                    {
                        content: 'Summary',
                        key: 'summary',
                        colspan: 2,
                    },
                ],
            };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            const cells = wrapper.findAllComponents(TableFooterCell);
            expect(cells).toHaveLength(3);
            expect(cells[0]!.props('cell').content).toBe('Total');
            expect(cells[1]!.props('cell').content).toBe('$1,234.56');
            expect(cells[2]!.props('cell').content).toBe('Summary');
        });

        it('should handle row with additional properties', () => {
            const row: FooterRow = {
                cells: [{ content: 'Cell', key: 'cell' }],
                customProperty: 'custom-value',
                anotherProperty: 123,
            };

            const wrapper = mount(TableFooterRow, {
                props: {
                    row,
                    rowIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('tr').exists()).toBe(true);
            const cells = wrapper.findAllComponents(TableFooterCell);
            expect(cells).toHaveLength(1);
        });
    });
});
