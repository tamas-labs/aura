import { defineComponent, h, type PropType } from 'vue';
import type { PaginationMeta } from '../../../../types/api-response.types';
import { PaginationButtons } from './PaginationButtons';
import { PaginationInfo } from './PaginationInfo';
import { DEFAULT_STORE_ID } from '../../../../lib/default-values.lib';

/**
 * Pagination Component
 *
 * Displays pagination controls and status information.
 * Supports both server-side and client-side pagination via PaginationMeta.
 */
export const Pagination = defineComponent({
    name: 'Pagination',
    props: {
        /**
         * The table store id (source of the localized labels)
         */
        storeId: {
            type: String,
            default: DEFAULT_STORE_ID,
        },
        /**
         * Pagination metadata containing current page, total, etc.
         */
        meta: {
            type: Object as PropType<PaginationMeta | null>,
            required: true,
        },
        /**
         * Callback fired when a page is selected
         */
        onPageChange: {
            type: Function as PropType<(page: number) => void>,
            required: true,
        },
    },
    setup(props) {
        return () => {
            if (!props.meta || props.meta.total === 0) {
                return null;
            }

            return h(
                'div',
                {
                    class: 'd-flex justify-content-between align-items-center py-2',
                    'data-testid': 'aura-pagination',
                },
                [
                    // Left: Pages
                    h(PaginationButtons, {
                        storeId: props.storeId,
                        currentPage: props.meta.current_page,
                        lastPage: props.meta.last_page,
                        onPageChange: props.onPageChange,
                    }),

                    // Right: Info
                    h(PaginationInfo, {
                        storeId: props.storeId,
                        from: props.meta.from,
                        to: props.meta.to,
                        total: props.meta.total,
                    }),
                ]
            );
        };
    },
});
