import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AuraConfig } from '../../types/config.types';
import { validateBoolean } from '../../validators/schemas/common/boolean.schema';
import { validateString } from '../../validators/schemas/common/string.schema';
import { validateStringArray } from '../../validators/schemas/common/string-array.schema';
import {
    DEFAULT_RAW_CELL_ALLOWED_TAGS,
    DEFAULT_RAW_CELL_ALLOWED_ATTR,
} from '../../lib/raw-html-defaults.lib';
import { validateActionButtons } from '../../validators/schemas/config/action-buttons.schema';
import { validatePaginateValues } from '../../validators/schemas/config/paginate-values.schema';
import { validateNumber } from '../../validators/schemas/common/number.schema';
import { validateClasses } from '../../validators/schemas/config/classes.schema';
import { validateIcons } from '../../validators/schemas/config/icons.schema';
import { validateVariants } from '../../validators/schemas/config/variants.schema';
import { validateLabels } from '../../validators/schemas/config/labels.schema';
import { validateFunctionRegistry } from '../../validators/schemas/config/function-registry.schema';
import { validateRequestMethod } from '../../validators/schemas/config/request-method.schema';
import { validateDateStyle } from '../../validators/schemas/common/date-style.schema';
import { validateTimeZone } from '../../validators/schemas/common/time-zone.schema';
import { validateUtcOffset } from '../../validators/schemas/common/utc-offset.schema';
import { validateLocalization } from '../../validators/schemas/config/localization.schema';
import { validateCurrencyCode } from '../../validators/schemas/common/currency-code.schema';
import { validateSliceEndText } from '../../validators/schemas/common/slice-end-text.schema';
import { validateErrorReportingService } from '../../validators/schemas/config/error-reporting-service.schema';
import { validateErrorReportingApiKey } from '../../validators/schemas/config/error-reporting-api-key.schema';
import { validateSiteToken } from '../../validators/schemas/config/site-token.schema';

