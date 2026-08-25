import { describe, it, expect } from 'vitest';
import { BodyZod } from '../body.zod';

describe('BodyZod', () => {
    // -------------------------------------------------------------------------
    // valid inputs
    // -------------------------------------------------------------------------
    describe('valid inputs', () => {
        it('should accept empty object (all fields optional)', () => {
            const result = BodyZod.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should accept object with columnConfigs', () => {
            const result = BodyZod.safeParse({
                columnConfigs: { id: { type: 'static', value: 'ID:' } },
            });
            expect(result.success).toBe(true);
        });

        it('should accept columnConfigs: null', () => {
            const result = BodyZod.safeParse({ columnConfigs: null });
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.columnConfigs).toBeNull();
            }
        });

        it('should accept columnStyles', () => {
            const result = BodyZod.safeParse({
                columnStyles: { id: 'text-muted', name: ['fw-bold', 'pe-2'] },
            });
            expect(result.success).toBe(true);
        });

        it('should accept columnStyles: null', () => {
            const result = BodyZod.safeParse({ columnStyles: null });
            expect(result.success).toBe(true);
        });

        it('should accept settings with striped and hoverable', () => {
            const result = BodyZod.safeParse({
                settings: { striped: true, hoverable: false },
            });
            expect(result.success).toBe(true);
        });

        it('should accept rowRules as record', () => {
            const result = BodyZod.safeParse({
                rowRules: { key: 'status', if: [{ value: 'active', config: {} }] },
            });
            expect(result.success).toBe(true);
        });

        it('should accept rowRules: null', () => {
            const result = BodyZod.safeParse({ rowRules: null });
            expect(result.success).toBe(true);
        });

        it('should accept rowRules with RowRulesZod structure', () => {
            const result = BodyZod.safeParse({
                rowRules: { key: 'status', background: 'success-subtle', borderBottom: true },
            });
            expect(result.success).toBe(true);
        });

        it('should accept full body with all fields', () => {
            const result = BodyZod.safeParse({
                columnConfigs: { id: { type: 'static', value: '#' } },
                columnStyles: { name: 'fw-bold' },
                settings: { striped: true, hoverable: true },
                rowRules: { key: 'status' },
            });
            expect(result.success).toBe(true);
        });

        it('should preserve columnConfigs entries as-is (no deep validation)', () => {
            const input = {
                columnConfigs: {
                    id: { type: 'static', value: 'ID:', extraArbitraryField: true },
                    badge: { type: 'future-type', someData: 42 },
                },
            };
            const result = BodyZod.safeParse(input);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data.columnConfigs?.id).toHaveProperty('extraArbitraryField', true);
                expect(result.data.columnConfigs?.badge).toHaveProperty('type', 'future-type');
            }
        });
    });

    // -------------------------------------------------------------------------
    // strip logic
    // -------------------------------------------------------------------------
    describe('strip logic', () => {
        it('should strip unknown top-level fields', () => {
            const result = BodyZod.parse({
                columnConfigs: null,
                unknownField: 'gone',
                anotherProp: 42,
            });
            expect(result).not.toHaveProperty('unknownField');
            expect(result).not.toHaveProperty('anotherProp');
        });

        it('should keep all known fields after stripping', () => {
            const result = BodyZod.parse({
                columnConfigs: null,
                columnStyles: null,
                settings: { striped: true },
                rowRules: null,
                unknownField: 'remove',
            });
            expect(result).toHaveProperty('columnConfigs');
            expect(result).toHaveProperty('columnStyles');
            expect(result).toHaveProperty('settings');
            expect(result).toHaveProperty('rowRules');
            expect(result).not.toHaveProperty('unknownField');
        });
    });

    // -------------------------------------------------------------------------
    // invalid inputs
    // -------------------------------------------------------------------------
    describe('invalid inputs', () => {
        it('should reject null (body must be object)', () => {
            const result = BodyZod.safeParse(null);
            expect(result.success).toBe(false);
        });

        it('should reject array', () => {
            const result = BodyZod.safeParse([]);
            expect(result.success).toBe(false);
        });

        it('should reject string', () => {
            const result = BodyZod.safeParse('body');
            expect(result.success).toBe(false);
        });

        it('should reject number', () => {
            const result = BodyZod.safeParse(42);
            expect(result.success).toBe(false);
        });

        it('should reject undefined', () => {
            const result = BodyZod.safeParse(undefined);
            expect(result.success).toBe(false);
        });

        it('should reject settings with invalid striped type', () => {
            const result = BodyZod.safeParse({ settings: { striped: 'yes' } });
            expect(result.success).toBe(false);
        });
    });
});
