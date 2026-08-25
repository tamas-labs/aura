import { describe, it, expect } from 'vitest';
import { formatDuration } from '../time.formatter';

describe('time.formatter', () => {
    describe('formatDuration', () => {
        describe('valid cases', () => {
            it('should format 0 seconds as 00:00:00', () => {
                expect(formatDuration(0)).toBe('00:00:00');
            });

            it('should format 1 second', () => {
                expect(formatDuration(1)).toBe('00:00:01');
            });

            it('should format 59 seconds', () => {
                expect(formatDuration(59)).toBe('00:00:59');
            });

            it('should format 60 seconds as 1 minute', () => {
                expect(formatDuration(60)).toBe('00:01:00');
            });

            it('should format 3599 seconds as 59 minutes 59 seconds', () => {
                expect(formatDuration(3599)).toBe('00:59:59');
            });

            it('should format 3600 seconds as 1 hour', () => {
                expect(formatDuration(3600)).toBe('01:00:00');
            });

            it('should format 3661 seconds as 1 hour 1 minute 1 second', () => {
                expect(formatDuration(3661)).toBe('01:01:01');
            });

            it('should format 90000 seconds as 25 hours (no day rollover)', () => {
                expect(formatDuration(90000)).toBe('25:00:00');
            });

            it('should format large value 360000 as 100 hours', () => {
                expect(formatDuration(360000)).toBe('100:00:00');
            });

            it('should format extremely large value (over 1000 hours)', () => {
                expect(formatDuration(3600000)).toBe('1000:00:00');
            });

            it('should format string integer "3661"', () => {
                expect(formatDuration('3661')).toBe('01:01:01');
            });

            it('should format string "0"', () => {
                expect(formatDuration('0')).toBe('00:00:00');
            });

            it('should format string "-3661"', () => {
                expect(formatDuration('-3661')).toBe('-01:01:01');
            });
        });

        describe('negative values', () => {
            it('should format -1 second', () => {
                expect(formatDuration(-1)).toBe('-00:00:01');
            });

            it('should format -60 seconds', () => {
                expect(formatDuration(-60)).toBe('-00:01:00');
            });

            it('should format -3600 seconds', () => {
                expect(formatDuration(-3600)).toBe('-01:00:00');
            });

            it('should format -3661 seconds', () => {
                expect(formatDuration(-3661)).toBe('-01:01:01');
            });

            it('should format -90000 seconds', () => {
                expect(formatDuration(-90000)).toBe('-25:00:00');
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null', () => {
                expect(formatDuration(null)).toBe('');
            });

            it('should return empty string for undefined', () => {
                expect(formatDuration(undefined)).toBe('');
            });

            it('should return empty string for empty string', () => {
                expect(formatDuration('')).toBe('');
            });

            it('should return empty string for boolean true', () => {
                expect(formatDuration(true)).toBe('');
            });

            it('should return empty string for boolean false', () => {
                expect(formatDuration(false)).toBe('');
            });

            it('should return empty string for Date object', () => {
                expect(formatDuration(new Date())).toBe('');
            });

            it('should return empty string for non-numeric string', () => {
                expect(formatDuration('hello')).toBe('');
            });

            it('should return empty string for NaN', () => {
                expect(formatDuration(NaN)).toBe('');
            });

            it('should return empty string for Infinity', () => {
                expect(formatDuration(Infinity)).toBe('');
            });

            it('should return empty string for -Infinity', () => {
                expect(formatDuration(-Infinity)).toBe('');
            });
        });

        describe('fraction rejection', () => {
            it('should return empty string for 3.5', () => {
                expect(formatDuration(3.5)).toBe('');
            });

            it('should return empty string for 0.1', () => {
                expect(formatDuration(0.1)).toBe('');
            });

            it('should return empty string for -2.7', () => {
                expect(formatDuration(-2.7)).toBe('');
            });

            it('should return empty string for string "3.5"', () => {
                expect(formatDuration('3.5')).toBe('');
            });

            it('should return empty string for string "1.0"', () => {
                expect(formatDuration('1.0')).toBe('');
            });
        });

        describe('edge cases', () => {
            it('should handle Number.MAX_SAFE_INTEGER', () => {
                const result = formatDuration(Number.MAX_SAFE_INTEGER);
                expect(result).toMatch(/^\d+:\d{2}:\d{2}$/);
                expect(result.length).toBeGreaterThan(8);
            });

            it('should handle negative Number.MAX_SAFE_INTEGER', () => {
                const result = formatDuration(-Number.MAX_SAFE_INTEGER);
                expect(result).toMatch(/^-\d+:\d{2}:\d{2}$/);
            });

            it('should format 86400 seconds as 24:00:00 (no day conversion)', () => {
                expect(formatDuration(86400)).toBe('24:00:00');
            });

            it('should pad single-digit hours', () => {
                expect(formatDuration(3600)).toBe('01:00:00');
            });

            it('should not pad multi-digit hours beyond 2 digits', () => {
                expect(formatDuration(360000)).toBe('100:00:00');
            });
        });
    });
});
