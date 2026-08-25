import { describe, it, expect } from 'vitest';
import { parseRange, RANGE_PATTERN } from '../mapping-range.helpers';

describe('mapping-range.helpers', () => {
    describe('parseRange', () => {
        it('parses an integer range', () => {
            expect(parseRange('0-25')).toEqual([0, 25]);
            expect(parseRange('11-999')).toEqual([11, 999]);
        });

        it('parses a decimal range', () => {
            expect(parseRange('26.5-50')).toEqual([26.5, 50]);
        });

        it('returns null for non-range keys', () => {
            expect(parseRange('active')).toBeNull();
            expect(parseRange('5')).toBeNull();
            expect(parseRange('')).toBeNull();
            expect(parseRange('-5')).toBeNull();
        });
    });

    describe('RANGE_PATTERN', () => {
        it('matches a valid range key', () => {
            expect(RANGE_PATTERN.test('1-10')).toBe(true);
        });

        it('does not match an exact key', () => {
            expect(RANGE_PATTERN.test('done')).toBe(false);
        });
    });
});
