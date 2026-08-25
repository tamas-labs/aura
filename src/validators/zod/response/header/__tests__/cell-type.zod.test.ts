import { describe, it, expect } from 'vitest';
import { CellTypeZod } from '../cell-type.zod';

describe('CellTypeZod', () => {
    describe('valid inputs', () => {
        it('should accept "number" type', () => {
            const result = CellTypeZod.parse('number');
            expect(result).toBe('number');
        });

        it('should accept "currency" type', () => {
            const result = CellTypeZod.parse('currency');
            expect(result).toBe('currency');
        });

        it('should accept "date" type', () => {
            const result = CellTypeZod.parse('date');
            expect(result).toBe('date');
        });

        it('should accept "datetime" type', () => {
            const result = CellTypeZod.parse('datetime');
            expect(result).toBe('datetime');
        });

        it('should accept "phone" type', () => {
            const result = CellTypeZod.parse('phone');
            expect(result).toBe('phone');
        });

        it('should accept "time" type', () => {
            const result = CellTypeZod.parse('time');
            expect(result).toBe('time');
        });

        it('should accept "static" type', () => {
            const result = CellTypeZod.parse('static');
            expect(result).toBe('static');
        });

        it('should accept "icon" type', () => {
            const result = CellTypeZod.parse('icon');
            expect(result).toBe('icon');
        });

        it('should accept "link" type', () => {
            const result = CellTypeZod.parse('link');
            expect(result).toBe('link');
        });

        it('should accept "modal" type', () => {
            const result = CellTypeZod.parse('modal');
            expect(result).toBe('modal');
        });

        it('should accept "reference" type', () => {
            const result = CellTypeZod.parse('reference');
            expect(result).toBe('reference');
        });

        it('should accept "badge" type', () => {
            const result = CellTypeZod.parse('badge');
            expect(result).toBe('badge');
        });

        it('should accept "progress" type', () => {
            const result = CellTypeZod.parse('progress');
            expect(result).toBe('progress');
        });

        it('should accept "button" type', () => {
            const result = CellTypeZod.parse('button');
            expect(result).toBe('button');
        });

        it('should accept "custom" type', () => {
            const result = CellTypeZod.parse('custom');
            expect(result).toBe('custom');
        });

        it('should accept null value', () => {
            const result = CellTypeZod.parse(null);
            expect(result).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject invalid type string', () => {
            expect(() => CellTypeZod.parse('invalid')).toThrow();
        });

        it('should reject empty string', () => {
            expect(() => CellTypeZod.parse('')).toThrow();
        });

        it('should reject number value', () => {
            expect(() => CellTypeZod.parse(123)).toThrow();
        });

        it('should reject boolean value', () => {
            expect(() => CellTypeZod.parse(true)).toThrow();
        });

        it('should reject array value', () => {
            expect(() => CellTypeZod.parse(['number'])).toThrow();
        });

        it('should reject object value', () => {
            expect(() => CellTypeZod.parse({ type: 'number' })).toThrow();
        });

        it('should reject undefined value', () => {
            expect(() => CellTypeZod.parse(undefined)).toThrow();
        });

        it('should be case-sensitive - reject uppercase', () => {
            expect(() => CellTypeZod.parse('NUMBER')).toThrow();
        });

        it('should be case-sensitive - reject mixed case', () => {
            expect(() => CellTypeZod.parse('Number')).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should reject type with extra whitespace', () => {
            expect(() => CellTypeZod.parse(' number ')).toThrow();
        });

        it('should reject type with typo', () => {
            expect(() => CellTypeZod.parse('numbr')).toThrow();
        });

        it('should reject similar but invalid strings', () => {
            expect(() => CellTypeZod.parse('numbers')).toThrow();
            expect(() => CellTypeZod.parse('dates')).toThrow();
            expect(() => CellTypeZod.parse('icons')).toThrow();
        });
    });
});
