import type { PropType } from 'vue';
import type { ActionButtonItem } from './config.types';

/**
 * Vue 3 prop validator type definition
 *
 * Optional fields:
 * - required: defaults to false (if not provided)
 * - default: if not provided, the prop value will be undefined
 * - validator: optional custom validation logic
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PropValidator<T = any> {
    type: PropType<T>;
    required?: boolean;
    default?: T | (() => T) | null | undefined;
    validator?: (value: unknown) => boolean;
}

/**
 * Aura table props interface
 *
 * Type definitions for every prop the `Aura` component accepts. This is the third and
 * highest-priority config layer (default config < `app.use()` global config < props),
 * so almost every field is optional: an unset prop must not clobber a configured
 * value. Boolean props default to `undefined` rather than `false` for the same reason.
 */
export interface AuraProps {
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
    cellClickSearch?: boolean;
}
