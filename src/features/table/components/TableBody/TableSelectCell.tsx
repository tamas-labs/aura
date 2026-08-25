import { defineComponent, h, computed, type PropType } from 'vue';
import type { HeaderCell } from '../../../../types';
import { useApiResourcesStore, useExistingCoreStore } from '../../../../state';
import { resolveRowId, resolveRowIdField } from '../../utils';

/**
 * TableSelectCell Component
 *
 * The body cell of a `selectable: true` column: per-row selector checkbox.
 * The row's identifier is resolved from the `selectable` column's `field` (default `id`);
 * if it can't be resolved (e.g. an object value), the checkbox is disabled.
 */
export const TableSelectCell = defineComponent({
    name: 'TableSelectCell',
    props: {
        /**
         * The unique identifier for the store instance.
         */
        storeId: {
            type: String,
            required: true,
        },
        /**
         * The selectable header cell (source of the row-id field).
         */
        cell: {
            type: Object as PropType<HeaderCell>,
            required: true,
        },
        /**
         * The row data object.
         */
        item: {
            type: Object as PropType<Record<string, unknown>>,
            required: true,
        },
        /**
         * The index of the cell within the row.
         */
        cellIndex: {
            type: Number,
            required: true,
        },
    },
    setup(props) {
        const core = useExistingCoreStore(props.storeId);
        const resource = useApiResourcesStore(props.storeId, core);

        const rowId = computed(() => resolveRowId(props.item, resolveRowIdField(props.cell)));

        const isChecked = computed(
            () => rowId.value !== null && resource.isRowSelected(rowId.value)
        );

        const handleChange = () => {
            if (rowId.value !== null) {
                resource.toggleRowSelection(rowId.value);
            }
        };

        return () => {
            return h('td', { 'data-testid': 'table-select-cell', class: 'text-center' }, [
                h('input', {
                    type: 'checkbox',
                    class: 'form-check-input',
                    checked: isChecked.value,
                    disabled: rowId.value === null,
                    'data-testid': `row-select-${rowId.value ?? props.cellIndex}`,
                    'aria-label': core.config.labels.selectRow,
                    onChange: handleChange,
                }),
            ]);
        };
    },
});
