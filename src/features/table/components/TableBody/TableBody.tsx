import { defineComponent, h, computed } from 'vue';
import { useApiResourcesStore, useExistingCoreStore } from '../../../../state';
import type { HeaderCell } from '../../../../types/api-response.types';
import { DEFAULT_EMPTY_STATE_MESSAGE } from '../../../../lib/default-values.lib';
import { isCellVisible } from '../../utils/column-visibility';
import { TableBodyRow } from './TableBodyRow';

/**
 * TableBody Component
 *
 * Renders the `<tbody>` section of the table.
 * Connects to the store to retrieve items and header configuration.
 * Automatically determines columns based on the last row of the header.
 * Displays an empty state message if data is loaded but empty.
 */
export const TableBody = defineComponent({
    name: 'TableBody',
    props: {
        /**
         * The unique identifier for the store instance.
         */
        storeId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const core = useExistingCoreStore(props.storeId);
        const resource = useApiResourcesStore(props.storeId, core);

        const items = computed(() => resource.displayItems);
        const header = computed(() => resource.header);

        /** Columns the user switched off in the settings panel. */
        const hiddenColumns = computed(() => resource.hiddenColumns);

        /**
         * Empty state text, resolved in priority order:
         * `labels.emptyState` → the deprecated `emptyStateMessage` → the built-in default.
         *
         * `labels.emptyState` is checked with `??` (an explicit empty string hides the
         * text, matching the rest of the `labels` set), while `emptyStateMessage` keeps
         * its original `||` semantics so its previous behaviour is unchanged.
         */
        const emptyStateText = computed(
            () =>
                core.config.labels.emptyState ??
                (core.config.emptyStateMessage || DEFAULT_EMPTY_STATE_MESSAGE)
        );

        // Determine columns from the last row of the header
        const columns = computed<HeaderCell[]>(() => {
            if (!header.value || !header.value.rows || header.value.rows.length === 0) {
                return [];
            }

            // Per the plan: "Determine the columns from the last row of header.rows"
            // "Only consider cells as columns that have a key and field property"
            // Note: HeaderCell always has 'key'. 'field' is optional but plan requests it.

            // Find the last row that has cells
            // Usually the last row in the array represents the data columns
            const lastRowIndex = header.value.rows.length - 1;
            const lastRow = header.value.rows[lastRowIndex];

            if (!lastRow || !lastRow.cells) {
                return [];
            }

            return lastRow.cells.filter(cell => {
                // show: false (response side) and user-hidden columns are excluded
                if (!isCellVisible(cell, hiddenColumns.value)) return false;
                // Support single-field (cell.field) and multi-field (cell.fields) columns
                return cell.key && (cell.field || (cell.fields && cell.fields.length > 0));
            });
        });

        // Compute total column count for colspan (empty state)
        // BUG FIX: Always use the FIRST row to calculate column count.
        // In multi-row headers, subsequent rows might not cover the full width (due to rowspans in the first row),
        // or might have different structures locally. The first row defines the primary column structure.
        const totalColumnCount = computed(() => {
            if (!header.value || !header.value.rows || header.value.rows.length === 0) {
                return 1;
            }

            const firstRow = header.value.rows[0];

            if (!firstRow || !firstRow.cells) {
                return 1;
            }

            // Hidden columns don't count toward the empty-state colspan
            return firstRow.cells
                .filter(cell => isCellVisible(cell, hiddenColumns.value))
                .reduce((acc, cell) => acc + (cell.colspan || 1), 0);
        });

        return () => {
            // "If there are no items or it's empty, render nothing (return null)"
            // UPDATE: If items is null or undefined, we don't render (no data yet).
            // If items exists but is an empty array, we render the Empty State.
            if (items.value === null || items.value === undefined) {
                return null;
            }

            if (items.value.length === 0) {
                return h(
                    'tbody',
                    {
                        'data-testid': 'table-body',
                    },
                    [
                        h(
                            'tr',
                            {
                                'data-testid': 'table-body-empty-row',
                            },
                            h(
                                'td',
                                {
                                    'data-testid': 'table-body-empty-cell',
                                    colspan: totalColumnCount.value,
                                    class: 'text-center',
                                },
                                h(
                                    'span',
                                    {
                                        class: 'text-muted fst-italic',
                                    },
                                    emptyStateText.value
                                )
                            )
                        ),
                    ]
                );
            }

            return h(
                'tbody',
                {
                    'data-testid': 'table-body',
                },
                items.value.map((item, index) =>
                    h(TableBodyRow, {
                        key: index, // Use index as key if no unique id is known yet (plan doesn't specify unique id)
                        item: item as Record<string, unknown>,
                        columns: columns.value,
                        rowIndex: index,
                        storeId: props.storeId,
                    })
                )
            );
        };
    },
});
