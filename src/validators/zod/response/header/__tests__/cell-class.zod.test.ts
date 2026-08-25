import { describe, it, expect } from 'vitest';
import { CellClassZod } from '../cell-class.zod';

describe('CellClassZod', () => {
    describe('valid inputs - string format', () => {
        it('should accept single class as string', () => {
            const result = CellClassZod.parse('btn');
            expect(result).toBe('btn');
        });

        it('should accept multiple classes as string', () => {
            const result = CellClassZod.parse('btn btn-primary fw-bold');
            expect(result).toBe('btn btn-primary fw-bold');
        });

        it('should accept string at maximum length (500 chars)', () => {
            const longClass = 'a'.repeat(500);
            const result = CellClassZod.parse(longClass);
            expect(result).toHaveLength(500);
        });

        it('should sanitize HTML in class string', () => {
            const result = CellClassZod.parse('<script>alert("xss")</script>btn');
            expect(result).not.toContain('<script>');
        });
    });

    describe('valid inputs - array format', () => {
        it('should accept array with single class', () => {
            const result = CellClassZod.parse(['btn']);
            expect(result).toEqual(['btn']);
        });

        it('should accept array with multiple classes', () => {
            const result = CellClassZod.parse(['btn', 'btn-primary', 'fw-bold']);
            expect(result).toEqual(['btn', 'btn-primary', 'fw-bold']);
        });

        it('should accept array with maximum number of classes (50)', () => {
            const classes = Array(50).fill('class');
            const result = CellClassZod.parse(classes);
            expect(result).toHaveLength(50);
        });

        it('should accept array with classes at max individual length (100 chars)', () => {
            const longClass = 'a'.repeat(100);
            const result = CellClassZod.parse([longClass]);
            expect(result).toEqual([longClass]);
        });

        it('should sanitize HTML in array elements', () => {
            const result = CellClassZod.parse(['btn', '<script>alert("xss")</script>']) as string[];
            expect(result[1]).not.toContain('<script>');
        });
    });

    describe('valid inputs - null', () => {
        it('should accept null value', () => {
            const result = CellClassZod.parse(null);
            expect(result).toBeNull();
        });
    });

    describe('invalid inputs - string format', () => {
        it('should reject empty string', () => {
            expect(() => CellClassZod.parse('')).toThrow(/cannot be empty/i);
        });

        it('should reject string exceeding max length (501 chars)', () => {
            const tooLongClass = 'a'.repeat(501);
            expect(() => CellClassZod.parse(tooLongClass)).toThrow(/too long/i);
        });
    });

    describe('invalid inputs - array format', () => {
        it('should reject empty array', () => {
            expect(() => CellClassZod.parse([])).toThrow(/cannot be empty/i);
        });

        it('should reject array with empty string element', () => {
            expect(() => CellClassZod.parse(['btn', ''])).toThrow(/cannot be empty/i);
        });

        it('should reject array with too many classes (51)', () => {
            const classes = Array(51).fill('class');
            expect(() => CellClassZod.parse(classes)).toThrow(/too many/i);
        });

        it('should reject array with class exceeding max individual length (101 chars)', () => {
            const tooLongClass = 'a'.repeat(101);
            expect(() => CellClassZod.parse([tooLongClass])).toThrow(/too long/i);
        });

        it('should reject array with non-string element (number)', () => {
            expect(() => CellClassZod.parse(['btn', 123])).toThrow();
        });

        it('should reject array with non-string element (boolean)', () => {
            expect(() => CellClassZod.parse(['btn', true])).toThrow();
        });

        it('should reject array with non-string element (object)', () => {
            expect(() => CellClassZod.parse(['btn', { class: 'primary' }])).toThrow();
        });
    });

    describe('invalid inputs - other types', () => {
        it('should reject number value', () => {
            expect(() => CellClassZod.parse(123)).toThrow();
        });

        it('should reject boolean value', () => {
            expect(() => CellClassZod.parse(true)).toThrow();
        });

        it('should reject object value', () => {
            expect(() => CellClassZod.parse({ class: 'btn' })).toThrow();
        });

        it('should reject undefined value', () => {
            expect(() => CellClassZod.parse(undefined)).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle Bootstrap utility classes', () => {
            const result = CellClassZod.parse('d-flex justify-content-center align-items-center');
            expect(result).toBe('d-flex justify-content-center align-items-center');
        });

        it('should handle custom CSS classes with dashes and underscores', () => {
            const result = CellClassZod.parse(['custom-class', 'another_class', 'class123']);
            expect(result).toHaveLength(3);
        });

        it('should handle classes with special Bootstrap conventions', () => {
            const result = CellClassZod.parse(['text-primary', 'bg-secondary', 'border-danger']);
            expect(result).toHaveLength(3);
        });

        it('should handle array with whitespace in class names', () => {
            const result = CellClassZod.parse(['btn primary', 'text center']);
            expect(result).toHaveLength(2);
        });
    });
});
