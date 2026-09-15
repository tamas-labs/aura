import { ComponentOptionsMixin } from 'vue';
import { ComponentProvideOptions } from 'vue';
import { ComponentPublicInstance } from 'vue';
import { ComputedRef } from 'vue';
import { DefineComponent } from 'vue';
import { ExtractPropTypes } from 'vue';
import { Plugin as Plugin_2 } from 'vue';
import { PropType } from 'vue';
import { PublicProps } from 'vue';
import { Ref } from 'vue';
import { RendererElement } from 'vue';
import { RendererNode } from 'vue';
import { Store } from 'pinia';
import { VNode } from 'vue';

/**
 * Action button type definition
 */
declare type ActionButtonItem = 'refresh' | 'export' | 'settings';

/**
 * Common Literal Types
 */
/**
 * Text alignment options.
 */
export declare type Align = 'start' | 'center' | 'end';

/**
 * Api Resources Store interface.
 */
export declare interface ApiResourcesStore {
    readonly queryParams: QueryParams;
    /**
     * Whether a `fetchData` request is in flight.
     *
     * Stays `true` while any request is running — with overlapping requests it
     * only returns to `false` once the last one settles — and is released on
     * every outcome, including a failure. Bind a host-side loading indicator to
     * this, or let the built-in overlay handle it (`showLoadingOverlay`).
     */
    readonly loading: boolean;
    readonly sortItems: SortItem[];
    readonly searchItems: SearchItem[];
    readonly filterItems: FilterItem[];
    readonly globalSearchTerm: string | null;
    readonly selectedRows: RowId[];
    /**
     * Column keys the user hid from the settings panel.
     *
     * Presentation-only state: it never reaches `queryParams`, so switching a column
     * off re-renders the table without a request. It is persisted with the rest of the
     * session state. The response-side `show: false` flag is stronger and independent —
     * those columns are never rendered and never appear in this list.
     */
    readonly hiddenColumns: string[];
    readonly header: Header | null;
    readonly body: Body_2 | null;
    readonly footer: Footer | null;
    readonly displayFooter: Header | Footer | null;
    readonly items: unknown[] | null;
    readonly displayItems: unknown[] | null;
    readonly meta: PaginationMeta | null;
    readonly displayMeta: PaginationMeta | null;
    readonly links: PaginationLinks | null;
    addSort: (field: string, direction: SortDirection) => void;
    updateSortDirection: (field: string, direction: SortDirection) => void;
    removeSort: (field: string) => void;
    clearAllSorts: () => void;
    getSortDirection: (field: string) => SortDirection | null;
    addSearch: (field: string, term: string, exact?: boolean) => void;
    updateSearchTerm: (field: string, term: string, exact?: boolean) => void;
    removeSearch: (field: string) => void;
    clearAllSearches: () => void;
    getSearchTerm: (field: string) => string | null;
    setBetweenSearch: (field: string, min: RangeBound, max: RangeBound) => void;
    getBetweenRange: (field: string) => SearchRange | null;
    addFilter: (field: string, values: unknown[]) => void;
    updateFilterValues: (field: string, values: unknown[]) => void;
    removeFilter: (field: string) => void;
    clearAllFilters: () => void;
    getFilterValues: (field: string) => unknown[] | null;
    setGlobalSearch: (term: string) => void;
    clearGlobalSearch: () => void;
    isRowSelected: (id: RowId) => boolean;
    toggleRowSelection: (id: RowId) => void;
    selectRows: (ids: RowId[]) => void;
    deselectRows: (ids: RowId[]) => void;
    clearSelection: () => void;
    isColumnHidden: (key: string) => boolean;
    hideColumn: (key: string) => void;
    showColumn: (key: string) => void;
    toggleColumn: (key: string) => void;
    setHiddenColumns: (keys: string[]) => void;
    showAllColumns: () => void;
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    fetchData: () => Promise<void>;
    processResponse: (response: ApiResponse) => Promise<void>;
    clearResponse: () => void;
    autoRefetch: boolean;
    readonly $id: string;
    $dispose: () => void;
}

/**
 * Main API Response Interface.
 *
 * Represents the complete structure of the JSON response expected from the API.
 *
 * @example
 * ```typescript
 * const response: ApiResponse = {
 *   header: { rows: [...] },
 *   items: [...],
 *   meta: { ... },
 *   links: { ... }
 * };
 * ```
 */
export declare interface ApiResponse {
    /** Table header configuration. */
    header?: Header;
    /** Table body configuration. */
    body?: Body_2;
    /** Table footer configuration. */
    footer?: Footer;
    /** Data items ARRAY. */
    items?: unknown[];
    /** Pagination metadata (Laravel). */
    meta?: PaginationMeta;
    /** Pagination links (Laravel). */
    links?: PaginationLinks;
}

/**
 * Aura Component
 *
 * The main component for the Aura Data Table.
 * Initializes the store, handles data fetching, and orchestrates sub-components like Toolbar, TableHeader, etc.
 */
export declare const Aura: DefineComponent<ExtractPropTypes<Record<string, PropValidator<any>>>, {
core: Store<string, Pick<{
config: Store<string, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, "debug" | "storeId" | "siteName" | "urlParameter" | "urlParameterLastSegment" | "urlStructure" | "siteToken" | "paginateValues" | "rowsNumber" | "classes" | "showFooter" | "actionButtons" | "showLoadingOverlay" | "showLoadingBar" | "showHeaderSearch" | "showToolbarTitle" | "toolbarTitleContent" | "externalPaginator" | "dateStyle" | "timeZone" | "utcOffset" | "localization" | "currencyCode" | "resources" | "requestMethod" | "sessionKey" | "disableSession" | "accentInsensitiveSearch" | "highlightSearchResults" | "highlightClass" | "href" | "allowExternalApi" | "errorReporting" | "sliceEndText" | "icons" | "variants" | "labels" | "errorReportingService" | "errorReportingApiKey" | "renderers" | "callbacks" | "emptyStateMessage" | "errorReportingEndpoint" | "rawHtmlAllowedTags" | "rawHtmlAllowedAttr" | "rawHtmlAllowDataAttr">, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>>;
props: AuraProps;
errorStore: Store<string, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "errors">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "hasErrors" | "isValid" | "criticalErrors" | "errorLevelErrors" | "warnings">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "destroy" | "addError" | "addSchemaValidationError" | "clearErrors" | "clearByKey" | "clearByComponent" | "clearByType" | "getErrorsBySeverity" | "getErrorsByComponent" | "getErrorsByKey">>;
isSettingsOpen: Ref<boolean, boolean>;
toggleSettings: () => void;
}, "config" | "props" | "errorStore" | "isSettingsOpen">, Pick<{
config: Store<string, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, "debug" | "storeId" | "siteName" | "urlParameter" | "urlParameterLastSegment" | "urlStructure" | "siteToken" | "paginateValues" | "rowsNumber" | "classes" | "showFooter" | "actionButtons" | "showLoadingOverlay" | "showLoadingBar" | "showHeaderSearch" | "showToolbarTitle" | "toolbarTitleContent" | "externalPaginator" | "dateStyle" | "timeZone" | "utcOffset" | "localization" | "currencyCode" | "resources" | "requestMethod" | "sessionKey" | "disableSession" | "accentInsensitiveSearch" | "highlightSearchResults" | "highlightClass" | "href" | "allowExternalApi" | "errorReporting" | "sliceEndText" | "icons" | "variants" | "labels" | "errorReportingService" | "errorReportingApiKey" | "renderers" | "callbacks" | "emptyStateMessage" | "errorReportingEndpoint" | "rawHtmlAllowedTags" | "rawHtmlAllowedAttr" | "rawHtmlAllowDataAttr">, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>>;
props: AuraProps;
errorStore: Store<string, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "errors">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "hasErrors" | "isValid" | "criticalErrors" | "errorLevelErrors" | "warnings">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "destroy" | "addError" | "addSchemaValidationError" | "clearErrors" | "clearByKey" | "clearByComponent" | "clearByType" | "getErrorsBySeverity" | "getErrorsByComponent" | "getErrorsByKey">>;
isSettingsOpen: Ref<boolean, boolean>;
toggleSettings: () => void;
}, never>, Pick<{
config: Store<string, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, "debug" | "storeId" | "siteName" | "urlParameter" | "urlParameterLastSegment" | "urlStructure" | "siteToken" | "paginateValues" | "rowsNumber" | "classes" | "showFooter" | "actionButtons" | "showLoadingOverlay" | "showLoadingBar" | "showHeaderSearch" | "showToolbarTitle" | "toolbarTitleContent" | "externalPaginator" | "dateStyle" | "timeZone" | "utcOffset" | "localization" | "currencyCode" | "resources" | "requestMethod" | "sessionKey" | "disableSession" | "accentInsensitiveSearch" | "highlightSearchResults" | "highlightClass" | "href" | "allowExternalApi" | "errorReporting" | "sliceEndText" | "icons" | "variants" | "labels" | "errorReportingService" | "errorReportingApiKey" | "renderers" | "callbacks" | "emptyStateMessage" | "errorReportingEndpoint" | "rawHtmlAllowedTags" | "rawHtmlAllowedAttr" | "rawHtmlAllowDataAttr">, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>>;
props: AuraProps;
errorStore: Store<string, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "errors">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "hasErrors" | "isValid" | "criticalErrors" | "errorLevelErrors" | "warnings">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "destroy" | "addError" | "addSchemaValidationError" | "clearErrors" | "clearByKey" | "clearByComponent" | "clearByType" | "getErrorsBySeverity" | "getErrorsByComponent" | "getErrorsByKey">>;
isSettingsOpen: Ref<boolean, boolean>;
toggleSettings: () => void;
}, "toggleSettings">>;
hasCriticalOrError: ComputedRef<boolean>;
hasNonCriticalErrors: ComputedRef<boolean>;
onRowsChange: (value: number) => void;
onRetry: () => void;
paginationMeta: ComputedRef<PaginationMeta | null>;
rowsNumber: ComputedRef<number>;
onPageChange: (page: number) => void;
storeId: string;
tableClasses: ComputedRef<string>;
showOverlay: Readonly<Ref<boolean, boolean>>;
showLoadingBar: ComputedRef<boolean>;
isBusy: ComputedRef<boolean>;
reservedHeight: Readonly<Ref<number, number>>;
setTableAreaEl: (el: Element | ComponentPublicInstance | null) => void;
}, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<Record<string, PropValidator<any>>>> & Readonly<{}>, {}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;

