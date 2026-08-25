import { describe, it, expect } from 'vitest';
import { StaticConfigZod } from '../static-config.zod';

describe('StaticConfigZod', () => {
    describe('valid cases', () => {
        it('should accept minimal config with type and value', () => {
            const result = StaticConfigZod.safeParse({ type: 'static', value: 'ID:' });
            expect(result.success).toBe(true);
        });

        it('should accept config with formatting fields', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'active',
                color: 'success',
                align: 'end',
                class: ['badge', 'bg-success'],
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with content manipulation fields', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'electronics and gadgets',
                uppercase: true,
                lowercase: false,
                capitalize: false,
                monospace: false,
                slice: 25,
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with special formatting fields', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: '1000',
                number: true,
                currency: true,
                date: false,
                phone: false,
                unit: 'percent',
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with padding fields', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: '42',
                padStart: 5,
                padEnd: 3,
                chars: '0',
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with all fields combined (PARAMS.md example)', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: '42',
                number: true,
                padStart: 5,
                chars: '0',
                class: 'font-monospace',
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with free-form unit strings', () => {
            const units = ['GB', '°C', 'km/h', 'kg', '%'];
            for (const unit of units) {
                const result = StaticConfigZod.safeParse({ type: 'static', value: 'x', unit });
                expect(result.success).toBe(true);
            }
        });

        it('should accept config with key field', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'USR',
                key: 'id',
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with style field', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                style: 'color: red;',
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with null on optional fields', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                color: null,
                align: null,
                slice: null,
                number: null,
                currency: null,
                date: null,
                phone: null,
                unit: null,
                padStart: null,
                padEnd: null,
                chars: null,
                key: null,
                class: null,
                style: null,
            });
            expect(result.success).toBe(true);
        });
    });

    describe('invalid cases', () => {
        it('should reject missing type field', () => {
            const result = StaticConfigZod.safeParse({ value: 'test' });
            expect(result.success).toBe(false);
        });

        it('should accept missing value when using conditional if/else config', () => {
            // value is optional at root level — it lives inside if/else branches
            const result = StaticConfigZod.safeParse({
                type: 'static',
                key: 'id',
                if: [{ bigger: 5, value: 'ID:', class: ['fw-bold'] }],
                else: { value: 'id' },
            });
            expect(result.success).toBe(true);
        });

        it('should reject type-only static config (no value, no conditions)', () => {
            // superRefine: value is required IF neither if nor else is provided
            const result = StaticConfigZod.safeParse({ type: 'static' });
            expect(result.success).toBe(false);

            if (!result.success) {
                const valuError = result.error.issues.find(i => i.path[0] === 'value');
                expect(valuError).toBeDefined();
            }
        });

        it('should reject wrong type value "icon"', () => {
            const result = StaticConfigZod.safeParse({ type: 'icon', value: 'test' });
            expect(result.success).toBe(false);
        });

        it('should reject wrong type value "badge"', () => {
            const result = StaticConfigZod.safeParse({ type: 'badge', value: 'test' });
            expect(result.success).toBe(false);
        });

        it('should reject empty value string', () => {
            const result = StaticConfigZod.safeParse({ type: 'static', value: '' });
            expect(result.success).toBe(false);
        });

        it('should reject invalid color (hex not allowed)', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                color: '#fff',
            });
            expect(result.success).toBe(false);
        });

        it('should reject invalid color (arbitrary CSS name)', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                color: 'red',
            });
            expect(result.success).toBe(false);
        });

        it('should reject invalid align value', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                align: 'left',
            });
            expect(result.success).toBe(false);
        });

        it('should reject non-integer slice value', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                slice: 5.5,
            });
            expect(result.success).toBe(false);
        });

        it('should reject slice value below minimum (0)', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                slice: 0,
            });
            expect(result.success).toBe(false);
        });

        it('should reject padStart value exceeding maximum (101)', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                padStart: 101,
            });
            expect(result.success).toBe(false);
        });

        it('should reject empty unit string', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                unit: '',
            });
            expect(result.success).toBe(false);
        });

        it('should reject empty chars string', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                chars: '',
            });
            expect(result.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // new visual formatting fields (background, fontSize, fontWeight, italic, lineHeight, text)
    // -------------------------------------------------------------------------
    describe('visual formatting fields', () => {
        describe('background', () => {
            it('should accept Bootstrap color', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    background: 'success',
                });
                expect(result.success).toBe(true);
            });

            it('should accept hex color', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    background: '#e0e0e0',
                });
                expect(result.success).toBe(true);
            });

            it('should accept CSS color name', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    background: 'red',
                });
                expect(result.success).toBe(true);
            });

            it('should accept null background', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    background: null,
                });
                expect(result.success).toBe(true);
            });

            it('should reject number background', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    background: 123,
                });
                expect(result.success).toBe(false);
            });
        });

        describe('fontSize', () => {
            it('should accept px value', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    fontSize: '14px',
                });
                expect(result.success).toBe(true);
            });

            it('should accept rem value', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    fontSize: '1.5rem',
                });
                expect(result.success).toBe(true);
            });

            it('should accept keyword value', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    fontSize: 'small',
                });
                expect(result.success).toBe(true);
            });

            it('should accept null fontSize', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    fontSize: null,
                });
                expect(result.success).toBe(true);
            });

            it('should reject invalid fontSize string', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    fontSize: 'big',
                });
                expect(result.success).toBe(false);
            });

            it('should reject number fontSize', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    fontSize: 14,
                });
                expect(result.success).toBe(false);
            });
        });

        describe('fontWeight', () => {
            it('should accept number 700', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    fontWeight: 700,
                });
                expect(result.success).toBe(true);
            });

            it('should accept string bold', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    fontWeight: 'bold',
                });
                expect(result.success).toBe(true);
            });

            it('should accept null fontWeight', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    fontWeight: null,
                });
                expect(result.success).toBe(true);
            });

            it('should reject non-100-multiple number (150)', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    fontWeight: 150,
                });
                expect(result.success).toBe(false);
            });

            it('should reject out of range number (1000)', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    fontWeight: 1000,
                });
                expect(result.success).toBe(false);
            });

            it('should reject invalid string keyword', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    fontWeight: 'heavy',
                });
                expect(result.success).toBe(false);
            });
        });

        describe('italic', () => {
            it('should accept true', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    italic: true,
                });
                expect(result.success).toBe(true);
            });

            it('should accept false', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    italic: false,
                });
                expect(result.success).toBe(true);
            });

            it('should accept null', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    italic: null,
                });
                expect(result.success).toBe(true);
            });

            it('should reject string', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    italic: 'yes',
                });
                expect(result.success).toBe(false);
            });
        });

        describe('lineHeight', () => {
            it('should accept unitless string', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    lineHeight: '1.5',
                });
                expect(result.success).toBe(true);
            });

            it('should accept px value', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    lineHeight: '24px',
                });
                expect(result.success).toBe(true);
            });

            it('should accept number value', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    lineHeight: 1.5,
                });
                expect(result.success).toBe(true);
            });

            it('should accept normal keyword', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    lineHeight: 'normal',
                });
                expect(result.success).toBe(true);
            });

            it('should accept null lineHeight', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    lineHeight: null,
                });
                expect(result.success).toBe(true);
            });

            it('should reject invalid string', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    lineHeight: 'wide',
                });
                expect(result.success).toBe(false);
            });
        });

        describe('text', () => {
            it('should accept text-truncate', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    text: 'text-truncate',
                });
                expect(result.success).toBe(true);
            });

            it('should accept text-nowrap', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    text: 'text-nowrap',
                });
                expect(result.success).toBe(true);
            });

            it('should accept null text', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    text: null,
                });
                expect(result.success).toBe(true);
            });

            it('should reject non-text- prefixed class', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    text: 'bg-primary',
                });
                expect(result.success).toBe(false);
            });

            it('should reject empty string', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    text: '',
                });
                expect(result.success).toBe(false);
            });
        });

        describe('combined visual formatting', () => {
            it('should accept all visual fields together', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'styled label',
                    color: 'primary',
                    background: 'light',
                    fontSize: '14px',
                    fontWeight: 700,
                    italic: true,
                    lineHeight: '1.5',
                    text: 'text-truncate',
                });
                expect(result.success).toBe(true);
            });

            it('should accept all null visual fields', () => {
                const result = StaticConfigZod.safeParse({
                    type: 'static',
                    value: 'test',
                    background: null,
                    fontSize: null,
                    fontWeight: null,
                    italic: null,
                    lineHeight: null,
                    text: null,
                });
                expect(result.success).toBe(true);
            });
        });
    });

    describe('edge cases', () => {
        it('should keep unknown keys via catchall', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                unknown: 'extra',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect((result.data as Record<string, unknown>).unknown).toBe('extra');
            }
        });

        it('should keep data-* attributes', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                'data-id': '123',
                'data-label': 'foo',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect((result.data as Record<string, unknown>)['data-id']).toBe('123');
            }
        });

        it('should sanitize XSS in value field', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: '<script>alert("xss")</script>',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.value).not.toContain('<script>');
            }
        });

        it('should sanitize XSS in unit field', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                unit: '<img src=x onerror=alert(1)>kg',
            });
            expect(result.success).toBe(true);
            if (result.success) {
                expect((result.data as Record<string, unknown>).unit).not.toContain('<img');
            }
        });

        it('should accept value at max length (1000 chars)', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'a'.repeat(1000),
            });
            expect(result.success).toBe(true);
        });

        it('should reject value exceeding max length (1001 chars)', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'a'.repeat(1001),
            });
            expect(result.success).toBe(false);
        });

        it('should accept padStart value of 0', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                padStart: 0,
            });
            expect(result.success).toBe(true);
        });
    });

    describe('conditional config fields (via ConditionalConfigZod merge)', () => {
        it('should accept key field (provided by merge)', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'USR',
                key: 'id',
            });
            expect(result.success).toBe(true);
        });

        it('should accept null key (nullable via merge)', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                key: null,
            });
            expect(result.success).toBe(true);
        });

        it('should accept if field with condition array', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'Default',
                key: 'status',
                if: [{ eq: 'active', value: 'Active' }],
            });
            expect(result.success).toBe(true);
        });

        it('should accept null for if field', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'Default',
                key: 'status',
                if: null,
            });
            expect(result.success).toBe(true);
        });

        it('should accept else field with fallback config', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'Default',
                key: 'status',
                if: [{ eq: 'active', value: 'Active' }],
                else: { value: 'Unknown' },
            });
            expect(result.success).toBe(true);
        });

        it('should accept null for else field', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'Default',
                key: 'status',
                if: [{ eq: 'active', value: 'Active' }],
                else: null,
            });
            expect(result.success).toBe(true);
        });

        it('should accept full conditional config alongside formatting fields', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'Label',
                color: 'success',
                uppercase: true,
                key: 'status',
                if: [
                    { eq: 'active', value: 'Active', color: 'success' },
                    { eq: 'pending', value: 'Pending', color: 'warning' },
                ],
                else: { value: 'Unknown', color: 'secondary' },
            });
            expect(result.success).toBe(true);
        });

        it('should reject if as non-array (string)', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                if: 'not-an-array',
            });
            expect(result.success).toBe(false);
        });

        it('should reject else as array', () => {
            const result = StaticConfigZod.safeParse({
                type: 'static',
                value: 'test',
                else: [{ variant: 'success' }],
            });
            expect(result.success).toBe(false);
        });
    });
});
