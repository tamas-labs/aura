import { defineComponent, h } from 'vue';
import { useExistingCoreStore, useApiResourcesStore } from '../../../../state';
import type { HeaderCell } from '../../../../types';
import { filterVisibleCells } from '../../utils/column-visibility';
import { resolveCellField } from '../../utils/resolve-cell-field';
import { buildCsv, triggerCsvDownload, type CsvColumn } from '../../utils/export/build-csv';

/** The filename of the exported CSV. */
const CSV_FILENAME = 'export.csv';

/**
 * Converts a header cell into an exportable column: label (`label` → `content`
 * → `key` order) + the operation's target field (`resolveCellField`).
 */
function cellToCsvColumn(cell: HeaderCell): CsvColumn {
    const label = cell.label ?? cell.content ?? cell.key;
    return { header: String(label), field: resolveCellField(cell) };
}

/**
 * ActionButtons Component
 * Group of action buttons: Refresh, Export, Settings
 *
 * The `export` button downloads the rows of the **current view** (`displayItems`),
 * based on the visible columns, as a client-side CSV (`buildCsv` + `triggerCsvDownload`),
 * with no external dependency. A real `.xlsx` (Excel) export would need a host-side
 * library — the raw data (`items`) is available for it. `refresh` and `settings` are fully functional.
 *
 * @example
 * ```tsx
 * <ActionButtons storeId="my-store" />
 * ```
 */
export const ActionButtons = defineComponent({
    name: 'ActionButtons',
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

        const handleRefresh = () => {
            resource.fetchData();
        };

        const handleExportCsv = () => {
            const rows = resource.header?.rows;
            const lastRow = rows && rows.length > 0 ? rows[rows.length - 1] : undefined;
            const cells = (lastRow?.cells ?? []) as HeaderCell[];
            const columns = filterVisibleCells(cells).map(cellToCsvColumn);

            triggerCsvDownload(CSV_FILENAME, buildCsv(columns, resource.displayItems ?? []));
        };

        const handleSettingsToggle = () => {
            core.toggleSettings();
        };

        return () => {
            const actionButtons = core.config.actionButtons || [];
            const labels = core.config.labels;

            if (actionButtons.length === 0) {
                return null;
            }

            const showRefresh = actionButtons.includes('refresh');
            const showExport = actionButtons.includes('export');
            const showSettings = actionButtons.includes('settings');

            return h('div', { class: 'btn-group', role: 'group' }, [
                // Refresh Button
                showRefresh &&
                    h(
                        'button',
                        {
                            type: 'button',
                            class: 'btn btn-outline-secondary',
                            onClick: handleRefresh,
                            'data-testid': 'action-refresh',
                            title: labels.refresh,
                        },
                        h('i', { class: ['fas', 'fa-rotate-right'] })
                    ),

                // Export Dropdown
                showExport &&
                    h('div', { class: 'btn-group', role: 'group' }, [
                        h(
                            'button',
                            {
                                type: 'button',
                                class: 'btn btn-outline-secondary dropdown-toggle',
                                'data-bs-toggle': 'dropdown',
                                'data-testid': 'action-export-toggle',
                                title: labels.export,
                            },
                            [h('i', { class: ['fas', 'fa-download'] })]
                        ),
                        h(
                            'ul',
                            {
                                class: ['dropdown-menu', 'dropdown-menu-end'],
                                'data-testid': 'action-export-menu',
                            },
                            [
                                h(
                                    'li',
                                    {},
                                    h(
                                        'button',
                                        {
                                            class: 'dropdown-item',
                                            type: 'button',
                                            'data-testid': 'action-export-csv',
                                            onClick: handleExportCsv,
                                        },
                                        labels.exportCsv
                                    )
                                ),
                            ]
                        ),
                    ]),

                // Settings Button
                showSettings &&
                    h(
                        'button',
                        {
                            type: 'button',
                            class: [
                                'btn',
                                core.isSettingsOpen ? 'btn-secondary' : 'btn-outline-secondary',
                            ],
                            onClick: handleSettingsToggle,
                            'data-testid': 'action-settings',
                            title: labels.settings,
                        },
                        h('i', { class: ['fas', 'fa-gears'] })
                    ),
            ]);
        };
    },
});
