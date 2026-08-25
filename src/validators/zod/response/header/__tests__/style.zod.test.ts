import { describe, it, expect } from 'vitest';
import { StyleZod } from '../style.zod';

describe('StyleZod', () => {
    describe('valid inputs', () => {
        it('should accept valid CSS style string', () => {
            const result = StyleZod.parse('color: red; background: blue;');
            expect(result).toBe('color: red; background: blue;');
        });

        it('should accept empty string', () => {
            const result = StyleZod.parse('');
            expect(result).toBe('');
        });

        it('should accept single CSS property', () => {
            const result = StyleZod.parse('font-size: 14px');
            expect(result).toBe('font-size: 14px');
        });

        it('should accept complex CSS with multiple properties', () => {
            const style = 'margin: 10px; padding: 5px 10px; border: 1px solid #ccc; color: #333;';
            const result = StyleZod.parse(style);
            expect(result).toBe(style);
        });

        it('should accept style string at maximum length (1000 chars)', () => {
            const longStyle = 'a'.repeat(1000);
            const result = StyleZod.parse(longStyle);
            expect(result).toHaveLength(1000);
        });

        it('should accept null value', () => {
            const result = StyleZod.parse(null);
            expect(result).toBeNull();
        });

        it('should sanitize HTML in style string', () => {
            const result = StyleZod.parse('<script>alert("xss")</script>color: red;');
            expect(result).not.toContain('<script>');
        });
    });

    describe('invalid inputs', () => {
        it('should reject style string exceeding max length (1001 chars)', () => {
            const tooLongStyle = 'a'.repeat(1001);
            expect(() => StyleZod.parse(tooLongStyle)).toThrow(/too long/i);
        });

        it('should reject non-string value (number)', () => {
            expect(() => StyleZod.parse(123)).toThrow();
        });

        it('should reject non-string value (boolean)', () => {
            expect(() => StyleZod.parse(true)).toThrow();
        });

        it('should reject non-string value (array)', () => {
            expect(() => StyleZod.parse(['color: red'])).toThrow();
        });

        it('should reject non-string value (object)', () => {
            expect(() => StyleZod.parse({ color: 'red' })).toThrow();
        });

        it('should reject undefined value', () => {
            expect(() => StyleZod.parse(undefined)).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle CSS with vendor prefixes', () => {
            const style = '-webkit-transform: rotate(45deg); -moz-transform: rotate(45deg);';
            const result = StyleZod.parse(style);
            expect(result).toBe(style);
        });

        it('should handle CSS with calc() function', () => {
            const style = 'width: calc(100% - 20px);';
            const result = StyleZod.parse(style);
            expect(result).toBe(style);
        });

        it('should handle CSS with custom properties', () => {
            const style = 'color: var(--primary-color);';
            const result = StyleZod.parse(style);
            expect(result).toBe(style);
        });

        it('should handle CSS with !important', () => {
            const style = 'display: none !important;';
            const result = StyleZod.parse(style);
            expect(result).toBe(style);
        });
    });
});
