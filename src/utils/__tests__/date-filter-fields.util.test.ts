import { describe, it, expect } from 'vitest';
import { collectDateFilterFields } from '../date-filter-fields.util';
import type { Header } from '../../types/api-response.types';

describe('collectDateFilterFields', () => {
    it('should return an empty set for a null header', () => {
        expect(collectDateFilterFields(null)).toEqual(new Set());
    });

    it('should return an empty set for a header without rows', () => {
        expect(collectDateFilterFields({} as Header)).toEqual(new Set());
    });

    it('should collect a filterable date column by its field', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        {
                            key: 'created_at',
                            field: 'created_at',
                            filterable: true,
                            date: true,
                            content: 'Created at',
                        },
                    ],
                },
            ],
        };

        expect(collectDateFilterFields(header)).toEqual(new Set(['created_at']));
    });

    it('should prefer reference over field, matching resolveCellField', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        {
                            key: 'created_at',
                            field: 'created_at',
                            reference: 'created_at_raw',
                            filterable: true,
                            date: true,
                            content: 'Created at',
                        },
                    ],
                },
            ],
        };

        expect(collectDateFilterFields(header)).toEqual(new Set(['created_at_raw']));
    });

    it('should ignore a date column that is not filterable', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        { key: 'created_at', field: 'created_at', date: true, content: 'Created' },
                    ],
                },
            ],
        };

        expect(collectDateFilterFields(header)).toEqual(new Set());
    });

    it('should ignore a filterable column that is not a date column', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        {
                            key: 'status',
                            field: 'status',
                            filterable: true,
                            content: 'Status',
                        },
                    ],
                },
            ],
        };

        expect(collectDateFilterFields(header)).toEqual(new Set());
    });

    it('should collect across multiple rows and cells', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        { key: 'a', field: 'a', filterable: true, date: true, content: 'A' },
                        { key: 'b', field: 'b', filterable: true, content: 'B' },
                    ],
                },
                {
                    cells: [{ key: 'c', field: 'c', filterable: true, date: true, content: 'C' }],
                },
            ],
        };

        expect(collectDateFilterFields(header)).toEqual(new Set(['a', 'c']));
    });
});
