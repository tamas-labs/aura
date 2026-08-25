import { describe, it, expect } from 'vitest';
import { SliceZod } from '../slice.zod';

describe('SliceZod', () => {
    it('should validate valid integer values', () => {
        expect(SliceZod.parse(1)).toBe(1);
        expect(SliceZod.parse(10)).toBe(10);
        expect(SliceZod.parse(100)).toBe(100);
        expect(SliceZod.parse(10000)).toBe(10000);
    });

    it('should validate null', () => {
        expect(SliceZod.parse(null)).toBeNull();
    });

    it('should reject values below minimum', () => {
        const result = SliceZod.safeParse(0);
        expect(result.success).toBe(false);
    });

    it('should reject values above maximum', () => {
        const result = SliceZod.safeParse(10001);
        expect(result.success).toBe(false);
    });

    it('should reject float values', () => {
        const result = SliceZod.safeParse(10.5);
        expect(result.success).toBe(false);
    });

    it('should reject non-number values', () => {
        const result = SliceZod.safeParse('10');
        expect(result.success).toBe(false);
    });
});
