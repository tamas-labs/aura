import { describe, it, expect, vi } from 'vitest';
import { getOrBuild, BOUNDED_CACHE_LIMIT } from '../bounded-cache.util';

/**
 * Unit tests for the shared memoization helper.
 *
 * The three `Intl` caches that use it (`number.formatter`, `date.formatter`,
 * `sort-items`) keep their `Map` module-private, so the *bound* itself is not
 * observable from their public functions — only the values, which stay correct either
 * way. This is therefore the file that owns the cap's behavior; the call sites assert
 * that formatting/sorting survives an exhausted cache.
 */
describe('bounded cache', () => {
    /** A build function that returns a distinct object per call and counts its calls. */
    const countingBuild = () => {
        let next = 0;
        return vi.fn((): { id: number } => ({ id: next++ }));
    };

    describe('getOrBuild', () => {
        it('should build the value on a miss and store it', () => {
            const cache = new Map<string, { id: number }>();
            const build = countingBuild();

            const value = getOrBuild(cache, 'a', build);

            expect(build).toHaveBeenCalledTimes(1);
            expect(cache.size).toBe(1);
            expect(cache.get('a')).toBe(value);
        });

        it('should return the cached instance on a hit without rebuilding', () => {
            const cache = new Map<string, { id: number }>();
            const build = countingBuild();

            const first = getOrBuild(cache, 'a', build);
            const second = getOrBuild(cache, 'a', build);

            expect(second).toBe(first);
            expect(build).toHaveBeenCalledTimes(1);
        });

        it('should keep one entry per key', () => {
            const cache = new Map<string, { id: number }>();
            const build = countingBuild();

            const first = getOrBuild(cache, 'a', build);
            const second = getOrBuild(cache, 'b', build);

            expect(second).not.toBe(first);
            expect(cache.size).toBe(2);
        });

        it('should stop storing once the limit is reached', () => {
            const cache = new Map<string, { id: number }>();
            const build = countingBuild();

            for (let index = 0; index < BOUNDED_CACHE_LIMIT + 10; index++) {
                getOrBuild(cache, `key-${index}`, build);
            }

            expect(cache.size).toBe(BOUNDED_CACHE_LIMIT);
        });

        it('should still return a correct value for keys beyond the limit', () => {
            const cache = new Map<string, string>();
            const build = (key: string) => (): string => `built-${key}`;

            for (let index = 0; index < BOUNDED_CACHE_LIMIT; index++) {
                getOrBuild(cache, `key-${index}`, build(`key-${index}`));
            }

            expect(getOrBuild(cache, 'overflow', build('overflow'))).toBe('built-overflow');
        });

        it('should rebuild on every call for a key that could not be stored', () => {
            const cache = new Map<string, { id: number }>();
            const filler = countingBuild();
            for (let index = 0; index < BOUNDED_CACHE_LIMIT; index++) {
                getOrBuild(cache, `key-${index}`, filler);
            }

            const build = countingBuild();
            const first = getOrBuild(cache, 'overflow', build);
            const second = getOrBuild(cache, 'overflow', build);

            expect(build).toHaveBeenCalledTimes(2);
            expect(second).not.toBe(first);
        });

        it('should keep serving the entries stored before the cap was reached', () => {
            const cache = new Map<string, { id: number }>();
            const build = countingBuild();

            const early = getOrBuild(cache, 'early', build);
            for (let index = 0; index < BOUNDED_CACHE_LIMIT + 10; index++) {
                getOrBuild(cache, `key-${index}`, build);
            }

            expect(getOrBuild(cache, 'early', build)).toBe(early);
        });

        it('should respect an explicit limit', () => {
            const cache = new Map<string, { id: number }>();
            const build = countingBuild();

            getOrBuild(cache, 'a', build, 2);
            getOrBuild(cache, 'b', build, 2);
            getOrBuild(cache, 'c', build, 2);

            expect(cache.size).toBe(2);
            expect(cache.has('c')).toBe(false);
        });

        it('should cache nothing with a limit of zero', () => {
            const cache = new Map<string, { id: number }>();
            const build = countingBuild();

            getOrBuild(cache, 'a', build, 0);
            getOrBuild(cache, 'a', build, 0);

            expect(cache.size).toBe(0);
            expect(build).toHaveBeenCalledTimes(2);
        });

        it('should cache whatever build returns, including a fallback', () => {
            const cache = new Map<string, Intl.Collator>();
            const fallback = new Intl.Collator(undefined, { numeric: true });
            const build = vi.fn((): Intl.Collator => fallback);

            expect(getOrBuild(cache, 'not-a-locale', build)).toBe(fallback);
            expect(getOrBuild(cache, 'not-a-locale', build)).toBe(fallback);
            expect(build).toHaveBeenCalledTimes(1);
        });
    });

    describe('BOUNDED_CACHE_LIMIT', () => {
        it('should match the ceiling used by the zod schema cache', () => {
            // Both caps exist for the same reason (a pathological caller must not turn a
            // module-level Map into an unbounded leak); keeping the numbers in step is
            // documentation, not a functional requirement.
            expect(BOUNDED_CACHE_LIMIT).toBe(64);
        });
    });
});
