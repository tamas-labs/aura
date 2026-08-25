import { describe, it, expect } from 'vitest';
import { HeaderSettingsZod } from '../header-settings.zod';

describe('HeaderSettingsZod', () => {
    describe('valid inputs', () => {
        it('should accept object with sticky only', () => {
            const result = HeaderSettingsZod.parse({ sticky: true });
            expect(result).toEqual({ sticky: true });
        });

        it('should accept object with height only', () => {
            const result = HeaderSettingsZod.parse({ height: 'auto' });
            expect(result).toEqual({ height: 'auto', sticky: false });
        });

        it('should accept object with both properties', () => {
            const result = HeaderSettingsZod.parse({
                sticky: true,
                height: '100px',
            });
            expect(result).toEqual({
                sticky: true,
                height: '100px',
            });
        });

        it('should accept empty object', () => {
            const result = HeaderSettingsZod.parse({});
            expect(result).toEqual({ sticky: false });
        });

        it('should accept null', () => {
            const result = HeaderSettingsZod.parse(null);
            expect(result).toBeNull();
        });

        it('should strip unknown properties', () => {
            const settingsWithExtra = {
                sticky: true,
                height: '100px',
                unknownProp: 'should be removed',
                extraField: 123,
            };
            const result = HeaderSettingsZod.parse(settingsWithExtra);
            expect(result).toEqual({ sticky: true, height: '100px' });
            expect(result).not.toHaveProperty('unknownProp');
            expect(result).not.toHaveProperty('extraField');
        });

        it('should strip __proto__ property (prototype pollution protection)', () => {
            const maliciousSettings = {
                sticky: true,
                __proto__: { polluted: true },
            };
            const result = HeaderSettingsZod.parse(maliciousSettings);
            expect(result).toEqual({ sticky: true });
            expect(result).not.toHaveProperty('__proto__');
        });

        it('should strip constructor property (prototype pollution protection)', () => {
            const maliciousSettings = {
                height: 'auto',
                constructor: { dangerous: true },
            };
            const result = HeaderSettingsZod.parse(maliciousSettings);
            expect(result).toEqual({ height: 'auto', sticky: false });
            expect(result).not.toHaveProperty('constructor');
        });

        it('should accept object with searchableItems only', () => {
            const result = HeaderSettingsZod.parse({ searchableItems: ['id', 'name'] });
            expect(result).toEqual({ searchableItems: ['id', 'name'], sticky: false });
        });

        it('should accept object with sticky and searchableItems', () => {
            const result = HeaderSettingsZod.parse({
                sticky: true,
                searchableItems: ['id', 'email'],
            });
            expect(result).toEqual({
                sticky: true,
                searchableItems: ['id', 'email'],
            });
        });

        it('should accept object with all properties', () => {
            const result = HeaderSettingsZod.parse({
                sticky: true,
                height: '100px',
                searchableItems: ['id', 'name', 'status'],
            });
            expect(result).toEqual({
                sticky: true,
                height: '100px',
                searchableItems: ['id', 'name', 'status'],
            });
        });

        it('should strip unknown properties with searchableItems present', () => {
            const settingsWithExtra = {
                sticky: true,
                searchableItems: ['id'],
                unknownProp: 'should be removed',
            };
            const result = HeaderSettingsZod.parse(settingsWithExtra);
            expect(result).toEqual({ sticky: true, searchableItems: ['id'] });
            expect(result).not.toHaveProperty('unknownProp');
        });
    });

    describe('invalid inputs', () => {
        it('should reject invalid sticky type', () => {
            expect(() => HeaderSettingsZod.parse({ sticky: 'true' })).toThrow();
        });

        it('should reject invalid height type', () => {
            expect(() => HeaderSettingsZod.parse({ height: 100 })).toThrow();
        });

        it('should reject invalid height format', () => {
            expect(() => HeaderSettingsZod.parse({ height: 'invalid' })).toThrow();
        });

        it('should reject non-object types', () => {
            expect(() => HeaderSettingsZod.parse('settings')).toThrow();
            expect(() => HeaderSettingsZod.parse([])).toThrow();
        });

        it('should reject invalid searchableItems type (not array)', () => {
            expect(() => HeaderSettingsZod.parse({ searchableItems: 'id' })).toThrow();
        });

        it('should reject empty searchableItems array', () => {
            expect(() => HeaderSettingsZod.parse({ searchableItems: [] })).toThrow();
        });

        it('should reject searchableItems with non-string elements', () => {
            expect(() => HeaderSettingsZod.parse({ searchableItems: [123] })).toThrow();
        });

        it('should reject searchableItems with empty string element', () => {
            expect(() => HeaderSettingsZod.parse({ searchableItems: [''] })).toThrow();
        });

        it('should reject searchableItems with null element', () => {
            expect(() => HeaderSettingsZod.parse({ searchableItems: [null] })).toThrow();
        });
    });
});
