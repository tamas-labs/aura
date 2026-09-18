import { defineComponent, h, type PropType } from 'vue';
import { useExistingCoreStore } from '../../../../state';
import { RowsSelect } from './RowsSelect';
import { GlobalSearch } from './GlobalSearch';
import { ToolbarTitle } from './ToolbarTitle';
import { ActionButtons } from './ActionButtons';
import { SettingsPanel } from './SettingsPanel';

interface ToolbarLayout {
    titleClass: string;
    searchClass: string;
    actionsClass: string;
}

// Mobile spacing for the columns that stack above another one below the md breakpoint
const STACKED_SPACING = 'mb-2 mb-md-0';
// Width of the right-hand slot, shared by the action buttons and the search that replaces them
const RIGHT_SLOT = 'col-12 col-md-3';

/**
 * Resolves the top row's grid classes from the three toolbar switches.
 */
function resolveToolbarLayout(
    showTitle: boolean,
    showSearch: boolean,
    hasActions: boolean
): ToolbarLayout {
    if (showSearch && !hasActions) {
        // No action buttons: the search takes over their slot at the same width (9-0-3 / 0-0-3)
        return {
            titleClass: `col-12 col-md-9 ${STACKED_SPACING}`,
            searchClass: showTitle ? RIGHT_SLOT : `${RIGHT_SLOT} ms-auto`,
            actionsClass: '',
        };
    }

    const actionsClass = `${RIGHT_SLOT} d-flex justify-content-md-end`;

    if (showTitle && showSearch) {
        return {
            titleClass: `col-12 col-md-3 ${STACKED_SPACING}`,
            searchClass: `col-12 col-md-6 ${STACKED_SPACING}`,
            actionsClass,
        };
    }
    if (showTitle) {
        return {
            titleClass: `col-12 col-md-6 ${STACKED_SPACING}`,
            searchClass: '',
            actionsClass: 'col-12 col-md-6 d-flex justify-content-md-end',
        };
    }
    if (showSearch) {
        return { titleClass: '', searchClass: `col-12 col-md-9 ${STACKED_SPACING}`, actionsClass };
    }
    // Nothing on the left side: 0-0-12
    return {
        titleClass: '',
        searchClass: '',
        actionsClass: 'col-12 d-flex justify-content-md-end',
    };
}

/**
 * Toolbar Component
 * Top toolbar containing pagination controls, global search and action buttons.
 *
 * @remarks
 * Top row layouts (Title | Search | Actions, Bootstrap md columns):
 * - Title + search + actions: 3-6-3
 * - Title + actions: 6-0-6
 * - Search + actions: 0-9-3
 * - Actions only: 0-0-12
 * - Search without action buttons: the search moves into the actions' right-hand slot at the
 *   same `col-md-3` width, next to a `col-md-9` title or on its own (right-aligned)
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
            const { titleClass, searchClass, actionsClass } = resolveToolbarLayout(
                showToolbarTitle,
                showHeaderSearch,
                hasActionButtons
            );

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

                            // Center: Search (right-hand slot when there are no action buttons)
                            showHeaderSearch &&
                                h(
                                    'div',
                                    { class: searchClass },
                                    h(GlobalSearch, {
                                        storeId: props.storeId,
                                    })
                                ),

                            // Right: Actions
                            hasActionButtons &&
                                h(
                                    'div',
                                    { class: actionsClass },
                                    h(ActionButtons, {
                                        storeId: props.storeId,
                                    })
                                ),

                            // Without action buttons the grid still needs to be filled —
                            // unless the search has taken over their slot
                            !hasActionButtons &&
                                !showHeaderSearch &&
                                h('div', { class: actionsClass }),
                        ]),

                    // Bottom Row
                    h('div', { class: 'row align-items-center' }, [
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
