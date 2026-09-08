import { describe, it, expect } from 'vitest';
import { buildActiveFilterBadges } from '../active-filters';
import type { Header } from '../../../../types/api-response.types';

const header: Header = {
    rows: [
        {
            cells: [
                { key: 'name', field: 'name', content: 'Name' },
                { key: 'email', field: 'email', content: 'E-mail', label: 'Mail' },
                { key: 'status', field: 'status_id', reference: 'status', content: 'Status' },
            ],
        },
    ],
};

const sources = (overrides = {}) => ({
    header,
    searchItems: [],
    filterItems: [],
    globalSearchTerm: null,
    globalSearchLabel: 'Search',
    ...overrides,
});

describe('buildActiveFilterBadges', () => {
    it('should return an empty list when nothing is active', () => {
        expect(buildActiveFilterBadges(sources())).toEqual([]);
    });

    it('should build a badge for the global search term', () => {
        const badges = buildActiveFilterBadges(sources({ globalSearchTerm: 'jane' }));

        expect(badges).toEqual([
            { id: 'global', kind: 'global', field: '', label: 'Search', value: 'jane' },
        ]);
    });

    it('should label a column search from the header', () => {
        const badges = buildActiveFilterBadges(
            sources({ searchItems: [{ field: 'name', term: 'Jane' }] })
        );

        expect(badges[0]).toMatchObject({
            id: 'search:name',
            kind: 'search',
            field: 'name',
            label: 'Name',
            value: 'Jane',
        });
    });

    it('should prefer the label over the content', () => {
        const badges = buildActiveFilterBadges(
            sources({ searchItems: [{ field: 'email', term: 'a@b.c' }] })
        );

        expect(badges[0]?.label).toBe('Mail');
    });

    it('should resolve the label through the reference field', () => {
        const badges = buildActiveFilterBadges(
            sources({ filterItems: [{ field: 'status', values: ['active'] }] })
        );

        expect(badges[0]?.label).toBe('Status');
    });

    it('should fall back to the raw field key for an unknown column', () => {
        const badges = buildActiveFilterBadges(
            sources({ searchItems: [{ field: 'unknown', term: 'x' }] })
        );

        expect(badges[0]?.label).toBe('unknown');
    });

    it('should render a closed range as min – max', () => {
        const badges = buildActiveFilterBadges(
            sources({ searchItems: [{ field: 'name', min: 10, max: 20 }] })
        );

        expect(badges[0]?.value).toBe('10 – 20');
    });

    it('should render an open upper bound as ≥ min', () => {
        const badges = buildActiveFilterBadges(
            sources({ searchItems: [{ field: 'name', min: 10, max: null }] })
        );

        expect(badges[0]?.value).toBe('≥ 10');
    });

    it('should render an open lower bound as ≤ max', () => {
        const badges = buildActiveFilterBadges(
            sources({ searchItems: [{ field: 'name', min: null, max: 20 }] })
        );

        expect(badges[0]?.value).toBe('≤ 20');
    });

    it('should skip a search item with neither a term nor a bound', () => {
        const badges = buildActiveFilterBadges(sources({ searchItems: [{ field: 'name' }] }));

        expect(badges).toEqual([]);
    });

    it('should join filter values with a comma', () => {
        const badges = buildActiveFilterBadges(
            sources({ filterItems: [{ field: 'status', values: ['active', 'pending'] }] })
        );

        expect(badges[0]?.value).toBe('active, pending');
    });

    it('should skip a filter item with no values', () => {
        const badges = buildActiveFilterBadges(
            sources({ filterItems: [{ field: 'status', values: [] }] })
        );

        expect(badges).toEqual([]);
    });

    it('should order the badges global → search → filter', () => {
        const badges = buildActiveFilterBadges(
            sources({
                globalSearchTerm: 'jane',
                searchItems: [{ field: 'name', term: 'Jane' }],
                filterItems: [{ field: 'status', values: ['active'] }],
            })
        );

        expect(badges.map(badge => badge.id)).toEqual(['global', 'search:name', 'filter:status']);
    });

    it('should survive a missing header', () => {
        const badges = buildActiveFilterBadges(
            sources({ header: null, searchItems: [{ field: 'name', term: 'Jane' }] })
        );

        expect(badges[0]?.label).toBe('name');
    });

    it('should let the last header row win over an earlier one', () => {
        const twoRows: Header = {
            rows: [
                { cells: [{ key: 'name', field: 'name', content: 'Group' }] },
                { cells: [{ key: 'name', field: 'name', content: 'Name' }] },
            ],
        };
        const badges = buildActiveFilterBadges(
            sources({ header: twoRows, searchItems: [{ field: 'name', term: 'Jane' }] })
        );

        expect(badges[0]?.label).toBe('Name');
    });

    it('should fall back to the key when label and content are both null', () => {
        const nullHeader: Header = {
            rows: [{ cells: [{ key: 'name', field: 'name', content: null, label: null }] }],
        };
        const badges = buildActiveFilterBadges(
            sources({ header: nullHeader, searchItems: [{ field: 'name', term: 'Jane' }] })
        );

        expect(badges[0]?.label).toBe('name');
    });
});
