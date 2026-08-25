import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { readdirSync, readFileSync } from 'fs';
import { resolve as resolvePath } from 'path';
import { useErrorHandlerStore } from '../../../../state/core/error-handler.state';
import type { ECSError } from '../../../../types/error.types';

/**
 * The contract every response-section validator shares.
 *
 * These are the sibling family of the config wrappers covered by
 * `schemas/__tests__/schema-wrapper.contract.test.ts`, and they differ in one decisive
 * way: a config wrapper **falls back** to a default, while a response wrapper **rethrows**.
 * A malformed config key is a nuisance; a malformed `header` means there are no columns to
 * render, so response processing must abort rather than continue on half-validated data.
 *
 * What nothing checked was the shape of the family — that every member reports exactly one
 * finding under its own validator name before it rethrows, and that the rethrown message
 * carries the section's own prefix, which is all the caller has to tell the sections apart.
 *
 * It also closes the branch that made these the lowest-covered files in `src/`: the
 * `error instanceof Error ? … : 'Unknown validation error'` / `'Unknown error'` pair. Zod
 * only ever throws `ZodError`, so the second half is unreachable from any input — it is
 * reachable only if the schema module itself blows up, which is what the third case
 * simulates by mocking the zod module each wrapper parses with.
 *
 * A new response section gets its three cases by adding one row to the table below; the
 * first drift guard fails if someone adds the wrapper and forgets the row.
 */

const STORE_ID = 'response-wrapper-contract';

/** Deliberately not an `Error` — this is what the third case throws out of `parse`. */
const NON_ERROR_THROW = 'zod itself blew up';

/** The details the wrappers record when the thrown value carries no `.message`. */
const UNKNOWN_VALIDATION_ERROR = 'Unknown validation error';

/** The message fragment the wrappers rethrow when the thrown value carries no `.message`. */
const UNKNOWN_ERROR = 'Unknown error';

/** A minimal header cell that satisfies `validateHeaderCell`. */
const VALID_CELL = { content: 'ID', field: 'id', key: 'id' };

/** A minimal header/footer row. */
const VALID_ROW = { cells: [VALID_CELL] };

/** A value no section schema accepts — every section is an object or an array. */
const INVALID_SECTION = 'not-an-object';

/** Stands in for the section's zod schema in the third case. */
const THROWING_SCHEMA = {
    parse: (): never => {
        throw NON_ERROR_THROW;
    },
};

type Validator = (...args: unknown[]) => unknown;

interface WrapperCase {
    /** The exported validator's name — the label of its `describe` block */
    validator: string;
    /** Path of the wrapper's source file, relative to `schemas/response/` */
    file: string;
    /** Imports the wrapper module; re-run per test so the zod mock can take effect */
    load: () => Promise<Record<string, unknown>>;
    /** Replaces the section's zod schema with `THROWING_SCHEMA`, keeping the module's rest */
    mockZod: () => void;
    /** Drops that mock again — paired with `mockZod` so `afterEach` needs no bookkeeping */
    unmockZod: () => void;
    /** The `key` argument */
    key: string;
    /** The key the finding is reported under, when it is not `key` itself */
    reportedKey?: string;
    /** A first argument the wrapper accepts */
    valid: unknown;
    /** A first argument whose section value the schema rejects */
    invalid: unknown;
    /** The `component` the finding is reported under */
    component: string;
    /** The prefix of the rethrown message */
    prefix: string;
    /** Arguments after `key`, for the wrappers that take more */
    extraArgs?: unknown[];
}

const HEADER_ZOD = '../../../zod/response/header/header.zod';
const HEADER_ROWS_ZOD = '../../../zod/response/header/header-rows.zod';
const HEADER_CELLS_ZOD = '../../../zod/response/header/header-cells.zod';
const HEADER_SETTINGS_ZOD = '../../../zod/response/header/header-settings.zod';
const FOOTER_ZOD = '../../../zod/response/footer/footer.zod';
const FOOTER_SETTINGS_ZOD = '../../../zod/response/footer/footer-settings.zod';
const BODY_ZOD = '../../../zod/response/body/body.zod';

/**
 * `vi.doMock` and `vi.importActual` both need a specifier the transform can see, so each
 * row registers its own mock instead of passing a path around as data.
 */
