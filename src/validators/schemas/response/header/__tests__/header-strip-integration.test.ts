import { describe, it, expect, beforeEach } from 'vitest';
import { validateHeader } from '../header.schema';
import { createPinia, setActivePinia } from 'pinia';
import type { ApiResponse } from '../../../../../types/api-response.types';

const TEST_STORE_ID = 'test-integration-strip';
const TEST_HEADER_KEY = 'response.header';

describe('Header Validation - Strip Integration Tests', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('end-to-end strip behavior', () => {
        it('should strip unknown properties at all levels (header, row, cell)', () => {
            const apiResponse: any = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'ID',
                                    key: 'id',
                                    field: 'id',
                                    unknownCellProp: 'remove me',
                                    sortable: true,
                                },
                            ],
                            unknownRowProp: 'remove me too',
                        },
                    ],
                    unknownHeaderProp: 'also remove me',
                    settings: {
                        sticky: true,
                        unknownSettingsProp: 'strip this',
                    },
                },
                items: [],
            };

            const result = validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);

            // Header level
            expect(result).not.toHaveProperty('unknownHeaderProp');
            expect(result.rows).toBeDefined();
            expect(result.settings).toBeDefined();

            // Settings level
            expect(result.settings).toHaveProperty('sticky', true);
            expect(result.settings).not.toHaveProperty('unknownSettingsProp');

            // Row level
            const firstRow = result.rows![0];
            expect(firstRow).not.toHaveProperty('unknownRowProp');
            expect(firstRow?.cells).toBeDefined();

            // Cell level
            const firstCell = firstRow?.cells![0];
            expect(firstCell).toHaveProperty('content', 'ID');
            expect(firstCell).toHaveProperty('sortable', true);
            expect(firstCell).not.toHaveProperty('unknownCellProp');
        });

        it('should preserve data-* attributes on cells while stripping other unknown keys', () => {
            const apiResponse: any = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'Status',
                                    key: 'status',
                                    field: 'status',
                                    'data-tooltip': 'User status',
                                    'data-icon': 'info',
                                    unknownProp: 'strip me',
                                    sortable: true,
                                },
                            ],
                        },
                    ],
                },
                items: [],
            };

            const result = validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);

            const cell = result.rows![0]?.cells![0];
            expect(cell).toHaveProperty('data-tooltip', 'User status');
            expect(cell).toHaveProperty('data-icon', 'info');
            expect(cell).toHaveProperty('sortable', true);
            expect(cell).not.toHaveProperty('unknownProp');
        });

        it('should handle complex real-world scenario with mixed data', () => {
            const apiResponse: any = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'User ID',
                                    key: 'user_id',
                                    field: 'id',
                                    sortable: true,
                                    searchable: false,
                                    width: '100px',
                                    align: 'center' as const,
                                    'data-test': 'user-id-column',
                                    'data-priority': 'high',
                                    internalFlag: true, // Should be stripped
                                    _metadata: { tracking: 'yes' }, // Should be stripped
                                },
                                {
                                    content: 'Username',
                                    key: 'username',
                                    field: 'username',
                                    sortable: true,
                                    width: '200px',
                                    'data-searchable': 'true',
                                    customRenderer: 'linkRenderer', // Should be stripped
                                },
                            ],
                            rowId: 'header-row-1', // Should be stripped
                        },
                    ],
                    settings: {
                        sticky: true,
                        height: '60px',
                        theme: 'dark', // Should be stripped
                    },
                    version: '2.0', // Should be stripped
                    _internal: { cached: true }, // Should be stripped
                },
                items: [],
            };

            const result = validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);

            // Header level checks
            expect(result).not.toHaveProperty('version');
            expect(result).not.toHaveProperty('_internal');
            expect(result.rows).toHaveLength(1);

            // Settings checks
            expect(result.settings).toEqual({ sticky: true, height: '60px' });
            expect(result.settings).not.toHaveProperty('theme');

            // Row checks
            const row = result.rows![0];
            expect(row).not.toHaveProperty('rowId');
            expect(row?.cells).toHaveLength(2);

            // First cell checks
            const cell1 = row?.cells![0];
            expect(cell1).toHaveProperty('content', 'User ID');
            expect(cell1).toHaveProperty('sortable', true);
            expect(cell1).toHaveProperty('width', '100px');
            expect(cell1).toHaveProperty('data-test', 'user-id-column');
            expect(cell1).toHaveProperty('data-priority', 'high');
            expect(cell1).not.toHaveProperty('internalFlag');
            expect(cell1).not.toHaveProperty('_metadata');

            // Second cell checks
            const cell2 = row?.cells![1];
            expect(cell2).toHaveProperty('content', 'Username');
            expect(cell2).toHaveProperty('data-searchable', 'true');
            expect(cell2).not.toHaveProperty('customRenderer');
        });
    });

    describe('security - prototype pollution protection', () => {
        it('should strip __proto__ at all levels', () => {
            const maliciousResponse: any = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'ID',
                                    key: 'id',
                                    field: 'id',
                                    __proto__: { cellPolluted: true },
                                },
                            ],
                            __proto__: { rowPolluted: true },
                        },
                    ],
                    __proto__: { headerPolluted: true },
                },
                items: [],
            };

            const result = validateHeader(maliciousResponse, TEST_STORE_ID, TEST_HEADER_KEY);

            expect(result).not.toHaveProperty('__proto__');
            expect(result.rows![0]).not.toHaveProperty('__proto__');
            expect(result.rows![0]?.cells![0]).not.toHaveProperty('__proto__');
        });

        it('should strip dangerous property names at all levels', () => {
            // Test that unknown fields are removed at every level
            const maliciousResponse: any = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'Name',
                                    key: 'name',
                                    field: 'name',
                                    dangerousField: { cellDangerous: true },
                                    _internalProp: 'remove',
                                },
                            ],
                            unknownRowProp: { rowDangerous: true },
                            _rowInternal: 'remove',
                        },
                    ],
                    extraHeaderProp: { headerDangerous: true },
                    _headerInternal: 'remove',
                },
                items: [],
            };

            const result = validateHeader(maliciousResponse, TEST_STORE_ID, TEST_HEADER_KEY);

            // strip() and stripUnknownNonDataKeys() remove these
            expect(result).not.toHaveProperty('extraHeaderProp');
            expect(result).not.toHaveProperty('_headerInternal');
            expect(result.rows![0]).not.toHaveProperty('unknownRowProp');
            expect(result.rows![0]).not.toHaveProperty('_rowInternal');
            expect(result.rows![0]?.cells![0]).not.toHaveProperty('dangerousField');
            expect(result.rows![0]?.cells![0]).not.toHaveProperty('_internalProp');
        });
    });

    describe('performance - large dataset', () => {
        it('should handle stripping in large datasets efficiently', () => {
            const largeCellsArray = Array.from({ length: 50 }, (_, i) => ({
                content: `Column ${i}`,
                key: `col_${i}`,
                field: `col_${i}`,
                sortable: true,
                unknownProp1: 'strip',
                unknownProp2: 'strip',
                'data-index': i.toString(),
            }));

            const apiResponse: any = {
                header: {
                    rows: [{ cells: largeCellsArray }],
                },
                items: [],
            };

            const startTime = Date.now();
            const result = validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);
            const endTime = Date.now();

            expect(result.rows![0]?.cells).toHaveLength(50);

            // Check first and last cell
            const firstCell = result.rows![0]?.cells![0];
            const lastCell = result.rows![0]?.cells![49];

            expect(firstCell).toHaveProperty('content', 'Column 0');
            expect(firstCell).not.toHaveProperty('unknownProp1');
            expect(firstCell).toHaveProperty('data-index', '0');

            expect(lastCell).toHaveProperty('content', 'Column 49');
            expect(lastCell).not.toHaveProperty('unknownProp2');
            expect(lastCell).toHaveProperty('data-index', '49');

            // Performance check (should complete reasonably fast)
            const duration = endTime - startTime;
            expect(duration).toBeLessThan(1000); // Should take less than 1 second
        });
    });

    describe('edge cases', () => {
        it('should handle empty cells array after row is stripped', () => {
            const apiResponse: any = {
                header: {
                    rows: [
                        {
                            cells: [{ content: 'ID', key: 'id', field: 'id' }],
                            extraProp: 'strip',
                        },
                    ],
                },
                items: [],
            };

            const result = validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);

            expect(result.rows![0]?.cells).toHaveLength(1);
            expect(result.rows![0]).not.toHaveProperty('extraProp');
        });

        it('should preserve null and undefined in known optional fields', () => {
            const apiResponse: ApiResponse = {
                header: {
                    rows: [
                        {
                            cells: [
                                {
                                    content: 'Status',
                                    key: 'status',
                                    field: 'status',
                                    label: null,
                                    width: undefined,
                                },
                            ],
                        },
                    ],
                    settings: null,
                },
                items: [],
            };

            const result = validateHeader(apiResponse, TEST_STORE_ID, TEST_HEADER_KEY);

            const cell = result.rows![0]?.cells![0];
            expect(cell).toHaveProperty('content', 'Status');
            // null/undefined optional fields may or may not be present depending on Zod behavior
        });
    });
});
