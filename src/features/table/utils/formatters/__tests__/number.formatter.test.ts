import { describe, it, expect, vi } from 'vitest';
import { formatNumber, formatCurrency, formatUnit } from '../number.formatter';
import { BOUNDED_CACHE_LIMIT } from '../../../../../utils/bounded-cache.util';

describe('number.formatter', () => {
    describe('formatNumber', () => {
        describe('valid cases', () => {
            it('should format number with default locale', () => {
                const result = formatNumber(1234.56, { locale: 'en-US' });
                expect(result).toBe('1,234.56');
            });

            it('should format number with hu-HU locale', () => {
                const result = formatNumber(1234.56, { locale: 'hu-HU' });
                // Hungarian format uses comma for decimal
                expect(result).toContain('1234');
                expect(result).toContain(',56');
            });

            it('should format integer without decimals', () => {
                const result = formatNumber(1234, { locale: 'en-US' });
                expect(result).toBe('1,234');
            });

            it('should format with specific decimal places', () => {
                const result = formatNumber(1234, { locale: 'en-US', decimals: 2 });
                expect(result).toBe('1,234.00');
            });

            it('should format negative numbers', () => {
                const result = formatNumber(-1234.56, { locale: 'en-US' });
                expect(result).toBe('-1,234.56');
            });

            it('should handle string numbers', () => {
                const result = formatNumber('1234.56', { locale: 'en-US' });
                expect(result).toBe('1,234.56');
            });

            it('should format zero', () => {
                const result = formatNumber(0, { locale: 'en-US' });
                expect(result).toBe('0');
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null', () => {
                const result = formatNumber(null);
                expect(result).toBe('');
            });

            it('should return empty string for undefined', () => {
                const result = formatNumber(undefined);
                expect(result).toBe('');
            });

            it('should return empty string for non-numeric string', () => {
                const result = formatNumber('abc');
                expect(result).toBe('');
            });

            it('should return empty string for NaN', () => {
                const result = formatNumber(NaN);
                expect(result).toBe('');
            });

            it('should return empty string for empty string', () => {
                const result = formatNumber('');
                expect(result).toBe('');
            });
        });

        describe('edge cases', () => {
            it('should format very large numbers', () => {
                const result = formatNumber(1234567890, { locale: 'en-US' });
                expect(result).toBe('1,234,567,890');
            });

            it('should format very small numbers', () => {
                const result = formatNumber(0.001, { locale: 'en-US' });
                expect(result).toBe('0.001');
            });

            it('should format with zero decimals', () => {
                const result = formatNumber(1234.567, { locale: 'en-US', decimals: 0 });
                expect(result).toBe('1,235');
            });

            it('should handle boolean false as 0', () => {
                const result = formatNumber(false as unknown as number);
                // false converts to 0
                expect(result).toBe('0');
            });
        });
    });

    describe('formatCurrency', () => {
        describe('valid cases', () => {
            it('should format HUF currency', () => {
                const result = formatCurrency(1234, { currency: 'HUF', locale: 'hu-HU' });
                // Hungarian format may vary by environment
                expect(result).toContain('1');
                expect(result).toContain('234');
            });

            it('should format USD currency', () => {
                const result = formatCurrency(1234.56, { currency: 'USD', locale: 'en-US' });
                expect(result).toBe('$1,234.56');
            });

            it('should format EUR currency', () => {
                const result = formatCurrency(1234.56, { currency: 'EUR', locale: 'en-US' });
                expect(result).toBe('€1,234.56');
            });

            it('should format negative currency', () => {
                const result = formatCurrency(-100, { currency: 'USD', locale: 'en-US' });
                expect(result).toBe('-$100.00');
            });

            it('should format zero', () => {
                const result = formatCurrency(0, { currency: 'USD', locale: 'en-US' });
                expect(result).toBe('$0.00');
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null', () => {
                const result = formatCurrency(null, { currency: 'USD' });
                expect(result).toBe('');
            });

            it('should return empty string for undefined', () => {
                const result = formatCurrency(undefined, { currency: 'USD' });
                expect(result).toBe('');
            });

            it('should return empty string for NaN', () => {
                const result = formatCurrency(NaN, { currency: 'USD' });
                expect(result).toBe('');
            });

            it('should return empty string for non-numeric string', () => {
                const result = formatCurrency('abc', { currency: 'USD' });
                expect(result).toBe('');
            });
        });

        describe('edge cases', () => {
            it('should format very large currency amounts', () => {
                const result = formatCurrency(1000000, { currency: 'USD', locale: 'en-US' });
                expect(result).toBe('$1,000,000.00');
            });

            it('should handle string numbers', () => {
                const result = formatCurrency('999.99', { currency: 'USD', locale: 'en-US' });
                expect(result).toBe('$999.99');
            });
        });
    });

    describe('formatUnit', () => {
        describe('valid cases', () => {
            it('should format percent unit', () => {
                const result = formatUnit(50, { unit: 'percent', locale: 'en-US' });
                expect(result).toBe('50%');
            });

            it('should format kilometer unit', () => {
                const result = formatUnit(100, { unit: 'kilometer', locale: 'en-US' });
                expect(result).toBe('100 km');
            });

            it('should format kilometer-per-hour unit', () => {
                const result = formatUnit(120, { unit: 'kilometer-per-hour', locale: 'en-US' });
                expect(result).toBe('120 km/h');
            });

            it('should format celsius unit', () => {
                const result = formatUnit(25.5, { unit: 'celsius', locale: 'en-US' });
                expect(result).toBe('25.5°C');
            });

            it('should format liter unit', () => {
                const result = formatUnit(2.5, { unit: 'liter', locale: 'en-US' });
                expect(result).toBe('2.5 L');
            });

            it('should format with long unitDisplay', () => {
                const result = formatUnit(5, {
                    unit: 'meter',
                    locale: 'en-US',
                    unitDisplay: 'long',
                });
                expect(result).toBe('5 meters');
            });

            it('should format with narrow unitDisplay', () => {
                const result = formatUnit(10, {
                    unit: 'kilometer',
                    locale: 'en-US',
                    unitDisplay: 'narrow',
                });
                expect(result).toBe('10km');
            });

            it('should format negative values', () => {
                const result = formatUnit(-10, { unit: 'celsius', locale: 'en-US' });
                expect(result).toBe('-10°C');
            });

            it('should format zero', () => {
                const result = formatUnit(0, { unit: 'percent', locale: 'en-US' });
                expect(result).toBe('0%');
            });

            it('should handle string numbers', () => {
                const result = formatUnit('75', { unit: 'percent', locale: 'en-US' });
                expect(result).toBe('75%');
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null', () => {
                const result = formatUnit(null, { unit: 'percent' });
                expect(result).toBe('');
            });

            it('should return empty string for undefined', () => {
                const result = formatUnit(undefined, { unit: 'percent' });
                expect(result).toBe('');
            });

            it('should return empty string for NaN', () => {
                const result = formatUnit(NaN, { unit: 'percent' });
                expect(result).toBe('');
            });

            it('should return empty string for non-numeric string', () => {
                const result = formatUnit('abc', { unit: 'percent' });
                expect(result).toBe('');
            });

            it('should return empty string for empty string', () => {
                const result = formatUnit('', { unit: 'percent' });
                expect(result).toBe('');
            });
        });

        describe('edge cases', () => {
            it('should format very large values', () => {
                const result = formatUnit(1000000, { unit: 'meter', locale: 'en-US' });
                expect(result).toBe('1,000,000 m');
            });

            it('should format very small decimal values', () => {
                const result = formatUnit(0.001, { unit: 'liter', locale: 'en-US' });
                expect(result).toBe('0.001 L');
            });

            it('should use default short unitDisplay', () => {
                const result = formatUnit(5, { unit: 'kilometer', locale: 'en-US' });
                expect(result).toBe('5 km');
            });
        });
    });

    describe('formatter cache cap', () => {
        /**
         * The `Intl.NumberFormat` cache is capped at `BOUNDED_CACHE_LIMIT` entries, so a
         * pathological set of locale/option combinations cannot grow it without bound.
         * Above the cap the formatter is built per call instead of being reused — the
         * output must not change. The module is re-imported so this test fills its own
         * cache instead of exhausting the one the rest of the file shares.
         */
        it('should keep formatting correctly once the cache is full', async () => {
            vi.resetModules();
            const { formatNumber: freshFormatNumber } = await import('../number.formatter');

            const locales = ['en-US', 'de-DE', 'fr-FR', 'es-ES', 'it-IT'];
            for (const locale of locales) {
                for (let decimals = 0; decimals <= BOUNDED_CACHE_LIMIT / 4; decimals++) {
                    freshFormatNumber(1, { locale, decimals });
                }
            }

            // An early key (cached) and a locale first seen after the cap (never cached)
            expect(freshFormatNumber(1234.5, { locale: 'en-US', decimals: 2 })).toBe('1,234.50');
            expect(freshFormatNumber(1234.5, { locale: 'en-GB', decimals: 2 })).toBe('1,234.50');
        });

        /**
         * A structurally invalid tag makes `new Intl.NumberFormat` throw, and the formatter
         * falls back to the runtime default locale. The config validator rejects such tags
         * long before this point — but a formatter running per cell is the worst place to
         * throw, so the fallback stays. Since the cap refactor the fallback is *cached*
         * like any other value (see `bounded-cache.util.test.ts`), so the second call does
         * not rebuild it; the output is what this asserts.
         */
        it('should fall back to the default locale for an unparsable tag', () => {
            const expected = new Intl.NumberFormat(undefined).format(1234.5);

            expect(formatNumber(1234.5, { locale: '!!invalid' })).toBe(expected);
            expect(formatNumber(1234.5, { locale: '!!invalid' })).toBe(expected);
        });
    });
});
