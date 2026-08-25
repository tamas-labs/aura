import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import {
    lazyValidateStaticConfig,
    lazyValidateIconConfig,
    lazyValidateModalConfig,
    lazyValidateLinkConfig,
    lazyValidateReferenceConfig,
    lazyValidateButtonConfig,
    lazyValidateBadgeConfig,
    lazyValidateProgressConfig,
} from '../lazy';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-lazy-config-store';

/**
 * The per-column-type wrappers in `lazy.ts` (`lazyValidate*Config`) are built around
 * `createLazyValidator`: on first call they dynamically load their own `*.schema` module,
 * then delegate to the `validate*Config` implementation. This test runs parameterized
 * across every wrapper, proving at once that (1) the lazy import path works and
 * (2) validation errors propagate through the wrapper as well.
 */
describe('lazy body config validators', () => {
    const mockAddSchemaValidationError = vi.fn();

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({
            addSchemaValidationError: mockAddSchemaValidationError,
        } as never);
    });

    // The wrapper + its corresponding type literal + a minimal, valid config.
    const cases: Array<{
        name: string;
        wrapper: (
            config: Record<string, unknown>,
            errorStoreId: string,
            configKey: string
        ) => Promise<Record<string, unknown>>;
        validConfig: Record<string, unknown>;
    }> = [
        {
            name: 'lazyValidateStaticConfig',
            wrapper: lazyValidateStaticConfig as never,
            validConfig: { type: 'static', value: 'ID:' },
        },
        {
            name: 'lazyValidateIconConfig',
            wrapper: lazyValidateIconConfig as never,
            validConfig: { type: 'icon', icon: 'star' },
        },
        {
            name: 'lazyValidateModalConfig',
            wrapper: lazyValidateModalConfig as never,
            validConfig: { type: 'modal', id: 'edit-modal', icon: 'pencil' },
        },
        {
            name: 'lazyValidateLinkConfig',
            wrapper: lazyValidateLinkConfig as never,
            validConfig: { type: 'link', route: 'https://example.com' },
        },
        {
            name: 'lazyValidateReferenceConfig',
            wrapper: lazyValidateReferenceConfig as never,
            validConfig: { type: 'reference', field: 'email' },
        },
        {
            name: 'lazyValidateButtonConfig',
            wrapper: lazyValidateButtonConfig as never,
            validConfig: { type: 'button', value: 'Save' },
        },
        {
            name: 'lazyValidateBadgeConfig',
            wrapper: lazyValidateBadgeConfig as never,
            validConfig: {
                type: 'badge',
                mapping: { active: { label: 'Active', variant: 'success' } },
            },
        },
        {
            name: 'lazyValidateProgressConfig',
            wrapper: lazyValidateProgressConfig as never,
            validConfig: { type: 'progress', field: 'completionRate' },
        },
    ];

    describe.each(cases)('$name', ({ wrapper, validConfig }) => {
        it('should lazily load the schema module and resolve a valid config', async () => {
            const result = await wrapper(
                validConfig,
                TEST_STORE_ID,
                'response.body.columnConfigs.col'
            );

            expect(result).toMatchObject(validConfig);
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should strip unknown non-data keys via the lazy path', async () => {
            const result = await wrapper(
                { ...validConfig, evilUnknownKey: 'x' },
                TEST_STORE_ID,
                'response.body.columnConfigs.col'
            );

            expect(result).not.toHaveProperty('evilUnknownKey');
        });

        it('should reject and report an error for an invalid config', async () => {
            await expect(
                wrapper({}, TEST_STORE_ID, 'response.body.columnConfigs.col')
            ).rejects.toThrow();

            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });
    });
});
