import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useErrorHandlerStore } from '../../../state/core/error-handler.state';
import type { ECSError } from '../../../types/error.types';

/**
 * The contract every zod-backed schema wrapper shares.
 *
 * These wrappers are structurally identical and generated in spirit: parse with a zod
 * schema, and on failure report through the error sink and return a fallback. Their own
 * test files check the values each one accepts; what nothing checked was the *shape of
 * the family* — that the fallback path always reports, always names its own validator,
 * and never lets an exception escape into the config merge.
 *
 * It also closes the branch that made these the lowest-covered files in `src/`: the
 * `error instanceof Error ? error.message : 'Unknown validation error'` fallback. Zod
 * only ever throws `ZodError`, so the second half is unreachable from any input — it is
 * reachable only if the schema itself blows up, which is what the fourth case simulates
 * by mocking the zod barrel.
 *
 * A new config key gets its four cases by adding one row to the table below.
 */

const STORE_ID = 'schema-wrapper-contract';

/** Deliberately not an `Error` — this is what the fourth case throws out of `parse`. */
const NON_ERROR_THROW = 'zod itself blew up';

/** The message the wrappers substitute when the thrown value carries no `.message`. */
const UNKNOWN_VALIDATION_ERROR = 'Unknown validation error';

/** A config key no `DEFAULT_*` map knows about — see the fifth case. */
const UNREGISTERED_KEY = 'keyWithNoRegisteredDefault';

/** The zod barrel, addressed exactly as the wrappers address it, so the mock lands. */
const ZOD_BARREL = '../../zod';

type Validator = (...args: unknown[]) => unknown;

interface WrapperCase {
    /** The exported validator's name — the label of its `describe` block */
    validator: string;
    /** Imports the wrapper module; re-run per test so the zod mock can take effect */
    load: () => Promise<Record<string, unknown>>;
    /** The zod barrel export this wrapper parses with */
    zodExport: string;
    /** `true` when the wrapper calls it (`XZod().parse`) instead of using it directly */
    zodIsFactory: boolean;
    /** The `key` argument, and the key the finding is reported under */
    key: string;
    /** A value the schema accepts */
    valid: unknown;
    /** A value the schema rejects */
    invalid: unknown;
    /** The `component` the finding is reported under */
    component: string;
    /**
     * Arguments after `key`, for the wrappers that take more.
     *
     * Only `validateStringArray` does: its fallback is **caller-supplied**, not read from
     * a `DEFAULT_*` map, so without it the wrapper legitimately returns `undefined`.
     */
    extraArgs?: unknown[];
}

