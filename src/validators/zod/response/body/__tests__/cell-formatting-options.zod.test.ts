import { describe, it, expect } from 'vitest';
import { CellFormattingOptionsZod } from '../cell-formatting-options.zod';

describe('CellFormattingOptionsZod', () => {
    // -------------------------------------------------------------------------
    // valid inputs
    // -------------------------------------------------------------------------
    describe('valid inputs', () => {
        it('should accept empty object (all fields optional)', () => {
            const result = CellFormattingOptionsZod.safeParse({});
            expect(result.success).toBe(true);
        });

        it('should accept full valid config with all fields', () => {
            const result = CellFormattingOptionsZod.safeParse({
                background: 'success-subtle',
                color: 'success-emphasis',
                borderTop: true,
                borderBottom: true,
                borderLeft: false,
                borderRight: false,
                borderColor: 'success',
                borderWidth: '3px',
                padding: '8px 16px',
                class: 'fw-bold',
                style: 'font-size: 14px',
                opacity: 0.8,
            });
            expect(result.success).toBe(true);
        });

        it('should accept nullable fields as null', () => {
            const result = CellFormattingOptionsZod.safeParse({
                background: null,
                color: null,
                borderTop: null,
                borderColor: null,
                opacity: null,
                class: null,
                style: null,
            });
            expect(result.success).toBe(true);
        });

        it('should accept opacity = 0', () => {
            const result = CellFormattingOptionsZod.safeParse({ opacity: 0 });
            expect(result.success).toBe(true);
        });

        it('should accept opacity = 1', () => {
            const result = CellFormattingOptionsZod.safeParse({ opacity: 1 });
            expect(result.success).toBe(true);
        });

        it('should accept opacity = 0.5', () => {
            const result = CellFormattingOptionsZod.safeParse({ opacity: 0.5 });
            expect(result.success).toBe(true);
        });

        it('should accept class as string array', () => {
            const result = CellFormattingOptionsZod.safeParse({
                class: ['fw-bold', 'text-truncate'],
            });
            expect(result.success).toBe(true);
        });

        it('should accept border fields only without borderColor', () => {
            const result = CellFormattingOptionsZod.safeParse({ borderBottom: true });
            expect(result.success).toBe(true);
        });

        it('should accept bootstrap color names for background', () => {
            const bootstrapColors = [
                'primary',
                'secondary',
                'success',
                'danger',
                'warning',
                'info',
                'light',
                'dark',
            ];
            bootstrapColors.forEach(color => {
                const result = CellFormattingOptionsZod.safeParse({ background: color });
                expect(result.success).toBe(true);
            });
        });

        it('should accept subtle variant backgrounds', () => {
            const result = CellFormattingOptionsZod.safeParse({ background: 'success-subtle' });
            expect(result.success).toBe(true);
        });

        it('should accept emphasis variant colors', () => {
            const result = CellFormattingOptionsZod.safeParse({ color: 'danger-emphasis' });
            expect(result.success).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // invalid inputs
    // -------------------------------------------------------------------------
    describe('invalid inputs', () => {
        it('should reject opacity > 1', () => {
            const result = CellFormattingOptionsZod.safeParse({ opacity: 1.5 });
            expect(result.success).toBe(false);
        });

        it('should reject opacity < 0', () => {
            const result = CellFormattingOptionsZod.safeParse({ opacity: -0.1 });
            expect(result.success).toBe(false);
        });

        it('should reject opacity as string', () => {
            const result = CellFormattingOptionsZod.safeParse({ opacity: '0.5' });
            expect(result.success).toBe(false);
        });

        it('should reject borderTop as non-boolean', () => {
            const result = CellFormattingOptionsZod.safeParse({ borderTop: 'yes' });
            expect(result.success).toBe(false);
        });

        it('should reject background exceeding max length', () => {
            const result = CellFormattingOptionsZod.safeParse({
                background: 'a'.repeat(101),
            });
            expect(result.success).toBe(false);
        });

        it('should reject borderWidth exceeding max length', () => {
            const result = CellFormattingOptionsZod.safeParse({
                borderWidth: 'a'.repeat(21),
            });
            expect(result.success).toBe(false);
        });

        it('should reject padding exceeding max length', () => {
            const result = CellFormattingOptionsZod.safeParse({
                padding: 'a'.repeat(101),
            });
            expect(result.success).toBe(false);
        });

        it('should reject empty class string', () => {
            const result = CellFormattingOptionsZod.safeParse({ class: '' });
            expect(result.success).toBe(false);
        });

        it('should reject empty class array', () => {
            const result = CellFormattingOptionsZod.safeParse({ class: [] });
            expect(result.success).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // edge cases
    // -------------------------------------------------------------------------
    describe('edge cases', () => {
        it('should handle background="" as empty string error', () => {
            const result = CellFormattingOptionsZod.safeParse({ background: '' });
            expect(result.success).toBe(false);
        });

        it('should handle color="" as empty string error', () => {
            const result = CellFormattingOptionsZod.safeParse({ color: '' });
            expect(result.success).toBe(false);
        });

        it('should handle borderColor="" as empty string error', () => {
            const result = CellFormattingOptionsZod.safeParse({ borderColor: '' });
            expect(result.success).toBe(false);
        });

        it('should accept borderWidth="1px" (min length 1)', () => {
            const result = CellFormattingOptionsZod.safeParse({ borderWidth: '1' });
            expect(result.success).toBe(true);
        });
    });
});
