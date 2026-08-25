import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { validateBody } from '../body.schema';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';

vi.mock('../../../../../state/core/error-handler.state', () => ({
    useErrorHandlerStore: vi.fn(),
}));

const TEST_STORE_ID = 'test-body-schema-store';

describe('validateBody', () => {
    const mockAddSchemaValidationError = vi.fn();

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        vi.mocked(useErrorHandlerStore).mockReturnValue({
            addSchemaValidationError: mockAddSchemaValidationError,
        } as any);
    });

    // -------------------------------------------------------------------------
    // valid cases — body undefined
    // -------------------------------------------------------------------------
    describe('body is undefined', () => {
        it('should return undefined when body is missing from response', () => {
            const apiResponse = { header: { rows: [] } } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result).toBeUndefined();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should not call useErrorHandlerStore when body is undefined', () => {
            const apiResponse = {} as any;

            validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(vi.mocked(useErrorHandlerStore)).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // valid cases — body present
    // -------------------------------------------------------------------------
    describe('valid body', () => {
        it('should accept empty body object', () => {
            const apiResponse = { body: {} } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result).toBeDefined();
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should accept body with columnConfigs: null', () => {
            const apiResponse = { body: { columnConfigs: null } } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result).toBeDefined();
            expect(result?.columnConfigs).toBeNull();
        });

        it('should accept body with columnConfigs: undefined (omitted)', () => {
            const apiResponse = { body: {} } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result).toBeDefined();
            expect(result?.columnConfigs).toBeUndefined();
        });

        it('should validate a single static columnConfig entry', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        idPrefix: { type: 'static', value: 'ID:' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs).toBeDefined();
            expect(result?.columnConfigs?.idPrefix).toMatchObject({
                type: 'static',
                value: 'ID:',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should validate multiple static columnConfig entries', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        idPrefix: { type: 'static', value: 'ID:' },
                        statusLabel: { type: 'static', value: 'Active', color: 'success' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.idPrefix).toMatchObject({ type: 'static', value: 'ID:' });
            expect(result?.columnConfigs?.statusLabel).toMatchObject({
                type: 'static',
                value: 'Active',
                color: 'success',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should pass through settings', () => {
            const apiResponse = {
                body: {
                    settings: { striped: true, hoverable: false },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.settings).toMatchObject({ striped: true, hoverable: false });
        });

        it('should pass through columnStyles', () => {
            const apiResponse = {
                body: {
                    columnStyles: { name: 'fw-bold', id: ['text-muted', 'pe-1'] },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnStyles).toEqual({ name: 'fw-bold', id: ['text-muted', 'pe-1'] });
        });

        it('should pass through rowRules', () => {
            const apiResponse = {
                body: {
                    rowRules: { key: 'status', if: [{ value: 'active', config: {} }] },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.rowRules).toMatchObject({ key: 'status' });
        });

        it('should accept full body with all fields', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        idPrefix: { type: 'static', value: '#' },
                    },
                    columnStyles: { id: 'text-muted' },
                    settings: { striped: true, hoverable: true },
                    rowRules: { key: 'status' },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result).toBeDefined();
            expect(result?.columnConfigs?.idPrefix).toMatchObject({ type: 'static', value: '#' });
            expect(result?.settings).toMatchObject({ striped: true });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // unknown type handling — warning, no throw
    // -------------------------------------------------------------------------
    describe('unknown columnConfig type handling', () => {
        it('should skip entry with unknown type and add warning', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        badge: { type: 'unknown-type', someData: 'value' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs).toBeDefined();
            expect(result?.columnConfigs?.badge).toBeUndefined();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'BodyValidator',
                'Unknown columnConfig type, skipping entry',
                'response.body.columnConfigs.badge',
                expect.any(Object),
                expect.stringContaining('unknown-type')
            );
        });

        it('should not throw for unknown type (only warn)', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        x: { type: 'future-type', data: 42 },
                    },
                },
            } as any;

            expect(() => validateBody(apiResponse, TEST_STORE_ID, 'response.body')).not.toThrow();
        });

        it('should skip entry when type is undefined', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        noType: { value: 'something' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.noType).toBeUndefined();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'BodyValidator',
                'Unknown columnConfig type, skipping entry',
                'response.body.columnConfigs.noType',
                expect.any(Object),
                expect.stringContaining('undefined')
            );
        });

        it('should skip entry when type is null', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        nullType: { type: null },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.nullType).toBeUndefined();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should keep valid entries alongside invalid type entries', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        validEntry: { type: 'static', value: 'OK' },
                        invalidEntry: { type: 'not-supported' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.validEntry).toMatchObject({
                type: 'static',
                value: 'OK',
            });
            expect(result?.columnConfigs?.invalidEntry).toBeUndefined();
            expect(mockAddSchemaValidationError).toHaveBeenCalledTimes(1);
        });

        it('should call addSchemaValidationError with correct key path for unknown type', () => {
            const apiResponse = {
                body: {
                    columnConfigs: { myCol: { type: 'custom-widget' } },
                },
            } as any;

            validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'BodyValidator',
                expect.any(String),
                'response.body.columnConfigs.myCol',
                expect.any(Object),
                expect.any(String)
            );
        });

        it('should dispatch icon type to validateIconConfig and include valid result', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        statusIcon: { type: 'icon', icon: 'check', variant: 'success' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.statusIcon).toMatchObject({
                type: 'icon',
                icon: 'check',
                variant: 'success',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should skip invalid icon config entry without throwing', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        badIcon: { type: 'icon' }, // no icon, no class, no conditional
                        goodStatic: { type: 'static', value: 'OK' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.badIcon).toBeUndefined();
            expect(result?.columnConfigs?.goodStatic).toMatchObject({
                type: 'static',
                value: 'OK',
            });
            expect(mockAddSchemaValidationError).toHaveBeenCalledTimes(1);
        });

        it('should dispatch reference type to validateReferenceConfig and include valid result', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        fullName: {
                            type: 'reference',
                            fields: ['firstName', 'lastName'],
                            separator: ' ',
                        },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.fullName).toMatchObject({
                type: 'reference',
                fields: ['firstName', 'lastName'],
                separator: ' ',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should skip invalid reference config entry without throwing', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        badRef: { type: 'reference' }, // no field, no fields, no conditional
                        goodStatic: { type: 'static', value: 'OK' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.badRef).toBeUndefined();
            expect(result?.columnConfigs?.goodStatic).toMatchObject({
                type: 'static',
                value: 'OK',
            });
            expect(mockAddSchemaValidationError).toHaveBeenCalledTimes(1);
        });

        it('should dispatch button type to validateButtonConfig and include valid result', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        edit: {
                            type: 'button',
                            field: 'name',
                            key: 'id',
                            route: '/users/{id}/edit',
                            variant: 'primary',
                            size: 'sm',
                        },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.edit).toMatchObject({
                type: 'button',
                field: 'name',
                route: '/users/{id}/edit',
                variant: 'primary',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should skip invalid button config entry without throwing', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        badButton: { type: 'button' }, // no field/value/route/icon, no conditional
                        goodStatic: { type: 'static', value: 'OK' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.badButton).toBeUndefined();
            expect(result?.columnConfigs?.goodStatic).toMatchObject({
                type: 'static',
                value: 'OK',
            });
            expect(mockAddSchemaValidationError).toHaveBeenCalledTimes(1);
        });

        it('should dispatch badge type to validateBadgeConfig and include valid result', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        priority: {
                            type: 'badge',
                            field: 'priority',
                            mapping: { high: { variant: 'danger', label: 'Magas' } },
                        },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.priority).toMatchObject({
                type: 'badge',
                field: 'priority',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should skip invalid badge config entry without throwing', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        badBadge: { type: 'badge' }, // no field/value/mapping/boolean, no conditional
                        goodStatic: { type: 'static', value: 'OK' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.badBadge).toBeUndefined();
            expect(result?.columnConfigs?.goodStatic).toMatchObject({
                type: 'static',
                value: 'OK',
            });
            expect(mockAddSchemaValidationError).toHaveBeenCalledTimes(1);
        });
    });

    // -------------------------------------------------------------------------
    // invalid structure — throw
    // -------------------------------------------------------------------------
    describe('invalid body structure', () => {
        it('should throw when body is not an object (string)', () => {
            const apiResponse = { body: 'not-an-object' } as any;

            expect(() => validateBody(apiResponse, TEST_STORE_ID, 'response.body')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'BodyValidator',
                'Invalid body structure in API response',
                'response.body',
                'not-an-object',
                expect.any(String)
            );
        });

        it('should throw when body is an array', () => {
            const apiResponse = { body: [] } as any;

            expect(() => validateBody(apiResponse, TEST_STORE_ID, 'response.body')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalled();
        });

        it('should throw when body is a number', () => {
            const apiResponse = { body: 42 } as any;

            expect(() => validateBody(apiResponse, TEST_STORE_ID, 'response.body')).toThrow();
        });

        it('should throw when body is null', () => {
            const apiResponse = { body: null } as any;

            expect(() => validateBody(apiResponse, TEST_STORE_ID, 'response.body')).toThrow();
        });

        it('should throw when settings contain invalid value', () => {
            const apiResponse = {
                body: { settings: { striped: 'not-boolean' } },
            } as any;

            expect(() => validateBody(apiResponse, TEST_STORE_ID, 'response.body')).toThrow();
            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'BodyValidator',
                'Invalid body structure in API response',
                'response.body',
                expect.any(Object),
                expect.any(String)
            );
        });

        it('should include configKey in thrown error message', () => {
            const apiResponse = { body: 'invalid' } as any;
            const key = 'response.body';

            expect(() => validateBody(apiResponse, TEST_STORE_ID, key)).toThrow(
                /Body validation failed/
            );
        });
    });

    // -------------------------------------------------------------------------
    // strip logic — body top-level
    // -------------------------------------------------------------------------
    describe('body top-level strip logic', () => {
        it('should strip unknown top-level body fields', () => {
            const apiResponse = {
                body: {
                    columnConfigs: null,
                    unknownField: 'should be stripped',
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result).not.toHaveProperty('unknownField');
        });
    });

    // -------------------------------------------------------------------------
    // error store interaction
    // -------------------------------------------------------------------------
    describe('error store interaction', () => {
        it('should call useErrorHandlerStore with correct errorStoreId', () => {
            const storeId = 'my-specific-store';
            const apiResponse = { body: 'bad' } as any;

            try {
                validateBody(apiResponse, storeId, 'response.body');
            } catch {
                // expected
            }

            expect(vi.mocked(useErrorHandlerStore)).toHaveBeenCalledWith(storeId);
        });

        it('should not call addSchemaValidationError for valid body', () => {
            const apiResponse = {
                body: {
                    columnConfigs: { id: { type: 'static', value: '#' } },
                },
            } as any;

            validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should add one warning per unknown type entry', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        a: { type: 'unknown-1' },
                        b: { type: 'unknown-2' },
                        c: { type: 'static', value: 'valid' },
                    },
                },
            } as any;

            validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(mockAddSchemaValidationError).toHaveBeenCalledTimes(2);
        });
    });

    // -------------------------------------------------------------------------
    // edge cases
    // -------------------------------------------------------------------------
    describe('edge cases', () => {
        it('should return empty columnConfigs object when all entries have failing types', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        a: { type: 'icon' }, // fails superRefine (no icon/class/conditional)
                        b: { type: 'badge' }, // unknown type
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs).toEqual({});
        });

        it('should return empty columnConfigs object when columnConfigs is {}', () => {
            const apiResponse = { body: { columnConfigs: {} } } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs).toEqual({});
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should skip failed static config entry (invalid value) without throwing', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        bad: { type: 'static' /* value missing */ },
                        good: { type: 'static', value: 'OK' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            // good should be present, bad should be skipped
            expect(result?.columnConfigs?.good).toMatchObject({ type: 'static', value: 'OK' });
            expect(result?.columnConfigs?.bad).toBeUndefined();
            expect(mockAddSchemaValidationError).toHaveBeenCalledTimes(1);
        });

        it('should not mutate the original apiResponse object', () => {
            const original = {
                body: {
                    columnConfigs: { id: { type: 'static', value: '#', extra: 'rm' } },
                },
            } as any;
            const originalBodyCopy = JSON.parse(JSON.stringify(original.body));

            validateBody(original, TEST_STORE_ID, 'response.body');

            expect(original.body).toEqual(originalBodyCopy);
        });
    });

    // -------------------------------------------------------------------------
    // modal type dispatch
    // -------------------------------------------------------------------------
    describe('modal type dispatch', () => {
        it('should dispatch modal type to validateModalConfig and include valid result', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        editModal: {
                            type: 'modal',
                            id: 'edit-modal',
                            icon: 'pencil',
                            variant: 'primary',
                        },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.editModal).toMatchObject({
                type: 'modal',
                id: 'edit-modal',
                icon: 'pencil',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should dispatch modal type with conditional config (if branches)', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        statusModal: {
                            type: 'modal',
                            key: 'status',
                            if: [{ eq: 'active', id: 'act-modal', icon: 'check' }],
                        },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.statusModal).toMatchObject({ type: 'modal' });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should skip invalid modal config entry and call addSchemaValidationError', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        badModal: { type: 'modal' }, // no id, no trigger, no conditional
                        goodStatic: { type: 'static', value: 'OK' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.badModal).toBeUndefined();
            expect(result?.columnConfigs?.goodStatic).toMatchObject({
                type: 'static',
                value: 'OK',
            });
            expect(mockAddSchemaValidationError).toHaveBeenCalledTimes(1);
        });

        it('should add error for modal with missing id (superRefine violation)', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        noIdModal: { type: 'modal', icon: 'pencil' },
                    },
                },
            } as any;

            validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                'ModalConfigValidator',
                'Invalid modal column config',
                'response.body.columnConfigs.noIdModal',
                expect.any(Object),
                expect.any(String)
            );
        });

        it('should call addSchemaValidationError with BodyValidator for truly unknown type', () => {
            const apiResponse = {
                body: {
                    columnConfigs: { col: { type: 'unknown-widget' } },
                },
            } as any;

            validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            const callArgs = mockAddSchemaValidationError.mock.calls[0]!;
            expect(callArgs[0]).toBe('BodyValidator');
            expect(callArgs[1]).toContain('Unknown columnConfig type');
        });
    });

    describe('link type dispatch', () => {
        it('should dispatch link type to validateLinkConfig and include valid result', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        nameLink: {
                            type: 'link',
                            field: 'name',
                            key: 'id',
                            route: '/users/{id}',
                        },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.nameLink).toMatchObject({
                type: 'link',
                field: 'name',
                key: 'id',
                route: '/users/{id}',
            });
            expect(mockAddSchemaValidationError).not.toHaveBeenCalled();
        });

        it('should skip invalid link config entry and call addSchemaValidationError', () => {
            const apiResponse = {
                body: {
                    columnConfigs: {
                        badLink: { type: 'link' }, // no field, value, route or conditional
                        goodStatic: { type: 'static', value: 'OK' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.badLink).toBeUndefined();
            expect(result?.columnConfigs?.goodStatic).toMatchObject({ type: 'static' });
            expect(mockAddSchemaValidationError).toHaveBeenCalledTimes(1);
        });
    });

    // -------------------------------------------------------------------------
    // prototype-chain names in the type-dispatch (audit 2026-08-19 K1)
    // -------------------------------------------------------------------------
    describe('prototype-chain columnConfig types', () => {
        it.each(['constructor', '__proto__', 'toString', 'valueOf'])(
            'should treat the inherited name %s as an unknown type',
            type => {
                const apiResponse = {
                    body: { columnConfigs: { col: { type, value: 'payload' } } },
                } as any;

                const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

                expect(result?.columnConfigs?.col).toBeUndefined();
                expect(mockAddSchemaValidationError).toHaveBeenCalledWith(
                    'BodyValidator',
                    'Unknown columnConfig type, skipping entry',
                    'response.body.columnConfigs.col',
                    expect.any(Object),
                    expect.stringContaining(type)
                );
            }
        );

        it('should not hand an unvalidated config back for type: constructor', () => {
            // A raw `CONFIG_VALIDATORS[configType]` lookup answers 'constructor' with the
            // `Object` constructor: callable, so it passes the `if (validator)` check, and
            // `Object(config, …)` returns `config` itself — the entry would land in the
            // result with none of its unknown keys stripped.
            const apiResponse = {
                body: {
                    columnConfigs: {
                        col: { type: 'constructor', onclick: 'alert(1)' },
                    },
                },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');

            expect(result?.columnConfigs?.col).toBeUndefined();
            expect(Object.keys(result?.columnConfigs ?? {})).toEqual([]);
        });

        it('should return columnConfigs with no prototype to inherit from', () => {
            const apiResponse = {
                body: { columnConfigs: { col: { type: 'static', value: 'OK' } } },
            } as any;

            const result = validateBody(apiResponse, TEST_STORE_ID, 'response.body');
            const configs = result?.columnConfigs as Record<string, unknown>;

            expect(configs.col).toMatchObject({ type: 'static', value: 'OK' });
            expect(Object.getPrototypeOf(configs)).toBeNull();
        });
    });
});
