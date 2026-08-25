import { describe, it, expect } from 'vitest';
import { RawZod } from '../raw.zod';

describe('RawZod', () => {
    it('should validate boolean values', () => {
        expect(RawZod.parse(true)).toBe(true);
        expect(RawZod.parse(false)).toBe(false);
    });

    it('should validate null', () => {
        expect(RawZod.parse(null)).toBeNull();
    });

    it('should reject non-boolean values', () => {
        const invalidValues = ['true', 1, {}, [], undefined];
        invalidValues.forEach(value => {
            const result = RawZod.safeParse(value);
            expect(result.success).toBe(false);
        });
    });
});