const wrappers: WrapperCase[] = [
    {
        validator: 'validateActionButtons',
        load: () => import('../config/action-buttons.schema'),
        zodExport: 'ActionButtonsZod',
        zodIsFactory: false,
        key: 'actionButtons',
        valid: ['refresh'],
        invalid: 'refresh',
        component: 'ActionButtonsValidator',
    },
    {
        validator: 'validateClasses',
        load: () => import('../config/classes.schema'),
        zodExport: 'ClassesZod',
        zodIsFactory: false,
        key: 'classes',
        valid: { table: ['table-striped'] },
        invalid: 'table-striped',
        component: 'ClassesValidator',
    },
    {
        validator: 'validateErrorReportingApiKey',
        load: () => import('../config/error-reporting-api-key.schema'),
        zodExport: 'ErrorReportingApiKeyZod',
        zodIsFactory: true,
        key: 'errorReportingApiKey',
        valid: 'api-key-123',
        invalid: 42,
        component: 'ErrorReportingApiKeyValidator',
    },
    {
        validator: 'validateErrorReportingService',
        load: () => import('../config/error-reporting-service.schema'),
        zodExport: 'ErrorReportingServiceZod',
        zodIsFactory: true,
        key: 'errorReportingService',
        valid: 'custom',
        invalid: 'carrier-pigeon',
        component: 'ErrorReportingServiceValidator',
    },
    {
        validator: 'validateIcons',
        load: () => import('../config/icons.schema'),
        zodExport: 'IconsZod',
        zodIsFactory: false,
        key: 'icons',
        valid: { search: ['fas', 'fa-search'] },
        invalid: 'fa-search',
        component: 'IconsValidator',
    },
    {
        validator: 'validateLabels',
        load: () => import('../config/labels.schema'),
        zodExport: 'LabelsZod',
        zodIsFactory: false,
        key: 'labels',
        valid: { searchPlaceholder: 'Search' },
        invalid: 'Search',
        component: 'LabelsValidator',
    },
    {
        validator: 'validateLocalization',
        load: () => import('../config/localization.schema'),
        zodExport: 'LocalizationZod',
        zodIsFactory: true,
        key: 'localization',
        valid: 'en-US',
        invalid: 42,
        component: 'LocalizationValidator',
    },
    {
        validator: 'validatePaginateValues',
        load: () => import('../config/paginate-values.schema'),
        zodExport: 'PaginateValuesZod',
        zodIsFactory: false,
        key: 'paginateValues',
        valid: [10, 25, 50],
        invalid: '10,25,50',
        component: 'PaginateValuesValidator',
    },
    {
        validator: 'validateRequestMethod',
        load: () => import('../config/request-method.schema'),
        zodExport: 'RequestMethodZod',
        zodIsFactory: true,
        key: 'requestMethod',
        valid: 'POST',
        invalid: 'FETCH',
        component: 'RequestMethodValidator',
    },
    {
        validator: 'validateSiteToken',
        load: () => import('../config/site-token.schema'),
        zodExport: 'SiteTokenZod',
        zodIsFactory: false,
        key: 'siteToken',
        valid: 'token-123',
        invalid: 42,
        component: 'SiteTokenValidator',
    },
    {
        validator: 'validateVariants',
        load: () => import('../config/variants.schema'),
        zodExport: 'VariantsZod',
        zodIsFactory: false,
        key: 'variants',
        valid: { primary: 'blue' },
        invalid: 'blue',
        component: 'VariantsValidator',
    },
    {
        validator: 'validateBoolean',
        load: () => import('../common/boolean.schema'),
        zodExport: 'BooleanZod',
        zodIsFactory: false,
        key: 'showHeaderSearch',
        valid: true,
        invalid: 'yes',
        component: 'BooleanValidator',
    },
    {
        validator: 'validateCurrencyCode',
        load: () => import('../common/currency-code.schema'),
        zodExport: 'CurrencyCodeZod',
        zodIsFactory: true,
        key: 'currencyCode',
        valid: 'HUF',
        invalid: 'XXX',
        component: 'CurrencyCodeValidator',
    },
    {
        validator: 'validateDateStyle',
        load: () => import('../common/date-style.schema'),
        zodExport: 'DateStyleZod',
        zodIsFactory: true,
        key: 'dateStyle',
        valid: 'short',
        invalid: 'tiny',
        component: 'DateStyleValidator',
    },
    {
        validator: 'validateNumber',
        load: () => import('../common/number.schema'),
        zodExport: 'NumberZod',
        zodIsFactory: false,
        key: 'rowsNumber',
        valid: 25,
        invalid: 'twenty-five',
        component: 'NumberValidator',
    },
    {
        validator: 'validateSliceEndText',
        load: () => import('../common/slice-end-text.schema'),
        zodExport: 'SliceEndTextZod',
        zodIsFactory: true,
        key: 'sliceEndText',
        valid: '...',
        invalid: 42,
        component: 'SliceEndTextValidator',
    },
    {
        validator: 'validateString',
        load: () => import('../common/string.schema'),
        zodExport: 'StringZod',
        zodIsFactory: true,
        key: 'siteName',
        valid: 'Aura',
        invalid: 42,
        component: 'StringValidator',
    },
    {
        validator: 'validateStringArray',
        load: () => import('../common/string-array.schema'),
        zodExport: 'StringArrayZod',
        zodIsFactory: false,
        key: 'searchableItems',
        valid: ['name', 'email'],
        invalid: 'name,email',
        component: 'StringArrayValidator',
        extraArgs: [['fallback-item']],
    },
    {
        validator: 'validateTimeZone',
        load: () => import('../common/time-zone.schema'),
        zodExport: 'TimeZoneZod',
        zodIsFactory: true,
        key: 'timeZone',
        valid: 'UTC',
        invalid: 'Nowhere/Nope',
        component: 'TimeZoneValidator',
    },
    {
        validator: 'validateUnitIdentifier',
        load: () => import('../common/unit-identifier.schema'),
        zodExport: 'UnitIdentifierZod',
        zodIsFactory: true,
        key: 'unit',
        valid: 'kilometer',
        invalid: 42,
        component: 'UnitIdentifierValidator',
    },
    {
        validator: 'validateUtcOffset',
        load: () => import('../common/utc-offset.schema'),
        zodExport: 'UtcOffsetZod',
        zodIsFactory: true,
        key: 'utcOffset',
        valid: '+02:00',
        invalid: 'two hours ahead',
        component: 'UtcOffsetValidator',
    },
];

