import { describe, it, expect } from 'vitest';
import { HeaderZod } from '../header.zod';

describe('HeaderZod', () => {
    it('should parse valid object with rows', () => {
        const validHeader = { rows: [{ cells: [{ content: 'ID' }] }] };
        const result = HeaderZod.parse(validHeader);
        expect(result).toEqual(validHeader);
    });

    it('should strip unknown properties', () => {
        const headerWithExtra = {
            rows: [{ cells: [{ content: 'ID' }] }],
            unknownProp: 'should be removed',
            extraField: 123,
        };
        const result = HeaderZod.parse(headerWithExtra);
        expect(result).toEqual({ rows: [{ cells: [{ content: 'ID' }] }] });
        expect(result).not.toHaveProperty('unknownProp');
        expect(result).not.toHaveProperty('extraField');
    });

    it('should parse object with rows and settings', () => {
        const complexHeader = {
            rows: [{ cells: [{ content: 'Name', field: 'name' }] }],
            settings: { sticky: true, height: '100px' },
        };
        const result = HeaderZod.parse(complexHeader);
        expect(result).toEqual(complexHeader);
    });

    it('should strip prototype pollution attempts', () => {
        const maliciousHeader = {
            rows: [{ cells: [{ content: 'ID' }] }],
            __proto__: { polluted: true },
            constructor: { dangerous: true },
        };
        const result = HeaderZod.parse(maliciousHeader);
        expect(result).toEqual({ rows: [{ cells: [{ content: 'ID' }] }] });
        expect(result).not.toHaveProperty('__proto__');
        expect(result).not.toHaveProperty('constructor');
    });

    it('should throw error for missing rows', () => {
        expect(() => HeaderZod.parse({})).toThrow();
    });

    it('should throw error for null value', () => {
        expect(() => HeaderZod.parse(null)).toThrow();
    });

    it('should throw error for undefined value', () => {
        expect(() => HeaderZod.parse(undefined)).toThrow();
    });

    it('should throw error for string value', () => {
        expect(() => HeaderZod.parse('header')).toThrow();
    });

    it('should throw error for number value', () => {
        expect(() => HeaderZod.parse(123)).toThrow();
    });

    it('should throw error for boolean value', () => {
        expect(() => HeaderZod.parse(true)).toThrow();
    });

    it('should throw error for array value', () => {
        expect(() => HeaderZod.parse([1, 2, 3])).toThrow();
    });

    it('should validate type correctly with safeParse for valid object', () => {
        const validHeader = { rows: [{ cells: [{ content: 'ID' }] }] };
        const result = HeaderZod.safeParse(validHeader);

        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data).toEqual(validHeader);
        }
    });

    it('should validate type correctly with safeParse for invalid value', () => {
        const invalidResult = HeaderZod.safeParse(null);
        expect(invalidResult.success).toBe(false);
    });

    it('should allow optional settings', () => {
        const headerWithSettings = {
            rows: [{ cells: [{ content: 'ID' }] }],
            settings: { sticky: true },
        };
        const result = HeaderZod.parse(headerWithSettings);
        expect(result).toEqual(headerWithSettings);
    });

    it('should work without settings (optional)', () => {
        const headerWithoutSettings = {
            rows: [{ cells: [{ content: 'ID' }] }],
        };
        const result = HeaderZod.parse(headerWithoutSettings);
        expect(result).toEqual(headerWithoutSettings);
    });
});
