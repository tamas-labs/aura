import { describe, it, expect } from 'vitest';
import { CustomConfigZod, CustomTemplateParamsZod } from '../custom-config.zod';

describe('CustomConfigZod', () => {
    describe('type', () => {
        it('accepts type "custom"', () => {
            expect(CustomConfigZod.safeParse({ type: 'custom', field: 'x' }).success).toBe(true);
        });

        it('rejects a wrong type', () => {
            expect(CustomConfigZod.safeParse({ type: 'static', field: 'x' }).success).toBe(false);
        });
    });

    describe('rendering modes (superRefine)', () => {
        it('accepts renderer mode', () => {
            expect(CustomConfigZod.safeParse({ type: 'custom', renderer: 'r' }).success).toBe(true);
        });

        it('accepts callback mode', () => {
            expect(CustomConfigZod.safeParse({ type: 'custom', callback: 'c' }).success).toBe(true);
        });

        it('accepts template mode', () => {
            expect(
                CustomConfigZod.safeParse({ type: 'custom', template: '<b>{value}</b>' }).success
            ).toBe(true);
        });

        it('accepts field/fields/value sources', () => {
            expect(CustomConfigZod.safeParse({ type: 'custom', field: 'x' }).success).toBe(true);
            expect(CustomConfigZod.safeParse({ type: 'custom', fields: ['a', 'b'] }).success).toBe(
                true
            );
            expect(CustomConfigZod.safeParse({ type: 'custom', value: 'N/A' }).success).toBe(true);
        });

        it('accepts conditional if/else without an explicit source', () => {
            expect(
                CustomConfigZod.safeParse({
                    type: 'custom',
                    if: [{ empty: true, value: 'N/A', type: 'static' }],
                }).success
            ).toBe(true);
        });

        it('rejects when no renderer/callback/template/field/fields/value/if/else', () => {
            expect(CustomConfigZod.safeParse({ type: 'custom' }).success).toBe(false);
        });
    });

    describe('params', () => {
        it('accepts an arbitrary params object', () => {
            expect(
                CustomConfigZod.safeParse({
                    type: 'custom',
                    field: 'x',
                    callback: 'c',
                    params: { currency: 'HUF', nested: { a: 1 } },
                }).success
            ).toBe(true);
        });
    });

    describe('mapping (template-parameter dialect)', () => {
        it('accepts primitive-valued entries', () => {
            expect(
                CustomConfigZod.safeParse({
                    type: 'custom',
                    field: 'status',
                    template: '{icon}',
                    mapping: { active: { icon: '✓', class: 'text-success', count: 3, on: true } },
                }).success
            ).toBe(true);
        });

        it('rejects a non-primitive (object) entry value', () => {
            expect(
                CustomConfigZod.safeParse({
                    type: 'custom',
                    field: 'status',
                    template: '{icon}',
                    mapping: { active: { icon: { nested: 'bad' } } },
                }).success
            ).toBe(false);
        });
    });

    describe('CustomTemplateParamsZod', () => {
        it('accepts string/number/boolean/null values', () => {
            expect(
                CustomTemplateParamsZod.safeParse({ a: 's', b: 1, c: true, d: null }).success
            ).toBe(true);
        });

        it('rejects array values', () => {
            expect(CustomTemplateParamsZod.safeParse({ a: ['x'] }).success).toBe(false);
        });
    });
});
