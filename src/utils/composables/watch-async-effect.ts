import { watchEffect, type WatchStopHandle } from 'vue';

/**
 * `watchEffect` for async effects that write their result back into a ref.
 *
 * @param effect - The effect body. It receives `isStale()`, which returns `true` once a newer
 *                 run of the same effect has started (or the effect has been stopped).
 * @returns The `watchEffect` stop handle
 *
 * @remarks
 * A plain `watchEffect(async () => { ref.value = await slow() })` has a race: two triggers in
 * quick succession start two runs, and whichever `await` settles last wins — which is not
 * necessarily the one started last. The cell could keep the result of a superseded run
 * (audit 2026-07-29, 2.5 P3: fast paging or typing in a search box).
 *
 * The fix is a cancellation flag registered through `onCleanup` **before** the first `await`:
 * Vue runs the cleanup of the previous run right before starting the next one, so an
 * outdated run can check `isStale()` and skip the write.
 *
 * Dependency tracking is unchanged: the effect body still runs synchronously up to its first
 * `await`, so every reactive read before that point is tracked exactly as before.
 *
 * @example
 * ```typescript
 * watchAsyncEffect(async isStale => {
 *     const value = await formatValue(props.value);
 *     if (isStale()) return;
 *     formatted.value = value;
 * });
 * ```
 */
export const watchAsyncEffect = (
    effect: (isStale: () => boolean) => Promise<void> | void
): WatchStopHandle =>
    watchEffect(onCleanup => {
        let stale = false;
        onCleanup(() => {
            stale = true;
        });

        void effect(() => stale);
    });
