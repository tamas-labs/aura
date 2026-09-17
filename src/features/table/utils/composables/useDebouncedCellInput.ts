import type { PropType } from 'vue';
import type { CoreStore, HeaderCell } from '../../../../types';
import type { ApiResourcesStore } from '../../../../types/api-response.types';
import { useApiResourcesStore, useExistingCoreStore } from '../../../../state';
import { useDebounce } from '../../../../utils/composables/useDebounce';
import { resolveCellField } from '../../../../utils/resolve-cell-field.util';

/**
 * How long a header search input waits after the last keystroke before writing to the
 * store.
 *
 * One constant for every search cell: it used to be a literal repeated per component,
 * so the two inputs could drift apart, and making the delay configurable would have
 * meant finding every copy.
 */
export const CELL_INPUT_DEBOUNCE_MS = 300;

/** The debounced pair returned by {@link DebouncedCellInput.debounce}. */
export interface CellInputDebounce {
    /** Schedules `apply`, restarting the timer on every call. */
    debounced: () => void;
    /** Drops a scheduled call — for the paths that apply immediately (Enter, buttons, clear). */
    cancel: () => void;
}

/** What a header search cell needs from its store, plus its debounce factory. */
export interface DebouncedCellInput {
    /** The table's core store (config, labels, icons). */
    core: CoreStore;
    /** The table's API resources store (the search/filter state to write into). */
    resource: ApiResourcesStore;
    /** The data field this cell searches on. */
    field: string;
    /**
     * Wraps the cell's apply callback in the shared debounce.
     *
     * A factory rather than a ready-made pair, so the caller can declare its input refs
     * *after* reading their initial value out of `resource` — the apply callback closes
     * over those refs.
     */
    debounce: (apply: () => void) => CellInputDebounce;
}

/**
 * The props every debounced header search cell declares.
 *
 * Shared because the identical block (with identical doc comments) in
 * `TableHeaderSearchCell` and `TableHeaderBetweenCell` was the larger half of the only
 * TSX clone jscpd found in `src/`.
 */
export const debouncedCellInputProps = {
    /**
     * The unique identifier for the store instance.
     */
    storeId: {
        type: String,
        required: true as const,
    },
    /**
     * The header cell configuration.
     */
    cell: {
        type: Object as PropType<HeaderCell>,
        required: true as const,
    },
};

/**
 * Wires a header search cell to its stores and to the shared input debounce.
 *
 * Both search cells opened with the same three lines (core store, resources store,
 * resolved field) and then debounced their store write with their own `300` literal.
 * This composable owns that preamble; since it holds `core`, a future config-driven
 * delay is a change in this one file rather than in every cell.
 *
 * @param storeId - The store instance the cell belongs to
 * @param cell - The header cell configuration
 * @returns The cell's stores, its resolved field, and the debounce factory
 *
 * @example
 * ```typescript
 * const { core, resource, field, debounce } = useDebouncedCellInput(props.storeId, props.cell);
 * const inputValue = ref(resource.getSearchTerm(field) || '');
 * const { debounced, cancel } = debounce(() => resource.addSearch(field, inputValue.value));
 * ```
 */
export function useDebouncedCellInput(storeId: string, cell: HeaderCell): DebouncedCellInput {
    const core = useExistingCoreStore(storeId);
    const resource = useApiResourcesStore(storeId, core);
    const field = resolveCellField(cell);

    const debounce = (apply: () => void): CellInputDebounce => {
        const { debounced, cancel } = useDebounce(apply, CELL_INPUT_DEBOUNCE_MS);
        return { debounced, cancel };
    };

    return { core, resource, field, debounce };
}
