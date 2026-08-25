import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateSessionState } from '../session-state.schema';
import { useErrorHandlerStore } from '../../../../state/core/error-handler.state';

describe('validateSessionState', () => {
    const TEST_STORE_ID = 'test-store-errors';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('valid cases', () => {
        it('should accept and return valid session state', () => {
            const validState = {
                page: 1,
                limit: 10,
                sortItems: [{ field: 'name', direction: 'asc' as const }],
                searchItems: [{ field: 'email', term: 'test' }],
                globalSearchTerm: 'search',
            };

            const result = validateSessionState(validState, TEST_STORE_ID);
            expect(result).toEqual(validState);
        });

        it('should accept session with empty arrays', () => {
            const validState = {
                page: 1,
                limit: 10,
                sortItems: [],
                searchItems: [],
                globalSearchTerm: null,
            };

            const result = validateSessionState(validState, TEST_STORE_ID);
            expect(result).toEqual(validState);
        });

        it('should accept session with null globalSearchTerm', () => {
            const validState = {
                page: 5,
                limit: 25,
                sortItems: [],
                searchItems: [],
                globalSearchTerm: null,
            };

            const result = validateSessionState(validState, TEST_STORE_ID);
            expect(result).toEqual(validState);
        });

        it('should not add error to store when input is valid', () => {
            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            const validState = {
                page: 1,
                limit: 10,
                sortItems: [],
                searchItems: [],
                globalSearchTerm: null,
            };

            validateSessionState(validState, TEST_STORE_ID);
            expect(errorStore.errors.length).toBe(0);
        });

        it('should accept complex session state', () => {
            const validState = {
                page: 3,
                limit: 50,
                sortItems: [
                    { field: 'name', direction: 'asc' as const },
                    { field: 'email', direction: 'desc' as const },
                ],
                searchItems: [
                    { field: 'name', term: 'John' },
                    { field: 'email', term: 'test@example.com', exact: true },
                ],
                globalSearchTerm: 'global search',
            };

            const result = validateSessionState(validState, TEST_STORE_ID);
            expect(result).toEqual(validState);
        });
    });

    describe('invalid cases', () => {
        it('should return null for null input', () => {
            const result = validateSessionState(null, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for undefined input', () => {
            const result = validateSessionState(undefined, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for invalid object', () => {
            const invalidState = { page: 'invalid', limit: 10 };
            const result = validateSessionState(invalidState, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for missing required field (page)', () => {
            const invalidState = {
                limit: 10,
                sortItems: [],
                searchItems: [],
                globalSearchTerm: null,
            };
            const result = validateSessionState(invalidState, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for page = 0', () => {
            const invalidState = {
                page: 0,
                limit: 10,
                sortItems: [],
                searchItems: [],
                globalSearchTerm: null,
            };
            const result = validateSessionState(invalidState, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for negative page', () => {
            const invalidState = {
                page: -1,
                limit: 10,
                sortItems: [],
                searchItems: [],
                globalSearchTerm: null,
            };
            const result = validateSessionState(invalidState, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for limit exceeding maximum', () => {
            const invalidState = {
                page: 1,
                limit: 1001,
                sortItems: [],
                searchItems: [],
                globalSearchTerm: null,
            };
            const result = validateSessionState(invalidState, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for empty string globalSearchTerm', () => {
            const invalidState = {
                page: 1,
                limit: 10,
                sortItems: [],
                searchItems: [],
                globalSearchTerm: '',
            };
            const result = validateSessionState(invalidState, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for too many sortItems', () => {
            const sortItems = Array.from({ length: 21 }, (_, i) => ({
                field: `field${i}`,
                direction: 'asc' as const,
            }));

            const invalidState = {
                page: 1,
                limit: 10,
                sortItems,
                searchItems: [],
                globalSearchTerm: null,
            };

            const result = validateSessionState(invalidState, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for invalid sort direction', () => {
            const invalidState = {
                page: 1,
                limit: 10,
                sortItems: [{ field: 'name', direction: 'invalid' }],
                searchItems: [],
                globalSearchTerm: null,
            };

            const result = validateSessionState(invalidState, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for completely invalid type (string)', () => {
            const result = validateSessionState('invalid string', TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for completely invalid type (number)', () => {
            const result = validateSessionState(123, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should return null for array', () => {
            const result = validateSessionState([], TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('error handling', () => {
        it('should add warning to error store on invalid input', () => {
            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            const invalidState = { page: 'invalid' };

            validateSessionState(invalidState, TEST_STORE_ID);

            expect(errorStore.errors.length).toBeGreaterThan(0);
            const error = errorStore.errors[0];
            expect(error?.severity).toBe('warning');
            expect(error?.component).toBe('SessionStateValidator');
            expect(error?.action).toBe('validate');
            expect(error?.key).toBe('sessionState');
        });

        it('should include validation details in error message', () => {
            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            const invalidState = { page: 0, limit: 10 };

            validateSessionState(invalidState, TEST_STORE_ID);

            expect(errorStore.errors.length).toBeGreaterThan(0);
            const error = errorStore.errors[0];
            expect(error?.details).toBeDefined();
            expect(typeof error?.details).toBe('string');
        });

        it('should include received value in metadata', () => {
            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            const invalidState = { page: -1 };

            validateSessionState(invalidState, TEST_STORE_ID);

            expect(errorStore.errors.length).toBeGreaterThan(0);
            const error = errorStore.errors[0];
            expect(error?.metadata?.receivedValue).toEqual(invalidState);
        });

        it('should include note about using default values', () => {
            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            const invalidState = null;

            validateSessionState(invalidState, TEST_STORE_ID);

            expect(errorStore.errors.length).toBeGreaterThan(0);
            const error = errorStore.errors[0];
            expect(error?.metadata?.note).toContain('default values');
        });

        it('should not break on subsequent validations after error', () => {
            const invalidState = null;
            const validState = {
                page: 1,
                limit: 10,
                sortItems: [],
                searchItems: [],
                globalSearchTerm: null,
            };

            validateSessionState(invalidState, TEST_STORE_ID);
            const result = validateSessionState(validState, TEST_STORE_ID);

            expect(result).toEqual(validState);
        });
    });

    describe('edge cases', () => {
        it('should handle extra properties (strip them)', () => {
            const stateWithExtra = {
                page: 1,
                limit: 10,
                sortItems: [],
                searchItems: [],
                globalSearchTerm: null,
                extraField: 'should be removed',
                anotherExtra: 123,
            };

            const result = validateSessionState(stateWithExtra, TEST_STORE_ID);
            expect(result).not.toBeNull();
            if (result) {
                expect(result).not.toHaveProperty('extraField');
                expect(result).not.toHaveProperty('anotherExtra');
            }
        });

        it('should handle session with boundary values', () => {
            const boundaryState = {
                page: 100000,
                limit: 1000,
                sortItems: Array.from({ length: 20 }, (_, i) => ({
                    field: `field${i}`,
                    direction: 'asc' as const,
                })),
                searchItems: Array.from({ length: 50 }, (_, i) => ({
                    field: `field${i}`,
                    term: `term${i}`,
                })),
                globalSearchTerm: 'a'.repeat(500),
            };

            const result = validateSessionState(boundaryState, TEST_STORE_ID);
            expect(result).toEqual(boundaryState);
        });

        it('should handle completely empty object', () => {
            const result = validateSessionState({}, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should provide fallback error message when error details unavailable', () => {
            const errorStore = useErrorHandlerStore(TEST_STORE_ID);

            // Test with a value that will cause validation to fail
            // but exercises the error details fallback path
            const invalidValue = Symbol('test');

            validateSessionState(invalidValue, TEST_STORE_ID);

            expect(errorStore.errors.length).toBeGreaterThan(0);
            const error = errorStore.errors[0];
            expect(error?.details).toBeDefined();
        });
    });
});

/** The zod barrel, addressed exactly as the validator addresses it, so the mock lands. */
const ZOD_BARREL = '../../../zod';

/** The message the validator substitutes when the failure carries no usable issue list. */
const FALLBACK_DETAILS = 'Invalid session data';

/**
 * The `errorDetails` fallback branches.
 *
 * Unlike its siblings, this validator never throws — an unusable session is simply "no
 * session". Its one uncovered spot was the defensive chain
 * `result.error?.issues?.map(…).join(', ') || 'Invalid session data'`: real zod always
 * hands back a populated `issues` array, so every link in that chain is unreachable from
 * any input. The chain exists because the value comes out of `sessionStorage`, i.e. from
 * outside the app, and a shape change in zod must not take the table down with it.
 */
describe('validateSessionState error detail fallbacks', () => {
    const TEST_STORE_ID = 'session-fallback-errors';

    /** Makes `safeParse` fail with the given `error` shape, whatever zod would really do. */
    const mockFailureWith = (error: unknown): void => {
        vi.doMock(ZOD_BARREL, async () => ({
            ...(await vi.importActual<Record<string, unknown>>(ZOD_BARREL)),
            SessionStateZod: { safeParse: () => ({ success: false, error }) },
        }));
        vi.resetModules();
    };

    /** Runs the freshly mocked validator and returns the finding it recorded. */
    const detailsOfFinding = async (): Promise<string | undefined> => {
        const { validateSessionState: validate } = await import('../session-state.schema');
        const errorStore = useErrorHandlerStore(TEST_STORE_ID);

        expect(validate({ page: 1 }, TEST_STORE_ID)).toBeNull();
        expect(errorStore.errors).toHaveLength(1);

        return errorStore.errors[0]?.details;
    };

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    afterEach(() => {
        vi.doUnmock(ZOD_BARREL);
        vi.resetModules();
    });

    it('should fall back when the failure carries no error object', async () => {
        mockFailureWith(undefined);

        expect(await detailsOfFinding()).toBe(FALLBACK_DETAILS);
    });

    it('should fall back when the error object carries no issues', async () => {
        mockFailureWith({});

        expect(await detailsOfFinding()).toBe(FALLBACK_DETAILS);
    });

    it('should fall back when the issue list is empty', async () => {
        // The chain resolves this far and still yields '' — the `||` is what saves it
        mockFailureWith({ issues: [] });

        expect(await detailsOfFinding()).toBe(FALLBACK_DETAILS);
    });

    it('should join the issues when the list is populated', async () => {
        mockFailureWith({
            issues: [
                { path: ['page'], message: 'Expected number' },
                { path: ['sortItems', 0, 'field'], message: 'Required' },
            ],
        });

        expect(await detailsOfFinding()).toBe('page: Expected number, sortItems.0.field: Required');
    });
});
