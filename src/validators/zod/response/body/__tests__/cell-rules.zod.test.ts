import { describe, it, expect } from 'vitest';
import { CellRulesZod } from '../cell-rules.zod';

describe('CellRulesZod', () => {
    // -------------------------------------------------------------------------
    // valid inputs
    // -------------------------------------------------------------------------
    describe('valid inputs', () => {
        it('should accept null (nullable schema)', () => {
            const result = CellRulesZod.safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) expect(result.data).toBeNull();
        });

        it('should accept empty object', () => {
            const result = CellRulesZod.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should accept key-only config', () => {
            const result = CellRulesZod.safeParse({ key: 'status' });
            expect(result.success).toBe(true);
        });

        it('should accept formatting-only config without conditions', () => {
            const result = CellRulesZod.safeParse({
                background: 'light',
                color: 'muted',
            });
            expect(result.success).toBe(true);
        });

        it('should accept full conditional cell rules config', () => {
            const result = CellRulesZod.safeParse({
                key: 'status',
                if: [
                    {
                        eq: 'active',
                        background: 'success-subtle',
                        borderBottom: true,
                        borderColor: 'success',
                    },
                    { eq: 'pending', background: 'warning-subtle' },
                ],
                else: { background: 'light' },
            });
            expect(result.success).toBe(true);
        });

        it('should accept score-based formatting config', () => {
            const result = CellRulesZod.safeParse({
                key: 'score',
                if: [
                    {
                        gte: 90,
                        background: 'success-subtle',
                        borderLeft: true,
                        borderColor: 'success',
                        borderWidth: '3px',
                    },
                    {
                        lt: 60,
                        background: 'danger-subtle',
                        borderLeft: true,
                        borderColor: 'danger',
                        borderWidth: '3px',
                    },
                ],
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with all formatting options', () => {
            const result = CellRulesZod.safeParse({
                key: 'priority',
                if: [
                    {
                        eq: 'urgent',
                        background: 'danger',
                        color: 'white',
                        borderLeft: true,
                        borderColor: 'danger',
                        borderWidth: '4px',
                        padding: '8px',
                        class: 'fw-bold',
                        opacity: 1,
                    },
                ],
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with else branch only', () => {
            const result = CellRulesZod.safeParse({
                key: 'status',
                else: { background: 'light', color: 'muted' },
            });
            expect(result.success).toBe(true);
        });

        it('should accept null for key field', () => {
            const result = CellRulesZod.safeParse({ key: null });
            expect(result.success).toBe(true);
        });

        it('should accept null for else field', () => {
            const result = CellRulesZod.safeParse({ key: 'status', else: null });
            expect(result.success).toBe(true);
        });

        it('should accept class as string array in if branch', () => {
            const result = CellRulesZod.safeParse({
                key: 'status',
                class: ['fw-bold', 'text-uppercase'],
            });
            expect(result.success).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // invalid inputs
    // -------------------------------------------------------------------------
    describe('invalid inputs', () => {
        it('should reject opacity > 1', () => {
            const result = CellRulesZod.safeParse({ opacity: 1.5 });
            expect(result.success).toBe(false);
        });

        it('should reject opacity < 0', () => {
            const result = CellRulesZod.safeParse({ opacity: -0.1 });
            expect(result.success).toBe(false);
        });

        it('should reject key shorter than 1 character (empty string)', () => {
            const result = CellRulesZod.safeParse({ key: '' });
            expect(result.success).toBe(false);
        });

        it('should reject background exceeding max length', () => {
            const result = CellRulesZod.safeParse({ background: 'a'.repeat(101) });
            expect(result.success).toBe(false);
        });

        it('should reject non-object input', () => {
            const result = CellRulesZod.safeParse('active');
            expect(result.success).toBe(false);
        });

        it('should reject array input', () => {
            const result = CellRulesZod.safeParse([]);
            expect(result.success).toBe(false);
        });

        it('should reject number input', () => {
            const result = CellRulesZod.safeParse(42);
            expect(result.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // edge cases
    // -------------------------------------------------------------------------
    describe('edge cases', () => {
        it('should accept if as empty array', () => {
            const result = CellRulesZod.safeParse({ key: 'status', if: [] });
            expect(result.success).toBe(true);
        });

        it('should reject undefined (nullable does not include undefined)', () => {
            const result = CellRulesZod.safeParse(undefined);
            // .nullable() only allows null; undefined is not valid without .optional()
            expect(result.success).toBe(false);
        });
    });
});
