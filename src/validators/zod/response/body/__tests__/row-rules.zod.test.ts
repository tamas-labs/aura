import { describe, it, expect } from 'vitest';
import { RowRulesZod } from '../row-rules.zod';

describe('RowRulesZod', () => {
    // -------------------------------------------------------------------------
    // valid inputs
    // -------------------------------------------------------------------------
    describe('valid inputs', () => {
        it('should accept null (nullable schema)', () => {
            const result = RowRulesZod.safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) expect(result.data).toBeNull();
        });

        it('should accept empty object', () => {
            const result = RowRulesZod.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should accept key-only config', () => {
            const result = RowRulesZod.safeParse({ key: 'status' });
            expect(result.success).toBe(true);
        });

        it('should accept status-based row highlighting config', () => {
            const result = RowRulesZod.safeParse({
                key: 'status',
                if: [
                    {
                        eq: 'active',
                        background: 'success-subtle',
                        borderBottom: true,
                        borderColor: 'success',
                    },
                    {
                        eq: 'pending',
                        background: 'warning-subtle',
                        borderBottom: true,
                        borderColor: 'warning',
                    },
                    {
                        eq: 'inactive',
                        background: 'secondary-subtle',
                        class: 'text-muted',
                    },
                ],
                else: { background: 'light' },
            });
            expect(result.success).toBe(true);
        });

        it('should accept date-based row formatting config', () => {
            const result = RowRulesZod.safeParse({
                key: 'expires_at',
                if: [
                    {
                        lt: 'now',
                        background: 'danger-subtle',
                        opacity: 0.6,
                        class: 'text-decoration-line-through',
                    },
                    {
                        lt: 'tomorrow',
                        background: 'warning-subtle',
                        borderLeft: true,
                        borderWidth: '4px',
                    },
                ],
            });
            expect(result.success).toBe(true);
        });

        it('should accept priority-based row config with all formatting options', () => {
            const result = RowRulesZod.safeParse({
                key: 'priority',
                if: [
                    {
                        eq: 'high',
                        background: 'danger-subtle',
                        borderLeft: true,
                        borderColor: 'danger',
                        borderWidth: '3px',
                        class: 'fw-bold',
                    },
                    {
                        eq: 'low',
                        opacity: 0.7,
                        class: 'text-muted',
                    },
                ],
            });
            expect(result.success).toBe(true);
        });

        it('should accept deleted-row config', () => {
            const result = RowRulesZod.safeParse({
                key: 'status',
                if: [
                    {
                        eq: 'deleted',
                        background: 'danger-subtle',
                        opacity: 0.5,
                        class: 'text-decoration-line-through',
                    },
                ],
            });
            expect(result.success).toBe(true);
        });

        it('should accept null key', () => {
            const result = RowRulesZod.safeParse({ key: null });
            expect(result.success).toBe(true);
        });

        it('should accept null else', () => {
            const result = RowRulesZod.safeParse({ key: 'status', else: null });
            expect(result.success).toBe(true);
        });

        it('should accept null if', () => {
            const result = RowRulesZod.safeParse({ key: 'status', if: null });
            expect(result.success).toBe(true);
        });

        it('should accept class as string array', () => {
            const result = RowRulesZod.safeParse({ class: ['fw-bold', 'text-danger'] });
            expect(result.success).toBe(true);
        });

        it('should accept opacity = 0', () => {
            const result = RowRulesZod.safeParse({ opacity: 0 });
            expect(result.success).toBe(true);
        });

        it('should accept opacity = 1', () => {
            const result = RowRulesZod.safeParse({ opacity: 1 });
            expect(result.success).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // invalid inputs
    // -------------------------------------------------------------------------
    describe('invalid inputs', () => {
        it('should reject opacity > 1', () => {
            const result = RowRulesZod.safeParse({ opacity: 1.5 });
            expect(result.success).toBe(false);
        });

        it('should reject opacity < 0', () => {
            const result = RowRulesZod.safeParse({ opacity: -0.1 });
            expect(result.success).toBe(false);
        });

        it('should reject key shorter than 1 character', () => {
            const result = RowRulesZod.safeParse({ key: '' });
            expect(result.success).toBe(false);
        });

        it('should reject background exceeding max length', () => {
            const result = RowRulesZod.safeParse({ background: 'a'.repeat(101) });
            expect(result.success).toBe(false);
        });

        it('should reject borderWidth exceeding max length', () => {
            const result = RowRulesZod.safeParse({ borderWidth: 'a'.repeat(21) });
            expect(result.success).toBe(false);
        });

        it('should reject non-object input', () => {
            const result = RowRulesZod.safeParse('active');
            expect(result.success).toBe(false);
        });

        it('should reject array input', () => {
            const result = RowRulesZod.safeParse([]);
            expect(result.success).toBe(false);
        });

        it('should reject number input', () => {
            const result = RowRulesZod.safeParse(42);
            expect(result.success).toBe(false);
        });

        it('should reject borderTop as non-boolean', () => {
            const result = RowRulesZod.safeParse({ borderTop: 'yes' });
            expect(result.success).toBe(false);
        });

        it('should reject empty class string', () => {
            const result = RowRulesZod.safeParse({ class: '' });
            expect(result.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // edge cases
    // -------------------------------------------------------------------------
    describe('edge cases', () => {
        it('should accept if as empty array', () => {
            const result = RowRulesZod.safeParse({ key: 'status', if: [] });
            expect(result.success).toBe(true);
        });

        it('should reject undefined (nullable does not include undefined)', () => {
            const result = RowRulesZod.safeParse(undefined);
            expect(result.success).toBe(false);
        });

        it('should accept formatting-only config without key or conditions', () => {
            const result = RowRulesZod.safeParse({
                background: 'light',
                opacity: 0.9,
            });
            expect(result.success).toBe(true);
        });

        it('should handle key with max 250 chars', () => {
            const result = RowRulesZod.safeParse({ key: 'a'.repeat(250) });
            expect(result.success).toBe(true);
        });

        it('should reject key with 251 chars', () => {
            const result = RowRulesZod.safeParse({ key: 'a'.repeat(251) });
            expect(result.success).toBe(false);
        });
    });
});
