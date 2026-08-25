import { defineComponent, h, type PropType } from 'vue';
import type { FooterRow } from '../../../../types/api-response.types';
import { filterVisibleCells } from '../../utils/column-visibility';
import { TableFooterCell } from './TableFooterCell';

/**
 * TableFooterRow Component
 *
 * Renders a single `<tr>` element within the table footer.
 * Iterates through the cells defined in the row configuration and renders `TableFooterCell` components.
 */
export const TableFooterRow = defineComponent({
    name: 'TableFooterRow',
    props: {
        /**
         * The footer row configuration object containing cells.
         */
        row: {
            type: Object as PropType<FooterRow>,
            required: true,
        },
        /**
         * The index of the row within the footer.
         */
        rowIndex: {
            type: Number,
            required: true,
        },
        /**
         * The store ID.
         */
        storeId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        return () => {
            const { row, rowIndex } = props;
            // show: false columns are excluded (initial hiding)
            const cells = filterVisibleCells(row.cells || []);

            if (cells.length === 0) {
                return h('tr', {
                    'data-testid': 'table-footer-row',
                    'data-row-index': rowIndex,
                });
            }

            return h(
                'tr',
                {
                    'data-testid': 'table-footer-row',
                    'data-row-index': rowIndex,
                },
                cells.map((cell, index) =>
                    h(TableFooterCell, {
                        key: cell.key || index,
                        cell: cell,
                        cellIndex: index,
                        storeId: props.storeId,
                    })
                )
            );
        };
    },
});
