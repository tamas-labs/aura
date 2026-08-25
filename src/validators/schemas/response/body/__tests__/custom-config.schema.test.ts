import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { validateCustomConfig } from '../custom-config.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-custom-config-store';

describe('validateCustomConfig', () => {
    const mockAddSchemaValidationError = vi.fn();

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({
            addSchemaValidationError: mockAddSchemaValidationError,
        } as any);
    });

    describe('valid cases', () => {
        it('accepts renderer mode config', () => {
            const result = validateCustomConfig(
                { type: 'custom', field: 'data', renderer: 'myRenderer' },
                TEST_STORE_ID,
                'k'
            );
            expect(result).toMatchObject({ type: 'custom', field: 'data', renderer: 'myRenderer' });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('accepts template mode with mapping', () => {
            const result = validateCustomConfig(
                {
                    type: 'custom',
                    field: 'status',
                    template: "<span class='{class}'>{value}</span>",
                    mapping: { active: { class: 'text-success', icon: '✓' } },
                },
                TEST_STORE_ID,
                'k'
            );
            expect(result.template).toBe("<span class='{class}'>{value}</span>");
            expect(result.mapping).toEqual({ active: { class: 'text-success', icon: '✓' } });
        });

        it('accepts callback mode with params', () => {
            const result = validateCustomConfig(
                { type: 'custom', field: 'price', callback: 'fmt', params: { currency: 'HUF' } },
                TEST_STORE_ID,
                'k'
            );
            expect(result.callback).toBe('fmt');
            expect(result.params).toEqual({ currency: 'HUF' });
        });
    });

    describe('key stripping', () => {
        it('strips unknown top-level keys but keeps data-* attributes', () => {
            const result = validateCustomConfig(
                {
                    type: 'custom',
                    field: 'x',
                    renderer: 'r',
                    unknownKey: 'gone',
                    'data-id': '{id}',
                } as Record<string, unknown>,
                TEST_STORE_ID,
                'k'
            );
            expect(result).not.toHaveProperty('unknownKey');
            expect(result).toHaveProperty('data-id', '{id}');
        });

        it('keeps mapping template-parameter keys intact (no entry key-strip)', () => {
            // Custom mapping template param: free placeholder keys are NOT stripped.
            const result = validateCustomConfig(
                {
                    type: 'custom',
                    field: 'status',
                    template: '{customPlaceholder}',
                    mapping: { active: { customPlaceholder: 'hello', class: 'text-success' } },
                },
                TEST_STORE_ID,
                'k'
            );
            expect(result.mapping).toEqual({
                active: { customPlaceholder: 'hello', class: 'text-success' },
            });
        });
    });

    describe('invalid cases', () => {
        it('throws and reports when no rendering source is present', () => {
            expect(() => validateCustomConfig({ type: 'custom' }, TEST_STORE_ID, 'k')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('throws when a mapping entry value is non-primitive', () => {
            expect(() =>
                validateCustomConfig(
                    {
                        type: 'custom',
                        field: 'status',
                        template: '{x}',
                        mapping: { active: { x: { nested: 'bad' } } },
                    },
                    TEST_STORE_ID,
                    'k'
                )
            ).toThrow();
        });
    });
});
