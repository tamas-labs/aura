import { describe, it, expect, vi } from 'vitest';
import { resolveConditionalConfig } from '../resolve-conditional-config';

describe('resolveConditionalConfig', () => {
    describe('non-conditional configs', () => {
        it('should return config as-is when no if/else present', () => {
            const config = { type: 'static', value: 'Hello', class: 'text-primary' };
            const item = { id: 1, name: 'Test' };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual(config);
        });

        it('should handle empty config', () => {
            const config = {};
            const item = { id: 1 };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual({});
        });
    });

    describe('simple conditional configs', () => {
        it('should resolve first matching condition', () => {
            const config = {
                type: 'static',
                key: 'status',
                if: [
                    { eq: 'active', value: 'Active', class: 'text-success' },
                    { eq: 'pending', value: 'Pending', class: 'text-warning' },
                ],
            };
            const item = { status: 'active' };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual({
                type: 'static',
                value: 'Active',
                class: 'text-success',
            });
        });

        it('should use else branch when no condition matches', () => {
            const config = {
                type: 'static',
                key: 'status',
                if: [{ eq: 'active', value: 'Active' }],
                else: {
                    value: 'Unknown',
                    class: 'text-muted',
                },
            };
            const item = { status: 'deleted' };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual({
                type: 'static',
                value: 'Unknown',
                class: 'text-muted',
            });
        });

        it('should return null when no match and no else', () => {
            const config = {
                key: 'status',
                if: [{ eq: 'active', value: 'Active' }],
            };
            const item = { status: 'deleted' };

            const result = resolveConditionalConfig(config, item);
            expect(result).toBeNull();
        });
    });

    describe('config inheritance', () => {
        it('should inherit root config properties', () => {
            const config = {
                type: 'badge',
                key: 'score',
                class: 'badge',
                if: [
                    { gte: 90, variant: 'success' },
                    { gte: 70, variant: 'warning' },
                ],
            };
            const item = { score: 95 };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual({
                type: 'badge',
                class: 'badge',
                variant: 'success',
            });
        });

        it('should allow branch to override root properties', () => {
            const config = {
                type: 'static',
                key: 'priority',
                class: 'text-primary',
                if: [{ eq: 'high', class: 'text-danger' }],
            };
            const item = { priority: 'high' };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual({
                type: 'static',
                class: 'text-danger',
            });
        });
    });

    describe('nested conditionals', () => {
        it('should resolve nested conditional', () => {
            const config = {
                type: 'badge',
                key: 'status',
                if: [
                    {
                        eq: 'active',
                        key: 'last_login',
                        if: [{ lt: 'yesterday', variant: 'warning', label: 'Active (old)' }],
                        else: {
                            variant: 'success',
                            label: 'Active',
                        },
                    },
                ],
            };
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 2);
            const item = {
                status: 'active',
                last_login: yesterday.toISOString(),
            };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual({
                type: 'badge',
                variant: 'warning',
                label: 'Active (old)',
            });
        });

        it('should handle multiple nesting levels', () => {
            const config = {
                key: 'level1',
                if: [
                    {
                        eq: 'a',
                        key: 'level2',
                        if: [
                            {
                                eq: 'b',
                                key: 'level3',
                                if: [{ eq: 'c', value: 'Deeply nested' }],
                            },
                        ],
                    },
                ],
            };
            const item = { level1: 'a', level2: 'b', level3: 'c' };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual({ value: 'Deeply nested' });
        });

        it('should notify the caller and stop at max recursion depth', () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const onMaxDepth = vi.fn();

            const config = {
                key: 'field',
                if: [
                    {
                        eq: 'val',
                        key: 'field',
                        if: [
                            {
                                eq: 'val',
                                key: 'field',
                                if: [
                                    {
                                        eq: 'val',
                                        key: 'field',
                                        if: [
                                            {
                                                eq: 'val',
                                                key: 'field',
                                                if: [
                                                    {
                                                        eq: 'val',
                                                        key: 'field',
                                                        if: [{ eq: 'val', value: 'Too deep' }],
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                    },
                ],
            };
            const item = { field: 'val' };

            const result = resolveConditionalConfig(config, item, 0, onMaxDepth);

            expect(onMaxDepth).toHaveBeenCalled();
            expect(result).not.toBeNull();

            // The `console.warn` that used to live here never reached a production
            // build (`drop_console`), so the callback must be the only channel.
            expect(warnSpy).not.toHaveBeenCalled();

            warnSpy.mockRestore();
        });

        it('should tolerate a missing onMaxDepth callback', () => {
            const config = {
                key: 'field',
                if: [{ eq: 'val', key: 'field', if: [{ eq: 'val', value: 'deep' }] }],
            };

            expect(() => resolveConditionalConfig(config, { field: 'val' }, 99)).not.toThrow();
        });
    });

    describe('operator stripping', () => {
        it('should strip operator from merged result', () => {
            const config = {
                type: 'static',
                key: 'count',
                if: [{ gt: 10, value: 'High', class: 'text-success' }],
            };
            const item = { count: 15 };

            const result = resolveConditionalConfig(config, item);
            expect(result).not.toHaveProperty('gt');
            expect(result).toEqual({
                type: 'static',
                value: 'High',
                class: 'text-success',
            });
        });

        it('should strip logic properties from final result', () => {
            const config = {
                type: 'static',
                value: 'Default',
                key: 'status',
                if: [{ eq: 'active', value: 'Active' }],
            };
            const item = { status: 'active' };

            const result = resolveConditionalConfig(config, item);
            expect(result).not.toHaveProperty('key');
            expect(result).not.toHaveProperty('if');
            expect(result).not.toHaveProperty('else');
        });
    });

    describe('field resolution', () => {
        it('should resolve nested field paths', () => {
            const config = {
                key: 'user.role',
                if: [{ eq: 'admin', value: 'Administrator' }],
            };
            const item = { user: { role: 'admin' } };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual({ value: 'Administrator' });
        });

        it('should handle undefined field gracefully', () => {
            const config = {
                key: 'nonexistent',
                if: [{ empty: true, value: 'No data' }],
            };
            const item = { other: 'value' };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual({ value: 'No data' });
        });

        it('should return root config when key is missing', () => {
            const config = {
                type: 'static',
                value: 'Test',
                if: [{ eq: 'active', value: 'Active' }],
            };
            const item = { status: 'active' };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual({ type: 'static', value: 'Test' });
        });
    });

    describe('empty and invalid conditions', () => {
        it('should handle empty if array', () => {
            const config = {
                type: 'static',
                value: 'Default',
                key: 'status',
                if: [],
            };
            const item = { status: 'active' };

            const result = resolveConditionalConfig(config, item);
            expect(result).toBeNull();
        });

        it('should skip invalid condition objects', () => {
            const config = {
                key: 'status',
                if: [null, { noOperator: 'value' }, { eq: 'active', value: 'Active' }],
            };
            const item = { status: 'active' };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual({ value: 'Active' });
        });

        it('should handle non-array if value', () => {
            const config = {
                key: 'status',
                if: 'not-an-array',
                else: { value: 'Fallback' },
            };
            const item = { status: 'active' };

            const result = resolveConditionalConfig(config as any, item);
            expect(result).toEqual({ value: 'Fallback' });
        });
    });

    describe('type changes in branches', () => {
        it('should allow type change in conditional branch', () => {
            const config = {
                type: 'static',
                key: 'mode',
                if: [{ eq: 'icon-mode', type: 'icon', icon: 'check' }],
                else: {
                    value: 'Text mode',
                },
            };
            const item = { mode: 'icon-mode' };

            const result = resolveConditionalConfig(config, item);
            expect(result).toEqual({
                type: 'icon',
                icon: 'check',
            });
        });
    });

    describe('branch-level key preservation', () => {
        it('should preserve key from if-branch for route resolution', () => {
            const config = {
                type: 'icon',
                key: 'id',
                if: [
                    {
                        bigger: 5,
                        class: ['fas', 'fa-edit'],
                        route: 'items.{id}.edit',
                        key: 'id',
                        alt: 'Edit',
                    },
                ],
                else: {
                    class: ['fas', 'fa-eye'],
                    route: 'items.{id}.show',
                    key: 'id',
                    alt: 'Show',
                },
            };
            const item = { id: 7 };

            const result = resolveConditionalConfig(config, item);
            expect(result).not.toBeNull();
            expect(result).toHaveProperty('key', 'id');
            expect(result).toHaveProperty('route', 'items.{id}.edit');
        });

        it('should preserve key from else-branch for route resolution', () => {
            const config = {
                type: 'icon',
                key: 'id',
                if: [
                    {
                        bigger: 5,
                        class: ['fas', 'fa-edit'],
                        route: 'items.{id}.edit',
                        key: 'id',
                    },
                ],
                else: {
                    class: ['fas', 'fa-eye'],
                    route: 'items.{id}.show',
                    key: 'id',
                },
            };
            const item = { id: 3 };

            const result = resolveConditionalConfig(config, item);
            expect(result).not.toBeNull();
            expect(result).toHaveProperty('key', 'id');
            expect(result).toHaveProperty('route', 'items.{id}.show');
        });

        it('should allow branch key to override root key', () => {
            const config = {
                type: 'icon',
                key: 'status',
                if: [
                    {
                        eq: 'active',
                        class: ['fas', 'fa-edit'],
                        route: 'items.{id}.edit',
                        key: 'id',
                    },
                ],
            };
            const item = { status: 'active', id: 5 };

            const result = resolveConditionalConfig(config, item);
            expect(result).not.toBeNull();
            expect(result).toHaveProperty('key', 'id');
        });

        it('should not add key to output when branch has no key', () => {
            const config = {
                type: 'static',
                value: 'Default',
                key: 'status',
                if: [{ eq: 'active', value: 'Active' }],
            };
            const item = { status: 'active' };

            const result = resolveConditionalConfig(config, item);
            expect(result).not.toHaveProperty('key');
        });

        it('should preserve key from leaf branch in nested conditional', () => {
            const config = {
                type: 'icon',
                key: 'status',
                if: [
                    {
                        eq: 'active',
                        key: 'role',
                        if: [
                            {
                                eq: 'admin',
                                class: ['fas', 'fa-cog'],
                                route: 'admin.{id}.edit',
                                key: 'id',
                            },
                        ],
                        else: {
                            class: ['fas', 'fa-eye'],
                            route: 'items.{id}.show',
                            key: 'id',
                        },
                    },
                ],
            };
            const item = { status: 'active', role: 'admin', id: 10 };

            const result = resolveConditionalConfig(config, item);
            expect(result).not.toBeNull();
            expect(result).toHaveProperty('key', 'id');
            expect(result).toHaveProperty('route', 'admin.{id}.edit');
        });

        it('should preserve key from branch even without route', () => {
            const config = {
                type: 'icon',
                key: 'status',
                if: [
                    {
                        eq: 'active',
                        class: ['fas', 'fa-check'],
                        key: 'id',
                    },
                ],
            };
            const item = { status: 'active', id: 5 };

            const result = resolveConditionalConfig(config, item);
            expect(result).not.toBeNull();
            expect(result).toHaveProperty('key', 'id');
        });
    });
});
