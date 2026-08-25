import { describe, it, expect } from 'vitest';
import { BooleanZod } from '../boolean.zod';

describe('BooleanZod', () => {
    it('should parse true boolean value', () => {
        const result = BooleanZod.parse(true);
        expect(result).toBe(true);
    });

    it('should parse false boolean value', () => {
        const result = BooleanZod.parse(false);
        expect(result).toBe(false);
    });

    it('should parse null value', () => {
        const result = BooleanZod.parse(null);
        expect(result).toBeNull();
    });

    it('should use default false for undefined', () => {
        const result = BooleanZod.parse(undefined);
        expect(result).toBe(false);
    });

    it('should throw error for string value', () => {
        expect(() => BooleanZod.parse('true')).toThrow();
    });

    it('should throw error for number value', () => {
        expect(() => BooleanZod.parse(1)).toThrow();
    });

    it('should throw error for object value', () => {
        expect(() => BooleanZod.parse({})).toThrow();
    });

    it('should throw error for array value', () => {
        expect(() => BooleanZod.parse([])).toThrow();
    });

    it('should validate type correctly with safeParse', () => {
        const validResult = BooleanZod.safeParse(true);
        expect(validResult.success).toBe(true);
        if (validResult.success) {
            expect(validResult.data).toBe(true);
        }

        const invalidResult = BooleanZod.safeParse('invalid');
        expect(invalidResult.success).toBe(false);
    });
});
