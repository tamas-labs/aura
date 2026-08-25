import { describe, it, expect } from 'vitest';
import { preprocessButtonFields } from '../preprocessButtonFields';
import type { Header, Body, ColumnConfig } from '../../../types/api-response.types';

/** Builds a single-row header from cell descriptors. */
function makeHeader(cells: Record<string, unknown>[]): Header {
    return { rows: [{ cells: cells as never }] };
}

/** Shortcut: header from plain field names. For _button cells the URL key is 'id'. */
function fieldsHeader(fields: string[]): Header {
    return makeHeader(fields.map(f => ({ content: f, key: 'id', field: f })));
}

/** Reads a generated columnConfig. */
function cfg(body: Body | null, key: string): ColumnConfig {
    return body?.columnConfigs?.[key] as ColumnConfig;
}

const BASE = 'admin/users';
const VARIANTS = {
    primary: 'primary',
    edit: 'primary',
    show: 'info',
    destroy: 'danger',
    switchUser: 'warning',
};

describe('preprocessButtonFields', () => {
    describe('built-in action prefixes', () => {
        it('should generate create_button → {base}/create (no key)', () => {
            const result = preprocessButtonFields(
                fieldsHeader(['create_button']),
                null,
                VARIANTS,
                BASE
            );
            expect(cfg(result, 'create_button')).toEqual({
                type: 'button',
                value: 'create',
                variant: 'primary',
                route: 'admin/users/create',
            });
        });

        it('should generate edit_button → {base}/{id}/edit', () => {
            const result = preprocessButtonFields(
                fieldsHeader(['edit_button']),
                null,
                VARIANTS,
                BASE
            );
            expect(cfg(result, 'edit_button')).toEqual({
                type: 'button',
                value: 'edit',
                variant: 'primary',
                key: 'id',
                route: 'admin/users/{id}/edit',
            });
        });

        it('should generate show_button → {base}/{id} with info variant', () => {
            const result = preprocessButtonFields(
                fieldsHeader(['show_button']),
                null,
                VARIANTS,
                BASE
            );
            expect(cfg(result, 'show_button')).toEqual({
                type: 'button',
                value: 'show',
                variant: 'info',
                key: 'id',
                route: 'admin/users/{id}',
            });
        });

        it('should generate destroy_button → modal trigger with a button content', () => {
            const result = preprocessButtonFields(
                fieldsHeader(['destroy_button']),
                null,
                VARIANTS,
                BASE
            );
            expect(cfg(result, 'destroy_button')).toEqual({
                type: 'modal',
                id: 'destroyModal',
                key: 'id',
                route: 'admin/users/{id}/destroy',
                content: { type: 'button', value: 'destroy', variant: 'danger' },
            });
        });
    });

    describe('variant resolution', () => {
        it('should resolve variant from the registry by prefix (camelCase)', () => {
            const header = fieldsHeader(['switch_user_button']);
            const result = preprocessButtonFields(header, null, VARIANTS, BASE);
            // switch_user → switchUser → 'warning'
            expect((cfg(result, 'switch_user_button') as { variant: string }).variant).toBe(
                'warning'
            );
        });

        it('should fall back to variants.primary when the prefix has no registry entry', () => {
            const result = preprocessButtonFields(
                fieldsHeader(['create_button']),
                null,
                VARIANTS,
                BASE
            );
            expect((cfg(result, 'create_button') as { variant: string }).variant).toBe('primary');
        });

        it('should fall back to literal "primary" when the registry is absent', () => {
            const result = preprocessButtonFields(
                fieldsHeader(['create_button']),
                null,
                undefined,
                BASE
            );
            expect((cfg(result, 'create_button') as { variant: string }).variant).toBe('primary');
        });
    });

    describe('key handling', () => {
        it('should honor a custom cell key in the URL placeholder', () => {
            const header = makeHeader([{ content: 'Edit', field: 'edit_button', key: 'slug' }]);
            const result = preprocessButtonFields(header, null, VARIANTS, BASE);
            expect(cfg(result, 'edit_button')).toEqual({
                type: 'button',
                value: 'edit',
                variant: 'primary',
                key: 'slug',
                route: 'admin/users/{slug}/edit',
            });
        });

        it('should default the key to id when the cell key is empty', () => {
            const header = makeHeader([{ content: 'Edit', field: 'edit_button', key: '' }]);
            const result = preprocessButtonFields(header, null, VARIANTS, BASE);
            expect((cfg(result, 'edit_button') as { key: string }).key).toBe('id');
        });
    });

    describe('header-column prefix (field button)', () => {
        it('should use field display when a matching header column exists', () => {
            // header has a 'name' column AND a 'name_button' column
            const header = fieldsHeader(['name', 'name_button']);
            const result = preprocessButtonFields(header, null, VARIANTS, BASE);
            expect(cfg(result, 'name_button')).toEqual({
                type: 'button',
                variant: 'primary',
                key: 'id',
                route: 'admin/users/{id}/name',
                field: 'name',
            });
        });

        it('should append the prefix to the route and honor the cell key', () => {
            const header = makeHeader([
                { content: 'Name', field: 'name', key: 'name' },
                { content: 'Name', field: 'name_button', key: 'slug' },
            ]);
            const result = preprocessButtonFields(header, null, VARIANTS, BASE);
            expect(cfg(result, 'name_button')).toEqual({
                type: 'button',
                variant: 'primary',
                key: 'slug',
                route: 'admin/users/{slug}/name',
                field: 'name',
            });
        });
    });

    describe('static-label prefix (no matching column)', () => {
        it('should write the literal prefix as static text, still linked', () => {
            const result = preprocessButtonFields(
                fieldsHeader(['name_button']),
                null,
                VARIANTS,
                BASE
            );
            expect(cfg(result, 'name_button')).toEqual({
                type: 'button',
                variant: 'primary',
                key: 'id',
                route: 'admin/users/{id}/name',
                value: 'name',
            });
        });
    });

    describe('base normalisation', () => {
        it('should trim leading and trailing slashes from urlParameter', () => {
            const result = preprocessButtonFields(
                fieldsHeader(['create_button']),
                null,
                VARIANTS,
                '/shop/'
            );
            expect((cfg(result, 'create_button') as { route: string }).route).toBe('shop/create');
        });

        it('should handle empty/undefined urlParameter', () => {
            const result = preprocessButtonFields(
                fieldsHeader(['create_button']),
                null,
                VARIANTS,
                undefined
            );
            expect((cfg(result, 'create_button') as { route: string }).route).toBe('/create');
        });
    });

    describe('skip conditions', () => {
        it('should not override an existing columnConfig', () => {
            const body: Body = {
                columnConfigs: {
                    edit_button: { type: 'button', value: 'Custom', route: '/custom' },
                },
            };
            const result = preprocessButtonFields(
                fieldsHeader(['edit_button']),
                body,
                VARIANTS,
                BASE
            );
            expect(cfg(result, 'edit_button')).toEqual({
                type: 'button',
                value: 'Custom',
                route: '/custom',
            });
        });

        it('should ignore non-_button fields', () => {
            const result = preprocessButtonFields(
                fieldsHeader(['name', 'edit_link']),
                null,
                VARIANTS,
                BASE
            );
            expect(result).toBeNull();
        });

        it('should return the original body unchanged when no _button fields exist', () => {
            const body: Body = { columnConfigs: { x: { type: 'static', value: 'Y' } } };
            const result = preprocessButtonFields(fieldsHeader(['name']), body, VARIANTS, BASE);
            expect(result).toBe(body);
        });
    });

    describe('fields[] array support', () => {
        it('should process _button fields declared in a cell fields[] array', () => {
            const header = makeHeader([
                { content: 'Actions', key: 'actions', fields: ['edit_button', 'show_button'] },
            ]);
            const result = preprocessButtonFields(header, null, VARIANTS, BASE);
            expect(cfg(result, 'edit_button')).toBeDefined();
            expect(cfg(result, 'show_button')).toBeDefined();
        });
    });

    describe('immutability', () => {
        it('should not mutate the input body', () => {
            const body: Body = { columnConfigs: { x: { type: 'static', value: 'Y' } } };
            preprocessButtonFields(fieldsHeader(['create_button']), body, VARIANTS, BASE);
            expect(body.columnConfigs).toEqual({ x: { type: 'static', value: 'Y' } });
        });

        it('should preserve existing configs alongside generated ones', () => {
            const body: Body = { columnConfigs: { x: { type: 'static', value: 'Y' } } };
            const result = preprocessButtonFields(
                fieldsHeader(['create_button']),
                body,
                VARIANTS,
                BASE
            );
            expect(result?.columnConfigs?.['x']).toEqual({ type: 'static', value: 'Y' });
            expect(cfg(result, 'create_button')).toBeDefined();
        });
    });
    describe('prototype-chain prefixes', () => {
        // Regression guard: the variant key is `camelCase(prefix)` and the prefix comes from
        // a response header field name, so `variants['constructor']` used to hand back the
        // `Object` function and put it into the generated config's `variant`.
        const PROTO_PREFIXES = ['constructor', 'toString', 'valueOf', 'hasOwnProperty'];

        it.each(PROTO_PREFIXES)('should fall back to the registry default for "%s"', prefix => {
            const result = preprocessButtonFields(
                fieldsHeader([`${prefix}_button`]),
                null,
                VARIANTS,
                BASE
            );

            expect((cfg(result, `${prefix}_button`) as { variant: string }).variant).toBe(
                'primary'
            );
        });

        it('should use the literal fallback when the registry has no primary entry', () => {
            const result = preprocessButtonFields(
                fieldsHeader(['constructor_button']),
                null,
                { edit: 'danger' },
                BASE
            );

            expect((cfg(result, 'constructor_button') as { variant: string }).variant).toBe(
                'primary'
            );
        });
    });
});
