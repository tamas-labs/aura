import { describe, it, expect, vi } from 'vitest';
import { formatDate, formatDateTime } from '../date.formatter';
import { BOUNDED_CACHE_LIMIT } from '../../../../../utils/bounded-cache.util';

describe('date.formatter', () => {
    describe('formatDate', () => {
        describe('valid cases', () => {
            it('should format ISO date string with short format', () => {
                const result = formatDate('2024-01-15', { locale: 'en-US', format: 'short' });
                // en-US short format is typically MM/DD/YYYY
                expect(result).toMatch(/01\/15\/2024/);
            });

            it('should format ISO date string with medium format', () => {
                const result = formatDate('2024-01-15', { locale: 'en-US', format: 'medium' });
                // medium format includes month name abbreviated
                expect(result).toContain('Jan');
                expect(result).toContain('15');
                expect(result).toContain('2024');
            });

            it('should format ISO date string with long format', () => {
                const result = formatDate('2024-01-15', { locale: 'en-US', format: 'long' });
                // long format includes full month and weekday
                expect(result).toContain('January');
                expect(result).toContain('15');
                expect(result).toContain('2024');
                expect(result).toContain('Monday');
            });

            it('should format timestamp', () => {
                const timestamp = new Date('2024-01-15').getTime();
                const result = formatDate(timestamp, { locale: 'en-US', format: 'short' });
                expect(result).toMatch(/01\/15\/2024/);
            });

            it('should format Date object', () => {
                const date = new Date('2024-01-15');
                const result = formatDate(date, { locale: 'en-US', format: 'short' });
                expect(result).toMatch(/01\/15\/2024/);
            });

            it('should use default short format', () => {
                const result = formatDate('2024-01-15', { locale: 'en-US' });
                expect(result).toMatch(/01\/15\/2024/);
            });

            it('should format with hu-HU locale', () => {
                const result = formatDate('2024-01-15', { locale: 'hu-HU', format: 'short' });
                // Hungarian format is typically YYYY. MM. DD.
                expect(result).toContain('2024');
                expect(result).toContain('01');
                expect(result).toContain('15');
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null', () => {
                const result = formatDate(null);
                expect(result).toBe('');
            });

            it('should return empty string for undefined', () => {
                const result = formatDate(undefined);
                expect(result).toBe('');
            });

            it('should return empty string for invalid date string', () => {
                const result = formatDate('not a date');
                expect(result).toBe('');
            });

            it('should return empty string for empty string', () => {
                const result = formatDate('');
                expect(result).toBe('');
            });

            it('should return empty string for boolean', () => {
                const result = formatDate(true);
                expect(result).toBe('');
            });

            it('should return empty string for invalid Date object', () => {
                const result = formatDate(new Date('invalid'));
                expect(result).toBe('');
            });
        });

        describe('timeZone support', () => {
            it('should format date with UTC timeZone', () => {
                const result = formatDate('2024-01-15T12:00:00Z', {
                    locale: 'en-US',
                    format: 'short',
                    timeZone: 'UTC',
                });
                expect(result).toMatch(/01\/15\/2024/);
            });

            it('should format date with specific timeZone', () => {
                const result = formatDate('2024-01-15T23:00:00Z', {
                    locale: 'en-US',
                    format: 'short',
                    timeZone: 'Pacific/Auckland',
                });
                // Auckland is UTC+13 in January, so 23:00 UTC = next day
                expect(result).toMatch(/01\/16\/2024/);
            });

            it('should format without timeZone (local behavior)', () => {
                const result = formatDate('2024-01-15', {
                    locale: 'en-US',
                    format: 'short',
                });
                expect(result).toContain('2024');
            });
        });

        describe('edge cases', () => {
            it('should format epoch date', () => {
                const result = formatDate('1970-01-01', { locale: 'en-US', format: 'short' });
                expect(result).toMatch(/01\/01\/1970/);
            });

            it('should format future date', () => {
                const result = formatDate('2099-12-31', { locale: 'en-US', format: 'short' });
                expect(result).toMatch(/12\/31\/2099/);
            });

            it('should handle ISO datetime string', () => {
                const result = formatDate('2024-01-15T14:30:00', {
                    locale: 'en-US',
                    format: 'short',
                });
                expect(result).toMatch(/01\/15\/2024/);
            });
        });
    });

    describe('formatDateTime', () => {
        describe('valid cases', () => {
            it('should format date and time together', () => {
                const result = formatDateTime('2024-01-15T14:30:00', {
                    locale: 'en-US',
                    format: 'short',
                });
                // Should contain both date and time components
                expect(result).toContain('2024');
                expect(result).toMatch(/14|02/);
                expect(result).toMatch(/30/);
            });

            it('should format with medium format', () => {
                const result = formatDateTime('2024-01-15T14:30:00', {
                    locale: 'en-US',
                    format: 'medium',
                });
                expect(result).toContain('Jan');
                expect(result).toContain('15');
                expect(result).toMatch(/14|02/);
            });

            it('should format Date object', () => {
                const date = new Date('2024-01-15T14:30:00');
                const result = formatDateTime(date, { locale: 'en-US' });
                expect(result).toContain('2024');
                expect(result).toMatch(/14|02/);
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null', () => {
                const result = formatDateTime(null);
                expect(result).toBe('');
            });

            it('should return empty string for undefined', () => {
                const result = formatDateTime(undefined);
                expect(result).toBe('');
            });

            it('should return empty string for invalid date', () => {
                const result = formatDateTime('not a date');
                expect(result).toBe('');
            });
        });

        describe('edge cases', () => {
            it('should handle midnight time', () => {
                const result = formatDateTime('2024-01-15T00:00:00', { locale: 'en-US' });
                expect(result).toContain('2024');
                expect(result).toMatch(/00|12/); // Depends on 12/24 hour format
            });

            it('should handle end of day', () => {
                const result = formatDateTime('2024-01-15T23:59:59', { locale: 'en-US' });
                expect(result).toContain('2024');
                expect(result).toMatch(/23|11/);
                expect(result).toMatch(/59/);
            });
        });

        describe('timeZone support', () => {
            it('should format datetime with UTC timeZone', () => {
                const result = formatDateTime('2024-01-15T14:30:00Z', {
                    locale: 'en-US',
                    format: 'short',
                    timeZone: 'UTC',
                });
                expect(result).toContain('2024');
                expect(result).toMatch(/02:30|14:30/);
            });

            it('should format datetime with Europe/Budapest timeZone', () => {
                const result = formatDateTime('2024-01-15T12:00:00Z', {
                    locale: 'en-US',
                    format: 'short',
                    timeZone: 'Europe/Budapest',
                });
                // Budapest is UTC+1 in January -> 13:00
                expect(result).toMatch(/01:00|13:00/);
            });

            it('should produce different output for different timeZones', () => {
                const resultUTC = formatDateTime('2024-01-15T12:00:00Z', {
                    locale: 'en-US',
                    format: 'short',
                    timeZone: 'UTC',
                });
                const resultTokyo = formatDateTime('2024-01-15T12:00:00Z', {
                    locale: 'en-US',
                    format: 'short',
                    timeZone: 'Asia/Tokyo',
                });
                expect(resultUTC).not.toBe(resultTokyo);
            });
        });
    });
    describe('formatter cache cap', () => {
        /**
         * Same cap as the number formatter's cache: above `BOUNDED_CACHE_LIMIT` entries
         * the `Intl.DateTimeFormat` is rebuilt per call instead of being reused, and the
         * output must not change. Re-imported so this test fills its own cache.
         */
        it('should keep formatting correctly once the cache is full', async () => {
            vi.resetModules();
            const { formatDate: freshFormatDate } = await import('../date.formatter');

            const locales = ['en-US', 'de-DE', 'fr-FR', 'es-ES', 'it-IT', 'pt-BR'];
            const zones = ['UTC', 'Europe/Budapest', 'Asia/Tokyo', 'America/New_York'];
            for (const locale of locales) {
                for (const timeZone of zones) {
                    for (const format of ['short', 'medium', 'long'] as const) {
                        freshFormatDate('2024-01-01T12:00:00Z', { locale, timeZone, format });
                    }
                }
            }
            expect(locales.length * zones.length * 3).toBeGreaterThan(BOUNDED_CACHE_LIMIT);

            // An early key (cached) and a locale first seen after the cap (never cached)
            expect(
                freshFormatDate('2024-01-01T12:00:00Z', { locale: 'en-US', timeZone: 'UTC' })
            ).toBe('01/01/2024');
            expect(
                freshFormatDate('2024-01-01T12:00:00Z', { locale: 'en-GB', timeZone: 'UTC' })
            ).toBe('01/01/2024');
        });

        /**
         * Same defensive fallback as the number formatter: an unparsable tag makes the
         * `Intl.DateTimeFormat` constructor throw, and the runtime default locale takes
         * over rather than the render going down. The fallback is cached like any other
         * value since the cap refactor.
         */
        it('should fall back to the default locale for an unparsable tag', () => {
            const date = '2024-01-01T12:00:00Z';
            // What the fallback builds: the runtime default locale with the `short` preset
            const expected = new Intl.DateTimeFormat(undefined, {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
            }).format(new Date(date));

            expect(formatDate(date, { locale: '!!invalid' })).toBe(expected);
            expect(formatDate(date, { locale: '!!invalid' })).toBe(expected);
        });
    });

    describe('prototype-chain format names', () => {
        // `FORMAT_MAP` is a plain object, so a raw `FORMAT_MAP[format]` lookup answers
        // 'constructor' with the `Object` constructor — truthy, so the `?? short` fallback
        // never runs, and spreading a function contributes no options at all.
        it.each(['constructor', '__proto__', 'toString'])(
            'should format with the short preset for %s',
            format => {
                const options = { locale: 'en-US', format: format as 'short' };

                expect(formatDate('2024-01-15', options)).toBe(
                    formatDate('2024-01-15', { locale: 'en-US', format: 'short' })
                );
                expect(formatDateTime('2024-01-15T14:30:00', options)).toBe(
                    formatDateTime('2024-01-15T14:30:00', { locale: 'en-US', format: 'short' })
                );
            }
        );
    });
});
