import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { validateIconConfig } from '../icon-config.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-icon-config-store';

describe('validateIconConfig', () => {
    const mockAddSchemaValidationError = vi.fn();

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({
            addSchemaValidationError: mockAddSchemaValidationError,
        } as any);
    });

    // -------------------------------------------------------------------------
    // valid cases
    // -------------------------------------------------------------------------
    describe('valid cases', () => {
        it('should accept minimal config (type + icon only)', () => {
            const config = { type: 'icon', icon: 'check' };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).toMatchObject({ type: 'icon', icon: 'check' });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with class instead of icon', () => {
            const config = {
                type: 'icon',
                class: ['fa-regular', 'fa-trash-can', 'text-danger'],
            };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.type).toBe('icon');
            expect(result.class).toEqual(['fa-regular', 'fa-trash-can', 'text-danger']);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with all formatting fields', () => {
            const config = {
                type: 'icon',
                icon: 'check',
                variant: 'success',
                size: 'lg',
                alt: 'Active',
                title: 'Active status',
            };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.variant).toBe('success');
            expect(result.size).toBe('lg');
            expect(result.alt).toBe('Active');
            expect(result.title).toBe('Active status');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with route and key', () => {
            const config = {
                type: 'icon',
                icon: 'edit',
                variant: 'primary',
                route: '/users/{id}/edit',
                key: 'id',
            };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.route).toBe('/users/{id}/edit');
            expect(result.key).toBe('id');
        });

        it('should accept config with style field', () => {
            const config = { type: 'icon', icon: 'check', style: 'cursor: pointer;' };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.style).toBe('cursor: pointer;');
        });

        it('should accept null values for all nullable optional fields', () => {
            const config = {
                type: 'icon',
                icon: 'check',
                class: null,
                variant: null,
                color: null,
                size: null,
                alt: null,
                title: null,
                route: null,
                key: null,
                style: null,
                cellRules: null,
            };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with all Bootstrap color values for variant', () => {
            const colors = [
                'primary',
                'secondary',
                'success',
                'danger',
                'warning',
                'info',
                'dark',
                'light',
            ] as const;

            colors.forEach(variant => {
                const config = { type: 'icon', icon: 'check', variant };
                expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
            });
        });

        it('should accept config with all Bootstrap color values for color', () => {
            const colors = [
                'primary',
                'secondary',
                'success',
                'danger',
                'warning',
                'info',
                'dark',
                'light',
            ] as const;

            colors.forEach(color => {
                const config = { type: 'icon', icon: 'check', color };
                const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');
                expect(result.color).toBe(color);
            });
        });

        it('should accept config with all size values', () => {
            const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

            sizes.forEach(size => {
                const config = { type: 'icon', icon: 'check', size };
                expect(() =>
                    validateIconConfig(config, TEST_STORE_ID, `test.${size}`)
                ).not.toThrow();
            });
        });

        it('should accept variant as variants registry key (non-Bootstrap color)', () => {
            const config = { type: 'icon', icon: 'check', variant: 'show' };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.variant).toBe('show');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept color as variants registry key (non-Bootstrap color)', () => {
            const config = { type: 'icon', icon: 'trash', color: 'destroy' };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.color).toBe('destroy');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept full PARAMS.md example config', () => {
            const config = {
                type: 'icon',
                icon: 'eye',
                variant: 'info',
                alt: 'Show',
                title: 'Show details',
                key: 'slug',
                route: 'products/{slug}',
            };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.full');

            expect(result.type).toBe('icon');
            expect(result.icon).toBe('eye');
            expect(result.variant).toBe('info');
            expect(result.alt).toBe('Show');
            expect(result.title).toBe('Show details');
            expect(result.key).toBe('slug');
            expect(result.route).toBe('products/{slug}');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // conditional config support
    // -------------------------------------------------------------------------
    describe('conditional config support', () => {
        it('should accept conditional config without icon/class at root', () => {
            const config = {
                type: 'icon',
                key: 'status',
                if: [
                    { eq: 'active', icon: 'check', variant: 'success' },
                    { eq: 'inactive', icon: 'times', variant: 'danger' },
                ],
                else: { icon: 'question', variant: 'secondary' },
            };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept conditional config with only else', () => {
            const config = {
                type: 'icon',
                key: 'active',
                else: { icon: 'times', variant: 'danger' },
            };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
        });

        it('should accept conditional config with only if', () => {
            const config = {
                type: 'icon',
                key: 'status',
                if: [{ eq: 'active', icon: 'check' }],
            };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
        });
    });

    // -------------------------------------------------------------------------
    // invalid cases
    // -------------------------------------------------------------------------
    describe('invalid cases', () => {
        it('should throw when type is missing', () => {
            const config = { icon: 'check' };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'IconConfigValidator',
                'Invalid icon column config',
                'test.key',
                config,
                expect.any(String)
            );
        });

        it('should throw when type is not "icon"', () => {
            const config = { type: 'static', icon: 'check' };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'IconConfigValidator',
                'Invalid icon column config',
                'test.key',
                config,
                expect.any(String)
            );
        });

        it('should throw when neither icon nor class nor conditionals provided', () => {
            const config = { type: 'icon' };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should throw when icon is empty string', () => {
            const config = { type: 'icon', icon: '' };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should throw when variant is a hex color (CSS syntax not allowed)', () => {
            const config = { type: 'icon', icon: 'check', variant: '#ff0000' };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should throw when color is a hex color (CSS syntax not allowed)', () => {
            const config = { type: 'icon', icon: 'check', color: '#ff0000' };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should accept color as arbitrary identifier — valid registry key name', () => {
            // 'red' is syntactically a valid registry key; config.variants may map it to a Bootstrap color
            const config = { type: 'icon', icon: 'check', color: 'red' };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.color).toBe('red');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should throw when size is invalid', () => {
            const config = { type: 'icon', icon: 'check', size: 'huge' };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should throw when the entire config is null', () => {
            expect(() => validateIconConfig(null as any, TEST_STORE_ID, 'test.key')).toThrow();
        });

        it('should throw error message containing configKey', () => {
            const config = { icon: 'no-type' };
            const configKey = 'response.body.columnConfigs.myIcon';

            expect(() => validateIconConfig(config, TEST_STORE_ID, configKey)).toThrow(
                new RegExp(configKey)
            );
        });

        it('should throw when invalid data-* attribute value provided', () => {
            const config = {
                type: 'icon',
                icon: 'check',
                'data-id': { nested: 'object' },
            };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'IconConfigValidator',
                expect.stringContaining('data-id'),
                'test.key.data-id',
                { nested: 'object' },
                expect.any(String)
            );
        });
    });

    // -------------------------------------------------------------------------
    // strip logic
    // -------------------------------------------------------------------------
    describe('strip logic', () => {
        it('should remove unknown keys not in ALLOWED_KEYS', () => {
            const config = {
                type: 'icon',
                icon: 'check',
                unknownField: 'remove me',
                customProp: 42,
            };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).not.toHaveProperty('unknownField');
            expect(result).not.toHaveProperty('customProp');
        });

        it('should preserve all allowed keys', () => {
            const config = {
                type: 'icon',
                icon: 'edit',
                class: ['ms-1'],
                variant: 'primary',
                color: 'success',
                size: 'md',
                alt: 'Edit',
                title: 'Edit this item',
                route: '/users/{id}/edit',
                key: 'id',
                style: 'cursor: pointer;',
            };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            for (const key of Object.keys(config)) {
                expect(result).toHaveProperty(key);
            }
            expect(result.color).toBe('success');
        });

        it('should preserve data-* attributes', () => {
            const config = {
                type: 'icon',
                icon: 'check',
                'data-user-id': '42',
                'data-action': 'toggle',
            };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).toHaveProperty('data-user-id', '42');
            expect(result).toHaveProperty('data-action', 'toggle');
        });

        it('should remove unknown keys but keep data-* and allowed keys simultaneously', () => {
            const config = {
                type: 'icon',
                icon: 'check',
                someUnknownKey: 'gone',
                'data-custom': 'kept',
                variant: 'success',
            };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).not.toHaveProperty('someUnknownKey');
            expect(result).toHaveProperty('data-custom', 'kept');
            expect(result).toHaveProperty('variant', 'success');
        });

        it('should not mutate the original config object', () => {
            const original = {
                type: 'icon',
                icon: 'check',
                unknownKey: 'to-remove',
            };
            const originalCopy = { ...original };

            validateIconConfig(original, TEST_STORE_ID, 'test.key');

            expect(original).toEqual(originalCopy);
        });

        it('should return an object (not the original reference)', () => {
            const config = { type: 'icon', icon: 'check' };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).not.toBe(config);
        });
    });

    // -------------------------------------------------------------------------
    // mapping nested strip integration
    // -------------------------------------------------------------------------
    describe('mapping nested strip integration', () => {
        it('should accept and pass through a valid mapping config', () => {
            const config = {
                type: 'icon',
                key: 'status',
                mapping: { active: { icon: 'check', variant: 'success' } },
            };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.mapping?.active?.icon).toBe('check');
            expect(result.mapping?.active?.variant).toBe('success');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should strip unknown keys from a mapping entry', () => {
            const config = {
                type: 'icon',
                key: 'status',
                mapping: { active: { icon: 'check', unknownKey: 'gone' } },
            };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');
            const entry = result.mapping?.active as Record<string, unknown> | undefined;

            expect(entry).not.toHaveProperty('unknownKey');
            expect(entry?.icon).toBe('check');
        });

        it('should strip data-* attributes from a mapping entry (not allowed inside entries)', () => {
            const config = {
                type: 'icon',
                key: 'status',
                mapping: { active: { icon: 'check', 'data-id': '42' } },
            };

            const result = validateIconConfig(config, TEST_STORE_ID, 'test.key');
            const entry = result.mapping?.active as Record<string, unknown> | undefined;

            expect(entry).not.toHaveProperty('data-id');
        });

        it('should not throw when mapping is null', () => {
            const config = { type: 'icon', icon: 'check', mapping: null };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // error store interaction
    // -------------------------------------------------------------------------
    describe('error store interaction', () => {
        it('should call useErrorHandlerStore with correct errorStoreId', () => {
            const config = { icon: 'missing-type' };
            const storeId = 'my-specific-store';

            try {
                validateIconConfig(config, storeId, 'test.key');
            } catch {
                // expected
            }

            expect(vi.mocked(useErrorHandlerStore)).toHaveBeenCalledWith(storeId);
        });

        it('should call addSchemaValidationError with component "IconConfigValidator"', () => {
            const config = { type: 'icon' };

            try {
                validateIconConfig(config, TEST_STORE_ID, 'test.key');
            } catch {
                // expected
            }

            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'IconConfigValidator',
                expect.any(String),
                expect.any(String),
                expect.any(Object),
                expect.any(String)
            );
        });

        it('should call addSchemaValidationError with the configKey', () => {
            const config = { type: 'static', icon: 'check' };
            const configKey = 'response.body.columnConfigs.myIcon';

            try {
                validateIconConfig(config, TEST_STORE_ID, configKey);
            } catch {
                // expected
            }

            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                configKey,
                expect.anything(),
                expect.any(String)
            );
        });

        it('should not call addSchemaValidationError for valid config', () => {
            const config = { type: 'icon', icon: 'check' };

            validateIconConfig(config, TEST_STORE_ID, 'test.key');

            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should add data-* error with key containing the attribute name', () => {
            const config = {
                type: 'icon',
                icon: 'check',
                'data-value': ['invalid', 'array'],
            };

            try {
                validateIconConfig(config, TEST_STORE_ID, 'test.key');
            } catch {
                // expected
            }

            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'IconConfigValidator',
                "Invalid data attribute 'data-value'",
                'test.key.data-value',
                ['invalid', 'array'],
                expect.any(String)
            );
        });
    });

    // -------------------------------------------------------------------------
    // edge cases
    // -------------------------------------------------------------------------
    describe('edge cases', () => {
        it('should accept icon with exactly 250 characters', () => {
            const config = { type: 'icon', icon: 'a'.repeat(250) };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
        });

        it('should throw when icon exceeds 250 characters', () => {
            const config = { type: 'icon', icon: 'a'.repeat(251) };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
        });

        it('should accept null data-* attribute values without data-* validation error', () => {
            const config = {
                type: 'icon',
                icon: 'check',
                'data-id': null,
            };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept undefined data-* attribute values without data-* validation error', () => {
            const config: Record<string, unknown> = {
                type: 'icon',
                icon: 'check',
                'data-id': undefined,
            };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should handle config with only whitespace in icon — valid per min(1)', () => {
            const config = { type: 'icon', icon: ' x ' };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
        });

        it('should throw when alt exceeds 500 characters', () => {
            const config = { type: 'icon', icon: 'check', alt: 'a'.repeat(501) };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
        });

        it('should throw when route exceeds 1000 characters', () => {
            const config = { type: 'icon', icon: 'edit', route: 'a'.repeat(1001) };

            expect(() => validateIconConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
        });
    });
});
