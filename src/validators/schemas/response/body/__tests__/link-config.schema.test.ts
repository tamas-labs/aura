import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { validateLinkConfig } from '../link-config.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-link-config-store';

describe('validateLinkConfig', () => {
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
            const result = validateLinkConfig({ type: 'link', field: 'name' }, TEST_STORE_ID, 'k');
            expect(result).toMatchObject({ type: 'link', field: 'name' });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept full PARAMS.md example config', () => {
            const config = {
                type: 'link',
                field: 'name',
                key: 'id',
                route: '/users/{id}',
            };
            const result = validateLinkConfig(config, TEST_STORE_ID, 'k');
            expect(result.field).toBe('name');
            expect(result.key).toBe('id');
            expect(result.route).toBe('/users/{id}');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept external link with target and rel', () => {
            const result = validateLinkConfig(
                { type: 'link', field: 'website', target: '_blank', rel: 'noopener' },
                TEST_STORE_ID,
                'k'
            );
            expect(result.target).toBe('_blank');
            expect(result.rel).toBe('noopener');
        });
    });

    describe('unknown key stripping', () => {
        it('should strip unknown keys but keep data-* attributes', () => {
            const config = {
                type: 'link',
                field: 'name',
                bogus: 'remove-me',
                'data-user-id': '{id}',
            };
            const result = validateLinkConfig(config, TEST_STORE_ID, 'k') as unknown as Record<
                string,
                unknown
            >;
            expect(result.bogus).toBeUndefined();
            expect(result['data-user-id']).toBe('{id}');
        });
    });

    describe('invalid cases', () => {
        it('should throw and report when no content source is given', () => {
            expect(() => validateLinkConfig({ type: 'link' }, TEST_STORE_ID, 'k')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should throw on invalid target', () => {
            expect(() =>
                validateLinkConfig({ type: 'link', field: 'x', target: '_new' }, TEST_STORE_ID, 'k')
            ).toThrow();
        });
    });

    describe('mapping nested strip', () => {
        it('should keep allowed presentation keys in mapping entries', () => {
            const config = {
                type: 'link',
                field: 'status',
                mapping: { active: { variant: 'success', route: '/a/{id}', target: '_blank' } },
            };
            const result = validateLinkConfig(config, TEST_STORE_ID, 'k');
            const entry = result.mapping?.active as Record<string, unknown> | undefined;
            expect(entry?.variant).toBe('success');
            expect(entry?.route).toBe('/a/{id}');
        });

        it('should strip unknown and data-* keys from mapping entries', () => {
            const config = {
                type: 'link',
                field: 'status',
                mapping: { active: { variant: 'success', evil: 'x', 'data-id': '1' } },
            };
            const result = validateLinkConfig(config, TEST_STORE_ID, 'k');
            const entry = result.mapping?.active as Record<string, unknown> | undefined;
            expect(entry).not.toHaveProperty('evil');
            expect(entry).not.toHaveProperty('data-id');
        });
    });
});
