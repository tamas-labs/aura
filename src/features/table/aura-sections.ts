import { h, type VNode, type ComponentPublicInstance } from 'vue';
import type { useCoreStore } from '../../state';
import type { PaginationMeta } from '../../types/api-response.types';
import { ErrorHandler } from '../error-handler/ErrorHandler';
import {
    Toolbar,
    TableHeader,
    TableBody,
    TableFooter,
    Pagination,
    DestroyModal,
} from './components';

/**
 * The bindings `Aura`'s `setup()` hands to its `render()`.
 *
 * Writing the contract down is half the point of this module. Vue infers the render
 * function's `this` from whatever `setup` happened to return, so before this interface
 * existed the only record of the contract was the destructuring statement at the top of
 * `render()` — and a binding dropped from `setup` would have arrived as `undefined` at
 * runtime rather than as a type error. Each section below takes the whole context instead
 * of a hand-picked argument list: the sections move together with `setup`, and a
 * per-section parameter list would be a second copy of this same contract.
 */
export interface AuraRenderContext {
    /**
     * Config + error stores for this table instance.
     *
     * Derived from `useCoreStore` rather than written out as `CoreStore`: the exported
     * interface is a narrower, public-facing view of the store (its `ErrorHandlerStore`
     * lists neither `clearByComponent` nor the severity buckets), so spelling it out here
     * would describe a store the sections cannot actually use.
     */
    core: ReturnType<typeof useCoreStore>;
    /** Whether a `critical`/`error` severity problem is blocking the table. */
    hasCriticalOrError: boolean;
    /** Whether a non-blocking `warning`/`info`/`debug` problem should be banner-ed. */
    hasNonCriticalErrors: boolean;
    /** Page-size selector handler. */
    onRowsChange: (value: number) => void;
    /** Retry handler of the blocking error state. */
    onRetry: () => void;
    /** Pagination meta of the page on screen, or `null` while there is none. */
    paginationMeta: PaginationMeta | null;
    /** Rows per page. */
    rowsNumber: number;
    /** Page-change handler. */
    onPageChange: (page: number) => void;
    /** Store identifier every child component is keyed by. */
    storeId: string;
    /** The `<table>` class list, config defaults merged with `body.settings`. */
    tableClasses: string;
    /** Whether the dimming loading overlay is on screen (delayed). */
    showOverlay: boolean;
    /** Whether the thin progress bar is on screen (undelayed). */
    showLoadingBar: boolean;
    /** Whether a request is in flight, independent of what is drawn for it. */
    isBusy: boolean;
    /** Height held for the table area, or `0` before the first measurement. */
    reservedHeight: number;
    /** Function ref that hands the table area element back to `setup`. */
    setTableAreaEl: (el: Element | ComponentPublicInstance | null) => void;
}

/**
 * The blocking error state, rendered *instead of* the whole table.
 *
 * A `critical`/`error` severity problem replaces everything — the Toolbar and its refresh
 * button included — so the retry button below the error list is the only control the user
 * has left. Without it a transient failure (a 500, a dropped connection) could only be
 * recovered from by reloading the page.
 *
 * @param context - The render context
 * @returns The full-area error state
 */
export function renderBlockingErrorState(context: AuraRenderContext): VNode {
    const { core, onRetry } = context;

    return h(
        'div',
        {
            class: 'aura-error-state',
            'data-testid': 'aura-critical-error',
        },
        [
            h('div', { class: 'container mt-4' }, [
                h(ErrorHandler, {
                    errorStore: core.errorStore,
                    severityFilter: ['critical', 'error'],
                    showDismissAll: true,
                    maxVisible: 10,
                    labels: core.config.labels,
                }),
                h('div', { class: 'd-flex justify-content-end' }, [
                    h(
                        'button',
                        {
                            type: 'button',
                            class: 'btn btn-primary',
                            onClick: onRetry,
                            'data-testid': 'aura-error-retry',
                        },
                        [
                            h('i', {
                                class: 'fa-solid fa-rotate-right me-1',
                                'aria-hidden': 'true',
                            }),
                            core.config.labels.retry,
                        ]
                    ),
                ]),
            ]),
        ]
    );
}

/**
 * The non-blocking error banner above the table.
 *
 * @param context - The render context
 * @returns The warning/info/debug error list
 */
