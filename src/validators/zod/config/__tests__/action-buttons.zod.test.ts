import { describe, it, expect } from 'vitest';
import { ActionButtonsZod } from '../action-buttons.zod';

describe('ActionButtonsZod', () => {
    describe('valid inputs', () => {
        it('should accept full array with all buttons', () => {
            const result = ActionButtonsZod.safeParse(['refresh', 'export', 'settings']);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(['refresh', 'export', 'settings']);
            }
        });

        it('should accept single button', () => {
            const result = ActionButtonsZod.safeParse(['refresh']);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(['refresh']);
            }
        });

        it('should accept partial array', () => {
            const result = ActionButtonsZod.safeParse(['settings', 'export']);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(['settings', 'export']);
            }
        });

        it('should accept empty array', () => {
            const result = ActionButtonsZod.safeParse([]);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual([]);
            }
        });

        it('should accept null', () => {
            const result = ActionButtonsZod.safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe(null);
            }
        });

        it('should accept buttons in any order', () => {
            const result = ActionButtonsZod.safeParse(['export', 'refresh']);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(['export', 'refresh']);
            }
        });
    });

    describe('invalid inputs', () => {
        it('should reject non-array value', () => {
            const result = ActionButtonsZod.safeParse('refresh');
            expect(result.success).toBe(false);
        });

        it('should reject object', () => {
            const result = ActionButtonsZod.safeParse({ refresh: true });
            expect(result.success).toBe(false);
        });

        it('should reject invalid button name', () => {
            const result = ActionButtonsZod.safeParse(['refresh', 'invalid']);
            expect(result.success).toBe(false);
        });

        it('should reject number elements', () => {
            const result = ActionButtonsZod.safeParse([123]);
            expect(result.success).toBe(false);
        });

        it('should reject boolean elements', () => {
            const result = ActionButtonsZod.safeParse([true, false]);
            expect(result.success).toBe(false);
        });

        it('should reject duplicate buttons', () => {
            const result = ActionButtonsZod.safeParse(['refresh', 'refresh']);
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error.message).toContain('Duplicate action buttons');
            }
        });

        it('should reject undefined', () => {
            const result = ActionButtonsZod.safeParse(undefined);
            expect(result.success).toBe(false);
        });

        it('should reject mixed valid and invalid buttons', () => {
            const result = ActionButtonsZod.safeParse(['refresh', 'foo', 'export']);
            expect(result.success).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should handle only export button', () => {
            const result = ActionButtonsZod.safeParse(['export']);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(['export']);
            }
        });

        it('should handle only settings button', () => {
            const result = ActionButtonsZod.safeParse(['settings']);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(['settings']);
            }
        });

        it('should reject array with null elements', () => {
            const result = ActionButtonsZod.safeParse(['refresh', null]);
            expect(result.success).toBe(false);
        });

        it('should reject array with undefined elements', () => {
            const result = ActionButtonsZod.safeParse(['refresh', undefined]);
            expect(result.success).toBe(false);
        });

        it('should reject empty string elements', () => {
            const result = ActionButtonsZod.safeParse(['']);
            expect(result.success).toBe(false);
        });
    });
});
