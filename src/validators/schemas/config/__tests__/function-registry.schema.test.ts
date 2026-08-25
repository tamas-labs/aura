import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { validateFunctionRegistry } from '../function-registry.schema';
import { useErrorHandlerStore } from '../../../../state/core/error-handler.state';

vi.mock('../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-fn-registry-store';

describe('validateFunctionRegistry', () => {
    const mockAddError = vi.fn();

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({ addError: mockAddError } as any);
    });

    it('returns an empty object for null/undefined', () => {
        expect(validateFunctionRegistry(null, TEST_STORE_ID, 'renderers')).toEqual({});
        expect(validateFunctionRegistry(undefined, TEST_STORE_ID, 'renderers')).toEqual({});
        expect(mockAddError).not.toHaveBeenCalled();
    });

    it('keeps function-valued entries', () => {
        const fnA = () => 'a';
        const fnB = () => 'b';
        const result = validateFunctionRegistry({ a: fnA, b: fnB }, TEST_STORE_ID, 'renderers');
        expect(result).toEqual({ a: fnA, b: fnB });
        expect(mockAddError).not.toHaveBeenCalled();
    });

    it('drops non-function entries with a warning', () => {
        const fnA = () => 'a';
        const result = validateFunctionRegistry(
            { a: fnA, b: 'not-a-fn', c: 42 },
            TEST_STORE_ID,
            'callbacks'
        );
        expect(result).toEqual({ a: fnA });
        expect(mockAddError).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'warning', key: 'callbacks' })
        );
    });

    it('warns and returns empty object for a non-object (array) input', () => {
        const result = validateFunctionRegistry([() => 'x'], TEST_STORE_ID, 'renderers');
        expect(result).toEqual({});
        expect(mockAddError).toHaveBeenCalledWith(
            expect.objectContaining({ severity: 'warning', key: 'renderers' })
        );
    });

    describe('prototype-safety', () => {
        it('returns a prototype-less registry', () => {
            const result = validateFunctionRegistry({ a: () => 'a' }, TEST_STORE_ID, 'renderers');

            expect(Object.getPrototypeOf(result)).toBeNull();
            expect(result['constructor']).toBeUndefined();
            expect(result['toString']).toBeUndefined();
        });

        it('drops entries named after a prototype member with a warning', () => {
            const fnA = () => 'a';
            const evil = () => 'evil';
            const result = validateFunctionRegistry(
                { a: fnA, constructor: evil, prototype: evil },
                TEST_STORE_ID,
                'renderers'
            );

            expect(result).toEqual({ a: fnA });
            expect(mockAddError).toHaveBeenCalledWith(
                expect.objectContaining({
                    severity: 'warning',
                    key: 'renderers',
                    metadata: { reservedKeys: ['constructor', 'prototype'] },
                })
            );
        });

        it('drops an own __proto__ entry without retargeting the prototype', () => {
            // JSON.parse mints a real own `__proto__` data property — the one case where the
            // key can arrive without the host having typed it.
            const result = validateFunctionRegistry(
                JSON.parse('{"__proto__": {"polluted": true}}'),
                TEST_STORE_ID,
                'callbacks'
            );

            expect(Object.getPrototypeOf(result)).toBeNull();
            expect(Object.keys(result)).toEqual([]);
            expect(result['polluted']).toBeUndefined();
            expect(mockAddError).toHaveBeenCalledWith(
                expect.objectContaining({ metadata: { reservedKeys: ['__proto__'] } })
            );
        });
    });
});
