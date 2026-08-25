import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { validateBadgeConfig } from '../badge-config.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-badge-config-store';

describe('validateBadgeConfig', () => {
    const mockAddSchemaValidationError = vi.fn();

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({
            addSchemaValidationError: mockAddSchemaValidationError,
        } as any);
    });

    describe('valid cases', () => {
        it('should accept minimal config (type + field)', () => {
            const result = validateBadgeConfig(
                { type: 'badge', field: 'status' },
                TEST_STORE_ID,
                'k'
            );
            expect(result).toMatchObject({ type: 'badge', field: 'status' });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept the PARAMS.md mapping example config', () => {
            const config = {
                type: 'badge',
                field: 'priority',
                mapping: {
                    high: { variant: 'danger', label: 'Magas' },
                    low: { variant: 'secondary', label: 'Alacsony' },
                },
            };
            const result = validateBadgeConfig(config, TEST_STORE_ID, 'k');
            expect(result.mapping?.high?.variant).toBe('danger');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept a counter badge', () => {
            const result = validateBadgeConfig(
                { type: 'badge', field: 'unreadCount', pill: true, maxValue: 99, suffix: '+' },
                TEST_STORE_ID,
                'k'
            );
            expect(result.maxValue).toBe(99);
            expect(result.suffix).toBe('+');
        });

        it('should accept and keep the normal field (font-style reset, static-parity)', () => {
            const result = validateBadgeConfig(
                { type: 'badge', field: 'status', italic: true, normal: true },
                TEST_STORE_ID,
                'k'
            );
            expect(result.normal).toBe(true);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    describe('unknown key stripping', () => {
        it('should strip unknown keys but keep data-* attributes', () => {
            const config = {
                type: 'badge',
                value: 'X',
                bogus: 'remove-me',
                'data-count': '{count}',
            };
            const result = validateBadgeConfig(config, TEST_STORE_ID, 'k') as unknown as Record<
                string,
                unknown
            >;
            expect(result.bogus).toBeUndefined();
            expect(result['data-count']).toBe('{count}');
        });
    });

    describe('invalid cases', () => {
        it('should throw and report when no content source is given', () => {
            expect(() => validateBadgeConfig({ type: 'badge' }, TEST_STORE_ID, 'k')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });
    });

    describe('mapping nested strip integration (post `.catchall` removal)', () => {
        it('should strip unknown keys from a mapping entry', () => {
            const config = {
                type: 'badge',
                field: 'priority',
                mapping: { high: { variant: 'danger', label: 'Magas', unknownKey: 'gone' } },
            };

            const result = validateBadgeConfig(config, TEST_STORE_ID, 'k');
            const entry = result.mapping?.high as Record<string, unknown> | undefined;

            expect(entry).not.toHaveProperty('unknownKey');
            expect(entry?.label).toBe('Magas');
        });

        it('should strip data-* attributes from a mapping entry (not allowed inside entries)', () => {
            const config = {
                type: 'badge',
                field: 'priority',
                mapping: { high: { variant: 'danger', 'data-id': '1' } },
            };

            const result = validateBadgeConfig(config, TEST_STORE_ID, 'k');
            const entry = result.mapping?.high as Record<string, unknown> | undefined;

            expect(entry).not.toHaveProperty('data-id');
        });

        it('nested-strips unknown keys from trueValue/falseValue (phase 2 — singleEntryKeys)', () => {
            // The `trueValue`/`falseValue` (boolean branch, also `BadgeMappingValue`) now
            // go through the same key boundary as the `mapping` entries: the factory's
            // `singleEntryKeys` parameter (`BADGE_SINGLE_ENTRY_KEYS`) nested-strips these
            // top-level entry objects with `BADGE_MAPPING_ENTRY_ALLOWED_KEYS`. Unknown
            // keys are removed.
            const config = {
                type: 'badge',
                field: 'active',
                trueValue: { label: 'Yes', unknownKey: 'still-here', 'data-x': 'no' },
                falseValue: { label: 'No', evil: 'x' },
            };

            const result = validateBadgeConfig(config, TEST_STORE_ID, 'k');
            const trueValue = result.trueValue as unknown as Record<string, unknown>;
            const falseValue = result.falseValue as unknown as Record<string, unknown>;

            expect(trueValue.label).toBe('Yes');
            expect(trueValue).not.toHaveProperty('unknownKey');
            // data-* is not allowed inside entries either (preserveDataAttributes=false)
            expect(trueValue).not.toHaveProperty('data-x');
            expect(falseValue.label).toBe('No');
            expect(falseValue).not.toHaveProperty('evil');
        });
    });
});
