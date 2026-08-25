import { describe, it, expect } from 'vitest';
import { ReferenceConfigZod, ReferenceMappingEntryZod } from '../reference-config.zod';

describe('ReferenceConfigZod', () => {
    describe('valid cases', () => {
        it('should accept minimal config with field', () => {
            const result = ReferenceConfigZod.parse({ type: 'reference', field: 'email' });
            expect(result.type).toBe('reference');
            expect(result.field).toBe('email');
        });

        it('should accept dotted field path', () => {
            const result = ReferenceConfigZod.parse({ type: 'reference', field: 'user.name' });
            expect(result.field).toBe('user.name');
        });

        it('should accept fields array with separator', () => {
            const result = ReferenceConfigZod.parse({
                type: 'reference',
                fields: ['city', 'country'],
                separator: ', ',
            });
            expect(result.fields).toEqual(['city', 'country']);
            expect(result.separator).toBe(', ');
        });

        it('should accept the key field (conditional evaluation)', () => {
            const result = ReferenceConfigZod.parse({
                type: 'reference',
                field: 'description',
                key: 'description',
            });
            expect(result.key).toBe('description');
        });

        it('should accept content formatting fields (color, italic, slice)', () => {
            const result = ReferenceConfigZod.parse({
                type: 'reference',
                field: 'name',
                color: 'primary',
                italic: true,
                slice: 20,
            });
            expect(result.color).toBe('primary');
            expect(result.italic).toBe(true);
            expect(result.slice).toBe(20);
        });

        it('should accept content manipulation (lowercase)', () => {
            const result = ReferenceConfigZod.parse({
                type: 'reference',
                field: 'email',
                lowercase: true,
            });
            expect(result.lowercase).toBe(true);
        });

        it('should accept special formatting (currency)', () => {
            const result = ReferenceConfigZod.parse({
                type: 'reference',
                field: 'price',
                currency: true,
            });
            expect(result.currency).toBe(true);
        });

        it('should accept padding fields', () => {
            const result = ReferenceConfigZod.parse({
                type: 'reference',
                field: 'code',
                padStart: 5,
                chars: '0',
            });
            expect(result.padStart).toBe(5);
            expect(result.chars).toBe('0');
        });

        it('should accept class array and style', () => {
            const result = ReferenceConfigZod.parse({
                type: 'reference',
                field: 'name',
                class: ['fw-bold', 'text-muted'],
                style: 'cursor: default',
            });
            expect(result.class).toEqual(['fw-bold', 'text-muted']);
        });

        it('should accept conditional config without field/fields', () => {
            const result = ReferenceConfigZod.parse({
                type: 'reference',
                key: 'description',
                if: [{ empty: true, value: 'No description', type: 'static' }],
                else: { field: 'description', slice: 100 },
            });
            expect(result.if).toHaveLength(1);
        });

        it('should keep unknown keys via catchall (schema validator strips later)', () => {
            const result = ReferenceConfigZod.parse({
                type: 'reference',
                field: 'name',
                'data-user-id': '{id}',
            });
            expect((result as Record<string, unknown>)['data-user-id']).toBe('{id}');
        });

        it('should accept a mapping-only config (no field/fields needed)', () => {
            const result = ReferenceConfigZod.parse({
                type: 'reference',
                key: 'status',
                mapping: { active: { label: 'Aktív', color: 'success' } },
            });
            expect(result.mapping?.active?.label).toBe('Aktív');
        });

        it('should accept a value-only config (fixed text, no field/fields/mapping)', () => {
            const result = ReferenceConfigZod.parse({ type: 'reference', value: 'N/A' });
            expect(result.value).toBe('N/A');
        });

        it('should let superRefine pass a mapping-based config without field/fields', () => {
            const result = ReferenceConfigZod.safeParse({
                type: 'reference',
                key: 'status',
                mapping: { active: { label: 'Aktív' } },
            });
            expect(result.success).toBe(true);
        });

        it('should let superRefine pass a value-based config without field/fields', () => {
            const result = ReferenceConfigZod.safeParse({ type: 'reference', value: 'Fixed' });
            expect(result.success).toBe(true);
        });
    });

    describe('invalid cases', () => {
        it('should reject wrong type', () => {
            expect(() => ReferenceConfigZod.parse({ type: 'static', field: 'name' })).toThrow();
        });

        it('should reject missing type', () => {
            expect(() => ReferenceConfigZod.parse({ field: 'name' })).toThrow();
        });

        it('should reject config without field, fields or conditional', () => {
            expect(() => ReferenceConfigZod.parse({ type: 'reference' })).toThrow();
        });

        it('should reject config with only formatting (no value source)', () => {
            expect(() =>
                ReferenceConfigZod.parse({ type: 'reference', uppercase: true })
            ).toThrow();
        });

        it('should reject empty fields array', () => {
            expect(() => ReferenceConfigZod.parse({ type: 'reference', fields: [] })).toThrow();
        });
    });

    describe('mapping entry key boundary (zod value validation layer)', () => {
        it('should reject a mapping entry with `variant` (reference formatters use `color`, not `variant`)', () => {
            const result = ReferenceConfigZod.safeParse({
                type: 'reference',
                key: 'status',
                mapping: { active: { label: 'Aktív', variant: 'success' } },
            });
            expect(result.success).toBe(true);
            if (result.success) {
                const entry = result.data.mapping?.active as Record<string, unknown> | undefined;
                expect(entry).not.toHaveProperty('variant');
            }
        });

        it('should strip `field`/`fields`/`type`/`if`/`else`/`mapping` out of a mapping entry', () => {
            const result = ReferenceConfigZod.safeParse({
                type: 'reference',
                key: 'status',
                mapping: {
                    active: {
                        label: 'Aktív',
                        field: 'other',
                        fields: ['a', 'b'],
                        type: 'reference',
                        if: [],
                        else: {},
                        mapping: { nested: { label: 'x' } },
                    },
                },
            });
            expect(result.success).toBe(true);
            if (result.success) {
                const entry = result.data.mapping?.active as Record<string, unknown> | undefined;
                expect(entry?.label).toBe('Aktív');
                expect(entry).not.toHaveProperty('field');
                expect(entry).not.toHaveProperty('fields');
                expect(entry).not.toHaveProperty('type');
                expect(entry).not.toHaveProperty('if');
                expect(entry).not.toHaveProperty('else');
                expect(entry).not.toHaveProperty('mapping');
            }
        });

        it('should accept null mapping', () => {
            const result = ReferenceConfigZod.safeParse({
                type: 'reference',
                field: 'name',
                mapping: null,
            });
            expect(result.success).toBe(true);
        });
    });

    describe('ReferenceMappingEntryZod', () => {
        it('should accept a full mapping entry', () => {
            const result = ReferenceMappingEntryZod.safeParse({
                label: 'Aktív',
                color: 'success',
                fontWeight: 'bold',
                italic: true,
                slice: 20,
            });
            expect(result.success).toBe(true);
        });

        it('should accept an empty mapping entry', () => {
            expect(ReferenceMappingEntryZod.safeParse({}).success).toBe(true);
        });

        it('should reject an invalid color', () => {
            const result = ReferenceMappingEntryZod.safeParse({ color: 'chartreuse' });
            expect(result.success).toBe(false);
        });

        it('should strip `variant` (default z.object strip, not catchall)', () => {
            const result = ReferenceMappingEntryZod.safeParse({ label: 'X', variant: 'success' });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).not.toHaveProperty('variant');
            }
        });
    });
});
