import { computed, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';
import axios from 'axios';
import type { CoreStore } from '../../../types';
import { buildAxiosConfig, describeApiError, isExternalUrl } from '../../../lib/api';
import { buildFallbackErrorKey } from '../../../lib/error-key.lib';
import {
    lazyValidateHeader,
    lazyValidateFooter,
    lazyValidateBody,
} from '../../../validators/schemas/response';
import {
    extractFilterElements,
    filterItemsByFilter,
    filterItemsBySearch,
    foldSearchText,
    resolveValue,
    sortItemsByRules,
} from '../../../utils';
import { preprocessResponse } from '../../../utils/preprocessors';
import type {
    ApiResponse,
    Body,
    FilterItem,
    Footer,
    Header,
    PaginationLinks,
    PaginationMeta,
    RowId,
    SearchItem,
    SortItem,
} from '../../../types/api-response.types';

/**
 * Cross-cutting dependencies the response-data slice reads from the query slices
 * and the orchestrator. The query-slice refs feed client-side processing and the
 * fetch payload; `queryParams` is the composed request params computed.
 */
export interface ResponseDataDeps {
    core: CoreStore;
    queryParams: ComputedRef<Record<string, unknown>>;
    page: Ref<number>;
    limit: Ref<number>;
    sortItems: Ref<SortItem[]>;
    searchItems: Ref<SearchItem[]>;
    filterItems: Ref<FilterItem[]>;
    globalSearchTerm: Ref<string | null>;
    selectedRows: Ref<RowId[]>;
}

/** Identity `fetchData` reports its own errors under */
const FETCH_ERROR_COMPONENT = 'ApiResourcesStore';
const FETCH_ERROR_ACTION = 'fetchData';

/**
 * Error type of a response that arrived intact but could not be processed.
 *
 * Deliberately not `api`: the request itself succeeded, so classifying the
 * failure as an API error would tell the user their connection or the server is
 * at fault and invite a retry that reproduces the very same failure. The problem
 * is the *shape* of the payload, which is what `validation` names — and because
 * the key is generated from `component.action.type`, the distinct type is also
 * what gives the failure its own dismissable, separately clearable key.
 */
const PROCESSING_ERROR_TYPE = 'validation' as const;

/**
 * Keys of the errors `fetchData` reports about itself — the request failing, the
 * cross-origin block, and an unprocessable response — in the same form the error
 * store keys them.
 *
 * All three are `severity: 'error'`, which replaces the whole table with the error
 * UI. They describe one attempt, so a later successful request makes them stale:
 * they are cleared on success, and that is what lets a retry (or a config fix)
 * bring the table back on its own instead of requiring a page reload.
 */
const OWN_ERROR_KEYS = [
    buildFallbackErrorKey(FETCH_ERROR_COMPONENT, FETCH_ERROR_ACTION, 'api'),
    buildFallbackErrorKey(FETCH_ERROR_COMPONENT, FETCH_ERROR_ACTION, 'authorization'),
    buildFallbackErrorKey(FETCH_ERROR_COMPONENT, FETCH_ERROR_ACTION, PROCESSING_ERROR_TYPE),
];

/** Reads a thrown value as text — what the developer needs, verbatim. */
const describeThrown = (error: unknown): string =>
    error instanceof Error ? error.message : String(error);

// Helper function for global search filtering
const matchesGlobalSearch = (
    item: unknown,
    comparableTerm: string,
    searchableFields: string[],
    accentInsensitive: boolean
): boolean => {
    return searchableFields.some(field => {
        const value = resolveValue(item, field);
        if (value === null || value === undefined) return false;
        return foldSearchText(String(value), accentInsensitive).includes(comparableTerm);
    });
};

/**
 * Response data slice.
 *
 * Owns the validated API response state (`header`/`body`/`footer`/`items`/`meta`/
 * `links`) plus the derived display computeds (client-side search→filter→sort→
 * paginate) and the network layer (`fetchData` / `processResponse` / `clearResponse`).
 *
 * @param deps - Query-slice refs, the composed `queryParams`, and the core store.
 */
export const useResponseData = (deps: ResponseDataDeps) => {
    const {
        core,
        queryParams,
        page,
        limit,
        sortItems,
        searchItems,
        filterItems,
        globalSearchTerm,
        selectedRows,
    } = deps;

    /**
     * Number of `fetchData` calls currently in flight.
     *
     * `loading` is derived from a counter rather than being a plain boolean,
     * because overlapping requests would otherwise switch it off too early: the
     * first response to arrive would clear the flag while a later request is
     * still running, and the table would look settled while it is not.
     */
    const pendingRequests = ref(0);

    /** Whether at least one request is in flight. */
    const loading = computed(() => pendingRequests.value > 0);

    /**
     * Id of the most recently started `fetchData` call.
     *
     * Responses do not necessarily arrive in the order their requests went out,
     * so "the last response wins" would let a slow first page overwrite the
     * second one the user is already looking at. Every call takes the next id
     * and compares it back against this counter before writing anything: only
     * the latest request owns the store state. Same pattern as the `isStale()`
     * guard of `watchAsyncEffect`, applied to the network layer.
     */
    let latestRequestId = 0;

    /** Abort handle of the request currently on the wire, if there is one. */
    let inFlightController: AbortController | null = null;

    // State refs
    const header = ref<Header | null>(null);
    const body = ref<Body | null>(null);
    const footer = ref<Footer | null>(null);
    const items = ref<unknown[] | null>(null);
    const meta = ref<PaginationMeta | null>(null);
    const links = ref<PaginationLinks | null>(null);

    /**
     * Computed property to determine the footer configuration to display.
     *
     * Logic:
     * 1. If showFooter config is false -> returns null (no footer).
     * 2. If valid footer data received from API -> returns API footer.
     * 3. If no API footer but showFooter is true -> falls back to using header configuration as footer.
     */
    const displayFooter = computed<Header | Footer | null>(() => {
        // Check config first
        if (!core.config.showFooter) {
            return null;
        }

        // If API provided a footer with rows, use it
        if (footer.value && footer.value.rows && footer.value.rows.length > 0) {
            return footer.value;
        }

        // Fallback: use header as footer if header exists
        if (header.value && header.value.rows && header.value.rows.length > 0) {
            return header.value;
        }

        return null;
    });

    // Helper computed for client-side filtering and sorting
    const clientProcessedItems = computed<unknown[] | null>(() => {
        if (!items.value) return null;

        let filtered = items.value;

        // Diacritics are ignored only when the table asked for it; the flag reaches
        // both search paths so the column search and the global search agree.
        const accentInsensitive = core.config.accentInsensitiveSearch === true;

        // 1. Filter by global search
        if (globalSearchTerm.value) {
            const term = foldSearchText(globalSearchTerm.value, accentInsensitive);
            const searchableFields = header.value?.settings?.searchableItems || [];

            if (searchableFields.length > 0) {
                filtered = filtered.filter(item =>
                    matchesGlobalSearch(item, term, searchableFields, accentInsensitive)
                );
            }
            // If searchableItems is not defined or empty, we generally don't filter or filter everything?
            // Based on spec: "If the header.settings.searchableItems is empty or undefined, the global search should not filter"
            // So we keep all items if no searchable fields are defined.
        }

        // 2. Filter by local search
        filtered = filterItemsBySearch(filtered, searchItems.value, accentInsensitive);

        // 3. Filter by local filters
        filtered = filterItemsByFilter(filtered, filterItems.value);

        // 4. Sort — with the configured locale, so the order matches the locale
        // the dates and numbers are formatted in rather than the browser's.
        return sortItemsByRules(filtered, sortItems.value, core.config.localization);
    });

    /**
     * Computed property for pagination metadata.
     *
     * If API provides meta (server-side pagination), it uses that.
     * If not (client-side pagination), it calculates meta from items array.
     */
    const displayMeta = computed<PaginationMeta | null>(() => {
        // If API provided meta, use it
        if (meta.value) {
            return meta.value;
        }

        // If external paginator is disabled, calculate meta from items
        if (core.config.externalPaginator === false) {
            // Use processed items length for correct pagination
            const total = clientProcessedItems.value?.length ?? 0;
            const perPage = limit.value;
            const currentPage = page.value;
            const lastPage = Math.max(1, Math.ceil(total / perPage));
            const from = total === 0 ? null : (currentPage - 1) * perPage + 1;
            const to = total === 0 ? null : Math.min(currentPage * perPage, total);

            return {
                current_page: currentPage,
                from: from,
                last_page: lastPage,
                path: '',
                per_page: perPage,
                to: to,
                total: total,
            };
        }

        return null;
    });

    /**
     * Computed property for displayed items.
     *
     * If external pagination is enabled, returns all items (assuming API handles pagination).
     * If external pagination is disabled, returns a slice of items for current page.
     */
    const displayItems = computed<unknown[] | null>(() => {
        // If items is null, return null
        if (!items.value) {
            return null;
        }

        // If external paginator is true, return all items (API/Server handles pagination)
        if (core.config.externalPaginator === true) {
            return items.value;
        }

        // If external paginator is false, slice items for client-side pagination
        if (core.config.externalPaginator === false && clientProcessedItems.value) {
            // Apply client-side sorting before pagination
            const processedItems = clientProcessedItems.value;

            const perPage = limit.value;
            const currentPage = page.value;
            const startIndex = (currentPage - 1) * perPage;
            const endIndex = currentPage * perPage;

            return processedItems.slice(startIndex, endIndex);
        }

        // Default fallback
        return items.value;
    });

    /**
     * Process and validate API response data.
     *
     * Validates the response and updates store state with header, body, footer,
     * items, meta, and links data. Validation errors are sent to the central error store.
     *
     * @param apiResponse - The complete API response object
     * @param isStale - Optional guard: when it returns `true` the response is
     *                  discarded without touching the store. `fetchData` passes
     *                  its own staleness check here so a superseded request
     *                  cannot write over newer data.
     * @throws {Error} If header validation fails (via lazyValidateHeader)
     * @returns {Promise<void>}
     *
     * @example
     * ```typescript
     * await store.processResponse({
     *   header: { rows: [...] },
     *   items: [...],
     *   meta: { ... }
     * });
     * ```
     */
    const processResponse = async (apiResponse: ApiResponse, isStale?: () => boolean) => {
        // Validate header using the errorStore's storeId
        // core.errorStore is the actual Pinia store instance which has $id
        const errorStoreId = core.errorStore.$id;

        // Every await is kept ahead of the writes, so the state is updated in a
        // single synchronous block. Two overlapping runs can therefore only be
        // separated at the guard below, never in the middle of the update —
        // a stale run cannot leave the response refs half from one response and
        // half from the other.
        const validatedHeader = await lazyValidateHeader(
            apiResponse,
            errorStoreId,
            'response.header'
        );
        const validatedFooter = await lazyValidateFooter(
            apiResponse,
            errorStoreId,
            'response.footer'
        );
        const validatedBody = await lazyValidateBody(apiResponse, errorStoreId, 'response.body');

        if (isStale?.()) {
            return;
        }

        // Use validated (stripped) header
        header.value = validatedHeader;

        if (validatedFooter) {
            footer.value = validatedFooter;
        }

        // ⑦.5 Response preprocessing: auto-generate _icon/_link configs, normalize icon/variant → class
        const preprocessedBody = preprocessResponse(
            validatedHeader,
            validatedBody ?? null,
            apiResponse.items,
            core.config.icons as Record<string, string[]> | undefined,
            core.config.variants as Record<string, string> | undefined,
            core.config.urlParameter as string | null | undefined
        );

        if (preprocessedBody) {
            body.value = preprocessedBody;
        } else if (validatedBody) {
            body.value = validatedBody;
        }
        if (apiResponse.items) {
            items.value = apiResponse.items;
        }

        // Auto-generate filter elements from items if needed
        if (header.value && items.value && items.value.length > 0) {
            const enrichedHeader = extractFilterElements(header.value, items.value);
            if (enrichedHeader) {
                header.value = enrichedHeader;
            }
        }

        if (apiResponse.meta) {
            meta.value = apiResponse.meta;
        }
        if (apiResponse.links) {
            links.value = apiResponse.links;
        }
    };

    /**
     * Drop the errors an earlier `fetchData` attempt reported about itself.
     *
     * Called on every outcome, so what the user sees always describes the latest
     * attempt: a successful request leaves nothing behind, and a repeatedly
     * failing one (the retry button makes that a single click away) reports one
     * alert instead of stacking an identical one per attempt.
     */
    const clearOwnErrors = () => {
        OWN_ERROR_KEYS.forEach(key => core.errorStore.clearByKey(key));
    };

    /**
     * Report a response that arrived intact but could not be turned into state.
     *
     * `processResponse` throws when the header fails validation, and the
     * preprocessing and filter-element extraction downstream of it can throw on a
     * payload no schema rejected. Before this existed, that exception fell into
     * `fetchData`'s outer `catch` and was described by `describeApiError`, which
     * sees no status and no transport code and therefore classifies everything it
     * cannot place as `unknown` — so a *successful* request ended up reported as
     * "Could not load the data. Please try again." under the network failure's own
     * key. The user was told to retry a request that had already worked, and the
     * developer's first look went to the network tab.
     *
     * The raw exception text goes to `details`, where the developer looks; the
     * message is the `labels`-overridable text, like every other user-facing
     * failure message.
     *
     * @param error - The value `processResponse` threw
     */
    const reportProcessingFailure = (error: unknown) => {
        core.errorStore.addError({
            severity: 'error',
            component: FETCH_ERROR_COMPONENT,
            action: FETCH_ERROR_ACTION,
            type: PROCESSING_ERROR_TYPE,
            message: core.config.labels.apiErrorInvalidResponse,
            details: describeThrown(error),
        });
    };

    /**
     * Fetch the current query from the API and process the response.
     *
     * Failures are reported to the error store rather than thrown, so a caller
     * never has to guard the call. Every outcome first clears what the previous
     * attempt reported (see `clearOwnErrors`).
     *
     * A failed *request* and an unprocessable *response* are two different
     * problems and are reported as such — `type: 'api'` and
     * `type: 'validation'` respectively — so the message the user reads matches
     * what actually went wrong (see `reportProcessingFailure`).
     *
     * `loading` is raised for the whole call and lowered in `finally`, so every
     * exit path — success, failure and the cross-origin block — releases it.
     *
     * Concurrency: the newest call always wins. Starting one cancels the request
     * still on the wire and marks every earlier call stale, so a slow response
     * can neither overwrite newer rows nor report an error over them.
     *
     * @returns {Promise<void>}
     */
    const fetchData = async () => {
        const requestId = (latestRequestId += 1);

        /** Whether a newer `fetchData` call has taken over since this one started. */
        const isStale = () => requestId !== latestRequestId;

        // Cancel what is still on the wire: its rows are already outdated, so
        // finishing it would only spend bandwidth and server time on a result
        // that gets discarded below anyway.
        inFlightController?.abort();
        const controller = new AbortController();
        inFlightController = controller;

        pendingRequests.value += 1;

        try {
            // We attach the selected rows to the payload at the moment of the
            // request — they are NOT part of the reactive queryParams, so that
            // selection alone doesn't trigger a refetch.
            const requestPayload: Record<string, unknown> = {
                ...(queryParams.value as Record<string, unknown>),
            };
            if (selectedRows.value.length > 0) {
                requestPayload.selected = [...selectedRows.value];
            }

            // API call with the payload
            const axiosRequestConfig = buildAxiosConfig(
                core.config.requestMethod || 'POST',
                core.config.siteToken || null,
                core.config.urlStructure || null,
                core.config.siteName || null,
                core.config.urlParameter || null,
                core.config.urlParameterLastSegment || null,
                requestPayload
            );

            // Block external (cross-origin) API calls if allowExternalApi is not
            // explicitly enabled. The safe default is to block, so we also block
            // null/false values (!== true).
            if (core.config.allowExternalApi !== true && isExternalUrl(axiosRequestConfig.url)) {
                clearOwnErrors();
                core.errorStore.addError({
                    severity: 'error',
                    component: FETCH_ERROR_COMPONENT,
                    action: FETCH_ERROR_ACTION,
                    type: 'authorization',
                    message: `External API request blocked: "${axiosRequestConfig.url}". Set allowExternalApi: true to permit cross-origin requests.`,
                });
                return;
            }

            // Axios call
            const response = await axios({ ...axiosRequestConfig, signal: controller.signal });

            if (isStale()) {
                return;
            }

            // The request went through, so whatever this fetch reported earlier
            // no longer describes reality. Clearing it here — before the response
            // is processed — is what unblocks a table that a previous failure had
            // replaced with the error UI. Errors raised by `processResponse` below
            // carry their own validation keys and are untouched.
            clearOwnErrors();

            // Processing failures are caught here rather than in the outer
            // `catch`: from there they are indistinguishable from a failed
            // request, and would be reported as one.
            try {
                await processResponse(response.data, isStale);
            } catch (error) {
                // Same reasoning as the outer catch: a superseded run's failure
                // must not replace the table the newest one is filling.
                if (!isStale()) {
                    reportProcessingFailure(error);
                }
            }
        } catch (error) {
            // A cancelled request lands here too. It is superseded by definition,
            // and the error state belongs to the newest call — reporting the
            // cancellation would replace the table with an error UI that
            // describes a request nobody is waiting for any more.
            if (isStale()) {
                return;
            }

            // On failure, log the error and add it to the error store
            clearOwnErrors();

            const failure = describeApiError(error, core.config.labels);

            core.errorStore.addError({
                severity: 'error',
                component: FETCH_ERROR_COMPONENT,
                action: FETCH_ERROR_ACTION,
                // Stays `api` for every failure class, even though `network` or
                // `server` would read better in ECS terms: the key is generated
                // from `component.action.type`, and `clearOwnErrors` (plus the
                // documented `ApiResourcesStore.fetchData.api` key the host can
                // clear) depends on it being the same one every time. The class
                // is in `metadata.kind` instead.
                type: 'api',
                // The user-facing, `labels`-overridable text; the raw axios
                // message goes to `details`, where the developer looks.
                message: failure.message,
                details: failure.details,
                metadata: {
                    kind: failure.kind,
                    ...(failure.status === undefined ? {} : { status: failure.status }),
                    ...(failure.code === undefined ? {} : { code: failure.code }),
                },
            });
        } finally {
            pendingRequests.value -= 1;

            // Only the request that is still the current one may clear the shared
            // handle — a stale run must not drop a newer request's abort handle.
            if (inFlightController === controller) {
                inFlightController = null;
            }
        }
    };

    /**
     * Clear all response data from the store.
     *
     * Resets header, body, footer, items, meta, and links to null.
     *
     * @example
     * ```typescript
     * store.clearResponse();
     * console.log(store.items); // null
     * ```
     */
    const clearResponse = () => {
        header.value = null;
        body.value = null;
        footer.value = null;
        items.value = null;
        meta.value = null;
        links.value = null;
    };

    return {
        loading,
        header,
        body,
        footer,
        items,
        meta,
        links,
        displayFooter,
        displayMeta,
        displayItems,
        fetchData,
        processResponse,
        clearResponse,
    };
};
