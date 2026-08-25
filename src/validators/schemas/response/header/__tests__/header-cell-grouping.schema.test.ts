import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateHeaderCell } from '../header-cell.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

// Mock store
vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

describe('validateHeaderCell - Grouping & Data Cell Logic', () => {
    const errorStoreId = 'test-error-store';
    const mockAddSchemaValidationError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({
            addSchemaValidationError: mockAddSchemaValidationError,
        } as any);
    });

    describe('Grouping Cells (colspan > 1, no field/fields)', () => {
        it('should accept grouping cell with minimal data: content and colspan > 1', () => {
            const cell = {
                content: 'Price Info',
                colspan: 3,
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toMatchObject({ content: 'Price Info', colspan: 3 });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept grouping cell with colspan = 2', () => {
            const cell = {
                content: 'Group Header',
                colspan: 2,
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toMatchObject({ content: 'Group Header', colspan: 2 });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept grouping cell with additional styling properties', () => {
            const cell = {
                content: 'Price Info',
                colspan: 2,
                class: 'fw-bold',
                align: 'center',
                background: 'primary',
                color: 'white',
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toMatchObject({
                content: 'Price Info',
                colspan: 2,
                class: 'fw-bold',
                align: 'center',
                background: 'primary',
                color: 'white',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept grouping cell with large colspan', () => {
            const cell = {
                content: 'Wide Group',
                colspan: 10,
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toMatchObject({ content: 'Wide Group', colspan: 10 });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept grouping cell without explicit key or field', () => {
            const cell = {
                content: 'Group',
                colspan: 3,
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept grouping cell with label property', () => {
            const cell = {
                content: 'Pricing',
                colspan: 3,
                label: 'Price Information',
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toMatchObject({
                content: 'Pricing',
                colspan: 3,
                label: 'Price Information',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept grouping cell with data attributes', () => {
            const cell = {
                content: 'Statistics',
                colspan: 4,
                'data-group': 'stats',
                'data-tooltip': 'Statistical data',
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result['data-group']).toBe('stats');
            expect(result['data-tooltip']).toBe('Statistical data');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    describe('Data Cells with field (key optional, defaults to field)', () => {
        it('should allow field without key (key auto-assigned to field value)', () => {
            const cell = {
                content: 'Code',
                field: 'code',
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toHaveProperty('key', 'code');
            expect(result).toHaveProperty('field', 'code');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should allow field with explicit key that differs from field', () => {
            const cell = {
                content: 'User ID',
                field: 'user_id',
                key: 'custom_user_key',
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toHaveProperty('key', 'custom_user_key');
            expect(result).toHaveProperty('field', 'user_id');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should allow field with key that matches field', () => {
            const cell = {
                content: 'Name',
                field: 'name',
                key: 'name',
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toHaveProperty('key', 'name');
            expect(result).toHaveProperty('field', 'name');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should default empty key to field value', () => {
            const cell = {
                content: 'Email',
                field: 'email',
                key: '',
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toHaveProperty('key', 'email');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should allow data cell with colspan=1 and field', () => {
            const cell = {
                content: 'Status',
                field: 'status',
                colspan: 1,
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toHaveProperty('key', 'status');
            expect(result).toHaveProperty('colspan', 1);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should treat cell as data cell if field present, even with colspan > 1', () => {
            const cell = {
                content: 'Merged Data',
                colspan: 2,
                field: 'merged_column',
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toHaveProperty('key', 'merged_column');
            expect(result).toHaveProperty('field', 'merged_column');
            expect(result).toHaveProperty('colspan', 2);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    describe('Data Cells with fields (key required)', () => {
        it('should accept fields with explicit key', () => {
            const cell = {
                content: 'Full Name',
                fields: ['first_name', 'last_name'],
                key: 'full_name',
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toHaveProperty('key', 'full_name');
            expect(result).toHaveProperty('fields');
            expect(result.fields).toEqual(['first_name', 'last_name']);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should require key when using fields (missing key)', () => {
            const cell = {
                content: 'Address',
                fields: ['street', 'city', 'country'],
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Missing 'key'/i);
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                expect.stringMatching(/'key' is required/i),
                expect.stringContaining('response.header.rows[0].cells[0].key'),
                cell,
                expect.any(String)
            );
        });

        it('should require key when using fields (empty key)', () => {
            const cell = {
                content: 'Contact',
                fields: ['email', 'phone'],
                key: '',
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Missing 'key'/i);
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                expect.stringMatching(/'key' is required/i),
                expect.any(String),
                cell,
                expect.any(String)
            );
        });

        it('should require key when using fields (whitespace only key)', () => {
            const cell = {
                content: 'Location',
                fields: ['city', 'country'],
                key: '   ',
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Missing 'key'/i);
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                expect.stringMatching(/'key' is required/i),
                expect.any(String),
                cell,
                expect.any(String)
            );
        });

        it('should accept fields with colspan and key', () => {
            const cell = {
                content: 'Multi-field',
                fields: ['a', 'b'],
                key: 'multi',
                colspan: 2,
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toHaveProperty('key', 'multi');
            expect(result).toHaveProperty('colspan', 2);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    describe('Invalid Cases - Missing field/fields on data cells', () => {
        it('should reject data cell with colspan=1 but no field/fields', () => {
            const cell = {
                content: 'Invalid',
                colspan: 1,
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Missing 'field'\/'fields'/i
            );
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                expect.stringMatching(/either 'field' or 'fields' is required/i),
                expect.any(String),
                cell,
                expect.any(String),
                expect.any(Object)
            );
        });

        it('should reject data cell with no colspan (defaults to 1) and no field/fields', () => {
            const cell = {
                content: 'Bad Cell',
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Missing 'field'\/'fields'/i
            );
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                expect.stringMatching(/either 'field' or 'fields' is required/i),
                expect.any(String),
                cell,
                expect.any(String),
                expect.any(Object)
            );
        });

        it('should reject data cell with colspan=0 and no field/fields', () => {
            const cell = {
                content: 'Zero',
                colspan: 0,
            };
            // Colspan 0 is invalid, treated as 1 by the logic (or validation error will be thrown later)
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow();
        });
    });

    describe('Invalid Cases - Mutual exclusivity of field and fields', () => {
        it('should reject cell with both field and fields', () => {
            const cell = {
                content: 'Conflict',
                field: 'single',
                fields: ['a', 'b'],
                key: 'test',
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Both 'field' and 'fields'/i
            );
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                expect.stringMatching(/Cannot have both/i),
                expect.any(String),
                cell,
                expect.any(String)
            );
        });
    });

    describe('Edge Cases - Rowspan behavior', () => {
        it('should not treat rowspan as grouping (requires field/fields)', () => {
            const cell = {
                content: 'Vertical',
                rowspan: 2,
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Missing 'field'\/'fields'/i
            );
        });

        it('should accept rowspan with field', () => {
            const cell = {
                content: 'Multi-row',
                rowspan: 2,
                field: 'data',
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toHaveProperty('key', 'data');
            expect(result).toHaveProperty('rowspan', 2);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept rowspan + colspan as grouping if no field/fields', () => {
            const cell = {
                content: 'Big Group',
                rowspan: 2,
                colspan: 3,
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toMatchObject({
                content: 'Big Group',
                rowspan: 2,
                colspan: 3,
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    describe('Edge Cases - Invalid colspan values', () => {
        it('should handle invalid colspan (non-numeric string)', () => {
            const cell = {
                content: 'Bad',
                colspan: 'invalid',
            };
            // Will be treated as data cell (colspan parsed as 1), requires field
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow();
        });

        it('should handle invalid colspan (negative number)', () => {
            const cell = {
                content: 'Negative',
                colspan: -5,
            };
            // Invalid colspan, validation should catch it
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow();
        });

        it('should handle invalid colspan (too large)', () => {
            const cell = {
                content: 'Too Large',
                colspan: 999,
            };
            // Validation catches colspan > 50
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow();
        });
    });

    describe('Real-world Example from API-response.json', () => {
        it('should accept the Price grouping header from the example', () => {
            const cell = {
                content: 'Price',
                colspan: 3,
                align: 'center',
                background: 'primary',
                color: 'white',
                class: 'fw-bold',
            };
            const result = validateHeaderCell(cell, errorStoreId, 3, 0);
            expect(result).toMatchObject({
                content: 'Price',
                colspan: 3,
                align: 'center',
                background: 'primary',
                color: 'white',
                class: 'fw-bold',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept the USD price column from the example', () => {
            const cell = {
                content: 'USD',
                field: 'priceUsd',
                key: 'priceUsd',
                currency: true,
                align: 'end',
                sortable: true,
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 1);
            expect(result).toMatchObject({
                content: 'USD',
                field: 'priceUsd',
                key: 'priceUsd',
                currency: true,
                align: 'end',
                sortable: true,
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept the File column with rowspan from the example', () => {
            const cell = {
                content: 'File',
                field: 'file',
                key: 'file',
                rowspan: 2,
                sortable: true,
                align: 'start',
                class: 'align-middle',
            };
            const result = validateHeaderCell(cell, errorStoreId, 0, 0);
            expect(result).toMatchObject({
                content: 'File',
                field: 'file',
                key: 'file',
                rowspan: 2,
                sortable: true,
                align: 'start',
                class: 'align-middle',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });
});
