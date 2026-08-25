import { LabelsZod } from '../../zod';
import { DEFAULT_LABELS } from '../../../lib/default-values.lib';
import { getErrorSink } from '../../utils/error-sink';
import type { AuraLabels } from '../../../types/config.types';

/**
 * Labels object validation (built-in UI texts)
 * - Validates the structure of the labels object (flat Record<string, string>)
 * - Partial override: fills in keys that were not provided with the DEFAULT_LABELS
 *   English values, so the host only needs to override a string or two
 * - Default / fallback value: DEFAULT_LABELS
 * - Error handling via errorStore (warning severity)
 *
 * @example
 * ```ts
 * validateLabels({ cancel: 'Cancel' }, 'aura-core');
 * // → { ...DEFAULT_LABELS, cancel: 'Cancel' } (the other keys are the English default)
 * ```
 */

/**
 * Labels validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns The full labels object, filled in with DEFAULT_LABELS
 */
export function validateLabels(value: unknown, errorStoreId: string): AuraLabels {
    try {
        const result = LabelsZod.parse(value);

        // If null, return the full default text set
        if (result === null) {
            return { ...DEFAULT_LABELS };
        }

        // Partial override: the missing keys fall back to DEFAULT_LABELS
        return { ...DEFAULT_LABELS, ...(result as Partial<AuraLabels>) };
    } catch (error) {
        // Load the error handler store
        const errorStore = getErrorSink(errorStoreId);

        // Add the error to the error store
        errorStore.addError({
            severity: 'warning',
            component: 'LabelsValidator',
            action: 'validate',
            type: 'validation',
            message: 'Invalid labels object provided',
            details: error instanceof Error ? error.message : 'Unknown validation error',
            key: 'labels',
            metadata: {
                receivedValue: value,
                receivedType: typeof value,
            },
        });

        // Fallback: full default text set
        return { ...DEFAULT_LABELS };
    }
}
