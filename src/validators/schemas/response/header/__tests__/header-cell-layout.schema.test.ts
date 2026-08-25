import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateHeaderCell } from '../header-cell.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

// Mock the error handler store
vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

describe('validateHeaderCell - Layout Parameters', () => {
    const errorStoreId = 'test-layout-store';
    const mockAddSchemaValidationError = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({
            addSchemaValidationError: mockAddSchemaValidationError,
        } as any);
    });

    const createValidCell = (layoutParams: Record<string, unknown> = {}) => ({
        content: 'Test',
        field: 'test',
        key: 'test',
        ...layoutParams,
    });

    describe('colspan validation', () => {
        it('should accept valid colspan value', () => {
            const cell = createValidCell({ colspan: 2 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept colspan at minimum (1)', () => {
            const cell = createValidCell({ colspan: 1 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept colspan at maximum (50)', () => {
            const cell = createValidCell({ colspan: 50 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept null colspan', () => {
            const cell = createValidCell({ colspan: null });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept cell without colspan (optional)', () => {
            const cell = createValidCell();
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject invalid colspan (0)', () => {
            const cell = createValidCell({ colspan: 0 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'colspan'/);
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should reject invalid colspan (negative)', () => {
            const cell = createValidCell({ colspan: -1 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'colspan'/);
        });

        it('should reject invalid colspan (above max)', () => {
            const cell = createValidCell({ colspan: 51 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'colspan'/);
        });

        it('should reject invalid colspan (decimal)', () => {
            const cell = createValidCell({ colspan: 2.5 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'colspan'/);
        });

        it('should reject invalid colspan (string)', () => {
            const cell = createValidCell({ colspan: '2' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'colspan'/);
        });
    });

    describe('rowspan validation', () => {
        it('should accept valid rowspan value', () => {
            const cell = createValidCell({ rowspan: 3 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept rowspan at minimum (1)', () => {
            const cell = createValidCell({ rowspan: 1 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept rowspan at maximum (20)', () => {
            const cell = createValidCell({ rowspan: 20 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept null rowspan', () => {
            const cell = createValidCell({ rowspan: null });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject invalid rowspan (0)', () => {
            const cell = createValidCell({ rowspan: 0 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'rowspan'/);
        });

        it('should reject invalid rowspan (above max)', () => {
            const cell = createValidCell({ rowspan: 21 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'rowspan'/);
        });
    });

    describe('width validation', () => {
        it('should accept valid width "100px"', () => {
            const cell = createValidCell({ width: '100px' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept valid width "50%"', () => {
            const cell = createValidCell({ width: '50%' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept valid width "2.5rem"', () => {
            const cell = createValidCell({ width: '2.5rem' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept width "auto"', () => {
            const cell = createValidCell({ width: 'auto' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept null width', () => {
            const cell = createValidCell({ width: null });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject invalid width (no unit)', () => {
            const cell = createValidCell({ width: '100' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'width'/);
        });

        it('should reject invalid width (number type)', () => {
            const cell = createValidCell({ width: 100 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'width'/);
        });

        it('should reject invalid width (wrong unit)', () => {
            const cell = createValidCell({ width: '100em' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'width'/);
        });
    });

    describe('resizable validation', () => {
        it('should accept resizable true', () => {
            const cell = createValidCell({ resizable: true });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept resizable false', () => {
            const cell = createValidCell({ resizable: false });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept resizable null', () => {
            const cell = createValidCell({ resizable: null });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject invalid resizable (string)', () => {
            const cell = createValidCell({ resizable: 'true' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'resizable'/
            );
        });

        it('should reject invalid resizable (number)', () => {
            const cell = createValidCell({ resizable: 1 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'resizable'/
            );
        });
    });

    describe('padding validation', () => {
        it('should accept valid pad value', () => {
            const cell = createValidCell({ pad: 10 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept pad at minimum (0)', () => {
            const cell = createValidCell({ pad: 0 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept pad at maximum (100)', () => {
            const cell = createValidCell({ pad: 100 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept valid padStart value', () => {
            const cell = createValidCell({ padStart: 5 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept valid padEnd value', () => {
            const cell = createValidCell({ padEnd: 8 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept all padding fields together', () => {
            const cell = createValidCell({ pad: 10, padStart: 5, padEnd: 8 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept null padding values', () => {
            const cell = createValidCell({ pad: null, padStart: null, padEnd: null });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject invalid pad (negative)', () => {
            const cell = createValidCell({ pad: -1 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'pad'/);
        });

        it('should reject invalid pad (above max)', () => {
            const cell = createValidCell({ pad: 101 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'pad'/);
        });

        it('should reject invalid padStart (decimal)', () => {
            const cell = createValidCell({ padStart: 5.5 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'padStart'/
            );
        });

        it('should reject invalid padEnd (string)', () => {
            const cell = createValidCell({ padEnd: '8' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'padEnd'/);
        });
    });

    describe('chars validation', () => {
        it('should accept valid chars "0"', () => {
            const cell = createValidCell({ chars: '0' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept valid chars "."', () => {
            const cell = createValidCell({ chars: '.' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept valid chars "--"', () => {
            const cell = createValidCell({ chars: '--' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept chars at maximum length (10)', () => {
            const cell = createValidCell({ chars: '0123456789' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept null chars', () => {
            const cell = createValidCell({ chars: null });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject invalid chars (empty string)', () => {
            const cell = createValidCell({ chars: '' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'chars'/);
        });

        it('should reject invalid chars (too long)', () => {
            const cell = createValidCell({ chars: '01234567890' });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'chars'/);
        });

        it('should reject invalid chars (number)', () => {
            const cell = createValidCell({ chars: 0 });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'chars'/);
        });
    });

    describe('multiple layout parameters', () => {
        it('should accept cell with all layout parameters', () => {
            const cell = createValidCell({
                colspan: 2,
                rowspan: 3,
                width: '100px',
                resizable: true,
                pad: 10,
                padStart: 5,
                padEnd: 8,
                chars: '0',
            });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept cell with some layout parameters', () => {
            const cell = createValidCell({
                colspan: 3,
                width: '50%',
            });
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should handle multiple validation errors correctly', () => {
            const cell = createValidCell({
                colspan: 0, // invalid
                width: '100', // invalid
            });

            // Should throw on first error (colspan)
            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Invalid 'colspan'/);
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should add error to store with correct parameters for invalid colspan', () => {
            const cell = createValidCell({ colspan: -1 });

            try {
                validateHeaderCell(cell, errorStoreId, 2, 1);
            } catch {
                // Exception intentionally ignored - we only test that the error was added to the store
            }

            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                "Invalid 'colspan' value",
                'response.header.rows[1].cells[2].colspan',
                -1,
                expect.any(String)
            );
        });

        it('should add error to store with correct key path', () => {
            const cell = createValidCell({ width: 'invalid' });

            try {
                validateHeaderCell(cell, errorStoreId, 3, 2);
            } catch {
                // Expected to throw - exception intentionally ignored for test assertion
            }

            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                'response.header.rows[2].cells[3].width',
                'invalid',
                expect.any(String)
            );
        });
    });
});
