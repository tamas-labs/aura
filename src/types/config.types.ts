/**
 * Action button type definition
 */
export type ActionButtonItem = 'refresh' | 'export' | 'settings';

/**
 * Custom renderer function for the `custom` column type.
 *
 * Returns an HTML string that goes through DOMPurify before rendering (per the
 * cell-level `raw` whitelist), before being placed into the DOM as `innerHTML`. Can only
 * be provided by the host (`app.use`/props) — the API can only reference it by name.
 *
 * @param value - The single value of `field`, or the array of resolved values for `fields[]`
 * @param row - The full row (item) object
 * @param config - The validated column config (`config.params` is accessible on it)
 */
export type AuraCustomRenderer = (
    value: unknown,
    row: Record<string, unknown>,
    config: Record<string, unknown>
) => string;

/**
 * Custom callback function for the `custom` column type.
 *
 * Returns plain text that is processed by the static formatter and then escaped by Vue (NOT
 * `innerHTML`). Can only be provided by the host — the API can only reference it by name.
 *
 * @param value - The resolved value of `field`/`value`
 * @param row - The full row (item) object
 * @param params - The config's `params` object (extra parameters)
 */
export type AuraCustomCallback = (
    value: unknown,
    row: Record<string, unknown>,
    params: Record<string, unknown>
) => string | number | null | undefined;

/**
 * Built-in, user-visible UI texts.
 *
 * Can be overridden via the `labels` config key (partially too). Every value is plain text;
 * the `paginationInfo` template substitutes the `{from}` / `{to}` / `{total}` tokens, the
 * `dismissAllErrors` / `hiddenErrors` templates the `{count}` token.
 * See `DEFAULT_LABELS` for the default (English) values.
 */
export interface AuraLabels {
    // DestroyModal
    /** Title of the delete-confirmation modal */
    confirmDeleteTitle: string;
    /** Body text of the delete-confirmation modal */
    confirmDeleteBody: string;
    /** Label of the "Cancel" button / close */
    cancel: string;
    /** Label of the delete-confirmation button */
    confirmDelete: string;
    // Toolbar action buttons
    /** Title of the refresh button */
    refresh: string;
    /** Title of the export button */
    export: string;
    /** Label of the CSV-export dropdown item */
    exportCsv: string;
    /** Title of the settings button */
    settings: string;
    // Search
    /** Title of the global search button */
    search: string;
    /** Title of the clear-search button */
    clearSearch: string;
    /** Placeholder of the search field */
    searchPlaceholder: string;
    // Pagination
    /** Pagination info template (with `{from}` / `{to}` / `{total}` tokens) */
    paginationInfo: string;
    /** Pagination text for an empty result list */
    noResults: string;
    /** aria-label of the previous-page button */
    previousPage: string;
    /** aria-label of the next-page button */
    nextPage: string;
    // Jump to page
    /** aria-label of the jump-to-page dropdown */
    pageJump: string;
    /** Placeholder of the page-number input field */
    pageNumberPlaceholder: string;
    /** aria-label of the page-number input field */
    pageNumberInput: string;
    /** aria-label of the go button */
    goToPage: string;
    /** Label of the go button */
    go: string;
    // Rows-per-page select (toolbar)
    /** Label in front of the rows-per-page dropdown */
    perPage: string;
    /** Label after the rows-per-page dropdown */
    results: string;
    // Row selection
    /** aria-label of the per-row selection checkbox */
    selectRow: string;
    /** aria-label of the "select all rows" checkbox in the header */
    selectAllRows: string;
    // Sorting
    /** aria-label of the sort button in a sortable column header */
    sortColumn: string;
    // Column filter dropdown
    /** Label of the "select all" checkbox inside the filter dropdown */
    selectAll: string;
    /** aria-label of the button that opens the filter dropdown */
    filterToggle: string;
    /** aria-label of the filter dropdown menu */
    filterOptions: string;
    /** Label of the apply button inside the filter dropdown */
    filterApply: string;
    // Settings panel
    /** Heading of the column-visibility section in the settings panel */
    columnVisibility: string;
    /** Label of the button that makes every hidden column visible again */
    showAllColumns: string;
    // Loading
    /** Screen-reader text of the loading overlay's spinner */
    loading: string;
    // ErrorHandler
    /** aria-label of the dismiss (X) button on an error alert */
    close: string;
    /** Label of the "dismiss all errors" button (with the `{count}` token) */
    dismissAllErrors: string;
    /** Summary text for errors above `maxVisible` (with the `{count}` token) */
    hiddenErrors: string;
    /** Tooltip of the repeat badge on a merged error (with the `{count}` token) */
    errorOccurrences: string;
    /** Message of a request that never reached the server */
    apiErrorNetwork: string;
    /** Message of a request that ran out of time */
    apiErrorTimeout: string;
    /** Message of a 4xx response (with the `{status}` token) */
    apiErrorClient: string;
    /** Message of a 5xx response (with the `{status}` token) */
    apiErrorServer: string;
    /** Message of a failed request that fits none of the classes above */
    apiErrorUnknown: string;
    /** Message of a response that arrived intact but could not be processed */
    apiErrorInvalidResponse: string;
    /** Label of the retry button shown in the blocking error state */
    retry: string;
    // Empty state
    /**
     * Message shown when the table has no rows to display.
     *
     * @remarks
     * The only **optional** label, and the only one deliberately left out of
     * `DEFAULT_LABELS`. It supersedes the deprecated top-level `emptyStateMessage`
     * config key, which must keep working — and `validateLabels` fills every key
     * present in `DEFAULT_LABELS`, so a default here would always win over the alias
     * and silently disable it. Leaving it `undefined` is what makes
     * `labels.emptyState` → `emptyStateMessage` → `DEFAULT_EMPTY_STATE_MESSAGE`
     * resolvable. The default text lives in `DEFAULT_EMPTY_STATE_MESSAGE`.
     */
    emptyState?: string;
}

