import { describe, it, expect } from 'vitest';
import { ReferenceZod } from '../reference.zod';

describe('ReferenceZod', () => {
    it('should accept valid reference strings', () => {
        expect(ReferenceZod.parse('id')).toBe('id');
        expect(ReferenceZod.parse('user_id')).toBe('user_id');
        expect(ReferenceZod.parse('nested.field.name')).toBe('nested.field.name');
        expect(ReferenceZod.parse('camelCaseField')).toBe('camelCaseField');
    });

    it('should accept 1 character long string', () => {
        expect(ReferenceZod.parse('a')).toBe('a');
    });

    it('should accept 100 characters long string', () => {
        const longString = 'a'.repeat(100);
        expect(ReferenceZod.parse(longString)).toBe(longString);
    });

    it('should accept null', () => {
        expect(ReferenceZod.parse(null)).toBeNull();
    });

    it('should accept undefined as null (if optional, but strict nullable usually means null)', () => {
        // Note: Zod .nullable() means it accepts null.
        // If input is undefined, Zod by default throws unless .optional() is also used.
        // However, in our project pattern, we often use nullable.
        // Let's check the behavior. If we pass undefined to a schema that is just nullable(), it throws.
        // But if we want optional, we usually modify the schema.
        // Based on the skill, "Always Nullable" is the rule.
        // Let's test standard nullable behavior.
        expect(() => ReferenceZod.parse(undefined)).toThrow();
    });

    it('should reject empty string', () => {
        expect(() => ReferenceZod.parse('')).toThrow();
    });

    it('should reject string longer than 100 characters', () => {
        const tooLongString = 'a'.repeat(101);
        expect(() => ReferenceZod.parse(tooLongString)).toThrow();
    });

    it('should reject non-string values', () => {
        expect(() => ReferenceZod.parse(123)).toThrow();
        expect(() => ReferenceZod.parse(true)).toThrow();
        expect(() => ReferenceZod.parse({})).toThrow();
        expect(() => ReferenceZod.parse([])).toThrow();
    });
});