import type {
    ActionButtonItem,
    AuraCustomRenderer,
    AuraCustomCallback,
    AuraLabels,
} from '../../types/config.types';

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
export const useConfigStore = (
    storeId: string,
    mergedConfig: AuraConfig,
    errorHandlerStoreId: string
) => {
    return defineStore(storeId, () => {
        // Validate debug flag
        const debug = ref<boolean | null>(
            validateBoolean(mergedConfig.debug, errorHandlerStoreId, 'debug')
        );

        // siteToken can be boolean, string, or null
        const siteToken = ref<boolean | string | null>(
            validateSiteToken(mergedConfig.siteToken, errorHandlerStoreId)
        );

        // Validate site name
        const siteName = ref<string | null>(
            validateString(mergedConfig.siteName, errorHandlerStoreId, 'siteName', 0, 500)
        );

        // Validate site name
        const urlParameter = ref<string | null>(
            validateString(mergedConfig.urlParameter, errorHandlerStoreId, 'urlParameter', 0, 500)
        );

        // href automatically from config (getHref() utility)
        const href = ref<string | null>(
            validateString(mergedConfig.href, errorHandlerStoreId, 'href', 0, 500)
        );

        // Validate URL parameters
        const urlParameterLastSegment = ref<string | null>(
            validateString(
                mergedConfig.urlParameterLastSegment,
                errorHandlerStoreId,
                'urlParameterLastSegment',
                1,
                100
            )
        );

        const urlStructure = ref<string | null>(
            validateString(mergedConfig.urlStructure, errorHandlerStoreId, 'urlStructure', 1, 250)
        );

        // Validate pagination values
        const paginateValues = ref<number[] | null>(
            validatePaginateValues(
                mergedConfig.paginateValues,
                errorHandlerStoreId,
                'paginateValues'
            )
        );

        // Validate row count
        const rowsNumber = ref<number | null>(
            validateNumber(mergedConfig.rowsNumber, errorHandlerStoreId, 'rowsNumber')
        );

        // Validate CSS classes
        const classes = ref<Record<string, string[] | Record<string, string[]>>>(
            validateClasses(mergedConfig.classes, errorHandlerStoreId)
        );

        // Validate icons
        const icons = ref<Record<string, string[] | Record<string, string[]>>>(
            validateIcons(mergedConfig.icons, errorHandlerStoreId)
        );

        // Validate variants
        const variants = ref<Record<string, string>>(
            validateVariants(mergedConfig.variants, errorHandlerStoreId)
        );

        // Validate built-in UI texts (partial override → filled in with DEFAULT_LABELS)
        const labels = ref<AuraLabels>(validateLabels(mergedConfig.labels, errorHandlerStoreId));

        // Validate custom renderer/callback registries (custom type, host-side functions)
        const renderers = ref<Record<string, AuraCustomRenderer>>(
            validateFunctionRegistry<AuraCustomRenderer>(
                mergedConfig.renderers,
                errorHandlerStoreId,
                'renderers'
            )
        );

        const callbacks = ref<Record<string, AuraCustomCallback>>(
            validateFunctionRegistry<AuraCustomCallback>(
                mergedConfig.callbacks,
                errorHandlerStoreId,
                'callbacks'
            )
        );

        // Validate boolean flags
        const showFooter = ref<boolean | null>(
            validateBoolean(mergedConfig.showFooter, errorHandlerStoreId, 'showFooter')
        );

        const actionButtons = ref<ActionButtonItem[] | null>(
            validateActionButtons(mergedConfig.actionButtons, errorHandlerStoreId, 'actionButtons')
        );

        const showHeaderSearch = ref<boolean | null>(
            validateBoolean(mergedConfig.showHeaderSearch, errorHandlerStoreId, 'showHeaderSearch')
        );

        const showLoadingOverlay = ref<boolean | null>(
            validateBoolean(
                mergedConfig.showLoadingOverlay,
                errorHandlerStoreId,
                'showLoadingOverlay'
            )
        );

        const showLoadingBar = ref<boolean | null>(
            validateBoolean(mergedConfig.showLoadingBar, errorHandlerStoreId, 'showLoadingBar')
        );

        const showToolbarTitle = ref<boolean | null>(
            validateBoolean(mergedConfig.showToolbarTitle, errorHandlerStoreId, 'showToolbarTitle')
        );

        const toolbarTitleContent = ref<string | null>(
            validateString(
                mergedConfig.toolbarTitleContent,
                errorHandlerStoreId,
                'toolbarTitleContent',
                0,
                200
            )
        );

        const externalPaginator = ref<boolean | null>(
            validateBoolean(
                mergedConfig.externalPaginator,
                errorHandlerStoreId,
                'externalPaginator'
            )
        );

        const resources = ref<boolean | null>(
            validateBoolean(mergedConfig.resources, errorHandlerStoreId, 'resources')
        );

        const disableSession = ref<boolean | null>(
            validateBoolean(mergedConfig.disableSession, errorHandlerStoreId, 'disableSession')
        );

        const allowExternalApi = ref<boolean | null>(
            validateBoolean(mergedConfig.allowExternalApi, errorHandlerStoreId, 'allowExternalApi')
        );

        const errorReporting = ref<boolean | null>(
            validateBoolean(mergedConfig.errorReporting, errorHandlerStoreId, 'errorReporting')
        );

        // Validate HTTP request method
        const requestMethod = ref<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | null>(
            validateRequestMethod(mergedConfig.requestMethod, errorHandlerStoreId)
        );

        // Validate date style
        const dateStyle = ref<'short' | 'medium' | 'long' | null>(
            validateDateStyle(mergedConfig.dateStyle, errorHandlerStoreId)
        );

        // Validate TimeZone
        const timeZone = ref<string | null>(
            validateTimeZone(mergedConfig.timeZone, errorHandlerStoreId)
        );

        // Validate UTC offset
        const utcOffset = ref<string | null>(
            validateUtcOffset(mergedConfig.utcOffset, errorHandlerStoreId)
        );

        // Validate localization
        const localization = ref<string | null>(
            validateLocalization(mergedConfig.localization, errorHandlerStoreId)
        );

        // Validate currency
        const currencyCode = ref<string | null>(
            validateCurrencyCode(mergedConfig.currencyCode, errorHandlerStoreId)
        );

        // Validate slice end text
        const sliceEndText = ref<string | null>(
            validateSliceEndText(mergedConfig.sliceEndText, errorHandlerStoreId)
        );

        // Validate the sessionStorage key override (null → derived from the storeId)
        const sessionKey = ref<string | null>(
            validateString(mergedConfig.sessionKey, errorHandlerStoreId, 'sessionKey', 0, 100)
        );

        // Validate empty state message.
        // Deprecated in favour of `labels.emptyState`, but still read on purpose: the
        // alias must keep working (resolution order lives in TableBody).
        const emptyStateMessage = ref<string | null>(
            validateString(
                mergedConfig.emptyStateMessage,
                errorHandlerStoreId,
                'emptyStateMessage',
                0,
                200
            )
        );

        // Validate error reporting endpoint (URL string, max 500 characters)
        const errorReportingEndpoint = ref<string | null>(
            validateString(
                mergedConfig.errorReportingEndpoint,
                errorHandlerStoreId,
                'errorReportingEndpoint',
                0,
                500
            )
        );

        // Validate error reporting service
        const errorReportingService = ref<'sentry' | 'logrocket' | 'rollbar' | 'custom' | null>(
            validateErrorReportingService(mergedConfig.errorReportingService, errorHandlerStoreId)
        );

        // Validate error reporting API key
        const errorReportingApiKey = ref<string | null>(
            validateErrorReportingApiKey(mergedConfig.errorReportingApiKey, errorHandlerStoreId)
        );

        // Validate accent-insensitive search flag
        const accentInsensitiveSearch = ref<boolean | null>(
            validateBoolean(
                mergedConfig.accentInsensitiveSearch,
                errorHandlerStoreId,
                'accentInsensitiveSearch'
            )
        );

        // Validate highlight search results flag
        const highlightSearchResults = ref<boolean | null>(
            validateBoolean(
                mergedConfig.highlightSearchResults,
                errorHandlerStoreId,
                'highlightSearchResults'
            )
        );

        // Validate highlight CSS class
        const highlightClass = ref<string | null>(
            validateString(
                mergedConfig.highlightClass,
                errorHandlerStoreId,
                'highlightClass',
                0,
                100
            )
        );

        // Whitelist settings for raw HTML (`raw: true` cells) – formatRaw uses these
        // for sanitization; the default is the cell-level base list (style allowed).
        const rawHtmlAllowedTags = ref<string[] | null>(
            validateStringArray(
                mergedConfig.rawHtmlAllowedTags,
                errorHandlerStoreId,
                'rawHtmlAllowedTags',
                [...DEFAULT_RAW_CELL_ALLOWED_TAGS]
            )
        );

        const rawHtmlAllowedAttr = ref<string[] | null>(
            validateStringArray(
                mergedConfig.rawHtmlAllowedAttr,
                errorHandlerStoreId,
                'rawHtmlAllowedAttr',
                [...DEFAULT_RAW_CELL_ALLOWED_ATTR]
            )
        );

        const rawHtmlAllowDataAttr = ref<boolean | null>(
            validateBoolean(
                mergedConfig.rawHtmlAllowDataAttr,
                errorHandlerStoreId,
                'rawHtmlAllowDataAttr'
            )
        );

        return {
            // Store identifier
            storeId,
            // System variables (validated values)
            debug,
            siteToken,
            siteName,
            urlParameter,
            href,
            urlParameterLastSegment,
            urlStructure,
            paginateValues,
            rowsNumber,
            classes,
            icons,
            variants,
            labels,
            renderers,
            callbacks,
            showFooter,
            actionButtons,
            showHeaderSearch,
            showLoadingOverlay,
            showLoadingBar,
            showToolbarTitle,
            toolbarTitleContent,
            externalPaginator,
            resources,
            disableSession,
            allowExternalApi,
            errorReporting,
            requestMethod,
            dateStyle,
            timeZone,
            utcOffset,
            localization,
            currencyCode,
            sliceEndText,
            sessionKey,
            emptyStateMessage,
            errorReportingEndpoint,
            errorReportingService,
            errorReportingApiKey,
            accentInsensitiveSearch,
            highlightSearchResults,
            highlightClass,
            rawHtmlAllowedTags,
            rawHtmlAllowedAttr,
            rawHtmlAllowDataAttr,
        };
    })();
};
