import { describe, it, expect } from 'vitest';
import { StringZod } from '../string.zod';

describe('StringZod', () => {
    describe('default parameters (min=1, max=250)', () => {
        const schema = StringZod();

        it('should accept valid string', () => {
            const result = schema.parse('valid string');
            expect(result).toBe('valid string');
        });

        it('should accept minimum length string (1 character)', () => {
            const result = schema.parse('a');
            expect(result).toBe('a');
        });

        it('should accept maximum length string (250 characters)', () => {
            const longString = 'a'.repeat(250);
            const result = schema.parse(longString);
            expect(result).toBe(longString);
        });

        it('should accept null and return null', () => {
            const result = schema.parse(null);
            expect(result).toBeNull();
        });

        it('should throw error for empty string (min=1)', () => {
            expect(() => schema.parse('')).toThrow();
        });

        it('should throw error for string exceeding 250 characters', () => {
            const tooLong = 'a'.repeat(251);
            expect(() => schema.parse(tooLong)).toThrow();
        });

        it('should sanitize HTML tags', () => {
            const result = schema.parse('<script>alert("xss")</script>');
            expect(result).not.toContain('<script>');
            expect(result).not.toContain('</script>');
        });

        it('should sanitize HTML attributes', () => {
            const result = schema.parse('<div onclick="alert()">test</div>');
            expect(result).not.toContain('onclick');
            expect(result).not.toContain('<div>');
        });

        it('should remove dangerous content', () => {
            const result = schema.parse('<img src=x onerror=alert(1)>');
            expect(result).not.toContain('onerror');
            expect(result).not.toContain('<img');
        });
    });

    describe('custom min parameter', () => {
        it('should accept string with custom min=5', () => {
            const schema = StringZod(5);
            const result = schema.parse('hello');
            expect(result).toBe('hello');
        });

        it('should throw error for string below custom min=5', () => {
            const schema = StringZod(5);
            expect(() => schema.parse('hi')).toThrow();
        });

        it('should accept string exactly at custom min=5', () => {
            const schema = StringZod(5);
            const result = schema.parse('hello');
            expect(result).toBe('hello');
        });

        it('should allow min=0 for optional strings', () => {
            const schema = StringZod(0);
            const result = schema.parse('');
            expect(result).toBe('');
        });
    });

    describe('custom max parameter', () => {
        it('should accept string with custom max=10', () => {
            const schema = StringZod(1, 10);
            const result = schema.parse('short');
            expect(result).toBe('short');
        });

        it('should throw error for string exceeding custom max=10', () => {
            const schema = StringZod(1, 10);
            expect(() => schema.parse('this is too long')).toThrow();
        });

        it('should accept string exactly at custom max=10', () => {
            const schema = StringZod(1, 10);
            const result = schema.parse('1234567890');
            expect(result).toBe('1234567890');
        });
    });

    describe('custom min and max combination', () => {
        it('should enforce both min=3 and max=10', () => {
            const schema = StringZod(3, 10);

            // Valid
            expect(schema.parse('abc')).toBe('abc');
            expect(schema.parse('1234567890')).toBe('1234567890');

            // Invalid - too short
            expect(() => schema.parse('ab')).toThrow();

            // Invalid - too long
            expect(() => schema.parse('12345678901')).toThrow();
        });

        it('should handle very restrictive range (min=5, max=5)', () => {
            const schema = StringZod(5, 5);

            expect(schema.parse('hello')).toBe('hello');
            expect(() => schema.parse('hi')).toThrow();
            expect(() => schema.parse('toolong')).toThrow();
        });
    });

    describe('HTML sanitization with custom lengths', () => {
        it('should check the length before sanitizing', () => {
            const schema = StringZod(1, 20);
            const input = '<b>hello</b>'; // 12 raw characters, 'hello' (5 chars) after sanitization
            const result = schema.parse(input);

            expect(result).not.toContain('<b>');
            expect(result).not.toContain('</b>');

            // Zod runs the checks ahead of the transform, so the markup counts
            // towards the limit: the 12 raw characters exceed max=10
            expect(() => StringZod(1, 10).parse(input)).toThrow();
        });

        it('should handle sanitization resulting in empty string with min=0', () => {
            const schema = StringZod(0, 50);
            const input = '<script></script>';
            const result = schema.parse(input);

            expect(result).not.toContain('<script>');
            if (typeof result === 'string') {
                expect(result.length).toBeLessThanOrEqual(50);
            }
        });
    });

    describe('nullable behavior', () => {
        it('should accept null with default parameters', () => {
            const schema = StringZod();
            expect(schema.parse(null)).toBeNull();
        });

        it('should accept null with custom parameters', () => {
            const schema = StringZod(5, 100);
            expect(schema.parse(null)).toBeNull();
        });

        it('should throw error for undefined (not nullable)', () => {
            const schema = StringZod();
            expect(() => schema.parse(undefined)).toThrow();
        });

        it('should throw error for non-string types', () => {
            const schema = StringZod();

            expect(() => schema.parse(123)).toThrow();
            expect(() => schema.parse(true)).toThrow();
            expect(() => schema.parse({})).toThrow();
            expect(() => schema.parse([])).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle whitespace-only strings', () => {
            const schema = StringZod(1, 10);
            const result = schema.parse('   ');
            expect(result).toBe('   ');
        });

        it('should handle strings with special characters', () => {
            const schema = StringZod();
            const result = schema.parse('test@#$%^&*()');
            expect(result).toBe('test@#$%^&*()');
        });

        it('should handle unicode characters', () => {
            const schema = StringZod();
            const result = schema.parse('Héllo Wörld 你好');
            expect(result).toBe('Héllo Wörld 你好');
        });

        it('should handle emoji', () => {
            const schema = StringZod();
            const result = schema.parse('Hello 🚀🎉✨');
            expect(result).toBe('Hello 🚀🎉✨');
        });

        it('should handle newlines and tabs', () => {
            const schema = StringZod();
            const result = schema.parse('line1\nline2\ttab');
            expect(result).toBe('line1\nline2\ttab');
        });
    });

    describe('safeParse method', () => {
        it('should return success for valid input', () => {
            const schema = StringZod();
            const result = schema.safeParse('valid');

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('valid');
            }
        });

        it('should return error for invalid input', () => {
            const schema = StringZod(5);
            const result = schema.safeParse('hi');

            expect(result.success).toBe(false);
        });

        it('should return success for null', () => {
            const schema = StringZod();
            const result = schema.safeParse(null);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeNull();
            }
        });
    });
});
