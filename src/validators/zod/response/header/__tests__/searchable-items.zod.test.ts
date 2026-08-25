import { describe, it, expect } from 'vitest';
import { SearchableItemsZod } from '../searchable-items.zod';

describe('SearchableItemsZod', () => {
    describe('valid inputs', () => {
        it('should accept array with one string element', () => {
            const result = SearchableItemsZod.parse(['id']);
            expect(result).toEqual(['id']);
        });

        it('should accept array with multiple string elements', () => {
            const result = SearchableItemsZod.parse(['id', 'name', 'email']);
            expect(result).toEqual(['id', 'name', 'email']);
        });

        it('should accept array with long strings', () => {
            const longField = 'very_long_field_name_with_underscores_and_numbers_123';
            const result = SearchableItemsZod.parse([longField]);
            expect(result).toEqual([longField]);
        });

        it('should accept array with special characters', () => {
            const result = SearchableItemsZod.parse(['field-name', 'field_name', 'field.name']);
            expect(result).toEqual(['field-name', 'field_name', 'field.name']);
        });

        it('should accept array with duplicated elements', () => {
            const result = SearchableItemsZod.parse(['id', 'name', 'id']);
            expect(result).toEqual(['id', 'name', 'id']);
        });

        it('should accept large array', () => {
            const largeArray = Array.from({ length: 100 }, (_, i) => `field${i}`);
            const result = SearchableItemsZod.parse(largeArray);
            expect(result).toEqual(largeArray);
            expect(result.length).toBe(100);
        });
    });

    describe('invalid inputs', () => {
        it('should reject empty array', () => {
            expect(() => SearchableItemsZod.parse([])).toThrow();
        });

        it('should reject array with empty string element', () => {
            expect(() => SearchableItemsZod.parse([''])).toThrow();
        });

        it('should reject array with empty string among valid strings', () => {
            expect(() => SearchableItemsZod.parse(['id', '', 'name'])).toThrow();
        });

        it('should reject array with number element', () => {
            expect(() => SearchableItemsZod.parse([123])).toThrow();
        });

        it('should reject array with boolean element', () => {
            expect(() => SearchableItemsZod.parse([true])).toThrow();
        });

        it('should reject array with object element', () => {
            expect(() => SearchableItemsZod.parse([{ field: 'id' }])).toThrow();
        });

        it('should reject array with null element', () => {
            expect(() => SearchableItemsZod.parse([null])).toThrow();
        });

        it('should reject array with undefined element', () => {
            expect(() => SearchableItemsZod.parse([undefined])).toThrow();
        });

        it('should reject array with mixed types', () => {
            expect(() => SearchableItemsZod.parse(['id', 123, true])).toThrow();
        });

        it('should reject null value', () => {
            expect(() => SearchableItemsZod.parse(null)).toThrow();
        });

        it('should reject undefined value', () => {
            expect(() => SearchableItemsZod.parse(undefined)).toThrow();
        });

        it('should reject string instead of array', () => {
            expect(() => SearchableItemsZod.parse('id')).toThrow();
        });

        it('should reject number instead of array', () => {
            expect(() => SearchableItemsZod.parse(123)).toThrow();
        });

        it('should reject object instead of array', () => {
            expect(() => SearchableItemsZod.parse({ items: ['id'] })).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle whitespace-only strings as valid', () => {
            // Zod string().min(1) only forbids the empty string, not whitespace
            const result = SearchableItemsZod.parse([' ']);
            expect(result).toEqual([' ']);
        });

        it('should handle unicode characters', () => {
            const result = SearchableItemsZod.parse(['field_名前', 'поле_id']);
            expect(result).toEqual(['field_名前', 'поле_id']);
        });

        it('should handle emoji in strings', () => {
            const result = SearchableItemsZod.parse(['field_🔥', 'test_✅']);
            expect(result).toEqual(['field_🔥', 'test_✅']);
        });
    });
});
