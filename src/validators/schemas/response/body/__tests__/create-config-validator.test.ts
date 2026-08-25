import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { z } from 'zod';
import { createConfigValidator } from '../create-config-validator';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-create-config-validator-store';
const TEST_CONFIG_KEY = 'test.key';

const testZodSchema = z.object({ type: z.literal('test'), value: z.string() });
const testAllowedKeys = new Set(['type', 'value']);
const TEST_VALIDATOR_NAME = 'TestValidator';
const TEST_ERROR_MESSAGE = 'Invalid test config';

/** The module holding the `data-*` value schema — mocked by the second non-Error case. */
const DATA_ATTRIBUTE_ZOD = '../../../../zod/response/header/data-attribute.zod';

describe('createConfigValidator', () => {
    const mockAddSchemaValidationError = vi.fn();

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({
            addSchemaValidationError: mockAddSchemaValidationError,
        } as any);
    });

    // -------------------------------------------------------------------------
    // factory creation
    // -------------------------------------------------------------------------
    describe('factory creation', () => {
        it('should return a function', () => {
            const validator = createConfigValidator(
                testZodSchema,
                testAllowedKeys,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE
            );

            expect(typeof validator).toBe('function');
        });
    });

    // -------------------------------------------------------------------------
    // valid cases
    // -------------------------------------------------------------------------
    describe('valid cases', () => {
        it('should validate and return a valid config', () => {
            const validator = createConfigValidator(
                testZodSchema,
                testAllowedKeys,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE
            );

            const config = { type: 'test', value: 'hello' };
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY);

            expect(result).toMatchObject({ type: 'test', value: 'hello' });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should preserve data-* attributes in valid config', () => {
            const validator = createConfigValidator(
                testZodSchema,
                testAllowedKeys,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE
            );

            const config = { type: 'test', value: 'hello', 'data-id': '123' };
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY) as Record<
                string,
                unknown
            >;

            expect(result['data-id']).toBe('123');
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should strip unknown non-data keys', () => {
            const validator = createConfigValidator(
                testZodSchema,
                testAllowedKeys,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE
            );

            const config = { type: 'test', value: 'hello', unknownKey: true, anotherUnknown: 42 };
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY) as Record<
                string,
                unknown
            >;

            expect(result).not.toHaveProperty('unknownKey');
            expect(result).not.toHaveProperty('anotherUnknown');
            expect(result).toHaveProperty('type', 'test');
            expect(result).toHaveProperty('value', 'hello');
        });
    });

    // -------------------------------------------------------------------------
    // invalid config — Zod validation failure
    // -------------------------------------------------------------------------
    describe('invalid config - Zod validation failure', () => {
        it('should throw and report error for invalid config', () => {
            const validator = createConfigValidator(
                testZodSchema,
                testAllowedKeys,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE
            );

            const config = { type: 'test' }; // missing required 'value'

            expect(() => validator(config, TEST_STORE_ID, TEST_CONFIG_KEY)).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE,
                TEST_CONFIG_KEY,
                config,
                expect.any(String)
            );
        });

        it('should include configKey in thrown error message', () => {
            const validator = createConfigValidator(
                testZodSchema,
                testAllowedKeys,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE
            );

            const config = { type: 'test' }; // missing required 'value'
            const key = 'response.body.columnConfigs.myField';

            expect(() => validator(config, TEST_STORE_ID, key)).toThrow(
                expect.objectContaining({ message: expect.stringContaining(key) })
            );
        });
    });

    // -------------------------------------------------------------------------
    // data-* attribute validation
    // -------------------------------------------------------------------------
    describe('data-* attribute validation', () => {
        it('should accept valid data-* string attribute', () => {
            const validator = createConfigValidator(
                testZodSchema,
                testAllowedKeys,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE
            );

            const config = { type: 'test', value: 'hello', 'data-name': 'John' };

            expect(() => validator(config, TEST_STORE_ID, TEST_CONFIG_KEY)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should throw and report error for invalid data-* attribute', () => {
            const validator = createConfigValidator(
                testZodSchema,
                testAllowedKeys,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE
            );

            const invalidDataValue = { nested: true };
            const config = { type: 'test', value: 'hello', 'data-bad': invalidDataValue };

            expect(() => validator(config, TEST_STORE_ID, TEST_CONFIG_KEY)).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                TEST_VALIDATOR_NAME,
                `Invalid data attribute 'data-bad'`,
                `${TEST_CONFIG_KEY}.data-bad`,
                invalidDataValue,
                expect.any(String)
            );
        });

        it('should skip null/undefined data-* attributes', () => {
            const validator = createConfigValidator(
                testZodSchema,
                testAllowedKeys,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE
            );

            const config = {
                type: 'test',
                value: 'hello',
                'data-null': null,
                'data-undef': undefined,
            };

            expect(() => validator(config, TEST_STORE_ID, TEST_CONFIG_KEY)).not.toThrow();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // mapping nested strip (5th argument: mappingEntryAllowedKeys)
    // -------------------------------------------------------------------------
    describe('mapping nested strip', () => {
        const mappingZodSchema = z.object({
            type: z.literal('test'),
            value: z.string(),
            mapping: z.record(z.string(), z.unknown()).nullable().optional(),
        });
        const mappingEntryAllowedKeys = new Set(['label', 'variant']);

        it('should behave like before (no nested strip) when 5th arg is omitted', () => {
            const validator = createConfigValidator(
                mappingZodSchema,
                new Set(['type', 'value', 'mapping']),
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE
            );

            const config = {
                type: 'test',
                value: 'hello',
                mapping: { high: { label: 'High', variant: 'danger', unknownKey: 'kept' } },
            };
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY) as Record<
                string,
                unknown
            >;
            const mapping = result.mapping as Record<string, unknown>;

            // Backward compatible: without the 5th arg, entries are not nested-stripped.
            expect((mapping.high as Record<string, unknown>).unknownKey).toBe('kept');
        });

        it('should strip unknown keys from every mapping entry when 5th arg is provided', () => {
            const validator = createConfigValidator(
                mappingZodSchema,
                new Set(['type', 'value', 'mapping']),
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE,
                mappingEntryAllowedKeys
            );

            const config = {
                type: 'test',
                value: 'hello',
                mapping: { high: { label: 'High', variant: 'danger', unknownKey: 'gone' } },
            };
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY) as Record<
                string,
                unknown
            >;
            const entry = (result.mapping as Record<string, unknown>).high as Record<
                string,
                unknown
            >;

            expect(entry).not.toHaveProperty('unknownKey');
            expect(entry).toEqual({ label: 'High', variant: 'danger' });
        });

        it('should strip `type` out of a mapping entry (no type-switch via mapping)', () => {
            const validator = createConfigValidator(
                mappingZodSchema,
                new Set(['type', 'value', 'mapping']),
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE,
                mappingEntryAllowedKeys
            );

            const config = {
                type: 'test',
                value: 'hello',
                mapping: { high: { label: 'High', type: 'other-type' } },
            };
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY) as Record<
                string,
                unknown
            >;
            const entry = (result.mapping as Record<string, unknown>).high as Record<
                string,
                unknown
            >;

            expect(entry).not.toHaveProperty('type');
        });

        it('should strip data-* attributes out of a mapping entry (not allowed within entries)', () => {
            const validator = createConfigValidator(
                mappingZodSchema,
                new Set(['type', 'value', 'mapping']),
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE,
                mappingEntryAllowedKeys
            );

            const config = {
                type: 'test',
                value: 'hello',
                mapping: { high: { label: 'High', 'data-id': '123' } },
            };
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY) as Record<
                string,
                unknown
            >;
            const entry = (result.mapping as Record<string, unknown>).high as Record<
                string,
                unknown
            >;

            expect(entry).not.toHaveProperty('data-id');
        });

        it('should not error and leave mapping as-is when mapping is null', () => {
            const validator = createConfigValidator(
                mappingZodSchema,
                new Set(['type', 'value', 'mapping']),
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE,
                mappingEntryAllowedKeys
            );

            const config = { type: 'test', value: 'hello', mapping: null };

            expect(() => validator(config, TEST_STORE_ID, TEST_CONFIG_KEY)).not.toThrow();
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY) as Record<
                string,
                unknown
            >;
            expect(result.mapping).toBeNull();
        });

        it('should not error when mapping is absent entirely', () => {
            const validator = createConfigValidator(
                mappingZodSchema,
                new Set(['type', 'value', 'mapping']),
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE,
                mappingEntryAllowedKeys
            );

            const config = { type: 'test', value: 'hello' };

            expect(() => validator(config, TEST_STORE_ID, TEST_CONFIG_KEY)).not.toThrow();
        });

        it('should leave a non-object mapping entry value untouched (e.g. null)', () => {
            const validator = createConfigValidator(
                mappingZodSchema,
                new Set(['type', 'value', 'mapping']),
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE,
                mappingEntryAllowedKeys
            );

            const config = { type: 'test', value: 'hello', mapping: { broken: null } };
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY) as Record<
                string,
                unknown
            >;

            expect((result.mapping as Record<string, unknown>).broken).toBeNull();
        });
    });

    // -------------------------------------------------------------------------
    // single-entry nested strip (6th argument: singleEntryKeys)
    // -------------------------------------------------------------------------
    describe('single-entry nested strip', () => {
        const singleZodSchema = z.object({
            type: z.literal('test'),
            value: z.string(),
            mapping: z.record(z.string(), z.unknown()).nullable().optional(),
            trueValue: z.unknown().nullable().optional(),
            falseValue: z.unknown().nullable().optional(),
        });
        const entryKeys = new Set(['label', 'variant']);
        const singleKeys = new Set(['trueValue', 'falseValue']);
        const allowed = new Set(['type', 'value', 'mapping', 'trueValue', 'falseValue']);

        it('should strip unknown keys from named single-entry objects', () => {
            const validator = createConfigValidator(
                singleZodSchema,
                allowed,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE,
                entryKeys,
                singleKeys
            );

            const config = {
                type: 'test',
                value: 'hello',
                trueValue: { label: 'Yes', variant: 'success', evil: 'x', 'data-id': '1' },
                falseValue: { label: 'No', bad: 'y' },
            };
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY) as Record<
                string,
                unknown
            >;

            expect(result.trueValue).toEqual({ label: 'Yes', variant: 'success' });
            expect(result.falseValue).toEqual({ label: 'No' });
        });

        it('should leave non-object single-entry values untouched (null/absent)', () => {
            const validator = createConfigValidator(
                singleZodSchema,
                allowed,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE,
                entryKeys,
                singleKeys
            );

            const config = { type: 'test', value: 'hello', trueValue: null };
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY) as Record<
                string,
                unknown
            >;
            expect(result.trueValue).toBeNull();
            expect(result).not.toHaveProperty('falseValue');
        });

        it('should be a no-op for single keys when mappingEntryAllowedKeys is omitted', () => {
            const validator = createConfigValidator(
                singleZodSchema,
                allowed,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE,
                undefined,
                singleKeys
            );

            const config = { type: 'test', value: 'hello', trueValue: { label: 'Yes', evil: 'x' } };
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY) as Record<
                string,
                unknown
            >;
            expect(result.trueValue).toEqual({ label: 'Yes', evil: 'x' });
        });
    });

    // -------------------------------------------------------------------------
    // prototype-key hardening
    // -------------------------------------------------------------------------
    describe('prototype-key hardening', () => {
        const protoZodSchema = z.object({
            type: z.literal('test'),
            value: z.string(),
            mapping: z.record(z.string(), z.unknown()).nullable().optional(),
            trueValue: z.unknown().nullable().optional(),
        });
        const protoAllowedKeys = new Set(['type', 'value', 'mapping', 'trueValue']);
        const protoEntryKeys = new Set(['label', 'variant']);
        const protoSingleKeys = new Set(['trueValue']);

        const buildValidator = () =>
            createConfigValidator(
                protoZodSchema,
                protoAllowedKeys,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE,
                protoEntryKeys,
                protoSingleKeys
            );

        /** A config as it arrives from the wire — `JSON.parse` mints a real own `__proto__` */
        const parseConfig = (json: string) => JSON.parse(json) as Record<string, unknown>;

        it('should return a null-prototype config object', () => {
            const result = buildValidator()(
                { type: 'test', value: 'hello' },
                TEST_STORE_ID,
                TEST_CONFIG_KEY
            );

            expect(Object.getPrototypeOf(result)).toBeNull();
        });

        it.each(['__proto__', 'constructor', 'prototype'])(
            'should drop the top-level %s key',
            key => {
                const result = buildValidator()(
                    parseConfig(`{"type":"test","value":"hello","${key}":{"polluted":true}}`),
                    TEST_STORE_ID,
                    TEST_CONFIG_KEY
                ) as Record<string, unknown>;

                expect(Object.keys(result)).toEqual(['type', 'value']);
                expect(Object.getPrototypeOf(result)).toBeNull();
            }
        );

        it.each(['__proto__', 'constructor', 'prototype'])(
            'should drop a mapping entry keyed %s',
            key => {
                const result = buildValidator()(
                    parseConfig(
                        `{"type":"test","value":"hello","mapping":{"high":{"label":"High"},"${key}":{"label":"Owned"}}}`
                    ),
                    TEST_STORE_ID,
                    TEST_CONFIG_KEY
                ) as Record<string, unknown>;
                const mapping = result.mapping as Record<string, unknown>;

                expect(Object.keys(mapping)).toEqual(['high']);
                expect(mapping).toEqual({ high: { label: 'High' } });
            }
        );

        it('should not let a __proto__ mapping entry retarget the mapping prototype', () => {
            // The bug this closes: `result['__proto__'] = entry` on an `{}` literal runs the
            // Object.prototype setter, so the entry vanishes from `Object.keys` while every
            // one of its keys becomes readable on the mapping object.
            const result = buildValidator()(
                parseConfig(
                    '{"type":"test","value":"hello","mapping":{"__proto__":{"label":"Owned","variant":"danger"}}}'
                ),
                TEST_STORE_ID,
                TEST_CONFIG_KEY
            ) as Record<string, unknown>;
            const mapping = result.mapping as Record<string, unknown>;

            expect(Object.getPrototypeOf(mapping)).toBeNull();
            expect(mapping.label).toBeUndefined();
            expect(mapping.variant).toBeUndefined();
        });

        it('should drop a prototype-keyed mapping entry whose value is not an object', () => {
            // The non-object branch assigns the raw value through — `__proto__` = null on an
            // object literal strips the prototype outright.
            const result = buildValidator()(
                parseConfig('{"type":"test","value":"hello","mapping":{"__proto__":null}}'),
                TEST_STORE_ID,
                TEST_CONFIG_KEY
            ) as Record<string, unknown>;
            const mapping = result.mapping as Record<string, unknown>;

            expect(Object.keys(mapping)).toEqual([]);
        });

        it('should drop prototype keys from inside a mapping entry', () => {
            const result = buildValidator()(
                parseConfig(
                    '{"type":"test","value":"hello","mapping":{"high":{"label":"High","__proto__":{"polluted":true}}}}'
                ),
                TEST_STORE_ID,
                TEST_CONFIG_KEY
            ) as Record<string, unknown>;
            const entry = (result.mapping as Record<string, unknown>).high as Record<
                string,
                unknown
            >;

            expect(entry).toEqual({ label: 'High' });
            expect(Object.getPrototypeOf(entry)).toBeNull();
        });

        it('should drop prototype keys from inside a single-entry object', () => {
            const result = buildValidator()(
                parseConfig(
                    '{"type":"test","value":"hello","trueValue":{"label":"Yes","__proto__":{"polluted":true}}}'
                ),
                TEST_STORE_ID,
                TEST_CONFIG_KEY
            ) as Record<string, unknown>;
            const entry = result.trueValue as Record<string, unknown>;

            expect(entry).toEqual({ label: 'Yes' });
            expect(Object.getPrototypeOf(entry)).toBeNull();
        });

        it('should leave the global Object.prototype untouched', () => {
            buildValidator()(
                parseConfig(
                    '{"type":"test","value":"hello","mapping":{"__proto__":{"polluted":"yes"}}}'
                ),
                TEST_STORE_ID,
                TEST_CONFIG_KEY
            );

            expect(({} as Record<string, unknown>).polluted).toBeUndefined();
        });
    });

    // -------------------------------------------------------------------------
    // immutability
    // -------------------------------------------------------------------------
    describe('immutability', () => {
        it('should not mutate the input config', () => {
            const validator = createConfigValidator(
                testZodSchema,
                testAllowedKeys,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE
            );

            const config = { type: 'test', value: 'hello', unknownKey: true };
            const originalConfig = { ...config };

            validator(config, TEST_STORE_ID, TEST_CONFIG_KEY);

            expect(config).toEqual(originalConfig);
        });

        it('should return a new object reference', () => {
            const validator = createConfigValidator(
                testZodSchema,
                testAllowedKeys,
                TEST_VALIDATOR_NAME,
                TEST_ERROR_MESSAGE
            );

            const config = { type: 'test', value: 'hello' };
            const result = validator(config, TEST_STORE_ID, TEST_CONFIG_KEY);

            expect(result).not.toBe(config);
        });
    });
});

