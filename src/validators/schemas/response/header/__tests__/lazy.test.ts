import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import {
    lazyValidateHeader,
    lazyValidateHeaderRows,
    lazyValidateHeaderCells,
    lazyValidateHeaderCell,
} from '../lazy';

describe('lazy validators', () => {
    const TEST_ERRORS = 'test-errors';
    const TEST_KEY = 'test.key';
    const VALID_CELL = { content: 'ID', field: 'id', key: 'id' };
    const TEST_ERRORS_1 = 'test-errors-1';
    const TEST_ERRORS_2 = 'test-errors-2';
    const TEST_ERRORS_3 = 'test-errors-3';
    const TEST_ERRORS_4 = 'test-errors-4';
    const TEST_SHOULD_BE_FUNCTION = 'should be a function';
    const TEST_SHOULD_RETURN_PROMISE = 'should return a promise';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('lazyValidateHeader', () => {
        it(TEST_SHOULD_BE_FUNCTION, () => {
            expect(typeof lazyValidateHeader).toBe('function');
        });

        it(TEST_SHOULD_RETURN_PROMISE, () => {
            const result = lazyValidateHeader(
                { header: { rows: [{ cells: [VALID_CELL] }] }, items: [] },
                TEST_ERRORS,
                TEST_KEY
            );
            expect(result).toBeInstanceOf(Promise);
        });

        it('should validate valid header without throwing', async () => {
            const validData = {
                header: {
                    rows: [
                        {
                            cells: [VALID_CELL, { content: 'Name', field: 'name', key: 'name' }],
                        },
                    ],
                },
                items: [],
            };

            await expect(
                lazyValidateHeader(validData, TEST_ERRORS, TEST_KEY)
            ).resolves.not.toThrow();
        });

        it('should throw on invalid header structure', async () => {
            const invalidData = {
                header: {},
                items: [],
            };

            await expect(lazyValidateHeader(invalidData, TEST_ERRORS, TEST_KEY)).rejects.toThrow();
        });

        it('should cache module on subsequent calls', async () => {
            const validData = {
                header: {
                    rows: [{ cells: [VALID_CELL] }],
                },
                items: [],
            };

            // First call loads the module
            await lazyValidateHeader(validData, TEST_ERRORS_1, TEST_KEY);

            // Second call should use cached module (faster)
            const start = Date.now();
            await lazyValidateHeader(validData, TEST_ERRORS_2, TEST_KEY);
            const duration = Date.now() - start;

            // Cached call should be very fast (< 50ms even on slow CI)
            expect(duration).toBeLessThan(50);
        });
    });

    describe('lazyValidateHeaderRows', () => {
        it(TEST_SHOULD_BE_FUNCTION, () => {
            expect(typeof lazyValidateHeaderRows).toBe('function');
        });

        it(TEST_SHOULD_RETURN_PROMISE, () => {
            const result = lazyValidateHeaderRows(
                { rows: [{ cells: [VALID_CELL] }] },
                TEST_ERRORS,
                TEST_KEY
            );
            expect(result).toBeInstanceOf(Promise);
        });

        it('should validate valid rows', async () => {
            const validRows = {
                rows: [
                    { cells: [VALID_CELL] },
                    { cells: [{ content: 'Name', field: 'name', key: 'name' }] },
                ],
            };

            await expect(
                lazyValidateHeaderRows(validRows, TEST_ERRORS, TEST_KEY)
            ).resolves.not.toThrow();
        });

        it('should throw on empty rows array', async () => {
            const invalidRows = { rows: [] };

            await expect(
                lazyValidateHeaderRows(invalidRows, TEST_ERRORS, TEST_KEY)
            ).rejects.toThrow();
        });
    });

    describe('lazyValidateHeaderCells', () => {
        it(TEST_SHOULD_BE_FUNCTION, () => {
            expect(typeof lazyValidateHeaderCells).toBe('function');
        });

        it(TEST_SHOULD_RETURN_PROMISE, () => {
            const result = lazyValidateHeaderCells({ cells: [VALID_CELL] }, TEST_ERRORS, TEST_KEY);
            expect(result).toBeInstanceOf(Promise);
        });

        it('should validate valid cells', async () => {
            const validCells = {
                cells: [VALID_CELL, { content: 'Name', field: 'name', key: 'name' }],
            };

            await expect(
                lazyValidateHeaderCells(validCells, TEST_ERRORS, TEST_KEY)
            ).resolves.not.toThrow();
        });

        it('should throw on empty cells array', async () => {
            const invalidCells = { cells: [] };

            await expect(
                lazyValidateHeaderCells(invalidCells, TEST_ERRORS, TEST_KEY)
            ).rejects.toThrow();
        });
    });

    describe('lazyValidateHeaderCell', () => {
        it(TEST_SHOULD_BE_FUNCTION, () => {
            expect(typeof lazyValidateHeaderCell).toBe('function');
        });

        it(TEST_SHOULD_RETURN_PROMISE, () => {
            const result = lazyValidateHeaderCell(VALID_CELL, TEST_ERRORS, 0);
            expect(result).toBeInstanceOf(Promise);
        });

        it('should validate valid cell', async () => {
            await expect(lazyValidateHeaderCell(VALID_CELL, TEST_ERRORS, 0)).resolves.not.toThrow();
        });

        it('should throw on invalid cell (missing required fields)', async () => {
            const invalidCell = { content: 'ID' };

            await expect(lazyValidateHeaderCell(invalidCell, TEST_ERRORS, 0)).rejects.toThrow();
        });
    });

    describe('lazy loading behavior', () => {
        it('should load all validators independently', async () => {
            const validData = {
                header: { rows: [{ cells: [VALID_CELL] }] },
                items: [],
            };
            const validRows = { rows: [{ cells: [VALID_CELL] }] };
            const validCells = { cells: [VALID_CELL] };

            // All should load and validate independently
            await Promise.all([
                lazyValidateHeader(validData, TEST_ERRORS_1, TEST_KEY),
                lazyValidateHeaderRows(validRows, TEST_ERRORS_2, TEST_KEY),
                lazyValidateHeaderCells(validCells, TEST_ERRORS_3, TEST_KEY),
                lazyValidateHeaderCell(VALID_CELL, TEST_ERRORS_4, 0),
            ]);

            // All should succeed
            expect(true).toBe(true);
        });

        it('should handle parallel calls to same validator', async () => {
            const validData = {
                header: { rows: [{ cells: [VALID_CELL] }] },
                items: [],
            };

            // Multiple parallel calls should not cause race conditions
            const results = await Promise.all([
                lazyValidateHeader(validData, TEST_ERRORS_1, TEST_KEY),
                lazyValidateHeader(validData, TEST_ERRORS_2, TEST_KEY),
                lazyValidateHeader(validData, TEST_ERRORS_3, TEST_KEY),
            ]);

            // All should resolve
            expect(results).toHaveLength(3);
        });
    });
});
