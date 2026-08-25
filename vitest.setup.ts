import { afterEach } from 'vitest';
import { enableAutoUnmount } from '@vue/test-utils';
import { getActivePinia } from 'pinia';

/**
 * Global test setup — makes the suite deterministic under `--sequence.shuffle`.
 *
 * The table components are backed by `storeId`-keyed Pinia stores that run async
 * work (formatting/response validation in `watchEffect`, and a
 * `watch(queryParams) → fetchData()` auto-refetch). Left running past the end of
 * a test, those effects and in-flight promises re-enter Pinia during a *later*
 * test and mutate the global active-pinia / store registry, so the later test
 * ends up reading a different (empty) store instance than the one it seeded.
 * The symptom was rare, order-dependent failures (a cell missing its
 * `columnStyles` classes, or a DOMPurify `_sanitizeElements` throw against a
 * torn-down document). This only affected the test environment — in production
 * `app.use(AuraPlugin, ...)` installs a single injected pinia, so there is no
 * active-instance churn.
 *
 * Cleanup after every test:
 * 1. Unmount any component mounted via `@vue/test-utils` (stops component-scoped
 *    `watchEffect`s).
 * 2. Dispose every store in the active pinia (stops the `watch(queryParams)`
 *    auto-refetch watcher, so no further `fetchData()` leaks out).
 * 3. Clear `sessionStorage` so a prior test's persisted session state can't be
 *    restored into the next store instance.
 */
enableAutoUnmount(afterEach);

afterEach(() => {
    const pinia = getActivePinia();
    if (pinia) {
        // `_s` is Pinia's internal id → store-instance registry.
        (pinia as unknown as { _s: Map<string, { $dispose: () => void }> })._s.forEach(store =>
            store.$dispose()
        );
    }

    if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
    }
});
