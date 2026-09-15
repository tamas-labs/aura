import { defineComponent, h, type PropType } from 'vue';
import { useExistingCoreStore } from '../../../../state';
import { RowsSelect } from './RowsSelect';
import { GlobalSearch } from './GlobalSearch';
import { ToolbarTitle } from './ToolbarTitle';
import { ActionButtons } from './ActionButtons';
import { FilterBadges } from './FilterBadges';
import { SettingsPanel } from './SettingsPanel';

/**
 * Toolbar Component
 * Top toolbar containing pagination controls, global search and action buttons.
 *
 * @remarks
 * The GlobalSearch component is conditionally rendered based on the `showHeaderSearch` config value.
 * - When `showHeaderSearch === true`: Layout is 3-6-3 grid (Title | Search | Actions)
 * - When `showHeaderSearch !== true`: Layout is 6-0-6 grid (Title | Actions), search is hidden
 *
 * Title, search and action buttons are all off by default. When none of them is enabled the
 * whole top row is skipped, so no empty, margined row sits above the rows select.
 *
 * The "showing X-Y of Z" line is deliberately *not* part of the toolbar: `PaginationInfo`
 * already renders it below the table from `displayMeta`, the only source that stays correct
 * under client-side pagination and filtering.
 *
 * @example
 * ```tsx
 * <Toolbar
 *     storeId="my-table"
 *     paginateValues={[10, 25, 50]}
 *     rowsNumber={25}
 *     onRowsChange={(rows) => console.log(rows)}
 * />
 * ```
 */
export const Toolbar = defineComponent({
    name: 'Toolbar',
    props: {
        /**
         * List of available pagination values
         */
        paginateValues: {
            type: Array as PropType<number[]>,
            required: true,
        },
        /**
         * Currently selected rows number
         */
        rowsNumber: {
            type: Number,
            required: true,
        },
        /**
         * Callback for rows number change
         */
        onRowsChange: {
            type: Function as PropType<(value: number) => void>,
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
        const core = useExistingCoreStore(props.storeId);

        return () => {
            const showHeaderSearch = core.config.showHeaderSearch === true;
            const showToolbarTitle = core.config.showToolbarTitle === true;
            const actionButtons = core.config.actionButtons || [];
            const hasActionButtons = actionButtons.length > 0;
            const hasTopRow = showToolbarTitle || showHeaderSearch || hasActionButtons;

            // Layout logic
            // 4 cases are possible (Title ON/OFF x Search ON/OFF)
            let titleClass = '';
            let searchClass = '';
            let actionsClass = '';

            if (showToolbarTitle && showHeaderSearch) {
                // Original layout: 3-6-3
                titleClass = 'col-12 col-md-3 mb-2 mb-md-0';
                searchClass = 'col-12 col-md-6 mb-2 mb-md-0';
                actionsClass = 'col-12 col-md-3 d-flex justify-content-md-end';
            } else if (showToolbarTitle && !showHeaderSearch) {
                // Title present, no search: 6-0-6
                titleClass = 'col-12 col-md-6 mb-2 mb-md-0';
                actionsClass = 'col-12 col-md-6 d-flex justify-content-md-end';
            } else if (!showToolbarTitle && showHeaderSearch) {
                // No title, search present: 0-9-3
                searchClass = 'col-12 col-md-9 mb-2 mb-md-0';
                actionsClass = 'col-12 col-md-3 d-flex justify-content-md-end';
            } else {
                // Nothing on the left side: 0-0-12
                actionsClass = 'col-12 d-flex justify-content-md-end';
            }

            return h(
                'div',
                {
                    class: 'mb-3',
                    'data-testid': 'aura-toolbar',
                },
                [
                    // Top Row — skipped entirely when title, search and actions are all off
                    hasTopRow &&
                        h('div', { class: 'row align-items-center mb-2' }, [
                            // Left: Title
                            showToolbarTitle &&
                                h(
                                    'div',
                                    { class: titleClass },
                                    h(ToolbarTitle, { storeId: props.storeId })
                                ),

                            // Center: Search
                            showHeaderSearch &&
                                h(
                                    'div',
                                    { class: searchClass },
                                    h(GlobalSearch, {
                                        storeId: props.storeId,
                                    })
                                ),

                            // Right: Actions
                            hasActionButtons
                                ? h(
                                      'div',
                                      { class: actionsClass },
                                      h(ActionButtons, {
                                          storeId: props.storeId,
                                      })
                                  )
                                : // If there's no action button, the grid still needs to be filled
                                  h('div', { class: actionsClass }),
                        ]),

                    // Bottom Row
                    h('div', { class: 'row align-items-center' }, [
                        // Left: Rows Select
                        h(
                            'div',
                            { class: 'col-12 col-md-4' },
                            h(RowsSelect, {
                                values: props.paginateValues,
                                selected: props.rowsNumber,
                                onChange: props.onRowsChange,
                                labels: core.config.labels,
                            })
                        ),

                        // Right: Filter Badges
                        h(
                            'div',
                            { class: 'col-12 col-md-8 d-none d-md-block' },
                            h(FilterBadges, { storeId: props.storeId })
                        ),
                    ]),

                    // Settings Panel
                    h(SettingsPanel, {
                        storeId: props.storeId,
                        isOpen: core.isSettingsOpen,
                    }),
                ]
            );
        };
    },
});
