import { defineComponent, h, computed, type VNode } from 'vue';
import { useApiResourcesStore, useExistingCoreStore } from '../../../../state';
import { buildActiveFilterBadges, type ActiveFilterBadge } from '../../utils/active-filters';

/**
 * FilterBadges Component
 *
 * Renders every active filter — the global search term, the per-column searches and
 * the per-column value filters — as a removable badge.
 *
 * @remarks
 * The same component serves two placements: the toolbar's bottom row shows the bare
 * badge list, while the settings panel passes `showClearAll` and gets the "clear
 * everything" button plus the empty-state text with it. Splitting them into two
 * components would have duplicated the badge building and the three remove handlers.
 *
 * Removing a badge calls the store action that owns it (`clearGlobalSearch`,
 * `removeSearch`, `removeFilter`), so a client-side table re-slices immediately and a
 * server-side one refetches through the normal `queryParams` watcher.
 *
 * @example
 * ```tsx
 * <FilterBadges storeId="my-table" />
 * <FilterBadges storeId="my-table" showClearAll={true} />
 * ```
 */
export const FilterBadges = defineComponent({
    name: 'FilterBadges',
    props: {
        /**
         * The unique identifier for the store instance.
         */
        storeId: {
            type: String,
            required: true,
        },
        /**
         * Show the "clear all" button and the empty-state text.
         * The compact toolbar placement leaves both off.
         */
        showClearAll: {
            type: Boolean,
            default: false,
        },
    },
    setup(props) {
        const core = useExistingCoreStore(props.storeId);
        const resource = useApiResourcesStore(props.storeId, core);

        // The `?? []` fallbacks are the store boundary, not paranoia: `Aura` mounts this
        // component before the api-resources store has been filled in, and a host that
        // stubs the store (tests, storybook) hands back a partial object. An undefined
        // slice must render an empty badge list, not throw inside the toolbar.
        const badges = computed<ActiveFilterBadge[]>(() =>
            buildActiveFilterBadges({
                header: resource.header ?? null,
                searchItems: resource.searchItems ?? [],
                filterItems: resource.filterItems ?? [],
                globalSearchTerm: resource.globalSearchTerm ?? null,
                globalSearchLabel: core.config.labels.search,
            })
        );

        /** Routes a badge's remove button to the store action that owns it. */
        const removeBadge = (badge: ActiveFilterBadge): void => {
            if (badge.kind === 'global') {
                resource.clearGlobalSearch();
                return;
            }
            if (badge.kind === 'search') {
                resource.removeSearch(badge.field);
                return;
            }
            resource.removeFilter(badge.field);
        };

        /** Empties every filter slice at once. */
        const clearAll = (): void => {
            resource.clearGlobalSearch();
            resource.clearAllSearches();
            resource.clearAllFilters();
        };

        const renderBadge = (badge: ActiveFilterBadge): VNode =>
            h(
                'span',
                {
                    key: badge.id,
                    class: 'badge text-bg-light border d-inline-flex align-items-center gap-1',
                    'data-testid': `filter-badge-${badge.id}`,
                },
                [
                    h('span', { class: 'fw-semibold' }, `${badge.label}:`),
                    h('span', {}, badge.value),
                    h('button', {
                        type: 'button',
                        class: 'btn-close btn-close-sm',
                        'aria-label': core.config.labels.removeFilter,
                        'data-testid': `filter-badge-remove-${badge.id}`,
                        onClick: () => removeBadge(badge),
                    }),
                ]
            );

        const renderClearAll = (): VNode =>
            h(
                'button',
                {
                    type: 'button',
                    class: 'btn btn-sm btn-outline-secondary',
                    'data-testid': 'filter-badges-clear-all',
                    onClick: clearAll,
                },
                core.config.labels.clearAllFilters
            );

        return () => {
            const children: VNode[] = badges.value.map(renderBadge);

            if (props.showClearAll) {
                if (children.length === 0) {
                    children.push(
                        h(
                            'span',
                            {
                                class: 'small text-muted',
                                'data-testid': 'filter-badges-empty',
                            },
                            core.config.labels.noActiveFilters
                        )
                    );
                } else {
                    children.push(renderClearAll());
                }
            }

            return h(
                'div',
                {
                    'data-testid': 'filter-badges',
                    class: 'd-flex flex-wrap align-items-center gap-2',
                },
                children
            );
        };
    },
});
