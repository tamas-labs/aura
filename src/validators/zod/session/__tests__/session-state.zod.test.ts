import { describe, it, expect } from 'vitest';
import { SortItemZod, SearchItemZod, SessionStateZod } from '../session-state.zod';

describe('SessionState Zod Validators', () => {
    describe('SortItemZod', () => {
        describe('valid cases', () => {
            it('should accept valid sort item with asc direction', () => {
                const result = SortItemZod.safeParse({ field: 'name', direction: 'asc' });
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toEqual({ field: 'name', direction: 'asc' });
                }
            });

            it('should accept valid sort item with desc direction', () => {
                const result = SortItemZod.safeParse({ field: 'email', direction: 'desc' });
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toEqual({ field: 'email', direction: 'desc' });
                }
            });

            it('should accept field with max length (250)', () => {
                const longField = 'a'.repeat(250);
                const result = SortItemZod.safeParse({ field: longField, direction: 'asc' });
                expect(result.success).toBe(true);
            });
        });

        describe('invalid cases', () => {
            it('should reject missing field', () => {
                const result = SortItemZod.safeParse({ direction: 'asc' });
                expect(result.success).toBe(false);
            });

            it('should reject missing direction', () => {
                const result = SortItemZod.safeParse({ field: 'name' });
                expect(result.success).toBe(false);
            });

            it('should reject invalid direction', () => {
                const result = SortItemZod.safeParse({ field: 'name', direction: 'invalid' });
                expect(result.success).toBe(false);
            });

            it('should reject empty field', () => {
                const result = SortItemZod.safeParse({ field: '', direction: 'asc' });
                expect(result.success).toBe(false);
            });

            it('should reject field exceeding max length', () => {
                const tooLong = 'a'.repeat(251);
                const result = SortItemZod.safeParse({ field: tooLong, direction: 'asc' });
                expect(result.success).toBe(false);
            });

            it('should reject non-string field', () => {
                const result = SortItemZod.safeParse({ field: 123, direction: 'asc' });
                expect(result.success).toBe(false);
            });
        });
    });

    describe('SearchItemZod', () => {
        describe('valid cases', () => {
            it('should accept valid search item', () => {
                const result = SearchItemZod.safeParse({ field: 'name', term: 'John' });
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toEqual({ field: 'name', term: 'John' });
                }
            });

            it('should accept search item with exact flag', () => {
                const result = SearchItemZod.safeParse({
                    field: 'email',
                    term: 'test@example.com',
                    exact: true,
                });
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.exact).toBe(true);
                }
            });

            it('should accept search item without exact flag', () => {
                const result = SearchItemZod.safeParse({ field: 'name', term: 'test' });
                expect(result.success).toBe(true);
            });

            it('should accept field with max length (250)', () => {
                const longField = 'a'.repeat(250);
                const result = SearchItemZod.safeParse({ field: longField, term: 'test' });
                expect(result.success).toBe(true);
            });

            it('should accept term with max length (500)', () => {
                const longTerm = 'a'.repeat(500);
                const result = SearchItemZod.safeParse({ field: 'name', term: longTerm });
                expect(result.success).toBe(true);
            });

            it('should accept a range (between) item without term', () => {
                const result = SearchItemZod.safeParse({ field: 'age', min: 18, max: 65 });
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toEqual({ field: 'age', min: 18, max: 65 });
                }
            });

            it('should accept string range bounds and null bound', () => {
                const result = SearchItemZod.safeParse({
                    field: 'created',
                    min: '2024-01-01',
                    max: null,
                });
                expect(result.success).toBe(true);
            });

            it('should accept a bare field (no term nor bounds)', () => {
                const result = SearchItemZod.safeParse({ field: 'name' });
                expect(result.success).toBe(true);
            });
        });

        describe('invalid cases', () => {
            it('should reject missing field', () => {
                const result = SearchItemZod.safeParse({ term: 'test' });
                expect(result.success).toBe(false);
            });

            it('should reject empty term', () => {
                const result = SearchItemZod.safeParse({ field: 'name', term: '' });
                expect(result.success).toBe(false);
            });

            it('should reject empty field', () => {
                const result = SearchItemZod.safeParse({ field: '', term: 'test' });
                expect(result.success).toBe(false);
            });

            it('should reject field exceeding max length', () => {
                const tooLong = 'a'.repeat(251);
                const result = SearchItemZod.safeParse({ field: tooLong, term: 'test' });
                expect(result.success).toBe(false);
            });

            it('should reject term exceeding max length', () => {
                const tooLong = 'a'.repeat(501);
                const result = SearchItemZod.safeParse({ field: 'name', term: tooLong });
                expect(result.success).toBe(false);
            });

            it('should reject non-string field', () => {
                const result = SearchItemZod.safeParse({ field: 123, term: 'test' });
                expect(result.success).toBe(false);
            });

            it('should reject non-string term', () => {
                const result = SearchItemZod.safeParse({ field: 'name', term: 123 });
                expect(result.success).toBe(false);
            });

            it('should reject non-boolean exact', () => {
                const result = SearchItemZod.safeParse({
                    field: 'name',
                    term: 'test',
                    exact: 'yes',
                });
                expect(result.success).toBe(false);
            });
        });
    });

    describe('SessionStateZod', () => {
        describe('valid cases', () => {
            it('should accept complete valid session state', () => {
                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [{ field: 'name', direction: 'asc' as const }],
                    searchItems: [{ field: 'email', term: 'test' }],
                    globalSearchTerm: 'search',
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).toEqual(sessionState);
                }
            });

            it('should accept session with empty arrays', () => {
                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(true);
            });

            it('should accept selectedRows with string and number ids', () => {
                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                    selectedRows: [1, 2, 'abc'],
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data.selectedRows).toEqual([1, 2, 'abc']);
                }
            });

            it('should reject selectedRows containing non-primitive values', () => {
                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                    selectedRows: [{ id: 1 }],
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should accept session with null globalSearchTerm', () => {
                const sessionState = {
                    page: 5,
                    limit: 25,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(true);
            });

            it('should accept session with multiple sort items', () => {
                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [
                        { field: 'name', direction: 'asc' as const },
                        { field: 'email', direction: 'desc' as const },
                        { field: 'date', direction: 'asc' as const },
                    ],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(true);
            });

            it('should accept session with multiple search items', () => {
                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [],
                    searchItems: [
                        { field: 'name', term: 'John' },
                        { field: 'email', term: 'test@example.com', exact: true },
                        { field: 'city', term: 'Budapest' },
                    ],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(true);
            });

            it('should accept page at maximum (100000)', () => {
                const sessionState = {
                    page: 100000,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(true);
            });

            it('should accept limit at maximum (1000)', () => {
                const sessionState = {
                    page: 1,
                    limit: 1000,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(true);
            });

            it('should accept sortItems at maximum (20 items)', () => {
                const sortItems = Array.from({ length: 20 }, (_, i) => ({
                    field: `field${i}`,
                    direction: 'asc' as const,
                }));

                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems,
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(true);
            });

            it('should accept searchItems at maximum (50 items)', () => {
                const searchItems = Array.from({ length: 50 }, (_, i) => ({
                    field: `field${i}`,
                    term: `term${i}`,
                }));

                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [],
                    searchItems,
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(true);
            });

            it('should accept globalSearchTerm at maximum length (500)', () => {
                const longSearch = 'a'.repeat(500);
                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: longSearch,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(true);
            });
        });

        describe('invalid cases', () => {
            it('should reject missing page', () => {
                const sessionState = {
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject missing limit', () => {
                const sessionState = {
                    page: 1,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject missing sortItems', () => {
                const sessionState = {
                    page: 1,
                    limit: 10,
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject missing searchItems', () => {
                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject missing globalSearchTerm', () => {
                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject page = 0', () => {
                const sessionState = {
                    page: 0,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject negative page', () => {
                const sessionState = {
                    page: -1,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject page exceeding maximum', () => {
                const sessionState = {
                    page: 100001,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject page as decimal', () => {
                const sessionState = {
                    page: 1.5,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject limit = 0', () => {
                const sessionState = {
                    page: 1,
                    limit: 0,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject limit exceeding maximum', () => {
                const sessionState = {
                    page: 1,
                    limit: 1001,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject too many sortItems (21)', () => {
                const sortItems = Array.from({ length: 21 }, (_, i) => ({
                    field: `field${i}`,
                    direction: 'asc' as const,
                }));

                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems,
                    searchItems: [],
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject too many searchItems (51)', () => {
                const searchItems = Array.from({ length: 51 }, (_, i) => ({
                    field: `field${i}`,
                    term: `term${i}`,
                }));

                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [],
                    searchItems,
                    globalSearchTerm: null,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject empty string globalSearchTerm', () => {
                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: '',
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject globalSearchTerm exceeding max length', () => {
                const tooLong = 'a'.repeat(501);
                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: tooLong,
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(false);
            });

            it('should reject completely invalid type', () => {
                const result = SessionStateZod.safeParse('invalid');
                expect(result.success).toBe(false);
            });

            it('should reject null', () => {
                const result = SessionStateZod.safeParse(null);
                expect(result.success).toBe(false);
            });

            it('should reject undefined', () => {
                const result = SessionStateZod.safeParse(undefined);
                expect(result.success).toBe(false);
            });

            it('should reject array', () => {
                const result = SessionStateZod.safeParse([]);
                expect(result.success).toBe(false);
            });
        });

        describe('edge cases', () => {
            it('should strip extra properties', () => {
                const sessionState = {
                    page: 1,
                    limit: 10,
                    sortItems: [],
                    searchItems: [],
                    globalSearchTerm: null,
                    extraField: 'should be removed',
                };

                const result = SessionStateZod.safeParse(sessionState);
                expect(result.success).toBe(true);
                if (result.success) {
                    expect(result.data).not.toHaveProperty('extraField');
                }
            });
        });
    });
});
