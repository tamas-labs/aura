/**
 * Memoization helpers for the zod schema factories.
 *
 * Building a zod schema is roughly **13× more expensive than parsing with it**
 * (measured: `StringZod(1, 250)` construction ~123 µs vs. `.parse()` ~9,4 µs), so a
 * factory that rebuilds its schema on every call spends ~93% of its time on object
 * construction rather than validation. That cost scales with the response: the
 * header-cell schema calls `validateString` five times per cell, so a 20-column
 * header rebuilds ~100 schemas — on every page change, sort and filter in
 * server-side mode.
 *
 * Sharing instances is safe because **zod schemas are immutable**: every builder
 * method (`.min()`, `.nullable()`, `.optional()`) returns a new schema instead of
 * mutating the receiver, and parsing keeps no per-call state on the instance. The
 * plain (non-factory) schemas in this folder — `NumberZod`, `BooleanZod`,
 * `StringArrayZod` — are already module-level constants shared the same way.
 *
 * The cache is per module instance, so a test that re-imports the module with
 * `vi.resetModules()` starts from an empty cache.
 */

/**
 * Upper bound on the entries of a keyed cache.
 *
 * Factory arguments come from source-level call sites (a handful of `min`/`max`
 * pairs), so the key set is bounded in practice; the cap only keeps a pathological
 * caller from turning the cache into an unbounded leak. Above the limit the factory
 * still returns a correct schema — just an uncached one.
 */
const SCHEMA_CACHE_LIMIT = 64;

/**
 * Wraps a parameterless schema factory so its schema is built on first use and
 * reused afterwards (lazily, to keep module evaluation cheap).
 *
 * @param build - The factory building the schema
 * @returns A factory with the same signature, returning the very same instance
 *
 * @example
 * ```ts
 * export const DateStyleZod = cacheSchema(() => z.enum(['short', 'medium', 'long']).nullable());
 * DateStyleZod() === DateStyleZod(); // true
 * ```
 */
export function cacheSchema<TSchema>(build: () => TSchema): () => TSchema {
    let cached: TSchema | undefined;

    return (): TSchema => {
        cached ??= build();
        return cached;
    };
}

/**
 * Wraps a parameterized schema factory so each distinct argument tuple builds its
 * schema once. The cache key is the arguments joined with `:`, which is unambiguous
 * for the numeric bounds used here.
 *
 * @param build - The factory building the schema from its arguments
 * @returns A factory with the same signature, returning the same instance per argument tuple
 *
 * @example
 * ```ts
 * const cachedStringZod = cacheSchemaByArgs((min: number, max: number) => ...);
 * cachedStringZod(1, 250) === cachedStringZod(1, 250); // true
 * cachedStringZod(1, 250) === cachedStringZod(1, 500); // false
 * ```
 */
export function cacheSchemaByArgs<TArgs extends readonly (string | number)[], TSchema>(
    build: (...args: TArgs) => TSchema
): (...args: TArgs) => TSchema {
    const cache = new Map<string, TSchema>();

    return (...args: TArgs): TSchema => {
        const key = args.join(':');
        const cached = cache.get(key);

        if (cached !== undefined) return cached;

        const schema = build(...args);

        if (cache.size < SCHEMA_CACHE_LIMIT) cache.set(key, schema);

        return schema;
    };
}
