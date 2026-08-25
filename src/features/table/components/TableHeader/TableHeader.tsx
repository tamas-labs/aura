import { defineComponent, h, computed } from 'vue';
import { useApiResourcesStore, useExistingCoreStore } from '../../../../state';
import { buildSectionSettingsAttrs } from '../../utils/section-settings';
import { filterVisibleCells, isCellVisible } from '../../utils/column-visibility';
import { TableHeaderRow } from './TableHeaderRow';
import { TableHeaderSearchRow } from './TableHeaderSearchRow';

/**
 * TableHeader Component
 *
 * Renders the table header section (`<thead>`).
 * Connects to the store to retrieve header configuration and rows.
 * Applies table-level classes defined in the configuration.
 */
export const TableHeader = defineComponent({
    name: 'TableHeader',
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
        // Store access based on storeId
        // Casting props to AuraProps for compatibility, although config access doesn't strictly need full props here if store exists
        const core = useExistingCoreStore(props.storeId);
        const resource = useApiResourcesStore(props.storeId, core);

        const header = computed(() => resource.header);

        /**
         * Checks if any cell in any row is searchable.
         * If global search is enabled (showHeaderSearch: true), local search is hidden.
         */
        const hasSearchableCells = computed(() => {
            // If global search is enabled, we hide the local search
            if (core.config.showHeaderSearch === true) {
                return false;
            }

            if (!header.value || !header.value.rows) return false;
            // The searchable flag of hidden (show: false) columns doesn't matter
            return header.value.rows.some(row =>
                row.cells?.some(cell => cell.searchable && isCellVisible(cell))
            );
        });

        /**
         * Gets the cells of the last row to align search inputs correctly.
         */
        const lastRowCells = computed(() => {
            if (!header.value || !header.value.rows || header.value.rows.length === 0) return [];
            // The search row aligns with the visible columns (show: false ones are excluded)
            return filterVisibleCells(header.value.rows[header.value.rows.length - 1]?.cells || []);
        });

        return () => {
            // If there's no header configuration or no rows, we render nothing
            if (!header.value || !header.value.rows || header.value.rows.length === 0) {
                return null;
            }

            const children = [
                ...header.value.rows.map((row, index) =>
                    h(TableHeaderRow, {
                        key: index,
                        row: row,
                        rowIndex: index,
                        storeId: props.storeId,
                    })
                ),
            ];

            if (hasSearchableCells.value) {
                children.push(
                    h(TableHeaderSearchRow, {
                        storeId: props.storeId,
                        cells: lastRowCells.value,
                    })
                );
            }

            // header.settings.sticky/height → <thead> attributes
            const settingsAttrs = buildSectionSettingsAttrs(
                header.value.settings,
                'aura-thead-sticky'
            );

            return h(
                'thead',
                {
                    'data-testid': 'table-header',
                    ...settingsAttrs,
                },
                children
            );
        };
    },
});
