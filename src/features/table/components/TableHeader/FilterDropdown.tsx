import { defineComponent, h, ref, computed, watch, nextTick, Teleport, type PropType } from 'vue';
import type { FilterElement } from '../../../../types';
import type { AuraLabels } from '../../../../types/config.types';
import { DEFAULT_LABELS } from '../../../../lib/default-values.lib';
import { useTeleportedDropdown } from './use-teleported-dropdown';

/**
 * Minimum width of the dropdown menu in pixels.
 * Used for both the CSS minWidth and the alignment calculation.
 */
const DROPDOWN_MIN_WIDTH = 220;

let nextInstanceId = 0;

/**
 * FilterDropdown Component
 *
 * Renders a checkbox-based dropdown menu for filtering column data.
 * Uses Vue Teleport to render the dropdown to document.body,
 * avoiding overflow clipping from parent containers (table, th, etc.).
 *
 * Features:
 * - Supports multiple selection
 * - "Select All" functionality
 * - Visual feedback for selection state
 * - Dynamic positioning: avoids viewport clipping on both sides
 * - Teleported to body to escape ancestor overflow constraints
 * - Emits changes only on "Apply" (closing the dropdown) or immediate updates depending on usage
 *
 * @displayName FilterDropdown
 * @prop {FilterElement[]} elements - Array of filter options {value, label}
 * @prop {unknown[]} selected - Currently selected values
 * @prop {string} label - Label for the "Select All" checkbox (default: `labels.selectAll`)
 * @prop {Partial<AuraLabels>} labels - Overridable UI texts (`config.labels`)
 * @emits update:selected - When selection changes internally
 * @emits apply - When the dropdown is closed or selection is confirmed
 */
