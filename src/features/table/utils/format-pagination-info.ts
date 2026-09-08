/**
 * Substitutes the tokens of the `labels.paginationInfo` template.
 *
 * Used by `PaginationInfo` (below the table), the single place the "showing X-Y of Z"
 * information is rendered.
 *
 * @param template - The label template, e.g. `'Showing {from}-{to} of {total}'`
 * @param from - Index of the first visible record (1-based)
 * @param to - Index of the last visible record
 * @param total - Total number of records
 * @returns The template with the `{from}` / `{to}` / `{total}` tokens replaced
 *
 * @example
 * ```ts
 * formatPaginationInfo('Showing {from}-{to} of {total}', 1, 10, 100);
 * // → 'Showing 1-10 of 100'
 * ```
 */
export function formatPaginationInfo(
    template: string,
    from: number,
    to: number,
    total: number
): string {
    return template
        .replace('{from}', String(from))
        .replace('{to}', String(to))
        .replace('{total}', String(total));
}
