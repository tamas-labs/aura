import { describe, it, expect } from 'vitest';
import { normalizeIconConfigs } from '../normalizeIconConfigs';
import type { Body } from '../../../types/api-response.types';

const icons = {
    primary: ['fas', 'fa-file'],
    show: ['fas', 'fa-eye'],
    destroy: ['fas', 'fa-trash'],
};
const variants = {
    primary: 'secondary',
    info: 'info',
    danger: 'danger',
};

describe('normalizeIconConfigs', () => {
    describe('basic normalization', () => {
        it('should resolve icon field into class array and remove icon field', () => {
            const body: Body = {
                columnConfigs: {
                    show: { type: 'icon', icon: 'show' },
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result?.columnConfigs?.['show']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-eye'],
            });
            expect(
                (result?.columnConfigs?.['show'] as unknown as Record<string, unknown>).icon
            ).toBeUndefined();
        });

        it('should resolve variant field into text-{color} class and remove variant field', () => {
            const body: Body = {
                columnConfigs: {
                    show: { type: 'icon', variant: 'info' },
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result?.columnConfigs?.['show']).toEqual({
                type: 'icon',
                class: ['text-info'],
            });
            expect(
                (result?.columnConfigs?.['show'] as unknown as Record<string, unknown>).variant
            ).toBeUndefined();
        });

        it('should resolve color field (alternative to variant) and remove color field', () => {
            const body: Body = {
                columnConfigs: {
                    show: { type: 'icon', color: 'danger' },
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result?.columnConfigs?.['show']).toEqual({
                type: 'icon',
                class: ['text-danger'],
            });
            expect(
                (result?.columnConfigs?.['show'] as unknown as Record<string, unknown>).color
            ).toBeUndefined();
        });

        it('should combine icon and variant into merged class array', () => {
            const body: Body = {
                columnConfigs: {
                    show: { type: 'icon', icon: 'show', variant: 'info' },
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result?.columnConfigs?.['show']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-eye', 'text-info'],
            });
        });

        it('should merge registry classes before existing class string', () => {
            const body: Body = {
                columnConfigs: {
                    show: {
                        type: 'icon',
                        icon: 'show',
                        class: 'my-custom-class' as any,
                    },
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result?.columnConfigs?.['show']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-eye', 'my-custom-class'],
            });
        });

        it('should merge registry classes before existing class array', () => {
            const body: Body = {
                columnConfigs: {
                    show: {
                        type: 'icon',
                        icon: 'show',
                        class: ['extra-class'],
                    },
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result?.columnConfigs?.['show']).toEqual({
                type: 'icon',
                class: ['fas', 'fa-eye', 'extra-class'],
            });
        });
    });

    describe('icons.3.json style full example', () => {
        it('should fully normalize show config with icon, variant, alt, key, route', () => {
            const body: Body = {
                columnConfigs: {
                    show: {
                        type: 'icon',
                        icon: 'show',
                        variant: 'info',
                        alt: 'Show',
                        title: 'Show record',
                        key: 'id',
                        route: '/users/{id}',
                    },
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['show'] as unknown as Record<string, unknown>;

            expect(config.type).toBe('icon');
            expect(config.class).toEqual(['fas', 'fa-eye', 'text-info']);
            expect(config.alt).toBe('Show');
            expect(config.title).toBe('Show record');
            expect(config.key).toBe('id');
            expect(config.route).toBe('/users/{id}');
            expect(config.icon).toBeUndefined();
            expect(config.variant).toBeUndefined();
        });
    });

    describe('skip conditions', () => {
        it('should skip config with type !== icon', () => {
            const body: Body = {
                columnConfigs: {
                    name: { type: 'link', route: '/users' },
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            // Nothing to normalize → same reference returned
            expect(result).toBe(body);
        });

        it('should skip icon config that has no icon, variant, or color', () => {
            const body: Body = {
                columnConfigs: {
                    show: { type: 'icon', class: ['fas', 'fa-eye'] },
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result).toBe(body);
        });

        it('should return same body when no columnConfigs', () => {
            const body: Body = { settings: { striped: true } };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result).toBe(body);
        });

        it('should return null when body is null', () => {
            const result = normalizeIconConfigs(null, icons, variants);

            expect(result).toBeNull();
        });
    });

    describe('preserve extra fields', () => {
        it('should preserve data-* attributes', () => {
            const body: Body = {
                columnConfigs: {
                    show: {
                        type: 'icon',
                        icon: 'show',
                        'data-bs-toggle': 'tooltip',
                        'data-bs-placement': 'top',
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['show'] as unknown as Record<string, unknown>;

            expect(config['data-bs-toggle']).toBe('tooltip');
            expect(config['data-bs-placement']).toBe('top');
        });

        it('should not affect other columnConfig entries', () => {
            const body: Body = {
                columnConfigs: {
                    show: { type: 'icon', icon: 'show' },
                    name: { type: 'link', route: '/users' },
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result?.columnConfigs?.['name']).toEqual({ type: 'link', route: '/users' });
        });
    });

    describe('immutability', () => {
        it('should not mutate the original body', () => {
            const original: Body = {
                columnConfigs: {
                    show: { type: 'icon', icon: 'show' },
                },
            };
            const originalConfigs = original.columnConfigs;
            normalizeIconConfigs(original, icons, variants);

            expect(original.columnConfigs).toBe(originalConfigs);
            expect(
                (original.columnConfigs?.['show'] as unknown as Record<string, unknown>).icon
            ).toBe('show');
        });
    });

    describe('conditional branches normalization', () => {
        it('should normalize icon and variant in if-branch entries', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        class: ['fas', 'fa-question'],
                        key: 'status',
                        if: [{ eq: 'active', icon: 'show', variant: 'info' }],
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;
            const ifBranch = (config.if as Record<string, unknown>[])[0]!;

            expect(ifBranch.class).toEqual(['fas', 'fa-eye', 'text-info']);
            expect(ifBranch.eq).toBe('active');
            expect(ifBranch.icon).toBeUndefined();
            expect(ifBranch.variant).toBeUndefined();
        });

        it('should normalize icon and variant in else-branch', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        class: ['fas', 'fa-question'],
                        else: { icon: 'destroy', variant: 'danger' },
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;
            const elseBranch = config.else as Record<string, unknown>;

            expect(elseBranch.class).toEqual(['fas', 'fa-trash', 'text-danger']);
            expect(elseBranch.icon).toBeUndefined();
            expect(elseBranch.variant).toBeUndefined();
        });

        it('should normalize root, if-branches and else-branch together', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        icon: 'show',
                        variant: 'info',
                        key: 'status',
                        if: [
                            { eq: 'active', icon: 'show', variant: 'info' },
                            { eq: 'deleted', icon: 'destroy', variant: 'danger' },
                        ],
                        else: { icon: 'destroy', variant: 'danger' },
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;

            // root level
            expect(config.class).toEqual(['fas', 'fa-eye', 'text-info']);
            expect(config.icon).toBeUndefined();

            // if-branches
            const ifBranches = config.if as Record<string, unknown>[];
            expect(ifBranches[0]!.class).toEqual(['fas', 'fa-eye', 'text-info']);
            expect(ifBranches[0]!.eq).toBe('active');
            expect(ifBranches[0]!.icon).toBeUndefined();
            expect(ifBranches[1]!.class).toEqual(['fas', 'fa-trash', 'text-danger']);
            expect(ifBranches[1]!.eq).toBe('deleted');
            expect(ifBranches[1]!.icon).toBeUndefined();

            // else-branch
            const elseBranch = config.else as Record<string, unknown>;
            expect(elseBranch.class).toEqual(['fas', 'fa-trash', 'text-danger']);
            expect(elseBranch.icon).toBeUndefined();
        });

        it('should only normalize if-branches that contain icon/variant', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        key: 'status',
                        if: [
                            { eq: 'active', icon: 'show', variant: 'info' },
                            { eq: 'pending', class: ['fas', 'fa-clock'] },
                        ],
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;
            const ifBranches = config.if as Record<string, unknown>[];

            expect(ifBranches[0]!.class).toEqual(['fas', 'fa-eye', 'text-info']);
            expect(ifBranches[0]!.icon).toBeUndefined();
            expect(ifBranches[1]).toEqual({ eq: 'pending', class: ['fas', 'fa-clock'] });
        });

        it('should not modify body when if array is empty', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        class: ['fas', 'fa-eye'],
                        if: [],
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result).toBe(body);
        });

        it('should not modify body when else is null', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        class: ['fas', 'fa-eye'],
                        else: null,
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result).toBe(body);
        });

        it('should not mutate the original if-branch entries', () => {
            const originalBranch = { eq: 'active', icon: 'show', variant: 'info' };
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        key: 'status',
                        if: [originalBranch],
                    } as any,
                },
            };
            normalizeIconConfigs(body, icons, variants);

            expect(originalBranch.icon).toBe('show');
            expect(originalBranch.variant).toBe('info');
            expect((originalBranch as unknown as Record<string, unknown>).class).toBeUndefined();
        });

        it('should preserve alt, title, key, route inside if and else branches', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        key: 'status',
                        if: [
                            {
                                eq: 'active',
                                icon: 'show',
                                alt: 'Show',
                                title: 'View',
                                key: 'id',
                                route: '/users/{id}',
                            },
                        ],
                        else: {
                            icon: 'destroy',
                            alt: 'Delete',
                            route: '/users/{id}/delete',
                            key: 'id',
                        },
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;
            const ifBranch = (config.if as Record<string, unknown>[])[0]!;
            const elseBranch = config.else as Record<string, unknown>;

            expect(ifBranch.alt).toBe('Show');
            expect(ifBranch.title).toBe('View');
            expect(ifBranch.key).toBe('id');
            expect(ifBranch.route).toBe('/users/{id}');
            expect(elseBranch.alt).toBe('Delete');
            expect(elseBranch.route).toBe('/users/{id}/delete');
            expect(elseBranch.key).toBe('id');
        });

        it('should not modify body when if-branches only have class (no icon/variant/color)', () => {
            const branch1 = { eq: 'active', class: ['fas', 'fa-check'] };
            const branch2 = { eq: 'inactive', class: ['fas', 'fa-times'] };
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        if: [branch1, branch2],
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result).toBe(body);
        });
    });

    describe('mapping entries normalization (regression: reviewer-found bug — mapping entries were never registry-resolved)', () => {
        it('should resolve icon+variant inside a mapping entry into a class array', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        key: 'status',
                        mapping: { active: { icon: 'show', variant: 'info' } },
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;
            const entry = (config.mapping as Record<string, unknown>).active as Record<
                string,
                unknown
            >;

            expect(entry.class).toEqual(['fas', 'fa-eye', 'text-info']);
            expect(entry.icon).toBeUndefined();
            expect(entry.variant).toBeUndefined();
        });

        it('should resolve every entry of a multi-key mapping dictionary independently', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        key: 'status',
                        mapping: {
                            active: { icon: 'show', variant: 'info' },
                            deleted: { icon: 'destroy', variant: 'danger' },
                        },
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;
            const mapping = config.mapping as Record<string, Record<string, unknown>>;

            expect(mapping.active?.class).toEqual(['fas', 'fa-eye', 'text-info']);
            expect(mapping.deleted?.class).toEqual(['fas', 'fa-trash', 'text-danger']);
        });

        it('should resolve `color` (alternative to `variant`) inside a mapping entry', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        key: 'status',
                        mapping: { active: { icon: 'show', color: 'danger' } },
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;
            const entry = (config.mapping as Record<string, unknown>).active as Record<
                string,
                unknown
            >;

            expect(entry.class).toEqual(['fas', 'fa-eye', 'text-danger']);
            expect(entry.color).toBeUndefined();
        });

        it('should merge registry classes with an existing `class` on a mapping entry', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        key: 'status',
                        mapping: { active: { icon: 'show', class: ['extra-class'] } },
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;
            const entry = (config.mapping as Record<string, unknown>).active as Record<
                string,
                unknown
            >;

            expect(entry.class).toEqual(['fas', 'fa-eye', 'extra-class']);
        });

        it('should preserve `label` alongside the resolved class on a mapping entry', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        key: 'status',
                        mapping: { active: { icon: 'show', label: 'Ignored on icon' } } as any,
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;
            const entry = (config.mapping as Record<string, unknown>).active as Record<
                string,
                unknown
            >;

            expect(entry.class).toEqual(['fas', 'fa-eye']);
            expect(entry.label).toBe('Ignored on icon');
        });

        it('should leave a mapping entry with only `class` (no icon/variant/color) untouched', () => {
            const originalEntry = { class: ['fas', 'fa-question'] };
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        key: 'status',
                        mapping: { active: originalEntry } as any,
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;
            const mapping = config.mapping as Record<string, unknown>;

            // Unchanged entry keeps the same reference (no needless clone).
            expect(mapping.active).toBe(originalEntry);
        });

        it('should pass through a non-object mapping entry unchanged (e.g. null)', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        key: 'status',
                        mapping: { broken: null } as any,
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;
            const mapping = config.mapping as Record<string, unknown>;

            expect(mapping.broken).toBeNull();
        });

        it('should not modify body when mapping is null', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        class: ['fas', 'fa-eye'],
                        mapping: null,
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result).toBe(body);
        });

        it('should not modify body when mapping is an empty object', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        class: ['fas', 'fa-eye'],
                        mapping: {},
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);

            expect(result).toBe(body);
        });

        it('should not mutate the original mapping entry objects', () => {
            const originalEntry = { icon: 'show', variant: 'info' };
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        key: 'status',
                        mapping: { active: originalEntry } as any,
                    } as any,
                },
            };
            normalizeIconConfigs(body, icons, variants);

            expect(originalEntry.icon).toBe('show');
            expect(originalEntry.variant).toBe('info');
            expect((originalEntry as unknown as Record<string, unknown>).class).toBeUndefined();
        });

        it('should normalize root config, if/else branches AND mapping entries together', () => {
            const body: Body = {
                columnConfigs: {
                    status: {
                        type: 'icon',
                        icon: 'show',
                        variant: 'info',
                        key: 'status',
                        if: [{ eq: 'active', icon: 'show', variant: 'info' }],
                        else: { icon: 'destroy', variant: 'danger' },
                        mapping: { deleted: { icon: 'destroy', variant: 'danger' } },
                    } as any,
                },
            };
            const result = normalizeIconConfigs(body, icons, variants);
            const config = result?.columnConfigs?.['status'] as unknown as Record<string, unknown>;

            expect(config.class).toEqual(['fas', 'fa-eye', 'text-info']);
            expect((config.if as Record<string, unknown>[])[0]!.class).toEqual([
                'fas',
                'fa-eye',
                'text-info',
            ]);
            expect((config.else as Record<string, unknown>).class).toEqual([
                'fas',
                'fa-trash',
                'text-danger',
            ]);
            const mapping = config.mapping as Record<string, Record<string, unknown>>;
            expect(mapping.deleted?.class).toEqual(['fas', 'fa-trash', 'text-danger']);
        });
    });
});
