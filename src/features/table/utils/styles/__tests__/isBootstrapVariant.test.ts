import { describe, it, expect } from 'vitest';
import { isBootstrapVariant } from '../isBootstrapVariant';

describe('isBootstrapVariant', () => {
    describe('valid cases', () => {
        it('should return true when value is in variants', () => {
            const variants = { primary: 'primary', danger: 'danger' };
            const result = isBootstrapVariant('primary', variants);
            expect(result).toBe(true);
        });

        it('should return true for multiple variant keys', () => {
            const variants = { primary: 'primary', danger: 'danger', success: 'success' };
            expect(isBootstrapVariant('primary', variants)).toBe(true);
            expect(isBootstrapVariant('danger', variants)).toBe(true);
            expect(isBootstrapVariant('success', variants)).toBe(true);
        });

        it('should return false when value is not in variants', () => {
            const variants = { primary: 'primary' };
            const result = isBootstrapVariant('#fff000', variants);
            expect(result).toBe(false);
        });

        it('should return false for CSS color names not in variants', () => {
            const variants = { primary: 'primary' };
            expect(isBootstrapVariant('yellow', variants)).toBe(false);
            expect(isBootstrapVariant('red', variants)).toBe(false);
            expect(isBootstrapVariant('white', variants)).toBe(false);
        });

        it('should return false for hex colors', () => {
            const variants = { primary: 'primary' };
            expect(isBootstrapVariant('#fff', variants)).toBe(false);
            expect(isBootstrapVariant('#ffffff', variants)).toBe(false);
            expect(isBootstrapVariant('#ff0000', variants)).toBe(false);
        });

        it('should return false for rgb/rgba colors', () => {
            const variants = { primary: 'primary' };
            expect(isBootstrapVariant('rgb(255, 240, 0)', variants)).toBe(false);
            expect(isBootstrapVariant('rgba(255, 240, 0, 0.5)', variants)).toBe(false);
        });
    });

    describe('null and undefined cases', () => {
        it('should return false when value is null', () => {
            const variants = { primary: 'primary' };
            const result = isBootstrapVariant(null, variants);
            expect(result).toBe(false);
        });

        it('should return false when value is undefined', () => {
            const variants = { primary: 'primary' };
            const result = isBootstrapVariant(undefined, variants);
            expect(result).toBe(false);
        });

        it('should return false when variants is undefined', () => {
            const result = isBootstrapVariant('primary', undefined);
            expect(result).toBe(false);
        });

        it('should return false when both are null/undefined', () => {
            expect(isBootstrapVariant(null, undefined)).toBe(false);
            expect(isBootstrapVariant(undefined, undefined)).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should return false when variants is empty object', () => {
            const result = isBootstrapVariant('primary', {});
            expect(result).toBe(false);
        });

        it('should return false when value is empty string', () => {
            const variants = { primary: 'primary' };
            const result = isBootstrapVariant('', variants);
            expect(result).toBe(false);
        });

        it('should be case sensitive', () => {
            const variants = { primary: 'primary' };
            expect(isBootstrapVariant('PRIMARY', variants)).toBe(false);
            expect(isBootstrapVariant('Primary', variants)).toBe(false);
        });

        it('should handle variants with different values', () => {
            const variants = { primary: 'blue', danger: 'red' };
            expect(isBootstrapVariant('primary', variants)).toBe(true);
            expect(isBootstrapVariant('danger', variants)).toBe(true);
            expect(isBootstrapVariant('blue', variants)).toBe(false);
            expect(isBootstrapVariant('red', variants)).toBe(false);
        });
    });
});
