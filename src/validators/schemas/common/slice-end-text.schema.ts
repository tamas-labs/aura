import { SliceEndTextZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import { DEFAULT_SLICE_END_TEXT } from '../../../lib/default-values.lib';

/**
 * SliceEndText validation schema
 * - Validates the characters shown at the end of a truncated text
 * - Supports nullable values
 * - Min: 0 characters (empty string is allowed), Max: 10 characters
 * - Default value: DEFAULT_SLICE_END_TEXT
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateSliceEndText('...', 'my-store'); // '...'
 * const result2 = validateSliceEndText('…', 'my-store'); // '…'
 * const result3 = validateSliceEndText('', 'my-store'); // ''
 * const result4 = validateSliceEndText(null, 'my-store'); // null
 * const result5 = validateSliceEndText('very long text here', 'my-store'); // '...' (fallback + error logged)
 * ```
 */

/**
 * SliceEndText validator function
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated slice end text string, or the DEFAULT_SLICE_END_TEXT fallback
 */
export const validateSliceEndText = (value: unknown, errorStoreId: string): string | null => {
    try {
        return SliceEndTextZod().parse(value) as string | null;
    } catch (error) {
        const errorStore = getErrorSink(errorStoreId);

        errorStore.addSchemaValidationError(
            'SliceEndTextValidator',
            'Invalid slice end text provided',
            'sliceEndText',
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            { constraints: { min: 0, max: 10 } }
        );

        return DEFAULT_SLICE_END_TEXT;
    }
};
