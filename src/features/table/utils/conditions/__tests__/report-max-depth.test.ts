import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { createMaxDepthReporter } from '../report-max-depth';
import { useCoreStore } from '../../../../../state';
import type { AuraProps } from '../../../../../types';

/**
 * The conditional-config depth cap used to announce itself with a `console.warn`,
 * which the production build strips (`drop_console`). It now lands in the error
 * store, where the host can actually see it.
 */
describe('createMaxDepthReporter', () => {
    const MAX_DEPTH_KEY = 'conditionalConfig.maxDepth';

    let storeCounter = 0;

    const newCore = () => useCoreStore(`max-depth-core-${++storeCounter}`, {} as AuraProps);

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    it('should record a warning in the error store', () => {
        const core = newCore();

        createMaxDepthReporter(core)();

        const recorded = core.errorStore.getErrorsByKey(MAX_DEPTH_KEY);
        expect(recorded).toHaveLength(1);
        expect(recorded[0]?.severity).toBe('warning');
        expect(recorded[0]?.type).toBe('validation');
        expect(recorded[0]?.message).toContain('maximum depth');
    });

    /** Every cell of every row can hit the cap — one entry is enough. */
    it('should record it only once, however many cells hit the cap', () => {
        const core = newCore();
        const report = createMaxDepthReporter(core);

        for (let i = 0; i < 50; i++) report();

        expect(core.errorStore.getErrorsByKey(MAX_DEPTH_KEY)).toHaveLength(1);
    });

    it('should be a no-op without a store', () => {
        expect(() => createMaxDepthReporter(undefined)()).not.toThrow();
    });
});
