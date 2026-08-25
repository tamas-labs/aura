import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { validateProgressConfig } from '../progress-config.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-progress-config-store';

describe('validateProgressConfig', () => {
    const mockAddSchemaValidationError = vi.fn();

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({
            addSchemaValidationError: mockAddSchemaValidationError,
        } as any);
    });

    describe('valid cases', () => {
        it('should accept a minimal field config', () => {
            const result = validateProgressConfig(
                { type: 'progress', field: 'completionRate', variant: 'success' },
                TEST_STORE_ID,
                'k'
            );
            expect(result).toMatchObject({
                type: 'progress',
                field: 'completionRate',
                variant: 'success',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept the PARAMS.md thresholds example', () => {
            const config = {
                type: 'progress',
                field: 'cpu',
                thresholds: { success: [0, 50], warning: [51, 80], danger: [81, 100] },
                label: true,
                striped: true,
            };
            const result = validateProgressConfig(config, TEST_STORE_ID, 'k');
            expect(result.thresholds?.warning).toEqual([51, 80]);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    describe('unknown key stripping', () => {
        it('should strip unknown keys but keep data-* attributes', () => {
            const config = {
                type: 'progress',
                field: 'v',
                bogus: 'gone',
                'data-id': '{id}',
            };
            const result = validateProgressConfig(config, TEST_STORE_ID, 'k') as unknown as Record<
                string,
                unknown
            >;
            expect(result.bogus).toBeUndefined();
            expect(result['data-id']).toBe('{id}');
        });
    });

    describe('mapping nested strip', () => {
        it('should strip unknown keys from a mapping entry', () => {
            const config = {
                type: 'progress',
                field: 'p',
                mapping: { '0-25': { variant: 'danger', label: 'X', unknownKey: 'gone' } },
            };
            const result = validateProgressConfig(config, TEST_STORE_ID, 'k');
            const entry = result.mapping?.['0-25'] as Record<string, unknown> | undefined;
            expect(entry).toMatchObject({ variant: 'danger', label: 'X' });
            expect(entry).not.toHaveProperty('unknownKey');
        });

        it('should strip data-* attributes from a mapping entry (not allowed inside entries)', () => {
            const config = {
                type: 'progress',
                field: 'p',
                mapping: { '0-25': { variant: 'danger', 'data-id': '1' } },
            };
            const result = validateProgressConfig(config, TEST_STORE_ID, 'k');
            const entry = result.mapping?.['0-25'] as Record<string, unknown> | undefined;
            expect(entry).not.toHaveProperty('data-id');
        });
    });

    describe('invalid cases', () => {
        it('should report an error for a config with no field/value/stacked+bars', () => {
            expect(() =>
                validateProgressConfig({ type: 'progress' }, TEST_STORE_ID, 'k')
            ).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });
    });
});
