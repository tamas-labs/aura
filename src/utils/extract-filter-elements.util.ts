import type { Header, HeaderRow, HeaderCell } from '../types/api-response.types';
import { resolveValue } from './resolve-value.util';

/**
 * Extracts and sets unique filter elements from items for filterable columns.
 *
 * Iterates through header cells. If a cell is `filterable: true` but has no `elements`,
 * it collects unique values from the `items` array based on the cell's `field`.
 * Only string and number values are collected.
 *
 * A `date: true` cell is skipped: it renders a calendar filter (`FilterCalendar`) instead
 * of a checkbox list, so a distinct-value list would be collected for nothing — and for a
 * date column that list is exactly the high-cardinality case the calendar exists to avoid.
 *
 * @param header - The table header configuration
 * @param items - The data items array
 * @returns A new header object with populated elements, or the original header if no changes needed
 *
 * @example
 * ```typescript
 * const header = { rows: [{ cells: [{ field: 'status', filterable: true }] }] };
 * const items = [{ status: 'active' }, { status: 'inactive' }];
 * const newHeader = extractFilterElements(header, items);
 * // newHeader.rows[0].cells[0].elements = ['active', 'inactive']
 * ```
 */
export const extractFilterElements = (
    header: Header | null,
    items: unknown[] | null
): Header | null => {
    if (!header || !header.rows || !items || items.length === 0) {
        return header;
    }

    let hasChanges = false;

    // Deep clone rows to avoid mutation of the original header
    // We only clone rows structure, individual cells will be cloned if modified
    const newRows: HeaderRow[] = header.rows.map(row => ({
        ...row,
        cells: row.cells ? [...row.cells] : [],
    }));

    newRows.forEach(row => {
        if (!row.cells) return;

        row.cells.forEach((cell, cellIndex) => {
            // Check if cell is filterable and elements are missing
            if (
                cell.filterable === true &&
                cell.date !== true &&
                (cell.elements === null || cell.elements === undefined)
            ) {
                const field = cell.field;
                if (!field) return;

                // Collect unique values
                const values = new Set<string | number>();

                items.forEach(item => {
                    const value = resolveValue(item, field);
                    if (typeof value === 'string' || typeof value === 'number') {
                        values.add(value);
                    }
                });

                if (values.size > 0) {
                    // Convert to array and sort
                    const sortedValues = Array.from(values).sort((a, b) => {
                        if (typeof a === 'number' && typeof b === 'number') {
                            return a - b;
                        }
                        return String(a).localeCompare(String(b));
                    });

                    // Create a new cell object and update the row
                    // We assert row.cells is defined because we checked earlier
                    const newCell: HeaderCell = {
                        ...cell,
                        elements: sortedValues,
                    };

                    if (row.cells) {
                        row.cells[cellIndex] = newCell;
                    }
                    hasChanges = true;
                }
            }
        });
    });

    if (hasChanges) {
        return {
            ...header,
            rows: newRows,
        };
    }

    return header;
};
