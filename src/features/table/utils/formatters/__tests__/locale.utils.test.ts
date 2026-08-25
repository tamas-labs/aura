import { describe, it, expect } from 'vitest';
import { extractCountryFromLocale } from '../locale.utils';

describe('locale.utils', () => {
    describe('extractCountryFromLocale', () => {
        describe('valid cases', () => {
            it('should extract country from hu-HU', () => {
                const result = extractCountryFromLocale('hu-HU');
                expect(result).toBe('HU');
            });

            it('should extract country from en-US', () => {
                const result = extractCountryFromLocale('en-US');
                expect(result).toBe('US');
            });

            it('should extract country from de-DE', () => {
                const result = extractCountryFromLocale('de-DE');
                expect(result).toBe('DE');
            });

            it('should extract country from pt-BR', () => {
                const result = extractCountryFromLocale('pt-BR');
                expect(result).toBe('BR');
            });

            it('should extract country from en-GB', () => {
                const result = extractCountryFromLocale('en-GB');
                expect(result).toBe('GB');
            });

            it('should extract country from zh-Hans-CN (with script subtag)', () => {
                const result = extractCountryFromLocale('zh-Hans-CN');
                expect(result).toBe('CN');
            });

            it('should normalize mixed case locale', () => {
                const result = extractCountryFromLocale('EN-us');
                expect(result).toBe('US');
            });

            it('should extract country from fr-FR', () => {
                const result = extractCountryFromLocale('fr-FR');
                expect(result).toBe('FR');
            });
        });

        describe('invalid cases - no region', () => {
            it('should return undefined for hu (no region)', () => {
                const result = extractCountryFromLocale('hu');
                expect(result).toBeUndefined();
            });

            it('should return undefined for en (no region)', () => {
                const result = extractCountryFromLocale('en');
                expect(result).toBeUndefined();
            });

            it('should return undefined for de (no region)', () => {
                const result = extractCountryFromLocale('de');
                expect(result).toBeUndefined();
            });
        });

        describe('edge cases', () => {
            it('should return undefined for empty string', () => {
                const result = extractCountryFromLocale('');
                expect(result).toBeUndefined();
            });

            it('should return undefined for invalid locale string', () => {
                const result = extractCountryFromLocale('invalid-locale-string-123');
                expect(result).toBeUndefined();
            });

            it('should return undefined for und (undefined locale)', () => {
                const result = extractCountryFromLocale('und');
                expect(result).toBeUndefined();
            });

            it('should return undefined for random gibberish', () => {
                const result = extractCountryFromLocale('xyzabc');
                expect(result).toBeUndefined();
            });
        });
    });
});
