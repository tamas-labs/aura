import { describe, it, expect } from 'vitest';
import { FieldsZod } from '../fields.zod';

describe('FieldsZod', () => {
    describe('valid inputs', () => {
        it('should accept array with one element', () => {
            const result = FieldsZod.parse(['id']);
            expect(result).toEqual(['id']);
        });

        it('should accept array with multiple elements', () => {
            const result = FieldsZod.parse(['firstName', 'lastName', 'email']);
            expect(result).toEqual(['firstName', 'lastName', 'email']);
        });

        it('should accept array with maximum length strings (100 chars)', () => {
            const longString = 'a'.repeat(100);
            const result = FieldsZod.parse([longString]);
            expect(result).toEqual([longString]);
        });

        it('should accept null value', () => {
            const result = FieldsZod.parse(null);
            expect(result).toBeNull();
        });

        it('should sanitize HTML in field names', () => {
            const result = FieldsZod.parse(['<script>alert("xss")</script>field']);
            expect(result).not.toBeNull();
            expect(result![0]).not.toContain('<script>');
        });
    });

    describe('invalid inputs', () => {
        it('should reject empty array', () => {
            expect(() => FieldsZod.parse([])).toThrow(/must contain at least one element/i);
        });

        it('should reject array with empty string element', () => {
            expect(() => FieldsZod.parse(['id', ''])).toThrow(/cannot be empty/i);
        });

        it('should reject array with string exceeding max length (101 chars)', () => {
            const tooLongString = 'a'.repeat(101);
            expect(() => FieldsZod.parse([tooLongString])).toThrow(/at most 100 characters/i);
        });

        it('should reject non-array value (string)', () => {
            expect(() => FieldsZod.parse('id')).toThrow();
        });

        it('should reject non-array value (number)', () => {
            expect(() => FieldsZod.parse(123)).toThrow();
        });

        it('should reject non-array value (object)', () => {
            expect(() => FieldsZod.parse({ field: 'id' })).toThrow();
        });

        it('should reject array with non-string element (number)', () => {
            expect(() => FieldsZod.parse(['id', 123])).toThrow();
        });

        it('should reject array with non-string element (boolean)', () => {
            expect(() => FieldsZod.parse(['id', true])).toThrow();
        });

        it('should reject undefined value', () => {
            expect(() => FieldsZod.parse(undefined)).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle array with special characters', () => {
            const result = FieldsZod.parse(['field-name', 'field_name', 'field.name']);
            expect(result).toEqual(['field-name', 'field_name', 'field.name']);
        });

        it('should handle array with unicode characters', () => {
            const result = FieldsZod.parse(['név', 'ár', '名前']);
            expect(result).toEqual(['név', 'ár', '名前']);
        });

        it('should handle array with whitespace strings', () => {
            const result = FieldsZod.parse(['field name', '  id  ']);
            expect(result).toHaveLength(2);
        });
    });
});