/** Findings recorded by the wrapper under test. */
const findings = (): ECSError[] => useErrorHandlerStore(STORE_ID).errors;

/** Resolves the wrapper's exported function from a freshly imported module. */
const resolve = async (entry: WrapperCase): Promise<Validator> => {
    const module = await entry.load();
    return module[entry.validator] as Validator;
};

/** Calls a wrapper with the family's argument order: value, store id, key, then extras. */
const callWith = (validate: Validator, entry: WrapperCase, value: unknown, key: string) =>
    validate(value, STORE_ID, key, ...(entry.extraArgs ?? []));

describe('schema wrapper contract', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    afterEach(() => {
        vi.doUnmock(ZOD_BARREL);
        vi.resetModules();
    });

    it('should cover every zod-backed wrapper under schemas/config and schemas/common', () => {
        // Guards the table against drift: a new wrapper that nobody adds a row for would
        // otherwise leave this whole suite silently passing over it.
        const names = wrappers.map(entry => entry.validator);

        expect(new Set(names).size).toBe(names.length);
        expect(names).toHaveLength(21);
    });

    describe.each(wrappers)('$validator', entry => {
        it('should return the parsed value and report nothing for a valid input', async () => {
            const validate = await resolve(entry);

            const result = callWith(validate, entry, entry.valid, entry.key);

            expect(result).toBeDefined();
            expect(findings()).toEqual([]);
        });

        it('should fall back and report exactly one finding for an invalid input', async () => {
            const validate = await resolve(entry);

            expect(() => callWith(validate, entry, entry.invalid, entry.key)).not.toThrow();

            expect(findings()).toHaveLength(1);
            expect(findings()[0]).toMatchObject({
                severity: 'warning',
                action: 'validate',
                type: 'validation',
                component: entry.component,
                key: entry.key,
            });
            // The zod message, not the catch-all — this is the branch that is reachable
            expect(findings()[0]?.details).not.toBe(UNKNOWN_VALIDATION_ERROR);
        });

        it('should not throw on undefined', async () => {
            const validate = await resolve(entry);

            // Whether `undefined` is acceptable is the schema's business; what matters
            // here is that an unset config key never breaks the merge.
            expect(() => callWith(validate, entry, undefined, entry.key)).not.toThrow();
        });

        it('should still produce a usable value for a key with no registered default', async () => {
            const validate = await resolve(entry);
            let result: unknown;

            // The key-taking wrappers end their fallback with `defaults[key] ?? <literal>`.
            // A key absent from the defaults map is what makes that literal the answer —
            // without it an unknown config key would fall back to `undefined`, which is
            // exactly the value the wrapper exists to prevent.
            expect(() => {
                result = callWith(validate, entry, entry.invalid, UNREGISTERED_KEY);
            }).not.toThrow();

            expect(result).not.toBeUndefined();
            expect(findings()).toHaveLength(1);
        });

        it('should still report when the schema throws a non-Error', async () => {
            const thrower = {
                parse: () => {
                    throw NON_ERROR_THROW;
                },
            };

            vi.doMock(ZOD_BARREL, async () => {
                const actual = await vi.importActual<Record<string, unknown>>(ZOD_BARREL);
                return {
                    ...actual,
                    [entry.zodExport]: entry.zodIsFactory ? () => thrower : thrower,
                };
            });
            vi.resetModules();

            const validate = await resolve(entry);

            expect(() => callWith(validate, entry, entry.valid, entry.key)).not.toThrow();

            expect(findings()).toHaveLength(1);
            expect(findings()[0]).toMatchObject({
                severity: 'warning',
                component: entry.component,
                details: UNKNOWN_VALIDATION_ERROR,
            });
        });
    });
});
