import { getOrigin, getParameter, getHref } from '../utils';
import type {
    ActionButtonItem,
    AuraCustomRenderer,
    AuraCustomCallback,
    AuraLabels,
} from '../types/config.types';

/**
 * Default configuration values
 * These values are static and can be imported without circular dependencies
 */

/** Default store identifier */
export const DEFAULT_STORE_ID = 'aura-core';
/** Default value for debug mode */
export const DEFAULT_DEBUG = false;
/** Default site name */
export const DEFAULT_SITE_NAME = getOrigin();
/** Default URL parameter */
export const DEFAULT_URL_PARAMETER = getParameter();
/** Default href */
export const DEFAULT_HREF = getHref();
/** Default last URL segment */
export const DEFAULT_URL_PARAMETER_LAST_SEGMENT = 'resources';
/** Default URL structure */
export const DEFAULT_URL_STRUCTURE = '{siteName}/{urlParameter}/{urlParameterLastSegment}';
/** Default site token */
export const DEFAULT_SITE_TOKEN = false;

/** Default pagination values */
export const DEFAULT_PAGINATE_VALUES: number[] = [5, 10, 25, 50, 100];
/** Default row count */
export const DEFAULT_ROWS_NUMBER = 10;

/** Default classes */
export const DEFAULT_CLASSES = {
    table: ['table', 'table-striped', 'table-hover', 'mt-2', 'mb-4'],
    icon: ['mx-2'],
    button: ['mx-1'],
    link: ['mx-1'],
    dataTypes: {
        numbers: ['text-end'],
        currency: ['text-end'],
        unit: ['text-end'],
    },
};

/** Default icons */
export const DEFAULT_ICONS = {
    sortable: {
        up: ['fas', 'fa-caret-up'],
        down: ['fas', 'fa-caret-down'],
        both: ['fas', 'fa-sort'],
    },
    filterable: ['fas', 'fa-filter'],
    filterableChecked: ['fas', 'fa-filter-circle-dot'],
    settings: ['fas', 'fa-gears'],
    save: ['fas', 'fa-floppy-disk'],
    close: ['fas', 'fa-circle-left'],
    search: ['fas', 'fa-magnifying-glass'],
    clear: ['fas', 'fa-xmark'],
    destroy: ['fas', 'fa-trash'],
    edit: ['fas', 'fa-pencil'],
    show: ['fas', 'fa-info-circle'],
    switchUser: ['fas', 'fa-user'],
    primary: ['fas', 'fa-file'],
};

/** Default variants */
export const DEFAULT_VARIANTS = {
    primary: 'primary',
    destroy: 'danger',
    edit: 'primary',
    show: 'info',
    switchUser: 'danger',
    danger: 'danger',
    warning: 'warning',
    success: 'success',
    info: 'info',
    secondary: 'secondary',
} as const;

/** Default custom renderer registry (`custom` type) — empty, populated by the host */
export const DEFAULT_RENDERERS: Record<string, AuraCustomRenderer> = {};
/** Default custom callback registry (`custom` type) — empty, populated by the host */
export const DEFAULT_CALLBACKS: Record<string, AuraCustomCallback> = {};

/** Show footer */
export const DEFAULT_SHOW_FOOTER = true;
/** Default action buttons — none; the host opts in to each one explicitly */
export const DEFAULT_ACTION_BUTTONS: ActionButtonItem[] = [];
/** Show header search */
export const DEFAULT_SHOW_HEADER_SEARCH = false;
/** Show the built-in loading overlay while a request is in flight */
export const DEFAULT_SHOW_LOADING_OVERLAY = true;
/**
 * Show the thin indeterminate progress bar while a request is in flight.
 *
 * Off by default, and only honoured while the overlay is switched off — the two
 * indicators are mutually exclusive and the overlay wins.
 */
export const DEFAULT_SHOW_LOADING_BAR = false;
/**
 * How long a request may run before the blocking overlay is shown, in ms.
 *
 * A fast response would otherwise make the veil flash for a frame or two, which
 * reads as flicker rather than as feedback. Requests that finish inside this
 * window draw no indicator at all; `aria-busy` still reports them.
 * Not a config key on purpose — same reasoning as `CELL_INPUT_DEBOUNCE_MS`.
 */
