import { defineComponent, h, ref, computed, watch, nextTick, Teleport, type PropType } from 'vue';
import type { AuraLabels } from '../../../../types/config.types';
import { DEFAULT_LABELS, DEFAULT_ICONS } from '../../../../lib/default-values.lib';
import { useTeleportedDropdown } from './use-teleported-dropdown';

/** Minimum width of the calendar panel in pixels, also used for the alignment heuristic. */
const CALENDAR_MIN_WIDTH = 220;

/**
 * FilterCalendar Component
 *
 * The date-filter counterpart to `FilterDropdown`: same toggle-button-plus-teleported-panel
 * shape (see `useTeleportedDropdown`), but the panel holds a single native
 * `<input type="date">` instead of a checkbox list. `TableHeaderCell` renders this instead
 * of `FilterDropdown` for a `filterable: true, date: true` column — a high-cardinality date
 * field would otherwise mean choosing from a checkbox list of every distinct value.
 *
 * A native date input on purpose: it gives a real OS/browser calendar picker for free, with
 * no extra bundle weight or a11y work to redo.
 *
 * The selection is still emitted through `apply` as a `values[]` array — an empty array
 * clears the filter, a one-element array (the ISO `yyyy-mm-dd` string) sets it — so
 * `TableHeaderCell` can wire it to the same `addFilter`/`updateFilterValues`/`removeFilter`
 * store calls it already uses for `FilterDropdown`.
 *
 * @displayName FilterCalendar
 * @prop {string | null} value - Currently selected date (ISO `yyyy-mm-dd`), or `null`
 * @prop {Partial<AuraLabels>} labels - Overridable UI texts (`config.labels`)
 * @prop {{filterable?: string[], filterableChecked?: string[]}} icons - Overridable toggle icon
 *   (`config.icons`). Falls back to `DEFAULT_ICONS.filterable` / `.filterableChecked`
 * @emits apply - Emits `[]` (cleared) or `[isoDate]` when the Apply button is pressed
 */
export const FilterCalendar = defineComponent({
    name: 'FilterCalendar',
    props: {
        value: {
            type: String as PropType<string | null>,
            default: null,
        },
        /**
         * Overridable UI texts (`config.labels`). Missing keys fall back to
         * `DEFAULT_LABELS`, so a partial object is enough.
         */
        labels: {
            type: Object as PropType<Partial<AuraLabels>>,
            default: () => DEFAULT_LABELS,
        },
        /**
         * Overridable toggle-button icon pair (`config.icons`). Same convention as
         * `FilterDropdown`'s toggle icon, so a date column reads as "filterable" the same
         * way a checkbox-list column does. Missing keys fall back to `DEFAULT_ICONS`.
         */
        icons: {
            type: Object as PropType<{ filterable?: string[]; filterableChecked?: string[] }>,
            default: () => ({}),
        },
    },
    emits: ['apply'],
    setup(props, { emit }) {
        const internalValue = ref<string>('');
        const dateInputRef = ref<HTMLInputElement | null>(null);

        const { isOpen, toggleRef, dropdownPosition, toggleDropdown, closeDropdown } =
            useTeleportedDropdown(CALENDAR_MIN_WIDTH);

        /**
         * The toggle-button icon: `filterableChecked` while this column has an active filter
         * (`value` set), `filterable` otherwise — same on/off convention as the checkbox
         * dropdown, just reused here instead of the unrelated `fa-calendar` glyph.
         */
        const filterIcon = computed(() => {
            return props.value
                ? (props.icons.filterableChecked ?? DEFAULT_ICONS.filterableChecked)
                : (props.icons.filterable ?? DEFAULT_ICONS.filterable);
        });

        // Sync internal value with props when the panel opens, then focus the date input
        watch(
            () => isOpen.value,
            async newVal => {
                if (newVal) {
                    internalValue.value = props.value ?? '';
                    await nextTick();
                    dateInputRef.value?.focus();
                }
            }
        );

        const applyFilter = () => {
            emit('apply', internalValue.value ? [internalValue.value] : []);
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
                        'aria-haspopup': 'dialog',
                        'aria-label': props.labels.filterToggle ?? DEFAULT_LABELS.filterToggle,
                        'data-testid': 'filter-calendar-toggle',
                        ref: toggleRef,
                        onClick: (e: Event) => {
                            e.stopPropagation();
                            toggleDropdown();
                        },
                    },
                    h('i', { class: filterIcon.value })
                ),
            ];

            // Teleport the calendar panel to body to escape overflow clipping
            if (isOpen.value) {
                children.push(
                    h(
                        Teleport,
                        { to: 'body' },
                        h(
                            'div',
                            {
                                class: 'dropdown-menu show p-3 shadow',
                                'data-testid': 'filter-calendar-menu',
                                role: 'dialog',
                                'aria-label':
                                    props.labels.filterOptions ?? DEFAULT_LABELS.filterOptions,
                                style: {
                                    minWidth: `${CALENDAR_MIN_WIDTH}px`,
                                    position: 'fixed',
                                    top: `${dropdownPosition.value.top}px`,
                                    left: `${dropdownPosition.value.left}px`,
                                    zIndex: '1050',
                                },
                                onClick: (e: Event) => e.stopPropagation(),
                            },
                            [
                                h('input', {
                                    class: 'form-control form-control-sm mb-3',
                                    type: 'date',
                                    'data-testid': 'filter-calendar-input',
                                    ref: dateInputRef,
                                    value: internalValue.value,
                                    onInput: (e: Event) => {
                                        internalValue.value = (e.target as HTMLInputElement).value;
                                    },
                                }),

                                // Footer: Apply Button
                                h(
                                    'div',
                                    { class: 'd-grid' },
                                    h(
                                        'button',
                                        {
                                            class: 'btn btn-primary btn-sm',
                                            'data-testid': 'filter-calendar-apply',
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
                { class: 'dropdown d-inline-block ms-2', 'data-testid': 'filter-calendar' },
                children
            );
        };
    },
});
