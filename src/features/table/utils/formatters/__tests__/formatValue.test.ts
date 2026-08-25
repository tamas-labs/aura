// @vitest-environment jsdom
// Raw HTML formatting relies on DOMPurify, which only works correctly under a
// real DOM implementation (jsdom); under happy-dom it strips every tag.
import { describe, it, expect } from 'vitest';
import { formatValue } from '../formatValue';
import type { BodyCellConfig } from '../../../../../types/cell.types';

describe('formatValue', () => {
    describe('raw HTML formatting', () => {
        it('should format raw HTML and stop further processing', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                raw: true,
            };
            const result = await formatValue('<b>bold</b>', config);
            expect(result).toBe('<b>bold</b>');
        });

        it('should sanitize raw HTML by default', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                raw: true,
            };
            const result = await formatValue('<script>alert(1)</script><b>text</b>', config);
            expect(result).not.toContain('<script');
            expect(result).toContain('<b>text</b>');
        });

        it('forwards the rawHtml whitelist to formatRaw (host can forbid style)', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                raw: true,
            };
            const result = await formatValue(
                '<span style="color:red" class="c">x</span>',
                config,
                'en-US',
                undefined,
                {
                    rawHtml: { allowedTags: ['span'], allowedAttr: ['class'] },
                }
            );
            expect(result).not.toContain('style=');
            expect(result).toContain('class="c"');
        });
    });

    describe('number formatting', () => {
        it('should format as number', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                number: true,
            };
            const result = await formatValue(1234.56, config, 'en-US');
            expect(result).toBe('1,234.56');
        });

        it('should format as number with hu-HU locale', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                number: true,
            };
            const result = await formatValue(1234.56, config, 'hu-HU');
            expect(result).toContain('1234');
            expect(result).toContain(',56');
        });
    });

    describe('currency formatting', () => {
        it('should format as currency', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                currency: 'USD',
            };
            const result = await formatValue(1234, config, 'en-US');
            expect(result).toBe('$1,234.00');
        });

        it('should format as EUR', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                currency: 'EUR',
            };
            const result = await formatValue(1234.56, config, 'en-US');
            expect(result).toBe('€1,234.56');
        });

        it('should prioritize currency over number', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                currency: 'USD',
                number: true,
            };
            const result = await formatValue(1234, config, 'en-US');
            expect(result).toBe('$1,234.00');
        });
    });

    describe('date formatting', () => {
        it('should format as date', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                date: true,
            };
            const result = await formatValue('2024-01-15', config, 'en-US');
            expect(result).toMatch(/01\/15\/2024/);
        });

        it('should prioritize currency over date', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                currency: 'USD',
                date: true,
            };
            const result = await formatValue(1234, config, 'en-US');
            expect(result).toBe('$1,234.00');
        });
    });

    describe('phone formatting', () => {
        it('should format as phone with hu-HU locale', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                phone: true,
            };
            const result = await formatValue('+36301234567', config, 'hu-HU');
            expect(result).toContain('+36');
        });

        it('should use locale to determine default country (hu-HU)', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                phone: true,
            };
            const result = await formatValue('06301234567', config, 'hu-HU');
            expect(result).toContain('+36');
        });

        it('should use locale to determine default country (en-US)', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                phone: true,
            };
            // US phone number without country code
            const result = await formatValue('2025551234', config, 'en-US');
            expect(result).toContain('+1');
        });

        it('should fall back to US when no locale region available', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                phone: true,
            };
            // Locale without region should fall back to 'US' default
            const result = await formatValue('2025551234', config, 'en');
            expect(result).toContain('+1');
        });
    });

    describe('unit formatting', () => {
        it('should format as unit', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                unit: 'percent',
            };
            const result = await formatValue(50, config, 'en-US');
            expect(result).toBe('50%');
        });

        it('should format kilometer unit', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                unit: 'kilometer',
            };
            const result = await formatValue(100, config, 'en-US');
            expect(result).toBe('100 km');
        });

        it('should format kilometer-per-hour unit', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                unit: 'kilometer-per-hour',
            };
            const result = await formatValue(120, config, 'en-US');
            expect(result).toBe('120 km/h');
        });

        it('should format celsius unit', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                unit: 'celsius',
            };
            const result = await formatValue(25.5, config, 'en-US');
            expect(result).toBe('25.5°C');
        });

        it('should prioritize currency over unit', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                currency: 'USD',
                unit: 'percent',
            };
            const result = await formatValue(100, config, 'en-US');
            expect(result).toBe('$100.00');
        });

        it('should prioritize unit over number', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                unit: 'percent',
                number: true,
            };
            const result = await formatValue(50, config, 'en-US');
            expect(result).toBe('50%');
        });
    });

    describe('slice formatting', () => {
        it('should slice text after type formatting', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                number: true,
                slice: 5,
            };
            const result = await formatValue(1234.56, config, 'en-US');
            // "1,234.56" sliced to 5 chars
            expect(result).toBe('1,234');
        });

        it('should slice plain text', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                slice: 5,
            };
            const result = await formatValue('Hello World', config);
            expect(result).toBe('Hello');
        });

        it('should slice with endWith', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                slice: 5,
                sliceEnd: '...',
            };
            const result = await formatValue('Hello World', config);
            expect(result).toBe('Hello...');
        });
    });

    describe('padding', () => {
        it('should pad start', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                padStart: 5,
                chars: '0',
            };
            const result = await formatValue('42', config);
            expect(result).toBe('00042');
        });

        it('should pad end', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                padEnd: 5,
                chars: '.',
            };
            const result = await formatValue('Hi', config);
            expect(result).toBe('Hi...');
        });

        it('should pad both sides', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                pad: 6,
                chars: '-',
            };
            const result = await formatValue('Hi', config);
            expect(result).toBe('--Hi--');
        });

        it('should use default space char', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                padStart: 5,
            };
            const result = await formatValue('42', config);
            expect(result).toBe('   42');
        });

        it('should prioritize padStart over padEnd', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                padStart: 5,
                padEnd: 5,
                chars: '0',
            };
            const result = await formatValue('42', config);
            expect(result).toBe('00042');
        });

        it('should prioritize padStart over pad', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                padStart: 5,
                pad: 7,
                chars: '0',
            };
            const result = await formatValue('42', config);
            expect(result).toBe('00042');
        });
    });

    describe('chained formatting', () => {
        it('should apply number then slice', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                number: true,
                slice: 6,
            };
            const result = await formatValue(123456.789, config, 'en-US');
            // "123,456.789" -> "123,45"
            expect(result.length).toBe(6);
            expect(result).toContain('123');
        });

        it('should apply currency then pad', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                currency: 'USD',
                padStart: 15,
            };
            const result = await formatValue(42, config, 'en-US');
            // "$42.00" padded to 15
            expect(result.length).toBe(15);
            expect(result).toContain('$42.00');
        });

        it('should apply date then slice', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                date: true,
                slice: 5,
            };
            const result = await formatValue('2024-01-15', config, 'en-US');
            // Date formatted then sliced
            expect(result.length).toBe(5);
        });

        it('should apply all: number, slice, pad', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                number: true,
                slice: 5,
                padStart: 10,
                chars: '0',
            };
            const result = await formatValue(1234.56, config, 'en-US');
            // "1,234.56" -> slice to "1,234" -> pad to "0000001,234"
            expect(result.length).toBe(10);
            expect(result).toContain('1,234');
        });
    });

    describe('config without formatting', () => {
        it('should return string as-is for plain text', async () => {
            const config: BodyCellConfig = { key: 'test' };
            const result = await formatValue('Hello', config);
            expect(result).toBe('Hello');
        });

        it('should convert number to string', async () => {
            const config: BodyCellConfig = { key: 'test' };
            const result = await formatValue(123, config);
            expect(result).toBe('123');
        });

        it('should convert boolean to string', async () => {
            const config: BodyCellConfig = { key: 'test' };
            const result = await formatValue(true, config);
            expect(result).toBe('true');
        });
    });

    describe('null and undefined handling', () => {
        it('should return empty string for null', async () => {
            const config: BodyCellConfig = { key: 'test' };
            const result = await formatValue(null, config);
            expect(result).toBe('');
        });

        it('should return empty string for undefined', async () => {
            const config: BodyCellConfig = { key: 'test' };
            const result = await formatValue(undefined, config);
            expect(result).toBe('');
        });

        it('should return empty string for null with number formatting', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                number: true,
            };
            const result = await formatValue(null, config);
            expect(result).toBe('');
        });

        it('should return empty string for undefined with date formatting', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                date: true,
            };
            const result = await formatValue(undefined, config);
            expect(result).toBe('');
        });
    });

    describe('default locale', () => {
        it('should use en-US as default locale', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                number: true,
            };
            const result = await formatValue(1234.56, config);
            expect(result).toBe('1,234.56');
        });

        it('should accept custom locale', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                number: true,
            };
            const result = await formatValue(1234.56, config, 'hu-HU');
            expect(result).toContain('1234');
            expect(result).toContain(',56');
        });
    });

    describe('empty config', () => {
        it('should handle undefined config', async () => {
            const result = await formatValue('Hello');
            expect(result).toBe('Hello');
        });

        it('should handle empty config object', async () => {
            const result = await formatValue('Hello', {});
            expect(result).toBe('Hello');
        });
    });

    describe('edge cases', () => {
        it('should handle empty string', async () => {
            const config: BodyCellConfig = { key: 'test' };
            const result = await formatValue('', config);
            expect(result).toBe('');
        });

        it('should handle zero', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                number: true,
            };
            const result = await formatValue(0, config);
            expect(result).toBe('0');
        });

        it('should handle false', async () => {
            const config: BodyCellConfig = { key: 'test' };
            const result = await formatValue(false, config);
            expect(result).toBe('false');
        });

        it('should handle object stringification', async () => {
            const config: BodyCellConfig = { key: 'test' };
            const result = await formatValue({ test: 'value' } as unknown as string, config);
            expect(result).toBe('[object Object]');
        });
    });

    describe('text transformation', () => {
        it('should uppercase text', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                uppercase: true,
            };
            const result = await formatValue('hello', config);
            expect(result).toBe('HELLO');
        });

        it('should lowercase text', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                lowercase: true,
            };
            const result = await formatValue('HELLO', config);
            expect(result).toBe('hello');
        });

        it('should capitalize text', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                capitalize: true,
            };
            const result = await formatValue('hello', config);
            expect(result).toBe('Hello');
        });

        it('should prioritize uppercase over lowercase', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                uppercase: true,
                lowercase: true,
            };
            const result = await formatValue('hello', config);
            expect(result).toBe('HELLO');
        });
    });

    describe('datetime formatting', () => {
        it('should format as datetime when datetime flag is true', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                datetime: true,
            };
            const result = await formatValue('2024-01-15T14:30:00', config, 'en-US');
            // Should contain both date and time parts
            expect(result).toContain('2024');
            expect(result).toMatch(/14|02/);
            expect(result).toMatch(/30/);
        });

        it('should prioritize datetime over date when both are true', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                datetime: true,
                date: true,
            };
            const result = await formatValue('2024-01-15T14:30:00', config, 'en-US');
            // datetime takes priority, should include time component
            expect(result).toMatch(/30/);
        });

        it('should prioritize currency over datetime', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                currency: 'USD',
                datetime: true,
            };
            const result = await formatValue(1234, config, 'en-US');
            expect(result).toBe('$1,234.00');
        });

        it('should return empty string for invalid datetime value', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                datetime: true,
            };
            const result = await formatValue('not a date', config, 'en-US');
            expect(result).toBe('');
        });

        it('should format datetime with null value', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                datetime: true,
            };
            const result = await formatValue(null, config, 'en-US');
            expect(result).toBe('');
        });
    });

    describe('dateStyle option', () => {
        it('should use medium dateStyle for date formatting', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                date: true,
            };
            const result = await formatValue('2024-01-15', config, 'en-US', undefined, {
                dateStyle: 'medium',
            });
            // medium format includes abbreviated month name
            expect(result).toContain('Jan');
            expect(result).toContain('15');
            expect(result).toContain('2024');
        });

        it('should use long dateStyle for date formatting', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                date: true,
            };
            const result = await formatValue('2024-01-15', config, 'en-US', undefined, {
                dateStyle: 'long',
            });
            expect(result).toContain('January');
            expect(result).toContain('2024');
        });

        it('should use short dateStyle by default', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                date: true,
            };
            const result = await formatValue('2024-01-15', config, 'en-US');
            expect(result).toMatch(/01\/15\/2024/);
        });

        it('should apply dateStyle to datetime as well', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                datetime: true,
            };
            const result = await formatValue('2024-01-15T14:30:00', config, 'en-US', undefined, {
                dateStyle: 'medium',
            });
            expect(result).toContain('Jan');
            expect(result).toMatch(/14|02/);
        });
    });

    describe('timeZone option', () => {
        it('should format date with UTC timeZone', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                date: true,
            };
            const result = await formatValue('2024-01-15T23:00:00Z', config, 'en-US', undefined, {
                timeZone: 'UTC',
            });
            expect(result).toMatch(/01\/15\/2024/);
        });

        it('should format date with different timeZone changing the day', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                date: true,
            };
            const result = await formatValue('2024-01-15T23:00:00Z', config, 'en-US', undefined, {
                timeZone: 'Pacific/Auckland',
            });
            // Auckland is UTC+13 in January, 23:00 UTC = Jan 16 12:00 NZDT
            expect(result).toMatch(/01\/16\/2024/);
        });

        it('should format datetime with timeZone', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                datetime: true,
            };
            const resultUTC = await formatValue(
                '2024-01-15T12:00:00Z',
                config,
                'en-US',
                undefined,
                { timeZone: 'UTC' }
            );
            const resultTokyo = await formatValue(
                '2024-01-15T12:00:00Z',
                config,
                'en-US',
                undefined,
                { timeZone: 'Asia/Tokyo' }
            );
            expect(resultUTC).not.toBe(resultTokyo);
        });

        it('should combine dateStyle and timeZone', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                datetime: true,
            };
            const result = await formatValue('2024-01-15T14:30:00Z', config, 'en-US', undefined, {
                dateStyle: 'medium',
                timeZone: 'UTC',
            });
            expect(result).toContain('Jan');
            expect(result).toMatch(/02:30|14:30/);
        });
    });

    describe('skipTypeFormatting option', () => {
        describe('when skipTypeFormatting is true', () => {
            it('should skip currency formatting', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    currency: 'USD',
                };
                const result = await formatValue('USD', config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('USD');
            });

            it('should skip number formatting', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    number: true,
                };
                const result = await formatValue('Amount', config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('Amount');
            });

            it('should skip date formatting', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    date: true,
                };
                const result = await formatValue('Date', config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('Date');
            });

            it('should skip datetime formatting', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    datetime: true,
                };
                const result = await formatValue('DateTime', config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('DateTime');
            });

            it('should skip phone formatting', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    phone: true,
                };
                const result = await formatValue('Phone', config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('Phone');
            });

            it('should still apply text transformations', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    currency: 'USD',
                    uppercase: true,
                };
                const result = await formatValue('usd', config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('USD');
            });

            it('should apply slice transformation', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    number: true,
                    slice: 3,
                    sliceEnd: '...',
                };
                const result = await formatValue('Header', config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('Hea...');
            });

            it('should apply padding', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    currency: 'USD',
                    padStart: 10,
                };
                const result = await formatValue('USD', config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('       USD');
            });

            it('should handle multiple text transformations', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    currency: 'EUR',
                    uppercase: true,
                    slice: 2,
                };
                const result = await formatValue('eur header', config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('EU');
            });
        });

        describe('when skipTypeFormatting is false or undefined', () => {
            it('should apply currency formatting by default', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    currency: 'USD',
                };
                const result = await formatValue(1234, config, 'en-US');
                expect(result).toBe('$1,234.00');
            });

            it('should apply currency formatting when explicitly false', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    currency: 'USD',
                };
                const result = await formatValue(1234, config, 'en-US', undefined, {
                    skipTypeFormatting: false,
                });
                expect(result).toBe('$1,234.00');
            });
        });

        describe('edge cases', () => {
            it('should handle empty string with skipTypeFormatting', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    currency: 'USD',
                };
                const result = await formatValue('', config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('');
            });

            it('should handle null with skipTypeFormatting', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    number: true,
                };
                const result = await formatValue(null, config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('');
            });

            it('should handle undefined with skipTypeFormatting', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    date: true,
                };
                const result = await formatValue(undefined, config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('');
            });

            it('should still respect raw HTML formatting', async () => {
                const config: BodyCellConfig = {
                    key: 'test',
                    raw: true,
                    currency: 'USD',
                };
                const result = await formatValue('<b>USD</b>', config, 'en-US', undefined, {
                    skipTypeFormatting: true,
                });
                expect(result).toBe('<b>USD</b>');
            });
        });
    });

    describe('time formatting', () => {
        it('should format seconds as duration when time flag is true', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                time: true,
            };
            const result = await formatValue(3661, config, 'en-US');
            expect(result).toBe('01:01:01');
        });

        it('should format 0 seconds as 00:00:00', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                time: true,
            };
            const result = await formatValue(0, config, 'en-US');
            expect(result).toBe('00:00:00');
        });

        it('should format negative seconds', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                time: true,
            };
            const result = await formatValue(-3661, config, 'en-US');
            expect(result).toBe('-01:01:01');
        });

        it('should format string integer seconds', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                time: true,
            };
            const result = await formatValue('90000', config, 'en-US');
            expect(result).toBe('25:00:00');
        });

        it('should return empty string for non-integer with time', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                time: true,
            };
            const result = await formatValue(3.5, config, 'en-US');
            expect(result).toBe('');
        });

        it('should return empty string for null with time', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                time: true,
            };
            const result = await formatValue(null, config, 'en-US');
            expect(result).toBe('');
        });

        it('should prioritize currency over time', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                currency: 'USD',
                time: true,
            };
            const result = await formatValue(1234, config, 'en-US');
            expect(result).toBe('$1,234.00');
        });

        it('should prioritize phone over time', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                phone: true,
                time: true,
            };
            const result = await formatValue('+36301234567', config, 'hu-HU');
            expect(result).toContain('+36');
        });

        it('should prioritize date over time', async () => {
            const config: BodyCellConfig = {
                key: 'test',
                date: true,
                time: true,
            };
            const result = await formatValue('2024-01-15', config, 'en-US');
            expect(result).toMatch(/01\/15\/2024/);
        });
    });
});
