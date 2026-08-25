import { h, type VNode } from 'vue';
import type { HeaderCell } from '../../../types';
import type { ConfigStore } from '../../../types/store.types';
import { useCellStyles, useFormattedContent, type DataTypesClasses } from '../utils';

/**
 * Shared logic for header and footer cells: `TableFooterCell` and `TableHeaderCell`
 * render the same `HeaderCell` config structure, so the style/formatting composable
 * call and the cell attribute building are shared.
 */

interface CellCore {
    config: ConfigStore;
}

/**
 * Runs the cell-level style and content-formatting composables for a header/footer
 * cell, with identical parameterization.
 *
 * @param cell - Reactive getter for the cell (`HeaderCell`)
 * @param core - The core store (for accessing `config`)
 * @returns `useCellStyles` output (`styles`, `classes`, `styleAttributes`) + `formattedContent`
 */
export function useHeaderFooterCell(cell: () => HeaderCell, core: CellCore) {
    const cellStyles = useCellStyles(
        cell,
        () => core.config.variants,
        () => core.config.classes?.dataTypes as DataTypesClasses | undefined
    );

    const { formattedContent } = useFormattedContent(cell, () => core.config, {
        skipTypeFormatting: true,
    });

    return { ...cellStyles, formattedContent };
}

/**
 * Sets the `colspan`/`rowspan` attributes on the cell's attribute map, if present.
 */
export function applyColspanRowspan(attributes: Record<string, unknown>, cell: HeaderCell): void {
    if (cell.colspan) attributes.colspan = cell.colspan;
    if (cell.rowspan) attributes.rowspan = cell.rowspan;
}

/**
 * The `scope` of a header cell.
 *
 * Every `<th>` has to declare what it labels: without it a screen reader cannot
 * associate a data cell with its header, which is the most basic requirement for
 * data tables (WCAG 1.3.1), and the browser heuristics that stand in for a
 * missing `scope` are not dependable across assistive technologies. A cell that
 * spans several columns labels a group of them, hence `colgroup`.
 *
 * @param cell - The header cell (only `colspan` is read)
 * @returns `'colgroup'` for a spanning cell, `'col'` otherwise
 */
export function resolveHeaderScope(cell: Pick<HeaderCell, 'colspan'>): 'col' | 'colgroup' {
    return cell.colspan && cell.colspan > 1 ? 'colgroup' : 'col';
}

/**
 * The cell's content node: for `raw: true`, a `<span innerHTML>`, otherwise a plain string.
 */
export function buildRawAwareContent(cell: HeaderCell, formatted: string): string | VNode {
    if (cell.raw) return h('span', { innerHTML: formatted });
    return formatted;
}
