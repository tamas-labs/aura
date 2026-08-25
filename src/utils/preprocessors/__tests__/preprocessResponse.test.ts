import { describe, it, expect } from 'vitest';
import { preprocessResponse } from '../preprocessResponse';
import type { Header, Body } from '../../../types/api-response.types';

const icons = {
    primary: ['fas', 'fa-file'],
    show: ['fas', 'fa-eye'],
    destroy: ['fas', 'fa-trash'],
    switchUser: ['fas', 'fa-user-secret'],
};
const variants = {
    primary: 'secondary',
    info: 'info',
    danger: 'danger',
    switchUser: 'warning',
};

describe('preprocessResponse', () => {
    describe('icons.4.json scenario — _icon suffixed field auto-generation', () => {
        it('should auto-generate columnConfig for switch_user_icon not in items', () => {
            const header: Header = {
                rows: [
                    {
                        cells: [
                            { content: 'Name', key: 'name', field: 'name' },
                            {
                                content: 'Switch User',
                                key: 'switch_user_icon',
                                field: 'switch_user_icon',
                            },
                        ],
                    },
                ],
            };
            const items = [{ name: 'Alice' }]; // switch_user_icon NOT in items

            const result = preprocessResponse(header, null, items, icons, variants);

            expect(result).not.toBeNull();
            expect(result?.columnConfigs?.['switch_user_icon']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-user-secret', 'text-warning'],
                alt: 'Switch User',
                title: 'Switch User',
            });
        });
    });

    describe('icons.3.json scenario — normalize existing icon/variant configs', () => {
        it('should normalize icon+variant in existing columnConfig', () => {
            const header: Header = {
                rows: [{ cells: [{ content: 'Show', key: 'show', field: 'id' }] }],
            };
            const body: Body = {
                columnConfigs: {
                    show: {
                        type: 'icon',
                        icon: 'show',
                        variant: 'info',
                        alt: 'Show',
                        title: 'Show',
                        key: 'id',
                        route: '/users/{id}',
                    },
                },
            };
            const items = [{ id: 1 }];

            const result = preprocessResponse(header, body, items, icons, variants);
            const config = result?.columnConfigs?.['show'] as unknown as Record<string, unknown>;

            expect(config.class).toEqual(['fas', 'fa-eye', 'text-info']);
            expect(config.alt).toBe('Show');
            expect(config.key).toBe('id');
            expect(config.route).toBe('/users/{id}');
            expect(config.icon).toBeUndefined();
            expect(config.variant).toBeUndefined();
        });
    });

    describe('icons.1.json scenario — class-only config stays unchanged', () => {
        it('should not modify a class-only icon config', () => {
            const header: Header = {
                rows: [{ cells: [{ content: 'Destroy', key: 'destroy', field: 'id' }] }],
            };
            const body: Body = {
                columnConfigs: {
                    destroy: {
                        type: 'icon',
                        class: ['fa-regular', 'fa-trash-can', 'text-danger'],
                        alt: 'Destroy',
                        title: 'Destroy',
                    },
                },
            };
            const items = [{ id: 1 }];

            const result = preprocessResponse(header, body, items, icons, variants);

            // Same body reference because nothing was modified
            expect(result).toBe(body);
        });
    });

    describe('combined scenario — auto-gen + normalization in one pass', () => {
        it('should auto-generate _icon field AND normalize existing icon config', () => {
            const header: Header = {
                rows: [
                    {
                        cells: [
                            { content: 'Show', key: 'show', field: 'id' },
                            {
                                content: 'Switch',
                                key: 'switch_user_icon',
                                field: 'switch_user_icon',
                            },
                        ],
                    },
                ],
            };
            const body: Body = {
                columnConfigs: {
                    show: { type: 'icon', icon: 'show', variant: 'info' },
                },
            };
            const items = [{ id: 1 }]; // switch_user_icon NOT in items

            const result = preprocessResponse(header, body, items, icons, variants);

            // Auto-generated config
            expect(result?.columnConfigs?.['switch_user_icon']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-user-secret', 'text-warning'],
                alt: 'Switch User',
                title: 'Switch User',
            });

            // Normalized config
            const showConfig = result?.columnConfigs?.['show'] as unknown as Record<
                string,
                unknown
            >;
            expect(showConfig.class).toEqual(['fas', 'fa-eye', 'text-info']);
            expect(showConfig.icon).toBeUndefined();
        });
    });

    describe('null header guard', () => {
        it('should return body unchanged when header is null', () => {
            const body: Body = {
                columnConfigs: {
                    show: { type: 'icon', icon: 'show', variant: 'info' },
                },
            };

            const result = preprocessResponse(null, body, [], icons, variants);

            // Guard: null header → body returned as-is (no normalization)
            expect(result).toBe(body);
        });

        it('should return null when both header and body are null', () => {
            const result = preprocessResponse(null, null, [], icons, variants);

            expect(result).toBeNull();
        });
    });

    describe('no changes needed', () => {
        it('should return null body unchanged when no _icon fields and no icon/variant configs', () => {
            const header: Header = {
                rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }],
            };
            const result = preprocessResponse(header, null, [{ name: 'Alice' }], icons, variants);

            expect(result).toBeNull();
        });
    });

    describe('_link suffixed field auto-generation (urlParameter base)', () => {
        it('should auto-generate link/modal configs for _link fields using urlParameter as base', () => {
            const header: Header = {
                rows: [
                    {
                        cells: [
                            { content: 'Name', key: 'name', field: 'name' },
                            { content: 'Name', key: 'id', field: 'name_link' },
                            { content: 'Edit', key: 'id', field: 'edit_link' },
                            { content: 'Delete', key: 'id', field: 'destroy_link' },
                        ],
                    },
                ],
            };
            const items = [{ id: 7, name: 'Bob' }];

            const result = preprocessResponse(header, null, items, icons, variants, 'admin/users');

            // name column exists in the header → field link, route gets the prefix appended
            expect(result?.columnConfigs?.['name_link']).toEqual({
                type: 'link',
                field: 'name',
                key: 'id',
                route: 'admin/users/{id}/name',
            });
            expect(result?.columnConfigs?.['edit_link']).toEqual({
                type: 'link',
                value: 'edit',
                key: 'id',
                route: 'admin/users/{id}/edit',
            });
            expect(result?.columnConfigs?.['destroy_link']).toEqual({
                type: 'modal',
                id: 'destroyModal',
                key: 'id',
                route: 'admin/users/{id}/destroy',
                content: { type: 'link', value: 'destroy' },
            });
        });
    });

    describe('_icon suffixed field route automatism (urlParameter base)', () => {
        it('should generate routes/modal for built-in _icon prefixes', () => {
            const header: Header = {
                rows: [
                    {
                        cells: [
                            { content: 'Name', key: 'name', field: 'name' },
                            { content: 'Show', key: 'id', field: 'show_icon' },
                            { content: 'Delete', key: 'id', field: 'destroy_icon' },
                        ],
                    },
                ],
            };
            const items = [{ id: 7, name: 'Bob' }];

            const result = preprocessResponse(header, null, items, icons, variants, 'admin/users');

            // built-in show prefix → icon link
            expect(result?.columnConfigs?.['show_icon']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-eye', 'text-secondary'],
                alt: 'Show',
                title: 'Show',
                key: 'id',
                route: 'admin/users/{id}',
            });
            // built-in destroy prefix → modal trigger with icon content (survives modal normalization)
            expect(result?.columnConfigs?.['destroy_icon']).toEqual({
                type: 'modal',
                id: 'destroyModal',
                key: 'id',
                route: 'admin/users/{id}/destroy',
                content: {
                    type: 'icon',
                    class: ['fas', 'fa-trash', 'text-secondary'],
                    alt: 'Destroy',
                    title: 'Destroy',
                },
            });
        });
    });

    describe('_button suffixed field auto-generation (urlParameter base)', () => {
        it('should generate button/modal configs for _button prefixes with registry variants', () => {
            const header: Header = {
                rows: [
                    {
                        cells: [
                            { content: 'Name', key: 'name', field: 'name' },
                            { content: 'Name', key: 'id', field: 'name_button' },
                            { content: 'Edit', key: 'id', field: 'edit_button' },
                            { content: 'Delete', key: 'id', field: 'destroy_button' },
                        ],
                    },
                ],
            };
            const items = [{ id: 7, name: 'Bob' }];
            const buttonVariants = { primary: 'secondary', destroy: 'danger', edit: 'primary' };

            const result = preprocessResponse(
                header,
                null,
                items,
                icons,
                buttonVariants,
                'admin/users'
            );

            // name column exists in the header → field button, route gets the prefix appended
            expect(result?.columnConfigs?.['name_button']).toEqual({
                type: 'button',
                variant: 'secondary', // no 'name' registry entry → fallback to variants.primary
                key: 'id',
                route: 'admin/users/{id}/name',
                field: 'name',
            });
            expect(result?.columnConfigs?.['edit_button']).toEqual({
                type: 'button',
                value: 'edit',
                variant: 'primary',
                key: 'id',
                route: 'admin/users/{id}/edit',
            });
            // destroy → modal trigger with a button content (danger variant), survives modal normalization
            expect(result?.columnConfigs?.['destroy_button']).toEqual({
                type: 'modal',
                id: 'destroyModal',
                key: 'id',
                route: 'admin/users/{id}/destroy',
                content: { type: 'button', value: 'destroy', variant: 'danger' },
            });
        });
    });

    describe('_badge suffixed field auto-generation (no routes)', () => {
        it('should generate badge configs for _badge fields with registry variants', () => {
            const header: Header = {
                rows: [
                    {
                        cells: [
                            { content: 'Role', key: 'id', field: 'role' },
                            { content: 'Role', key: 'id', field: 'role_badge' },
                            { content: 'Status', key: 'id', field: 'status_badge' },
                        ],
                    },
                ],
            };
            const items = [{ id: 7, role: 'admin', status_badge: 'active' }];
            const badgeVariants = { primary: 'secondary', role: 'info' };

            const result = preprocessResponse(
                header,
                null,
                items,
                icons,
                badgeVariants,
                'admin/users'
            );

            // role column exists → read the prefix column, variant from registry
            expect(result?.columnConfigs?.['role_badge']).toEqual({
                type: 'badge',
                field: 'role',
                variant: 'info',
            });
            // no 'status' column → read the suffixed field itself, no registry entry → 'secondary'
            expect(result?.columnConfigs?.['status_badge']).toEqual({
                type: 'badge',
                field: 'status_badge',
                variant: 'secondary',
            });
        });
    });

    describe('_progress suffixed field auto-generation (no routes, no variant registry)', () => {
        it('should generate progress configs with prefix-strip + header-match field resolution', () => {
            const header: Header = {
                rows: [
                    {
                        cells: [
                            { content: 'CPU', key: 'id', field: 'cpu' },
                            { content: 'CPU', key: 'id', field: 'cpu_progress' },
                            { content: 'Completion', key: 'id', field: 'completion_progress' },
                        ],
                    },
                ],
            };
            const items = [{ id: 7, cpu: 72, completion_progress: 40 }];

            const result = preprocessResponse(header, null, items, icons, variants, 'admin/users');

            // cpu column exists → read the prefix column
            expect(result?.columnConfigs?.['cpu_progress']).toEqual({
                type: 'progress',
                field: 'cpu',
            });
            // no 'completion' column → read the suffixed field itself
            expect(result?.columnConfigs?.['completion_progress']).toEqual({
                type: 'progress',
                field: 'completion_progress',
            });
        });
    });
    describe('prototype-chain header field names', () => {
        // A `constructor_icon` header field used to reach `icons['constructor']`, which
        // returned the Object constructor and blew up the spread with a TypeError. The
        // response is untrusted input, and StringZod(1, 250) constrains length, not the
        // character set — so the field name gets through to the registry lookup.
        it('should fall back to the primary icon for a constructor_icon field', () => {
            const header: Header = {
                rows: [
                    {
                        cells: [
                            { content: 'Name', key: 'name', field: 'name' },
                            {
                                content: 'Constructor',
                                key: 'constructor_icon',
                                field: 'constructor_icon',
                            },
                        ],
                    },
                ],
            };
            const items = [{ name: 'Alice' }];

            const result = preprocessResponse(header, null, items, icons, variants);

            expect(result?.columnConfigs?.['constructor_icon']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-file', 'text-secondary'],
                alt: 'Constructor',
                title: 'Constructor',
            });
        });

        it.each(['toString', 'valueOf', 'hasOwnProperty', '__proto__'])(
            'should not throw for a %s_icon field',
            protoKey => {
                const field = `${protoKey}_icon`;
                const header: Header = {
                    rows: [{ cells: [{ content: 'X', key: 'id', field }] }],
                };

                expect(() =>
                    preprocessResponse(header, null, [{ id: 1 }], icons, variants)
                ).not.toThrow();
            }
        );
    });
});
