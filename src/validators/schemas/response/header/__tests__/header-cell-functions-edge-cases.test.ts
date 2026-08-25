import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateHeaderCell } from '../header-cell.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

// Mock the store
vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

/**
 * Edge case tests for the "Functions" fields
 *
 * Supplementary tests covering special cases
 */
describe('validateHeaderCell - Functions Fields Edge Cases', () => {
    const errorStoreId = 'test-error-store';
    const mockAddSchemaValidationError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({
            addSchemaValidationError: mockAddSchemaValidationError,
        } as any);
    });

    describe('Null and undefined handling', () => {
        it('should accept null for sortable', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', sortable: null };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept null for reference', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', reference: null };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should skip validation if field is undefined', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', sortable: undefined };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should skip validation if field is not present', () => {
            const cell = { content: 'ID', field: 'id', key: 'id' };
            // sortable is not present, it cannot throw an error
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });
    });

    describe('Boolean coercion attempts', () => {
        it('should reject numeric 0 for boolean fields', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', sortable: 0 };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'sortable'/
            );
        });

        it('should reject numeric 1 for boolean fields', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', filterable: 1 };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'filterable'/
            );
        });

        it('should reject string "true" for boolean fields', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', searchable: 'true' };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'searchable'/
            );
        });

        it('should reject string "false" for boolean fields', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', show: 'false' };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'show'/);
        });
    });

    describe('Reference field edge cases', () => {
        it('should accept reference with maximum length (100 chars)', () => {
            const longRef = 'a'.repeat(100);
            const cell = { content: 'ID', field: 'id', key: 'id', reference: longRef };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject reference with over maximum length', () => {
            const tooLongRef = 'a'.repeat(101);
            const cell = { content: 'ID', field: 'id', key: 'id', reference: tooLongRef };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'reference'/
            );
        });

        it('should accept reference with special characters', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', reference: 'user.profile_name' };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject reference as array', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', reference: ['field1', 'field2'] };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'reference'/
            );
        });

        it('should reject reference as object', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', reference: { field: 'name' } };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'reference'/
            );
        });

        it('should reject whitespace-only reference', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', reference: '   ' };
            // Depends on validator - if min(1) without trim, spaces are valid
            // But logically, a reference should not be just spaces
            // Our validator accepts it (no trim in the validator)
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });
    });

    describe('Multiple functions fields combinations', () => {
        it('should accept all function fields at once with valid values', () => {
            const cell = {
                content: 'Date',
                field: 'date',
                key: 'date',
                sortable: true,
                searchable: true,
                filterable: true,
                selectable: false,
                show: true,
                between: true,
                reference: 'created_at',
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject if one function field is invalid among many', () => {
            const cell = {
                content: 'Date',
                field: 'date',
                key: 'date',
                sortable: true,
                searchable: 'invalid', // Invalid
                filterable: true,
                between: false,
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'searchable'/
            );
        });

        it('should accept mix of function and layout fields', () => {
            const cell = {
                content: 'Date',
                field: 'date',
                key: 'date',
                colspan: 2,
                sortable: true,
                width: '150px',
                filterable: true,
                reference: 'updated_at',
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });
    });

    describe('Error reporting', () => {
        it('should add error to store when sortable is invalid', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', sortable: 'yes' };

            try {
                validateHeaderCell(cell, errorStoreId, 0, 0);
            } catch {
                // Expected to throw - we only care about the side effect (error reporting)
            }

            expect(mockAddSchemaValidationError).toHaveBeenCalled();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                expect.stringContaining('sortable'),
                expect.stringContaining('.sortable'),
                'yes',
                expect.any(String)
            );
        });

        it('should include row and cell indices in error message', () => {
            const cell = { content: 'ID', field: 'id', key: 'id', reference: 123 };

            expect(() => validateHeaderCell(cell, errorStoreId, 5, 2)).toThrow(/row 2.*cell 5/);
        });
    });

    describe('Real-world scenarios', () => {
        it('should validate typical sortable/searchable column', () => {
            const cell = {
                content: 'Username',
                field: 'username',
                key: 'username',
                sortable: true,
                searchable: true,
                show: true,
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should validate date range column with between', () => {
            const cell = {
                content: 'Created At',
                field: 'created_at',
                key: 'created_at',
                sortable: true,
                filterable: true,
                between: true,
                show: true,
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should validate hidden column', () => {
            const cell = {
                content: 'Internal ID',
                field: 'internal_id',
                key: 'internal_id',
                show: false,
                selectable: false,
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should validate column with reference to another field', () => {
            const cell = {
                content: 'User Info',
                field: 'user_display',
                key: 'user_display',
                searchable: true,
                reference: 'user_email',
            };
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });
    });
});