export function renderWarningBanner(context: AuraRenderContext): VNode {
    const { core } = context;

    return h(ErrorHandler, {
        errorStore: core.errorStore,
        severityFilter: ['warning', 'info', 'debug'],
        showDismissAll: true,
        maxVisible: 5,
        labels: core.config.labels,
    });
}

/**
 * The toolbar: page-size selector, search box and action buttons.
 *
 * @param context - The render context
 * @param paginateValues - The configured page-size options, already known to be present
 * @returns The toolbar
 */
export function renderToolbar(context: AuraRenderContext, paginateValues: number[]): VNode {
    const { storeId, rowsNumber, onRowsChange } = context;

    return h(Toolbar, {
        storeId: storeId,
        paginateValues: paginateValues,
        rowsNumber: rowsNumber,
        onRowsChange: onRowsChange,
    });
}

/**
 * The thin indeterminate progress bar pinned to the top edge of the table area.
 *
 * It carries no `aria-valuenow`, which is what marks a progressbar as indeterminate;
 * `aria-busy` on the table itself already says *what* is being updated.
 *
 * @param context - The render context
 * @returns The progress bar
 */
function renderLoadingBar(context: AuraRenderContext): VNode {
    return h(
        'div',
        {
            class: 'aura-loading-bar',
            role: 'progressbar',
            'aria-label': context.core.config.labels.loading,
            'data-testid': 'aura-loading-bar',
        },
        [h('div', { class: 'aura-loading-bar__indicator' })]
    );
}

/**
 * The dimming overlay with the centered spinner.
 *
 * Rendered as a sibling of the scroll container rather than a child of it: inside
 * `table-responsive` it would scroll away horizontally with the content instead of
 * covering what is on screen.
 *
 * @param context - The render context
 * @returns The loading overlay
 */
function renderLoadingOverlay(context: AuraRenderContext): VNode {
    return h(
        'div',
        {
            class: 'aura-loading-overlay d-flex align-items-center justify-content-center',
            'data-testid': 'aura-loading-overlay',
        },
        [
            h('div', { class: 'spinner-border text-primary', role: 'status' }, [
                h('span', { class: 'visually-hidden' }, context.core.config.labels.loading),
            ]),
        ]
    );
}

/**
 * The table itself (header, body, footer) plus the two loading indicators.
 *
 * The wrapper reserves the measured height of a full page so the pagination below it
 * stays put: without it the last page — the one page allowed to be short — pulls the
 * controls up by the height of the missing rows, right as the user is about to click.
 *
 * @param context - The render context
 * @returns The positioned table area
 */
export function renderTableArea(context: AuraRenderContext): VNode {
    const { storeId, tableClasses, isBusy, showLoadingBar, showOverlay, reservedHeight } = context;

    const tableArea: VNode[] = [
        h(
            'div',
            {
                class: 'table-responsive',
                'data-testid': 'aura-table-wrapper',
            },
            [
                h(
                    'table',
                    {
                        class: tableClasses,
                        'data-testid': 'aura-table',
                        // Tells assistive technology the content is being updated, so a
                        // partially rendered table is not announced as the final result.
                        'aria-busy': isBusy ? 'true' : 'false',
                    },
                    [
                        h(TableHeader, { storeId }),
                        h(TableBody, { storeId }),
                        h(TableFooter, { storeId }),
                    ]
                ),
            ]
        ),
    ];

    if (showLoadingBar) tableArea.push(renderLoadingBar(context));
    if (showOverlay) tableArea.push(renderLoadingOverlay(context));

    return h(
        'div',
        {
            class: 'position-relative aura-table-area',
            // Only set once a full page has actually been measured; an unmeasured
            // table must not be pinned to 0.
            style: reservedHeight > 0 ? { minHeight: `${reservedHeight}px` } : undefined,
            ref: context.setTableAreaEl,
        },
        tableArea
    );
}

/**
 * The pagination control below the table.
 *
 * @param context - The render context
 * @param meta - The pagination meta of the page on screen
 * @returns The pagination
 */
export function renderPagination(context: AuraRenderContext, meta: PaginationMeta): VNode {
    return h(Pagination, {
        storeId: context.storeId,
        meta,
        onPageChange: context.onPageChange,
    });
}

/**
 * The built-in destroy confirmation modal, always mounted.
 *
 * @param context - The render context
 * @returns The destroy modal
 */
export function renderDestroyModal(context: AuraRenderContext): VNode {
    return h(DestroyModal, { storeId: context.storeId });
}
