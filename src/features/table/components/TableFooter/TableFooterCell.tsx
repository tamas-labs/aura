import { defineComponent, h, type PropType } from 'vue';
import type { HeaderCell } from '../../../../types';
import { useExistingCoreStore } from '../../../../state';
import {
    useHeaderFooterCell,
    applyColspanRowspan,
    buildRawAwareContent,
    resolveHeaderScope,
} from '../header-footer-cell.shared';

/**
 * TableFooterCell Component
 *
 * Renders a single `<td>` element within the table footer.
 * Handles styling, alignment, and content rendering based on the `HeaderCell` configuration.
 * Note: Footer cells use the same configuration structure as Header cells.
 */
export const TableFooterCell = defineComponent({
    name: 'TableFooterCell',
    props: {
        /**
         * The footer cell configuration object.
         * Using HeaderCell type as FooterRow inherits from HeaderRow.
         */
        cell: {
            type: Object as PropType<HeaderCell>,
            required: true,
        },
        /**
         * The index of the cell within the row.
         */
        cellIndex: {
            type: Number,
            required: true,
        },
        /**
         * The store ID.
         */
        storeId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const core = useExistingCoreStore(props.storeId);
        const { styleAttributes, formattedContent } = useHeaderFooterCell(() => props.cell, core);

        return () => {
            const { cell } = props;

            const attributes: Record<string, unknown> = {
                'data-testid': 'table-footer-cell',
                'data-key': cell.key,
                // The footer repeats the column labels, so it labels columns too
                scope: resolveHeaderScope(cell),
                ...styleAttributes.value,
            };

            applyColspanRowspan(attributes, cell);

            const contentNode = buildRawAwareContent(cell, formattedContent.value);

            return h('th', attributes, contentNode);
        };
    },
});
