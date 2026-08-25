import { defineComponent, h, type PropType } from 'vue';
import { useExistingCoreStore } from '../../../../state';
import { DEFAULT_STORE_ID } from '../../../../lib/default-values.lib';
import { formatPaginationInfo } from '../../utils/format-pagination-info';

/**
 * PaginationInfo Component
 *
 * The "showing X to Y of Z" line rendered beside the pager. The text comes from the
 * store's `labels.paginationInfo` template (see `formatPaginationInfo`), so it is
 * localizable rather than assembled from hardcoded English fragments.
 *
 * An empty result set — `total === 0`, or a `from`/`to` the API left `null` — renders
 * `labels.noResults` instead, so the row never degrades into "showing null to null".
 */
export const PaginationInfo = defineComponent({
    name: 'PaginationInfo',
    props: {
        /** The table store id (source of the localized labels) */
        storeId: {
            type: String,
            default: DEFAULT_STORE_ID,
        },
        from: {
            type: Number as PropType<number | null>,
            default: null,
        },
        to: {
            type: Number as PropType<number | null>,
            default: null,
        },
        total: {
            type: Number,
            required: true,
        },
    },
    setup(props) {
        const core = useExistingCoreStore(props.storeId);

        return () => {
            const { from, to, total } = props;
            const labels = core.config.labels;

            if (total === 0 || from === null || to === null) {
                return h(
                    'div',
                    {
                        class: 'text-muted small',
                        'data-testid': 'aura-pagination-info',
                    },
                    labels.noResults
                );
            }

            const info = formatPaginationInfo(labels.paginationInfo, from, to, total);

            return h(
                'div',
                {
                    class: 'text-muted small',
                    'data-testid': 'aura-pagination-info',
                },
                info
            );
        };
    },
});
