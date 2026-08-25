/**
 * Generic lazy loader for validator functions to enable code splitting.
 *
 * @template T The type of the module being imported
 * @template K The key of the export in the module
 * @param {() => Promise<T>} importFn The dynamic import function (e.g., () => import('./my-module'))
 * @param {K} exportName The name of the exported function to use
 * @returns {T[K]} An async wrapper function that loads the module on first call and then delegates to the implementation
 *
 * @example
 * const lazyValidate = createLazyValidator(() => import('./validator'), 'validate');
 * await lazyValidate(data);
 */
export function createLazyValidator<T, K extends keyof T>(
    importFn: () => Promise<T>,
    exportName: K
): T[K] extends (...args: infer P) => infer R ? (...args: P) => Promise<R> : never {
    let cachedModule: T | null = null;
    let loadingPromise: Promise<T> | null = null;

    return (async (...args: unknown[]) => {
        if (!cachedModule) {
            if (!loadingPromise) {
                loadingPromise = importFn();
            }
            cachedModule = await loadingPromise;
            loadingPromise = null;
        }

        const validator = cachedModule[exportName];

        if (typeof validator !== 'function') {
            throw new Error(
                `Export "${String(exportName)}" is not a function in the imported module.`
            );
        }

        // Cast the validator and args properly to infer the return type from the generic context
        const fn = validator as unknown as (...args: unknown[]) => unknown;
        return fn(...args);
    }) as T[K] extends (...args: infer P) => infer R ? (...args: P) => Promise<R> : never;
}
