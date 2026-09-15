import type { ECSError, ErrorSeverity } from './error.types';
import type { AuraProps } from './props.types';
import type {
    ActionButtonItem,
    AuraCustomRenderer,
    AuraCustomCallback,
    AuraLabels,
} from './config.types';

/**
 * Config Store Interface
 * State and methods returned by the config store
 * All keys are required, but may be nullable
 */
export interface ConfigStore {
    /** Store identifier */
    storeId: string;
    /** Debug mode */
    debug: boolean | null;
    /** Site token */
    siteToken: boolean | string | null;
    /** Site name */
    siteName: string | null;
    /** URL parameter */
    urlParameter: string | null;
    /** Href */
    href: string | null;
    /** Last URL parameter segment */
    urlParameterLastSegment: string | null;
    /** URL structure */
    urlStructure: string | null;
    /** Pagination values */
    paginateValues: number[] | null;
    /** Row count */
    rowsNumber: number | null;
    /** CSS classes */
    classes: Record<string, string[] | Record<string, string[]>>;
    /** Icons */
    icons: Record<string, string[] | Record<string, string[]>>;
    /** Variants */
    variants: Record<string, string>;
    /** Built-in UI texts (the full object, filled in with DEFAULT_LABELS) */
    labels: AuraLabels;
    /** Custom renderer functions (custom type) */
    renderers: Record<string, AuraCustomRenderer>;
    /** Custom callback functions (custom type) */
    callbacks: Record<string, AuraCustomCallback>;
    /** Show footer */
    showFooter: boolean | null;
    /** Action buttons */
    actionButtons: ActionButtonItem[] | null;
    /** Header search */
    showHeaderSearch: boolean | null;
    /** Built-in loading overlay */
    showLoadingOverlay: boolean | null;
    /** Built-in loading progress bar */
    showLoadingBar: boolean | null;
    /** Show toolbar title */
    showToolbarTitle: boolean | null;
    /** Toolbar title text */
    toolbarTitleContent: string | null;
    /** External paginator */
    externalPaginator: boolean | null;
    /** Resources mode */
    resources: boolean | null;
    /** Disable session */
    disableSession: boolean | null;
    /** Allow external API */
    allowExternalApi: boolean | null;
    /** Error reporting */
    errorReporting: boolean | null;
    /** Request method */
    requestMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | null;
    /** Date display style */
    dateStyle: 'short' | 'medium' | 'long' | null;
    /** Time zone */
    timeZone: string | null;
    /** UTC offset */
    utcOffset: string | null;
    /** Localization */
    localization: string | null;
    /** Currency */
    currencyCode: string | null;
    /** Text truncation end marker */
    sliceEndText: string | null;
    /** sessionStorage key override (null → derived from the storeId) */
    sessionKey: string | null;
    /** Empty state message (deprecated alias of `labels.emptyState`) */
    emptyStateMessage: string | null;
    /** Error reporting endpoint */
    errorReportingEndpoint: string | null;
    /** Error reporting service */
    errorReportingService: 'sentry' | 'logrocket' | 'rollbar' | 'custom' | null;
    /** Error reporting API key */
    errorReportingApiKey: string | null;
    /** Ignore diacritics in the client-side search */
    accentInsensitiveSearch: boolean | null;
    /** Highlight search results */
    highlightSearchResults: boolean | null;
    /** Highlight CSS class */
    highlightClass: string | null;
    /** Shift+click a body cell to copy its raw value into a search input */
    cellClickSearch: boolean | null;
    /** Allowed HTML tags for sanitizing raw: true cells (formatRaw) */
    rawHtmlAllowedTags: string[] | null;
    /** Allowed HTML attributes for sanitizing raw: true cells (formatRaw) */
    rawHtmlAllowedAttr: string[] | null;
    /** Whether to allow data-* attributes when sanitizing raw: true cells */
    rawHtmlAllowDataAttr: boolean | null;
}

/**
 * Error Handler Store Interface
 * State and methods returned by the error handler store
 */
export interface ErrorHandlerStore {
    /** Store identifier (Pinia $id) */
    $id: string;
    /** Store dispose method (Pinia $dispose) */
    $dispose(): void;
    /** Error list */
    errors: ECSError[];
    /** Whether there is an error */
    hasErrors: boolean;
    /** Whether the state is valid */
    isValid: boolean;
    /**
     * Add an error
     * @param error Error object
     */
    addError(error: Omit<ECSError, 'timestamp' | 'level'> & { level?: ErrorSeverity }): void;
    /** Clear errors */
    clearErrors(): void;
    /**
     * Clear the errors carrying a given key
     * @param key Error key (the caller-supplied one, or the generated `component.action.type`)
     */
    clearByKey(key: string): void;
}

/**
 * Core Store Interface
 * Type of the store returned by useCoreStore
 */
export interface CoreStore {
    /** Config store */
    config: ConfigStore;
    /** Original props */
    props: AuraProps;
    /** Error handler store */
    errorStore: ErrorHandlerStore;
    /** Whether the settings panel is open */
    isSettingsOpen: boolean;
    /** Open/close the settings panel */
    toggleSettings: () => void;
    /** The latest search input pre-fill a Shift+clicked cell asked for (`cellClickSearch`) */
    searchPrefill: SearchPrefillRequest | null;
    /**
     * Ask the matching search input to take a value into its text, without searching
     * @param target The input to fill and the text to put there
     */
    requestSearchPrefill: (target: SearchPrefillTarget) => void;
}

/**
 * Which search input a pre-fill goes to, and with what text (`cellClickSearch`).
 *
 * - `column` — the header search input of the column that searches on `field`.
 * - `global` — the toolbar's global search input.
 */
export type SearchPrefillTarget =
    | { kind: 'column'; field: string; term: string }
    | { kind: 'global'; term: string };

/**
 * A pre-fill request as the core store holds it.
 *
 * `id` grows with every request, so clicking the same value twice fills the input
 * again — even after the user has edited the text in between.
 */
export type SearchPrefillRequest = SearchPrefillTarget & { id: number };
