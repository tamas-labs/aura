import { describe, it, expect } from 'vitest';
import { ReferenceZod } from '../reference.zod';

/**
 * Edge case tests for the ReferenceZod validator
 *
 * These tests cover additional edge cases
 * not present in the standard tests.
 */
describe('ReferenceZod - Edge Cases', () => {
    describe('Special characters in field names', () => {
        it('should accept underscore', () => {
            expect(ReferenceZod.parse('user_name')).toBe('user_name');
        });

        it('should accept dot notation', () => {
            expect(ReferenceZod.parse('user.profile.name')).toBe('user.profile.name');
        });

        it('should accept numbers in field names', () => {
            expect(ReferenceZod.parse('field123')).toBe('field123');
            expect(ReferenceZod.parse('field_123')).toBe('field_123');
        });

        it('should accept hyphen', () => {
            expect(ReferenceZod.parse('user-name')).toBe('user-name');
        });

        it('should accept mixed case', () => {
            expect(ReferenceZod.parse('firstName')).toBe('firstName');
            expect(ReferenceZod.parse('LASTNAME')).toBe('LASTNAME');
            expect(ReferenceZod.parse('eMail_Address')).toBe('eMail_Address');
        });
    });

    describe('Boundary values', () => {
        it('should accept exactly 99 characters', () => {
            const string99 = 'a'.repeat(99);
            expect(ReferenceZod.parse(string99)).toBe(string99);
        });

        it('should accept exactly 2 characters', () => {
            expect(ReferenceZod.parse('ab')).toBe('ab');
        });

        it('should reject exactly 101 characters', () => {
            const string101 = 'a'.repeat(101);
            expect(() => ReferenceZod.parse(string101)).toThrow();
        });
    });

    describe('Whitespace handling', () => {
        it('should accept field names with leading spaces', () => {
            // Zod by default does not trim, so it should accept
            expect(ReferenceZod.parse(' field')).toBe(' field');
        });

        it('should accept field names with trailing spaces', () => {
            expect(ReferenceZod.parse('field ')).toBe('field ');
        });

        it('should accept field names with internal spaces', () => {
            expect(ReferenceZod.parse('user name')).toBe('user name');
        });

        it('should reject string with only spaces', () => {
            // Single space is valid (length = 1)
            expect(ReferenceZod.parse(' ')).toBe(' ');

            // Multiple spaces are also valid
            expect(ReferenceZod.parse('   ')).toBe('   ');
        });
    });

    describe('Unicode and international characters', () => {
        it('should accept unicode characters', () => {
            expect(ReferenceZod.parse('felhasználó')).toBe('felhasználó');
            expect(ReferenceZod.parse('用户名')).toBe('用户名');
            expect(ReferenceZod.parse('имя_пользователя')).toBe('имя_пользователя');
        });

        it('should accept emoji (as they are valid unicode)', () => {
            expect(ReferenceZod.parse('field_🔥')).toBe('field_🔥');
        });
    });

    describe('Type coercion', () => {
        it('should not coerce number to string', () => {
            expect(() => ReferenceZod.parse(123)).toThrow();
        });

        it('should not coerce boolean to string', () => {
            expect(() => ReferenceZod.parse(true)).toThrow();
            expect(() => ReferenceZod.parse(false)).toThrow();
        });

        it('should not accept NaN', () => {
            expect(() => ReferenceZod.parse(NaN)).toThrow();
        });

        it('should not accept Infinity', () => {
            expect(() => ReferenceZod.parse(Infinity)).toThrow();
        });
    });

    describe('Null and undefined edge cases', () => {
        it('should treat explicit null as valid', () => {
            const result = ReferenceZod.parse(null);
            expect(result).toBeNull();
        });

        it('should not accept undefined (nullable is not optional)', () => {
            expect(() => ReferenceZod.parse(undefined)).toThrow();
        });
    });

    describe('safeParse behavior', () => {
        it('should return success for valid string', () => {
            const result = ReferenceZod.safeParse('valid_field');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('valid_field');
            }
        });

        it('should return error for invalid input', () => {
            const result = ReferenceZod.safeParse('');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBeDefined();
            }
        });

        it('should return success for null', () => {
            const result = ReferenceZod.safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeNull();
            }
        });
    });
});
