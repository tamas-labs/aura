import {
    defineComponent,
    h,
    ref,
    computed,
    watch,
    nextTick,
    Teleport,
    onMounted,
    onBeforeUnmount,
    type PropType,
} from 'vue';
import type { FilterElement } from '../../../../types';
import type { AuraLabels } from '../../../../types/config.types';
import { DEFAULT_LABELS } from '../../../../lib/default-values.lib';

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
        const isOpen = ref(false);
        const internalSelection = ref<unknown[]>([]);
        const toggleRef = ref<HTMLElement | null>(null);
        const selectAllRef = ref<HTMLInputElement | null>(null);

        /**
         * Fixed position coordinates for the teleported dropdown.
         * Calculated from the toggle button's viewport position.
         */
        const dropdownPosition = ref({ top: 0, left: 0 });

        /**
         * Horizontal alignment: 'left' means dropdown's left edge aligns with button,
         * 'right' means dropdown's right edge aligns with button's right edge.
         */
        const dropdownAlignment = ref<'left' | 'right'>('right');

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

        /**
         * Calculates the fixed position and alignment for the dropdown.
         * Uses the toggle button's getBoundingClientRect() to determine
         * where to place the dropdown in the viewport.
         *
         * - If the button is close to the left edge, aligns left (dropdown opens to the right)
         * - Otherwise, aligns right (dropdown opens to the left)
         */
        const updateDropdownPosition = () => {
            if (!toggleRef.value) return;

            const rect = toggleRef.value.getBoundingClientRect();

            // Top: directly below the button
            dropdownPosition.value.top = rect.bottom;

            if (rect.left < DROPDOWN_MIN_WIDTH) {
                // Button is near left edge: align dropdown left edge with button left edge
                dropdownAlignment.value = 'left';
                dropdownPosition.value.left = rect.left;
            } else {
                // Button has enough space: align dropdown right edge with button right edge
                dropdownAlignment.value = 'right';
                dropdownPosition.value.left = rect.right - DROPDOWN_MIN_WIDTH;
            }
        };

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

        const toggleDropdown = () => {
            if (!isOpen.value) {
                updateDropdownPosition();
            }
            isOpen.value = !isOpen.value;
        };

        const closeDropdown = () => {
            isOpen.value = false;
        };

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

        /**
         * Closes the dropdown when clicking outside.
         * Attached to document when dropdown is open.
         */
        const handleClickOutside = (e: MouseEvent) => {
            if (!isOpen.value) return;

            const target = e.target as Node;

            // Don't close if clicking the toggle button (handled by toggleDropdown)
            if (toggleRef.value?.contains(target)) return;

            // Close if clicking outside the dropdown
            closeDropdown();
        };

        /**
         * Handles keyboard events for accessibility.
         * Closes the dropdown when Escape key is pressed.
         */
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isOpen.value && e.key === 'Escape') {
                closeDropdown();
                toggleRef.value?.focus();
            }
        };

        /**
         * Closes the dropdown when scroll or resize events occur.
         * Dropdown position becomes stale after these events.
         */
        const handleCloseOnEvent = () => {
            if (isOpen.value) {
                closeDropdown();
            }
        };

        onMounted(() => {
            document.addEventListener('click', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
            window.addEventListener('scroll', handleCloseOnEvent, { passive: true, capture: true });
            window.addEventListener('resize', handleCloseOnEvent);
        });

        onBeforeUnmount(() => {
            document.removeEventListener('click', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('scroll', handleCloseOnEvent, true);
            window.removeEventListener('resize', handleCloseOnEvent);
        });

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
