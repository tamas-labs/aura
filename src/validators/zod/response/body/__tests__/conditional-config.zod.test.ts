import { describe, it, expect } from 'vitest';
import { ConditionalConfigZod } from '../conditional-config.zod';

describe('ConditionalConfigZod', () => {
    describe('valid cases', () => {
        it('should accept empty object (all fields optional)', () => {
            const result = ConditionalConfigZod.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should accept key-only config', () => {
            const result = ConditionalConfigZod.safeParse({ key: 'status' });
            expect(result.success).toBe(true);
        });

        it('should accept full valid config', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'status',
                if: [{ eq: 'active', variant: 'success' }],
                else: { variant: 'secondary' },
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with multiple if branches', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'score',
                if: [
                    { gte: 90, variant: 'success' },
                    { gte: 70, variant: 'warning' },
                    { lt: 70, variant: 'danger' },
                ],
                else: { variant: 'secondary' },
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with empty if array', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'status',
                if: [],
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with if-only (no else)', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'status',
                if: [{ eq: 'active', variant: 'success' }],
            });
            expect(result.success).toBe(true);
        });

        it('should accept config with else-only (no if)', () => {
            const result = ConditionalConfigZod.safeParse({
                else: { variant: 'secondary', label: 'Default' },
            });
            expect(result.success).toBe(true);
        });
    });

    describe('nullable fields', () => {
        it('should accept null for key', () => {
            const result = ConditionalConfigZod.safeParse({ key: null });
            expect(result.success).toBe(true);
        });

        it('should accept null for if', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'status',
                if: null,
            });
            expect(result.success).toBe(true);
        });

        it('should accept null for else', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'status',
                if: [{ eq: 'active', variant: 'success' }],
                else: null,
            });
            expect(result.success).toBe(true);
        });

        it('should accept null for both if and else', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'status',
                if: null,
                else: null,
            });
            expect(result.success).toBe(true);
        });
    });

    describe('invalid cases', () => {
        it('should reject empty string key', () => {
            const result = ConditionalConfigZod.safeParse({ key: '' });
            expect(result.success).toBe(false);
        });

        it('should reject key exceeding 250 characters', () => {
            const result = ConditionalConfigZod.safeParse({ key: 'a'.repeat(251) });
            expect(result.success).toBe(false);
        });

        it('should reject if as non-array (string)', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'status',
                if: 'not-an-array',
            });
            expect(result.success).toBe(false);
        });

        it('should reject if as number', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'status',
                if: 42,
            });
            expect(result.success).toBe(false);
        });

        it('should reject else as non-object (string)', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'status',
                else: 'not-an-object',
            });
            expect(result.success).toBe(false);
        });

        it('should reject else as array', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'status',
                else: [{ variant: 'success' }],
            });
            expect(result.success).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should accept key at max length (250 chars)', () => {
            const result = ConditionalConfigZod.safeParse({ key: 'a'.repeat(250) });
            expect(result.success).toBe(true);
        });

        it('should accept nested conditional in if branch', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'status',
                if: [
                    {
                        eq: 'active',
                        key: 'role',
                        if: [{ eq: 'admin', variant: 'danger' }],
                        else: { variant: 'success' },
                    },
                ],
            });
            expect(result.success).toBe(true);
        });

        it('should accept if branch with arbitrary operator keys', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'score',
                if: [{ between: [10, 100], variant: 'success', label: 'OK' }],
            });
            expect(result.success).toBe(true);
        });

        it('should accept else with arbitrary config properties', () => {
            const result = ConditionalConfigZod.safeParse({
                key: 'status',
                else: {
                    type: 'badge',
                    variant: 'secondary',
                    label: 'Unknown',
                    class: 'text-muted',
                },
            });
            expect(result.success).toBe(true);
        });
    });
});
