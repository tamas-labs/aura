import { describe, it, expect } from 'vitest';
import { BodySettingsZod } from '../body-settings.zod';

describe('BodySettingsZod', () => {
    // -------------------------------------------------------------------------
    // valid inputs
    // -------------------------------------------------------------------------
    describe('valid inputs', () => {
        it('should accept empty object (all fields optional)', () => {
            // BooleanZod has .default(false), so absent optional fields are filled with defaults
            const result = BodySettingsZod.parse({});
            expect(result).toMatchObject({});
        });

        it('should accept { striped: true }', () => {
            const result = BodySettingsZod.parse({ striped: true });
            expect(result).toMatchObject({ striped: true });
        });

        it('should accept { hoverable: true }', () => {
            const result = BodySettingsZod.parse({ hoverable: true });
            expect(result).toMatchObject({ hoverable: true });
        });

        it('should accept { striped: false, hoverable: false }', () => {
            const result = BodySettingsZod.parse({ striped: false, hoverable: false });
            expect(result).toMatchObject({ striped: false, hoverable: false });
        });

        it('should accept { striped: true, hoverable: true }', () => {
            const result = BodySettingsZod.parse({ striped: true, hoverable: true });
            expect(result).toMatchObject({ striped: true, hoverable: true });
        });

        it('should accept { striped: null }', () => {
            const result = BodySettingsZod.parse({ striped: null });
            expect(result).toMatchObject({ striped: null });
        });

        it('should accept { hoverable: null }', () => {
            const result = BodySettingsZod.parse({ hoverable: null });
            expect(result).toMatchObject({ hoverable: null });
        });

        it('should accept null (whole schema is nullable)', () => {
            const result = BodySettingsZod.parse(null);
            expect(result).toBeNull();
        });
    });

    // -------------------------------------------------------------------------
    // strip logic
    // -------------------------------------------------------------------------
    describe('strip logic', () => {
        it('should strip unknown fields', () => {
            const result = BodySettingsZod.parse({ striped: true, unknownField: 'x' });
            expect(result).not.toHaveProperty('unknownField');
            expect(result).toHaveProperty('striped', true);
        });

        it('should strip multiple unknown fields', () => {
            const result = BodySettingsZod.parse({
                striped: false,
                foo: 1,
                bar: 'baz',
                nested: { a: 1 },
            });
            expect(result).not.toHaveProperty('foo');
            expect(result).not.toHaveProperty('bar');
            expect(result).not.toHaveProperty('nested');
        });
    });

    // -------------------------------------------------------------------------
    // invalid inputs
    // -------------------------------------------------------------------------
    describe('invalid inputs', () => {
        it('should reject striped as string', () => {
            expect(() => BodySettingsZod.parse({ striped: 'yes' })).toThrow();
        });

        it('should reject hoverable as number', () => {
            expect(() => BodySettingsZod.parse({ hoverable: 1 })).toThrow();
        });

        it('should reject non-object (array)', () => {
            expect(() => BodySettingsZod.parse([])).toThrow();
        });

        it('should reject non-object (string)', () => {
            expect(() => BodySettingsZod.parse('striped')).toThrow();
        });

        it('should reject non-object (number)', () => {
            expect(() => BodySettingsZod.parse(42)).toThrow();
        });

        it('should reject undefined', () => {
            expect(() => BodySettingsZod.parse(undefined)).toThrow();
        });
    });
});
