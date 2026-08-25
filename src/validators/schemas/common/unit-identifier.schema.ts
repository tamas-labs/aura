import { UnitIdentifierZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';

/**
 * Unit Identifier validation schema
 * - Validates unit identifiers supported by Intl.NumberFormat
 * - Supports nullable values
 * - Error handling via errorStore
 * - No default value (null fallback)
 *
 * @example
 * ```ts
 * validateUnitIdentifier('kilogram', 'store-id'); // 'kilogram'
 * validateUnitIdentifier('kg', 'store-id'); // null (invalid) + error logged
 * validateUnitIdentifier(null, 'store-id'); // null
 * ```
 */
export const validateUnitIdentifier = (value: unknown, errorStoreId: string): string | null => {
    try {
        return UnitIdentifierZod().parse(value) as string | null;
    } catch (error) {
        const errorStore = getErrorSink(errorStoreId);

        errorStore.addSchemaValidationError(
            'UnitIdentifierValidator',
            'Invalid unit identifier provided',
            'unit',
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            {
                note: "Must be a valid Intl.NumberFormat unit string (e.g., 'kilogram', 'celsius', 'percent')",
            }
        );

        return null;
    }
};
