import { describe, it, expect } from 'vitest';
import { preprocessIconFields } from '../preprocessIconFields';
import type { Header, Body } from '../../../types/api-response.types';

const icons = {
    primary: ['fas', 'fa-file'],
    switchUser: ['fas', 'fa-user-secret'],
    destroy: ['fas', 'fa-trash'],
};
const variants = {
    primary: 'secondary',
    switchUser: 'danger',
};

function makeHeader(fields: string[]): Header {
    return {
        rows: [
            {
                cells: fields.map(f => ({ content: f, key: f, field: f })),
            },
        ],
    };
}

describe('preprocessIconFields', () => {
    describe('auto-generation', () => {
        it('should generate a columnConfig for a _icon suffixed field not in items', () => {
            const header = makeHeader(['switch_user_icon']);
            const result = preprocessIconFields(header, null, [], icons, variants);

            expect(result).not.toBeNull();
            expect(result?.columnConfigs?.['switch_user_icon']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-user-secret', 'text-danger'],
                alt: 'Switch User',
                title: 'Switch User',
            });
        });

        it('should use primary fallback for unknown icon key', () => {
            const header = makeHeader(['random_icon']);
            const result = preprocessIconFields(header, null, [], icons, variants);

            expect(result?.columnConfigs?.['random_icon']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-file', 'text-secondary'],
                alt: 'Random',
                title: 'Random',
            });
        });

        it('should handle icons/variants undefined (no registry)', () => {
            const header = makeHeader(['switch_user_icon']);
            const result = preprocessIconFields(header, null, [], undefined, undefined);

            expect(result?.columnConfigs?.['switch_user_icon']).toEqual({
                type: 'icon',
                class: [],
                alt: 'Switch User',
                title: 'Switch User',
            });
        });
    });

    describe('skip conditions', () => {
        it('should skip field that is present in items[0]', () => {
            const header = makeHeader(['status_icon']);
            const items = [{ status_icon: 'active' }];
            const result = preprocessIconFields(header, null, items, icons, variants);

            expect(result).toBeNull();
        });

        it('should skip field that already exists in columnConfigs', () => {
            const header = makeHeader(['destroy_icon']);
            const body: Body = {
                columnConfigs: {
                    destroy_icon: { type: 'icon', class: ['fas', 'fa-trash'] },
                },
            };
            const result = preprocessIconFields(header, body, [], icons, variants);

            // body returned unchanged — same reference
            expect(result).toBe(body);
        });

        it('should skip field that does not end with _icon', () => {
            const header = makeHeader(['name', 'email']);
            const result = preprocessIconFields(header, null, [], icons, variants);

            expect(result).toBeNull();
        });
    });

    describe('body creation', () => {
        it('should create body from null when _icon field is found', () => {
            const header = makeHeader(['switch_user_icon']);
            const result = preprocessIconFields(header, null, [], icons, variants);

            expect(result).not.toBeNull();
            expect(result?.columnConfigs).toBeDefined();
        });

        it('should create columnConfigs when body has no columnConfigs', () => {
            const header = makeHeader(['switch_user_icon']);
            const body: Body = { settings: { striped: true } };
            const result = preprocessIconFields(header, body, [], icons, variants);

            expect(result?.columnConfigs?.['switch_user_icon']).toBeDefined();
            expect(result?.settings).toEqual({ striped: true });
        });

        it('should preserve existing columnConfigs entries', () => {
            const header = makeHeader(['switch_user_icon', 'destroy_icon']);
            const body: Body = {
                columnConfigs: {
                    destroy_icon: { type: 'icon', class: ['fas', 'fa-trash'] },
                },
            };
            // destroy_icon already exists → only switch_user_icon auto-generated
            const result = preprocessIconFields(header, body, [], icons, variants);

            expect(result?.columnConfigs?.['destroy_icon']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-trash'],
            });
            expect(result?.columnConfigs?.['switch_user_icon']).toBeDefined();
        });
    });

    describe('fields array support', () => {
        it('should detect _icon field from fields[] array in header cell', () => {
            const header: Header = {
                rows: [
                    {
                        cells: [
                            {
                                content: 'Actions',
                                key: 'actions',
                                fields: ['edit_icon', 'delete_icon'],
                            },
                        ],
                    },
                ],
            };
            const result = preprocessIconFields(header, null, [], icons, variants);

            expect(result?.columnConfigs?.['edit_icon']).toBeDefined();
            expect(result?.columnConfigs?.['delete_icon']).toBeDefined();
        });

        it('should not auto-generate if fields[] entry is in items[0]', () => {
            const header: Header = {
                rows: [
                    {
                        cells: [{ content: 'Icon', key: 'x', fields: ['status_icon'] }],
                    },
                ],
            };
            const items = [{ status_icon: 'active' }];
            const result = preprocessIconFields(header, null, items, icons, variants);

            expect(result?.columnConfigs?.['status_icon']).toBeUndefined();
        });
    });

    describe('immutability', () => {
        it('should not mutate the original body object', () => {
            const header = makeHeader(['switch_user_icon']);
            const body: Body = { columnConfigs: {} };
            const originalConfigs = body.columnConfigs;
            preprocessIconFields(header, body, [], icons, variants);

            expect(body.columnConfigs).toBe(originalConfigs);
            expect(body.columnConfigs?.['switch_user_icon']).toBeUndefined();
        });
    });

    describe('built-in action route automatism', () => {
        const base = 'admin/users';
        const actionIcons = {
            primary: ['fas', 'fa-file'],
            create: ['fas', 'fa-plus'],
            edit: ['fas', 'fa-pen'],
            show: ['fas', 'fa-eye'],
            destroy: ['fas', 'fa-trash'],
        };
        const actionVariants = { primary: 'secondary', destroy: 'danger' };

        /** Single-cell header with key 'id' (realistic _icon action cell). */
        function actionHeader(field: string): Header {
            return { rows: [{ cells: [{ content: field, key: 'id', field }] }] };
        }

        it('should generate create_icon → {base}/create (key attached for render gate)', () => {
            const result = preprocessIconFields(
                actionHeader('create_icon'),
                null,
                [],
                actionIcons,
                actionVariants,
                base
            );
            expect(result?.columnConfigs?.['create_icon']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-plus', 'text-secondary'],
                alt: 'Create',
                title: 'Create',
                key: 'id',
                route: 'admin/users/create',
            });
        });

        it('should generate edit_icon → {base}/{id}/edit', () => {
            const result = preprocessIconFields(
                actionHeader('edit_icon'),
                null,
                [],
                actionIcons,
                actionVariants,
                base
            );
            expect(result?.columnConfigs?.['edit_icon']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-pen', 'text-secondary'],
                alt: 'Edit',
                title: 'Edit',
                key: 'id',
                route: 'admin/users/{id}/edit',
            });
        });

        it('should generate show_icon → {base}/{id}', () => {
            const result = preprocessIconFields(
                actionHeader('show_icon'),
                null,
                [],
                actionIcons,
                actionVariants,
                base
            );
            expect(result?.columnConfigs?.['show_icon']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-eye', 'text-secondary'],
                alt: 'Show',
                title: 'Show',
                key: 'id',
                route: 'admin/users/{id}',
            });
        });

        it('should generate destroy_icon → modal trigger with icon content', () => {
            const result = preprocessIconFields(
                actionHeader('destroy_icon'),
                null,
                [],
                actionIcons,
                actionVariants,
                base
            );
            expect(result?.columnConfigs?.['destroy_icon']).toEqual({
                type: 'modal',
                id: 'destroyModal',
                key: 'id',
                route: 'admin/users/{id}/destroy',
                content: {
                    type: 'icon',
                    class: ['fas', 'fa-trash', 'text-danger'],
                    alt: 'Destroy',
                    title: 'Destroy',
                },
            });
        });

        it('should honor a custom cell key in the route', () => {
            const header: Header = {
                rows: [{ cells: [{ content: 'Edit', field: 'edit_icon', key: 'slug' }] }],
            };
            const result = preprocessIconFields(
                header,
                null,
                [],
                actionIcons,
                actionVariants,
                base
            );
            const config = result?.columnConfigs?.['edit_icon'] as { route: string; key: string };
            expect(config.route).toBe('admin/users/{slug}/edit');
            expect(config.key).toBe('slug');
        });

        it('should trim leading/trailing slashes from urlParameter', () => {
            const result = preprocessIconFields(
                actionHeader('show_icon'),
                null,
                [],
                actionIcons,
                actionVariants,
                '/shop/'
            );
            const config = result?.columnConfigs?.['show_icon'] as { route: string };
            expect(config.route).toBe('shop/{id}');
        });

        it('should keep a generic prefix route-less (status indicator)', () => {
            const result = preprocessIconFields(
                actionHeader('status_icon'),
                null,
                [],
                actionIcons,
                actionVariants,
                base
            );
            expect(result?.columnConfigs?.['status_icon']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-file', 'text-secondary'],
                alt: 'Status',
                title: 'Status',
            });
        });
    });
});