/**
 * Main configuration interface of the Aura plugin
 */
export interface AuraConfig {
    /** Store identifier */
    storeId?: string;

    /** Enable debug mode */
    debug?: boolean;

    /** Base site URL */
    siteName?: string;

    /** The part of the URL without siteName */
    urlParameter?: string;

    /** API endpoint URL */
    href?: string;

    /** Last segment of the URL */
    urlParameterLastSegment?: string;

    /** URL structure template */
    urlStructure?: string;

    /** Use site token */
    siteToken?: boolean | string;

    /** Available pagination values */
    paginateValues?: number[];

    /** Default row count */
    rowsNumber?: number;

    /** CSS class configuration */
    classes?: {
        table?: string[];
        icon?: string[];
        button?: string[];
        link?: string[];
        dataTypes?: {
            numbers?: string[];
            currency?: string[];
            unit?: string[];
        };
    };

    /** Icon configuration */
    icons?: {
        sortable: {
            up: string[];
            down: string[];
            both: string[];
        };
        filterable: string[];
        filterableChecked: string[];
        settings: string[];
        save: string[];
        close: string[];
        search: string[];
        clear: string[];
        destroy: string[];
        edit: string[];
        show: string[];
        switchUser: string[];
        primary: string[];
    };

    /**
     * Custom render functions for the `custom` column type (key → function).
     * Can only be provided by the host (`app.use`/props); the API response can only reference
     * them by name via the `columnConfigs[...].renderer` field. They return HTML (sanitized).
     */
    renderers?: Record<string, AuraCustomRenderer>;

    /**
     * Custom callback functions for the `custom` column type (key → function).
     * Can only be provided by the host; the API can reference them via the
     * `columnConfigs[...].callback` field. They return plain text (static-formatted, escaped).
     */
    callbacks?: Record<string, AuraCustomCallback>;

    /** Bootstrap variant types */
    variants?: {
        primary: string;
        destroy: string;
        edit: string;
        show: string;
        switchUser: string;
        danger: string;
        warning: string;
        success: string;
        info: string;
        secondary: string;
    };

