import { defineComponent, h, computed, type VNode } from 'vue';
import { useApiResourcesStore, useExistingCoreStore } from '../../../../state';
import type { HeaderCell } from '../../../../types/api-response.types';

/** One switchable column in the panel. */
interface ToggleableColumn {
    /** `HeaderCell.key` — what the store's hidden list is keyed by. */
    key: string;
    /** The text shown next to the checkbox. */
    label: string;
}

/**
 * The columns the user is allowed to switch off.
 *
 * Taken from the **last** header row, the one that holds the data columns. Three kinds
 * of cell are left out: a cell without a `key` (nothing to key the hidden list by), a
 * `show: false` cell (the response hid it, and that is not the user's to override), and
 * the `selectable` cell (hiding the checkbox column would strand the current selection).
 */
function toggleableColumns(cells: HeaderCell[]): ToggleableColumn[] {
    return cells
        .filter(cell => Boolean(cell.key) && cell.show !== false && !cell.selectable)
        .map(cell => ({ key: cell.key, label: String(cell.label ?? cell.content ?? cell.key) }));
}

/**
 * ColumnVisibilityPanel Component
 *
 * The checkbox list inside the settings panel: one row per data column, checked while
 * the column is visible.
 *
 * @remarks
 * Visibility is presentation-only state (`hiddenColumns` in the api-resources store), so
 * a toggle re-renders the header, body, footer and the CSV export without issuing a
 * request — in server-side mode too.
 *
 * The last remaining visible column's checkbox is disabled: a table with zero columns
 * renders an empty shell the user could not click their way out of.
 *
 * @example
 * ```tsx
 * <ColumnVisibilityPanel storeId="my-table" />
 * ```
 */
export const ColumnVisibilityPanel = defineComponent({
    name: 'ColumnVisibilityPanel',
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

        const columns = computed<ToggleableColumn[]>(() => {
            const rows = resource.header?.rows ?? [];
            const lastRow = rows.length > 0 ? rows[rows.length - 1] : undefined;
            return toggleableColumns((lastRow?.cells ?? []) as HeaderCell[]);
        });

        /** How many of the switchable columns are currently on screen. */
        const visibleCount = computed(
            () => columns.value.filter(column => !resource.isColumnHidden(column.key)).length
        );

        const hasHidden = computed(() => visibleCount.value < columns.value.length);

        const renderColumn = (column: ToggleableColumn): VNode => {
            const isVisible = !resource.isColumnHidden(column.key);
            // The last visible column cannot be switched off — see the component remarks.
            const isLocked = isVisible && visibleCount.value <= 1;
            const inputId = `${props.storeId}-column-${column.key}`;

            return h('div', { key: column.key, class: 'form-check' }, [
                h('input', {
                    type: 'checkbox',
                    class: 'form-check-input',
                    id: inputId,
                    checked: isVisible,
                    disabled: isLocked,
                    'data-testid': `column-toggle-${column.key}`,
                    onChange: () => resource.toggleColumn(column.key),
                }),
                h('label', { class: 'form-check-label', for: inputId }, column.label),
            ]);
        };

        return () => {
            const children: VNode[] = columns.value.map(renderColumn);

            if (hasHidden.value) {
                children.push(
                    h(
                        'button',
                        {
                            type: 'button',
                            class: 'btn btn-sm btn-outline-secondary mt-2',
                            'data-testid': 'column-visibility-show-all',
                            onClick: () => resource.showAllColumns(),
                        },
                        core.config.labels.showAllColumns
                    )
                );
            }

            return h(
                'div',
                {
                    'data-testid': 'column-visibility-panel',
                },
                children
            );
        };
    },
});