export const LOADING_OVERLAY_DELAY_MS = 250;
/** Show toolbar title */
export const DEFAULT_SHOW_TOOLBAR_TITLE = false;
/** Toolbar title text (empty = fallback) */
export const DEFAULT_TOOLBAR_TITLE_CONTENT = '';
/** Use external paginator */
export const DEFAULT_EXTERNAL_PAGINATOR = false;
/** Load resources */
export const DEFAULT_RESOURCES = false;
/** Default request method */
export const DEFAULT_REQUEST_METHOD = 'POST' as const;
/** Default date style */
export const DEFAULT_DATE_STYLE = 'short' as const;
/** Default time zone */
export const DEFAULT_TIME_ZONE = 'Europe/Budapest';
/** Default UTC offset */
export const DEFAULT_UTC_OFFSET = '+02:00';
/** Default localization (Intl locale for number/date formatting; public package → English default) */
export const DEFAULT_LOCALIZATION = 'en-US';
/** Default currency */
export const DEFAULT_CURRENCY_CODE = 'HUF';
/** Disable session */
export const DEFAULT_DISABLE_SESSION = false;
/** sessionStorage key override — null means "derive it from the storeId" */
export const DEFAULT_SESSION_KEY = null;
/** Text truncation end marker */
export const DEFAULT_SLICE_END_TEXT = '...';
/** Empty state message (public package → English default) */
export const DEFAULT_EMPTY_STATE_MESSAGE = 'No data available to display.';
/** Allow external API */
export const DEFAULT_ALLOW_EXTERNAL_API = false;
/** Enable error reporting */
export const DEFAULT_ERROR_REPORTING = false;
/** Error reporting endpoint */
export const DEFAULT_ERROR_REPORTING_ENDPOINT = '';
/** Error reporting service — the only one with an actual transport */
export const DEFAULT_ERROR_REPORTING_SERVICE = 'custom' as const;
/**
 * Accepted service names without a transport of their own.
 *
 * They used to have a `sendTo*` branch in the reporter that did nothing but
 * `console.warn` — which the production build strips (`drop_console`), so
 * picking one discarded every error without a trace. Both the reporter (which
 * normalizes them to `custom`) and the config validator (which reports the
 * substitution) read this list, so the two cannot disagree about what
 * "implemented" means.
 */
export const UNIMPLEMENTED_ERROR_REPORTING_SERVICES = ['sentry', 'logrocket', 'rollbar'] as const;
/** Error reporting API key */
export const DEFAULT_ERROR_REPORTING_API_KEY = '';

/**
 * Ignore diacritics while searching.
 *
 * Off by default: turning it on changes which rows match, so an existing table
 * must not have its result set shift under it on an upgrade.
 */
export const DEFAULT_ACCENT_INSENSITIVE_SEARCH = false;

/** Highlight search results */
export const DEFAULT_HIGHLIGHT_SEARCH_RESULTS = true;
/** Search result highlight class */
export const DEFAULT_HIGHLIGHT_CLASS = 'aura-highlight';

/**
 * Default built-in UI texts (English).
 *
 * Any of these can be overridden via the `labels` config key (partially too —
 * keys not provided fall back to the English default here, see `validateLabels`).
 * The `paginationInfo` template uses the `{from}` / `{to}` / `{total}` tokens, the
 * `dismissAllErrors` / `hiddenErrors` templates the `{count}` token.
 *
 * @remarks
 * `AuraLabels.emptyState` is intentionally **absent** here: `validateLabels` fills in
 * every key listed below, so a default would always win over the deprecated
 * `emptyStateMessage` config key and silently disable it. Its default text is
 * `DEFAULT_EMPTY_STATE_MESSAGE`, applied by the consumer as the last fallback.
 */
export const DEFAULT_LABELS: AuraLabels = {
    // DestroyModal
    confirmDeleteTitle: 'Confirm deletion',
    confirmDeleteBody: 'Are you sure you want to delete this item?',
    cancel: 'Cancel',
    confirmDelete: 'Delete',
    // Toolbar action buttons
    refresh: 'Refresh',
    export: 'Export',
    exportCsv: 'CSV export',
    settings: 'Settings',
    // Search
    search: 'Search',
    clearSearch: 'Clear search',
    searchPlaceholder: 'Search...',
    // Pagination
    paginationInfo: 'Showing {from}-{to} of {total}',
    noResults: 'No results',
    previousPage: 'Previous',
    nextPage: 'Next',
    // Jump to page
    pageJump: 'Jump to page',
    pageNumberPlaceholder: 'Page number...',
    pageNumberInput: 'Enter page number',
    goToPage: 'Go to page',
    go: 'Go',
    // Rows-per-page select (toolbar)
    perPage: 'Per page',
    results: 'results',
    // Row selection
    selectRow: 'Select row',
    selectAllRows: 'Select all rows',
    // Sorting
    sortColumn: 'Sort column',
    // Column filter dropdown
    selectAll: 'Select All',
    filterToggle: 'Filter',
    filterOptions: 'Filter options',
    filterApply: 'Filter',
    // Settings panel
    columnVisibility: 'Column visibility',
    showAllColumns: 'Show all',
    activeFilters: 'Active filters',
    noActiveFilters: 'No active filters',
    clearAllFilters: 'Clear all',
    removeFilter: 'Remove filter',
    // Loading
    loading: 'Loading...',
    // ErrorHandler
    close: 'Close',
    dismissAllErrors: 'Dismiss all ({count})',
    hiddenErrors: 'And {count} more error(s)...',
    errorOccurrences: 'Occurred {count} times',
    retry: 'Retry',
    // API failures
    apiErrorNetwork: 'Could not reach the server. Please check your connection and try again.',
    apiErrorTimeout: 'The server took too long to respond. Please try again.',
    apiErrorClient: 'The server rejected the request ({status}).',
    apiErrorServer: 'The server ran into an error ({status}). Please try again later.',
    apiErrorUnknown: 'Could not load the data. Please try again.',
    apiErrorInvalidResponse: 'The server responded, but the data could not be processed.',
};
