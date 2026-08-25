import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { validateReferenceConfig } from '../reference-config.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-reference-config-store';

describe('validateReferenceConfig', () => {
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
            const result = validateReferenceConfig(
                { type: 'reference', field: 'email' },
                TEST_STORE_ID,
                'k'
            );
            expect(result).toMatchObject({ type: 'reference', field: 'email' });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept multi-field PARAMS.md example config', () => {
            const config = {
                type: 'reference',
                fields: ['firstName', 'lastName'],
                separator: ' ',
                class: 'fw-bold',
            };
            const result = validateReferenceConfig(config, TEST_STORE_ID, 'k');
            expect(result.fields).toEqual(['firstName', 'lastName']);
            expect(result.separator).toBe(' ');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept formatted reference (currency)', () => {
            const result = validateReferenceConfig(
                { type: 'reference', field: 'price', currency: true },
                TEST_STORE_ID,
                'k'
            );
            expect(result.currency).toBe(true);
        });
    });

    describe('unknown key stripping', () => {
        it('should strip unknown keys but keep data-* attributes', () => {
            const config = {
                type: 'reference',
                field: 'name',
                bogus: 'remove-me',
                'data-user-id': '{id}',
            };
            const result = validateReferenceConfig(config, TEST_STORE_ID, 'k') as unknown as Record<
                string,
                unknown
            >;
            expect(result.bogus).toBeUndefined();
            expect(result['data-user-id']).toBe('{id}');
        });
    });

    describe('invalid cases', () => {
        it('should throw and report when no value source is given', () => {
            expect(() =>
                validateReferenceConfig({ type: 'reference' }, TEST_STORE_ID, 'k')
            ).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });
    });

    describe('mapping and value support', () => {
        it('should accept and pass through a valid mapping config', () => {
            const config = {
                type: 'reference',
                key: 'status',
                mapping: { active: { label: 'Aktív', color: 'success' } },
            };

            const result = validateReferenceConfig(config, TEST_STORE_ID, 'k');

            expect(result.mapping?.active?.label).toBe('Aktív');
            expect(result.mapping?.active?.color).toBe('success');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept a fixed `value` without field/fields', () => {
            const result = validateReferenceConfig(
                { type: 'reference', value: 'N/A' },
                TEST_STORE_ID,
                'k'
            );

            expect(result.value).toBe('N/A');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    describe('mapping nested strip integration', () => {
        it('should strip unknown keys from a mapping entry', () => {
            const config = {
                type: 'reference',
                key: 'status',
                mapping: { active: { label: 'Aktív', unknownKey: 'gone' } },
            };

            const result = validateReferenceConfig(config, TEST_STORE_ID, 'k');
            const entry = result.mapping?.active as Record<string, unknown> | undefined;

            expect(entry).not.toHaveProperty('unknownKey');
            expect(entry?.label).toBe('Aktív');
        });

        it('should strip data-* attributes from a mapping entry (not allowed inside entries)', () => {
            const config = {
                type: 'reference',
                key: 'status',
                mapping: { active: { label: 'Aktív', 'data-id': '42' } },
            };

            const result = validateReferenceConfig(config, TEST_STORE_ID, 'k');
            const entry = result.mapping?.active as Record<string, unknown> | undefined;

            expect(entry).not.toHaveProperty('data-id');
        });

        it('should strip `variant` from a mapping entry (reference uses `color`, not `variant`)', () => {
            const config = {
                type: 'reference',
                key: 'status',
                mapping: { active: { label: 'Aktív', variant: 'success' } },
            };

            const result = validateReferenceConfig(config, TEST_STORE_ID, 'k');
            const entry = result.mapping?.active as Record<string, unknown> | undefined;

            expect(entry).not.toHaveProperty('variant');
        });

        it('should not throw when mapping is null', () => {
            const config = { type: 'reference', field: 'name', mapping: null };

            expect(() => validateReferenceConfig(config, TEST_STORE_ID, 'k')).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });
});
