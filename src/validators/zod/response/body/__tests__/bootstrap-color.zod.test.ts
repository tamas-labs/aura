import { describe, it, expect } from 'vitest';
import { BootstrapColorZod } from '../bootstrap-color.zod';

describe('BootstrapColorZod', () => {
    describe('valid inputs', () => {
        it('should accept "primary"', () => {
            expect(BootstrapColorZod.parse('primary')).toBe('primary');
        });

        it('should accept "secondary"', () => {
            expect(BootstrapColorZod.parse('secondary')).toBe('secondary');
        });

        it('should accept "success"', () => {
            expect(BootstrapColorZod.parse('success')).toBe('success');
        });

        it('should accept "danger"', () => {
            expect(BootstrapColorZod.parse('danger')).toBe('danger');
        });

        it('should accept "warning"', () => {
            expect(BootstrapColorZod.parse('warning')).toBe('warning');
        });

        it('should accept "info"', () => {
            expect(BootstrapColorZod.parse('info')).toBe('info');
        });

        it('should accept "dark"', () => {
            expect(BootstrapColorZod.parse('dark')).toBe('dark');
        });

        it('should accept "light"', () => {
            expect(BootstrapColorZod.parse('light')).toBe('light');
        });

        it('should accept null', () => {
            expect(BootstrapColorZod.parse(null)).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should reject hex color (#fff)', () => {
            expect(() => BootstrapColorZod.parse('#fff')).toThrow();
        });

        it('should reject hex color (#ffffff)', () => {
            expect(() => BootstrapColorZod.parse('#ffffff')).toThrow();
        });

        it('should reject RGB color', () => {
            expect(() => BootstrapColorZod.parse('rgb(0,0,0)')).toThrow();
        });

        it('should reject RGBA color', () => {
            expect(() => BootstrapColorZod.parse('rgba(0,0,0,0.5)')).toThrow();
        });

        it('should reject arbitrary CSS color name', () => {
            expect(() => BootstrapColorZod.parse('red')).toThrow();
        });

        it('should reject empty string', () => {
            expect(() => BootstrapColorZod.parse('')).toThrow();
        });

        it('should reject number', () => {
            expect(() => BootstrapColorZod.parse(123)).toThrow();
        });

        it('should reject boolean', () => {
            expect(() => BootstrapColorZod.parse(true)).toThrow();
        });

        it('should reject undefined', () => {
            expect(() => BootstrapColorZod.parse(undefined)).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should reject uppercase Bootstrap color name', () => {
            expect(() => BootstrapColorZod.parse('SUCCESS')).toThrow();
        });

        it('should reject mixed-case Bootstrap color name', () => {
            expect(() => BootstrapColorZod.parse('Success')).toThrow();
        });
    });
});
