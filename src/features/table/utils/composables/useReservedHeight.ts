import { nextTick, readonly, ref, watch, type Ref, type WatchSource } from 'vue';

/** Everything the reserved-height tracker needs from its caller. */
export interface ReservedHeightDeps {
    /** The element whose height is being held — the table area wrapper. */
    element: Ref<HTMLElement | null>;
    /** Whether what is on screen right now is a *full* page of rows. */
    isFullPage: () => boolean;
    /**
     * Watch sources that mean "the rendered rows may have changed".
     *
     * Typically the displayed slice: paging between two equally long pages moves
     * no counter, so the row count alone would not trigger a fresh reading, and
     * a page whose rows wrap onto more lines would be measured as the shorter
     * previous one.
     */
    measureSources: WatchSource[];
    /**
     * Watch sources that invalidate the measurement entirely.
     *
     * A different page size or a different data set means a different full-page
     * height, so the previous reading must not be carried over — it would leave
     * a gap under a table that legitimately became shorter.
     */
    resetSources: WatchSource[];
}

/**
 * Remember how tall the table area is when a full page of rows is on screen.
 *
 * Applied as a `min-height`, that number keeps whatever sits below the table —
 * the pagination row above all — from sliding up when the current page has fewer
 * rows than the page size, or when rows are briefly replaced during a request.
 * Both are the same layout shift from the user's side: the controls they are
 * about to click move out from under the pointer.
 *
 * Only full pages are measured, and the value only ever grows within one data
 * set, so a table that never fills a page reserves nothing at all — there is no
 * jump to prevent there, and reserving would only add empty space.
 *
 * @param deps - Element, full-page predicate, and the measure/reset sources
 * @returns A readonly ref with the height to reserve in px (`0` = reserve nothing)
 */
export function useReservedHeight(deps: ReservedHeightDeps): Readonly<Ref<number>> {
    const { element, isFullPage, measureSources, resetSources } = deps;
    const reservedHeight = ref(0);

    const measure = async () => {
        // The rows are rendered by the same reactive pass that triggered this,
        // so the DOM only carries them after the update has been flushed.
        await nextTick();

        const el = element.value;
        if (!el || !isFullPage()) {
            return;
        }

        // `offsetHeight` is 0 in a non-layouting environment (jsdom, a detached
        // node). Reserving that would be a no-op with an extra style attribute.
        const height = el.offsetHeight;
        if (height > reservedHeight.value) {
            reservedHeight.value = height;
        }
    };

    watch(measureSources, () => void measure(), { immediate: true });

    watch(resetSources, () => {
        reservedHeight.value = 0;
        void measure();
    });

    return readonly(reservedHeight);
}
