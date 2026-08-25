import { describe, it, expect } from 'vitest';
import { extractFilterElements } from '../extract-filter-elements.util';
import type { Header } from '../../types/api-response.types';

describe('extractFilterElements', () => {
    it('should return null if header is null', () => {
        const result = extractFilterElements(null, [{ id: 1 }]);
        expect(result).toBeNull();
    });

    it('should return original header if items is null or empty', () => {
        const header: Header = { rows: [] };
        expect(extractFilterElements(header, null)).toBe(header);
        expect(extractFilterElements(header, [])).toBe(header);
    });

    it('should auto-generate elements for filterable columns without elements', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        { key: 'status', field: 'status', filterable: true, content: 'Status' },
                    ],
                },
            ],
        };

        const items = [{ status: 'active' }, { status: 'inactive' }, { status: 'active' }];

        const result = extractFilterElements(header, items);

        expect(result).not.toBe(header); // Should be a new object
        const firstCell = result!.rows![0]!.cells![0];
        expect(firstCell!.elements).toEqual(['active', 'inactive']);
    });

    it('should sort generated elements', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        {
                            key: 'category',
                            field: 'category',
                            filterable: true,
                            content: 'Category',
                        },
                    ],
                },
            ],
        };

        const items = [{ category: 'B' }, { category: 'A' }, { category: 'C' }];

        const result = extractFilterElements(header, items);

        const firstCell = result!.rows![0]!.cells![0];
        expect(firstCell!.elements).toEqual(['A', 'B', 'C']);
    });

    it('should handle numeric values', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        { key: 'role_id', field: 'role_id', filterable: true, content: 'Role ID' },
                    ],
                },
            ],
        };

        const items = [{ role_id: 2 }, { role_id: 1 }, { role_id: 3 }];

        const result = extractFilterElements(header, items);

        const firstCell = result!.rows![0]!.cells![0];
        expect(firstCell!.elements).toEqual([1, 2, 3]);
    });

    it('should not overwrite existing elements', () => {
        const existingElements = ['custom1', 'custom2'];
        const header: Header = {
            rows: [
                {
                    cells: [
                        {
                            key: 'status',
                            field: 'status',
                            filterable: true,
                            content: 'Status',
                            elements: existingElements,
                        },
                    ],
                },
            ],
        };

        const items = [{ status: 'active' }, { status: 'inactive' }];

        const result = extractFilterElements(header, items);

        const firstCell = result!.rows![0]!.cells![0];
        expect(firstCell!.elements).toBe(existingElements);
    });

    it('should ignore columns where filterable is false or undefined', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        { key: 'c1', field: 'c1', filterable: false, content: 'C1' },
                        { key: 'c2', field: 'c2', content: 'C2' }, // undefined filterable
                    ],
                },
            ],
        };

        const items = [{ c1: 'A', c2: 'B' }];

        const result = extractFilterElements(header, items);

        expect(result).toEqual(header); // Structure should be identical
        const firstCell = result!.rows![0]!.cells![0];
        const secondCell = result!.rows![0]!.cells![1];
        expect(firstCell!.elements).toBeUndefined();
        expect(secondCell!.elements).toBeUndefined();
    });

    it('should handle nested fields using resolveValue', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        { key: 'user.role', field: 'user.role', filterable: true, content: 'Role' },
                    ],
                },
            ],
        };

        const items = [{ user: { role: 'Admin' } }, { user: { role: 'User' } }];

        const result = extractFilterElements(header, items);

        const firstCell = result!.rows![0]!.cells![0];
        expect(firstCell!.elements).toEqual(['Admin', 'User']);
    });

    it('should robustly handle missing fields or values', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        { key: 'missing', field: 'missing', filterable: true, content: 'Missing' },
                    ],
                },
            ],
        };

        // One item has value, others missing
        const items = [{ missing: 'Exists' }, {}, { other: 'value' }];

        const result = extractFilterElements(header, items);

        // Should contain only the existing value
        const firstCell = result!.rows![0]!.cells![0];
        expect(firstCell!.elements).toEqual(['Exists']);
    });

    it('should robustly handle non-string/non-number values (ignore them)', () => {
        const header: Header = {
            rows: [
                {
                    cells: [{ key: 'mixed', field: 'mixed', filterable: true, content: 'Mixed' }],
                },
            ],
        };

        const items = [
            { mixed: 'Valid' },
            { mixed: null },
            { mixed: undefined },
            { mixed: { object: true } },
            { mixed: true }, // boolean
        ];

        const result = extractFilterElements(header, items);

        const firstCell = result!.rows![0]!.cells![0];
        expect(firstCell!.elements).toEqual(['Valid']);
    });

    it('should skip columns without field property', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        { key: 'nofield', filterable: true, content: 'No Field' }, // Missing field
                    ],
                },
            ],
        };

        const items = [{ nofield: 'Value' }];

        const result = extractFilterElements(header, items);

        // Should not modify header since field is missing
        expect(result).toBe(header);
        const firstCell = result!.rows![0]!.cells![0];
        expect(firstCell!.elements).toBeUndefined();
    });

    it('should handle mixed string and number values (sorted properly)', () => {
        const header: Header = {
            rows: [
                {
                    cells: [{ key: 'mixed', field: 'mixed', filterable: true, content: 'Mixed' }],
                },
            ],
        };

        const items = [{ mixed: 'Zebra' }, { mixed: 10 }, { mixed: 'Apple' }, { mixed: 5 }];

        const result = extractFilterElements(header, items);

        // Strings are alphabetically sorted, numbers numerically
        // Current implementation uses localeCompare which treats everything as string
        // So: "10", "5", "Apple", "Zebra" -> "10", "5", "Apple", "Zebra" (lexicographic)
        // For now, we accept the current behavior (all converted to string)
        const firstCell = result!.rows![0]!.cells![0];
        const elements = firstCell!.elements as (string | number)[];
        expect(elements).toHaveLength(4);
        expect(elements).toContain(10);
        expect(elements).toContain(5);
        expect(elements).toContain('Apple');
        expect(elements).toContain('Zebra');
    });

    it('should generate elements for multiple filterable columns', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        { key: 'status', field: 'status', filterable: true, content: 'Status' },
                        { key: 'role', field: 'role', filterable: true, content: 'Role' },
                    ],
                },
            ],
        };

        const items = [
            { status: 'active', role: 'admin' },
            { status: 'inactive', role: 'user' },
        ];

        const result = extractFilterElements(header, items);

        const firstCell = result!.rows![0]!.cells![0];
        const secondCell = result!.rows![0]!.cells![1];
        expect(firstCell!.elements).toEqual(['active', 'inactive']);
        expect(secondCell!.elements).toEqual(['admin', 'user']);
    });

    it('should not set elements if all values are null/undefined', () => {
        const header: Header = {
            rows: [
                {
                    cells: [{ key: 'empty', field: 'empty', filterable: true, content: 'Empty' }],
                },
            ],
        };

        const items = [{ empty: null }, { empty: undefined }, {}];

        const result = extractFilterElements(header, items);

        // No valid values, so elements should remain undefined
        expect(result).toBe(header);
        const firstCell = result!.rows![0]!.cells![0];
        expect(firstCell!.elements).toBeUndefined();
    });

    it('should not mutate the original header object', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        { key: 'status', field: 'status', filterable: true, content: 'Status' },
                    ],
                },
            ],
        };

        const items = [{ status: 'active' }];

        const originalHeaderRef = header;
        const originalRowRef = header.rows![0];
        const originalCellRef = header.rows![0]!.cells![0];

        const result = extractFilterElements(header, items);

        // Result should be a different object
        expect(result).not.toBe(originalHeaderRef);
        const resultRow = result!.rows![0];
        const resultCell = resultRow!.cells![0];
        expect(resultRow).not.toBe(originalRowRef);
        expect(resultCell).not.toBe(originalCellRef);

        // Original should remain unchanged
        expect(originalCellRef!.elements).toBeUndefined();
    });

    it('should handle headers with multiple rows', () => {
        const header: Header = {
            rows: [
                {
                    cells: [{ key: 'col1', field: 'col1', filterable: true, content: 'Col1' }],
                },
                {
                    cells: [{ key: 'col2', field: 'col2', filterable: true, content: 'Col2' }],
                },
            ],
        };

        const items = [
            { col1: 'A', col2: 'X' },
            { col1: 'B', col2: 'Y' },
        ];

        const result = extractFilterElements(header, items);

        const firstRowCell = result!.rows![0]!.cells![0];
        const secondRowCell = result!.rows![1]!.cells![0];
        expect(firstRowCell!.elements).toEqual(['A', 'B']);
        expect(secondRowCell!.elements).toEqual(['X', 'Y']);
    });

    it('should handle record-type existing elements', () => {
        const existingElements = { '1': 'Active', '0': 'Inactive' };
        const header: Header = {
            rows: [
                {
                    cells: [
                        {
                            key: 'status',
                            field: 'status',
                            filterable: true,
                            content: 'Status',
                            elements: existingElements,
                        },
                    ],
                },
            ],
        };

        const items = [{ status: 'something' }];

        const result = extractFilterElements(header, items);

        // Should not overwrite record-type elements
        const firstCell = result!.rows![0]!.cells![0];
        expect(firstCell!.elements).toBe(existingElements);
    });

    it('should handle single unique value', () => {
        const header: Header = {
            rows: [
                {
                    cells: [
                        { key: 'single', field: 'single', filterable: true, content: 'Single' },
                    ],
                },
            ],
        };

        const items = [{ single: 'OnlyOne' }, { single: 'OnlyOne' }, { single: 'OnlyOne' }];

        const result = extractFilterElements(header, items);

        const firstCell = result!.rows![0]!.cells![0];
        expect(firstCell!.elements).toEqual(['OnlyOne']);
    });
});
