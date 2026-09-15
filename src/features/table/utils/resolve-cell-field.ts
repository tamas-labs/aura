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

/**
 * Whether a text search on this column must match the whole value.
 *
 * Number columns search exactly — `5` must not find `15` — including the legacy
 * `type: 'number'` spelling. Shared by the header search input and the cell-click search,
 * so a clicked value and a typed one filter the same way.
 *
 * @param cell - The header cell configuration.
 * @returns `true` for a number column.
 */
export function isExactSearchCell(cell: HeaderCell): boolean {
    return cell.number === true || (cell as unknown as Record<string, unknown>).type === 'number';
}
