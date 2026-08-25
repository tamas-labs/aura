import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { validateStaticConfig } from '../static-config.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-static-config-store';

describe('validateStaticConfig', () => {
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
        it('should accept minimal config (type + value only)', () => {
            const config = { type: 'static', value: 'ID:' };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).toMatchObject({ type: 'static', value: 'ID:' });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with all formatting fields', () => {
            const config = {
                type: 'static',
                value: 'Label',
                color: 'primary',
                align: 'start',
                uppercase: true,
                lowercase: false,
                capitalize: true,
                monospace: false,
            };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.color).toBe('primary');
            expect(result.align).toBe('start');
            expect(result.uppercase).toBe(true);
            expect(result.capitalize).toBe(true);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with padding fields', () => {
            const config = {
                type: 'static',
                value: 'ID:',
                padStart: 4,
                padEnd: 2,
                chars: '0',
            };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.padStart).toBe(4);
            expect(result.padEnd).toBe(2);
            expect(result.chars).toBe('0');
        });

        it('should accept config with special formatting flags', () => {
            const config = {
                type: 'static',
                value: '1000',
                number: true,
                currency: false,
                date: false,
                phone: false,
                unit: 'GB',
            };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.number).toBe(true);
            expect(result.unit).toBe('GB');
        });

        it('should accept config with class and style fields', () => {
            const config = {
                type: 'static',
                value: 'Active',
                class: ['text-success', 'fw-bold'],
                style: 'font-size: 14px;',
            };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.class).toEqual(['text-success', 'fw-bold']);
            expect(result.style).toBe('font-size: 14px;');
        });

        it('should accept config with key field', () => {
            const config = { type: 'static', value: '#', key: 'rowIndex' };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.key).toBe('rowIndex');
        });

        it('should accept null values for all nullable optional fields', () => {
            const config = {
                type: 'static',
                value: 'Label',
                color: null,
                align: null,
                uppercase: null,
                slice: null,
                unit: null,
                padStart: null,
                padEnd: null,
                chars: null,
                key: null,
            };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with all Bootstrap color values', () => {
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
                const config = { type: 'static', value: 'test', color };
                expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
            });
        });

        it('should accept config with all align values', () => {
            const aligns = ['start', 'center', 'end'] as const;

            aligns.forEach(align => {
                const config = { type: 'static', value: 'test', align };
                expect(() =>
                    validateStaticConfig(config, TEST_STORE_ID, `test.${align}`)
                ).not.toThrow();
            });
        });

        it('should accept full config with all fields combined', () => {
            const config = {
                type: 'static',
                value: 'ID:',
                color: 'secondary',
                align: 'end',
                uppercase: false,
                lowercase: false,
                capitalize: true,
                monospace: false,
                slice: 10,
                number: false,
                currency: false,
                date: false,
                phone: false,
                unit: null,
                padStart: 3,
                padEnd: null,
                chars: '#',
                key: 'idPrefix',
                class: 'pe-1',
                style: null,
            };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.full');

            expect(result.type).toBe('static');
            expect(result.value).toBe('ID:');
            expect(result.color).toBe('secondary');
            expect(result.align).toBe('end');
            expect(result.capitalize).toBe(true);
            expect(result.slice).toBe(10);
            expect(result.padStart).toBe(3);
            expect(result.chars).toBe('#');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // visual formatting fields (background, fontSize, fontWeight, italic, lineHeight, text)
    // -------------------------------------------------------------------------
    describe('visual formatting fields', () => {
        it('should accept config with background', () => {
            const config = { type: 'static', value: 'test', background: 'success' };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.background).toBe('success');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with hex background', () => {
            const config = { type: 'static', value: 'test', background: '#f0f0f0' };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.background).toBe('#f0f0f0');
        });

        it('should accept config with fontSize', () => {
            const config = { type: 'static', value: 'test', fontSize: '14px' };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.fontSize).toBe('14px');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with fontWeight number', () => {
            const config = { type: 'static', value: 'test', fontWeight: 700 };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.fontWeight).toBe(700);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with fontWeight string', () => {
            const config = { type: 'static', value: 'test', fontWeight: 'bold' };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.fontWeight).toBe('bold');
        });

        it('should accept config with italic true', () => {
            const config = { type: 'static', value: 'test', italic: true };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.italic).toBe(true);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with italic false', () => {
            const config = { type: 'static', value: 'test', italic: false };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.italic).toBe(false);
        });

        it('should accept and keep the normal field (font-style reset, static-parity)', () => {
            const config = { type: 'static', value: 'test', italic: true, normal: true };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.normal).toBe(true);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with lineHeight string', () => {
            const config = { type: 'static', value: 'test', lineHeight: '1.5' };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.lineHeight).toBe('1.5');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with lineHeight number', () => {
            const config = { type: 'static', value: 'test', lineHeight: 1.5 };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.lineHeight).toBe(1.5);
        });

        it('should accept config with text utility', () => {
            const config = { type: 'static', value: 'test', text: 'text-truncate' };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.text).toBe('text-truncate');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept null visual formatting fields', () => {
            const config = {
                type: 'static',
                value: 'test',
                background: null,
                fontSize: null,
                fontWeight: null,
                italic: null,
                lineHeight: null,
                text: null,
            };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should preserve visual formatting fields in strip logic', () => {
            const config = {
                type: 'static',
                value: 'Label',
                background: 'warning',
                fontSize: '16px',
                fontWeight: 'bold',
                italic: true,
                lineHeight: '1.6',
                text: 'text-nowrap',
            };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).toHaveProperty('background', 'warning');
            expect(result).toHaveProperty('fontSize', '16px');
            expect(result).toHaveProperty('fontWeight', 'bold');
            expect(result).toHaveProperty('italic', true);
            expect(result).toHaveProperty('lineHeight', '1.6');
            expect(result).toHaveProperty('text', 'text-nowrap');
        });

        it('should throw for invalid fontSize', () => {
            const config = { type: 'static', value: 'test', fontSize: 'big' };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should throw for invalid fontWeight', () => {
            const config = { type: 'static', value: 'test', fontWeight: 150 };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should throw for invalid text utility (not text- prefix)', () => {
            const config = { type: 'static', value: 'test', text: 'bg-primary' };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should accept combined visual and content formatting fields', () => {
            const config = {
                type: 'static',
                value: 'ID:',
                color: 'primary',
                background: 'light',
                fontSize: '12px',
                fontWeight: 600,
                italic: true,
                lineHeight: '20px',
                text: 'text-truncate',
                uppercase: true,
                padStart: 3,
                chars: '#',
            };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.color).toBe('primary');
            expect(result.background).toBe('light');
            expect(result.fontSize).toBe('12px');
            expect(result.fontWeight).toBe(600);
            expect(result.italic).toBe(true);
            expect(result.lineHeight).toBe('20px');
            expect(result.text).toBe('text-truncate');
            expect(result.uppercase).toBe(true);
            expect(result.padStart).toBe(3);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // invalid cases
    // -------------------------------------------------------------------------
    describe('invalid cases', () => {
        it('should throw when type is missing', () => {
            const config = { value: 'ID:' };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'StaticConfigValidator',
                'Invalid static column config',
                'test.key',
                config,
                expect.any(String)
            );
        });

        it('should throw when type is not "static"', () => {
            const config = { type: 'dynamic', value: 'ID:' };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'StaticConfigValidator',
                'Invalid static column config',
                'test.key',
                config,
                expect.any(String)
            );
        });

        it('should not throw when value is missing (conditional config support)', () => {
            // value is optional — it can be provided inside if/else branches
            const config = {
                type: 'static',
                key: 'id',
                if: [{ bigger: 5, value: 'ID:', class: ['fw-bold'] }],
                else: { value: 'id' },
            };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should throw when value is empty string', () => {
            const config = { type: 'static', value: '' };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should throw when color is not a Bootstrap color', () => {
            const config = { type: 'static', value: 'test', color: '#ff0000' };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should throw when color is an arbitrary CSS name', () => {
            const config = { type: 'static', value: 'test', color: 'red' };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should throw when align is an invalid value', () => {
            const config = { type: 'static', value: 'test', align: 'left' };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should throw when slice is not a number', () => {
            const config = { type: 'static', value: 'test', slice: 'ten' };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
        });

        it('should throw when padStart is negative', () => {
            const config = { type: 'static', value: 'test', padStart: -1 };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
        });

        it('should throw when the entire config is null', () => {
            expect(() => validateStaticConfig(null as any, TEST_STORE_ID, 'test.key')).toThrow();
        });

        it('should throw error message containing configKey', () => {
            const config = { value: 'no-type' };
            const configKey = 'response.body.columnConfigs.badge';

            expect(() => validateStaticConfig(config, TEST_STORE_ID, configKey)).toThrow(
                new RegExp(configKey)
            );
        });

        it('should throw when invalid data-* attribute value provided', () => {
            const config = {
                type: 'static',
                value: 'test',
                'data-id': { nested: 'object' },
            };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'StaticConfigValidator',
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
                type: 'static',
                value: 'ID:',
                unknownField: 'remove me',
                customProp: 42,
            };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).not.toHaveProperty('unknownField');
            expect(result).not.toHaveProperty('customProp');
        });

        it('should preserve all allowed keys', () => {
            const config = {
                type: 'static',
                value: 'Label',
                color: 'info',
                align: 'center',
                uppercase: true,
                lowercase: false,
                capitalize: false,
                monospace: true,
                slice: 5,
                number: false,
                currency: false,
                date: false,
                phone: false,
                unit: 'kg',
                padStart: 2,
                padEnd: 1,
                chars: ' ',
                key: 'myKey',
                class: 'fw-bold',
                style: 'color: red;',
            };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            for (const key of Object.keys(config)) {
                expect(result).toHaveProperty(key);
            }
        });

        it('should preserve data-* attributes', () => {
            const config = {
                type: 'static',
                value: 'test',
                'data-id': '123',
                'data-action': 'open',
            };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).toHaveProperty('data-id', '123');
            expect(result).toHaveProperty('data-action', 'open');
        });

        it('should remove unknown keys but keep data-* and allowed keys simultaneously', () => {
            const config = {
                type: 'static',
                value: 'Label',
                someUnknownKey: 'gone',
                'data-custom': 'kept',
                color: 'success',
            };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).not.toHaveProperty('someUnknownKey');
            expect(result).toHaveProperty('data-custom', 'kept');
            expect(result).toHaveProperty('color', 'success');
        });

        it('should remove __proto__ and constructor keys', () => {
            const config = {
                type: 'static',
                value: 'Safe',
                __proto__: { danger: true },
                constructor: { danger: true },
            };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).not.toHaveProperty('__proto__');
            expect(result).not.toHaveProperty('constructor');
        });

        it('should not mutate the original config object', () => {
            const original = {
                type: 'static',
                value: 'test',
                unknownKey: 'to-remove',
            };
            const originalCopy = { ...original };

            validateStaticConfig(original, TEST_STORE_ID, 'test.key');

            expect(original).toEqual(originalCopy);
        });
    });

    // -------------------------------------------------------------------------
    // error store interaction
    // -------------------------------------------------------------------------
    describe('error store interaction', () => {
        it('should call useErrorHandlerStore with correct errorStoreId', () => {
            const config = { value: 'missing-type' };
            const storeId = 'my-specific-store';

            try {
                validateStaticConfig(config, storeId, 'test.key');
            } catch {
                // expected
            }

            expect(vi.mocked(useErrorHandlerStore)).toHaveBeenCalledWith(storeId);
        });

        it('should call addSchemaValidationError with component "StaticConfigValidator"', () => {
            const config = { type: 'static' };

            try {
                validateStaticConfig(config, TEST_STORE_ID, 'test.key');
            } catch {
                // expected
            }

            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'StaticConfigValidator',
                expect.any(String),
                expect.any(String),
                expect.any(Object),
                expect.any(String)
            );
        });

        it('should call addSchemaValidationError with the configKey', () => {
            const config = { type: 'dynamic', value: 'x' };
            const configKey = 'response.body.columnConfigs.badge';

            try {
                validateStaticConfig(config, TEST_STORE_ID, configKey);
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
            const config = { type: 'static', value: 'OK' };

            validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should add data-* error with key containing the attribute name', () => {
            const config = {
                type: 'static',
                value: 'test',
                'data-value': ['invalid', 'array'],
            };

            try {
                validateStaticConfig(config, TEST_STORE_ID, 'test.key');
            } catch {
                // expected
            }

            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'StaticConfigValidator',
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
        it('should accept value with exactly 1000 characters', () => {
            const config = { type: 'static', value: 'a'.repeat(1000) };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
        });

        it('should throw when value exceeds 1000 characters', () => {
            const config = { type: 'static', value: 'a'.repeat(1001) };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
        });

        it('should accept null data-* attribute values without data-* validation error', () => {
            const config = {
                type: 'static',
                value: 'test',
                'data-id': null,
            };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept undefined data-* attribute values without data-* validation error', () => {
            const config: Record<string, unknown> = {
                type: 'static',
                value: 'test',
                'data-id': undefined,
            };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should return an object (not the original reference)', () => {
            const config = { type: 'static', value: 'test' };

            const result = validateStaticConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).not.toBe(config);
        });

        it('should handle config with only whitespace in value — zod min(1) with trim or not', () => {
            // String with content but valid per min(1)
            const config = { type: 'static', value: ' x ' };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).not.toThrow();
        });

        it('should accept unit with special characters (°C, km/h)', () => {
            const configs = [
                { type: 'static', value: '36', unit: '°C' },
                { type: 'static', value: '100', unit: 'km/h' },
                { type: 'static', value: '5', unit: 'GB' },
            ];

            configs.forEach(config => {
                expect(() =>
                    validateStaticConfig(config, TEST_STORE_ID, 'test.unit')
                ).not.toThrow();
            });
        });

        it('should throw when unit exceeds 50 characters', () => {
            const config = { type: 'static', value: 'test', unit: 'a'.repeat(51) };

            expect(() => validateStaticConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
        });
    });
});
