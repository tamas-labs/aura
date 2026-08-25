import { getCurrentScope, onScopeDispose, readonly, ref, watch, type Ref } from 'vue';

/**
 * Mirror a boolean source, but make it wait before turning **on**.
 *
 * Switching off is immediate; switching on happens only if the source is still
 * `true` once `delay` has passed. That asymmetry is what a loading indicator
 * wants: a request that finishes inside the window never renders anything, so
 * the UI stays still instead of flashing a veil for a frame or two, while a
 * genuinely slow request still gets its feedback with no additional lag beyond
 * the delay itself.
 *
 * The pending timer is bound to the surrounding effect scope, so an unmounted
 * component cannot switch the flag on afterwards. Outside a scope no cleanup is
 * registered (same contract as `useDebounce`).
 *
 * @param source - Getter for the boolean being mirrored
 * @param delay - How long the source must stay `true` before the flag follows, in ms
 * @returns A readonly ref holding the delayed value
 *
 * @example
 * const showOverlay = useDelayedFlag(() => store.loading, 250);
 */
export function useDelayedFlag(source: () => boolean, delay: number): Readonly<Ref<boolean>> {
    const flag = ref(false);
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const clearPending = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
    };

    watch(
        source,
        active => {
            clearPending();

            if (!active) {
                flag.value = false;
                return;
            }

            // A delay of 0 (or less) means "no smoothing" — follow the source in
            // the same tick, so a host that wants the old behavior back gets it
            // without a timer round-trip.
            if (delay <= 0) {
                flag.value = true;
                return;
            }

            timeoutId = setTimeout(() => {
                timeoutId = null;
                flag.value = true;
            }, delay);
        },
        { immediate: true }
    );

    if (getCurrentScope()) {
        onScopeDispose(clearPending);
    }

    return readonly(flag);
}
