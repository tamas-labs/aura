import { describe, it, expect } from 'vitest';
import { IconConfigZod, IconMappingEntryZod } from '../icon-config.zod';

describe('IconConfigZod', () => {
    // -------------------------------------------------------------------------
    // valid cases
    // -------------------------------------------------------------------------
    describe('valid cases', () => {
        it('should accept minimal config with type and icon', () => {
            const result = IconConfigZod.safeParse({ type: 'icon', icon: 'check' });
            expect(result.success).toBe(true);
        });

        it('should accept config with class instead of icon', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                class: ['fa-regular', 'fa-trash-can', 'text-danger'],
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with class as string instead of array', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                class: 'fa-solid fa-check',
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with icon and class together', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'edit',
                class: ['ms-1'],
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with all formatting fields', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                variant: 'success',
                color: 'primary',
                size: 'lg',
            });
            expect(result.success).toBe(true);
        });

        it('should accept variant as variants registry key (non-Bootstrap color)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                variant: 'show',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.variant).toBe('show');
            }
        });

        it('should accept color as variants registry key (non-Bootstrap color)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'trash',
                color: 'destroy',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.color).toBe('destroy');
            }
        });

        it('should accept config with accessibility fields', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                alt: 'Active status',
                title: 'This item is active',
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with route and key fields', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'edit',
                variant: 'primary',
                route: '/users/{id}/edit',
                key: 'id',
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with style field', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                style: 'cursor: pointer;',
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with cellRules', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                cellRules: {
                    key: 'status',
                    if: [{ eq: 'active', background: 'success-subtle' }],
                    else: { background: 'light' },
                },
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with null on all optional fields', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                class: null,
                variant: null,
                color: null,
                size: null,
                alt: null,
                title: null,
                route: null,
                key: null,
                style: null,
                cellRules: null,
            });
            expect(result.success).toBe(true);
        });

        it('should accept all Bootstrap color values for variant', () => {
            const colors = [
                'primary',
                'secondary',
                'success',
                'danger',
                'warning',
                'info',
                'dark',
                'light',
            ] as const;

            for (const color of colors) {
                const result = IconConfigZod.safeParse({
                    type: 'icon',
                    icon: 'check',
                    variant: color,
                });
                expect(result.success).toBe(true);
            }
        });

        it('should accept all Bootstrap color values for color', () => {
            const colors = [
                'primary',
                'secondary',
                'success',
                'danger',
                'warning',
                'info',
                'dark',
                'light',
            ] as const;

            for (const color of colors) {
                const result = IconConfigZod.safeParse({
                    type: 'icon',
                    icon: 'check',
                    color,
                });
                expect(result.success).toBe(true);
            }
        });

        it('should accept all size values', () => {
            const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

            for (const size of sizes) {
                const result = IconConfigZod.safeParse({
                    type: 'icon',
                    icon: 'check',
                    size,
                });
                expect(result.success).toBe(true);
            }
        });

        it('should accept full PARAMS.md example — linked icon with route', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'edit',
                variant: 'primary',
                key: 'id',
                route: 'admin.users.{id}.edit',
            });
            expect(result.success).toBe(true);
        });

        it('should accept PARAMS.md example — framework independent icon', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'eye',
                variant: 'info',
                alt: 'Show',
                title: 'Show details',
                key: 'slug',
                route: 'products/{slug}',
            });
            expect(result.success).toBe(true);
        });

        it('should accept PARAMS.md example — direct class array', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                class: ['fa-regular', 'fa-trash-can', 'ms-1', 'text-danger'],
                alt: 'Destroy',
                title: 'Destroy',
            });
            expect(result.success).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // invalid cases
    // -------------------------------------------------------------------------
    describe('invalid cases', () => {
        it('should reject missing type field', () => {
            const result = IconConfigZod.safeParse({ icon: 'check' });
            expect(result.success).toBe(false);
        });

        it('should reject wrong type value "static"', () => {
            const result = IconConfigZod.safeParse({ type: 'static', icon: 'check' });
            expect(result.success).toBe(false);
        });

        it('should reject wrong type value "badge"', () => {
            const result = IconConfigZod.safeParse({ type: 'badge', icon: 'check' });
            expect(result.success).toBe(false);
        });

        it('should reject empty icon string', () => {
            const result = IconConfigZod.safeParse({ type: 'icon', icon: '' });
            expect(result.success).toBe(false);
        });

        it('should reject type-only config (no icon, no class, no conditions)', () => {
            const result = IconConfigZod.safeParse({ type: 'icon' });
            expect(result.success).toBe(false);

            if (!result.success) {
                const iconError = result.error.issues.find(i => i.path[0] === 'icon');
                expect(iconError).toBeDefined();
                // The superRefine message was extended when `mapping` was introduced — the
                // `mapping` option must also appear in the "one of these is required" list.
                expect(iconError?.message).toContain('"icon", "class" or "mapping" is required');
            }
        });

        it('should reject config with empty if array and no icon/class', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                key: 'status',
                if: [],
            });
            expect(result.success).toBe(false);

            if (!result.success) {
                const iconError = result.error.issues.find(i => i.path[0] === 'icon');
                expect(iconError).toBeDefined();
            }
        });

        it('should reject invalid variant (hex color)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                variant: '#fff',
            });
            expect(result.success).toBe(false);
        });

        it('should accept variant as arbitrary identifier — valid registry key name', () => {
            // 'magenta' is syntactically a valid registry key (letters only, no CSS syntax)
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                variant: 'magenta',
            });
            expect(result.success).toBe(true);
        });

        it('should reject invalid color (hex color)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                color: '#ff0000',
            });
            expect(result.success).toBe(false);
        });

        it('should accept color as arbitrary identifier — valid registry key name', () => {
            // 'red' is syntactically a valid registry key (letters only, no CSS syntax)
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                color: 'red',
            });
            expect(result.success).toBe(true);
        });

        it('should reject invalid size value', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                size: 'huge',
            });
            expect(result.success).toBe(false);
        });

        it('should reject numeric size value', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                size: 24,
            });
            expect(result.success).toBe(false);
        });

        it('should reject non-string icon value', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 123,
            });
            expect(result.success).toBe(false);
        });

        it('should reject non-string alt value', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                alt: 42,
            });
            expect(result.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // conditional config fields (via ConditionalConfigZod merge)
    // -------------------------------------------------------------------------
    describe('conditional config fields', () => {
        it('should accept conditional config without icon/class at root', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                key: 'status',
                if: [
                    { eq: 'active', icon: 'check', variant: 'success' },
                    { eq: 'inactive', icon: 'times', variant: 'danger' },
                ],
                else: { icon: 'question', variant: 'secondary' },
            });
            expect(result.success).toBe(true);
        });

        it('should accept conditional config with only else (no if)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                key: 'active',
                else: { icon: 'times', variant: 'danger' },
            });
            expect(result.success).toBe(true);
        });

        it('should accept conditional config with only if (no else)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                key: 'status',
                if: [{ eq: 'active', icon: 'check' }],
            });
            expect(result.success).toBe(true);
        });

        it('should accept null key', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                key: null,
            });
            expect(result.success).toBe(true);
        });

        it('should accept null if', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                if: null,
            });
            expect(result.success).toBe(true);
        });

        it('should accept null else', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                else: null,
            });
            expect(result.success).toBe(true);
        });

        it('should accept a mapping-only config (no root icon/class needed)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                key: 'status',
                mapping: { active: { icon: 'check', variant: 'success' } },
            });
            expect(result.success).toBe(true);
        });

        it('should let superRefine pass a config with only mapping present', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                key: 'status',
                icon: undefined,
                class: undefined,
                mapping: { active: { icon: 'check' } },
            });
            expect(result.success).toBe(true);
        });

        it('should accept full conditional config alongside formatting fields', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'circle',
                variant: 'primary',
                size: 'sm',
                key: 'status',
                if: [
                    { eq: 'active', icon: 'check-circle', variant: 'success' },
                    { eq: 'pending', icon: 'clock', variant: 'warning' },
                ],
                else: { icon: 'times-circle', variant: 'danger' },
            });
            expect(result.success).toBe(true);
        });

        it('should reject if as non-array (string)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                if: 'not-an-array',
            });
            expect(result.success).toBe(false);
        });

        it('should reject else as array', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                else: [{ variant: 'success' }],
            });
            expect(result.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // edge cases
    // -------------------------------------------------------------------------
    describe('edge cases', () => {
        it('should keep unknown keys via catchall', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                unknown: 'extra',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect((result.data as Record<string, unknown>).unknown).toBe('extra');
            }
        });

        it('should keep data-* attributes via catchall', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'edit',
                'data-user-id': '42',
                'data-action': 'edit',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect((result.data as Record<string, unknown>)['data-user-id']).toBe('42');
                expect((result.data as Record<string, unknown>)['data-action']).toBe('edit');
            }
        });

        it('should sanitize XSS in icon field', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: '<script>alert("xss")</script>check',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.icon).not.toContain('<script>');
            }
        });

        it('should sanitize XSS in alt field', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                alt: '<img src=x onerror=alert(1)>Active',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.alt).not.toContain('<img');
            }
        });

        it('should sanitize XSS in title field', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                title: '<script>xss</script>Tooltip',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.title).not.toContain('<script>');
            }
        });

        it('should sanitize XSS in route field', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'edit',
                route: '<script>xss</script>/users/{id}',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.route).not.toContain('<script>');
            }
        });

        it('should accept icon at max length (250 chars)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'a'.repeat(250),
            });
            expect(result.success).toBe(true);
        });

        it('should reject icon exceeding max length (251 chars)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'a'.repeat(251),
            });
            expect(result.success).toBe(false);
        });

        it('should accept alt at max length (500 chars)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                alt: 'a'.repeat(500),
            });
            expect(result.success).toBe(true);
        });

        it('should reject alt exceeding max length (501 chars)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                alt: 'a'.repeat(501),
            });
            expect(result.success).toBe(false);
        });

        it('should accept title at max length (500 chars)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                title: 'a'.repeat(500),
            });
            expect(result.success).toBe(true);
        });

        it('should reject title exceeding max length (501 chars)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'check',
                title: 'a'.repeat(501),
            });
            expect(result.success).toBe(false);
        });

        it('should accept route at max length (1000 chars)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'edit',
                route: 'a'.repeat(1000),
            });
            expect(result.success).toBe(true);
        });

        it('should reject route exceeding max length (1001 chars)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: 'edit',
                route: 'a'.repeat(1001),
            });
            expect(result.success).toBe(false);
        });

        it('should accept null icon with valid class (icon not required when class present)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: null,
                class: 'fa-solid fa-check',
            });
            expect(result.success).toBe(true);
        });

        it('should reject null icon with null class and no conditionals', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: null,
                class: null,
            });
            expect(result.success).toBe(false);
        });

        it('should reject null icon with null class and empty if array', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: null,
                class: null,
                if: [],
            });
            expect(result.success).toBe(false);
        });

        it('should accept null icon and null class when else is present', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                icon: null,
                class: null,
                else: { icon: 'check' },
            });
            expect(result.success).toBe(true);
        });

        it('should reject an unknown key inside a mapping entry (zod value validation layer)', () => {
            // The zod entry schema is not `.catchall` — an unknown key gets dropped (default strip);
            // here we only check that the mapping entry itself doesn't pass an unknown key back
            // via catchall (the actual key boundary is createConfigValidator's nested strip).
            const result = IconConfigZod.safeParse({
                type: 'icon',
                key: 'status',
                mapping: { active: { icon: 'check', route: '/users/{id}' } },
            });
            expect(result.success).toBe(true);
            if (result.success) {
                const entry = result.data.mapping?.active as Record<string, unknown> | undefined;
                expect(entry).not.toHaveProperty('route');
            }
        });

        it('should reject a mapping entry with `type` (no type-switch via mapping)', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                key: 'status',
                mapping: { active: { icon: 'check', type: 'badge' } },
            });
            expect(result.success).toBe(true);
            if (result.success) {
                const entry = result.data.mapping?.active as Record<string, unknown> | undefined;
                expect(entry).not.toHaveProperty('type');
            }
        });

        it('should reject a mapping entry with an invalid variant', () => {
            const result = IconConfigZod.safeParse({
                type: 'icon',
                key: 'status',
                mapping: { active: { icon: 'check', variant: '#fff' } },
            });
            expect(result.success).toBe(false);
        });

        it('should accept null mapping', () => {
            const result = IconConfigZod.safeParse({ type: 'icon', icon: 'check', mapping: null });
            expect(result.success).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // IconMappingEntryZod
    // -------------------------------------------------------------------------
    describe('IconMappingEntryZod', () => {
        it('should accept a full mapping entry', () => {
            const result = IconMappingEntryZod.safeParse({
                icon: 'check',
                variant: 'success',
                color: 'primary',
                class: 'ms-1',
                title: 'Tooltip',
                alt: 'Alt text',
            });
            expect(result.success).toBe(true);
        });

        it('should accept an empty mapping entry', () => {
            const result = IconMappingEntryZod.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should strip `label` (icon entries are not textual — silently dropped, not catchall)', () => {
            const result = IconMappingEntryZod.safeParse({ icon: 'check', label: 'Ignored' });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).not.toHaveProperty('label');
            }
        });

        it('should strip `type`, `key`, `route`, `if`, `else` (default z.object strip, not catchall)', () => {
            const result = IconMappingEntryZod.safeParse({
                icon: 'check',
                type: 'icon',
                key: 'status',
                route: '/x',
                if: [],
                else: {},
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual({ icon: 'check' });
            }
        });

        it('should reject an invalid variant regex (CSS hex color)', () => {
            const result = IconMappingEntryZod.safeParse({ variant: '#ff0000' });
            expect(result.success).toBe(false);
        });

        it('should reject an invalid color regex (CSS hex color)', () => {
            const result = IconMappingEntryZod.safeParse({ color: '#ff0000' });
            expect(result.success).toBe(false);
        });

        it('should reject a non-string icon', () => {
            const result = IconMappingEntryZod.safeParse({ icon: 42 });
            expect(result.success).toBe(false);
        });
    });
});
