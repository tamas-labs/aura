import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateHeaderCell } from '../header-cell.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

// Mock the store
vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

describe('validateHeaderCell', () => {
    const errorStoreId = 'test-error-store';
    const mockAddSchemaValidationError = vi.fn();
    const NOTE_NON_EMPTY_STRING = 'Must be a non-empty string';
    const CELL_KEY_ID = 'id';
    const CELL_FIELD_ID = 'id';
    const TEXT_PRIMARY_CLASS = 'text-primary';
    const FW_BOLD_CLASS = 'fw-bold';
    const TEXT_CENTER_CLASS = 'text-center';

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({
            addSchemaValidationError: mockAddSchemaValidationError,
        } as any);
    });

    it('should validate a correct header cell without errors', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            label: 'Identifier',
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    it('should validate a correct header cell without optional label', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    it('should throw error when missing content field', () => {
        const invalidCell = {
            field: 'id',
            key: 'id',
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Missing 'content'/
        );
        expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
            'HeaderCellValidator',
            expect.stringContaining("Required field 'content' is missing"),
            expect.stringContaining('.content'),
            invalidCell,
            expect.any(String),
            expect.objectContaining({ note: NOTE_NON_EMPTY_STRING })
        );
    });

    it('should throw error when missing field field', () => {
        const invalidCell = {
            content: 'ID',
            key: 'id',
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Missing 'field'\/'fields'/
        );
        expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
            'HeaderCellValidator',
            "Either 'field' or 'fields' is required for data cells",
            'response.header.rows[0].cells[0]',
            invalidCell,
            "One of 'field' or 'fields' is mandatory",
            expect.objectContaining({
                note: "Specify 'field' for single column or 'fields' for multiple columns",
            })
        );
    });

    it('should default key to field value when missing field "key" in data cell', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
        };

        const result = validateHeaderCell(validCell, errorStoreId, 0, 0);
        expect(result).toHaveProperty('key', 'id');
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    it('should handle empty string content via validateString (which logs detailed error but returns fallback)', () => {
        const invalidCell = {
            content: '',
            field: 'id',
            key: 'id',
        };

        // validateHeaderCell does not throw on validateString errors, because it handles them
        // But validateString logs the error to the error store
        validateHeaderCell(invalidCell, errorStoreId, 0, 0);

        expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
            'StringValidator',
            'Invalid string value provided',
            expect.stringContaining('.content'),
            '',
            expect.any(String),
            expect.any(Object)
        );
    });

    it('should allow empty label (optional)', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            label: '',
        };

        // validateString with min=0 allows empty string
        validateHeaderCell(validCell, errorStoreId, 0, 0);
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    it('should handle non-string types for mandatory fields', () => {
        const invalidCell = {
            content: 123, // Number instead of string
            field: 'id',
            key: 'id',
        };

        validateHeaderCell(invalidCell, errorStoreId, 0, 0);

        expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
            'StringValidator',
            expect.any(String),
            expect.stringContaining('.content'),
            123,
            expect.any(String),
            expect.any(Object)
        );
    });

    it('should allow label to be null', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            label: null,
        };

        // validateString is not called when label is null
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    it('should allow label to be undefined', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            label: undefined,
        };

        // validateString is not called when label is undefined
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    it('should ignore extra fields in cell object', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            sortable: true,
            searchable: true,
            width: '100px',
            align: 'center',
            customProperty: 'value',
        };

        // Extra fields do not interfere with validation
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    it('should generate correct error key with rowIndex and cellIndex', () => {
        const invalidCell = {
            field: 'name',
            key: 'name',
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 3, 2)).toThrow();

        // Check that the key contains the correct indices
        expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
            'HeaderCellValidator',
            expect.any(String),
            'response.header.rows[2].cells[3].content',
            invalidCell,
            expect.any(String),
            expect.any(Object)
        );
    });

    it('should use default rowIndex = 0 when not provided', () => {
        const invalidCell = {
            field: 'id',
            key: 'id',
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 5)).toThrow();

        // Check that the default rowIndex = 0
        expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
            'HeaderCellValidator',
            expect.any(String),
            'response.header.rows[0].cells[5].content',
            invalidCell,
            expect.any(String),
            expect.any(Object)
        );
    });

    it('should handle object type for field', () => {
        const invalidCell = {
            content: 'ID',
            field: { nested: 'value' }, // Object instead of string
            key: 'id',
        };

        validateHeaderCell(invalidCell, errorStoreId, 0, 0);

        expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
            'StringValidator',
            expect.any(String),
            expect.stringContaining('.field'),
            expect.any(Object),
            expect.any(String),
            expect.any(Object)
        );
    });

    it('should handle array type for key', () => {
        const invalidCell = {
            content: 'ID',
            field: 'id',
            key: ['id', 'name'], // Array instead of string
        };

        validateHeaderCell(invalidCell, errorStoreId, 0, 0);

        expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
            'StringValidator',
            expect.any(String),
            expect.stringContaining('.key'),
            expect.any(Array),
            expect.any(String),
            expect.any(Object)
        );
    });

    it('should validate label when provided as valid string', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            label: 'Identifier Label',
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    // Optional fields validation - colspan
    it('optional field: should accept valid colspan value', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            colspan: 3,
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    it('optional field: should reject invalid colspan value (too high)', () => {
        const invalidCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            colspan: 100,
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'colspan'/
        );
        expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
            'HeaderCellValidator',
            "Invalid 'colspan' value",
            expect.stringContaining('.colspan'),
            100,
            expect.any(String)
        );
    });

    it('optional field: should reject invalid colspan value (zero)', () => {
        const invalidCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            colspan: 0,
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'colspan'/
        );
    });

    it('optional field: should skip validation when colspan is null', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            colspan: null,
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    // Optional fields validation - rowspan
    it('optional field: should accept valid rowspan value', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            rowspan: 2,
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    it('optional field: should reject invalid rowspan value', () => {
        const invalidCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            rowspan: 50,
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'rowspan'/
        );
    });

    // Optional fields validation - width
    it('optional field: should accept valid width in px', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            width: '100px',
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    it('optional field: should accept valid width in percentage', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            width: '50%',
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    it('optional field: should accept auto width', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            width: 'auto',
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    it('optional field: should reject invalid width format', () => {
        const invalidCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            width: 'invalid',
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'width'/
        );
    });

    // Optional fields validation - boolean fields
    it('optional field: should accept valid resizable boolean', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            resizable: true,
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    it('optional field: should reject invalid resizable value', () => {
        const invalidCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            resizable: 'yes',
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'resizable'/
        );
    });

    // Optional fields validation - padding fields
    it('optional field: should accept valid pad value', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            pad: 10,
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    it('optional field: should accept valid padStart value', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            padStart: 5,
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    it('optional field: should accept valid padEnd value', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            padEnd: 15,
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    it('optional field: should reject invalid pad value (too high)', () => {
        const invalidCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            pad: 150,
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(/Invalid 'pad'/);
    });

    it('optional field: should reject negative padding values', () => {
        const invalidCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            padStart: -5,
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'padStart'/
        );
    });

    // Optional fields validation - chars
    it('optional field: should accept valid chars value', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            chars: '...',
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    it('optional field: should reject too long chars value', () => {
        const invalidCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            chars: '12345678901',
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'chars'/
        );
    });

    it('optional field: should skip validation when chars is null', () => {
        const validCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            chars: null,
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    // Optional fields validation - multiple fields
    it('optional field: should validate cell with multiple optional fields', () => {
        const validCell = {
            content: 'Name',
            field: 'name',
            key: 'name',
            label: 'User Name',
            colspan: 2,
            width: '200px',
            resizable: true,
            pad: 10,
            chars: '...',
        };

        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
    });

    it('optional field: should stop at first invalid optional field', () => {
        const invalidCell = {
            content: 'ID',
            field: 'id',
            key: 'id',
            colspan: 100, // invalid
            width: '100px', // valid, but won't be reached
        };

        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'colspan'/
        );
    });

    // Function fields validation

    // sortable
    it('optional field: should accept valid sortable (boolean)', () => {
        const validCell = { content: 'ID', field: 'id', key: 'id', sortable: true };
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    it('optional field: should reject invalid sortable (string)', () => {
        const invalidCell = { content: 'ID', field: 'id', key: 'id', sortable: 'yes' };
        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'sortable'/
        );
        // No need to check the mock call in detail here, it's enough that it throws
    });

    // searchable
    it('optional field: should accept valid searchable (boolean)', () => {
        const validCell = { content: 'ID', field: 'id', key: 'id', searchable: false };
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    // filterable
    it('optional field: should accept valid filterable (boolean)', () => {
        const validCell = { content: 'ID', field: 'id', key: 'id', filterable: true };
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    // selectable
    it('optional field: should accept valid selectable (boolean)', () => {
        const validCell = { content: 'ID', field: 'id', key: 'id', selectable: true };
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    // show
    it('optional field: should accept valid show (boolean)', () => {
        const validCell = { content: 'ID', field: 'id', key: 'id', show: false };
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    // between
    it('optional field: should accept valid between (boolean)', () => {
        const validCell = { content: 'ID', field: 'id', key: 'id', between: true };
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    // reference
    it('optional field: should accept valid reference (string)', () => {
        const validCell = { content: 'ID', field: 'id', key: 'id', reference: 'other_field' };
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    it('optional field: should reject invalid reference (empty string)', () => {
        const invalidCell = { content: 'ID', field: 'id', key: 'id', reference: '' };
        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'reference'/
        );
    });

    it('optional field: should reject invalid reference (number)', () => {
        const invalidCell = { content: 'ID', field: 'id', key: 'id', reference: 123 };
        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'reference'/
        );
    });

    // elements
    it('optional field: should accept valid elements (array of strings)', () => {
        const validCell = {
            content: 'Status',
            field: 'status',
            key: 'status',
            filterable: true,
            elements: ['Active', 'Inactive', 'Pending'],
        };
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    it('optional field: should accept valid elements (array of numbers)', () => {
        const validCell = {
            content: 'Priority',
            field: 'priority',
            key: 'priority',
            filterable: true,
            elements: [1, 2, 3, 4, 5],
        };
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    it('optional field: should accept valid elements (record)', () => {
        const validCell = {
            content: 'Status',
            field: 'status',
            key: 'status',
            filterable: true,
            elements: { '0': 'Inactive', '1': 'Active' },
        };
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    it('optional field: should accept elements without filterable', () => {
        const validCell = {
            content: 'Status',
            field: 'status',
            key: 'status',
            elements: ['Active', 'Inactive'],
        };
        expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
    });

    it('optional field: should reject invalid elements (empty array)', () => {
        const invalidCell = {
            content: 'Status',
            field: 'status',
            key: 'status',
            elements: [],
        };
        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'elements'/
        );
    });

    it('optional field: should reject invalid elements (array with booleans)', () => {
        const invalidCell = {
            content: 'Status',
            field: 'status',
            key: 'status',
            elements: [true, false],
        };
        expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
            /Invalid 'elements'/
        );
    });

    // Complex scenario with multiple function fields
    it('should validate cell with multiple function fields correctly', () => {
        const complexCell = {
            content: 'Date',
            field: 'created_at',
            key: 'created_at',
            sortable: true,
            filterable: true,
            between: true,
            reference: 'published_at',
            show: true,
        };
        expect(() => validateHeaderCell(complexCell, errorStoreId, 0, 0)).not.toThrow();
    });

    // Content manipulation fields - currency
    describe('content manipulation - currency field', () => {
        it('should accept currency as true', () => {
            const validCell = {
                content: 'Price',
                field: 'price',
                key: 'price',
                currency: true,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept currency as false', () => {
            const validCell = {
                content: 'Price',
                field: 'price',
                key: 'price',
                currency: false,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept currency as null', () => {
            const validCell = {
                content: 'Price',
                field: 'price',
                key: 'price',
                currency: null,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept cell without currency field', () => {
            const validCell = {
                content: 'Name',
                field: 'name',
                key: 'name',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should reject currency as string (no longer valid ISO 4217 code)', () => {
            const invalidCell = {
                content: 'Price',
                field: 'price',
                key: 'price',
                currency: 'EUR',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'currency'/
            );
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                "Invalid 'currency' value",
                expect.stringContaining('.currency'),
                'EUR',
                expect.any(String)
            );
        });

        it('should reject currency as number', () => {
            const invalidCell = {
                content: 'Price',
                field: 'price',
                key: 'price',
                currency: 1,
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'currency'/
            );
        });

        it('should reject currency as object', () => {
            const invalidCell = {
                content: 'Price',
                field: 'price',
                key: 'price',
                currency: { code: 'USD' },
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'currency'/
            );
        });

        it('should reject currency as array', () => {
            const invalidCell = {
                content: 'Price',
                field: 'price',
                key: 'price',
                currency: ['USD'],
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'currency'/
            );
        });

        it('should accept currency combined with other formatting', () => {
            const validCell = {
                content: 'Total Price',
                field: 'total',
                key: 'total',
                currency: true,
                align: 'end',
                color: 'success',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });
    });

    // Content manipulation fields - unit
    describe('content manipulation - unit field', () => {
        it('should accept unit as valid identifier (kilogram)', () => {
            const validCell = {
                content: 'Weight',
                field: 'weight',
                key: 'weight',
                unit: 'kilogram',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept unit as valid identifier (celsius)', () => {
            const validCell = {
                content: 'Temperature',
                field: 'temp',
                key: 'temp',
                unit: 'celsius',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept unit as null', () => {
            const validCell = {
                content: 'Weight',
                field: 'weight',
                key: 'weight',
                unit: null,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept cell without unit field', () => {
            const validCell = {
                content: 'Name',
                field: 'name',
                key: 'name',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should reject unit as invalid string', () => {
            const invalidCell = {
                content: 'Weight',
                field: 'weight',
                key: 'weight',
                unit: 'kg',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'unit'/
            );
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                "Invalid 'unit' value",
                expect.stringContaining('.unit'),
                'kg',
                expect.any(String)
            );
        });

        it('should reject unit as boolean', () => {
            const invalidCell = {
                content: 'Weight',
                field: 'weight',
                key: 'weight',
                unit: true,
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'unit'/
            );
        });

        it('should reject unit as number', () => {
            const invalidCell = {
                content: 'Weight',
                field: 'weight',
                key: 'weight',
                unit: 42,
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'unit'/
            );
        });

        it('should reject unit as object', () => {
            const invalidCell = {
                content: 'Weight',
                field: 'weight',
                key: 'weight',
                unit: { unit: 'kilogram' },
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'unit'/
            );
        });
    });

    // Content manipulation fields - raw
    describe('content manipulation - raw field', () => {
        it('should accept raw as true', () => {
            const validCell = {
                content: 'HTML Content',
                field: 'html',
                key: 'html',
                raw: true,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept raw as false', () => {
            const validCell = {
                content: 'Plain Content',
                field: 'plain',
                key: 'plain',
                raw: false,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept raw as null', () => {
            const validCell = {
                content: 'Content',
                field: 'content',
                key: 'content',
                raw: null,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept cell without raw field', () => {
            const validCell = {
                content: 'Name',
                field: 'name',
                key: 'name',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should reject raw as string', () => {
            const invalidCell = {
                content: 'Content',
                field: 'content',
                key: 'content',
                raw: 'true',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'raw'/
            );
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                "Invalid 'raw' value",
                'response.header.rows[0].cells[0].raw',
                'true',
                expect.any(String)
            );
        });

        it('should reject raw as number', () => {
            const invalidCell = {
                content: 'Content',
                field: 'content',
                key: 'content',
                raw: 1,
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'raw'/
            );
        });

        it('should reject raw as object', () => {
            const invalidCell = {
                content: 'Content',
                field: 'content',
                key: 'content',
                raw: { enabled: true },
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'raw'/
            );
        });

        it('should reject raw as array', () => {
            const invalidCell = {
                content: 'Content',
                field: 'content',
                key: 'content',
                raw: [true],
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'raw'/
            );
        });

        it('should accept raw combined with other formatting', () => {
            const validCell = {
                content: 'Formatted HTML',
                field: 'formatted',
                key: 'formatted',
                raw: true,
                align: 'center',
                color: 'primary',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    // Content manipulation fields - datetime
    describe('content manipulation - datetime field', () => {
        it('should accept datetime as true', () => {
            const validCell = {
                content: 'Created At',
                field: 'created_at',
                key: 'created_at',
                datetime: true,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept datetime as false', () => {
            const validCell = {
                content: 'Date',
                field: 'date',
                key: 'date',
                datetime: false,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept datetime as null', () => {
            const validCell = {
                content: 'Updated At',
                field: 'updated_at',
                key: 'updated_at',
                datetime: null,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept cell without datetime field', () => {
            const validCell = {
                content: 'Name',
                field: 'name',
                key: 'name',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should reject datetime as string', () => {
            const invalidCell = {
                content: 'Created At',
                field: 'created_at',
                key: 'created_at',
                datetime: 'true',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'datetime'/
            );
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                "Invalid 'datetime' value",
                'response.header.rows[0].cells[0].datetime',
                'true',
                expect.any(String)
            );
        });

        it('should reject datetime as number', () => {
            const invalidCell = {
                content: 'Created At',
                field: 'created_at',
                key: 'created_at',
                datetime: 1,
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'datetime'/
            );
        });

        it('should reject datetime as object', () => {
            const invalidCell = {
                content: 'Created At',
                field: 'created_at',
                key: 'created_at',
                datetime: { enabled: true },
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'datetime'/
            );
        });

        it('should reject datetime as array', () => {
            const invalidCell = {
                content: 'Created At',
                field: 'created_at',
                key: 'created_at',
                datetime: [true],
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'datetime'/
            );
        });

        it('should accept datetime combined with other formatting', () => {
            const validCell = {
                content: 'Created At',
                field: 'created_at',
                key: 'created_at',
                datetime: true,
                dateStyle: 'medium',
                align: 'center',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should preserve datetime field through validation (regression test)', () => {
            const cellWithDatetime = {
                content: 'Created At',
                field: 'created_at',
                key: 'created_at',
                datetime: true,
            };

            // validateHeaderCell returns a sanitized copy via stripUnknownNonDataKeys
            // The returned object must still contain datetime: true
            const result = validateHeaderCell(cellWithDatetime, errorStoreId, 0, 0);

            expect(result).toHaveProperty('datetime', true);
        });
    });

    // Field / Fields mutual exclusivity tests
    describe('field vs fields mutual exclusivity', () => {
        it('should accept cell with only field (valid)', () => {
            const validCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept cell with only fields (valid)', () => {
            const validCell = {
                content: 'Full Name',
                fields: ['firstName', 'lastName'],
                key: 'fullName',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject cell with both field and fields', () => {
            const invalidCell = {
                content: 'Name',
                field: 'name',
                fields: ['firstName', 'lastName'],
                key: 'name',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Both 'field' and 'fields' present/
            );
        });

        it('should reject cell with neither field nor fields', () => {
            const invalidCell = {
                content: 'Name',
                key: 'name',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Missing 'field'\/'fields'/
            );
        });

        it('should reject cell when field is null', () => {
            const invalidCell = {
                content: 'ID',
                field: null,
                key: 'id',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Missing 'field'\/'fields'/
            );
        });

        it('should reject cell when fields is null', () => {
            const invalidCell = {
                content: 'ID',
                fields: null,
                key: 'id',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Missing 'field'\/'fields'/
            );
        });

        it('should reject cell when both field and fields are null', () => {
            const invalidCell = {
                content: 'ID',
                field: null,
                fields: null,
                key: 'id',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Missing 'field'\/'fields'/
            );
        });

        it('should validate fields array correctly', () => {
            const validCell = {
                content: 'Full Name',
                fields: ['firstName', 'middleName', 'lastName'],
                key: 'fullName',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject invalid fields array (empty)', () => {
            const invalidCell = {
                content: 'Name',
                fields: [],
                key: 'name',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'fields'/
            );
        });
    });

    // Other parameters validation tests
    describe('Other parameters (class, style, type)', () => {
        // class parameter tests
        it('should accept valid class as string', () => {
            const validCell = {
                content: 'ID',
                field: CELL_FIELD_ID,
                key: CELL_KEY_ID,
                class: `${TEXT_PRIMARY_CLASS} ${FW_BOLD_CLASS}`,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept valid class as array', () => {
            const validCell = {
                content: 'ID',
                field: CELL_FIELD_ID,
                key: CELL_KEY_ID,
                class: [TEXT_PRIMARY_CLASS, FW_BOLD_CLASS, TEXT_CENTER_CLASS],
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept null class', () => {
            const validCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
                class: null,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject invalid class (empty string)', () => {
            const invalidCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
                class: '',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'class'/
            );
        });

        it('should reject invalid class (empty array)', () => {
            const invalidCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
                class: [],
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'class'/
            );
        });

        // style parameter tests
        it('should accept valid inline style', () => {
            const validCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
                style: 'color: red; font-weight: bold;',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept null style', () => {
            const validCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
                style: null,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject invalid style (exceeding max length)', () => {
            const invalidCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
                style: 'a'.repeat(1001),
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'style'/
            );
        });

        // type parameter tests
        it('should accept valid cell type (number)', () => {
            const validCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
                type: 'number',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept valid cell type (currency)', () => {
            const validCell = {
                content: 'Price',
                field: 'price',
                key: 'price',
                type: 'currency',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept valid cell type (date)', () => {
            const validCell = {
                content: 'Created',
                field: 'created_at',
                key: 'created',
                type: 'date',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept valid cell type (badge)', () => {
            const validCell = {
                content: 'Status',
                field: 'status',
                key: 'status',
                type: 'badge',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept null type', () => {
            const validCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
                type: null,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject invalid cell type', () => {
            const invalidCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
                type: 'invalid-type',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'type'/
            );
        });

        // Combined other parameters
        it('should accept multiple other parameters together', () => {
            const validCell = {
                content: 'Price',
                field: 'price',
                key: 'price',
                class: 'text-end fw-bold',
                style: 'color: green;',
                type: 'currency',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });
    });

    // Data-* attributes validation tests
    describe('data-* attributes validation', () => {
        it('should accept valid data-id attribute', () => {
            const validCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
                'data-id': '{id}',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept valid data-bs-toggle attribute', () => {
            const validCell = {
                content: 'Action',
                field: 'action',
                key: 'action',
                'data-bs-toggle': 'modal',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept valid data-bs-target attribute', () => {
            const validCell = {
                content: 'Action',
                field: 'action',
                key: 'action',
                'data-bs-target': '#modal-{id}',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept multiple data-* attributes', () => {
            const validCell = {
                content: 'Action',
                field: 'action',
                key: 'action',
                'data-id': '{id}',
                'data-type': 'user',
                'data-action': 'edit',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept data-* attribute with complex value', () => {
            const validCell = {
                content: 'User',
                field: 'user',
                key: 'user',
                'data-url': 'https://api.example.com/users/{id}',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject data-* attribute with invalid value (exceeding max length)', () => {
            const invalidCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
                'data-long': 'a'.repeat(1001),
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'data-long'/
            );
        });

        it('should sanitize HTML in data-* attribute values', () => {
            const cellWithHTML = {
                content: 'ID',
                field: 'id',
                key: 'id',
                'data-value': '<script>alert("xss")</script>{id}',
            };
            // Should not throw, but value should be sanitized
            expect(() => validateHeaderCell(cellWithHTML, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should accept null data-* attribute value', () => {
            const validCell = {
                content: 'ID',
                field: 'id',
                key: 'id',
                'data-optional': null,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
        });
    });

    // Comprehensive test combining all new features
    describe('comprehensive validation with all new features', () => {
        it('should validate cell with fields, class, style, type, and data-* attributes', () => {
            const complexCell = {
                content: 'Full Name',
                fields: ['firstName', 'lastName'],
                key: 'fullName',
                label: 'Full Name',
                class: [TEXT_PRIMARY_CLASS, FW_BOLD_CLASS],
                style: 'text-transform: uppercase;',
                type: 'static',
                'data-id': '{id}',
                'data-type': 'user',
                sortable: true,
                searchable: true,
            };
            expect(() => validateHeaderCell(complexCell, errorStoreId, 0, 0)).not.toThrow();
        });

        it('should reject when both field and fields present with valid other params', () => {
            const invalidCell = {
                content: 'Name',
                field: 'name',
                fields: ['firstName', 'lastName'],
                key: 'name',
                class: TEXT_PRIMARY_CLASS,
                type: 'static',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Both 'field' and 'fields' present/
            );
        });

        it('should stop validation at field/fields check before validating other params', () => {
            const invalidCell = {
                content: 'Name',
                key: 'name',
                // Neither field nor fields
                class: TEXT_PRIMARY_CLASS,
                type: 'invalid', // This won't be reached
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Missing 'field'\/'fields'/
            );
        });
    });

    // Content manipulation fields - time
    describe('content manipulation - time field', () => {
        it('should accept time as true', () => {
            const validCell = {
                content: 'Duration',
                field: 'duration',
                key: 'duration',
                time: true,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept time as false', () => {
            const validCell = {
                content: 'Duration',
                field: 'duration',
                key: 'duration',
                time: false,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept time as null', () => {
            const validCell = {
                content: 'Duration',
                field: 'duration',
                key: 'duration',
                time: null,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept cell without time field', () => {
            const validCell = {
                content: 'Name',
                field: 'name',
                key: 'name',
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should reject time as string', () => {
            const invalidCell = {
                content: 'Duration',
                field: 'duration',
                key: 'duration',
                time: 'true',
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'time'/
            );
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'HeaderCellValidator',
                "Invalid 'time' value",
                'response.header.rows[0].cells[0].time',
                'true',
                expect.any(String)
            );
        });

        it('should reject time as number', () => {
            const invalidCell = {
                content: 'Duration',
                field: 'duration',
                key: 'duration',
                time: 1,
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'time'/
            );
        });

        it('should reject time as object', () => {
            const invalidCell = {
                content: 'Duration',
                field: 'duration',
                key: 'duration',
                time: { enabled: true },
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'time'/
            );
        });

        it('should reject time as array', () => {
            const invalidCell = {
                content: 'Duration',
                field: 'duration',
                key: 'duration',
                time: [true],
            };
            expect(() => validateHeaderCell(invalidCell, errorStoreId, 0, 0)).toThrow(
                /Invalid 'time'/
            );
        });

        it('should accept time combined with other formatting', () => {
            const validCell = {
                content: 'Duration',
                field: 'duration',
                key: 'duration',
                time: true,
                align: 'end',
                monospace: true,
            };
            expect(() => validateHeaderCell(validCell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should preserve time field through validation (regression test)', () => {
            const cellWithTime = {
                content: 'Duration',
                field: 'duration',
                key: 'duration',
                time: true,
            };

            // validateHeaderCell returns a sanitized copy via stripUnknownNonDataKeys
            // The returned object must still contain time: true
            const result = validateHeaderCell(cellWithTime, errorStoreId, 0, 0);

            expect(result).toHaveProperty('time', true);
        });
    });

    describe('inherited fields (audit 2026-08-19 K1)', () => {
        it('should not accept an inherited content as the required field', () => {
            // `'content' in cell` also answers for the prototype; own-ness is what a
            // header cell has to prove, so an inherited value is a missing value.
            const cell = Object.create({ content: 'Inherited' }) as Record<string, unknown>;
            cell.key = CELL_KEY_ID;
            cell.field = CELL_FIELD_ID;

            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).toThrow(/Missing 'content'/);
        });

        it('should ignore an inherited optional field instead of validating it', () => {
            const cell = Object.create({ colspan: 'not-a-number' }) as Record<string, unknown>;
            cell.content = 'ID';
            cell.key = CELL_KEY_ID;
            cell.field = CELL_FIELD_ID;

            expect(() => validateHeaderCell(cell, errorStoreId, 0, 0)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });
});
