import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateLabels } from '../labels.schema';
import { useErrorHandlerStore } from '../../../../state/core/error-handler.state';
import { DEFAULT_LABELS } from '../../../../lib/default-values.lib';

describe('validateLabels', () => {
    const storeId = 'test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('Valid cases', () => {
        it('should return a full copy of DEFAULT_LABELS for null', () => {
            const result = validateLabels(null, storeId);

            expect(result).toEqual(DEFAULT_LABELS);
            // New object, not the default reference
            expect(result).not.toBe(DEFAULT_LABELS);
        });

        it('should return DEFAULT_LABELS for undefined', () => {
            const result = validateLabels(undefined, storeId);

            expect(result).toEqual(DEFAULT_LABELS);
        });

        it('should merge a partial override onto the English defaults', () => {
            const result = validateLabels({ cancel: 'Mégsem', confirmDelete: 'Törlés' }, storeId);

            // The overridden keys
            expect(result.cancel).toBe('Mégsem');
            expect(result.confirmDelete).toBe('Törlés');
            // The keys not provided fall back to the English default
            expect(result.confirmDeleteTitle).toBe(DEFAULT_LABELS.confirmDeleteTitle);
            expect(result.refresh).toBe('Refresh');
        });

        it('should allow an empty string value (intentionally hidden label)', () => {
            const result = validateLabels({ search: '' }, storeId);

            expect(result.search).toBe('');
            // The rest remain default
            expect(result.clearSearch).toBe(DEFAULT_LABELS.clearSearch);
        });

        it('should keep the pagination info template with tokens', () => {
            const result = validateLabels(
                { paginationInfo: '{from}–{to} / {total} elem' },
                storeId
            );

            expect(result.paginationInfo).toBe('{from}–{to} / {total} elem');
        });

        it('should not log an error for a valid partial override', () => {
            validateLabels({ refresh: 'Frissítés' }, storeId);

            const errorStore = useErrorHandlerStore(storeId);
            expect(errorStore.errors).toHaveLength(0);
        });
    });

    describe('Invalid cases', () => {
        it('should fall back to DEFAULT_LABELS and log a warning for a non-string value', () => {
            const result = validateLabels({ cancel: 123 }, storeId);

            expect(result).toEqual(DEFAULT_LABELS);

            const errorStore = useErrorHandlerStore(storeId);
            expect(errorStore.errors.length).toBeGreaterThan(0);
            expect(errorStore.errors[0]?.severity).toBe('warning');
            expect(errorStore.errors[0]?.key).toBe('labels');
        });

        it('should fall back to DEFAULT_LABELS for a non-object value', () => {
            const result = validateLabels('not-an-object', storeId);

            expect(result).toEqual(DEFAULT_LABELS);
        });
    });

    describe('emptyState (deprecated alias support)', () => {
        // `emptyState` is the one label deliberately missing from DEFAULT_LABELS: since
        // validateLabels fills in every default key, a default here would always win over
        // the deprecated `emptyStateMessage` config key and silently disable it.
        it('should not define emptyState in DEFAULT_LABELS', () => {
            expect('emptyState' in DEFAULT_LABELS).toBe(false);
        });

        it('should leave emptyState undefined when it was not provided', () => {
            const result = validateLabels({ cancel: 'Cancel' }, storeId);

            expect(result.emptyState).toBeUndefined();
        });

        it('should keep an explicitly provided emptyState', () => {
            const result = validateLabels({ emptyState: 'Nothing here' }, storeId);

            expect(result.emptyState).toBe('Nothing here');
        });

        it('should keep an explicitly empty emptyState distinguishable from unset', () => {
            const result = validateLabels({ emptyState: '' }, storeId);

            expect(result.emptyState).toBe('');
        });
    });
});
