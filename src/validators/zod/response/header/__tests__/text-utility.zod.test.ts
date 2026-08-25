import { describe, it, expect } from 'vitest';
import { TextUtilityZod } from '../text-utility.zod';

describe('TextUtilityZod', () => {
    describe('valid inputs', () => {
        it('should accept Bootstrap text util classes', () => {
            expect(TextUtilityZod.parse('text-start')).toBe('text-start');
            expect(TextUtilityZod.parse('text-center')).toBe('text-center');
            expect(TextUtilityZod.parse('text-end')).toBe('text-end');
            expect(TextUtilityZod.parse('text-truncate')).toBe('text-truncate');
            expect(TextUtilityZod.parse('text-nowrap')).toBe('text-nowrap');
            expect(TextUtilityZod.parse('text-primary')).toBe('text-primary');
        });

        it('should accept null', () => {
            expect(TextUtilityZod.parse(null)).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject values not starting with "text-"', () => {
            expect(() => TextUtilityZod.parse('start')).toThrow();
            expect(() => TextUtilityZod.parse('center')).toThrow();
            expect(() => TextUtilityZod.parse('bg-primary')).toThrow();
            expect(() => TextUtilityZod.parse('')).toThrow();
        });
    });
});
