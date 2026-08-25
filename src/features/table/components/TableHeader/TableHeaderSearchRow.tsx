import { defineComponent, h, type PropType } from 'vue';
import type { HeaderCell } from '../../../../types';
import { TableHeaderSearchCell } from './TableHeaderSearchCell';
import { TableHeaderBetweenCell } from './TableHeaderBetweenCell';
import { resolveHeaderScope } from '../header-footer-cell.shared';

/**
 * TableHeaderSearchRow Component
 *
 * Renders a row of search inputs for the table header.
 * Iterates through the provided cells and renders `TableHeaderSearchCell` if the column is searchable,
 * or an empty `<th>` if not (to maintain table structure).
 */
export const TableHeaderSearchRow = defineComponent({
    name: 'TableHeaderSearchRow',
    props: {
        /**
         * The unique identifier for the store instance.
         */
        storeId: {
            type: String,
            required: true,
        },
        /**
         * The cells of the last header row to align search inputs correctly.
         */
        cells: {
            type: Array as PropType<HeaderCell[]>,
            required: true,
        },
    },
    setup(props) {
        return () => {
            if (props.cells.length === 0) {
                return null;
            }

            return h(
                'tr',
                {
                    'data-testid': 'table-header-search-row',
                },
                props.cells.map((cell, index) => {
                    if (cell.searchable) {
                        // For a range (between) column, a two-input search cell.
                        const searchComponent = cell.between
                            ? TableHeaderBetweenCell
                            : TableHeaderSearchCell;
                        return h(searchComponent, {
                            key: cell.key || cell.field || index,
                            storeId: props.storeId,
                            cell: cell,
                        });
                    }

                    // Render empty th for non-searchable columns to maintain layout
                    return h('th', {
                        key: index,
                        scope: resolveHeaderScope(cell),
                        colspan: cell.colspan,
                        rowspan: cell.rowspan,
                        // Maintain width if specified
                        style: cell.width ? { width: cell.width } : undefined,
                    });
                })
            );
        };
    },
});
