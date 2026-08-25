import { describe, it, expect } from 'vitest';
import { preprocessLinkFields } from '../preprocessLinkFields';
import type { Header, Body, ColumnConfig } from '../../../types/api-response.types';

/** Builds a single-row header from cell descriptors. */
function makeHeader(cells: Record<string, unknown>[]): Header {
    return { rows: [{ cells: cells as never }] };
}

/** Shortcut: header from plain field names. For _link cells the URL key is 'id'. */
function fieldsHeader(fields: string[]): Header {
    return makeHeader(fields.map(f => ({ content: f, key: 'id', field: f })));
}

/** Reads a generated columnConfig. */
function cfg(body: Body | null, key: string): ColumnConfig {
    return body?.columnConfigs?.[key] as ColumnConfig;
}

const BASE = 'admin/users';

describe('preprocessLinkFields', () => {
    describe('built-in action prefixes', () => {
        it('should generate create_link → {base}/create (no key)', () => {
            const result = preprocessLinkFields(fieldsHeader(['create_link']), null, BASE);
            expect(cfg(result, 'create_link')).toEqual({
                type: 'link',
                value: 'create',
                route: 'admin/users/create',
            });
        });

        it('should generate edit_link → {base}/{id}/edit', () => {
            const result = preprocessLinkFields(fieldsHeader(['edit_link']), null, BASE);
            expect(cfg(result, 'edit_link')).toEqual({
                type: 'link',
                value: 'edit',
                key: 'id',
                route: 'admin/users/{id}/edit',
            });
        });

        it('should generate show_link → {base}/{id}', () => {
            const result = preprocessLinkFields(fieldsHeader(['show_link']), null, BASE);
            expect(cfg(result, 'show_link')).toEqual({
                type: 'link',
                value: 'show',
                key: 'id',
                route: 'admin/users/{id}',
            });
        });

        it('should generate destroy_link → modal trigger for DestroyModal', () => {
            const result = preprocessLinkFields(fieldsHeader(['destroy_link']), null, BASE);
            expect(cfg(result, 'destroy_link')).toEqual({
                type: 'modal',
                id: 'destroyModal',
                key: 'id',
                route: 'admin/users/{id}/destroy',
                content: { type: 'link', value: 'destroy' },
            });
        });
    });

    describe('key handling', () => {
        it('should honor a custom cell key in the URL placeholder', () => {
            const header = makeHeader([{ content: 'Edit', field: 'edit_link', key: 'slug' }]);
            const result = preprocessLinkFields(header, null, BASE);
            expect(cfg(result, 'edit_link')).toEqual({
                type: 'link',
                value: 'edit',
                key: 'slug',
                route: 'admin/users/{slug}/edit',
            });
        });

        it('should default the key to id when the cell key is empty', () => {
            const header = makeHeader([{ content: 'Edit', field: 'edit_link', key: '' }]);
            const result = preprocessLinkFields(header, null, BASE);
            expect((cfg(result, 'edit_link') as { key: string }).key).toBe('id');
        });
    });

    describe('header-column prefix (field link)', () => {
        it('should use field display when a matching header column exists', () => {
            // header has a 'name' column AND a 'name_link' column
            const header = fieldsHeader(['name', 'name_link']);
            const result = preprocessLinkFields(header, null, BASE);
            expect(cfg(result, 'name_link')).toEqual({
                type: 'link',
                field: 'name',
                key: 'id',
                route: 'admin/users/{id}/name',
            });
        });

        it('should append the prefix to the route and honor the cell key', () => {
            const header = makeHeader([
                { content: 'Name', field: 'name', key: 'name' },
                { content: 'Name', field: 'name_link', key: 'slug' },
            ]);
            const result = preprocessLinkFields(header, null, BASE);
            expect(cfg(result, 'name_link')).toEqual({
                type: 'link',
                field: 'name',
                key: 'slug',
                route: 'admin/users/{slug}/name',
            });
        });
    });

    describe('static-label prefix (no matching column)', () => {
        it('should write the literal prefix as static text, still linked', () => {
            const result = preprocessLinkFields(fieldsHeader(['name_link']), null, BASE);
            expect(cfg(result, 'name_link')).toEqual({
                type: 'link',
                value: 'name',
                key: 'id',
                route: 'admin/users/{id}/name',
            });
        });
    });

    describe('base normalisation', () => {
        it('should trim leading and trailing slashes from urlParameter', () => {
            const result = preprocessLinkFields(fieldsHeader(['create_link']), null, '/shop/');
            expect((cfg(result, 'create_link') as { route: string }).route).toBe('shop/create');
        });

        it('should handle empty/undefined urlParameter', () => {
            const result = preprocessLinkFields(fieldsHeader(['create_link']), null, undefined);
            expect((cfg(result, 'create_link') as { route: string }).route).toBe('/create');
        });
    });

    describe('skip conditions', () => {
        it('should not override an existing columnConfig', () => {
            const body: Body = {
                columnConfigs: { edit_link: { type: 'link', value: 'Custom', route: '/custom' } },
            };
            const result = preprocessLinkFields(fieldsHeader(['edit_link']), body, BASE);
            expect(cfg(result, 'edit_link')).toEqual({
                type: 'link',
                value: 'Custom',
                route: '/custom',
            });
        });

        it('should ignore non-_link fields', () => {
            const result = preprocessLinkFields(fieldsHeader(['name', 'status_icon']), null, BASE);
            expect(result).toBeNull();
        });

        it('should return the original body unchanged when no _link fields exist', () => {
            const body: Body = { columnConfigs: { x: { type: 'static', value: 'Y' } } };
            const result = preprocessLinkFields(fieldsHeader(['name']), body, BASE);
            expect(result).toBe(body);
        });
    });

    describe('fields[] array support', () => {
        it('should process _link fields declared in a cell fields[] array', () => {
            const header = makeHeader([
                { content: 'Actions', key: 'actions', fields: ['edit_link', 'show_link'] },
            ]);
            const result = preprocessLinkFields(header, null, BASE);
            expect(cfg(result, 'edit_link')).toBeDefined();
            expect(cfg(result, 'show_link')).toBeDefined();
        });
    });

    describe('immutability', () => {
        it('should not mutate the input body', () => {
            const body: Body = { columnConfigs: { x: { type: 'static', value: 'Y' } } };
            preprocessLinkFields(fieldsHeader(['create_link']), body, BASE);
            expect(body.columnConfigs).toEqual({ x: { type: 'static', value: 'Y' } });
        });

        it('should preserve existing configs alongside generated ones', () => {
            const body: Body = { columnConfigs: { x: { type: 'static', value: 'Y' } } };
            const result = preprocessLinkFields(fieldsHeader(['create_link']), body, BASE);
            expect(result?.columnConfigs?.['x']).toEqual({ type: 'static', value: 'Y' });
            expect(cfg(result, 'create_link')).toBeDefined();
        });
    });
});
