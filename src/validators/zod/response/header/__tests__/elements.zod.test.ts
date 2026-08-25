// @vitest-environment jsdom
// ElementsZod uses htmlSanitizer (DOMPurify), which only works correctly
// under a real DOM implementation (jsdom); it behaves differently
// under happy-dom.
import { describe, it, expect } from 'vitest';
import { ElementsZod } from '../elements.zod';

describe('ElementsZod', () => {
    describe('valid inputs', () => {
        // Array format
        it('should accept array of strings', () => {
            const result = ElementsZod.parse(['Active', 'Inactive']);
            expect(result).toEqual(['Active', 'Inactive']);
        });

        it('should accept array of numbers', () => {
            const result = ElementsZod.parse([1, 2, 3]);
            expect(result).toEqual([1, 2, 3]);
        });

        it('should accept mixed array of strings and numbers', () => {
            const result = ElementsZod.parse(['Active', 0, 'Inactive', 1]);
            expect(result).toEqual(['Active', 0, 'Inactive', 1]);
        });

        it('should accept large array', () => {
            const largeArray = Array.from({ length: 100 }, (_, i) => `Item ${i}`);
            const result = ElementsZod.parse(largeArray);
            expect(result).toHaveLength(100);
        });

        // Object (Record) format
        it('should accept record with string values', () => {
            const input = { active: 'Active', inactive: 'Inactive' };
            const result = ElementsZod.parse(input);
            expect(result).toEqual(input);
        });

        it('should accept record with number values', () => {
            const input = { low: 1, high: 10 };
            const result = ElementsZod.parse(input);
            expect(result).toEqual(input);
        });

        it('should accept record with mixed values', () => {
            const input = { status: 'Active', count: 42 };
            const result = ElementsZod.parse(input);
            expect(result).toEqual(input);
        });

        it('should accept record with numeric keys', () => {
            const input = { '0': 'Inactive', '1': 'Active' };
            const result = ElementsZod.parse(input);
            expect(result).toEqual(input);
        });

        // Nullable
        it('should accept null', () => {
            const result = ElementsZod.parse(null);
            expect(result).toBeNull();
        });

        it('should accept undefined (optional)', () => {
            const result = ElementsZod.optional().parse(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('invalid inputs', () => {
        // Empty structures
        it('should reject empty array', () => {
            expect(() => ElementsZod.parse([])).toThrow(
                'Elements array must contain at least one element'
            );
        });

        it('should reject empty object', () => {
            expect(() => ElementsZod.parse({})).toThrow();
        });

        // Invalid types in array
        it('should reject array with booleans', () => {
            expect(() => ElementsZod.parse([true, false])).toThrow();
        });

        it('should reject array with objects', () => {
            expect(() => ElementsZod.parse([{ key: 'value' }])).toThrow();
        });

        it('should reject array with null', () => {
            expect(() => ElementsZod.parse([null])).toThrow();
        });

        it('should reject array with undefined', () => {
            expect(() => ElementsZod.parse([undefined])).toThrow();
        });

        it('should reject array with empty string', () => {
            expect(() => ElementsZod.parse([''])).toThrow();
        });

        // Invalid types in object
        it('should reject object with boolean values', () => {
            expect(() => ElementsZod.parse({ isActive: true })).toThrow();
        });

        it('should reject object with null values', () => {
            expect(() => ElementsZod.parse({ value: null })).toThrow();
        });

        it('should reject object with empty string value', () => {
            expect(() => ElementsZod.parse({ key: '' })).toThrow();
        });

        // Scalar values
        it('should reject plain string', () => {
            expect(() => ElementsZod.parse('Active')).toThrow();
        });

        it('should reject plain number', () => {
            expect(() => ElementsZod.parse(123)).toThrow();
        });

        it('should reject plain boolean', () => {
            expect(() => ElementsZod.parse(true)).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should sanitize HTML in array strings', () => {
            const input = ['<script>alert(1)</script>Active'];
            const result = ElementsZod.parse(input) as (string | number)[];
            // htmlSanitizer removes ALL HTML tags, keeping only text content
            expect(result[0]).toBe('Active');
            expect(result[0]).not.toContain('<script>');
        });

        it('should sanitize HTML in object values', () => {
            const input = { key: '<b>Bold</b>' };
            const result = ElementsZod.parse(input) as Record<string, string | number>;
            // htmlSanitizer removes ALL HTML tags, keeping only text content
            expect(result).toHaveProperty('key');
            expect(result.key).toBe('Bold');
        });

        it('should accept duplicate values in array', () => {
            const input = ['Active', 'Active'];
            const result = ElementsZod.parse(input);
            expect(result).toEqual(input);
        });

        it('should handle array with special characters', () => {
            const input = ['Status-Active', 'Status_Inactive', 'Status.Pending'];
            const result = ElementsZod.parse(input);
            expect(result).toEqual(input);
        });
    });
});
