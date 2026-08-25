import { describe, it, expect } from 'vitest';
import { HeaderCellZod } from '../header-cell.zod';

describe('HeaderCellZod', () => {
    describe('valid cases - required fields', () => {
        it('should parse cell with required fields (content, key, field)', () => {
            const validCell = { content: 'ID', key: 'id', field: 'id' };
            const result = HeaderCellZod.parse(validCell);
            expect(result).toMatchObject({ content: 'ID', key: 'id', field: 'id' });
        });

        it('should parse cell with content, key, and fields (array)', () => {
            const validCell = { content: 'Name', key: 'name', fields: ['first_name', 'last_name'] };
            const result = HeaderCellZod.parse(validCell);
            expect(result).toMatchObject({
                content: 'Name',
                key: 'name',
                fields: ['first_name', 'last_name'],
            });
        });
    });

    describe('valid cases - optional fields', () => {
        it('should parse cell with optional layout properties', () => {
            const cell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                colspan: 2,
                rowspan: 1,
                width: '100px',
            };
            const result = HeaderCellZod.parse(cell);
            expect(result).toMatchObject(cell);
        });

        it('should parse cell with optional formatting properties', () => {
            const cell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                align: 'center' as const,
                color: 'primary',
                fontSize: '16px',
            };
            const result = HeaderCellZod.parse(cell);
            expect(result).toMatchObject(cell);
        });

        it('should parse cell with optional functional properties', () => {
            const cell = {
                content: 'Status',
                key: 'status',
                field: 'status',
                sortable: true,
                searchable: true,
                filterable: false,
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.sortable).toBe(true);
            expect(result.searchable).toBe(true);
            expect(result.filterable).toBe(false);
        });

        it('should parse cell with elements array', () => {
            const cell = {
                content: 'Status',
                key: 'status',
                field: 'status',
                filterable: true,
                elements: ['Active', 'Inactive', 'Pending'],
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.elements).toEqual(['Active', 'Inactive', 'Pending']);
        });

        it('should parse cell with elements record', () => {
            const cell = {
                content: 'Status',
                key: 'status',
                field: 'status',
                filterable: true,
                elements: { '0': 'Inactive', '1': 'Active' },
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.elements).toEqual({ '0': 'Inactive', '1': 'Active' });
        });

        it('should parse cell with elements but without filterable', () => {
            const cell = {
                content: 'Status',
                key: 'status',
                field: 'status',
                elements: ['Active', 'Inactive'],
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.elements).toEqual(['Active', 'Inactive']);
        });
    });

    describe('valid cases - data attributes', () => {
        it('should allow data-* attributes (catchall)', () => {
            const cellWithData = {
                content: 'ID',
                key: 'id',
                field: 'id',
                'data-test': 'value',
                'data-index': '123',
            };
            const result = HeaderCellZod.parse(cellWithData);
            expect(result['data-test']).toBe('value');
            expect(result['data-index']).toBe('123');
        });

        it('should allow multiple data-* attributes', () => {
            const cellWithData = {
                content: 'Name',
                key: 'name',
                field: 'name',
                'data-tooltip': 'User name',
                'data-icon': 'user',
                'data-visible': 'true',
            };
            const result = HeaderCellZod.parse(cellWithData);
            expect(result['data-tooltip']).toBe('User name');
            expect(result['data-icon']).toBe('user');
            expect(result['data-visible']).toBe('true');
        });
    });

    describe('catchall behavior - unknown properties', () => {
        it('should allow unknown properties (catchall enabled)', () => {
            const cellWithUnknown = {
                content: 'ID',
                key: 'id',
                field: 'id',
                unknownProp: 'should pass zod but be filtered by schema',
                customField: 123,
            };
            const result = HeaderCellZod.parse(cellWithUnknown);
            // Zod parse sikeres lesz (catchall miatt)
            expect(result).toHaveProperty('unknownProp');
            expect(result).toHaveProperty('customField');
        });

        it('should allow potentially dangerous keys (catchall)', () => {
            const cellWithDangerous = {
                content: 'ID',
                key: 'id',
                field: 'id',
                __proto__: 'dangerous',
                constructor: 'also dangerous',
            };
            // Zod parse does not filter these (that's the schema validator's job)
            const result = HeaderCellZod.parse(cellWithDangerous);
            expect(result).toBeDefined();
        });
    });

    describe('invalid cases - required fields missing', () => {
        it('should throw error when content is missing', () => {
            const invalidCell = { key: 'id', field: 'id' };
            expect(() => HeaderCellZod.parse(invalidCell)).toThrow();
        });

        it('should parse cell when key is missing (optional in Zod)', () => {
            const validCell = { content: 'ID', field: 'id' };
            expect(() => HeaderCellZod.parse(validCell)).not.toThrow();
        });
    });

    describe('invalid cases - field type validation', () => {
        it('should throw error for invalid content type', () => {
            const invalidCell = { content: 123, key: 'id', field: 'id' };
            expect(() => HeaderCellZod.parse(invalidCell)).toThrow();
        });

        it('should throw error for invalid key type', () => {
            const invalidCell = { content: 'ID', key: 123, field: 'id' };
            expect(() => HeaderCellZod.parse(invalidCell)).toThrow();
        });

        it('should throw error for invalid field type', () => {
            const invalidCell = { content: 'ID', key: 'id', field: 123 };
            expect(() => HeaderCellZod.parse(invalidCell)).toThrow();
        });
    });

    describe('invalid cases - optional field validation', () => {
        it('should throw error for invalid colspan', () => {
            const invalidCell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                colspan: 'invalid',
            };
            expect(() => HeaderCellZod.parse(invalidCell)).toThrow();
        });

        it('should throw error for invalid align value', () => {
            const invalidCell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                align: 'invalid',
            };
            expect(() => HeaderCellZod.parse(invalidCell)).toThrow();
        });

        it('should throw error for invalid sortable type', () => {
            const invalidCell = {
                content: 'ID',
                key: 'id',
                field: 'id',
                sortable: 'true',
            };
            expect(() => HeaderCellZod.parse(invalidCell)).toThrow();
        });
    });

    describe('content manipulation - currency field', () => {
        it('should accept currency as true', () => {
            const cell = {
                content: 'Price',
                key: 'price',
                field: 'price',
                currency: true,
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.currency).toBe(true);
        });

        it('should accept currency as false', () => {
            const cell = {
                content: 'Price',
                key: 'price',
                field: 'price',
                currency: false,
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.currency).toBe(false);
        });

        it('should accept currency as null', () => {
            const cell = {
                content: 'Price',
                key: 'price',
                field: 'price',
                currency: null,
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.currency).toBeNull();
        });

        it('should accept cell without currency field', () => {
            const cell = {
                content: 'Name',
                key: 'name',
                field: 'name',
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.currency).toBeUndefined();
        });

        it('should throw error for currency as string (no longer valid)', () => {
            const cell = {
                content: 'Price',
                key: 'price',
                field: 'price',
                currency: 'EUR',
            };
            expect(() => HeaderCellZod.parse(cell)).toThrow();
        });

        it('should throw error for currency as number', () => {
            const cell = {
                content: 'Price',
                key: 'price',
                field: 'price',
                currency: 1,
            };
            expect(() => HeaderCellZod.parse(cell)).toThrow();
        });

        it('should throw error for currency as object', () => {
            const cell = {
                content: 'Price',
                key: 'price',
                field: 'price',
                currency: { code: 'USD' },
            };
            expect(() => HeaderCellZod.parse(cell)).toThrow();
        });
    });

    describe('content manipulation - unit field', () => {
        it('should accept unit as valid identifier (kilogram)', () => {
            const cell = {
                content: 'Weight',
                key: 'weight',
                field: 'weight',
                unit: 'kilogram',
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.unit).toBe('kilogram');
        });

        it('should accept unit as valid identifier (percent)', () => {
            const cell = {
                content: 'Ratio',
                key: 'ratio',
                field: 'ratio',
                unit: 'percent',
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.unit).toBe('percent');
        });

        it('should accept unit as null', () => {
            const cell = {
                content: 'Weight',
                key: 'weight',
                field: 'weight',
                unit: null,
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.unit).toBeNull();
        });

        it('should accept cell without unit field', () => {
            const cell = {
                content: 'Name',
                key: 'name',
                field: 'name',
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.unit).toBeUndefined();
        });

        it('should throw error for unit as invalid string', () => {
            const cell = {
                content: 'Weight',
                key: 'weight',
                field: 'weight',
                unit: 'kg',
            };
            expect(() => HeaderCellZod.parse(cell)).toThrow();
        });

        it('should throw error for unit as boolean', () => {
            const cell = {
                content: 'Weight',
                key: 'weight',
                field: 'weight',
                unit: true,
            };
            expect(() => HeaderCellZod.parse(cell)).toThrow();
        });

        it('should throw error for unit as number', () => {
            const cell = {
                content: 'Weight',
                key: 'weight',
                field: 'weight',
                unit: 42,
            };
            expect(() => HeaderCellZod.parse(cell)).toThrow();
        });

        it('should throw error for unit as object', () => {
            const cell = {
                content: 'Weight',
                key: 'weight',
                field: 'weight',
                unit: { unit: 'kilogram' },
            };
            expect(() => HeaderCellZod.parse(cell)).toThrow();
        });
    });

    describe('content manipulation - raw field', () => {
        it('should accept raw as true', () => {
            const cell = {
                content: 'HTML Content',
                key: 'html',
                field: 'html',
                raw: true,
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.raw).toBe(true);
        });

        it('should accept raw as false', () => {
            const cell = {
                content: 'Plain Content',
                key: 'plain',
                field: 'plain',
                raw: false,
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.raw).toBe(false);
        });

        it('should accept raw as null', () => {
            const cell = {
                content: 'Content',
                key: 'content',
                field: 'content',
                raw: null,
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.raw).toBeNull();
        });

        it('should accept cell without raw field', () => {
            const cell = {
                content: 'Name',
                key: 'name',
                field: 'name',
            };
            const result = HeaderCellZod.parse(cell);
            expect(result.raw).toBeUndefined();
        });

        it('should throw error for raw as string', () => {
            const cell = {
                content: 'Content',
                key: 'content',
                field: 'content',
                raw: 'true',
            };
            expect(() => HeaderCellZod.parse(cell)).toThrow();
        });

        it('should throw error for raw as number', () => {
            const cell = {
                content: 'Content',
                key: 'content',
                field: 'content',
                raw: 1,
            };
            expect(() => HeaderCellZod.parse(cell)).toThrow();
        });

        it('should throw error for raw as object', () => {
            const cell = {
                content: 'Content',
                key: 'content',
                field: 'content',
                raw: { enabled: true },
            };
            expect(() => HeaderCellZod.parse(cell)).toThrow();
        });
    });

    describe('invalid cases - non-object input', () => {
        it('should throw error for null', () => {
            expect(() => HeaderCellZod.parse(null)).toThrow();
        });

        it('should throw error for undefined', () => {
            expect(() => HeaderCellZod.parse(undefined)).toThrow();
        });

        it('should throw error for string', () => {
            expect(() => HeaderCellZod.parse('cell')).toThrow();
        });

        it('should throw error for array', () => {
            expect(() => HeaderCellZod.parse([])).toThrow();
        });
    });

    describe('safeParse behavior', () => {
        it('should return success for valid cell', () => {
            const validCell = { content: 'ID', key: 'id', field: 'id' };
            const result = HeaderCellZod.safeParse(validCell);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.content).toBe('ID');
            }
        });

        it('should return failure for invalid cell', () => {
            const invalidCell = { key: 'id' };
            const result = HeaderCellZod.safeParse(invalidCell);

            expect(result.success).toBe(false);
        });
    });
});
