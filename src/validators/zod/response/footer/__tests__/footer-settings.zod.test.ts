import { describe, it, expect } from 'vitest';
import { FooterSettingsZod } from '../footer-settings.zod';

describe('FooterSettingsZod', () => {
    describe('valid inputs', () => {
        it('should accept object with sticky only', () => {
            const result = FooterSettingsZod.parse({ sticky: true });
            expect(result).toEqual({ sticky: true });
        });

        it('should accept object with height only', () => {
            const result = FooterSettingsZod.parse({ height: 'auto' });
            expect(result).toEqual({ height: 'auto', sticky: false });
        });

        it('should accept object with both properties', () => {
            const result = FooterSettingsZod.parse({
                sticky: true,
                height: '100px',
            });
            expect(result).toEqual({
                sticky: true,
                height: '100px',
            });
        });

        it('should accept empty object', () => {
            const result = FooterSettingsZod.parse({});
            expect(result).toEqual({ sticky: false });
        });

        it('should accept null', () => {
            const result = FooterSettingsZod.parse(null);
            expect(result).toBeNull();
        });

        it('should strip unknown properties', () => {
            const settingsWithExtra = {
                sticky: true,
                height: '100px',
                unknownProp: 'should be removed',
                extraField: 123,
            };
            const result = FooterSettingsZod.parse(settingsWithExtra);
            expect(result).toEqual({ sticky: true, height: '100px' });
            expect(result).not.toHaveProperty('unknownProp');
            expect(result).not.toHaveProperty('extraField');
        });

        it('should strip searchableItems property (footer does not have this)', () => {
            const settingsWithSearchableItems = {
                sticky: true,
                searchableItems: ['id', 'name'],
            };
            const result = FooterSettingsZod.parse(settingsWithSearchableItems);
            expect(result).toEqual({ sticky: true });
            expect(result).not.toHaveProperty('searchableItems');
        });

        it('should strip __proto__ property (prototype pollution protection)', () => {
            const maliciousSettings = {
                sticky: true,
                __proto__: { polluted: true },
            };
            const result = FooterSettingsZod.parse(maliciousSettings);
            expect(result).toEqual({ sticky: true });
            expect(result).not.toHaveProperty('__proto__');
        });

        it('should strip constructor property (prototype pollution protection)', () => {
            const maliciousSettings = {
                height: 'auto',
                constructor: { dangerous: true },
            };
            const result = FooterSettingsZod.parse(maliciousSettings);
            expect(result).toEqual({ height: 'auto', sticky: false });
            expect(result).not.toHaveProperty('constructor');
        });
    });

    describe('invalid inputs', () => {
        it('should reject invalid sticky type (string instead of boolean)', () => {
            expect(() => {
                FooterSettingsZod.parse({ sticky: 'true' });
            }).toThrow();
        });

        it('should reject invalid sticky type (number instead of boolean)', () => {
            expect(() => {
                FooterSettingsZod.parse({ sticky: 1 });
            }).toThrow();
        });

        it('should reject invalid height type (number instead of string)', () => {
            expect(() => {
                FooterSettingsZod.parse({ height: 100 });
            }).toThrow();
        });

        it('should reject invalid height type (boolean instead of string)', () => {
            expect(() => {
                FooterSettingsZod.parse({ height: true });
            }).toThrow();
        });

        it('should reject non-object type (string)', () => {
            expect(() => {
                FooterSettingsZod.parse('invalid');
            }).toThrow();
        });

        it('should reject non-object type (number)', () => {
            expect(() => {
                FooterSettingsZod.parse(123);
            }).toThrow();
        });

        it('should reject non-object type (array)', () => {
            expect(() => {
                FooterSettingsZod.parse([]);
            }).toThrow();
        });
    });

    describe('edge cases', () => {
        it('should handle sticky false combined with height', () => {
            const result = FooterSettingsZod.parse({
                sticky: false,
                height: '50px',
            });
            expect(result).toEqual({
                sticky: false,
                height: '50px',
            });
        });

        it('should handle null sticky', () => {
            const result = FooterSettingsZod.parse({
                sticky: null,
                height: '100px',
            });
            expect(result).toEqual({
                sticky: null,
                height: '100px',
            });
        });

        it('should handle null height', () => {
            const result = FooterSettingsZod.parse({
                sticky: true,
                height: null,
            });
            expect(result).toEqual({
                sticky: true,
                height: null,
            });
        });

        it('should handle both null values', () => {
            const result = FooterSettingsZod.parse({
                sticky: null,
                height: null,
            });
            expect(result).toEqual({
                sticky: null,
                height: null,
            });
        });
    });
});
