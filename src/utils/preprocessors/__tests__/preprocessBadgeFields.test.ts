import { describe, it, expect } from 'vitest';
import { preprocessBadgeFields } from '../preprocessBadgeFields';
import type { Header, Body, ColumnConfig } from '../../../types/api-response.types';

/** Builds a single-row header from cell descriptors. */
function makeHeader(cells: Record<string, unknown>[]): Header {
    return { rows: [{ cells: cells as never }] };
}

/** Shortcut: header from plain field names. */
function fieldsHeader(fields: string[]): Header {
    return makeHeader(fields.map(f => ({ content: f, field: f })));
}

/** Reads a generated columnConfig. */
function cfg(body: Body | null, key: string): ColumnConfig {
    return body?.columnConfigs?.[key] as ColumnConfig;
}

const VARIANTS = {
    primary: 'primary',
    secondary: 'secondary',
    status: 'info',
    userRole: 'warning',
};

describe('preprocessBadgeFields', () => {
    describe('field resolution', () => {
        it('should read the suffixed field itself when no matching prefix column exists', () => {
            const result = preprocessBadgeFields(fieldsHeader(['status_badge']), null, VARIANTS);
            expect(cfg(result, 'status_badge')).toEqual({
                type: 'badge',
                field: 'status_badge',
                variant: 'info',
            });
        });

        it('should read the prefix column when a matching header column exists', () => {
            // header has both a 'role' column and a 'role_badge' column
            const result = preprocessBadgeFields(
                fieldsHeader(['role', 'role_badge']),
                null,
                VARIANTS
            );
            expect(cfg(result, 'role_badge')).toEqual({
                type: 'badge',
                field: 'role',
                variant: 'secondary',
            });
        });
    });

    describe('variant resolution', () => {
        it('should resolve variant from the registry by prefix', () => {
            const result = preprocessBadgeFields(fieldsHeader(['status_badge']), null, VARIANTS);
            // status → 'info'
            expect((cfg(result, 'status_badge') as { variant: string }).variant).toBe('info');
        });

        it('should resolve variant from the registry by camelCased prefix', () => {
            const result = preprocessBadgeFields(fieldsHeader(['user_role_badge']), null, VARIANTS);
            // user_role → userRole → 'warning'
            expect((cfg(result, 'user_role_badge') as { variant: string }).variant).toBe('warning');
        });

        it('should fall back to variants.secondary when the prefix has no registry entry', () => {
            const result = preprocessBadgeFields(fieldsHeader(['foo_badge']), null, VARIANTS);
            expect((cfg(result, 'foo_badge') as { variant: string }).variant).toBe('secondary');
        });

        it('should fall back to literal "secondary" when the registry is absent', () => {
            const result = preprocessBadgeFields(fieldsHeader(['foo_badge']), null, undefined);
            expect((cfg(result, 'foo_badge') as { variant: string }).variant).toBe('secondary');
        });
    });

    describe('skip conditions', () => {
        it('should not override an existing columnConfig', () => {
            const body: Body = {
                columnConfigs: {
                    status_badge: { type: 'badge', value: 'Custom', variant: 'danger' },
                },
            };
            const result = preprocessBadgeFields(fieldsHeader(['status_badge']), body, VARIANTS);
            expect(cfg(result, 'status_badge')).toEqual({
                type: 'badge',
                value: 'Custom',
                variant: 'danger',
            });
        });

        it('should ignore non-_badge fields', () => {
            const result = preprocessBadgeFields(
                fieldsHeader(['name', 'edit_button']),
                null,
                VARIANTS
            );
            expect(result).toBeNull();
        });

        it('should return the original body unchanged when no _badge fields exist', () => {
            const body: Body = { columnConfigs: { x: { type: 'static', value: 'Y' } } };
            const result = preprocessBadgeFields(fieldsHeader(['name']), body, VARIANTS);
            expect(result).toBe(body);
        });
    });

    describe('fields[] array support', () => {
        it('should process _badge fields declared in a cell fields[] array', () => {
            const header = makeHeader([
                { content: 'Meta', fields: ['status_badge', 'role_badge'] },
            ]);
            const result = preprocessBadgeFields(header, null, VARIANTS);
            expect(cfg(result, 'status_badge')).toBeDefined();
            expect(cfg(result, 'role_badge')).toBeDefined();
        });
    });

    describe('immutability', () => {
        it('should not mutate the input body', () => {
            const body: Body = { columnConfigs: { x: { type: 'static', value: 'Y' } } };
            preprocessBadgeFields(fieldsHeader(['status_badge']), body, VARIANTS);
            expect(body.columnConfigs).toEqual({ x: { type: 'static', value: 'Y' } });
        });

        it('should preserve existing configs alongside generated ones', () => {
            const body: Body = { columnConfigs: { x: { type: 'static', value: 'Y' } } };
            const result = preprocessBadgeFields(fieldsHeader(['status_badge']), body, VARIANTS);
            expect(result?.columnConfigs?.['x']).toEqual({ type: 'static', value: 'Y' });
            expect(cfg(result, 'status_badge')).toBeDefined();
        });
    });
    describe('prototype-chain prefixes', () => {
        // Regression guard: the variant key is `camelCase(prefix)` and the prefix comes from
        // a response header field name, so `variants['constructor']` used to hand back the
        // `Object` function and put it into the generated config's `variant`.
        const PROTO_PREFIXES = ['constructor', 'toString', 'valueOf', 'hasOwnProperty'];

        it.each(PROTO_PREFIXES)('should fall back to the registry default for "%s"', prefix => {
            const result = preprocessBadgeFields(fieldsHeader([`${prefix}_badge`]), null, VARIANTS);

            expect(cfg(result, `${prefix}_badge`)).toEqual({
                type: 'badge',
                field: `${prefix}_badge`,
                variant: 'secondary',
            });
        });

        it('should use the literal fallback when the registry has no secondary entry', () => {
            const result = preprocessBadgeFields(fieldsHeader(['constructor_badge']), null, {
                status: 'info',
            });

            expect((cfg(result, 'constructor_badge') as { variant: string }).variant).toBe(
                'secondary'
            );
        });
    });
});
