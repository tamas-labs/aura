import { describe, it, expect } from 'vitest';
import { SiteTokenZod } from '../site-token.zod';

describe('SiteTokenZod', () => {
    describe('valid inputs', () => {
        it('should parse valid string token', () => {
            const result = SiteTokenZod.parse('my-secret-token');
            expect(result).toBe('my-secret-token');
        });

        it('should parse empty string', () => {
            const result = SiteTokenZod.parse('');
            expect(result).toBe('');
        });

        it('should parse long string token', () => {
            const longToken = 'a'.repeat(200);
            const result = SiteTokenZod.parse(longToken);
            expect(result).toBe(longToken);
        });

        it('should parse boolean true', () => {
            const result = SiteTokenZod.parse(true);
            expect(result).toBe(true);
        });

        it('should parse boolean false', () => {
            const result = SiteTokenZod.parse(false);
            expect(result).toBe(false);
        });

        it('should parse null', () => {
            const result = SiteTokenZod.parse(null);
            expect(result).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should throw error for number', () => {
            expect(() => SiteTokenZod.parse(123)).toThrow();
        });

        it('should throw error for object', () => {
            expect(() => SiteTokenZod.parse({ token: 'abc' })).toThrow();
        });

        it('should throw error for array', () => {
            expect(() => SiteTokenZod.parse(['token'])).toThrow();
        });

        it('should throw error for undefined', () => {
            expect(() => SiteTokenZod.parse(undefined)).toThrow();
        });

        it('should throw error for empty object', () => {
            expect(() => SiteTokenZod.parse({})).toThrow();
        });
    });

    describe('safeParse method', () => {
        it('should return success for valid string', () => {
            const result = SiteTokenZod.safeParse('valid-token');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('valid-token');
            }
        });

        it('should return success for boolean true', () => {
            const result = SiteTokenZod.safeParse(true);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe(true);
            }
        });

        it('should return success for boolean false', () => {
            const result = SiteTokenZod.safeParse(false);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe(false);
            }
        });

        it('should return success for null', () => {
            const result = SiteTokenZod.safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeNull();
            }
        });

        it('should return failure for number', () => {
            const result = SiteTokenZod.safeParse(123);
            expect(result.success).toBe(false);
        });

        it('should return failure for object', () => {
            const result = SiteTokenZod.safeParse({ token: 'abc' });
            expect(result.success).toBe(false);
        });

        it('should return failure for undefined', () => {
            const result = SiteTokenZod.safeParse(undefined);
            expect(result.success).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle special characters in string token', () => {
            const token = 'token-with_special.chars@123';
            const result = SiteTokenZod.parse(token);
            expect(result).toBe(token);
        });

        it('should handle unicode characters in string token', () => {
            const token = '🔑token-emoji';
            const result = SiteTokenZod.parse(token);
            expect(result).toBe(token);
        });

        it('should handle whitespace in string token', () => {
            const token = '  token with spaces  ';
            const result = SiteTokenZod.parse(token);
            expect(result).toBe(token);
        });
    });
});
