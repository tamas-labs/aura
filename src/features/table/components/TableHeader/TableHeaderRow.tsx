import { defineComponent, h, type PropType } from 'vue';
import type { HeaderRow } from '../../../../types/api-response.types';
import { filterVisibleCells } from '../../utils/column-visibility';
import { TableHeaderCell } from './TableHeaderCell';
import { TableSelectAllCell } from './TableSelectAllCell';

/**
 * TableHeaderRow Component
 *
 * Renders a single `<tr>` element within the table header.
 * Iterates through the cells defined in the row configuration and renders `TableHeaderCell` components.
 */
export const TableHeaderRow = defineComponent({
    name: 'TableHeaderRow',
    props: {
        /**
         * The header row configuration object containing cells.
         */
        row: {
            type: Object as PropType<HeaderRow>,
            required: true,
        },
        /**
         * The index of the row within the header.
         */
        rowIndex: {
            type: Number,
            required: true,
        },
        /**
         * The unique identifier for the store instance.
         */
        storeId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        return () => {
            const { row, rowIndex, storeId } = props;
            // show: false columns are excluded (initial hiding)
            const cells = filterVisibleCells(row.cells || []);

            if (cells.length === 0) {
                return h('tr', {
                    'data-testid': 'table-header-row',
                    'data-row-index': rowIndex,
                });
            }

            return h(
                'tr',
                {
                    'data-testid': 'table-header-row',
                    'data-row-index': rowIndex,
                },
                cells.map((cell, index) => {
                    // The header of the selectable column is a "select all" checkbox.
                    if (cell.selectable) {
                        return h(TableSelectAllCell, {
                            key: cell.key || index,
                            cell: cell,
                            cellIndex: index,
                            storeId: storeId,
                        });
                    }
                    return h(TableHeaderCell, {
                        key: cell.key || index,
                        cell: cell,
                        cellIndex: index,
                        storeId: storeId,
                    });
                })
            );
        };
    },
});
