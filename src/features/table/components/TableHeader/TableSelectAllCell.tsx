import { defineComponent, h, computed, type PropType } from 'vue';
import type { HeaderCell, RowId } from '../../../../types';
import { useApiResourcesStore, useExistingCoreStore } from '../../../../state';
import { resolveRowId, resolveRowIdField } from '../../utils';
import { resolveHeaderScope } from '../header-footer-cell.shared';

/**
 * TableSelectAllCell Component
 *
 * The header cell of a `selectable: true` column: "select all" checkbox.
 * Handles the rows of the current page (`displayItems`) that have a resolvable id:
 * - all visible rows selected → checked, clicking deselects the visible rows;
 * - some of them selected → indeterminate;
 * - none selected → empty, clicking selects the visible rows.
 */
export const TableSelectAllCell = defineComponent({
    name: 'TableSelectAllCell',
    props: {
        /**
         * The unique identifier for the store instance.
         */
        storeId: {
            type: String,
            required: true,
        },
        /**
         * The selectable header cell (source of the row-id field, colspan/rowspan).
         */
        cell: {
            type: Object as PropType<HeaderCell>,
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

        const idField = computed(() => resolveRowIdField(props.cell));

        /** IDs of the rows visible on the current page that have a resolvable identifier. */
        const pageRowIds = computed<RowId[]>(() => {
            const items = resource.displayItems;
            if (!items) return [];
            return items.reduce<RowId[]>((ids, item) => {
                const id = resolveRowId(item, idField.value);
                if (id !== null) ids.push(id);
                return ids;
            }, []);
        });

        const allSelected = computed(
            () =>
                pageRowIds.value.length > 0 &&
                pageRowIds.value.every(id => resource.isRowSelected(id))
        );

        const indeterminate = computed(
            () => !allSelected.value && pageRowIds.value.some(id => resource.isRowSelected(id))
        );

        const handleChange = () => {
            if (allSelected.value) {
                resource.deselectRows(pageRowIds.value);
            } else {
                resource.selectRows(pageRowIds.value);
            }
        };

        return () => {
            const attributes: Record<string, unknown> = {
                'data-testid': 'table-select-all-cell',
                'data-key': props.cell.key,
                scope: resolveHeaderScope(props.cell),
                class: 'text-center',
            };
            if (props.cell.colspan) attributes.colspan = props.cell.colspan;
            if (props.cell.rowspan) attributes.rowspan = props.cell.rowspan;

            return h('th', attributes, [
                h('input', {
                    type: 'checkbox',
                    class: 'form-check-input',
                    checked: allSelected.value,
                    indeterminate: indeterminate.value,
                    disabled: pageRowIds.value.length === 0,
                    'data-testid': 'select-all',
                    'aria-label': core.config.labels.selectAllRows,
                    onChange: handleChange,
                }),
            ]);
        };
    },
});
