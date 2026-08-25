import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateActionButtons } from '../action-buttons.schema';
import { useErrorHandlerStore } from '../../../../state/core/error-handler.state';

describe('validateActionButtons', () => {
    const errorStoreId = 'test-action-buttons';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('valid inputs', () => {
        it('should return parsed value for valid full array', () => {
            const result = validateActionButtons(
                ['refresh', 'export', 'settings'],
                errorStoreId,
                'actionButtons'
            );
            expect(result).toEqual(['refresh', 'export', 'settings']);
        });

        it('should return parsed value for single button', () => {
            const result = validateActionButtons(['refresh'], errorStoreId, 'actionButtons');
            expect(result).toEqual(['refresh']);
        });

        it('should return parsed value for partial array', () => {
            const result = validateActionButtons(
                ['settings', 'export'],
                errorStoreId,
                'actionButtons'
            );
            expect(result).toEqual(['settings', 'export']);
        });

        it('should return empty array for valid empty array', () => {
            const result = validateActionButtons([], errorStoreId, 'actionButtons');
            expect(result).toEqual([]);
        });

        it('should return null for null input', () => {
            const result = validateActionButtons(null, errorStoreId, 'actionButtons');
            expect(result).toBe(null);
        });

        it('should not add errors for valid inputs', () => {
            const errorStore = useErrorHandlerStore(errorStoreId);
            const initialErrorCount = errorStore.errors.length;

            validateActionButtons(['refresh'], errorStoreId, 'actionButtons');

            expect(errorStore.errors.length).toBe(initialErrorCount);
        });
    });

    describe('invalid inputs', () => {
        it('should return partial array for invalid button name (filter invalid)', () => {
            const result = validateActionButtons(
                ['refresh', 'invalid'],
                errorStoreId,
                'actionButtons'
            );
            // Changed behavior: filters out 'invalid', keeps 'refresh'
            expect(result).toEqual(['refresh']);
        });

        it('should return empty array for non-array value', () => {
            const result = validateActionButtons('refresh', errorStoreId, 'actionButtons');
            // Changed behavior: returns empty array
            expect(result).toEqual([]);
        });

        it('should return empty array for number array', () => {
            const result = validateActionButtons([123], errorStoreId, 'actionButtons');
            // Changed behavior: returns empty array (123 is not a valid button)
            expect(result).toEqual([]);
        });

        it('should remove duplicates', () => {
            const result = validateActionButtons(
                ['refresh', 'refresh'],
                errorStoreId,
                'actionButtons'
            );
            // Changed behavior: deduplicates to single 'refresh'
            expect(result).toEqual(['refresh']);
        });

        it('should return empty array for object', () => {
            const result = validateActionButtons({ refresh: true }, errorStoreId, 'actionButtons');
            // Changed behavior: returns empty array
            expect(result).toEqual([]);
        });

        it('should add error for invalid input', () => {
            const errorStore = useErrorHandlerStore(errorStoreId);
            const initialErrorCount = errorStore.errors.length;

            validateActionButtons(['invalid'], errorStoreId, 'actionButtons');

            expect(errorStore.errors.length).toBeGreaterThan(initialErrorCount);
        });

        it('should add error with correct component name', () => {
            const errorStore = useErrorHandlerStore(errorStoreId);

            validateActionButtons(['invalid'], errorStoreId, 'actionButtons');

            const lastError = errorStore.errors[errorStore.errors.length - 1];
            expect(lastError?.component).toBe('ActionButtonsValidator');
        });

        it('should include invalid items in error metadata', () => {
            const errorStore = useErrorHandlerStore(errorStoreId);

            validateActionButtons(['refresh', 'invalid', 123], errorStoreId, 'actionButtons');

            const lastError = errorStore.errors[errorStore.errors.length - 1];
            expect(lastError?.metadata?.invalidItems).toEqual(['invalid', 123]);
            expect(lastError?.metadata?.filteredResult).toEqual(['refresh']);
        });
    });

    describe('edge cases', () => {
        it('should return empty array for undefined', () => {
            const result = validateActionButtons(undefined, errorStoreId, 'actionButtons');
            expect(result).toEqual([]);
        });

        it('should return empty array for boolean', () => {
            const result = validateActionButtons(true, errorStoreId, 'actionButtons');
            expect(result).toEqual([]);
        });

        it('should return empty array for empty string in array', () => {
            const result = validateActionButtons([''], errorStoreId, 'actionButtons');
            expect(result).toEqual([]);
        });

        it('should filter mixed valid/invalid inputs', () => {
            const result = validateActionButtons(
                ['refresh', '', 'export', 'invalid'],
                errorStoreId,
                'actionButtons'
            );
            expect(result).toEqual(['refresh', 'export']);
        });

        it('should handle multiple validation errors without crashing', () => {
            validateActionButtons(['invalid1'], errorStoreId, 'actionButtons');
            validateActionButtons(['invalid2'], errorStoreId, 'actionButtons');
            validateActionButtons([123], errorStoreId, 'actionButtons');

            // Should not throw
            expect(true).toBe(true);
        });
    });
});
