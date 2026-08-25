import { describe, it, expect, beforeEach } from 'vitest';
import { validateHeaderCell } from '../header-cell.schema';
import { createPinia, setActivePinia } from 'pinia';

const TEST_STORE_ID = 'test-strip-store';

describe('validateHeaderCell - Strip Unknown Keys', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('strip unknown properties', () => {
        it('should remove unknown properties from cell', () => {
            const cell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                unknownProp: 'should be removed',
                customField: 123,
                anotherExtra: { nested: 'value' },
            };

            const result = validateHeaderCell(cell, TEST_STORE_ID, 0, 0);

            expect(result).toHaveProperty('content', 'ID');
            expect(result).toHaveProperty('key', 'id');
            expect(result).toHaveProperty('field', 'id');
            expect(result).not.toHaveProperty('unknownProp');
            expect(result).not.toHaveProperty('customField');
            expect(result).not.toHaveProperty('anotherExtra');
        });

        it('should remove __proto__ property (prototype pollution)', () => {
            const maliciousCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                __proto__: { polluted: true },
            };

            const result = validateHeaderCell(maliciousCell, TEST_STORE_ID, 0, 0);

            expect(result).not.toHaveProperty('__proto__');
            expect(result).toHaveProperty('content', 'Name');
        });

        it('should remove constructor property (prototype pollution)', () => {
            const maliciousCell = {
                content: 'Email',
                key: 'email',
                field: 'email',
                constructor: { dangerous: true },
            };

            const result = validateHeaderCell(maliciousCell, TEST_STORE_ID, 0, 0);

            expect(result).not.toHaveProperty('constructor');
            expect(result).toHaveProperty('content', 'Email');
        });
    });

    describe('preserve known optional properties', () => {
        it('should preserve all known optional layout properties', () => {
            const cell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                colspan: 2,
                rowspan: 1,
                width: '100px',
                resizable: true,
                pad: 5,
            };

            const result = validateHeaderCell(cell, TEST_STORE_ID, 0, 0);

            expect(result).toHaveProperty('colspan', 2);
            expect(result).toHaveProperty('rowspan', 1);
            expect(result).toHaveProperty('width', '100px');
            expect(result).toHaveProperty('resizable', true);
            expect(result).toHaveProperty('pad', 5);
        });

        it('should preserve all known functional properties', () => {
            const cell = {
                content: 'Status',
                key: 'status',
                field: 'status',
                sortable: true,
                searchable: true,
                filterable: false,
                selectable: true,
            };

            const result = validateHeaderCell(cell, TEST_STORE_ID, 0, 0);

            expect(result).toHaveProperty('sortable', true);
            expect(result).toHaveProperty('searchable', true);
            expect(result).toHaveProperty('filterable', false);
            expect(result).toHaveProperty('selectable', true);
        });

        it('should preserve all known formatting properties', () => {
            const cell = {
                content: 'Amount',
                key: 'amount',
                field: 'amount',
                align: 'end' as const,
                color: 'primary',
                background: 'light',
                fontSize: '14px',
                fontWeight: 'bold',
            };

            const result = validateHeaderCell(cell, TEST_STORE_ID, 0, 0);

            expect(result).toHaveProperty('align', 'end');
            expect(result).toHaveProperty('color', 'primary');
            expect(result).toHaveProperty('background', 'light');
            expect(result).toHaveProperty('fontSize', '14px');
            expect(result).toHaveProperty('fontWeight', 'bold');
        });
    });

    describe('preserve data-* attributes', () => {
        it('should preserve data-* attributes', () => {
            const cell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                'data-test': 'user-id',
                'data-tooltip': 'User identifier',
                'data-index': '0',
            };

            const result = validateHeaderCell(cell, TEST_STORE_ID, 0, 0);

            expect(result).toHaveProperty('data-test', 'user-id');
            expect(result).toHaveProperty('data-tooltip', 'User identifier');
            expect(result).toHaveProperty('data-index', '0');
        });

        it('should preserve data-* attributes and remove unknown non-data properties', () => {
            const cell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                'data-custom': 'value',
                unknownProp: 'should be removed',
                'data-another': 'preserve me',
                extraField: 123,
            };

            const result = validateHeaderCell(cell, TEST_STORE_ID, 0, 0);

            expect(result).toHaveProperty('data-custom', 'value');
            expect(result).toHaveProperty('data-another', 'preserve me');
            expect(result).not.toHaveProperty('unknownProp');
            expect(result).not.toHaveProperty('extraField');
        });
    });

    describe('mixed scenarios', () => {
        it('should handle cell with known fields, data-*, and unknown props', () => {
            const complexCell = {
                content: 'Status',
                key: 'status',
                field: 'status',
                sortable: true,
                'data-status-type': 'active',
                unknownField: 'remove',
                width: '150px',
                'data-icon': 'check',
                extraData: { some: 'object' },
                align: 'center' as const,
            };

            const result = validateHeaderCell(complexCell, TEST_STORE_ID, 0, 0);

            // Known fields preserved
            expect(result).toHaveProperty('content', 'Status');
            expect(result).toHaveProperty('sortable', true);
            expect(result).toHaveProperty('width', '150px');
            expect(result).toHaveProperty('align', 'center');

            // data-* preserved
            expect(result).toHaveProperty('data-status-type', 'active');
            expect(result).toHaveProperty('data-icon', 'check');

            // Unknown removed
            expect(result).not.toHaveProperty('unknownField');
            expect(result).not.toHaveProperty('extraData');
        });

        it('should work with minimal required fields only', () => {
            const minimalCell = {
                content: 'ID',
                key: 'id',
                field: 'id',
            };

            const result = validateHeaderCell(minimalCell, TEST_STORE_ID, 0, 0);

            expect(result).toEqual({
                content: 'ID',
                key: 'id',
                field: 'id',
            });
        });

        it('should handle empty extra keys gracefully', () => {
            const cellWithEmptyExtras = {
                content: 'Name',
                key: 'name',
                field: 'name',
                '': 'empty key',
                ' ': 'space key',
            };

            const result = validateHeaderCell(cellWithEmptyExtras, TEST_STORE_ID, 0, 0);

            expect(result).toHaveProperty('content', 'Name');
            // Empty and space keys will not become data attributes, so they are not included
            expect(Object.keys(result)).not.toContain('');
            expect(Object.keys(result)).not.toContain(' ');
        });
    });
});