/**
 * The non-`Error` throw branches.
 *
 * Both catch blocks end in `error instanceof Error ? error.message : <fallback>`. Zod only
 * ever throws `ZodError`, so the fallback half is unreachable from any input — the factory
 * is reachable only because it takes its schema as a *parameter*, which is why this file
 * can inject a thrower where the response wrappers have to mock a module
 * (`schemas/response/__tests__/response-wrapper.contract.test.ts`).
 */
describe('createConfigValidator non-Error throws', () => {
    const mockAddSchemaValidationError = vi.fn();

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({
            addSchemaValidationError: mockAddSchemaValidationError,
        } as any);
    });

    it('should report and rethrow when the config schema throws a non-Error', () => {
        const throwingSchema = {
            parse: () => {
                throw 'the schema itself blew up';
            },
        } as unknown as z.ZodType;

        const validator = createConfigValidator(
            throwingSchema,
            testAllowedKeys,
            TEST_VALIDATOR_NAME,
            TEST_ERROR_MESSAGE
        );

        expect(() => validator({ type: 'test' }, TEST_STORE_ID, TEST_CONFIG_KEY)).toThrow(
            'Unknown error'
        );

        expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
            TEST_VALIDATOR_NAME,
            TEST_ERROR_MESSAGE,
            TEST_CONFIG_KEY,
            { type: 'test' },
            'Unknown validation error'
        );
    });

    it('should report and rethrow when the data-attribute schema throws a non-Error', async () => {
        // The second catch guards `data-*` values, and its schema is imported rather than
        // injected — so this is the one branch in the file that needs the module mocked.
        vi.doMock(DATA_ATTRIBUTE_ZOD, async () => ({
            ...(await vi.importActual(DATA_ATTRIBUTE_ZOD)),
            DataAttributeValueZod: {
                parse: () => {
                    throw 'the data-attribute schema blew up';
                },
            },
        }));
        vi.resetModules();

        const { createConfigValidator: freshFactory } = await import('../create-config-validator');
        const validator = freshFactory(
            testZodSchema,
            testAllowedKeys,
            TEST_VALIDATOR_NAME,
            TEST_ERROR_MESSAGE
        );
        const config = { type: 'test', value: 'hello', 'data-id': 7 };

        expect(() => validator(config, TEST_STORE_ID, TEST_CONFIG_KEY)).toThrow(
            'invalid data attribute'
        );

        expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
            TEST_VALIDATOR_NAME,
            "Invalid data attribute 'data-id'",
            `${TEST_CONFIG_KEY}.data-id`,
            7,
            'Invalid data attribute value'
        );

        vi.doUnmock(DATA_ATTRIBUTE_ZOD);
        vi.resetModules();
    });
});