/**
 * Main configuration interface of the Aura plugin
 */
export declare interface AuraConfig {
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
declare type AuraCustomCallback = (value: unknown, row: Record<string, unknown>, params: Record<string, unknown>) => string | number | null | undefined;

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
declare type AuraCustomRenderer = (value: unknown, row: Record<string, unknown>, config: Record<string, unknown>) => string;

/**
 * Built-in, user-visible UI texts.
 *
 * Can be overridden via the `labels` config key (partially too). Every value is plain text;
 * the `paginationInfo` template substitutes the `{from}` / `{to}` / `{total}` tokens, the
 * `dismissAllErrors` / `hiddenErrors` templates the `{count}` token.
 * See `DEFAULT_LABELS` for the default (English) values.
 */
declare interface AuraLabels {
    /** Title of the delete-confirmation modal */
    confirmDeleteTitle: string;
    /** Body text of the delete-confirmation modal */
    confirmDeleteBody: string;
    /** Label of the "Cancel" button / close */
    cancel: string;
    /** Label of the delete-confirmation button */
    confirmDelete: string;
    /** Title of the refresh button */
    refresh: string;
    /** Title of the export button */
    export: string;
    /** Label of the CSV-export dropdown item */
    exportCsv: string;
    /** Title of the settings button */
    settings: string;
    /** Title of the global search button */
    search: string;
    /** Title of the clear-search button */
    clearSearch: string;
    /** Placeholder of the search field */
    searchPlaceholder: string;
    /** Pagination info template (with `{from}` / `{to}` / `{total}` tokens) */
    paginationInfo: string;
    /** Pagination text for an empty result list */
    noResults: string;
    /** aria-label of the previous-page button */
    previousPage: string;
    /** aria-label of the next-page button */
    nextPage: string;
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
    /** Label in front of the rows-per-page dropdown */
    perPage: string;
    /** Label after the rows-per-page dropdown */
    results: string;
    /** aria-label of the per-row selection checkbox */
    selectRow: string;
    /** aria-label of the "select all rows" checkbox in the header */
    selectAllRows: string;
    /** aria-label of the sort button in a sortable column header */
    sortColumn: string;
    /** Label of the "select all" checkbox inside the filter dropdown */
    selectAll: string;
    /** aria-label of the button that opens the filter dropdown */
    filterToggle: string;
    /** aria-label of the filter dropdown menu */
    filterOptions: string;
    /** Label of the apply button inside the filter dropdown */
    filterApply: string;
    /** Heading of the column-visibility section in the settings panel */
    columnVisibility: string;
    /** Label of the button that makes every hidden column visible again */
    showAllColumns: string;
    /** Heading of the active-filters section in the settings panel */
    activeFilters: string;
    /** Text shown in place of the badge list when nothing is filtered */
    noActiveFilters: string;
    /** Label of the button that clears every active filter at once */
    clearAllFilters: string;
    /** aria-label of the remove (X) button on an active-filter badge */
    removeFilter: string;
    /** Screen-reader text of the loading overlay's spinner */
    loading: string;
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

declare const AuraPlugin: Plugin_2;
export { AuraPlugin }
export default AuraPlugin;

/**
 * Aura table props interface
 *
 * Type definitions for every prop the `Aura` component accepts. This is the third and
 * highest-priority config layer (default config < `app.use()` global config < props),
 * so almost every field is optional: an unset prop must not clobber a configured
 * value. Boolean props default to `undefined` rather than `false` for the same reason.
 */
export declare interface AuraProps {
    storeId?: string | null;
    debug?: boolean;
    siteName?: string | null;
    urlParameter?: string | null;
    urlParameterLastSegment?: string | null;
    urlStructure?: string | null;
    siteToken?: boolean | string | null;
    paginateValues?: number[];
    rowsNumber?: number | null;
    classes?: Record<string, string[] | Record<string, string[]>>;
    showFooter?: boolean;
    actionButtons?: ActionButtonItem[];
    showHeaderSearch?: boolean;
    showLoadingOverlay?: boolean;
    showLoadingBar?: boolean;
    showToolbarTitle?: boolean;
    toolbarTitleContent?: string | null;
    externalPaginator?: boolean;
    dateStyle?: 'short' | 'medium' | 'long' | null;
    timeZone?: string | null;
    utcOffset?: string | null;
    localization?: string | null;
    currencyCode?: string | null;
    resources?: boolean | null;
    requestMethod?: string | null;
    sessionKey?: string | null;
    disableSession?: boolean;
    accentInsensitiveSearch?: boolean;
    highlightSearchResults?: boolean;
    highlightClass?: string | null;
}

/**
 * Configuration for badge columns.
 *
 * Renders a Bootstrap 5 badge (`<span class="badge text-bg-{variant}">`). The
 * label and colour derive from the value via three resolution modes: static
 * (`field`/`value` + fixed `variant`), value→config `mapping`, or boolean
 * `trueValue`/`falseValue`. Numeric counter mode adds `prefix`/`suffix`,
 * `maxValue` overflow (`{maxValue}{suffix}`) and `showZero`. An optional `icon`
 * (config.icons registry key) is rendered as an `<i>` glyph per `iconPosition`.
 * The resolved label passes through the same formatter chain as `static`.
 */
declare interface BadgeConfig extends BaseColumnConfig {
    type: 'badge';
    /** Bootstrap colour variant (base / fallback), rendered as `text-bg-{variant}` */
    variant?: BootstrapColor | null;
    /** Pill badge (rounded-pill) */
    pill?: boolean | null;
    /** Badge size (sm, md, lg) */
    size?: Size | null;
    /** Value-based mapping configuration */
    mapping?: Record<string, BadgeMappingValue> | null;
    /** Config used when the value is truthy (boolean mode) */
    trueValue?: BadgeMappingValue | null;
    /** Config used when the value is falsy (boolean mode) */
    falseValue?: BadgeMappingValue | null;
    /** Whether to render when the numeric value is 0 (default true) */
    showZero?: boolean | null;
    /** Maximum displayed number; above it → `{maxValue}{suffix}` (e.g. 99 → "99+") */
    maxValue?: number | null;
    /** Overflow marker appended after `maxValue` when the value exceeds it (e.g. "+") */
    suffix?: string | null;
    /** Prefix prepended to the label (e.g. "#") */
    prefix?: string | null;
    /** Icon registry key (config.icons) rendered as an `<i>` glyph */
    icon?: string | null;
    /** Icon placement relative to the text ('start' default | 'end') */
    iconPosition?: IconPosition | null;
    /** Item field name whose value drives the badge (resolved value) */
    field?: string | null;
    /** Fixed label text (static mode) */
    value?: string | null;
    /** Bootstrap color variant */
    color?: BootstrapColor | null;
    /** Background color (Bootstrap color or CSS color value) */
    background?: string | null;
    /** Text alignment */
    align?: Align | null;
    /** CSS font-size value (e.g. '12px', '1rem') */
    fontSize?: string | null;
    /** CSS font-weight value (100-900, normal, bold, lighter, bolder) */
    fontWeight?: CssNumericValue;
    /** Italic text style */
    italic?: boolean | null;
    /** Normal (upright) font style — resets italic (`font-style: normal`) */
    normal?: boolean | null;
    /** CSS line-height value (e.g. '1.5', '24px') */
    lineHeight?: CssNumericValue;
    /** Bootstrap text utility class (e.g. 'text-truncate') */
    text?: string | null;
    /** Transform to uppercase */
    uppercase?: boolean | null;
    /** Transform to lowercase */
    lowercase?: boolean | null;
    /** Capitalize first letter */
    capitalize?: boolean | null;
    /** Monospace font family */
    monospace?: boolean | null;
    /** Truncate text to length */
    slice?: number | null;
    /** Format as number */
    number?: boolean | null;
    /** Format as currency */
    currency?: boolean | null;
    /** Format as date */
    date?: boolean | null;
    /** Format as phone number */
    phone?: boolean | null;
    /** Unit to append (e.g., 'kg', '%') */
    unit?: string | null;
    /** Start (left) padding length */
    padStart?: number | null;
    /** End (right) padding length */
    padEnd?: number | null;
    /** Character used for padding */
    chars?: string | null;
}

/**
 * Mapping value for badge configuration.
 */
declare interface BadgeMappingValue {
    label?: string | null;
    variant?: BootstrapColor | null;
    icon?: string | null;
    class?: CssClass | null;
}

/**
 * Common cell configuration for all cell types.
 * Header, Body and Footer cells inherit from this.
 */
export declare interface BaseCellConfig {
    /** Unique identifier */
    key: string;
    width?: string | null;
    colspan?: number | null;
    rowspan?: number | null;
    align?: 'start' | 'center' | 'end' | null;
    color?: string | null;
    background?: string | null;
    fontSize?: string | null;
    fontWeight?: string | number | null;
    lineHeight?: string | number | null;
    italic?: boolean | null;
    normal?: boolean | null;
    monospace?: boolean | null;
    uppercase?: boolean | null;
    lowercase?: boolean | null;
    capitalize?: boolean | null;
    class?: string | string[] | null;
    style?: string | Record<string, string> | null;
    text?: string | null;
}

/**
 * Base configuration properties shared by all column types.
 * Extended with conditional rendering logic.
 */
declare interface BaseColumnConfig extends ConditionalConfig<BaseColumnConfig> {
    /** Cell type identifier */
    type?: CellType | null;
    /** CSS classes */
    class?: CssClass | null;
    /** Inline styles */
    style?: string | null;
    /** Conditional rules for cell styling applied to the <td> element */
    cellRules?: CellRules | null;
    /** Custom data attributes */
    [key: `data-${string}`]: string | null | undefined;
}

/**
 * Complete body configuration structure.
 * Defines column configurations, styles, and conditional rules.
 */
declare interface Body_2 {
    /** Configuration for individual columns by key. */
    columnConfigs?: Record<string, ColumnConfig> | null;
    /** CSS styles for columns by key. */
    columnStyles?: Record<string, CssClass> | null;
    /** Body settings. */
    settings?: BodySettings | null;
    /** Conditional rules for row styling. */
    rowRules?: RowRules | null;
    /** Allow additional properties for backward compatibility. */
    [key: string]: unknown;
}
export { Body_2 as Body }

/**
 * Body cell configuration - with formatting options.
 */
export declare interface BodyCellConfig extends BaseCellConfig {
    type?: 'static' | 'icon' | 'link' | 'badge' | 'checkbox' | 'actions' | null;
    slice?: number | null;
    sliceEnd?: string | null;
    number?: boolean | null;
    currency?: string | null;
    unit?: string | null;
    date?: boolean | null;
    datetime?: boolean | null;
    phone?: boolean | null;
    time?: boolean | null;
    raw?: boolean | null;
    pad?: number | null;
    padStart?: number | null;
    padEnd?: number | null;
    chars?: string | null;
}

/**
 * Global settings for the table body.
 */
export declare interface BodySettings {
    /** Enable striped rows. */
    striped?: boolean | null;
    /** Enable hover effect on rows. */
    hoverable?: boolean | null;
}

/**
 * Bootstrap color variants.
 */
export declare type BootstrapColor = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light';

/**
 * Configuration for button columns.
 *
 * Renders a Bootstrap 5 button. With `route` → `<a class="btn" href>` (navigation
 * button); without `route` → `<button type="{htmlType}">` (real button). The label
 * comes from the item `field` or the static `value`, passing through the same
 * formatter chain as `static`. An optional `icon` (config.icons registry key) is
 * rendered as an `<i>` glyph before/after the text per `iconPosition`.
 */
declare interface ButtonConfig extends BaseColumnConfig {
    type: 'button';
    /** Bootstrap button variant (primary, secondary, outline-*, link, …) */
    variant?: string | null;
    /** Button size (sm, md, lg) */
    size?: Size | null;
    /** URL template — its presence selects `<a class="btn">` over `<button>` */
    route?: string | null;
    /** Icon registry key (config.icons) rendered as an `<i>` glyph */
    icon?: string | null;
    /** Icon placement relative to the text ('start' default | 'end') */
    iconPosition?: IconPosition | null;
    /** Circular button (rounded-circle) */
    rounded?: boolean | null;
    /** Pill button (rounded-pill) */
    pill?: boolean | null;
    /** Disabled state */
    disabled?: boolean | null;
    /** Tooltip text */
    title?: string | null;
    /** HTML button type ('button' default | 'submit' | 'reset') — only on the `<button>` element */
    htmlType?: ButtonHtmlType | null;
    /** Fixed label text (static mode) */
    value?: string | null;
    /** Item field name whose value becomes the label */
    field?: string | null;
    /** Field key to use in URL generation */
    key?: string | null;
    /** Bootstrap color variant */
    color?: BootstrapColor | null;
    /** Background color (Bootstrap color or CSS color value) */
    background?: string | null;
    /** Text alignment */
    align?: Align | null;
    /** CSS font-size value (e.g. '12px', '1rem') */
    fontSize?: string | null;
    /** CSS font-weight value (100-900, normal, bold, lighter, bolder) */
    fontWeight?: CssNumericValue;
    /** Italic text style */
    italic?: boolean | null;
    /** Normal (upright) font style — resets italic (`font-style: normal`) */
    normal?: boolean | null;
    /** CSS line-height value (e.g. '1.5', '24px') */
    lineHeight?: CssNumericValue;
    /** Bootstrap text utility class (e.g. 'text-truncate') */
    text?: string | null;
    /** Transform to uppercase */
    uppercase?: boolean | null;
    /** Transform to lowercase */
    lowercase?: boolean | null;
    /** Capitalize first letter */
    capitalize?: boolean | null;
    /** Monospace font family */
    monospace?: boolean | null;
    /** Truncate text to length */
    slice?: number | null;
    /** Format as number */
    number?: boolean | null;
    /** Format as currency */
    currency?: boolean | null;
    /** Format as date */
    date?: boolean | null;
    /** Format as phone number */
    phone?: boolean | null;
    /** Unit to append (e.g., 'kg', '%') */
    unit?: string | null;
    /** Start (left) padding length */
    padStart?: number | null;
    /** End (right) padding length */
    padEnd?: number | null;
    /** Character used for padding */
    chars?: string | null;
    /** Value-based presentation mapping, resolved by `resolveMappingConfig` after if/else flattening (selector: `field`) */
    mapping?: Record<string, ButtonMappingEntry> | null;
}

/**
 * HTML button type attributes.
 */
declare type ButtonHtmlType = 'button' | 'submit' | 'reset';

/**
 * Mapping entry for button configuration — value → presentation lookup resolved by the
 * generic `resolveMappingConfig` (flatten layer). Presentation-only: no `label`/`value`
 * alias (the button label stays the `field`, which is also the mapping selector; `field`
 * wins over `value` in `resolveFieldOrValueText`, so a mapped label could never render).
 * No `type`/`field`/`value`/`key`/`if`/`else`/`cellRules`/`mapping`.
 */
declare interface ButtonMappingEntry {
    variant?: string | null;
    color?: BootstrapColor | null;
    background?: string | null;
    size?: Size | null;
    rounded?: boolean | null;
    pill?: boolean | null;
    disabled?: boolean | null;
    icon?: string | null;
    iconPosition?: IconPosition | null;
    title?: string | null;
    route?: string | null;
    class?: CssClass | null;
}

/**
 * Cell content types
 */
declare type CellContent = string | number | null;

/**
 * Style options applicable to table cells and rows.
 */
export declare interface CellFormattingOptions {
    background?: string | null;
    color?: string | null;
    borderTop?: boolean | null;
    borderBottom?: boolean | null;
    borderLeft?: boolean | null;
    borderRight?: boolean | null;
    borderColor?: string | null;
    borderWidth?: string | null;
    padding?: string | null;
    class?: CssClass | null;
    style?: string | null;
    opacity?: number | null;
}

/**
 * Conditional rules for cell styling.
 */
export declare type CellRules = CellFormattingOptions & ConditionalConfig<CellFormattingOptions>;

/**
 * Available cell types for advanced rendering.
 */
export declare type CellType = 'number' | 'currency' | 'date' | 'datetime' | 'phone' | 'time' | 'static' | 'icon' | 'link' | 'modal' | 'reference' | 'badge' | 'progress' | 'button' | 'custom';

/**
 * Discriminated union of all possible column configurations.
 */
export declare type ColumnConfig = StaticConfig | IconConfig | LinkConfig | ModalConfig | BadgeConfig | ProgressConfig | ButtonConfig | CustomConfig | ReferenceConfig;

/**
 * Configuration for conditional rendering based on field values.
 */
export declare interface ConditionalConfig<TConfig = Record<string, unknown>> {
    /** The field key to check the condition against */
    key?: string | null;
    /** Array of conditions to evaluate */
    if?: ConditionalRule<TConfig>[];
    /** Default configuration if no condition is met */
    else?: TConfig | null;
}

/**
 * Conditional Rendering Types
 */
/**
 * Operators used in conditional rendering logic.
 */
export declare type ConditionalOperator = 'eq' | 'ne' | 'neq' | 'gt' | 'bigger' | 'gte' | 'biggerOrEqual' | 'lt' | 'smaller' | 'lte' | 'smallerOrEqual' | 'between' | 'in' | 'notIn' | 'contains' | 'startsWith' | 'endsWith' | 'regex' | 'null' | 'notNull' | 'empty' | 'notEmpty' | 'true' | 'false';

/**
 * A single rule for conditional rendering.
 * It's a "flat" structure where the operator is the key.
 */
export declare type ConditionalRule<TConfig = Record<string, unknown>> = {
    [key: string]: unknown;
} & TConfig;

/**
 * Config Store Interface
 * State and methods returned by the config store
 * All keys are required, but may be nullable
 */
export declare interface ConfigStore {
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
    /** Allowed HTML tags for sanitizing raw: true cells (formatRaw) */
    rawHtmlAllowedTags: string[] | null;
    /** Allowed HTML attributes for sanitizing raw: true cells (formatRaw) */
    rawHtmlAllowedAttr: string[] | null;
    /** Whether to allow data-* attributes when sanitizing raw: true cells */
    rawHtmlAllowDataAttr: boolean | null;
}

/**
 * Core Store Interface
 * Type of the store returned by useCoreStore
 */
export declare interface CoreStore {
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
}

/**
 * CSS class name(s) - can be a single string or an array of strings.
 */
declare type CssClass = string | string[];

/**
 * CSS property value that accepts both string and number formats.
 * Used for properties like fontWeight (700 or 'bold') and lineHeight (1.5 or '24px').
 */
declare type CssNumericValue = string | number | null;

/**
 * Configuration for custom rendered columns.
 *
 * Four rendering modes (priority order): `renderer` (host fn → HTML) → `callback` (host fn →
 * text) → `template` (HTML string + placeholder/mapping substitution) → default (plain value).
 * See `.claude/docs/types/custom.md`.
 */
declare interface CustomConfig extends BaseColumnConfig {
    type: 'custom';
    /** Single field name to read from the row item (the primary value source). */
    field?: string | null;
    /** Multiple field names — passed to the `renderer` as an array of resolved values. */
    fields?: string[] | null;
    /** Fixed text value (fallback value source when no `field`/`fields`). */
    value?: string | null;
    /** Name of the renderer function in `config.renderers` (returns HTML → sanitized). */
    renderer?: string | null;
    /** Name of the callback function in `config.callbacks` (returns plain text). */
    callback?: string | null;
    /** HTML template string with `{value}`/`{field}`/`{class}`/`{icon}`/… placeholders. */
    template?: string | null;
    /** Extra parameters forwarded to the `callback` (3rd argument). */
    params?: Record<string, unknown> | null;
    /** Value-based template-parameter mapping (exact or `"min-max"` range keys). */
    mapping?: Record<string, CustomTemplateParams> | null;
    /** Field key to use in URL generation */
    key?: string | null;
    /** Bootstrap color variant */
    color?: BootstrapColor | null;
    /** Background color (Bootstrap color or CSS color value) */
    background?: string | null;
    /** Text alignment */
    align?: Align | null;
    /** CSS font-size value (e.g. '12px', '1rem') */
    fontSize?: string | null;
    /** CSS font-weight value (100-900, normal, bold, lighter, bolder) */
    fontWeight?: CssNumericValue;
    /** Italic text style */
    italic?: boolean | null;
    /** Normal (upright) font style — resets italic (`font-style: normal`) */
    normal?: boolean | null;
    /** CSS line-height value (e.g. '1.5', '24px') */
    lineHeight?: CssNumericValue;
    /** Bootstrap text utility class (e.g. 'text-truncate') */
    text?: string | null;
    /** Transform to uppercase */
    uppercase?: boolean | null;
    /** Transform to lowercase */
    lowercase?: boolean | null;
    /** Capitalize first letter */
    capitalize?: boolean | null;
    /** Monospace font family */
    monospace?: boolean | null;
    /** Truncate text to length */
    slice?: number | null;
    /** Format as number */
    number?: boolean | null;
    /** Format as currency */
    currency?: boolean | null;
    /** Format as date */
    date?: boolean | null;
    /** Format as phone number */
    phone?: boolean | null;
    /** Unit to append (e.g., 'kg', '%') */
    unit?: string | null;
    /** Start (left) padding length */
    padStart?: number | null;
    /** End (right) padding length */
    padEnd?: number | null;
    /** Character used for padding */
    chars?: string | null;
}

/**
 * Template-parameter set for a `custom` mapping entry.
 *
 * Unlike other types' mapping entries (config-merge dialect), a `custom` mapping entry is a
 * **template-parameter bag**: its keys are placeholder names substituted into the `template`
 * string (`{class}`, `{icon}`, `{label}`, …). Keys are therefore free (per-template), so no
 * key-allowlist nested-strip applies here; values are restricted to primitives (enforced by
 * `CustomTemplateParamsZod`) and the final DOMPurify pass over the substituted HTML is the
 * security boundary. Documented placeholder targets:
 */
declare interface CustomTemplateParams {
    /** CSS class placeholder (`{class}`) */
    class?: string | null;
    /** Icon glyph/text placeholder (`{icon}`) */
    icon?: string | null;
    /** Display label placeholder (`{label}`) */
    label?: string | null;
    /** Any other placeholder name → primitive value */
    [key: string]: string | number | boolean | null | undefined;
}

/**
 * ECS-compatible error object
 * Standard Elastic Common Schema format
 */
export declare interface ECSError {
    /**
     * Unique identifier for the error (optional)
     */
    id?: string;
    /**
     * Severity of the error
     */
    severity: ErrorSeverity;
    /**
     * Timestamp (ISO 8601 format)
     */
    timestamp: string;
    /**
     * Name of the component where the error occurred
     */
    component: string;
    /**
     * Action/operation during which the error occurred
     */
    action: string;
    /**
     * Log level (backwards compatibility)
     * @deprecated Use `severity` instead. This field is maintained for ECS compatibility.
     */
    level: ErrorSeverity;
    /**
     * Type of the error
     */
    type: ErrorType;
    /**
     * Error message
     */
    message: string;
    /**
     * Detailed error description (optional)
     */
    details?: string;
    /**
     * Key for identifying the error (e.g. field name during validation)
     */
    key?: string;
    /**
     * Stack trace (optional, useful in developer mode)
     */
    stack?: string;
    /**
     * How many times this error occurred.
     *
     * The store merges repeats of the same error (same `key`, `severity` and
     * `message`) into the entry that is already there instead of appending a new
     * one, and counts them here. **Absent while the error happened only once**,
     * so `count ?? 1` is the occurrence count.
     */
    count?: number;
    /**
     * Timestamp of the most recent occurrence (ISO 8601).
     *
     * Absent until the error repeats — `timestamp` then marks the first
     * occurrence and this one the last.
     */
    lastTimestamp?: string;
    /**
     * Additional metadata (optional)
     */
    metadata?: Record<string, unknown>;
}

/**
 * ErrorHandler component
 * Displays errors to the user
 *
 * @example
 * ```tsx
 * <ErrorHandler
 *     errorStore={errorStore}
 *     showDismissAll={true}
 *     maxVisible={5}
 * />
 * ```
 */
export declare const ErrorHandler: DefineComponent<ExtractPropTypes<    {
/**
* Error handler store instance
*/
errorStore: {
type: PropType<ErrorHandlerStore_2>;
required: true;
};
/**
* Maximum number of errors to display
* If there are more errors, a summary is shown
*/
maxVisible: {
type: NumberConstructor;
default: number;
};
/**
* Whether to show the "Dismiss all" button
*/
showDismissAll: {
type: BooleanConstructor;
default: boolean;
};
/**
* Severity filter - only errors with the given severity are shown
*/
severityFilter: {
type: PropType<ErrorSeverity[]>;
default: () => string[];
};
/**
* Component identifier for dismiss operations
*/
componentFilter: {
type: StringConstructor;
default: undefined;
};
/**
* Overridable UI texts (`config.labels`). Missing keys fall back to
* `DEFAULT_LABELS`, so a partial object is enough.
*/
labels: {
type: PropType<Partial<AuraLabels>>;
default: () => AuraLabels;
};
}>, () => VNode<RendererNode, RendererElement, {
[key: string]: any;
}> | null, {}, {}, {}, ComponentOptionsMixin, ComponentOptionsMixin, {}, string, PublicProps, Readonly<ExtractPropTypes<    {
/**
* Error handler store instance
*/
errorStore: {
type: PropType<ErrorHandlerStore_2>;
required: true;
};
/**
* Maximum number of errors to display
* If there are more errors, a summary is shown
*/
maxVisible: {
type: NumberConstructor;
default: number;
};
/**
* Whether to show the "Dismiss all" button
*/
showDismissAll: {
type: BooleanConstructor;
default: boolean;
};
/**
* Severity filter - only errors with the given severity are shown
*/
severityFilter: {
type: PropType<ErrorSeverity[]>;
default: () => string[];
};
/**
* Component identifier for dismiss operations
*/
componentFilter: {
type: StringConstructor;
default: undefined;
};
/**
* Overridable UI texts (`config.labels`). Missing keys fall back to
* `DEFAULT_LABELS`, so a partial object is enough.
*/
labels: {
type: PropType<Partial<AuraLabels>>;
default: () => AuraLabels;
};
}>> & Readonly<{}>, {
labels: Partial<AuraLabels>;
maxVisible: number;
showDismissAll: boolean;
severityFilter: ErrorSeverity[];
componentFilter: string;
}, {}, {}, {}, string, ComponentProvideOptions, true, {}, any>;

/**
 * Error Handler Store Interface
 * State and methods returned by the error handler store
 */
export declare interface ErrorHandlerStore {
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
    addError(error: Omit<ECSError, 'timestamp' | 'level'> & {
        level?: ErrorSeverity;
    }): void;
    /** Clear errors */
    clearErrors(): void;
    /**
     * Clear the errors carrying a given key
     * @param key Error key (the caller-supplied one, or the generated `component.action.type`)
     */
    clearByKey(key: string): void;
}

/**
 * Error Handler Store interface
 * The store type returned by useErrorHandlerStore
 */
declare interface ErrorHandlerStore_2 {
    errors: ECSError[];
    hasErrors: boolean;
    isValid: boolean;
    clearErrors: () => void;
    clearByKey: (key: string) => void;
    clearByComponent: (component: string) => void;
    clearByType: (type: ErrorType) => void;
}

/**
 * ECS (Elastic Common Schema) severity levels
 * Compatible with the Elastic Stack
 */
export declare type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info' | 'debug';

/**
 * Error store state interface
 */
export declare interface ErrorState {
    /**
     * Whether there is invalid data
     */
    isValid: boolean;
    /**
     * Whether there are errors
     */
    hasErrors: boolean;
    /**
     * Array of errors
     */
    errors: ECSError[];
}

/**
 * Error types
 * Distinguishes between the different error categories
 */
export declare type ErrorType = 'validation' | 'network' | 'authentication' | 'authorization' | 'not_found' | 'server' | 'client' | 'api' | 'unknown';

/**
 * Filter element definition for dropdown filtering.
 */
declare interface FilterElement {
    /** The value to filter by */
    value: string | number | boolean | null;
    /** The label to display */
    label: string | number | boolean | null;
}

/**
 * Single filter item definition.
 */
declare interface FilterItem {
    /** The field key to filter by */
    field: string;
    /** The selected values to filter by */
    values: unknown[];
}

/**
 * Complete footer configuration structure.
 */
export declare interface Footer {
    /** Footer rows. */
    rows?: FooterRow[];
    /** Footer settings. */
    settings?: FooterSettings | null;
    /** Allow additional properties for backward compatibility. */
    [key: string]: unknown;
}

/**
 * Footer cell configuration.
 */
export declare interface FooterCellConfig extends BaseCellConfig {
    label?: string | null;
    content?: string | null;
}

/**
 * Represents a single row in the table footer.
 * Inherits all properties from HeaderRow.
 */
export declare type FooterRow = HeaderRow;

/**
 * Global settings for the table footer.
 */
export declare interface FooterSettings {
    /** Whether the footer sticks to the bottom. */
    sticky?: boolean | null;
    /** Fixed height for the footer. */
    height?: string | null;
}

/**
 * Complete header configuration structure.
 *
 * @example
 * ```typescript
 * const header: Header = {
 *   rows: [
 *     { cells: [{ content: 'Name', key: 'name' }] }
 *   ],
 *   settings: { sticky: true }
 * };
 * ```
 */
export declare interface Header {
    /** Header rows. */
    rows?: HeaderRow[];
    /** Header settings. */
    settings?: HeaderSettings | null;
    [key: string]: unknown;
}

/**
 * Definition of a single cell in the table header.
 *
 * @example
 * ```typescript
 * const cell: HeaderCell = {
 *   content: 'User ID',
 *   key: 'id',
 *   field: 'id',
 *   sortable: true,
 *   width: '100px'
 * };
 * ```
 */
export declare interface HeaderCell {
    /** Displayed text content. Required (can be null for special cases). */
    content: CellContent;
    /** Unique identifier for the column. Required. */
    key: string;
    /** Field name in the data item. Mutually exclusive with `fields`. */
    field?: string;
    /** Array of field names for multi-field cells. Mutually exclusive with `field`. */
    fields?: string[];
    /** Alternative label (backward compatibility). */
    label?: string | null;
    /** Number of columns validation extends to. */
    colspan?: number | null;
    /** Number of rows validation extends to. */
    rowspan?: number | null;
    /** Width of the column (CSS units: px, %, rem, auto). */
    width?: string | null;
    /** Whether the column width is resizable. */
    resizable?: boolean | null;
    /** General padding value. */
    pad?: number | null;
    /** Start (left) padding value. */
    padStart?: number | null;
    /** End (right) padding value. */
    padEnd?: number | null;
    /** Character used for padding. */
    chars?: string | null;
    /** Enable sorting for this column. */
    sortable?: boolean | null;
    /** Enable searching for this column. */
    searchable?: boolean | null;
    /** Enable filtering for this column. */
    filterable?: boolean | null;
    /** Elements for filtering (array of FilterElement objects, simple array, or object). */
    elements?: FilterElement[] | (string | number)[] | Record<string, string | number> | null;
    /** Enable selection for this column. */
    selectable?: boolean | null;
    /** Show/hide this column initial state. */
    show?: boolean | null;
    /** Enable range filtering (between) for this column. */
    between?: boolean | null;
    /** Reference field name for filtering/searching. */
    reference?: string | null;
    /** Text alignment. */
    align?: Align | null;
    /** Size variant. */
    size?: Size | null;
    /** Text color (Bootstrap or CSS). */
    color?: string | null;
    /** Background color (Bootstrap or CSS). */
    background?: string | null;
    /** Font size (CSS). */
    fontSize?: string | null;
    /** Font weight (CSS or number). */
    fontWeight?: CssNumericValue;
    /** Line height (CSS or number). */
    lineHeight?: CssNumericValue;
    /** Italic style. */
    italic?: boolean | null;
    /** Normal style. */
    normal?: boolean | null;
    /** Monospace font family. */
    monospace?: boolean | null;
    /** Bootstrap text utility class (e.g. text-truncate). */
    text?: string | null;
    /** Format as number. */
    number?: boolean | null;
    /** Indicates this column contains currency values (uses config.currencyCode for formatting). */
    currency?: boolean | string | null;
    /** Format with Intl.NumberFormat unit style. Value must be a valid unit identifier (e.g., 'kilogram', 'celsius', 'percent'). */
    unit?: string | null;
    /** Format as date. */
    date?: boolean | null;
    /** Format as date and time. */
    datetime?: boolean | null;
    /** Format as phone number. */
    phone?: boolean | null;
    /** Format seconds as duration (HH:mm:ss). Only integers accepted, supports negative values. */
    time?: boolean | null;
    /** Truncate text to length. */
    slice?: number | null;
    /** Text to append after slicing. */
    sliceEnd?: string | null;
    /** Transform to uppercase. */
    uppercase?: boolean | null;
    /** Transform to lowercase. */
    lowercase?: boolean | null;
    /** Capitalize first letter. */
    capitalize?: boolean | null;
    /** Handle as object. */
    object?: boolean | null;
    /** Render as raw HTML. */
    raw?: boolean | string | null;
    /** Custom CSS classes. */
    class?: CssClass | null;
    /** Inline CSS styles. */
    style?: string | null;
    /** Cell type identifier. */
    type?: CellType | null;
    /** Custom data attributes. */
    [key: `data-${string}`]: string | null | undefined;
}

/**
 * Header cell configuration - with sorting support.
 */
export declare interface HeaderCellConfig extends BaseCellConfig {
    label?: string | null;
    content?: string | null;
    field?: string | null;
    sortable?: boolean | null;
    searchable?: boolean | null;
    filterable?: boolean | null;
    elements?: (string | number)[] | Record<string, string | number> | null;
}

/**
 * Represents a single row in the table header.
 */
export declare interface HeaderRow {
    /** Array of header cells in this row. */
    cells?: HeaderCell[];
    [key: string]: unknown;
}

/**
 * Global settings for the table header.
 */
export declare interface HeaderSettings {
    /** Whether the header sticks to the top during scroll. */
    sticky?: boolean | null;
    /** Fixed height for the header. */
    height?: string | null;
    /** Fields available for global search. */
    searchableItems?: string[];
}

/**
 * Configuration for icon columns.
 *
 * The `icon`, `variant` and `color` fields are accepted in the API response input,
 * but the preprocessor layer (⑦.5) normalizes them into the `class` array
 * before rendering. After preprocessing, only `class` is used for CSS.
 */
declare interface IconConfig extends BaseColumnConfig {
    type: 'icon';
    /** Icon name — resolved into `class` by the preprocessor via config.icons registry */
    icon?: string | null;
    /** Variant key — resolved into `text-{color}` class by the preprocessor via config.variants registry */
    variant?: string | null;
    /** Color key — alternative to variant; same preprocessing resolution chain */
    color?: string | null;
    /** Accessible label rendered as aria-label on the <i> element; max 500 chars */
    alt?: string | null;
    /** Tooltip text rendered as title attribute on the <i> element; max 500 chars */
    title?: string | null;
    /** URL template; {key} placeholders resolved from item data, dots converted to slashes, siteName prepended */
    route?: string | null;
    size?: Size | null;
    /** Field key to use in URL generation and conditional evaluation */
    key?: string | null;
    /** Value-based mapping configuration, resolved by `resolveMappingConfig` after if/else flattening */
    mapping?: Record<string, IconMappingEntry> | null;
}

/**
 * Mapping entry for icon configuration — value → icon-config lookup resolved by the
 * generic `resolveMappingConfig` (flatten layer). No `type`/`label`: icons are not
 * textual content, so there is no display-text field to alias.
 */
declare interface IconMappingEntry {
    icon?: string | null;
    variant?: string | null;
    color?: string | null;
    class?: CssClass | null;
    title?: string | null;
    alt?: string | null;
}

/**
 * Icon position options.
 */
declare type IconPosition = 'start' | 'end';

/**
 * Label position options for progress bars.
 */
declare type LabelPosition = 'inside' | 'outside';

/**
 * Label type for boolean or string labels
 */
declare type LabelType = boolean | string | null;

/**
 * Configuration for link columns.
 */
declare interface LinkConfig extends BaseColumnConfig {
    type: 'link';
    /** URL template */
    route?: string | null;
    target?: LinkTarget | null;
    /** Link relationship; auto-set to "noopener noreferrer" for target="_blank" when omitted */
    rel?: string | null;
    title?: string | null;
    /** Static text value */
    value?: string | null;
    /** Field name to display */
    field?: string | null;
    /** Field key to use in URL generation */
    key?: string | null;
    /** Bootstrap color (color name or CSS color value) */
    color?: string | null;
    /** Bootstrap link variant — resolved into `link-{variant}` class */
    variant?: string | null;
    /** Text alignment */
    align?: Align | null;
    /** CSS font-size value (e.g. '12px', '1rem') */
    fontSize?: string | null;
    /** CSS font-weight value (100-900, normal, bold, lighter, bolder) */
    fontWeight?: CssNumericValue;
    /** Italic text style */
    italic?: boolean | null;
    /** CSS line-height value (e.g. '1.5', '24px') */
    lineHeight?: CssNumericValue;
    /** Monospace font family */
    monospace?: boolean | null;
    /** Bootstrap text utility class (e.g. 'text-truncate') */
    text?: string | null;
    /** Transform to uppercase */
    uppercase?: boolean | null;
    /** Transform to lowercase */
    lowercase?: boolean | null;
    /** Capitalize first letter */
    capitalize?: boolean | null;
    /** Truncate text to length */
    slice?: number | null;
    /** Format as currency */
    currency?: boolean | null;
    /** Format as date */
    date?: boolean | null;
    /** Format as phone number */
    phone?: boolean | null;
    /** Unit to append (e.g., 'kg', '%') */
    unit?: string | null;
    /** Value-based presentation mapping, resolved by `resolveMappingConfig` after if/else flattening (selector: `field`) */
    mapping?: Record<string, LinkMappingEntry> | null;
}

/**
 * Mapping entry for link configuration — value → presentation lookup resolved by the
 * generic `resolveMappingConfig` (flatten layer). Presentation-only: no `label`/`value`
 * alias (the link label stays the `field`, which is also the mapping selector; `field`
 * wins over `value` in `resolveFieldOrValueText`, so a mapped label could never render).
 * No `type`/`field`/`value`/`key`/`if`/`else`/`cellRules`/`mapping`.
 */
declare interface LinkMappingEntry {
    variant?: string | null;
    color?: string | null;
    class?: CssClass | null;
    title?: string | null;
    route?: string | null;
    target?: LinkTarget | null;
    rel?: string | null;
}

/**
 * HTML link target attributes.
 */
declare type LinkTarget = '_blank' | '_self' | '_parent' | '_top';

/**
 * Configuration for modal trigger columns.
 */
declare interface ModalConfig extends BaseColumnConfig {
    type: 'modal';
    /** Modal unique identifier — optional when using conditional if/else rendering (id provided in branches) */
    id?: string | null;
    /** API endpoint template with {key} placeholders */
    route?: string | null;
    /** Nested trigger content (preprocessed from shorthand) */
    content?: IconConfig | ButtonConfig | LinkConfig | null;
    /** Shorthand icon trigger — preprocessor normalizes to content */
    icon?: string | null;
    /** Shorthand variant for icon trigger — preprocessor normalizes to class */
    variant?: string | null;
    /** Shorthand button style (e.g. "outline-primary") — preprocessor normalizes to content */
    button?: string | null;
    /** Display text for button shorthand */
    value?: string | null;
    /** Trigger size */
    size?: Size | null;
    /** Link target for link type triggers */
    target?: LinkTarget | null;
    /** Accessible label */
    alt?: string | null;
    /** Tooltip text */
    title?: string | null;
    /** Field key for URL generation or conditional evaluation */
    key?: string | null;
}

/**
 * Laravel pagination links structure.
 */
export declare interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

/**
 * Laravel pagination metadata structure.
 */
export declare interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    path: string;
    per_page: number;
    to: number | null;
    total: number;
}

/**
 * Configuration for a single bar in a stacked progress bar.
 */
declare interface ProgressBar {
    field: string;
    variant?: BootstrapColor | null;
    label?: string | null;
}

/**
 * Configuration for progress bar columns.
 */
declare interface ProgressConfig extends BaseColumnConfig {
    type: 'progress';
    /** Item field name whose numeric value drives the bar */
    field?: string | null;
    /** Fixed numeric value (static mode) */
    value?: number | null;
    /** Maximum value or field name */
    max?: ProgressMaxValue | null;
    min?: number | null;
    variant?: BootstrapColor | null;
    height?: string | null;
    striped?: boolean | null;
    animated?: boolean | null;
    label?: LabelType;
    labelPosition?: LabelPosition | null;
    /** Range-based mapping configuration (key format: "min-max") */
    mapping?: Record<string, ProgressMappingValue> | null;
    /** Threshold-based coloring */
    thresholds?: Record<string, [number, number]> | null;
    /** Stacked progress bars */
    stacked?: boolean | null;
    bars?: ProgressBar[] | null;
    showValue?: boolean | null;
    showPercent?: boolean | null;
    decimals?: number | null;
    suffix?: string | null;
    prefix?: string | null;
    /** Bootstrap color variant (label text colour) */
    color?: BootstrapColor | null;
    /** Background color (Bootstrap color or CSS color value) */
    background?: string | null;
    /** Text alignment */
    align?: Align | null;
    /** CSS font-size value (e.g. '12px', '1rem') */
    fontSize?: string | null;
    /** CSS font-weight value (100-900, normal, bold, lighter, bolder) */
    fontWeight?: CssNumericValue;
    /** Italic text style */
    italic?: boolean | null;
    /** CSS line-height value (e.g. '1.5', '24px') */
    lineHeight?: CssNumericValue;
    /** Bootstrap text utility class (e.g. 'text-truncate') */
    text?: string | null;
    /** Monospace font family */
    monospace?: boolean | null;
}

/**
 * Mapping value for progress configuration.
 */
declare interface ProgressMappingValue {
    variant?: BootstrapColor | null;
    label?: string | null;
    class?: CssClass | null;
}

/**
 * Value type for progress max property - can be a number or a field name.
 */
declare type ProgressMaxValue = number | string;

/**
 * Vue 3 prop validator type definition
 *
 * Optional fields:
 * - required: defaults to false (if not provided)
 * - default: if not provided, the prop value will be undefined
 * - validator: optional custom validation logic
 */
export declare interface PropValidator<T = any> {
    type: PropType<T>;
    required?: boolean;
    default?: T | (() => T) | null | undefined;
    validator?: (value: unknown) => boolean;
}

/**
 * Query parameters for API requests.
 */
export declare interface QueryParams {
    readonly page: number;
    readonly paginate: number;
    readonly sortable?: SortItem[];
    readonly searchable?: SearchItem[];
    readonly filterable?: FilterItem[];
    readonly globalSearch?: string;
}

/**
 * A single bound of a range (`between`) search. `null` means "no bound" (open range).
 */
declare type RangeBound = number | string | null;

/**
 * Configuration for reference columns (displaying values from other fields).
 *
 * Unlike `static` (which renders a literal `value`), a reference renders the
 * value(s) read from the row item: a single `field`, or several `fields[]`
 * joined by `separator`. The resolved text passes through the same formatter
 * chain as `static` (case transforms, slice, currency/date/phone/number, unit,
 * padding) plus content-level visual formatting.
 */
declare interface ReferenceConfig extends BaseColumnConfig {
    type: 'reference';
    /** Field name to read from the row item */
    field?: string | null;
    /** Multiple field names to join (takes precedence over `field`) */
    fields?: string[] | null;
    /** Separator inserted between joined `fields` values (default " ") */
    separator?: string | null;
    /** Field key used by conditional (if/else) evaluation, e.g. the `empty` operator */
    key?: string | null;
    /**
     * Fixed text value — the `resolveMappingConfig` `label`→`value` alias target.
     * Takes precedence over `fields`/`field` in `renderReferenceNode`.
     */
    value?: string | null;
    /** Value-based mapping configuration, resolved by `resolveMappingConfig` after if/else flattening */
    mapping?: Record<string, ReferenceMappingEntry> | null;
    /** Bootstrap color variant */
    color?: BootstrapColor | null;
    /** Background color (Bootstrap color or CSS color value) */
    background?: string | null;
    /** Text alignment */
    align?: Align | null;
    /** CSS font-size value (e.g. '12px', '1rem') */
    fontSize?: string | null;
    /** CSS font-weight value (100-900, normal, bold, lighter, bolder) */
    fontWeight?: CssNumericValue;
    /** Italic text style */
    italic?: boolean | null;
    /** Normal (upright) font style — resets italic (`font-style: normal`) */
    normal?: boolean | null;
    /** CSS line-height value (e.g. '1.5', '24px') */
    lineHeight?: CssNumericValue;
    /** Bootstrap text utility class (e.g. 'text-truncate') */
    text?: string | null;
    /** Transform to uppercase */
    uppercase?: boolean | null;
    /** Transform to lowercase */
    lowercase?: boolean | null;
    /** Capitalize first letter */
    capitalize?: boolean | null;
    /** Monospace font family */
    monospace?: boolean | null;
    /** Truncate text to length */
    slice?: number | null;
    /** Format as number */
    number?: boolean | null;
    /** Format as currency */
    currency?: boolean | null;
    /** Format as date */
    date?: boolean | null;
    /** Format as phone number */
    phone?: boolean | null;
    /** Unit to append (e.g., 'kg', '%') */
    unit?: string | null;
    /** Start (left) padding length */
    padStart?: number | null;
    /** End (right) padding length */
    padEnd?: number | null;
    /** Character used for padding */
    chars?: string | null;
}

/**
 * Mapping entry for reference configuration — value → display-label lookup resolved by
 * the generic `resolveMappingConfig` (flatten layer). `label` is normalized into the
 * config's `value` field by the resolver; the formatting fields mirror `ReferenceConfig`.
 * No `type`/`field`/`fields`/`separator`/`key`/`if`/`else`/`cellRules`/`mapping`: an entry
 * cannot switch type, introduce a new value source, or nest further conditions/mappings.
 */
declare interface ReferenceMappingEntry {
    label?: string | null;
    color?: BootstrapColor | null;
    background?: string | null;
    align?: Align | null;
    fontSize?: string | null;
    fontWeight?: CssNumericValue;
    italic?: boolean | null;
    normal?: boolean | null;
    lineHeight?: CssNumericValue;
    text?: string | null;
    uppercase?: boolean | null;
    lowercase?: boolean | null;
    capitalize?: boolean | null;
    monospace?: boolean | null;
    slice?: number | null;
    number?: boolean | null;
    currency?: boolean | null;
    date?: boolean | null;
    phone?: boolean | null;
    unit?: string | null;
    padStart?: number | null;
    padEnd?: number | null;
    chars?: string | null;
    class?: CssClass | null;
}

/**
 * A row identifier used by the selection feature. Sent to the server in the
 * `selected` request field.
 */
declare type RowId = string | number;

/**
 * Conditional rules for row styling.
 */
export declare type RowRules = CellFormattingOptions & ConditionalConfig<CellFormattingOptions>;

/**
 * Single search item definition.
 */
export declare interface SearchItem {
    /** The field key to search in */
    field: string;
    /** The search term. Omitted for range (`between`) searches. */
    term?: string;
    /** Whether to search for exact match */
    exact?: boolean;
    /** Lower bound for a range (`between`) search. */
    min?: RangeBound;
    /** Upper bound for a range (`between`) search. */
    max?: RangeBound;
}

/**
 * The resolved lower/upper bounds of a range (`between`) search.
 */
declare interface SearchRange {
    min: RangeBound;
    max: RangeBound;
}

/**
 * Size options for various components.
 */
export declare type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Sort direction for table ordering.
 */
export declare type SortDirection = 'asc' | 'desc';

/**
 * Single sort item definition.
 */
export declare interface SortItem {
    /** The field key to sort by */
    field: string;
    /** The direction of sorting */
    direction: SortDirection;
}

/**
 * Configuration for static text content.
 */
declare interface StaticConfig extends BaseColumnConfig {
    type: 'static';
    /** The static text value to display. Optional when using conditional if/else rendering — value is provided inside the branches. */
    value?: string | null;
    /** Bootstrap color variant */
    color?: BootstrapColor | null;
    /** Background color (Bootstrap color or CSS color value) */
    background?: string | null;
    /** Text alignment */
    align?: Align | null;
    /** CSS font-size value (e.g. '12px', '1rem') */
    fontSize?: string | null;
    /** CSS font-weight value (100-900, normal, bold, lighter, bolder) */
    fontWeight?: CssNumericValue;
    /** Italic text style */
    italic?: boolean | null;
    /** Normal (upright) font style — resets italic (`font-style: normal`) */
    normal?: boolean | null;
    /** CSS line-height value (e.g. '1.5', '24px') */
    lineHeight?: CssNumericValue;
    /** Bootstrap text utility class (e.g. 'text-truncate') */
    text?: string | null;
    /** Transform to uppercase */
    uppercase?: boolean | null;
    /** Transform to lowercase */
    lowercase?: boolean | null;
    /** Capitalize first letter */
    capitalize?: boolean | null;
    /** Monospace font family */
    monospace?: boolean | null;
    /** Truncate text to length */
    slice?: number | null;
    /** Format as number */
    number?: boolean | null;
    /** Format as currency */
    currency?: boolean | null;
    /** Format as date */
    date?: boolean | null;
    /** Format as phone number */
    phone?: boolean | null;
    /** Unit to append (e.g., 'kg', '%') */
    unit?: string | null;
    /** Start (left) padding length */
    padStart?: number | null;
    /** End (right) padding length */
    padEnd?: number | null;
    /** Character used for padding */
    chars?: string | null;
    /** Field key to use in URL generation */
    key?: string | null;
}

/**
 * API Resources Store Factory
 *
 * Unified store for managing API response data including header, body, footer, items,
 * pagination metadata and links. Replaces the previous multi-level store hierarchy.
 *
 * Composition root: the store is assembled from focused sub-composables under
 * `./composables/` — the query slices (pagination, sorting, searching, filtering,
 * global search, selection) are pure state, while `use-response-data` owns the
 * validated response and the network layer. The orchestrator wires the cross-cutting
 * `queryParams` computed, session save/restore, and the auto-refetch watchers.
 *
 * @param storeId - Unique identifier for this store instance
 * @param core - Core store instance providing config and error handling
 * @returns Pinia store instance with API resource management capabilities
 *
 * @example
 * ```typescript
 * const apiStore = useApiResourcesStore('my-table', coreStore);
 * await apiStore.fetchData();
 * console.log(apiStore.header?.rows);
 * ```
 */
export declare const useApiResourcesStore: (storeId: string, core: CoreStore) => ApiResourcesStore;

/**
 * Config Store factory
 * @param storeId - Unique store identifier (for the config store)
 * @param mergedConfig - The merged and default config object
 * @param errorHandlerStoreId - Error handler store identifier
 * @returns Pinia store instance with validated config values
 *
 * @remarks
 * The config store is solely responsible for config validation.
 * Every config value is validated and stored as a ref.
 * It uses the error handler store ID for error handling.
 */
export declare const useConfigStore: (storeId: string, mergedConfig: AuraConfig, errorHandlerStoreId: string) => Store<string, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, "debug" | "storeId" | "siteName" | "urlParameter" | "urlParameterLastSegment" | "urlStructure" | "siteToken" | "paginateValues" | "rowsNumber" | "classes" | "showFooter" | "actionButtons" | "showLoadingOverlay" | "showLoadingBar" | "showHeaderSearch" | "showToolbarTitle" | "toolbarTitleContent" | "externalPaginator" | "dateStyle" | "timeZone" | "utcOffset" | "localization" | "currencyCode" | "resources" | "requestMethod" | "sessionKey" | "disableSession" | "accentInsensitiveSearch" | "highlightSearchResults" | "highlightClass" | "href" | "allowExternalApi" | "errorReporting" | "sliceEndText" | "icons" | "variants" | "labels" | "errorReportingService" | "errorReportingApiKey" | "renderers" | "callbacks" | "emptyStateMessage" | "errorReportingEndpoint" | "rawHtmlAllowedTags" | "rawHtmlAllowedAttr" | "rawHtmlAllowDataAttr">, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>>;

/**
 * Core Store factory
 * @param storeId - Unique store identifier
 * @param props - Full Aura props object
 * @returns Pinia store instance
 *
 * @remarks
 * The core store contains the core config merge logic and integrates two stores:
 * - errorStore: dedicated error handler store (useErrorHandlerStore) for handling errors across the whole body
 * - config: dedicated config store (useConfigStore) with the validated config values
 *
 * The config store holds every validated config value as a ref.
 * The error functions are accessible via the errorStore property.
 */
export declare const useCoreStore: (storeId: string, props: AuraProps) => Store<string, Pick<{
config: Store<string, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, "debug" | "storeId" | "siteName" | "urlParameter" | "urlParameterLastSegment" | "urlStructure" | "siteToken" | "paginateValues" | "rowsNumber" | "classes" | "showFooter" | "actionButtons" | "showLoadingOverlay" | "showLoadingBar" | "showHeaderSearch" | "showToolbarTitle" | "toolbarTitleContent" | "externalPaginator" | "dateStyle" | "timeZone" | "utcOffset" | "localization" | "currencyCode" | "resources" | "requestMethod" | "sessionKey" | "disableSession" | "accentInsensitiveSearch" | "highlightSearchResults" | "highlightClass" | "href" | "allowExternalApi" | "errorReporting" | "sliceEndText" | "icons" | "variants" | "labels" | "errorReportingService" | "errorReportingApiKey" | "renderers" | "callbacks" | "emptyStateMessage" | "errorReportingEndpoint" | "rawHtmlAllowedTags" | "rawHtmlAllowedAttr" | "rawHtmlAllowDataAttr">, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>>;
props: AuraProps;
errorStore: Store<string, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "errors">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "hasErrors" | "isValid" | "criticalErrors" | "errorLevelErrors" | "warnings">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "destroy" | "addError" | "addSchemaValidationError" | "clearErrors" | "clearByKey" | "clearByComponent" | "clearByType" | "getErrorsBySeverity" | "getErrorsByComponent" | "getErrorsByKey">>;
isSettingsOpen: Ref<boolean, boolean>;
toggleSettings: () => void;
}, "config" | "props" | "errorStore" | "isSettingsOpen">, Pick<{
config: Store<string, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, "debug" | "storeId" | "siteName" | "urlParameter" | "urlParameterLastSegment" | "urlStructure" | "siteToken" | "paginateValues" | "rowsNumber" | "classes" | "showFooter" | "actionButtons" | "showLoadingOverlay" | "showLoadingBar" | "showHeaderSearch" | "showToolbarTitle" | "toolbarTitleContent" | "externalPaginator" | "dateStyle" | "timeZone" | "utcOffset" | "localization" | "currencyCode" | "resources" | "requestMethod" | "sessionKey" | "disableSession" | "accentInsensitiveSearch" | "highlightSearchResults" | "highlightClass" | "href" | "allowExternalApi" | "errorReporting" | "sliceEndText" | "icons" | "variants" | "labels" | "errorReportingService" | "errorReportingApiKey" | "renderers" | "callbacks" | "emptyStateMessage" | "errorReportingEndpoint" | "rawHtmlAllowedTags" | "rawHtmlAllowedAttr" | "rawHtmlAllowDataAttr">, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>>;
props: AuraProps;
errorStore: Store<string, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "errors">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "hasErrors" | "isValid" | "criticalErrors" | "errorLevelErrors" | "warnings">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "destroy" | "addError" | "addSchemaValidationError" | "clearErrors" | "clearByKey" | "clearByComponent" | "clearByType" | "getErrorsBySeverity" | "getErrorsByComponent" | "getErrorsByKey">>;
isSettingsOpen: Ref<boolean, boolean>;
toggleSettings: () => void;
}, never>, Pick<{
config: Store<string, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, "debug" | "storeId" | "siteName" | "urlParameter" | "urlParameterLastSegment" | "urlStructure" | "siteToken" | "paginateValues" | "rowsNumber" | "classes" | "showFooter" | "actionButtons" | "showLoadingOverlay" | "showLoadingBar" | "showHeaderSearch" | "showToolbarTitle" | "toolbarTitleContent" | "externalPaginator" | "dateStyle" | "timeZone" | "utcOffset" | "localization" | "currencyCode" | "resources" | "requestMethod" | "sessionKey" | "disableSession" | "accentInsensitiveSearch" | "highlightSearchResults" | "highlightClass" | "href" | "allowExternalApi" | "errorReporting" | "sliceEndText" | "icons" | "variants" | "labels" | "errorReportingService" | "errorReportingApiKey" | "renderers" | "callbacks" | "emptyStateMessage" | "errorReportingEndpoint" | "rawHtmlAllowedTags" | "rawHtmlAllowedAttr" | "rawHtmlAllowDataAttr">, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>, Pick<{
storeId: string;
debug: Ref<boolean | null, boolean | null>;
siteToken: Ref<string | boolean | null, string | boolean | null>;
siteName: Ref<string | null, string | null>;
urlParameter: Ref<string | null, string | null>;
href: Ref<string | null, string | null>;
urlParameterLastSegment: Ref<string | null, string | null>;
urlStructure: Ref<string | null, string | null>;
paginateValues: Ref<number[] | null, number[] | null>;
rowsNumber: Ref<number | null, number | null>;
classes: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
icons: Ref<Record<string, string[] | Record<string, string[]>>, Record<string, string[] | Record<string, string[]>>>;
variants: Ref<Record<string, string>, Record<string, string>>;
labels: Ref<    {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}, AuraLabels | {
confirmDeleteTitle: string;
confirmDeleteBody: string;
cancel: string;
confirmDelete: string;
refresh: string;
export: string;
exportCsv: string;
settings: string;
search: string;
clearSearch: string;
searchPlaceholder: string;
paginationInfo: string;
noResults: string;
previousPage: string;
nextPage: string;
pageJump: string;
pageNumberPlaceholder: string;
pageNumberInput: string;
goToPage: string;
go: string;
perPage: string;
results: string;
selectRow: string;
selectAllRows: string;
sortColumn: string;
selectAll: string;
filterToggle: string;
filterOptions: string;
filterApply: string;
columnVisibility: string;
showAllColumns: string;
activeFilters: string;
noActiveFilters: string;
clearAllFilters: string;
removeFilter: string;
loading: string;
close: string;
dismissAllErrors: string;
hiddenErrors: string;
errorOccurrences: string;
apiErrorNetwork: string;
apiErrorTimeout: string;
apiErrorClient: string;
apiErrorServer: string;
apiErrorUnknown: string;
apiErrorInvalidResponse: string;
retry: string;
emptyState?: string | undefined;
}>;
renderers: Ref<Record<string, AuraCustomRenderer>, Record<string, AuraCustomRenderer>>;
callbacks: Ref<Record<string, AuraCustomCallback>, Record<string, AuraCustomCallback>>;
showFooter: Ref<boolean | null, boolean | null>;
actionButtons: Ref<ActionButtonItem[] | null, ActionButtonItem[] | null>;
showHeaderSearch: Ref<boolean | null, boolean | null>;
showLoadingOverlay: Ref<boolean | null, boolean | null>;
showLoadingBar: Ref<boolean | null, boolean | null>;
showToolbarTitle: Ref<boolean | null, boolean | null>;
toolbarTitleContent: Ref<string | null, string | null>;
externalPaginator: Ref<boolean | null, boolean | null>;
resources: Ref<boolean | null, boolean | null>;
disableSession: Ref<boolean | null, boolean | null>;
allowExternalApi: Ref<boolean | null, boolean | null>;
errorReporting: Ref<boolean | null, boolean | null>;
requestMethod: Ref<"GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null, "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | null>;
dateStyle: Ref<"short" | "medium" | "long" | null, "short" | "medium" | "long" | null>;
timeZone: Ref<string | null, string | null>;
utcOffset: Ref<string | null, string | null>;
localization: Ref<string | null, string | null>;
currencyCode: Ref<string | null, string | null>;
sliceEndText: Ref<string | null, string | null>;
sessionKey: Ref<string | null, string | null>;
emptyStateMessage: Ref<string | null, string | null>;
errorReportingEndpoint: Ref<string | null, string | null>;
errorReportingService: Ref<"sentry" | "logrocket" | "rollbar" | "custom" | null, "sentry" | "logrocket" | "rollbar" | "custom" | null>;
errorReportingApiKey: Ref<string | null, string | null>;
accentInsensitiveSearch: Ref<boolean | null, boolean | null>;
highlightSearchResults: Ref<boolean | null, boolean | null>;
highlightClass: Ref<string | null, string | null>;
rawHtmlAllowedTags: Ref<string[] | null, string[] | null>;
rawHtmlAllowedAttr: Ref<string[] | null, string[] | null>;
rawHtmlAllowDataAttr: Ref<boolean | null, boolean | null>;
}, never>>;
props: AuraProps;
errorStore: Store<string, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "errors">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "hasErrors" | "isValid" | "criticalErrors" | "errorLevelErrors" | "warnings">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "destroy" | "addError" | "addSchemaValidationError" | "clearErrors" | "clearByKey" | "clearByComponent" | "clearByType" | "getErrorsBySeverity" | "getErrorsByComponent" | "getErrorsByKey">>;
isSettingsOpen: Ref<boolean, boolean>;
toggleSettings: () => void;
}, "toggleSettings">>;

/**
 * Error Handler Store Factory
 * ECS-compatible error handling in a Pinia store
 *
 * @param storeId - Unique store identifier (default: 'aura-error-handler')
 * @param config - Optional Aura configuration (for error reporting settings)
 * @returns Pinia store instance
 *
 * @example
 * ```typescript
 * // Create the store
 * const errorStore = useErrorHandlerStore('my-app-errors');
 *
 * // Add an error
 * errorStore.addError({
 *   severity: 'error',
 *   component: 'UserForm',
 *   action: 'validate',
 *   type: 'validation',
 *   message: 'Invalid email'
 * });
 * ```
 */
export declare const useErrorHandlerStore: (storeId: string, config?: AuraConfig) => Store<string, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "errors">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "hasErrors" | "isValid" | "criticalErrors" | "errorLevelErrors" | "warnings">, Pick<{
errors: Ref<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[], ECSError[] | {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
hasErrors: ComputedRef<boolean>;
isValid: ComputedRef<boolean>;
criticalErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
errorLevelErrors: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
warnings: ComputedRef<    {
id?: string | undefined;
severity: ErrorSeverity;
timestamp: string;
component: string;
action: string;
level: ErrorSeverity;
type: ErrorType;
message: string;
details?: string | undefined;
key?: string | undefined;
stack?: string | undefined;
count?: number | undefined;
lastTimestamp?: string | undefined;
metadata?: Record<string, unknown> | undefined;
}[]>;
addError: (error: Omit<ECSError, "timestamp" | "level"> & {
level?: ErrorSeverity;
timestamp?: string;
}) => void;
addSchemaValidationError: (component: string, message: string, key: string, receivedValue: unknown, details?: string, additionalMetadata?: Record<string, unknown>) => void;
clearErrors: () => void;
clearByKey: (key: string) => void;
clearByComponent: (component: string) => void;
clearByType: (type: ErrorType) => void;
getErrorsBySeverity: (severity: ErrorSeverity) => ECSError[];
getErrorsByComponent: (component: string) => ECSError[];
getErrorsByKey: (key: string) => ECSError[];
destroy: () => Promise<void>;
}, "destroy" | "addError" | "addSchemaValidationError" | "clearErrors" | "clearByKey" | "clearByComponent" | "clearByType" | "getErrorsBySeverity" | "getErrorsByComponent" | "getErrorsByKey">>;

export { }
