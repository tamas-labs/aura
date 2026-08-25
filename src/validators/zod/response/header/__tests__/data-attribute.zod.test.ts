import { describe, it, expect } from 'vitest';
import { DataAttributeValueZod, isDataAttribute } from '../data-attribute.zod';

describe('DataAttributeValueZod', () => {
    describe('valid inputs', () => {
        it('should accept simple string value', () => {
            const result = DataAttributeValueZod.parse('some-value');
            expect(result).toBe('some-value');
        });

        it('should accept empty string', () => {
            const result = DataAttributeValueZod.parse('');
            expect(result).toBe('');
        });

        it('should accept placeholder syntax', () => {
            const result = DataAttributeValueZod.parse('{id}');
            expect(result).toBe('{id}');
        });

        it('should accept multiple placeholders', () => {
            const result = DataAttributeValueZod.parse('user-{id}-{name}');
            expect(result).toBe('user-{id}-{name}');
        });

        it('should accept complex data attribute value', () => {
            const value = 'modal|confirm|user-delete-{id}';
            const result = DataAttributeValueZod.parse(value);
            expect(result).toBe(value);
        });

        it('should accept value at maximum length (1000 chars)', () => {
            const longValue = 'a'.repeat(1000);
            const result = DataAttributeValueZod.parse(longValue);
            expect(result).toHaveLength(1000);
        });

        it('should accept null value', () => {
            const result = DataAttributeValueZod.parse(null);
            expect(result).toBeNull();
        });

        it('should sanitize HTML in data attribute value', () => {
            const result = DataAttributeValueZod.parse('<script>alert("xss")</script>value');
            expect(result).not.toContain('<script>');
        });
    });

    describe('invalid inputs', () => {
        it('should reject value exceeding max length (1001 chars)', () => {
            const tooLongValue = 'a'.repeat(1001);
            expect(() => DataAttributeValueZod.parse(tooLongValue)).toThrow(/too long/i);
        });

        it('should reject non-string value (number)', () => {
            expect(() => DataAttributeValueZod.parse(123)).toThrow();
        });

        it('should reject non-string value (boolean)', () => {
            expect(() => DataAttributeValueZod.parse(true)).toThrow();
        });

        it('should reject non-string value (array)', () => {
            expect(() => DataAttributeValueZod.parse(['value'])).toThrow();
        });

        it('should reject non-string value (object)', () => {
            expect(() => DataAttributeValueZod.parse({ value: 'test' })).toThrow();
        });

        it('should reject undefined value', () => {
            expect(() => DataAttributeValueZod.parse(undefined)).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle JSON string as data attribute value', () => {
            const jsonValue = '{"key": "value", "number": 123}';
            const result = DataAttributeValueZod.parse(jsonValue);
            expect(result).toBe(jsonValue);
        });

        it('should handle URL as data attribute value', () => {
            const urlValue = 'https://example.com/api/users/{id}';
            const result = DataAttributeValueZod.parse(urlValue);
            expect(result).toBe(urlValue);
        });

        it('should handle special characters', () => {
            const specialValue = 'value-with_special.chars@123!';
            const result = DataAttributeValueZod.parse(specialValue);
            expect(result).toBe(specialValue);
        });

        it('should handle unicode characters', () => {
            const unicodeValue = 'érték-中文-🎉';
            const result = DataAttributeValueZod.parse(unicodeValue);
            expect(result).toBe(unicodeValue);
        });
    });
});

describe('isDataAttribute', () => {
    describe('valid data attributes', () => {
        it('should return true for "data-id"', () => {
            expect(isDataAttribute('data-id')).toBe(true);
        });

        it('should return true for "data-user-id"', () => {
            expect(isDataAttribute('data-user-id')).toBe(true);
        });

        it('should return true for "data-bs-toggle"', () => {
            expect(isDataAttribute('data-bs-toggle')).toBe(true);
        });

        it('should return true for "data-bs-target"', () => {
            expect(isDataAttribute('data-bs-target')).toBe(true);
        });

        it('should return true for "data-ga-event"', () => {
            expect(isDataAttribute('data-ga-event')).toBe(true);
        });

        it('should return true for simple "data-"', () => {
            expect(isDataAttribute('data-')).toBe(true);
        });
    });

    describe('invalid data attributes', () => {
        it('should return false for "id"', () => {
            expect(isDataAttribute('id')).toBe(false);
        });

        it('should return false for "class"', () => {
            expect(isDataAttribute('class')).toBe(false);
        });

        it('should return false for "style"', () => {
            expect(isDataAttribute('style')).toBe(false);
        });

        it('should return false for "data" without dash', () => {
            expect(isDataAttribute('data')).toBe(false);
        });

        it('should return false for "DATA-id" (uppercase)', () => {
            expect(isDataAttribute('DATA-id')).toBe(false);
        });

        it('should return false for "aria-label"', () => {
            expect(isDataAttribute('aria-label')).toBe(false);
        });

        it('should return false for empty string', () => {
            expect(isDataAttribute('')).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle attribute with numbers', () => {
            expect(isDataAttribute('data-123')).toBe(true);
        });

        it('should handle attribute with multiple dashes', () => {
            expect(isDataAttribute('data-user-profile-id')).toBe(true);
        });

        it('should handle attribute with underscore', () => {
            expect(isDataAttribute('data-user_id')).toBe(true);
        });

        it('should be case-sensitive', () => {
            expect(isDataAttribute('Data-id')).toBe(false);
            expect(isDataAttribute('DATA-ID')).toBe(false);
        });
    });
});
