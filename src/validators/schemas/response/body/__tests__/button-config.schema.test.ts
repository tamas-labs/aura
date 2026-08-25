import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { validateButtonConfig } from '../button-config.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-button-config-store';

describe('validateButtonConfig', () => {
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
            const result = validateButtonConfig(
                { type: 'button', field: 'name' },
                TEST_STORE_ID,
                'k'
            );
            expect(result).toMatchObject({ type: 'button', field: 'name' });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept the PARAMS.md edit-button example config', () => {
            const config = {
                type: 'button',
                field: 'name',
                key: 'id',
                route: '/users/{id}/edit',
                variant: 'primary',
                size: 'sm',
            };
            const result = validateButtonConfig(config, TEST_STORE_ID, 'k');
            expect(result.route).toBe('/users/{id}/edit');
            expect(result.variant).toBe('primary');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept an icon-only button', () => {
            const result = validateButtonConfig(
                { type: 'button', icon: 'cog', variant: 'outline-secondary', rounded: true },
                TEST_STORE_ID,
                'k'
            );
            expect(result.icon).toBe('cog');
            expect(result.rounded).toBe(true);
        });
    });

    describe('unknown key stripping', () => {
        it('should strip unknown keys but keep data-* attributes', () => {
            const config = {
                type: 'button',
                value: 'X',
                bogus: 'remove-me',
                'data-user-id': '{id}',
            };
            const result = validateButtonConfig(config, TEST_STORE_ID, 'k') as unknown as Record<
                string,
                unknown
            >;
            expect(result.bogus).toBeUndefined();
            expect(result['data-user-id']).toBe('{id}');
        });
    });

    describe('invalid cases', () => {
        it('should throw and report when no content source is given', () => {
            expect(() => validateButtonConfig({ type: 'button' }, TEST_STORE_ID, 'k')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });
    });

    describe('mapping nested strip', () => {
        it('should keep allowed presentation keys in mapping entries', () => {
            const config = {
                type: 'button',
                field: 'state',
                mapping: {
                    locked: { variant: 'danger', disabled: true, icon: 'lock', size: 'sm' },
                },
            };
            const result = validateButtonConfig(config, TEST_STORE_ID, 'k');
            const entry = result.mapping?.locked as Record<string, unknown> | undefined;
            expect(entry?.variant).toBe('danger');
            expect(entry?.disabled).toBe(true);
            expect(entry?.icon).toBe('lock');
        });

        it('should strip unknown and data-* keys from mapping entries', () => {
            const config = {
                type: 'button',
                field: 'state',
                mapping: { locked: { variant: 'danger', evil: 'x', 'data-id': '1' } },
            };
            const result = validateButtonConfig(config, TEST_STORE_ID, 'k');
            const entry = result.mapping?.locked as Record<string, unknown> | undefined;
            expect(entry).not.toHaveProperty('evil');
            expect(entry).not.toHaveProperty('data-id');
        });
    });
});
