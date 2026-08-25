import { describe, it, expect } from 'vitest';
import { ButtonConfigZod } from '../button-config.zod';

describe('ButtonConfigZod', () => {
    describe('valid cases', () => {
        it('should accept minimal config with field', () => {
            const result = ButtonConfigZod.parse({ type: 'button', field: 'name' });
            expect(result.type).toBe('button');
            expect(result.field).toBe('name');
        });

        it('should accept a static value button', () => {
            const result = ButtonConfigZod.parse({ type: 'button', value: 'Details' });
            expect(result.value).toBe('Details');
        });

        it('should accept a route-only navigation button', () => {
            const result = ButtonConfigZod.parse({ type: 'button', route: '/users/{id}/edit' });
            expect(result.route).toBe('/users/{id}/edit');
        });

        it('should accept an icon-only button', () => {
            const result = ButtonConfigZod.parse({ type: 'button', icon: 'cog' });
            expect(result.icon).toBe('cog');
        });

        it('should accept style flags (variant, size, rounded, pill)', () => {
            const result = ButtonConfigZod.parse({
                type: 'button',
                value: 'X',
                variant: 'outline-secondary',
                size: 'sm',
                rounded: true,
                pill: true,
            });
            expect(result.variant).toBe('outline-secondary');
            expect(result.size).toBe('sm');
            expect(result.rounded).toBe(true);
            expect(result.pill).toBe(true);
        });

        it('should accept iconPosition and htmlType enums', () => {
            const result = ButtonConfigZod.parse({
                type: 'button',
                value: 'Save',
                icon: 'save',
                iconPosition: 'end',
                htmlType: 'submit',
            });
            expect(result.iconPosition).toBe('end');
            expect(result.htmlType).toBe('submit');
        });

        it('should accept disabled and title', () => {
            const result = ButtonConfigZod.parse({
                type: 'button',
                value: 'X',
                disabled: true,
                title: 'Tooltip',
            });
            expect(result.disabled).toBe(true);
            expect(result.title).toBe('Tooltip');
        });

        it('should accept content formatting fields (static-parity)', () => {
            const result = ButtonConfigZod.parse({
                type: 'button',
                field: 'name',
                color: 'primary',
                uppercase: true,
                slice: 20,
                padStart: 5,
                chars: '0',
            });
            expect(result.color).toBe('primary');
            expect(result.uppercase).toBe(true);
            expect(result.slice).toBe(20);
            expect(result.padStart).toBe(5);
        });

        it('should accept conditional config without field/value/route/icon', () => {
            const result = ButtonConfigZod.parse({
                type: 'button',
                key: 'status',
                if: [{ empty: true, value: 'N/A', type: 'static' }],
                else: { value: 'Edit', route: '/x/{id}' },
            });
            expect(result.if).toHaveLength(1);
        });

        it('should keep unknown keys via catchall (schema validator strips later)', () => {
            const result = ButtonConfigZod.parse({
                type: 'button',
                value: 'X',
                'data-user-id': '{id}',
            });
            expect((result as Record<string, unknown>)['data-user-id']).toBe('{id}');
        });
    });

    describe('invalid cases', () => {
        it('should reject wrong type', () => {
            expect(() => ButtonConfigZod.parse({ type: 'link', field: 'name' })).toThrow();
        });

        it('should reject missing type', () => {
            expect(() => ButtonConfigZod.parse({ field: 'name' })).toThrow();
        });

        it('should reject config without field/value/route/icon or conditional', () => {
            expect(() => ButtonConfigZod.parse({ type: 'button' })).toThrow();
        });

        it('should reject config with only styling (no content source)', () => {
            expect(() =>
                ButtonConfigZod.parse({ type: 'button', variant: 'primary', size: 'lg' })
            ).toThrow();
        });

        it('should reject an invalid size', () => {
            expect(() =>
                ButtonConfigZod.parse({ type: 'button', value: 'X', size: 'huge' })
            ).toThrow();
        });

        it('should reject an invalid htmlType', () => {
            expect(() =>
                ButtonConfigZod.parse({ type: 'button', value: 'X', htmlType: 'link' })
            ).toThrow();
        });
    });

    describe('mapping (presentation-only)', () => {
        it('should accept a mapping with presentation entries', () => {
            const result = ButtonConfigZod.parse({
                type: 'button',
                field: 'state',
                mapping: {
                    locked: { variant: 'danger', disabled: true, icon: 'lock', size: 'sm' },
                    open: { variant: 'success', rounded: true },
                },
            });
            expect(result.mapping?.locked?.disabled).toBe(true);
            expect(result.mapping?.locked?.icon).toBe('lock');
            expect(result.mapping?.open?.variant).toBe('success');
        });

        it('should satisfy superRefine via mapping alone', () => {
            const result = ButtonConfigZod.parse({
                type: 'button',
                field: 'state',
                mapping: { locked: { variant: 'danger' } },
            });
            expect(result.type).toBe('button');
        });

        it('should strip a label alias from the entry (presentation-only, no label/value)', () => {
            const result = ButtonConfigZod.parse({
                type: 'button',
                field: 'state',
                mapping: { locked: { label: 'Locked', variant: 'danger' } },
            });
            expect(result.mapping?.locked).not.toHaveProperty('label');
            expect(result.mapping?.locked?.variant).toBe('danger');
        });

        it('should reject a mapping entry with an invalid size enum', () => {
            expect(() =>
                ButtonConfigZod.parse({
                    type: 'button',
                    field: 'state',
                    mapping: { locked: { size: 'huge' } },
                })
            ).toThrow();
        });
    });
});
