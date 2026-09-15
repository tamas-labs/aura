import { describe, it, expect, vi } from 'vitest';
import type { HeaderCell } from '../../../../types';
import {
    applyCellClickSearch,
    isCellClickSearchGesture,
    resolveCellClickSearch,
    type CellClickSearchContext,
    type CellClickSearchStore,
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
    describe('column search', () => {
        it('should target a searchable column with the raw value, not the formatted text', () => {
            const target = resolveCellClickSearch(
                column({ key: 'price', field: 'price', searchable: true }),
                { price: 1234.5 },
                NO_GLOBAL
            );

            expect(target).toEqual({
                kind: 'column',
                field: 'price',
                term: '1234.5',
                exact: undefined,
            });
        });

        it('should search a number column exactly, even for a one-character value', () => {
            const target = resolveCellClickSearch(
                column({ key: 'age', field: 'age', searchable: true, number: true }),
                { age: 5 },
                NO_GLOBAL
            );

            expect(target).toEqual({ kind: 'column', field: 'age', term: '5', exact: true });
        });

        it('should treat a legacy `type: number` column as exact', () => {
            const legacy = { ...column({ searchable: true }), type: 'number' } as HeaderCell;

            expect(resolveCellClickSearch(legacy, { name: 7 }, NO_GLOBAL)).toMatchObject({
                exact: true,
            });
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

            expect(target).toMatchObject({ kind: 'column', field: 'user.id', term: '7' });
        });

        it('should prefer the column search over the global search', () => {
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

            expect(target).toMatchObject({ kind: 'column', field: 'last', term: 'Doe' });
        });
    });

    describe('global search', () => {
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

describe('applyCellClickSearch', () => {
    const createStore = (existingTerm: string | null = null) => {
        const store = {
            setGlobalSearch: vi.fn(),
            getSearchTerm: vi.fn(() => existingTerm),
            addSearch: vi.fn(),
            updateSearchTerm: vi.fn(),
        };
        return { store, typed: store as unknown as CellClickSearchStore };
    };

    it('should set the global search term', () => {
        const { store, typed } = createStore();

        applyCellClickSearch(typed, { kind: 'global', term: 'John' });

        expect(store.setGlobalSearch).toHaveBeenCalledWith('John');
        expect(store.addSearch).not.toHaveBeenCalled();
    });

    it('should add a column search when the column is not searched yet', () => {
        const { store, typed } = createStore(null);

        applyCellClickSearch(typed, { kind: 'column', field: 'age', term: '5', exact: true });

        expect(store.addSearch).toHaveBeenCalledWith('age', '5', true);
        expect(store.updateSearchTerm).not.toHaveBeenCalled();
    });

    it('should replace the term of an already searched column', () => {
        const { store, typed } = createStore('Jane');

        applyCellClickSearch(typed, {
            kind: 'column',
            field: 'name',
            term: 'John',
            exact: undefined,
        });

        expect(store.updateSearchTerm).toHaveBeenCalledWith('name', 'John', undefined);
        expect(store.addSearch).not.toHaveBeenCalled();
    });
});
