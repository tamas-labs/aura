import { describe, it, expect } from 'vitest';
import { LinkConfigZod } from '../link-config.zod';

describe('LinkConfigZod', () => {
    describe('valid cases', () => {
        it('should accept minimal config with field', () => {
            const result = LinkConfigZod.parse({ type: 'link', field: 'name' });
            expect(result.type).toBe('link');
            expect(result.field).toBe('name');
        });

        it('should accept config with value (static mode)', () => {
            const result = LinkConfigZod.parse({ type: 'link', value: 'View Profile' });
            expect(result.value).toBe('View Profile');
        });

        it('should accept config with route only', () => {
            const result = LinkConfigZod.parse({ type: 'link', route: '/users/{id}' });
            expect(result.route).toBe('/users/{id}');
        });

        it('should accept full config (field + key + route + link attrs)', () => {
            const result = LinkConfigZod.parse({
                type: 'link',
                field: 'name',
                key: 'id',
                route: '/users/{id}',
                target: '_blank',
                rel: 'noopener',
                title: 'Open profile',
            });
            expect(result.key).toBe('id');
            expect(result.target).toBe('_blank');
            expect(result.rel).toBe('noopener');
            expect(result.title).toBe('Open profile');
        });

        it('should accept all target enum values', () => {
            for (const target of ['_blank', '_self', '_parent', '_top'] as const) {
                expect(() =>
                    LinkConfigZod.parse({ type: 'link', field: 'x', target })
                ).not.toThrow();
            }
        });

        it('should accept formatting fields (color, variant, italic, slice)', () => {
            const result = LinkConfigZod.parse({
                type: 'link',
                field: 'name',
                color: 'primary',
                variant: 'danger',
                italic: true,
                slice: 20,
            });
            expect(result.color).toBe('primary');
            expect(result.variant).toBe('danger');
            expect(result.italic).toBe(true);
            expect(result.slice).toBe(20);
        });

        it('should accept CSS color value for color', () => {
            const result = LinkConfigZod.parse({ type: 'link', field: 'x', color: '#ff0000' });
            expect(result.color).toBe('#ff0000');
        });

        it('should accept special formatting (currency, date, phone, unit)', () => {
            const result = LinkConfigZod.parse({
                type: 'link',
                field: 'price',
                currency: true,
            });
            expect(result.currency).toBe(true);
        });

        it('should accept class array and style', () => {
            const result = LinkConfigZod.parse({
                type: 'link',
                field: 'name',
                class: ['text-info', 'text-decoration-none'],
                style: 'cursor: pointer',
            });
            expect(result.class).toEqual(['text-info', 'text-decoration-none']);
        });

        it('should accept conditional config without field/value/route', () => {
            const result = LinkConfigZod.parse({
                type: 'link',
                key: 'role',
                if: [{ eq: 'admin', route: '/admin/users/{id}' }],
                else: { route: '/users/{id}' },
            });
            expect(result.if).toHaveLength(1);
        });

        it('should keep unknown keys via catchall (schema validator strips later)', () => {
            const result = LinkConfigZod.parse({
                type: 'link',
                field: 'name',
                'data-user-id': '{id}',
            });
            expect((result as Record<string, unknown>)['data-user-id']).toBe('{id}');
        });
    });

    describe('invalid cases', () => {
        it('should reject wrong type', () => {
            expect(() => LinkConfigZod.parse({ type: 'icon', field: 'name' })).toThrow();
        });

        it('should reject missing type', () => {
            expect(() => LinkConfigZod.parse({ field: 'name' })).toThrow();
        });

        it('should reject config without field, value, route or conditional', () => {
            expect(() => LinkConfigZod.parse({ type: 'link' })).toThrow();
        });

        it('should reject config with only title (no content source)', () => {
            expect(() => LinkConfigZod.parse({ type: 'link', title: 'x' })).toThrow();
        });

        it('should reject invalid target value', () => {
            expect(() =>
                LinkConfigZod.parse({ type: 'link', field: 'x', target: '_new' })
            ).toThrow();
        });

        it('should reject variant with invalid characters (CSS color)', () => {
            expect(() =>
                LinkConfigZod.parse({ type: 'link', field: 'x', variant: '#fff' })
            ).toThrow();
        });
    });

    describe('mapping (presentation-only)', () => {
        it('should accept a mapping with presentation entries', () => {
            const result = LinkConfigZod.parse({
                type: 'link',
                field: 'status',
                mapping: {
                    active: { variant: 'success', route: '/activate/{id}' },
                    inactive: { variant: 'secondary', target: '_blank', rel: 'noopener' },
                },
            });
            expect(result.mapping?.active?.variant).toBe('success');
            expect(result.mapping?.inactive?.target).toBe('_blank');
        });

        it('should satisfy superRefine via mapping alone', () => {
            const result = LinkConfigZod.parse({
                type: 'link',
                field: 'status',
                mapping: { active: { variant: 'success' } },
            });
            expect(result.type).toBe('link');
        });

        it('should strip a label alias from the entry (presentation-only, no label/value)', () => {
            const result = LinkConfigZod.parse({
                type: 'link',
                field: 'status',
                mapping: { active: { label: 'View', variant: 'success' } },
            });
            expect(result.mapping?.active).not.toHaveProperty('label');
            expect(result.mapping?.active?.variant).toBe('success');
        });

        it('should reject a mapping entry with an invalid target enum', () => {
            expect(() =>
                LinkConfigZod.parse({
                    type: 'link',
                    field: 'status',
                    mapping: { active: { target: '_new' } },
                })
            ).toThrow();
        });
    });
});
