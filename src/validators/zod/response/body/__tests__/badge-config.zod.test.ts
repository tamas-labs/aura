import { describe, it, expect } from 'vitest';
import { BadgeConfigZod, BadgeMappingValueZod } from '../badge-config.zod';

describe('BadgeConfigZod', () => {
    describe('valid cases', () => {
        it('should accept minimal config with field', () => {
            const result = BadgeConfigZod.parse({ type: 'badge', field: 'status' });
            expect(result.type).toBe('badge');
            expect(result.field).toBe('status');
        });

        it('should accept a static value badge', () => {
            const result = BadgeConfigZod.parse({ type: 'badge', value: 'ÚJ', variant: 'danger' });
            expect(result.value).toBe('ÚJ');
            expect(result.variant).toBe('danger');
        });

        it('should accept a mapping-only badge', () => {
            const result = BadgeConfigZod.parse({
                type: 'badge',
                mapping: { high: { variant: 'danger', label: 'Magas' } },
            });
            expect(result.mapping?.high?.variant).toBe('danger');
        });

        it('should accept a trueValue/falseValue boolean badge', () => {
            const result = BadgeConfigZod.parse({
                type: 'badge',
                trueValue: { label: 'Yes', variant: 'success', icon: 'check' },
                falseValue: { label: 'No', variant: 'warning' },
            });
            expect(result.trueValue?.label).toBe('Yes');
            expect(result.falseValue?.variant).toBe('warning');
        });

        it('should accept counter fields (showZero, maxValue, suffix, prefix)', () => {
            const result = BadgeConfigZod.parse({
                type: 'badge',
                field: 'count',
                showZero: false,
                maxValue: 99,
                suffix: '+',
                prefix: '#',
            });
            expect(result.showZero).toBe(false);
            expect(result.maxValue).toBe(99);
            expect(result.suffix).toBe('+');
            expect(result.prefix).toBe('#');
        });

        it('should accept style flags (variant, pill, size)', () => {
            const result = BadgeConfigZod.parse({
                type: 'badge',
                value: 'X',
                variant: 'info',
                pill: true,
                size: 'sm',
            });
            expect(result.pill).toBe(true);
            expect(result.size).toBe('sm');
        });

        it('should accept icon and iconPosition', () => {
            const result = BadgeConfigZod.parse({
                type: 'badge',
                value: 'X',
                icon: 'check',
                iconPosition: 'end',
            });
            expect(result.icon).toBe('check');
            expect(result.iconPosition).toBe('end');
        });

        it('should accept content formatting fields (static-parity)', () => {
            const result = BadgeConfigZod.parse({
                type: 'badge',
                field: 'status',
                color: 'primary',
                uppercase: true,
                slice: 20,
                padStart: 5,
                chars: '0',
            });
            expect(result.color).toBe('primary');
            expect(result.uppercase).toBe(true);
            expect(result.slice).toBe(20);
        });

        it('should accept conditional config without field/value/mapping/boolean', () => {
            const result = BadgeConfigZod.parse({
                type: 'badge',
                key: 'status',
                if: [{ empty: true, value: 'N/A', type: 'static' }],
                else: { value: 'OK', variant: 'success' },
            });
            expect(result.if).toHaveLength(1);
        });

        it('should keep unknown keys via catchall (schema validator strips later)', () => {
            const result = BadgeConfigZod.parse({
                type: 'badge',
                value: 'X',
                'data-count': '{count}',
            });
            expect((result as Record<string, unknown>)['data-count']).toBe('{count}');
        });
    });

    describe('invalid cases', () => {
        it('should reject wrong type', () => {
            expect(() => BadgeConfigZod.parse({ type: 'link', field: 'name' })).toThrow();
        });

        it('should reject missing type', () => {
            expect(() => BadgeConfigZod.parse({ field: 'status' })).toThrow();
        });

        it('should reject config without any content source or conditional', () => {
            expect(() => BadgeConfigZod.parse({ type: 'badge' })).toThrow();
        });

        it('should reject config with only styling (no content source)', () => {
            expect(() =>
                BadgeConfigZod.parse({ type: 'badge', variant: 'primary', pill: true })
            ).toThrow();
        });

        it('should reject an invalid variant (non-bootstrap color)', () => {
            expect(() =>
                BadgeConfigZod.parse({ type: 'badge', value: 'X', variant: 'purple' })
            ).toThrow();
        });

        it('should reject an invalid size', () => {
            expect(() =>
                BadgeConfigZod.parse({ type: 'badge', value: 'X', size: 'huge' })
            ).toThrow();
        });

        it('should reject a non-numeric maxValue', () => {
            expect(() =>
                BadgeConfigZod.parse({ type: 'badge', field: 'count', maxValue: 'lots' })
            ).toThrow();
        });
    });

    describe('BadgeMappingValueZod', () => {
        it('should accept a full mapping entry', () => {
            const result = BadgeMappingValueZod.parse({
                label: 'Magas',
                variant: 'danger',
                icon: 'fire',
                class: 'fw-bold',
            });
            expect(result.label).toBe('Magas');
            expect(result.variant).toBe('danger');
        });

        it('should accept an empty mapping entry', () => {
            expect(() => BadgeMappingValueZod.parse({})).not.toThrow();
        });

        it('should reject an invalid variant in a mapping entry', () => {
            expect(() => BadgeMappingValueZod.parse({ variant: 'chartreuse' })).toThrow();
        });

        it('should strip an unknown key (no longer `.catchall` — default z.object strip)', () => {
            const result = BadgeMappingValueZod.safeParse({
                label: 'Magas',
                unknownKey: 'should-be-gone',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).not.toHaveProperty('unknownKey');
                expect(result.data.label).toBe('Magas');
            }
        });

        it('should strip `type` (no type-switch via a mapping entry)', () => {
            const result = BadgeMappingValueZod.safeParse({ label: 'X', type: 'icon' });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).not.toHaveProperty('type');
            }
        });

        it('should strip data-* attributes (not allowed inside a mapping entry at the zod layer)', () => {
            const result = BadgeMappingValueZod.safeParse({ label: 'X', 'data-id': '42' });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).not.toHaveProperty('data-id');
            }
        });
    });
});
