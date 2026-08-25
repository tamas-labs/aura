import { describe, it, expect, vi } from 'vitest';
import { sortItemsByRules } from '../sort-items.util';
import { BOUNDED_CACHE_LIMIT } from '../bounded-cache.util';
import type { SortItem } from '../../types/api-response.types';

describe('sortItemsByRules', () => {
    describe('basic functionality', () => {
        it('should return empty array given null or undefined items', () => {
            expect(sortItemsByRules(null as any, [])).toEqual([]);
            expect(sortItemsByRules(undefined as any, [])).toEqual([]);
        });

        it('should return shallow copy of items if sortRules is empty', () => {
            const items = [{ id: 1 }, { id: 2 }];
            const result = sortItemsByRules(items, []);
            expect(result).toEqual(items);
            expect(result).not.toBe(items); // Reference check
        });

        it('should sort numbers in ascending order', () => {
            const items = [{ val: 3 }, { val: 1 }, { val: 2 }];
            const rules: SortItem[] = [{ field: 'val', direction: 'asc' }];
            const result = sortItemsByRules(items, rules);
            expect(result).toEqual([{ val: 1 }, { val: 2 }, { val: 3 }]);
        });

        it('should sort numbers in descending order', () => {
            const items = [{ val: 1 }, { val: 3 }, { val: 2 }];
            const rules: SortItem[] = [{ field: 'val', direction: 'desc' }];
            const result = sortItemsByRules(items, rules);
            expect(result).toEqual([{ val: 3 }, { val: 2 }, { val: 1 }]);
        });

        it('should sort strings alphabetically (asc)', () => {
            const items = [{ name: 'Banana' }, { name: 'Apple' }, { name: 'Cherry' }];
            const rules: SortItem[] = [{ field: 'name', direction: 'asc' }];
            const result = sortItemsByRules(items, rules);
            expect(result).toEqual([{ name: 'Apple' }, { name: 'Banana' }, { name: 'Cherry' }]);
        });

        it('should sort strings alphabetically (desc)', () => {
            const items = [{ name: 'Banana' }, { name: 'Apple' }, { name: 'Cherry' }];
            const rules: SortItem[] = [{ field: 'name', direction: 'desc' }];
            const result = sortItemsByRules(items, rules);
            expect(result).toEqual([{ name: 'Cherry' }, { name: 'Banana' }, { name: 'Apple' }]);
        });

        it('should sort booleans', () => {
            const items = [{ active: true }, { active: false }, { active: true }];
            const rules: SortItem[] = [{ field: 'active', direction: 'asc' }];
            const result = sortItemsByRules(items, rules);
            expect(result[0]).toEqual({ active: false });
            expect(result[1]).toEqual({ active: true });
        });
    });

    describe('advanced sorting', () => {
        it('should handle multi-column sort', () => {
            const items = [
                { role: 'admin', name: 'Bob' },
                { role: 'user', name: 'Alice' },
                { role: 'admin', name: 'Alice' },
            ];
            const rules: SortItem[] = [
                { field: 'role', direction: 'asc' }, // admin, user
                { field: 'name', direction: 'asc' }, // Alice, Bob
            ];
            // Expected: admin-Alice, admin-Bob, user-Alice
            const result = sortItemsByRules(items, rules);
            expect(result).toEqual([
                { role: 'admin', name: 'Alice' },
                { role: 'admin', name: 'Bob' },
                { role: 'user', name: 'Alice' },
            ]);
        });

        it('should handle nested properties', () => {
            const items = [{ user: { name: 'Bob' } }, { user: { name: 'Alice' } }];
            const rules: SortItem[] = [{ field: 'user.name', direction: 'asc' }];
            const result = sortItemsByRules(items, rules);
            expect(result).toEqual([{ user: { name: 'Alice' } }, { user: { name: 'Bob' } }]);
        });

        it('should handle deep nested properties', () => {
            const items = [{ data: { user: { age: 30 } } }, { data: { user: { age: 20 } } }];
            const rules: SortItem[] = [{ field: 'data.user.age', direction: 'asc' }];
            const result = sortItemsByRules(items, rules);
            expect(result).toEqual([
                { data: { user: { age: 20 } } },
                { data: { user: { age: 30 } } },
            ]);
        });
    });

    describe('edge cases', () => {
        it('should place null/undefined values at the end (asc)', () => {
            const items = [{ val: 2 }, { val: null }, { val: 1 }, { val: undefined }];
            const rulesAsc: SortItem[] = [{ field: 'val', direction: 'asc' }];

            // ASC: 1, 2, null, undefined (nulls always last)
            const resultAsc = sortItemsByRules(items, rulesAsc) as Array<{
                val: number | null | undefined;
            }>;
            expect(resultAsc[0]).toEqual({ val: 1 });
            expect(resultAsc[1]).toEqual({ val: 2 });
            // Last two should be null/undefined (order between them doesn't matter)
            expect([null, undefined]).toContain(resultAsc[2]?.val);
            expect([null, undefined]).toContain(resultAsc[3]?.val);
        });

        it('should place null/undefined values at the end (desc)', () => {
            const items = [{ val: 2 }, { val: null }, { val: 1 }, { val: undefined }];
            const paramsDesc: SortItem[] = [{ field: 'val', direction: 'desc' }];

            // DESC: 2, 1, null, undefined (nulls still last)
            const resultDesc = sortItemsByRules(items, paramsDesc) as Array<{
                val: number | null | undefined;
            }>;
            expect(resultDesc[0]).toEqual({ val: 2 });
            expect(resultDesc[1]).toEqual({ val: 1 });
            expect([null, undefined]).toContain(resultDesc[2]?.val);
            expect([null, undefined]).toContain(resultDesc[3]?.val);
        });

        it('should treat a null and an undefined as equal', () => {
            // The invariant the comparator documents: neither is ordered ahead of
            // the other, so the input order survives in both directions
            const items = [
                { id: 'a', val: undefined },
                { id: 'b', val: null },
            ];

            const asc = sortItemsByRules(items, [{ field: 'val', direction: 'asc' }]) as Array<{
                id: string;
            }>;
            const desc = sortItemsByRules(items, [{ field: 'val', direction: 'desc' }]) as Array<{
                id: string;
            }>;

            expect(asc.map(item => item.id)).toEqual(['a', 'b']);
            expect(desc.map(item => item.id)).toEqual(['a', 'b']);
        });

        it('should handle mixed types gracefully', () => {
            // A mixed string/number pair misses the localeCompare branch and falls
            // through to `<`/`>`, where JS coerces the string to a number. The outcome
            // is deterministic but not meaningful, so this only pins that sorting such
            // a column neither crashes nor drops items.
            const items = [{ val: '10' }, { val: 2 }, { val: '1' }];
            const rules: SortItem[] = [{ field: 'val', direction: 'asc' }];
            const result = sortItemsByRules(items, rules);

            expect(result).toHaveLength(3);
        });

        it('should handle missing fields as undefined', () => {
            const items = [
                { val: 2 },
                { other: 3 }, // val is undefined
                { val: 1 },
            ];
            const rules: SortItem[] = [{ field: 'val', direction: 'asc' }];
            const result = sortItemsByRules(items, rules);
            // 1, 2, undefined
            expect(result[0]).toEqual({ val: 1 });
            expect(result[1]).toEqual({ val: 2 });
            expect(result[2]).toEqual({ other: 3 });
        });

        it('should handle empty items array', () => {
            const items: unknown[] = [];
            const rules: SortItem[] = [{ field: 'val', direction: 'asc' }];
            const result = sortItemsByRules(items, rules);
            expect(result).toEqual([]);
        });

        it('should return copy when no sort rules', () => {
            const items = [{ id: 1 }, { id: 2 }];
            const result = sortItemsByRules(items, []);
            expect(result).toEqual(items);
            expect(result).not.toBe(items); // Different reference
        });

        it('should not mutate original array', () => {
            const items = [{ val: 3 }, { val: 1 }, { val: 2 }];
            const original = [...items];
            const rules: SortItem[] = [{ field: 'val', direction: 'asc' }];

            sortItemsByRules(items, rules);

            // Original array should remain unchanged
            expect(items).toEqual(original);
        });

        it('should handle accented characters correctly', () => {
            const items = [
                { name: 'Zebra' },
                { name: 'Álom' },
                { name: 'Béka' },
                { name: 'Apple' },
            ];
            const rules: SortItem[] = [{ field: 'name', direction: 'asc' }];
            const result = sortItemsByRules(items, rules) as Array<{ name: string }>;

            // localeCompare should handle accents correctly
            expect(result[0]?.name).toBe('Álom');
            expect(result[1]?.name).toBe('Apple');
            expect(result[2]?.name).toBe('Béka');
            expect(result[3]?.name).toBe('Zebra');
        });

        it('should handle numeric strings with localeCompare numeric option', () => {
            const items = [{ code: 'item10' }, { code: 'item2' }, { code: 'item1' }];
            const rules: SortItem[] = [{ field: 'code', direction: 'asc' }];
            const result = sortItemsByRules(items, rules);

            // With numeric: true, "item2" < "item10"
            expect(result).toEqual([{ code: 'item1' }, { code: 'item2' }, { code: 'item10' }]);
        });

        it('should handle objects without the specified field', () => {
            const items = [
                { name: 'Alice', age: 30 },
                { name: 'Bob' }, // No age field
                { name: 'Charlie', age: 25 },
            ];
            const rules: SortItem[] = [{ field: 'age', direction: 'asc' }];
            const result = sortItemsByRules(items, rules);

            // 25, 30, undefined (Bob)
            expect(result[0]).toEqual({ name: 'Charlie', age: 25 });
            expect(result[1]).toEqual({ name: 'Alice', age: 30 });
            expect(result[2]).toEqual({ name: 'Bob' });
        });

        it('should handle three-level nested properties', () => {
            const items = [
                { user: { profile: { score: 100 } } },
                { user: { profile: { score: 50 } } },
                { user: { profile: { score: 75 } } },
            ];
            const rules: SortItem[] = [{ field: 'user.profile.score', direction: 'desc' }];
            const result = sortItemsByRules(items, rules);

            expect(result).toEqual([
                { user: { profile: { score: 100 } } },
                { user: { profile: { score: 75 } } },
                { user: { profile: { score: 50 } } },
            ]);
        });

        it('should handle partially missing nested paths', () => {
            const items = [
                { user: { name: 'Alice' } }, // No profile.age
                { user: { profile: { age: 30 } } },
                { user: { profile: { age: 20 } } },
            ];
            const rules: SortItem[] = [{ field: 'user.profile.age', direction: 'asc' }];
            const result = sortItemsByRules(items, rules);

            // 20, 30, undefined
            expect(result[0]).toEqual({ user: { profile: { age: 20 } } });
            expect(result[1]).toEqual({ user: { profile: { age: 30 } } });
            expect(result[2]).toEqual({ user: { name: 'Alice' } });
        });
    });

    // The `cs` digraph is a letter of its own in Hungarian collation, so it sorts
    // after every plain `c` word — in English it is just c + s, and `csokor`
    // lands before `cukor`. One data set, two correct orders: the locale decides.
    describe('locale-aware comparison', () => {
        const DIGRAPH_ITEMS = [{ word: 'cukor' }, { word: 'csokor' }, { word: 'cica' }];
        const BY_WORD: SortItem[] = [{ field: 'word', direction: 'asc' }];

        const words = (items: unknown[]): string[] =>
            items.map(item => (item as { word: string }).word);

        it('should sort strings by the given locale', () => {
            const hungarian = sortItemsByRules(DIGRAPH_ITEMS, BY_WORD, 'hu-HU');
            const english = sortItemsByRules(DIGRAPH_ITEMS, BY_WORD, 'en-US');

            expect(words(hungarian)).toEqual(['cica', 'cukor', 'csokor']);
            expect(words(english)).toEqual(['cica', 'csokor', 'cukor']);
        });

        it('should apply the locale to a descending sort as well', () => {
            const result = sortItemsByRules(
                DIGRAPH_ITEMS,
                [{ field: 'word', direction: 'desc' }],
                'hu-HU'
            );

            expect(words(result)).toEqual(['csokor', 'cukor', 'cica']);
        });

        // A malformed tag makes the `Intl.Collator` constructor throw. The config
        // validator rejects those, but the comparator runs inside a computed, so
        // it must degrade to the default order instead of taking the render down.
        it('should fall back to the default collation for an invalid locale', () => {
            const result = sortItemsByRules(DIGRAPH_ITEMS, BY_WORD, 'not a locale');

            expect(words(result)).toHaveLength(3);
            expect(words(result)[0]).toBe('cica');
        });

        it('should treat a null locale as "runtime default"', () => {
            const explicitNull = sortItemsByRules(DIGRAPH_ITEMS, BY_WORD, null);
            const omitted = sortItemsByRules(DIGRAPH_ITEMS, BY_WORD);

            expect(words(explicitNull)).toEqual(words(omitted));
        });

        // The performance half of the change: `localeCompare` used to build a
        // collator on every single comparison.
        it('should build one collator per sort, not one per comparison', () => {
            const items = Array.from({ length: 20 }, (_, index) => ({
                word: `word-${20 - index}`,
            }));
            // A locale no other test uses, so the shared cache starts empty for it.
            const locale = 'de-AT';
            const OriginalCollator = Intl.Collator;
            let constructed = 0;
            // The spy has to keep constructing real collators — the sort below
            // compares with the result.
            // A `function` (not an arrow) — vitest can only make a mock
            // constructible from one.
            const collatorSpy = vi.spyOn(Intl, 'Collator').mockImplementation(function (
                tag?: string,
                options?: Intl.CollatorOptions
            ) {
                constructed += 1;
                return new OriginalCollator(tag, options);
            } as unknown as typeof Intl.Collator);

            sortItemsByRules(items, BY_WORD, locale);
            expect(constructed).toBe(1);

            // The second sort reuses the cached instance.
            sortItemsByRules(items, BY_WORD, locale);
            expect(constructed).toBe(1);

            collatorSpy.mockRestore();
        });
    });

    describe('immutability', () => {
        it('should return a new array instance', () => {
            const items = [{ id: 1 }, { id: 2 }];
            const result = sortItemsByRules(items, []);

            expect(result).not.toBe(items);
            expect(result).toEqual(items);
        });

        it('should not modify the original array when sorting', () => {
            const items = [{ val: 3 }, { val: 1 }, { val: 2 }];
            const snapshot = JSON.stringify(items);

            sortItemsByRules(items, [{ field: 'val', direction: 'asc' }]);

            expect(JSON.stringify(items)).toBe(snapshot);
        });
    });
    describe('collator cache cap', () => {
        /**
         * The per-locale collator cache is capped at `BOUNDED_CACHE_LIMIT` entries. Above
         * the cap a collator is built per sort instead of being reused — the ordering must
         * not change. Re-imported so this test fills its own cache.
         */
        it('should keep sorting correctly once the cache is full', async () => {
            vi.resetModules();
            const { sortItemsByRules: freshSort } = await import('../sort-items.util');

            const rules: SortItem[] = [{ field: 'name', direction: 'asc' }];
            const items = [{ name: 'b' }, { name: 'a' }];

            for (let index = 0; index < BOUNDED_CACHE_LIMIT + 10; index++) {
                freshSort(items, rules, `en-US-u-nu-latn-x-p${index}`);
            }

            // An early locale (cached) and one first seen after the cap (never cached)
            expect(freshSort(items, rules, 'en-US-u-nu-latn-x-p0')).toEqual([
                { name: 'a' },
                { name: 'b' },
            ]);
            expect(freshSort(items, rules, 'hu-HU')).toEqual([{ name: 'a' }, { name: 'b' }]);
        });
    });
});
