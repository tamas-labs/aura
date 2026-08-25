import { resolveValue } from '../../../utils/resolve-value.util';
import type { HeaderCell, RowId } from '../../../types';

/** Default row-id field if the `selectable` column has no `field`. */
const DEFAULT_ROW_ID_FIELD = 'id';

/**
 * Determines which row field provides the unique identifier used for selection.
 * The `selectable` column's `field` is the source; failing that, `id`.
 *
 * @param cell - The `selectable: true` header cell.
 * @returns The name of the row-id field (can also be a dotted path).
 */
export function resolveRowIdField(cell: Pick<HeaderCell, 'field'>): string {
    return cell.field || DEFAULT_ROW_ID_FIELD;
}

/**
 * Resolves a row's unique identifier based on the given field.
 * Only a string/number value is accepted as an identifier (the `selected` contract sends this);
 * everything else (object, null, undefined) → `null` (an unselectable row).
 *
 * @param item - The row's data object.
 * @param field - The identifier field (see {@link resolveRowIdField}).
 * @returns The row's identifier, or `null` if it can't be resolved.
 */
export function resolveRowId(item: unknown, field: string): RowId | null {
    const raw = resolveValue(item, field);
    if (typeof raw === 'string' || typeof raw === 'number') {
        return raw;
    }
    return null;
}
