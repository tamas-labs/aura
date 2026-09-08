import { defineComponent, h } from 'vue';
import { useExistingCoreStore } from '../../../../state';
import { ColumnVisibilityPanel } from './ColumnVisibilityPanel';
import { FilterBadges } from './FilterBadges';

/**
 * SettingsPanel Component
 * Collapsible panel for table settings.
 *
 * @remarks
 * Two sections, both live:
 * - **Column visibility** (`ColumnVisibilityPanel`) — a checkbox per data column,
 *   writing the api-resources store's `hiddenColumns`.
 * - **Active filters** (`FilterBadges` with `showClearAll`) — every active global
 *   search, column search and column filter as a removable badge.
 *
 * The panel owns no state of its own: the open/closed flag comes from the core store
 * via `isOpen`, and both sections read and write the api-resources store directly.
 *
 * @example
 * ```tsx
 * <SettingsPanel storeId="my-table" isOpen={true} />
 * ```
 */
export const SettingsPanel = defineComponent({
    name: 'SettingsPanel',
    props: {
        /**
         * The unique identifier for the store instance.
         */
        storeId: {
            type: String,
            required: true,
        },
        /**
         * Whether the panel is expanded.
         */
        isOpen: {
            type: Boolean,
            required: true,
        },
    },
    setup(props) {
        const core = useExistingCoreStore(props.storeId);

        return () => {
            const labels = core.config.labels;

            return h(
                'div',
                {
                    class: ['collapse', { show: props.isOpen }],
                    'data-testid': 'settings-panel',
                },
                [
                    h('div', { class: 'card card-body mt-2 bg-light' }, [
                        h('div', { class: 'row' }, [
                            h('div', { class: 'col-md-6 mb-3 mb-md-0' }, [
                                h('h6', {}, labels.columnVisibility),
                                h(ColumnVisibilityPanel, { storeId: props.storeId }),
                            ]),
                            h('div', { class: 'col-md-6' }, [
                                h('h6', {}, labels.activeFilters),
                                h(FilterBadges, {
                                    storeId: props.storeId,
                                    showClearAll: true,
                                }),
                            ]),
                        ]),
                    ]),
                ]
            );
        };
    },
});
