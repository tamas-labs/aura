import { describe, it, expect } from 'vitest';
import { resolveMappingConfig } from '../resolve-mapping-config';

describe('resolveMappingConfig', () => {
    // -------------------------------------------------------------------------
    // no-op cases
    // -------------------------------------------------------------------------
    describe('no-op cases', () => {
        it('should return config unchanged when mapping is absent', () => {
            const config = { type: 'icon', icon: 'check' };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).toEqual(config);
        });

        it('should return config unchanged when mapping is null', () => {
            const config = { type: 'icon', icon: 'check', mapping: null };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).toEqual(config);
        });

        it('should return config unchanged when mapping is undefined', () => {
            const config = { type: 'icon', icon: 'check', mapping: undefined };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).toEqual(config);
        });

        it('should return config unchanged when mapping is not an object (string)', () => {
            const config = { type: 'icon', icon: 'check', mapping: 'not-an-object' };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).toEqual(config);
        });

        it('should return config unchanged when mapping is an array', () => {
            const config = { type: 'icon', icon: 'check', mapping: [{ icon: 'x' }] };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).toEqual(config);
        });
    });

    // -------------------------------------------------------------------------
    // excluded types (renderer-local mapping semantics)
    // -------------------------------------------------------------------------
    describe('excluded types (TYPES_WITH_LOCAL_MAPPING)', () => {
        it('should leave badge config unchanged, including the mapping key', () => {
            const config = {
                type: 'badge',
                field: 'priority',
                mapping: { high: { variant: 'danger' } },
            };
            const item = { priority: 'high' };

            const result = resolveMappingConfig(config, item);
            expect(result).toEqual(config);
            expect(result).toHaveProperty('mapping');
        });

        it('should not resolve badge mapping even on a match', () => {
            const config = {
                type: 'badge',
                field: 'priority',
                mapping: { high: { variant: 'danger', label: 'Magas' } },
            };
            const item = { priority: 'high' };

            const result = resolveMappingConfig(config, item);
            expect(result).not.toHaveProperty('variant');
            expect(result).not.toHaveProperty('label');
        });
    });

    // -------------------------------------------------------------------------
    // selector resolution: field ?? key
    // -------------------------------------------------------------------------
    describe('selector resolution', () => {
        it('should use field as selector when present', () => {
            const config = {
                type: 'icon',
                field: 'status',
                key: 'ignored',
                mapping: { active: { icon: 'check' } },
            };
            const item = { status: 'active', ignored: 'nope' };

            const result = resolveMappingConfig(config, item);
            expect(result.icon).toBe('check');
        });

        it('should fall back to key when field is absent', () => {
            const config = {
                type: 'icon',
                key: 'status',
                mapping: { active: { icon: 'check' } },
            };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result.icon).toBe('check');
        });

        it('should resolve dotted paths via resolveValue', () => {
            const config = {
                type: 'icon',
                key: 'user.status',
                mapping: { active: { icon: 'check' } },
            };
            const item = { user: { status: 'active' } };

            const result = resolveMappingConfig(config, item);
            expect(result.icon).toBe('check');
        });

        it('should no-match when neither field nor key is a string', () => {
            const config = { type: 'icon', mapping: { active: { icon: 'check' } } };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).not.toHaveProperty('icon');
            expect(result).not.toHaveProperty('mapping');
        });

        it('should no-match when field is not a string (e.g. number)', () => {
            const config = {
                type: 'icon',
                field: 42,
                mapping: { active: { icon: 'check' } },
            };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).not.toHaveProperty('icon');
        });
    });

    // -------------------------------------------------------------------------
    // URL-key types (link/button): selector is `field` only, `key` is the URL-key
    // -------------------------------------------------------------------------
    describe('URL-key types (TYPES_WITH_URL_KEY): field-only selector', () => {
        it('should use field as selector for link (not the URL key)', () => {
            const config = {
                type: 'link',
                field: 'status',
                key: 'id',
                route: '/u/{id}',
                mapping: { active: { variant: 'success' } },
            };
            const item = { status: 'active', id: 7 };

            const result = resolveMappingConfig(config, item);
            expect(result.variant).toBe('success');
            expect(result.key).toBe('id');
            expect(result).not.toHaveProperty('mapping');
        });

        it('should NOT fall back to key as selector for link when field is absent', () => {
            const config = {
                type: 'link',
                key: 'status',
                route: '/u/{status}',
                mapping: { active: { variant: 'success' } },
            };
            // `key` value would match if it were used as selector — it must NOT be.
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).not.toHaveProperty('variant');
            expect(result).not.toHaveProperty('mapping');
        });

        it('should use field as selector for button (not the URL key)', () => {
            const config = {
                type: 'button',
                field: 'state',
                key: 'id',
                mapping: { locked: { variant: 'danger', disabled: true } },
            };
            const item = { state: 'locked', id: 3 };

            const result = resolveMappingConfig(config, item);
            expect(result.variant).toBe('danger');
            expect(result.disabled).toBe(true);
            expect(result.key).toBe('id');
        });

        it('should NOT fall back to key for button when field is absent', () => {
            const config = {
                type: 'button',
                key: 'state',
                mapping: { locked: { variant: 'danger' } },
            };
            const item = { state: 'locked' };

            const result = resolveMappingConfig(config, item);
            expect(result).not.toHaveProperty('variant');
        });
    });

    // -------------------------------------------------------------------------
    // null/undefined selector value
    // -------------------------------------------------------------------------
    describe('null/undefined selector value', () => {
        it('should no-match (not stringify to "null") when the resolved value is null', () => {
            const config = {
                type: 'icon',
                key: 'status',
                mapping: { null: { icon: 'check' } },
            };
            const item = { status: null };

            const result = resolveMappingConfig(config, item);
            expect(result).not.toHaveProperty('icon');
            expect(result).not.toHaveProperty('mapping');
        });

        it('should no-match (not stringify to "undefined") when the resolved value is undefined', () => {
            const config = {
                type: 'icon',
                key: 'missing',
                mapping: { undefined: { icon: 'check' } },
            };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).not.toHaveProperty('icon');
        });
    });

    // -------------------------------------------------------------------------
    // key stringification (number/boolean values)
    // -------------------------------------------------------------------------
    describe('lookup key stringification', () => {
        it('should stringify a numeric selector value for lookup', () => {
            const config = {
                type: 'icon',
                key: 'level',
                mapping: { '1': { icon: 'star' } },
            };
            const item = { level: 1 };

            const result = resolveMappingConfig(config, item);
            expect(result.icon).toBe('star');
        });

        it('should stringify a boolean selector value for lookup', () => {
            const config = {
                type: 'icon',
                key: 'active',
                mapping: { true: { icon: 'check' } },
            };
            const item = { active: true };

            const result = resolveMappingConfig(config, item);
            expect(result.icon).toBe('check');
        });

        it('should stringify false correctly (distinct from no-match)', () => {
            const config = {
                type: 'icon',
                key: 'active',
                mapping: { false: { icon: 'times' } },
            };
            const item = { active: false };

            const result = resolveMappingConfig(config, item);
            expect(result.icon).toBe('times');
        });
    });

    // -------------------------------------------------------------------------
    // match merge semantics
    // -------------------------------------------------------------------------
    describe('match merge semantics', () => {
        it('should merge the matched entry over the config and drop the mapping key', () => {
            const config = {
                type: 'icon',
                key: 'status',
                variant: 'secondary',
                mapping: { active: { icon: 'check', variant: 'success' } },
            };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).toEqual({
                type: 'icon',
                key: 'status',
                icon: 'check',
                variant: 'success',
            });
            expect(result).not.toHaveProperty('mapping');
        });

        it('should let the entry win over identically-named root config keys', () => {
            const config = {
                type: 'icon',
                key: 'status',
                icon: 'question',
                mapping: { active: { icon: 'check' } },
            };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result.icon).toBe('check');
        });

        it('should normalize entry `label` to `value`', () => {
            const config = {
                type: 'reference',
                key: 'status',
                mapping: { active: { label: 'Aktív', color: 'success' } },
            };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result.value).toBe('Aktív');
            expect(result).not.toHaveProperty('label');
            expect(result.color).toBe('success');
        });

        it('should prefer entry `value` over entry `label` when both are present', () => {
            const config = {
                type: 'reference',
                key: 'status',
                mapping: { active: { label: 'Ignored', value: 'Wins' } },
            };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result.value).toBe('Wins');
            expect(result).not.toHaveProperty('label');
        });
    });

    // -------------------------------------------------------------------------
    // no-match
    // -------------------------------------------------------------------------
    describe('no-match', () => {
        it('should drop the mapping key and leave everything else unchanged when no entry matches', () => {
            const config = {
                type: 'icon',
                key: 'status',
                icon: 'question',
                mapping: { active: { icon: 'check' } },
            };
            const item = { status: 'unknown' };

            const result = resolveMappingConfig(config, item);
            expect(result).toEqual({ type: 'icon', key: 'status', icon: 'question' });
        });

        it('should no-match when the matched entry value is not an object (e.g. string)', () => {
            const config = {
                type: 'icon',
                key: 'status',
                mapping: { active: 'not-an-object' },
            };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).toEqual({ type: 'icon', key: 'status' });
        });

        it('should no-match when the matched entry value is null', () => {
            const config = {
                type: 'icon',
                key: 'status',
                mapping: { active: null },
            };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).toEqual({ type: 'icon', key: 'status' });
        });

        it('should no-match when the matched entry value is an array', () => {
            const config = {
                type: 'icon',
                key: 'status',
                mapping: { active: ['icon'] },
            };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).toEqual({ type: 'icon', key: 'status' });
        });

        it('should no-match on an empty mapping object', () => {
            const config = { type: 'icon', key: 'status', mapping: {} };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).toEqual({ type: 'icon', key: 'status' });
        });

        it('should no-match when the selector value is an empty string (not a mapping key)', () => {
            const config = {
                type: 'icon',
                key: 'status',
                mapping: { '': { icon: 'check' } },
            };
            const item = { status: '' };

            // Empty string is a valid resolved value (not null/undefined) — should match "" key.
            const result = resolveMappingConfig(config, item);
            expect(result.icon).toBe('check');
        });
    });

    // -------------------------------------------------------------------------
    // immutability
    // -------------------------------------------------------------------------
    describe('prototype-chain lookups', () => {
        it('should treat an entry reachable only through the prototype chain as a miss', () => {
            // What a `mapping` looked like after the old `stripMappingEntries` assigned a
            // `__proto__`-keyed entry into an object literal: the entry is gone from the
            // key list, but every one of its keys stays readable through the chain.
            const mapping = Object.create({ owned: { icon: 'inherited' } }) as Record<
                string,
                unknown
            >;
            mapping.high = { icon: 'check' };
            const config = { type: 'icon', field: 'status', mapping };

            expect(resolveMappingConfig(config, { status: 'owned' })).toEqual({
                type: 'icon',
                field: 'status',
            });
            // …while the own entry still matches
            expect(resolveMappingConfig(config, { status: 'high' })).toEqual({
                type: 'icon',
                field: 'status',
                icon: 'check',
            });
        });

        it.each(['__proto__', 'constructor', 'toString'])(
            'should treat the row value %s as a miss',
            value => {
                const config = {
                    type: 'icon',
                    field: 'status',
                    mapping: { high: { icon: 'check' } },
                };

                expect(resolveMappingConfig(config, { status: value })).toEqual({
                    type: 'icon',
                    field: 'status',
                });
            }
        );
    });

    describe('immutability', () => {
        it('should not mutate the input config object on a match', () => {
            const config = {
                type: 'icon',
                key: 'status',
                mapping: { active: { icon: 'check' } },
            };
            const original = JSON.parse(JSON.stringify(config));
            const item = { status: 'active' };

            resolveMappingConfig(config, item);
            expect(config).toEqual(original);
        });

        it('should not mutate the input config object on a no-match', () => {
            const config = {
                type: 'icon',
                key: 'status',
                mapping: { active: { icon: 'check' } },
            };
            const original = JSON.parse(JSON.stringify(config));
            const item = { status: 'unknown' };

            resolveMappingConfig(config, item);
            expect(config).toEqual(original);
        });

        it('should not mutate the input item object', () => {
            const config = {
                type: 'icon',
                key: 'status',
                mapping: { active: { icon: 'check' } },
            };
            const item = { status: 'active' };
            const originalItem = { ...item };

            resolveMappingConfig(config, item);
            expect(item).toEqual(originalItem);
        });

        it('should return a new object reference, not the input config', () => {
            const config = { type: 'icon', icon: 'check' };
            const item = { status: 'active' };

            const result = resolveMappingConfig(config, item);
            expect(result).not.toBe(config);
        });

        it('should never return null', () => {
            const config = { type: 'icon', key: 'status', mapping: { active: { icon: 'x' } } };
            const item = { status: 'nope' };

            const result = resolveMappingConfig(config, item);
            expect(result).not.toBeNull();
        });
    });
});
