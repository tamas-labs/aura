import { defineComponent, h, ref, watch } from 'vue';
import { htmlSanitizer } from '../../../../validators/sanitizers';
import { debouncedCellInputProps, useDebouncedCellInput } from '../../utils';

/**
 * TableHeaderSearchCell Component
 *
 * Renders a search input for a specific column.
 * Handles input validation, sanitization, and store updates.
 */
export const TableHeaderSearchCell = defineComponent({
    name: 'TableHeaderSearchCell',
    props: debouncedCellInputProps,
    setup(props) {
        const { core, resource, field, debounce } = useDebouncedCellInput(
            props.storeId,
            props.cell
        );

        const inputValue = ref(resource.getSearchTerm(field) || '');

        // Sync local input with store state
        watch(
            () => resource.getSearchTerm(field),
            newValue => {
                if (newValue !== inputValue.value) {
                    inputValue.value = newValue || '';
                }
            }
        );

        const handleSearch = () => {
            const rawValue = inputValue.value.trim();

            // Empty input: if there was an active search, we clear it (otherwise the old
            // filter would linger while the field is empty — a misleading state).
            if (!rawValue) {
                if (resource.getSearchTerm(field) !== null) {
                    resource.removeSearch(field);
                }
                return;
            }

            // Sanitize input
            const sanitizedValue = htmlSanitizer(rawValue);
            if (typeof sanitizedValue !== 'string') return;

            // Determine if exact match is required
            // Support 'type': 'number' from legacy configs as well
            const isNumber =
                props.cell.number === true ||
                (props.cell as unknown as Record<string, unknown>).type === 'number';
            const isExact = isNumber ? true : undefined;

            // Check if search already exists
            const currentTerm = resource.getSearchTerm(field);

            if (currentTerm !== null) {
                resource.updateSearchTerm(field, sanitizedValue, isExact);
            } else {
                resource.addSearch(field, sanitizedValue, isExact);
            }
        };

        const { debounced: debouncedSearch, cancel: cancelSearch } = debounce(handleSearch);

        const handleClear = () => {
            cancelSearch();
            resource.removeSearch(field);
            inputValue.value = '';
        };

        // Icons
        const searchIcon = core.config.icons?.search || ['fas', 'fa-search'];
        const clearIcon = core.config.icons?.clear || ['fas', 'fa-times'];

        return () => {
            const labels = core.config.labels;

            // The cell sits in the header row of its own column; it renders no
            // colspan of its own, so the scope is always a single column.
            return h('th', { scope: 'col', 'data-testid': 'table-header-search-cell' }, [
                h('div', { class: 'input-group input-group-sm' }, [
                    h('input', {
                        type: 'text',
                        class: 'form-control form-control-sm',
                        placeholder:
                            props.cell.label || props.cell.content || labels.searchPlaceholder,
                        value: inputValue.value,
                        'data-testid': `search-input-${field}`,
                        onInput: (e: Event) => {
                            inputValue.value = (e.target as HTMLInputElement).value;
                            debouncedSearch();
                        },
                        onKeydown: (e: KeyboardEvent) => {
                            if (e.key === 'Enter') {
                                cancelSearch();
                                handleSearch();
                            }
                        },
                    }),
                    h(
                        'button',
                        {
                            class: 'btn btn-outline-secondary',
                            type: 'button',
                            'data-testid': `search-btn-${field}`,
                            disabled: !inputValue.value.trim(),
                            onClick: () => {
                                cancelSearch();
                                handleSearch();
                            },
                        },
                        h('i', { class: searchIcon })
                    ),
                    h(
                        'button',
                        {
                            class: 'btn btn-outline-danger',
                            type: 'button',
                            'data-testid': `clear-btn-${field}`,
                            disabled: resource.getSearchTerm(field) === null,
                            onClick: handleClear,
                        },
                        h('i', { class: clearIcon })
                    ),
                ]),
            ]);
        };
    },
});
