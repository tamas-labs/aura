import { arrayRule, booleanRule, numberRule, stringRule } from '../rules';
import type { PropType } from 'vue';
import type { PropValidator, ActionButtonItem } from '../../types';

/**
 * Default prop validators for the Aura table component
 *
 * IMPORTANT: The props do NOT contain a default value!
 * - undefined = the prop was not passed at the component level
 * - any other value = explicitly passed
 *
 * The default values are defined in the config file (aura.config.ts).
 * The config merge happens in core.state.ts: globalConfig < explicitProps
 *
 * Because of Vue 3's Boolean casting, Boolean props must be given an explicit `default: undefined`,
 * otherwise Vue automatically assigns them `false` when they aren't passed.
 * This would override the `true` value coming from the config (e.g. showFooter: true -> false).
 *
 * @returns Vue 3 prop validators object
 */
export const defaultValidators = (): Record<string, PropValidator> => {
    return {
        storeId: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        debug: {
            type: Boolean,
            required: false,
            default: undefined,
            validator: (value: unknown) => value === undefined || booleanRule(value),
        },
        siteName: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        urlParameter: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        urlParameterLastSegment: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        urlStructure: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        siteToken: {
            type: [Boolean, String] as PropType<boolean | string | null>,
            required: false,
            validator: (value: unknown) => {
                return (
                    value === undefined ||
                    value === null ||
                    typeof value === 'boolean' ||
                    typeof value === 'string'
                );
            },
        },
        paginateValues: {
            type: Array as PropType<number[]>,
            required: false,
            validator: (value: unknown) => value === undefined || arrayRule(value),
        },
        rowsNumber: {
            type: Number,
            required: false,
            validator: (value: unknown) => value === undefined || numberRule(value),
        },
        classes: {
            type: Object as PropType<Record<string, string[] | Record<string, string[]>>>,
            required: false,
            validator: (value: unknown) => {
                if (value === undefined) return true;
                if (typeof value !== 'object' || value === null) return false;

                const isStringArray = (arr: unknown): boolean => {
                    return Array.isArray(arr) && arr.every(item => typeof item === 'string');
                };

                const isNestedStringArrayRecord = (obj: unknown): boolean => {
                    if (typeof obj !== 'object' || obj === null) return false;
                    return Object.values(obj as Record<string, unknown>).every(isStringArray);
                };

                // Every value is either string[] or Record<string, string[]>
                return Object.values(value as Record<string, unknown>).every(val => {
                    return isStringArray(val) || isNestedStringArrayRecord(val);
                });
            },
        },
        showFooter: {
            type: Boolean,
            required: false,
            default: undefined,
            validator: (value: unknown) => value === undefined || booleanRule(value),
        },
        actionButtons: {
            type: Array as PropType<ActionButtonItem[]>,
            required: false,
            default: undefined,
            validator: (value: unknown) =>
                value === undefined || value === null || arrayRule(value),
        },
        showLoadingOverlay: {
            type: Boolean,
            required: false,
            default: undefined,
            validator: (value: unknown) => value === undefined || booleanRule(value),
        },
        showLoadingBar: {
            type: Boolean,
            required: false,
            default: undefined,
            validator: (value: unknown) => value === undefined || booleanRule(value),
        },
        showHeaderSearch: {
            type: Boolean,
            required: false,
            default: undefined,
            validator: (value: unknown) => value === undefined || booleanRule(value),
        },
        showToolbarTitle: {
            type: Boolean,
            required: false,
            default: undefined,
            validator: (value: unknown) => value === undefined || booleanRule(value),
        },
        toolbarTitleContent: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        externalPaginator: {
            type: Boolean,
            required: false,
            default: undefined,
            validator: (value: unknown) => value === undefined || booleanRule(value),
        },
        dateStyle: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        timeZone: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        utcOffset: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        localization: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        currencyCode: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        resources: {
            type: Boolean,
            required: false,
            default: undefined,
            validator: (value: unknown) => value === undefined || booleanRule(value),
        },
        requestMethod: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        sessionKey: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
        disableSession: {
            type: Boolean,
            required: false,
            default: undefined,
            validator: (value: unknown) => value === undefined || booleanRule(value),
        },
        accentInsensitiveSearch: {
            type: Boolean,
            required: false,
            default: undefined,
            validator: (value: unknown) => value === undefined || booleanRule(value),
        },
        highlightSearchResults: {
            type: Boolean,
            required: false,
            default: undefined,
            validator: (value: unknown) => value === undefined || booleanRule(value),
        },
        highlightClass: {
            type: String,
            required: false,
            validator: (value: unknown) => value === undefined || stringRule(value),
        },
    };
};
