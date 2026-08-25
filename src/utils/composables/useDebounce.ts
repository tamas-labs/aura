import { getCurrentScope, onScopeDispose } from 'vue';

/** Options controlling what happens to a pending call when the owning scope ends. */
export interface DebounceOptions {
    /**
     * Run the pending call instead of dropping it when the scope is disposed.
     *
     * Dropping is right for a debounced *query* (the component is gone, nobody wants
     * the result), but wrong for a debounced *write* — a persisted state would lose
     * its most recent change. Defaults to `false` (drop).
     */
    flushOnDispose?: boolean;
}

/**
 * Composable that creates a debounced version of a callback function.
 *
 * The pending timeout is cleaned up automatically when the owning effect scope ends.
 * The cleanup is bound to the **scope**, not to a component lifecycle hook: inside a
 * component setup the two are equivalent, but a Pinia store setup runs in its own
 * scope and is cached per `storeId`, so a component hook would attach to whichever
 * component happened to mount first (the bug fixed in the `ErrorReporter` lifecycle).
 * Called outside any scope, the composable simply registers no cleanup.
 *
 * @param callback - The function to debounce
 * @param delay - The delay in milliseconds (default: 300)
 * @param options - Scope-dispose behavior
 * @returns The debounced function plus `cancel` (drop pending) and `flush` (run now)
 *
 * @example
 * const { debounced, cancel } = useDebounce((value: string) => {
 *     store.search(value);
 * }, 300);
 *
 * // Call debounced version
 * debounced('search term');
 *
 * // Cancel pending execution
 * cancel();
 *
 * @example
 * // A debounced write that must not lose the last change
 * const { debounced, flush } = useDebounce(save, 250, { flushOnDispose: true });
 */
export function useDebounce<Args extends unknown[]>(
    callback: (...args: Args) => void,
    delay: number = 300,
    options: DebounceOptions = {}
): { debounced: (...args: Args) => void; cancel: () => void; flush: () => void } {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let pendingArgs: Args | null = null;

    const cancel = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        pendingArgs = null;
    };

    /** Runs a pending call immediately; a no-op when nothing is scheduled. */
    const flush = () => {
        if (timeoutId === null) {
            return;
        }
        const args = pendingArgs;
        cancel();
        if (args !== null) {
            callback(...args);
        }
    };

    const debounced = (...args: Args) => {
        cancel();
        pendingArgs = args;
        timeoutId = setTimeout(() => {
            timeoutId = null;
            pendingArgs = null;
            callback(...args);
        }, delay);
    };

    if (getCurrentScope()) {
        onScopeDispose(options.flushOnDispose === true ? flush : cancel);
    }

    return { debounced, cancel, flush };
}
