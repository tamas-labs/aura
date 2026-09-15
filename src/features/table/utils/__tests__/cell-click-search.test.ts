import { describe, it, expect } from 'vitest';
import type { HeaderCell } from '../../../../types';
import {
    isCellClickSearchGesture,
    resolveCellClickSearch,
    type CellClickSearchContext,
} from '../cell-click-search';

const NO_GLOBAL: CellClickSearchContext = {
    globalSearchEnabled: false,
    globalSearchableFields: undefined,
};

const GLOBAL: CellClickSearchContext = {
    globalSearchEnabled: true,
    globalSearchableFields: undefined,
};

const column = (overrides: Partial<HeaderCell> = {}): HeaderCell => ({
    key: 'name',
    content: 'Name',
    field: 'name',
    ...overrides,
});

describe('resolveCellClickSearch', () => {
    describe('column search input', () => {
        it('should target a searchable column with the raw value, not the formatted text', () => {
            const target = resolveCellClickSearch(
                column({ key: 'price', field: 'price', searchable: true }),
                { price: 1234.5 },
                NO_GLOBAL
            );

            expect(target).toEqual({ kind: 'column', field: 'price', term: '1234.5' });
        });

        it('should hand over a one-character value of a number column', () => {
            const target = resolveCellClickSearch(
                column({ key: 'age', field: 'age', searchable: true, number: true }),
                { age: 5 },
                NO_GLOBAL
            );

            expect(target).toEqual({ kind: 'column', field: 'age', term: '5' });
        });

        it('should read the value of the field the column searches on (`reference`)', () => {
            const target = resolveCellClickSearch(
                column({
                    key: 'user',
                    field: 'user.name',
                    reference: 'user.id',
                    searchable: true,
                }),
                { user: { id: 7, name: 'Ann' } },
                NO_GLOBAL
            );

            expect(target).toEqual({ kind: 'column', field: 'user.id', term: '7' });
        });

        it('should prefer the column search input over the global one', () => {
            const target = resolveCellClickSearch(
                column({ searchable: true }),
                { name: 'John' },
                GLOBAL
            );

            expect(target).toMatchObject({ kind: 'column' });
        });

        it('should ignore a `between` column instead of falling back to global search', () => {
            const target = resolveCellClickSearch(
                column({ searchable: true, between: true }),
                { name: 'John' },
                GLOBAL
            );

            expect(target).toBeNull();
        });

        it('should accept a multi-field column that names its search field via `reference`', () => {
            const target = resolveCellClickSearch(
                column({
                    key: 'full',
                    field: undefined,
                    fields: ['first', 'last'],
                    reference: 'last',
                    searchable: true,
                }),
                { first: 'John', last: 'Doe' },
                NO_GLOBAL
            );

            expect(target).toEqual({ kind: 'column', field: 'last', term: 'Doe' });
        });
    });

    describe('global search input', () => {
        it('should fall back to global search for a non-searchable column', () => {
            expect(resolveCellClickSearch(column(), { name: 'John' }, GLOBAL)).toEqual({
                kind: 'global',
                term: 'John',
            });
        });

        it('should ignore the click when global search is not shown', () => {
            expect(resolveCellClickSearch(column(), { name: 'John' }, NO_GLOBAL)).toBeNull();
        });

        it('should respect `searchableItems` when the response lists them', () => {
            const listed = { globalSearchEnabled: true, globalSearchableFields: ['name'] };
            const unlisted = { globalSearchEnabled: true, globalSearchableFields: ['email'] };

            expect(resolveCellClickSearch(column(), { name: 'John' }, listed)).toMatchObject({
                kind: 'global',
            });
            expect(resolveCellClickSearch(column(), { name: 'John' }, unlisted)).toBeNull();
        });

        it('should not restrict fields when `searchableItems` is an empty list', () => {
            const context = { globalSearchEnabled: true, globalSearchableFields: [] };

            expect(resolveCellClickSearch(column(), { name: 'John' }, context)).toMatchObject({
                kind: 'global',
            });
        });
    });

    describe('ignored columns and values', () => {
        it('should ignore the selector column', () => {
            const target = resolveCellClickSearch(
                column({ key: 'select', field: 'id', selectable: true, searchable: true }),
                { id: 1 },
                GLOBAL
            );

            expect(target).toBeNull();
        });

        it('should ignore a multi-field column without `reference`', () => {
            const target = resolveCellClickSearch(
                column({ key: 'full', field: undefined, fields: ['first', 'last'] }),
                { first: 'John', last: 'Doe' },
                GLOBAL
            );

            expect(target).toBeNull();
        });

        it.each([
            ['an empty string', ''],
            ['whitespace', '   '],
            ['null', null],
            ['undefined', undefined],
            ['an object', { nested: true }],
            ['an array', ['a', 'b']],
        ])('should ignore %s', (_label, value) => {
            expect(
                resolveCellClickSearch(column({ searchable: true }), { name: value }, GLOBAL)
            ).toBeNull();
        });

        it('should trim the value and stringify booleans', () => {
            expect(
                resolveCellClickSearch(column({ searchable: true }), { name: '  John ' }, GLOBAL)
            ).toMatchObject({ term: 'John' });
            expect(
                resolveCellClickSearch(column({ searchable: true }), { name: false }, GLOBAL)
            ).toMatchObject({ term: 'false' });
        });
    });
});

describe('isCellClickSearchGesture', () => {
    /** Dispatches a click on `element` and reports what the predicate said about it. */
    const gestureOn = (
        element: Element,
        init: ConstructorParameters<typeof MouseEvent>[1]
    ): boolean => {
        let result = false;
        element.addEventListener(
            'click',
            event => {
                result = isCellClickSearchGesture(event as MouseEvent);
            },
            { once: true }
        );
        element.dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }));
        return result;
    };

    const cellContent = (html: string): Element => {
        const td = document.createElement('td');
        td.innerHTML = html;
        return td.firstElementChild ?? td;
    };

    it('should accept a plain Shift+click', () => {
        expect(gestureOn(cellContent('<span>John</span>'), { shiftKey: true })).toBe(true);
    });

    it('should reject a click without Shift', () => {
        expect(gestureOn(cellContent('<span>John</span>'), {})).toBe(false);
    });

    it.each(['ctrlKey', 'metaKey', 'altKey'] as const)(
        'should reject Shift combined with %s',
        modifier => {
            expect(
                gestureOn(cellContent('<span>John</span>'), { shiftKey: true, [modifier]: true })
            ).toBe(false);
        }
    );

    it('should reject a non-primary button', () => {
        expect(gestureOn(cellContent('<span>John</span>'), { shiftKey: true, button: 1 })).toBe(
            false
        );
    });

    it.each([
        ['a link', '<a href="#"><span>John</span></a>'],
        ['a button', '<button type="button"><span>Edit</span></button>'],
        ['an input', '<input type="checkbox">'],
    ])('should leave Shift+click on %s alone', (_label, html) => {
        const td = document.createElement('td');
        td.innerHTML = html;
        const innermost = td.querySelector('span') ?? td.firstElementChild!;

        expect(gestureOn(innermost, { shiftKey: true })).toBe(false);
    });
});
