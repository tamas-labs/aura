import { z } from 'zod';

/**
 * Labels Zod schema (overriding built-in UI texts)
 * - Flat structure: Record<string, string>
 * - Keys: non-empty strings
 * - Values: string (an empty string is also allowed — this lets a label be intentionally hidden)
 * - Nullable support (falls back to DEFAULT_LABELS)
 * - Partial override: the validator (`validateLabels`) fills in the rest from DEFAULT_LABELS
 *
 * @example
 * ```ts
 * { cancel: 'Cancel', confirmDelete: 'Delete' } // Valid (partial)
 * { search: '' } // Valid (empty = hidden label)
 * null // Valid (fallback to the full default)
 * ```
 */
export const LabelsZod = z
    .record(z.string().min(1, 'Label key cannot be empty'), z.string())
    .nullable();
