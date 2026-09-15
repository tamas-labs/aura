import { defineComponent, h, ref, computed, type PropType, watch } from 'vue';
import { useApiResourcesStore, useExistingCoreStore } from '../../../../state';
import { useSearchPrefill } from '../../utils/composables/useSearchPrefill';

/**
 * GlobalSearch Component
 *
 * Input group with search icon, text input, clear button and search button.
 * Connected directly to the API store for global search state management.
 *
 * @example
 * ```tsx
 * <GlobalSearch
 *     storeId="my-table"
 *     placeholder="Search users..."
 * />
 * ```
 */
export const GlobalSearch = defineComponent({
    name: 'GlobalSearch',
    props: {
        /**
         * The unique identifier for the store instance.
         */
        storeId: {
            type: String,
            required: true,
        },
        /**
         * Input placeholder text. If empty, the `labels.searchPlaceholder` config value is the fallback.
         */
        placeholder: {
            type: String,
            default: '',
        },
        /**
         * Minimum characters required to trigger search
         */
        minLength: {
            type: Number,
            default: 3,
        },
        /**
         * FontAwesome icon classes for the search symbol
         */
        searchIcon: {
            type: Array as PropType<string[]>,
            default: () => ['fa-solid', 'fa-magnifying-glass'],
        },
        /**
         * FontAwesome icon classes for the clear symbol
         */
        clearIcon: {
            type: Array as PropType<string[]>,
            default: () => ['fa-solid', 'fa-xmark'],
        },
    },
    setup(props) {
        const core = useExistingCoreStore(props.storeId);
        const resource = useApiResourcesStore(props.storeId, core);

        const searchQuery = ref(resource.globalSearchTerm || '');

        /**
         * The text a Shift+clicked cell put into the input (`cellClickSearch`).
         *
         * A picked value is a complete term, so while the input still holds exactly that
         * text the minimum length does not apply — a single `5` can be searched for. Once
         * the text is edited, the usual minimum is back.
         */
        const prefilledTerm = ref<string | null>(null);

        const isValid = computed(() => {
            if (prefilledTerm.value !== null && searchQuery.value === prefilledTerm.value) {
                return true;
            }
            // Trim whitespace for validation check
            return searchQuery.value.trim().length >= props.minLength;
        });

        const inputEl = useSearchPrefill(
            core,
            request => request.kind === 'global',
            term => {
                searchQuery.value = term;
                prefilledTerm.value = term;
            }
        );

        // Two-way synchronization with the store
        watch(
            () => resource.globalSearchTerm,
            newValue => {
                if (newValue !== searchQuery.value) {
                    searchQuery.value = newValue || '';
                }
            }
        );

        const handleSearch = () => {
            if (isValid.value) {
                resource.setGlobalSearch(searchQuery.value);
            }
        };

        const handleClear = () => {
            resource.clearGlobalSearch();
            searchQuery.value = '';
            prefilledTerm.value = null;
        };

        const handleKeydown = (event: KeyboardEvent) => {
            if (event.key === 'Enter') {
                handleSearch();
            }
        };

        const handleInput = (event: Event) => {
            const target = event.target as unknown as { value: string };
            searchQuery.value = target.value;
        };

        // Icons
        const searchIcon = core.config.icons?.search || props.searchIcon;
        const clearIcon = core.config.icons?.clear || props.clearIcon;

        return () => {
            const labels = core.config.labels;

            return h(
                'div',
                {
                    class: 'input-group',
                    'data-testid': 'global-search',
                },
                [
                    // Search Input
                    h('input', {
                        ref: inputEl,
                        type: 'text',
                        class: 'form-control',
                        placeholder: props.placeholder || labels.searchPlaceholder,
                        value: searchQuery.value,
                        onInput: handleInput,
                        onKeydown: handleKeydown,
                        'data-testid': 'global-search-input',
                    }),

                    // Search Button (now outline-secondary with icon)
                    h(
                        'button',
                        {
                            class: 'btn btn-outline-secondary',
                            type: 'button',
                            disabled: !isValid.value,
                            onClick: handleSearch,
                            'data-testid': 'global-search-button',
                            title: labels.search,
                        },
                        h('i', { class: searchIcon })
                    ),

                    // Clear Button (now outline-danger and always visible but disabled)
                    h(
                        'button',
                        {
                            class: 'btn btn-outline-danger',
                            type: 'button',
                            disabled: resource.globalSearchTerm === null,
                            onClick: handleClear,
                            'data-testid': 'global-search-clear',
                            title: labels.clearSearch,
                        },
                        h('i', { class: clearIcon })
                    ),
                ]
            );
        };
    },
});