    /** Show footer */
    showFooter?: boolean;

    /** Action buttons configuration */
    actionButtons?: ActionButtonItem[];

    /** Show header search */
    showHeaderSearch?: boolean;

    /** Show the built-in loading overlay while a request is in flight (default: true) */
    showLoadingOverlay?: boolean;

    /**
     * Show the thin progress bar above the table while a request is in flight (default: false).
     * Ignored while `showLoadingOverlay` is enabled — the overlay wins.
     */
    showLoadingBar?: boolean;

    /** Show toolbar title */
    showToolbarTitle?: boolean;

    /** Toolbar title text */
    toolbarTitleContent?: string;

    /** Use server-side pagination */
    externalPaginator?: boolean;

    /** Resources mode */
    resources?: boolean;

    /** HTTP request method */
    requestMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

    /** Date display style */
    dateStyle?: 'short' | 'medium' | 'long';

    /** Time zone */
    timeZone?: string;

    /** UTC offset */
    utcOffset?: string;

    /** Localization */
    localization?: string;

    /** Override built-in UI texts (partially too; keys not provided fall back to the default) */
    labels?: Partial<AuraLabels>;

    /** Currency code (ISO 4217) */
    currencyCode?: string;

    /** Disable session storage */
    disableSession?: boolean;

    /**
     * sessionStorage key of the saved table state.
     *
     * @remarks
     * When omitted, the key is derived from the `storeId` (`aura-session-{storeId}`).
     * Set it to keep the saved state stable across a changing `storeId`, or to share
     * one state between two tables. Per-table setting — a global value would make every
     * table on the page write the same key.
     */
    sessionKey?: string | null;

    /** Characters shown at the end of a truncated text */
    sliceEndText?: string;

    /**
     * Empty state message.
     *
     * @deprecated Use `labels.emptyState` instead, so every built-in UI text lives under
     * one key. Still fully supported and used whenever `labels.emptyState` is not set;
     * removal is not planned before 1.0.
     */
    emptyStateMessage?: string;

    /** Allow use of external APIs */
    allowExternalApi?: boolean;

    /** Enable error reporting */
    errorReporting?: boolean;

    /** Error reporting endpoint URL (for the custom service) */
    errorReportingEndpoint?: string;

    /**
     * Ignore diacritics in the client-side column and global search.
     *
     * With it on, `arvizturo` finds `árvíztűrő`. Server-side mode
     * (`externalPaginator: true`) is unaffected — there the backend decides.
     */
    accentInsensitiveSearch?: boolean;

    /** Highlight search results */
    highlightSearchResults?: boolean;

    /** Highlight CSS class (optional) */
    highlightClass?: string;

    /**
     * Type of the error reporting service.
     *
     * There is one transport: a POST to `errorReportingEndpoint`.
     * `'sentry'`/`'logrocket'`/`'rollbar'` have no SDK integration — they emit a
     * warning at config time and are sent through the endpoint like `'custom'`.
     */
    errorReportingService?: 'sentry' | 'logrocket' | 'rollbar' | 'custom';

    /**
     * API key for the error reporting service (`Authorization: Bearer` for `custom`).
     *
     * 🔒 Ends up in the client-side bundle and goes out from the browser — **publicly
     * visible**. Only provide a public, ingest-only token (like a Sentry DSN); for a
     * secret key, proxy it through your own backend endpoint.
     */
    errorReportingApiKey?: string;

    /**
     * Allowed HTML tags in 'raw'-type cells
     * If not provided, the safe default list applies
     */
    rawHtmlAllowedTags?: string[];

    /**
     * Allowed HTML attributes in 'raw'-type cells
     * If not provided, the safe default list applies
     */
    rawHtmlAllowedAttr?: string[];

    /**
     * Allow data attributes in 'raw'-type cells
     * Default: true
     */
    rawHtmlAllowDataAttr?: boolean;
}
