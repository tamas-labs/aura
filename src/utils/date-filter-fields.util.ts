import type { Header } from '../types/api-response.types';
import { resolveCellField } from './resolve-cell-field.util';

/**
 * Field keys of columns that render `FilterCalendar` (`filterable: true, date: true`).
 *
 * `filterItemsByFilter` uses this set to switch a field's client-side filter matching
 * from exact-value comparison to calendar-day matching, since a `FilterCalendar` filter's
 * stored value is a single `yyyy-mm-dd` selection, not one of the row's literal values.
 * Mirrors `TableHeaderCell`'s `isDateFilter` condition and reuses `resolveCellField` so the
 * field key here always matches the one `FilterCalendar`'s `apply` handler filters under.
 *
 * @param header - The table header configuration (`null` while the response hasn't
 *   loaded yet, or on `showFooter`-only tables that borrow the header as a footer).
 * @returns The set of field keys backed by a calendar filter, empty when there are none.
 */
export const collectDateFilterFields = (header: Header | null): Set<string> => {
    const fields = new Set<string>();
    if (!header?.rows) return fields;

    header.rows.forEach(row => {
        row.cells?.forEach(cell => {
            if (cell.filterable === true && cell.date === true) {
                fields.add(resolveCellField(cell));
            }
        });
    });

    return fields;
};
