/**
 * A size cap for the module-level memoization caches.
 *
 * Three `Map`s cache built-in `Intl` objects keyed by locale and options — the two
 * formatter caches (`number.formatter.ts`, `date.formatter.ts`) and the collator cache
 * (`sort-items.util.ts`). All three grew without a bound, unlike
 * `validators/zod/utils/schema-cache.ts`, which capped itself for exactly this scenario.
 *
 * In practice the key sets are small: the locale is one value per table, and the options
 * come from validated, closed enums. This is therefore not a leak but an inconsistency —
 * and the cap is cheap enough that it is not worth arguing about which caches "deserve"
 * one. What makes it worth extracting rather than copying the two-line pattern three
 * times is that a bound only holds if every writer remembers it; routed through here, a
 * new cache cannot forget.
 */

/**
 * Maximum number of entries a bounded cache keeps.
 *
 * The same 64 as `SCHEMA_CACHE_LIMIT`, for the same reason: comfortably above any
 * realistic key set, low enough that a pathological caller cannot turn the cache into an
 * unbounded leak. Above the limit the value is still returned — it just is not cached.
 */
export const BOUNDED_CACHE_LIMIT = 64;

/**
 * Reads an entry from a bounded cache, building and storing it on first use.
 *
 * Once `limit` entries are stored, further keys are built on every call instead of being
 * cached. That is the deliberate trade: a correct value always, a fast one while the key
 * set stays sane.
 *
 * Whatever `build` returns is cached, including a fallback it produced from a failed
 * construction. That is intentional — a locale that cannot build a formatter will not
 * start building one anyway on every subsequent cell. `TValue` excludes `null` and
 * `undefined` so that "absent" and "cached as nullish" cannot be confused; a cache of
 * optional values needs a different helper, not a looser one.
 *
 * @param cache - The cache to read from and write into
 * @param key - Cache key
 * @param build - Builds the value when the key is absent
 * @param limit - Maximum entries to store, {@link BOUNDED_CACHE_LIMIT} by default
 * @returns The cached value, or a freshly built one
 *
 * @example
 * ```ts
 * const formatters = new Map<string, Intl.NumberFormat>();
 * getOrBuild(formatters, 'hu-HU', () => new Intl.NumberFormat('hu-HU'));
 * ```
 */
export const getOrBuild = <TKey, TValue extends NonNullable<unknown>>(
    cache: Map<TKey, TValue>,
    key: TKey,
    build: () => TValue,
    limit: number = BOUNDED_CACHE_LIMIT
): TValue => {
    const cached = cache.get(key);
    if (cached !== undefined) return cached;

    const value = build();
    if (cache.size < limit) cache.set(key, value);

    return value;
};
