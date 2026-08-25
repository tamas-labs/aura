// @vitest-environment jsdom
// storeId sanitization uses htmlSanitizer (DOMPurify), which only works
// correctly under a real DOM implementation (jsdom); it behaves differently
// under happy-dom.
import { describe, it, expect } from 'vitest';
import { validateStoreId, storeIdSchema } from '../../config/store-id.schema';

describe('storeIdSchema', () => {
    const DEFAULT_STORE_ID = 'aura-core';
    const CONFIG_STORE = 'config-store';

    describe('validateStoreId', () => {
        describe('priority hierarchy: props > config > default', () => {
            it('should use props storeId when both props and config are provided', () => {
                const result = validateStoreId('props-store', CONFIG_STORE);
                expect(result).toBe('props-store');
            });

            it('should use config storeId when props is undefined', () => {
                const result = validateStoreId(undefined, CONFIG_STORE);
                expect(result).toBe(CONFIG_STORE);
            });

            it('should use config storeId when props is null', () => {
                const result = validateStoreId(null, CONFIG_STORE);
                expect(result).toBe(CONFIG_STORE);
            });

            it('should use default when both props and config are undefined', () => {
                const result = validateStoreId(undefined, undefined);
                expect(result).toBe(DEFAULT_STORE_ID);
            });

            it('should use default when both props and config are null', () => {
                const result = validateStoreId(null, null);
                expect(result).toBe(DEFAULT_STORE_ID);
            });

            it('should use default when only props is provided and is null', () => {
                const result = validateStoreId(null);
                expect(result).toBe(DEFAULT_STORE_ID);
            });

            it('should use default when only props is provided and is undefined', () => {
                const result = validateStoreId(undefined);
                expect(result).toBe(DEFAULT_STORE_ID);
            });
        });

        describe('valid inputs', () => {
            it('should accept valid props storeId string', () => {
                const result = validateStoreId('my-store');
                expect(result).toBe('my-store');
            });

            it('should accept valid config storeId string', () => {
                const result = validateStoreId(undefined, 'my-config-store');
                expect(result).toBe('my-config-store');
            });

            it('should accept alphanumeric storeId', () => {
                const result = validateStoreId('store123');
                expect(result).toBe('store123');
            });

            it('should accept storeId with hyphens', () => {
                const result = validateStoreId('my-store-id');
                expect(result).toBe('my-store-id');
            });

            it('should accept storeId with underscores', () => {
                const result = validateStoreId('my_store_id');
                expect(result).toBe('my_store_id');
            });

            it('should accept minimum length storeId (1 character)', () => {
                const result = validateStoreId('a');
                expect(result).toBe('a');
            });

            it('should accept maximum length storeId (250 characters)', () => {
                const longId = 'a'.repeat(250);
                const result = validateStoreId(longId);
                expect(result).toBe(longId);
            });
        });

        describe('invalid props fallback to config', () => {
            it('should fallback to config when props is invalid (too long)', () => {
                const tooLong = 'a'.repeat(251);
                const result = validateStoreId(tooLong, CONFIG_STORE);
                expect(result).toBe(CONFIG_STORE);
            });

            it('should fallback to config when props is empty string', () => {
                const result = validateStoreId('', CONFIG_STORE);
                expect(result).toBe(CONFIG_STORE);
            });

            it('should fallback to config when props is number', () => {
                const result = validateStoreId(123 as unknown, CONFIG_STORE);
                expect(result).toBe(CONFIG_STORE);
            });

            it('should fallback to config when props is boolean', () => {
                const result = validateStoreId(true as unknown, CONFIG_STORE);
                expect(result).toBe(CONFIG_STORE);
            });

            it('should fallback to config when props is object', () => {
                const result = validateStoreId({} as unknown, CONFIG_STORE);
                expect(result).toBe(CONFIG_STORE);
            });

            it('should fallback to config when props is array', () => {
                const result = validateStoreId([] as unknown, CONFIG_STORE);
                expect(result).toBe(CONFIG_STORE);
            });
        });

        describe('invalid config fallback to default', () => {
            it('should fallback to default when both props and config are invalid', () => {
                const result = validateStoreId(123 as unknown, true as unknown);
                expect(result).toBe(DEFAULT_STORE_ID);
            });

            it('should fallback to default when config is empty string', () => {
                const result = validateStoreId(undefined, '');
                expect(result).toBe(DEFAULT_STORE_ID);
            });

            it('should fallback to default when config is too long', () => {
                const tooLong = 'a'.repeat(251);
                const result = validateStoreId(undefined, tooLong);
                expect(result).toBe(DEFAULT_STORE_ID);
            });
        });

        describe('HTML sanitization', () => {
            it('should sanitize HTML tags in props', () => {
                const result = validateStoreId('<script>alert("xss")</script>');
                expect(result).not.toContain('<script>');
                expect(result).not.toContain('</script>');
            });

            it('should sanitize HTML tags in config', () => {
                const result = validateStoreId(undefined, '<script>alert("xss")</script>');
                expect(result).not.toContain('<script>');
                expect(result).not.toContain('</script>');
            });

            it('should sanitize HTML attributes', () => {
                const result = validateStoreId('<div onclick="alert()">test</div>');
                expect(result).not.toContain('onclick');
                expect(result).not.toContain('<div>');
            });

            it('should remove dangerous content', () => {
                const result = validateStoreId('<img src=x onerror=alert(1)>');
                expect(result).not.toContain('onerror');
                expect(result).not.toContain('<img');
            });

            it('should handle mixed content with HTML', () => {
                const result = validateStoreId('store<b>123</b>');
                expect(result).not.toContain('<b>');
                expect(result).not.toContain('</b>');
            });
        });

        describe('edge cases', () => {
            it('should handle whitespace-only string in props (valid)', () => {
                const result = validateStoreId('   ');
                expect(result).toBe('   ');
            });

            it('should handle string with special characters', () => {
                const result = validateStoreId('store@#$%');
                expect(result).toBe('store@#$%');
            });

            it('should handle unicode characters', () => {
                const result = validateStoreId('store-über');
                expect(result).toBe('store-über');
            });

            it('should handle emoji in storeId', () => {
                const result = validateStoreId('store🚀');
                expect(result).toBe('store🚀');
            });
        });
    });

    describe('storeIdSchema direct usage', () => {
        it('should parse valid string', () => {
            const result = storeIdSchema.parse('test-store');
            expect(result).toBe('test-store');
        });

        it('should return null for null input (nullable schema)', () => {
            const result = storeIdSchema.parse(null);
            expect(result).toBe(null);
        });

        it('should throw for undefined input', () => {
            expect(() => storeIdSchema.parse(undefined)).toThrow();
        });

        it('should throw for empty string', () => {
            expect(() => storeIdSchema.parse('')).toThrow();
        });

        it('should sanitize HTML in direct parse', () => {
            const result = storeIdSchema.parse('<b>bold</b>');
            expect(result).not.toContain('<b>');
        });

        it('should throw for string too long (>250 chars)', () => {
            const tooLong = 'a'.repeat(251);
            expect(() => storeIdSchema.parse(tooLong)).toThrow();
        });
    });
});
