import { describe, it, expect } from 'vitest';
import { ProgressConfigZod, ProgressMappingValueZod, ProgressBarZod } from '../progress-config.zod';

describe('ProgressConfigZod', () => {
    describe('valid cases', () => {
        it('should accept a minimal field config', () => {
            const result = ProgressConfigZod.parse({ type: 'progress', field: 'completionRate' });
            expect(result.type).toBe('progress');
            expect(result.field).toBe('completionRate');
        });

        it('should accept a static numeric value config', () => {
            const result = ProgressConfigZod.parse({
                type: 'progress',
                value: 65,
                variant: 'warning',
            });
            expect(result.value).toBe(65);
            expect(result.variant).toBe('warning');
        });

        it('should accept a numeric or field-name max', () => {
            expect(ProgressConfigZod.parse({ type: 'progress', field: 'v', max: 200 }).max).toBe(
                200
            );
            expect(
                ProgressConfigZod.parse({ type: 'progress', field: 'v', max: 'total' }).max
            ).toBe('total');
        });

        it('should accept a range mapping', () => {
            const result = ProgressConfigZod.parse({
                type: 'progress',
                field: 'p',
                mapping: { '0-25': { variant: 'danger', label: 'Kezdeti' } },
            });
            expect(result.mapping?.['0-25']?.variant).toBe('danger');
        });

        it('should accept thresholds as variant → tuple', () => {
            const result = ProgressConfigZod.parse({
                type: 'progress',
                field: 'cpu',
                thresholds: { success: [0, 50], danger: [81, 100] },
            });
            expect(result.thresholds?.success).toEqual([0, 50]);
        });

        it('should accept a stacked bars config', () => {
            const result = ProgressConfigZod.parse({
                type: 'progress',
                stacked: true,
                bars: [{ field: 'a', variant: 'success', label: 'Kész' }],
            });
            expect(result.bars?.[0]?.field).toBe('a');
        });

        it('should accept boolean or string label', () => {
            expect(
                ProgressConfigZod.parse({ type: 'progress', field: 'v', label: true }).label
            ).toBe(true);
            expect(
                ProgressConfigZod.parse({ type: 'progress', field: 'v', label: '{value}%' }).label
            ).toBe('{value}%');
        });

        it('should accept a config with only if/else branches (conditional)', () => {
            const result = ProgressConfigZod.parse({
                type: 'progress',
                if: [{ field: 'v', operator: 'gt', value: 50, then: { variant: 'success' } }],
            });
            expect(result.type).toBe('progress');
        });
    });

    describe('invalid cases', () => {
        it('should reject a wrong type', () => {
            expect(() => ProgressConfigZod.parse({ type: 'badge', field: 'v' })).toThrow();
        });

        it('should reject when no field/value/stacked+bars and no conditional', () => {
            expect(() => ProgressConfigZod.parse({ type: 'progress' })).toThrow();
        });

        it('should reject stacked:true without bars', () => {
            expect(() => ProgressConfigZod.parse({ type: 'progress', stacked: true })).toThrow();
        });

        it('should reject an invalid threshold variant key', () => {
            expect(() =>
                ProgressConfigZod.parse({
                    type: 'progress',
                    field: 'v',
                    thresholds: { neon: [0, 50] },
                })
            ).toThrow();
        });

        it('should reject a threshold tuple that is not [number, number]', () => {
            expect(() =>
                ProgressConfigZod.parse({
                    type: 'progress',
                    field: 'v',
                    thresholds: { success: [0] },
                })
            ).toThrow();
        });
    });

    describe('catchall (data-*)', () => {
        it('should preserve data-* attributes at the zod layer', () => {
            const result = ProgressConfigZod.parse({
                type: 'progress',
                field: 'v',
                'data-id': '{id}',
            }) as Record<string, unknown>;
            expect(result['data-id']).toBe('{id}');
        });
    });

    describe('ProgressMappingValueZod', () => {
        it('should strip unknown keys (default z.object strip)', () => {
            const result = ProgressMappingValueZod.parse({
                variant: 'danger',
                label: 'X',
                bogus: 'gone',
            }) as Record<string, unknown>;
            expect(result).not.toHaveProperty('bogus');
        });
    });

    describe('ProgressBarZod', () => {
        it('should require a field', () => {
            expect(() => ProgressBarZod.parse({ variant: 'success' })).toThrow();
        });
    });
});
