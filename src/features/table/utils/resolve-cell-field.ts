import type { HeaderCell } from '../../../types';

/**
 * Resolves which field a column's data operations (sorting, searching, filtering)
 * should target.
 *
 * Priority order:
 * 1. `reference` — explicit redirect (e.g. with multiple `fields`, which field
 *    search/filter/sort should target).
 * 2. `field` — the column's primary data field.
 * 3. `key` — the column's unique identifier (always present).
 *
 * @param cell - The header cell configuration.
 * @returns The field key to use for the operation.
 *
 * @example
 * ```ts
 * resolveCellField({ key: 'name', field: 'user.name' }); // 'user.name'
 * resolveCellField({ key: 'name', field: 'user.name', reference: 'user.id' }); // 'user.id'
 * resolveCellField({ key: 'status' }); // 'status'
 * ```
 */
export function resolveCellField(cell: Pick<HeaderCell, 'reference' | 'field' | 'key'>): string {
    return cell.reference || cell.field || cell.key;
}
