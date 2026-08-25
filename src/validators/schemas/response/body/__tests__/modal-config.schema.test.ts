import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { validateModalConfig } from '../modal-config.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-modal-config-store';

describe('validateModalConfig', () => {
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
        it('should accept minimal config with type, id and icon shorthand', () => {
            const config = { type: 'modal', id: 'edit-modal', icon: 'pencil' };

            const result = validateModalConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).toMatchObject({ type: 'modal', id: 'edit-modal', icon: 'pencil' });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with button shorthand', () => {
            const config = {
                type: 'modal',
                id: 'confirm-modal',
                button: 'danger',
                value: 'Delete',
            };

            const result = validateModalConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).toMatchObject({
                type: 'modal',
                id: 'confirm-modal',
                button: 'danger',
                value: 'Delete',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with nested content type icon', () => {
            const config = {
                type: 'modal',
                id: 'view-modal',
                content: { type: 'icon', class: ['fas', 'fa-eye'] },
            };

            const result = validateModalConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).toMatchObject({ type: 'modal', id: 'view-modal' });
            expect(result.content).toMatchObject({ type: 'icon', class: ['fas', 'fa-eye'] });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with nested content type button', () => {
            const config = {
                type: 'modal',
                id: 'action-modal',
                content: { type: 'button', variant: 'primary', value: 'Open' },
            };

            const result = validateModalConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).toMatchObject({ type: 'modal', id: 'action-modal' });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept config with nested content type link', () => {
            const config = {
                type: 'modal',
                id: 'link-modal',
                content: { type: 'link', value: 'View details' },
            };

            const result = validateModalConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).toMatchObject({ type: 'modal', id: 'link-modal' });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept full config with all valid fields', () => {
            const config = {
                type: 'modal',
                id: 'full-modal',
                route: '/items/{id}',
                icon: 'edit',
                variant: 'primary',
                size: 'sm',
                alt: 'Edit item',
                title: 'Edit',
                class: ['ms-1'],
                style: 'cursor: pointer;',
                key: 'id',
                cellRules: {
                    key: 'status',
                    if: [{ eq: 'active', background: 'success-subtle' }],
                },
            };

            const result = validateModalConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.type).toBe('modal');
            expect(result.id).toBe('full-modal');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept conditional config with if branches and no root id', () => {
            const config = {
                type: 'modal',
                key: 'status',
                if: [{ eq: 'active', id: 'activate-modal', icon: 'check' }],
            };

            const result = validateModalConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.type).toBe('modal');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept conditional config with else branch and no root id', () => {
            const config = {
                type: 'modal',
                else: { id: 'fallback-modal', icon: 'question' },
            };

            const result = validateModalConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.type).toBe('modal');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should preserve data-* attributes', () => {
            const config = {
                type: 'modal',
                id: 'data-modal',
                icon: 'info',
                'data-action': 'open',
                'data-item-id': '42',
            };

            const result = validateModalConfig(config, TEST_STORE_ID, 'test.key');

            expect((result as any)['data-action']).toBe('open');
            expect((result as any)['data-item-id']).toBe('42');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept nullable optional fields', () => {
            const config = {
                type: 'modal',
                id: 'nullable-modal',
                icon: 'check',
                route: null,
                content: null,
                variant: null,
                size: null,
                target: null,
                alt: null,
                title: null,
                key: null,
                style: null,
                cellRules: null,
            };

            const result = validateModalConfig(config, TEST_STORE_ID, 'test.key');

            expect(result.type).toBe('modal');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // invalid cases — throws + addSchemaValidationError called
    // -------------------------------------------------------------------------
    describe('invalid cases', () => {
        it('should throw and call addSchemaValidationError when id is missing and no conditional', () => {
            const config = { type: 'modal', icon: 'pencil' };

            expect(() => validateModalConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'ModalConfigValidator',
                'Invalid modal column config',
                'test.key',
                config,
                expect.any(String)
            );
        });

        it('should throw and call addSchemaValidationError when no trigger and no conditional', () => {
            const config = { type: 'modal', id: 'modal-1' };

            expect(() => validateModalConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'ModalConfigValidator',
                'Invalid modal column config',
                'test.key',
                config,
                expect.any(String)
            );
        });

        it('should throw when type is wrong', () => {
            const config = { type: 'icon', id: 'modal-1', icon: 'check' };

            expect(() => validateModalConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'ModalConfigValidator',
                'Invalid modal column config',
                'test.key',
                config,
                expect.any(String)
            );
        });

        it('should throw when id is an empty string', () => {
            const config = { type: 'modal', id: '', icon: 'check' };

            expect(() => validateModalConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledTimes(1);
        });

        it('should throw when size is invalid', () => {
            const config = { type: 'modal', id: 'modal-1', icon: 'check', size: 'enormous' };

            expect(() => validateModalConfig(config, TEST_STORE_ID, 'test.key')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledTimes(1);
        });
    });

    // -------------------------------------------------------------------------
    // unknown key stripping
    // -------------------------------------------------------------------------
    describe('unknown key stripping', () => {
        it('should strip keys not in ALLOWED_KEYS (non-data-*)', () => {
            const config = {
                type: 'modal',
                id: 'strip-modal',
                icon: 'check',
                unknownField: 'remove-me',
                anotherExtra: 123,
            };

            const result = validateModalConfig(config, TEST_STORE_ID, 'test.key');

            expect(result).not.toHaveProperty('unknownField');
            expect(result).not.toHaveProperty('anotherExtra');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should keep data-* attributes (not stripped)', () => {
            const config = {
                type: 'modal',
                id: 'data-modal',
                icon: 'check',
                'data-custom': 'keep-me',
            };

            const result = validateModalConfig(config, TEST_STORE_ID, 'test.key');

            expect((result as any)['data-custom']).toBe('keep-me');
        });
    });
});
