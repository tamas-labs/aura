import { defineComponent, h, computed, type PropType } from 'vue';
import { useApiResourcesStore, useExistingCoreStore } from '../../../../state';
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
        const core = useExistingCoreStore(props.storeId);
        const resource = useApiResourcesStore(props.storeId, core);

        /** Columns the user switched off in the settings panel. */
        const hiddenColumns = computed(() => resource.hiddenColumns);

        return () => {
            const { row, rowIndex } = props;
            // show: false (response side) and user-hidden columns are excluded
            const cells = filterVisibleCells(row.cells || [], hiddenColumns.value);

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
