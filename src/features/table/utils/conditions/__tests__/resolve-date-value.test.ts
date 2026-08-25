import { describe, it, expect } from 'vitest';
import { resolveDateValue } from '../resolve-date-value';

describe('resolveDateValue', () => {
    describe('special date strings', () => {
        it('should resolve "now" to current date', () => {
            const result = resolveDateValue('now');
            expect(result).toBeInstanceOf(Date);
            const diff = Math.abs(result!.getTime() - new Date().getTime());
            expect(diff).toBeLessThan(1000); // Within 1 second
        });

        it('should resolve "today" to today at 00:00:00', () => {
            const result = resolveDateValue('today');
            expect(result).toBeInstanceOf(Date);
            expect(result!.getHours()).toBe(0);
            expect(result!.getMinutes()).toBe(0);
            expect(result!.getSeconds()).toBe(0);
        });

        it('should resolve "yesterday" to yesterday at 00:00:00', () => {
            const result = resolveDateValue('yesterday');
            const expected = new Date();
            expected.setDate(expected.getDate() - 1);
            expected.setHours(0, 0, 0, 0);

            expect(result).toBeInstanceOf(Date);
            expect(result!.toDateString()).toBe(expected.toDateString());
        });

        it('should resolve "tomorrow" to tomorrow at 00:00:00', () => {
            const result = resolveDateValue('tomorrow');
            const expected = new Date();
            expected.setDate(expected.getDate() + 1);
            expected.setHours(0, 0, 0, 0);

            expect(result).toBeInstanceOf(Date);
            expect(result!.toDateString()).toBe(expected.toDateString());
        });

        it('should be case insensitive', () => {
            expect(resolveDateValue('NOW')).toBeInstanceOf(Date);
            expect(resolveDateValue('Today')).toBeInstanceOf(Date);
            expect(resolveDateValue('YESTERDAY')).toBeInstanceOf(Date);
        });
    });

    describe('ISO date strings', () => {
        it('should parse valid ISO date string', () => {
            const result = resolveDateValue('2024-01-15');
            expect(result).toBeInstanceOf(Date);
            expect(result!.getFullYear()).toBe(2024);
        });

        it('should parse ISO datetime string', () => {
            const result = resolveDateValue('2024-01-15T10:30:00.000Z');
            expect(result).toBeInstanceOf(Date);
        });
    });

    describe('Date objects', () => {
        it('should return valid Date object as-is', () => {
            const date = new Date('2024-01-01');
            const result = resolveDateValue(date);
            expect(result).toBe(date);
        });

        it('should return null for invalid Date object', () => {
            const invalidDate = new Date('invalid');
            const result = resolveDateValue(invalidDate);
            expect(result).toBeNull();
        });
    });

    describe('invalid inputs', () => {
        it('should return null for non-string non-Date', () => {
            expect(resolveDateValue(123)).toBeNull();
            expect(resolveDateValue(true)).toBeNull();
            expect(resolveDateValue({})).toBeNull();
            expect(resolveDateValue([])).toBeNull();
        });

        it('should return null for invalid date string', () => {
            expect(resolveDateValue('not-a-date')).toBeNull();
            expect(resolveDateValue('2024-13-45')).toBeNull();
        });

        it('should return null for null/undefined', () => {
            expect(resolveDateValue(null)).toBeNull();
            expect(resolveDateValue(undefined)).toBeNull();
        });
    });
});