const wrappers: WrapperCase[] = [
    {
        validator: 'validateHeader',
        file: 'header/header.schema.ts',
        load: () => import('../header/header.schema'),
        mockZod: () =>
            vi.doMock(HEADER_ZOD, async () => ({
                ...(await vi.importActual(HEADER_ZOD)),
                HeaderZod: THROWING_SCHEMA,
            })),
        unmockZod: () => vi.doUnmock(HEADER_ZOD),
        key: 'response.header',
        valid: { header: { rows: [VALID_ROW] }, items: [] },
        invalid: { header: INVALID_SECTION, items: [] },
        component: 'HeaderValidator',
        prefix: 'Header validation failed',
    },
    {
        validator: 'validateHeaderRows',
        file: 'header/header-rows.schema.ts',
        load: () => import('../header/header-rows.schema'),
        mockZod: () =>
            vi.doMock(HEADER_ROWS_ZOD, async () => ({
                ...(await vi.importActual(HEADER_ROWS_ZOD)),
                HeaderRowsZod: THROWING_SCHEMA,
            })),
        unmockZod: () => vi.doUnmock(HEADER_ROWS_ZOD),
        key: 'response.header.rows',
        valid: { rows: [VALID_ROW] },
        invalid: { rows: INVALID_SECTION },
        component: 'HeaderRowsValidator',
        prefix: 'Header rows validation failed',
    },
    {
        validator: 'validateHeaderCells',
        file: 'header/header-cells.schema.ts',
        load: () => import('../header/header-cells.schema'),
        mockZod: () =>
            vi.doMock(HEADER_CELLS_ZOD, async () => ({
                ...(await vi.importActual(HEADER_CELLS_ZOD)),
                HeaderCellsZod: THROWING_SCHEMA,
            })),
        unmockZod: () => vi.doUnmock(HEADER_CELLS_ZOD),
        key: 'response.header.rows[0].cells',
        valid: VALID_ROW,
        invalid: { cells: INVALID_SECTION },
        component: 'HeaderCellsValidator',
        prefix: 'Header cells validation failed',
        extraArgs: [0],
    },
    {
        validator: 'validateHeaderSettings',
        file: 'header/header-settings.schema.ts',
        load: () => import('../header/header-settings.schema'),
        mockZod: () =>
            vi.doMock(HEADER_SETTINGS_ZOD, async () => ({
                ...(await vi.importActual(HEADER_SETTINGS_ZOD)),
                HeaderSettingsZod: THROWING_SCHEMA,
            })),
        unmockZod: () => vi.doUnmock(HEADER_SETTINGS_ZOD),
        key: 'response.header.settings',
        valid: { settings: { sticky: true } },
        invalid: { settings: INVALID_SECTION },
        component: 'HeaderSettingsValidator',
        prefix: 'Header settings validation failed',
        extraArgs: [[]],
    },
    {
        validator: 'validateFooter',
        file: 'footer/footer.schema.ts',
        load: () => import('../footer/footer.schema'),
        mockZod: () =>
            vi.doMock(FOOTER_ZOD, async () => ({
                ...(await vi.importActual(FOOTER_ZOD)),
                FooterZod: THROWING_SCHEMA,
            })),
        unmockZod: () => vi.doUnmock(FOOTER_ZOD),
        key: 'response.footer',
        valid: { footer: { rows: [VALID_ROW] }, items: [] },
        invalid: { footer: INVALID_SECTION, items: [] },
        component: 'FooterValidator',
        prefix: 'Footer validation failed',
    },
    {
        validator: 'validateFooterSettings',
        file: 'footer/footer-settings.schema.ts',
        load: () => import('../footer/footer-settings.schema'),
        mockZod: () =>
            vi.doMock(FOOTER_SETTINGS_ZOD, async () => ({
                ...(await vi.importActual(FOOTER_SETTINGS_ZOD)),
                FooterSettingsZod: THROWING_SCHEMA,
            })),
        unmockZod: () => vi.doUnmock(FOOTER_SETTINGS_ZOD),
        key: 'response.footer',
        // The only member that derives the reported key instead of using the one it is given
        reportedKey: 'response.footer.settings',
        valid: { settings: { sticky: true } },
        invalid: { settings: INVALID_SECTION },
        component: 'FooterSettingsValidator',
        prefix: 'Footer settings validation failed',
    },
    {
        validator: 'validateBody',
        file: 'body/body.schema.ts',
        load: () => import('../body/body.schema'),
        mockZod: () =>
            vi.doMock(BODY_ZOD, async () => ({
                ...(await vi.importActual(BODY_ZOD)),
                BodyZod: THROWING_SCHEMA,
            })),
        unmockZod: () => vi.doUnmock(BODY_ZOD),
        key: 'response.body',
        valid: { body: { columnConfigs: {} }, items: [] },
        invalid: { body: INVALID_SECTION, items: [] },
        component: 'BodyValidator',
        prefix: 'Body validation failed',
    },
];