export const FilterDropdown = defineComponent({
    name: 'FilterDropdown',
    props: {
        elements: {
            type: Array as PropType<FilterElement[]>,
            required: true,
        },
        selected: {
            type: Array as PropType<unknown[]>,
            default: () => [],
        },
        /**
         * Explicit label for the "Select All" checkbox. When unset, `labels.selectAll`
         * is used — hence the `undefined` default (an empty default would always win).
         */
        label: {
            type: String,
            default: undefined,
        },
        /**
         * Overridable UI texts (`config.labels`). Missing keys fall back to
         * `DEFAULT_LABELS`, so a partial object is enough.
         */
        labels: {
            type: Object as PropType<Partial<AuraLabels>>,
            default: () => DEFAULT_LABELS,
        },
    },
    emits: ['apply', 'update:selected'],
    setup(props, { emit }) {
        const instanceId = nextInstanceId++;
        const internalSelection = ref<unknown[]>([]);
        const selectAllRef = ref<HTMLInputElement | null>(null);

        const { isOpen, toggleRef, dropdownPosition, toggleDropdown, closeDropdown } =
            useTeleportedDropdown(DROPDOWN_MIN_WIDTH);

        // Sync internal selection with props when dropdown opens, then focus select-all
        watch(
            () => isOpen.value,
            async newVal => {
                if (newVal) {
                    internalSelection.value = [...props.selected];
                    await nextTick();
                    selectAllRef.value?.focus();
                }
            }
        );

        const allSelected = computed(() => {
            return (
                props.elements.length > 0 &&
                props.elements.every(e => internalSelection.value.includes(e.value))
            );
        });

        const isIndeterminate = computed(() => {
            const selectedCount = props.elements.filter(e =>
                internalSelection.value.includes(e.value)
            ).length;
            return selectedCount > 0 && selectedCount < props.elements.length;
        });

        const toggleAll = () => {
            if (allSelected.value) {
                internalSelection.value = [];
            } else {
                internalSelection.value = props.elements.map(e => e.value);
            }
        };

        const toggleItem = (value: unknown) => {
            const index = internalSelection.value.indexOf(value);
            if (index === -1) {
                internalSelection.value.push(value);
            } else {
                internalSelection.value.splice(index, 1);
            }
        };

        const applyFilter = () => {
            emit('apply', [...internalSelection.value]);
            emit('update:selected', [...internalSelection.value]);
            closeDropdown();
        };

        return () => {
            const children: ReturnType<typeof h>[] = [
                // Toggle Button (Filter Icon)
                h(
                    'button',
                    {
                        class: 'btn btn-link p-0 text-secondary border-0 text-decoration-none',
                        type: 'button',
                        'aria-expanded': isOpen.value,
                        'aria-haspopup': 'listbox',
                        'aria-label': props.labels.filterToggle ?? DEFAULT_LABELS.filterToggle,
                        'data-testid': 'filter-dropdown-toggle',
                        ref: toggleRef,
                        onClick: (e: Event) => {
                            e.stopPropagation();
                            toggleDropdown();
                        },
                    },
                    h('i', { class: 'fas fa-filter' })
                ),
            ];

            // Teleport the dropdown menu to body to escape overflow clipping
            if (isOpen.value) {
                children.push(
                    h(
                        Teleport,
                        { to: 'body' },
                        h(
                            'div',
                            {
                                class: 'dropdown-menu show p-3 shadow',
                                'data-testid': 'filter-dropdown-menu',
                                role: 'listbox',
                                'aria-label':
                                    props.labels.filterOptions ?? DEFAULT_LABELS.filterOptions,
                                style: {
                                    minWidth: `${DROPDOWN_MIN_WIDTH}px`,
                                    position: 'fixed',
                                    top: `${dropdownPosition.value.top}px`,
                                    left: `${dropdownPosition.value.left}px`,
                                    zIndex: '1050',
                                },
                                onClick: (e: Event) => e.stopPropagation(),
                            },
                            [
                                // Header: Select All
                                h('div', { class: 'form-check mb-2' }, [
                                    h('input', {
                                        class: 'form-check-input',
                                        type: 'checkbox',
                                        id: `filter-select-all-${instanceId}`,
                                        'data-testid': 'filter-select-all',
                                        ref: selectAllRef,
                                        checked: allSelected.value,
                                        indeterminate: isIndeterminate.value,
                                        onChange: toggleAll,
                                    }),
                                    h(
                                        'label',
                                        {
                                            class: 'form-check-label fw-bold',
                                            for: `filter-select-all-${instanceId}`,
                                        },
                                        props.label ||
                                            props.labels.selectAll ||
                                            DEFAULT_LABELS.selectAll
                                    ),
                                ]),

                                h('hr', { class: 'dropdown-divider my-2' }),

                                // Items List Container
                                h(
                                    'div',
                                    {
                                        class: 'mb-3',
                                        style: { maxHeight: '200px', overflowY: 'auto' },
                                    },
                                    props.elements.map((element, index) => {
                                        const isSelected = internalSelection.value.includes(
                                            element.value
                                        );
                                        const id = `filter-item-${instanceId}-${index}-${element.value}`;

                                        return h('div', { class: 'form-check', key: index }, [
                                            h('input', {
                                                class: 'form-check-input',
                                                type: 'checkbox',
                                                id: id,
                                                'data-testid': `filter-item-${index}`,
                                                checked: isSelected,
                                                onChange: () => toggleItem(element.value),
                                            }),
                                            h(
                                                'label',
                                                {
                                                    class: 'form-check-label text-break',
                                                    for: id,
                                                },
                                                String(element.label ?? element.value)
                                            ),
                                        ]);
                                    })
                                ),

                                // Footer: Apply Button
                                h(
                                    'div',
                                    { class: 'd-grid' },
                                    h(
                                        'button',
                                        {
                                            class: 'btn btn-primary btn-sm',
                                            'data-testid': 'filter-apply',
                                            onClick: applyFilter,
                                        },
                                        props.labels.filterApply ?? DEFAULT_LABELS.filterApply
                                    )
                                ),
                            ]
                        )
                    )
                );
            }

            return h(
                'div',
                { class: 'dropdown d-inline-block ms-2', 'data-testid': 'filter-dropdown' },
                children
            );
        };
    },
});
