import { nextTick, ref, watch, type Ref } from 'vue';
import type { CoreStore } from '../../../../types';
import type { SearchPrefillRequest } from '../../../../types/store.types';

/**
 * Lets a search input take the text a Shift+clicked cell hands it (`cellClickSearch`).
 *
 * Watches the core store's pre-fill request. When one is addressed to this input, `fill`
 * writes the term into the input's local state, and the input receives the focus with the
 * cursor at the end, ready for trimming. Nothing is searched here: the input's own Enter,
 * button and typing paths stay the only way a search is committed, so a click alone never
 * produces a filter badge.
 *
 * Only requests made after the input mounted count — a request left in the store must not
 * re-fill an input that is created later (a column shown again, a re-rendered header).
 *
 * @param core - The table's core store.
 * @param isForThisInput - Whether a request is addressed to this input.
 * @param fill - Writes the term into the input's local state.
 * @returns The template ref to bind to the `<input>` element.
 *
 * @example
 * ```ts
 * const inputEl = useSearchPrefill(
 *     core,
 *     request => request.kind === 'global',
 *     term => (searchQuery.value = term)
 * );
 * // render: h('input', { ref: inputEl, value: searchQuery.value, ... })
 * ```
 */
export function useSearchPrefill(
    core: Pick<CoreStore, 'searchPrefill'>,
    isForThisInput: (request: SearchPrefillRequest) => boolean,
    fill: (term: string) => void
): Ref<HTMLInputElement | null> {
    const inputEl = ref<HTMLInputElement | null>(null);

    watch(
        () => core.searchPrefill,
        request => {
            if (!request || !isForThisInput(request)) return;

            fill(request.term);

            // The new text reaches the element on the next render; focus after it.
            void nextTick(() => {
                const input = inputEl.value;
                if (!input) return;
                input.focus();
                input.setSelectionRange(input.value.length, input.value.length);
            });
        }
    );

    return inputEl;
}
