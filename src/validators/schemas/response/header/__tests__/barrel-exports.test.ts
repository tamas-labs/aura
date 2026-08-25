import { describe, it, expect } from 'vitest';

/**
 * Barrel Export Optimization Tests
 *
 * Verifies that the barrel file (index.ts) only exports lazy validators,
 * and the synchronous validators are not accessible through the public API.
 * This ensures tree-shaking effectiveness and bundle size optimization.
 */
describe('Barrel Exports (Tree-shaking Optimization)', () => {
    describe('Public API exports (from barrel)', () => {
        it('should export lazyValidateHeader', async () => {
            const module = await import('../index');
            expect(module.lazyValidateHeader).toBeDefined();
            expect(typeof module.lazyValidateHeader).toBe('function');
        });

        it('should export lazyValidateHeaderRows', async () => {
            const module = await import('../index');
            expect(module.lazyValidateHeaderRows).toBeDefined();
            expect(typeof module.lazyValidateHeaderRows).toBe('function');
        });

        it('should export lazyValidateHeaderCells', async () => {
            const module = await import('../index');
            expect(module.lazyValidateHeaderCells).toBeDefined();
            expect(typeof module.lazyValidateHeaderCells).toBe('function');
        });

        it('should export lazyValidateHeaderCell', async () => {
            const module = await import('../index');
            expect(module.lazyValidateHeaderCell).toBeDefined();
            expect(typeof module.lazyValidateHeaderCell).toBe('function');
        });
    });

    describe('Internal validators (should NOT be exported from barrel)', () => {
        it('should NOT export validateHeader (sync version)', async () => {
            const module = await import('../index');
            expect((module as Record<string, unknown>).validateHeader).toBeUndefined();
        });

        it('should NOT export validateHeaderRows (sync version)', async () => {
            const module = await import('../index');
            expect((module as Record<string, unknown>).validateHeaderRows).toBeUndefined();
        });

        it('should NOT export validateHeaderCells (sync version)', async () => {
            const module = await import('../index');
            expect((module as Record<string, unknown>).validateHeaderCells).toBeUndefined();
        });

        it('should NOT export validateHeaderCell (sync version)', async () => {
            const module = await import('../index');
            expect((module as Record<string, unknown>).validateHeaderCell).toBeUndefined();
        });
    });

    describe('Direct imports (internal modules still accessible)', () => {
        it('should allow direct import of validateHeader from .schema file', async () => {
            const module = await import('../header.schema');
            expect(module.validateHeader).toBeDefined();
            expect(typeof module.validateHeader).toBe('function');
        });

        it('should allow direct import of validateHeaderRows from .schema file', async () => {
            const module = await import('../header-rows.schema');
            expect(module.validateHeaderRows).toBeDefined();
            expect(typeof module.validateHeaderRows).toBe('function');
        });

        it('should allow direct import of validateHeaderCells from .schema file', async () => {
            const module = await import('../header-cells.schema');
            expect(module.validateHeaderCells).toBeDefined();
            expect(typeof module.validateHeaderCells).toBe('function');
        });

        it('should allow direct import of validateHeaderCell from .schema file', async () => {
            const module = await import('../header-cell.schema');
            expect(module.validateHeaderCell).toBeDefined();
            expect(typeof module.validateHeaderCell).toBe('function');
        });
    });

    describe('Barrel export count validation', () => {
        it('should export exactly 4 lazy validators (no more, no less)', async () => {
            const module = await import('../index');
            const exportedKeys = Object.keys(module);

            // Only lazy validators should be exported
            const expectedExports = [
                'lazyValidateHeader',
                'lazyValidateHeaderRows',
                'lazyValidateHeaderCells',
                'lazyValidateHeaderCell',
            ];

            // Check that every expected export is present
            expectedExports.forEach(exportName => {
                expect(exportedKeys).toContain(exportName);
            });

            // Check that there is no extra export (sync validators)
            expect(exportedKeys.length).toBe(expectedExports.length);
        });
    });

    describe('Module structure validation', () => {
        it('should have only lazy.ts re-exported from barrel', async () => {
            const barrelModule = await import('../index');
            const lazyModule = await import('../lazy');

            // The barrel exports the same thing as the lazy module
            expect(barrelModule.lazyValidateHeader).toBe(lazyModule.lazyValidateHeader);
            expect(barrelModule.lazyValidateHeaderRows).toBe(lazyModule.lazyValidateHeaderRows);
            expect(barrelModule.lazyValidateHeaderCells).toBe(lazyModule.lazyValidateHeaderCells);
            expect(barrelModule.lazyValidateHeaderCell).toBe(lazyModule.lazyValidateHeaderCell);
        });
    });
});
