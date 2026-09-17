import { defineComponent, h, computed, type PropType } from 'vue';
import type { HeaderCell, FilterElement } from '../../../../types';
import { useApiResourcesStore, useExistingCoreStore } from '../../../../state';
import {
    useHeaderFooterCell,
    applyColspanRowspan,
    buildRawAwareContent,
    resolveHeaderScope,
} from '../header-footer-cell.shared';
import { resolveCellField } from '../../utils/resolve-cell-field';
import { FilterDropdown } from './FilterDropdown';
import { FilterCalendar } from './FilterCalendar';

/**
 * TableHeaderCell Component
 *
 * Renders a single `<th>` element within the table header.
 * Handles styling, alignment, and content rendering based on the `HeaderCell` configuration.
 * Supports sorting if enabled in the cell configuration.
 */
export const TableHeaderCell = defineComponent({
    name: 'TableHeaderCell',
    props: {
        /**
         * The header cell configuration object.
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

        /**
         * Determines if the current cell is sortable.
         */
        const isSortable = computed(() => !!props.cell.sortable);

        /**
         * Normalizes elements from various input formats to FilterElement[].
         */
        const normalizedElements = computed<FilterElement[]>(() => {
            const raw = props.cell.elements;
            if (!raw) return [];

            // Already an array
            if (Array.isArray(raw)) {
                if (raw.length === 0) return [];
                const first = raw[0];

                // Check if items are already FilterElement-like objects
                if (typeof first === 'object' && first !== null && 'value' in first) {
                    return raw as FilterElement[];
                }

                // Simple (string | number)[] -> map to { value, label }
                return (raw as (string | number)[]).map(val => ({
                    value: val,
                    label: val,
                }));
            }

            // Record<string, string | number> -> map to { value: key, label: value }
            if (typeof raw === 'object') {
                return Object.entries(raw).map(([key, val]) => ({
                    value: key,
                    label: val,
                }));
            }

            return [];
        });

        /**
         * A `filterable: true, date: true` column gets a calendar (`FilterCalendar`) instead
         * of the checkbox-list dropdown: a date field is exactly the high-cardinality case a
         * distinct-value checkbox list doesn't scale to. `extractFilterElements` already skips
         * auto-collecting `elements` for such a cell, so this is also the only signal available.
         */
        const isDateFilter = computed(() => !!props.cell.filterable && !!props.cell.date);

        /**
         * Determines if the current cell has filterable elements.
         *
         * Note: for `filterable: true` columns without `elements`, the store's
         * `extractFilterElements` (processResponse) fills in `elements` from the rows' distinct
         * values, so an already-enriched cell arrives here — the component has no separate
         * auto-distinct logic of its own.
         */
        const isFilterable = computed(() => {
            return isDateFilter.value || normalizedElements.value.length > 0;
        });

        /**
         * The field to operate on (sort/filter). Honours `reference` when set,
         * otherwise falls back to `field` or `key`.
         */
        const sortField = computed(() => resolveCellField(props.cell));

        /**
         * The current sort direction for this cell.
         */
        const currentSortDirection = computed(() => resource.getSortDirection(sortField.value));

        /**
         * Handles the sort toggle logic:
         * - None -> Asc
         * - Asc -> Desc
         * - Desc -> None
         */
        const handleSortClick = (e: Event) => {
            e.stopPropagation();
            if (!isSortable.value) return;

            const direction = currentSortDirection.value;
            if (!direction) {
                resource.addSort(sortField.value, 'asc');
            } else if (direction === 'asc') {
                resource.updateSortDirection(sortField.value, 'desc');
            } else {
                resource.removeSort(sortField.value);
            }
        };

        const handleFilterApply = (selection: unknown[]) => {
            if (selection.length > 0) {
                // Determine if we need to add or update
                const existing = resource.getFilterValues(sortField.value);
                if (existing) {
                    resource.updateFilterValues(sortField.value, selection);
                } else {
                    resource.addFilter(sortField.value, selection);
                }
            } else {
                resource.removeFilter(sortField.value);
            }
        };

        const currentFilterValues = computed(() => {
            return resource.getFilterValues(sortField.value) || [];
        });

        /**
         * The `aria-sort` value of the header cell.
         *
         * Only a sortable column gets the attribute — on a plain header it would
         * announce a sorting affordance that is not there. An unsorted sortable
         * column is `none`, which is what tells a screen-reader user that the
         * column *can* be sorted.
         */
        const ariaSort = computed<'ascending' | 'descending' | 'none' | undefined>(() => {
            if (!isSortable.value) return undefined;
            if (currentSortDirection.value === 'asc') return 'ascending';
            if (currentSortDirection.value === 'desc') return 'descending';
            return 'none';
        });

        /**
         * Determines the sort icon based on the current sort direction.
         */
        const sortIcon = computed(() => {
            if (!isSortable.value) return [];

            const icons = core.config.icons?.sortable;
            const direction = currentSortDirection.value;

            // Type guard: ensure icons is an object with up/down/both properties
            if (icons && typeof icons === 'object' && !Array.isArray(icons)) {
                if (direction === 'asc') {
                    return icons.up || ['fas', 'fa-caret-up'];
                }
                if (direction === 'desc') {
                    return icons.down || ['fas', 'fa-caret-down'];
                }
                return icons.both || ['fas', 'fa-sort'];
            }

            // Fallback to defaults if icons not properly configured
            if (direction === 'asc') return ['fas', 'fa-caret-up'];
            if (direction === 'desc') return ['fas', 'fa-caret-down'];
            return ['fas', 'fa-sort'];
        });

        const { styles, classes, formattedContent } = useHeaderFooterCell(() => props.cell, core);

        return () => {
            const { cell } = props;

            const attributes: Record<string, unknown> = {
                'data-testid': 'table-header-cell',
                'data-key': cell.key,
                scope: resolveHeaderScope(cell),
                'aria-sort': ariaSort.value,
                class: classes.value,
                style: [styles.value, cell.style], // Merge computed styles and inline style string
            };

            applyColspanRowspan(attributes, cell);

            const contentNode = buildRawAwareContent(cell, formattedContent.value);

            const children: (string | ReturnType<typeof h>)[] = [
                h('span', { class: 'me-1' }, contentNode),
            ];

            const controls: ReturnType<typeof h>[] = [];

            if (isSortable.value) {
                // A real `<button>`, not the clickable `<i>` this used to be: that
                // one was unreachable by keyboard (no focus, no Enter/Space) and
                // announced nothing, so sorting was mouse-only. The Bootstrap
                // classes keep the icon looking exactly as before — `btn-link`
                // strips the button chrome, and `text-reset` keeps the icon
                // inheriting the header's colour instead of turning link-blue.
                controls.push(
                    h(
                        'button',
                        {
                            type: 'button',
                            class: 'btn btn-link p-0 border-0 align-baseline text-decoration-none text-reset ms-2',
                            'data-testid': 'sort-button',
                            'aria-label': core.config.labels.sortColumn,
                            onClick: handleSortClick,
                        },
                        h('i', {
                            class: sortIcon.value,
                            'data-testid': 'sort-icon',
                            'aria-hidden': 'true',
                        })
                    )
                );
            }

            if (isDateFilter.value) {
                controls.push(
                    h(FilterCalendar, {
                        value: (currentFilterValues.value[0] as string | undefined) ?? null,
                        onApply: handleFilterApply,
                        labels: core.config.labels,
                    })
                );
            } else if (isFilterable.value) {
                controls.push(
                    h(FilterDropdown, {
                        elements: normalizedElements.value,
                        selected: currentFilterValues.value,
                        onApply: handleFilterApply,
                        labels: core.config.labels,
                    })
                );
            }

            if (controls.length > 0) {
                children.push(h('div', { class: 'd-inline-flex align-items-center' }, controls));
            }

            return h('th', attributes, children);
        };
    },
});
