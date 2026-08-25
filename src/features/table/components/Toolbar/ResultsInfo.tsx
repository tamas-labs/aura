import { defineComponent, h, computed, type PropType } from 'vue';
import type { AuraLabels } from '../../../../types/config.types';
import { DEFAULT_LABELS } from '../../../../lib/default-values.lib';
import { formatPaginationInfo } from '../../utils/format-pagination-info';

/**
 * ResultsInfo Component
 * Displays information about currently visible records.
 *
 * Uses the same `labels.paginationInfo` / `labels.noResults` texts as `PaginationInfo`
 * (the information is identical, only the placement differs) — hence no dedicated
 * label keys of its own.
 *
 * @example
 * ```tsx
 * <ResultsInfo
 *     currentPage={1}
 *     rowsPerPage={10}
 *     totalRecords={100}
 * />
 * ```
 */
export const ResultsInfo = defineComponent({
    name: 'ResultsInfo',
    props: {
        currentPage: { type: Number, required: true },
        rowsPerPage: { type: Number, required: true },
        totalRecords: { type: Number, required: true },
        /**
         * Overridable UI texts (`config.labels`). Missing keys fall back to
         * `DEFAULT_LABELS`, so a partial object is enough.
         */
        labels: {
            type: Object as PropType<Partial<AuraLabels>>,
            default: () => DEFAULT_LABELS,
        },
    },
    setup(props) {
        const infoText = computed(() => {
            if (props.totalRecords === 0) {
                return props.labels.noResults ?? DEFAULT_LABELS.noResults;
            }
            const start = (props.currentPage - 1) * props.rowsPerPage + 1;
            const end = Math.min(props.currentPage * props.rowsPerPage, props.totalRecords);
            return formatPaginationInfo(
                props.labels.paginationInfo ?? DEFAULT_LABELS.paginationInfo,
                start,
                end,
                props.totalRecords
            );
        });

        return () => {
            return h(
                'span',
                {
                    class: 'text-muted small',
                    'data-testid': 'results-info',
                },
                infoText.value
            );
        };
    },
});
