import { describe, it, expect, vi } from 'vitest';
import type { VNode } from 'vue';
import { renderTableArea, type AuraRenderContext } from '../aura-sections';

/**
 * Direct tests for the render sections `Aura`'s `render()` assembles.
 *
 * `Aura.test.tsx` mounts the component and asserts the rendered DOM; these cover what a
 * mounted component cannot reach cheaply. The reserved height is the case in point: it
 * comes from a `ResizeObserver`-driven measurement that never runs in happy-dom, so the
 * `minHeight` reservation — the thing that keeps the pagination from jumping up on the
 * last, short page — had no assertion of its own before the section was extractable.
 */
describe('aura sections', () => {
    /** A context stub with only what `renderTableArea` reads. */
    const contextWith = (reservedHeight: number): AuraRenderContext =>
        ({
            core: { config: { labels: { loading: 'Loading' } } },
            storeId: 'test-store',
            tableClasses: 'table',
            isBusy: false,
            showLoadingBar: false,
            showOverlay: false,
            reservedHeight,
            setTableAreaEl: vi.fn(),
        }) as unknown as AuraRenderContext;

    describe('renderTableArea', () => {
        it('should reserve the measured height once a full page has been measured', () => {
            const area = renderTableArea(contextWith(420));

            expect(area.props?.style).toEqual({ minHeight: '420px' });
        });

        it('should leave the height unset before the first measurement', () => {
            // An unmeasured table must not be pinned to 0 — that would collapse it
            const area = renderTableArea(contextWith(0));

            expect(area.props?.style).toBeUndefined();
        });

        it('should append the loading indicators only when they are requested', () => {
            const withoutIndicators = renderTableArea(contextWith(0));
            const withIndicators = renderTableArea({
                ...contextWith(0),
                showLoadingBar: true,
                showOverlay: true,
            });

            expect((withoutIndicators.children as VNode[]).length).toBe(1);
            expect((withIndicators.children as VNode[]).length).toBe(3);
        });
    });
});