/**
 * Family members intentionally absent from the table above.
 *
 * `create-config-validator.ts` shares the report-then-rethrow shape but is a *factory*:
 * it takes its zod schema as a parameter, so its own test file injects a throwing schema
 * directly and needs none of the module mocking this file does.
 */
const FACTORY_EXCEPTIONS = ['body/create-config-validator.ts'];

/** Findings recorded by the wrapper under test. */
const findings = (): ECSError[] => useErrorHandlerStore(STORE_ID).errors;

/** Resolves the wrapper's exported function from a freshly imported module. */
const resolveValidator = async (entry: WrapperCase): Promise<Validator> => {
    const module = await entry.load();
    return module[entry.validator] as Validator;
};

/** Calls a wrapper with the family's argument order: value, store id, key, then extras. */
const callWith = (validate: Validator, entry: WrapperCase, value: unknown) =>
    validate(value, STORE_ID, entry.key, ...(entry.extraArgs ?? []));

describe('response wrapper contract', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    afterEach(() => {
        wrappers.forEach(entry => entry.unmockZod());
        vi.resetModules();
    });

    it('should cover every report-then-rethrow wrapper under schemas/response', () => {
        // Guards the table against drift: a new response section that nobody adds a row
        // for would otherwise leave this whole suite silently passing over it. The
        // sentinel is the rethrow fallback every member of the family carries.
        const responseDir = resolvePath(__dirname, '..');

        const collect = (dir: string): string[] =>
            readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
                const full = resolvePath(dir, entry.name);
                if (entry.isDirectory()) return entry.name === '__tests__' ? [] : collect(full);
                if (!entry.name.endsWith('.ts')) return [];
                return readFileSync(full, 'utf8').includes(UNKNOWN_ERROR) ? [full] : [];
            });

        const familyFiles = collect(responseDir)
            .map(file => file.slice(responseDir.length + 1).replace(/\\/g, '/'))
            .sort();
        const covered = [...wrappers.map(entry => entry.file), ...FACTORY_EXCEPTIONS].sort();

        expect(familyFiles).toEqual(covered);
    });

    it('should list every wrapper exactly once', () => {
        const names = wrappers.map(entry => entry.validator);

        expect(new Set(names).size).toBe(names.length);
        expect(names).toHaveLength(7);
    });

    describe.each(wrappers)('$validator', entry => {
        it('should return the parsed section and report nothing for a valid input', async () => {
            const validate = await resolveValidator(entry);

            const result = callWith(validate, entry, entry.valid);

            expect(result).toBeDefined();
            expect(findings()).toEqual([]);
        });

        it('should report exactly one finding and rethrow for an invalid input', async () => {
            const validate = await resolveValidator(entry);

            expect(() => callWith(validate, entry, entry.invalid)).toThrow(entry.prefix);

            expect(findings()).toHaveLength(1);
            expect(findings()[0]).toMatchObject({
                severity: 'warning',
                action: 'validate',
                type: 'validation',
                component: entry.component,
                key: entry.reportedKey ?? entry.key,
            });
            // The zod message, not the catch-all — this is the branch that is reachable
            expect(findings()[0]?.details).not.toBe(UNKNOWN_VALIDATION_ERROR);
        });

        it('should still report and rethrow when the schema throws a non-Error', async () => {
            entry.mockZod();
            vi.resetModules();

            const validate = await resolveValidator(entry);

            expect(() => callWith(validate, entry, entry.valid)).toThrow(UNKNOWN_ERROR);

            expect(findings()).toHaveLength(1);
            expect(findings()[0]).toMatchObject({
                component: entry.component,
                details: UNKNOWN_VALIDATION_ERROR,
            });
        });
    });
});
