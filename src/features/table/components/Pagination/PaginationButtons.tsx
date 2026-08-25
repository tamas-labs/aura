import { defineComponent, h, computed, type PropType, ref } from 'vue';
import { PageJumpDropdown } from './PageJumpDropdown';
import { useExistingCoreStore } from '../../../../state';
import { DEFAULT_STORE_ID } from '../../../../lib/default-values.lib';

/**
 * PaginationButtons Component
 *
 * The page-number pager: first page, a sliding window around the current page with
 * ellipses on either side, and the last page. Up to 7 pages are listed in full; beyond
 * that the window keeps the current page in view while the endpoints stay reachable.
 *
 * The active page button doubles as the trigger of `PageJumpDropdown`, which is how a
 * page outside the window is reached without paging through the ellipsis.
 */
export const PaginationButtons = defineComponent({
    name: 'PaginationButtons',
    props: {
        /** The table store id (source of the localized labels) */
        storeId: {
            type: String,
            default: DEFAULT_STORE_ID,
        },
        currentPage: {
            type: Number,
            required: true,
        },
        lastPage: {
            type: Number,
            required: true,
        },
        onPageChange: {
            type: Function as PropType<(page: number) => void>,
            required: true,
        },
    },
    setup(props) {
        const core = useExistingCoreStore(props.storeId);
        const isDropdownOpen = ref(false);
        const pages = computed(() => {
            const { currentPage, lastPage } = props;

            if (lastPage <= 7) {
                // If 7 or fewer pages, show all (except 1 and lastPage which are handled separately)
                const result = [];
                for (let i = 2; i < lastPage; i++) {
                    result.push(i);
                }
                return result;
            }

            let start: number;
            let end: number;

            if (currentPage <= 4) {
                // Near start
                start = 2;
                end = Math.max(5, currentPage + 2);
            } else if (currentPage >= lastPage - 3) {
                // Near end
                start = Math.min(lastPage - 4, currentPage - 2);
                end = lastPage - 1;
            } else {
                // Middle
                start = currentPage - 2;
                end = currentPage + 2;
            }

            const result = [];
            for (let i = start; i <= end; i++) {
                result.push(i);
            }
            return result;
        });

        const showStartEllipsis = computed(() => {
            const p = pages.value;
            return p.length > 0 && (p[0] ?? 0) > 2;
        });

        const showEndEllipsis = computed(() => {
            const p = pages.value;
            const { lastPage } = props;
            return p.length > 0 && (p[p.length - 1] ?? 0) < lastPage - 1;
        });

        const renderPageButton = (page: number) => {
            const isCurrent = page === props.currentPage;

            if (isCurrent) {
                return h(
                    'li',
                    {
                        class: ['page-item', 'active', 'position-relative'],
                        key: page,
                    },
                    [
                        h(
                            'button',
                            {
                                class: 'page-link',
                                onClick: (e: MouseEvent) => {
                                    e.stopPropagation();
                                    isDropdownOpen.value = !isDropdownOpen.value;
                                },
                                'aria-haspopup': 'dialog',
                                'aria-expanded': isDropdownOpen.value,
                            },
                            page
                        ),
                        h(PageJumpDropdown, {
                            storeId: props.storeId,
                            currentPage: props.currentPage,
                            lastPage: props.lastPage,
                            isOpen: isDropdownOpen.value,
                            onClose: () => {
                                isDropdownOpen.value = false;
                            },
                            onNavigate: (newPage: number) => {
                                props.onPageChange(newPage);
                            },
                        }),
                    ]
                );
            }

            return h(
                'li',
                {
                    class: 'page-item',
                    key: page,
                },
                h(
                    'button',
                    {
                        class: 'page-link',
                        onClick: () => {
                            props.onPageChange(page);
                        },
                    },
                    page
                )
            );
        };

        return () => {
            const { currentPage, lastPage } = props;
            const labels = core.config.labels;

            return h('ul', { class: 'pagination mb-0' }, [
                // Previous Button
                h(
                    'li',
                    {
                        class: ['page-item', { disabled: currentPage === 1 }],
                    },
                    h(
                        'button',
                        {
                            class: 'page-link',
                            onClick: () => {
                                if (currentPage > 1) {
                                    props.onPageChange(currentPage - 1);
                                }
                            },
                            disabled: currentPage === 1,
                            'aria-label': labels.previousPage,
                        },
                        h('span', { 'aria-hidden': 'true' }, '«')
                    )
                ),

                // First Page (Always visible if pages exist)
                lastPage > 0 && renderPageButton(1),

                // Start Ellipsis
                showStartEllipsis.value &&
                    h(
                        'li',
                        { class: 'page-item disabled' },
                        h('span', { class: 'page-link' }, '...')
                    ),

                // Middle Pages
                pages.value.map(page => renderPageButton(page)),

                // End Ellipsis
                showEndEllipsis.value &&
                    h(
                        'li',
                        { class: 'page-item disabled' },
                        h('span', { class: 'page-link' }, '...')
                    ),

                // Last Page (Always visible if > 1)
                lastPage > 1 && renderPageButton(lastPage),

                // Next Button
                h(
                    'li',
                    {
                        class: ['page-item', { disabled: currentPage === lastPage }],
                    },
                    h(
                        'button',
                        {
                            class: 'page-link',
                            onClick: () => {
                                if (currentPage < lastPage) {
                                    props.onPageChange(currentPage + 1);
                                }
                            },
                            disabled: currentPage === lastPage,
                            'aria-label': labels.nextPage,
                        },
                        h('span', { 'aria-hidden': 'true' }, '»')
                    )
                ),
            ]);
        };
    },
});
