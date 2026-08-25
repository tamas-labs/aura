import { defineComponent, h, ref, type PropType, computed } from 'vue';
import type { AuraLabels } from '../../../../types/config.types';
import { DEFAULT_LABELS } from '../../../../lib/default-values.lib';

/**
 * RowsSelect Component
 * Bootstrap dropdown for selecting the number of rows to display per page.
 *
 * @example
 * ```tsx
 * <RowsSelect
 *     values={[10, 25, 50, 100]}
 *     selected={25}
 *     onChange={(value) => console.log(value)}
 * />
 * ```
 */
export const RowsSelect = defineComponent({
    name: 'RowsSelect',
    props: {
        /**
         * List of available values for pagination
         */
        values: {
            type: Array as PropType<number[]>,
            required: true,
            default: () => [],
        },
        /**
         * Currently selected value
         */
        selected: {
            type: Number,
            required: true,
        },
        /**
         * Callback when selection changes
         */
        onChange: {
            type: Function as PropType<(value: number) => void>,
            required: true,
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
    setup(props) {
        const isOpen = ref(false);

        const toggleDropdown = () => {
            isOpen.value = !isOpen.value;
        };

        const handleSelect = (value: number) => {
            props.onChange(value);
            isOpen.value = false;
        };

        // Ensure values is an array before using map
        const safeValues = computed(() => {
            return Array.isArray(props.values) ? props.values : [];
        });

        return () => {
            return h(
                'div',
                {
                    class: 'd-flex align-items-center gap-2',
                },
                [
                    h(
                        'label',
                        {
                            class: 'me-2 text-nowrap',
                        },
                        props.labels.perPage ?? DEFAULT_LABELS.perPage
                    ),
                    h(
                        'div',
                        {
                            class: 'dropdown',
                            'data-testid': 'rows-select',
                        },
                        [
                            // Toggle Button
                            h(
                                'button',
                                {
                                    class: 'btn btn-outline-secondary dropdown-toggle',
                                    type: 'button',
                                    'aria-expanded': isOpen.value,
                                    onClick: toggleDropdown,
                                    'data-testid': 'rows-select-toggle',
                                },
                                props.selected?.toString() || ''
                            ),

                            // Dropdown Menu
                            h(
                                'ul',
                                {
                                    class: ['dropdown-menu', { show: isOpen.value }],
                                    'data-testid': 'rows-select-menu',
                                },
                                safeValues.value.map(value =>
                                    h(
                                        'li',
                                        { key: value },
                                        h(
                                            'button',
                                            {
                                                class: [
                                                    'dropdown-item',
                                                    { active: value === props.selected },
                                                ],
                                                type: 'button',
                                                onClick: () => handleSelect(value),
                                            },
                                            value.toString()
                                        )
                                    )
                                )
                            ),
                        ]
                    ),
                    h(
                        'label',
                        {
                            class: 'me-2 text-nowrap',
                        },
                        props.labels.results ?? DEFAULT_LABELS.results
                    ),
                ]
            );
        };
    },
});
