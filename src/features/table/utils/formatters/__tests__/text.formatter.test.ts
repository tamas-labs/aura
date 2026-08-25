import { describe, it, expect } from 'vitest';
import {
    formatSlice,
    formatPadStart,
    formatPadEnd,
    formatPad,
    formatUppercase,
    formatLowercase,
    formatCapitalize,
} from '../text.formatter';

describe('text.formatter', () => {
    describe('formatSlice', () => {
        describe('valid cases', () => {
            it('should slice text to specified length', () => {
                const result = formatSlice('Hello World', { length: 5 });
                expect(result).toBe('Hello');
            });

            it('should slice text and add endWith', () => {
                const result = formatSlice('Hello World', { length: 5, endWith: '...' });
                expect(result).toBe('Hello...');
            });

            it('should return original text if shorter than length', () => {
                const result = formatSlice('Hi', { length: 10 });
                expect(result).toBe('Hi');
            });

            it('should handle number values', () => {
                const result = formatSlice(12345, { length: 3 });
                expect(result).toBe('123');
            });

            it('should handle boolean values', () => {
                const result = formatSlice(true, { length: 3 });
                expect(result).toBe('tru');
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null', () => {
                const result = formatSlice(null, { length: 5 });
                expect(result).toBe('');
            });

            it('should return empty string for undefined', () => {
                const result = formatSlice(undefined, { length: 5 });
                expect(result).toBe('');
            });
        });

        describe('edge cases', () => {
            it('should handle empty string', () => {
                const result = formatSlice('', { length: 5 });
                expect(result).toBe('');
            });

            it('should handle exact length match', () => {
                const result = formatSlice('Hello', { length: 5 });
                expect(result).toBe('Hello');
            });

            it('should handle length 0', () => {
                const result = formatSlice('Hello', { length: 0 });
                expect(result).toBe('');
            });
        });
    });

    describe('formatPadStart', () => {
        describe('valid cases', () => {
            it('should pad start with default space', () => {
                const result = formatPadStart('42', 5);
                expect(result).toBe('   42');
            });

            it('should pad start with custom character', () => {
                const result = formatPadStart('42', 5, '0');
                expect(result).toBe('00042');
            });

            it('should handle number values', () => {
                const result = formatPadStart(123, 5, '0');
                expect(result).toBe('00123');
            });

            it('should not pad if already at length', () => {
                const result = formatPadStart('Hello', 5);
                expect(result).toBe('Hello');
            });

            it('should not pad if longer than length', () => {
                const result = formatPadStart('Hello World', 5);
                expect(result).toBe('Hello World');
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null', () => {
                const result = formatPadStart(null, 5);
                expect(result).toBe('');
            });

            it('should return empty string for undefined', () => {
                const result = formatPadStart(undefined, 5);
                expect(result).toBe('');
            });
        });

        describe('edge cases', () => {
            it('should handle empty string', () => {
                const result = formatPadStart('', 5, '0');
                expect(result).toBe('00000');
            });

            it('should handle multi-character pad string', () => {
                const result = formatPadStart('Hi', 6, 'ab');
                expect(result).toBe('ababHi');
            });
        });
    });

    describe('formatPadEnd', () => {
        describe('valid cases', () => {
            it('should pad end with default space', () => {
                const result = formatPadEnd('Hi', 5);
                expect(result).toBe('Hi   ');
            });

            it('should pad end with custom character', () => {
                const result = formatPadEnd('Hi', 5, '.');
                expect(result).toBe('Hi...');
            });

            it('should handle number values', () => {
                const result = formatPadEnd(42, 5, '0');
                expect(result).toBe('42000');
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null', () => {
                const result = formatPadEnd(null, 5);
                expect(result).toBe('');
            });

            it('should return empty string for undefined', () => {
                const result = formatPadEnd(undefined, 5);
                expect(result).toBe('');
            });
        });
    });

    describe('formatPad', () => {
        describe('position: both', () => {
            it('should pad both sides evenly', () => {
                const result = formatPad('Hi', { length: 6, char: '-', position: 'both' });
                expect(result).toBe('--Hi--');
            });

            it('should pad both sides with odd difference', () => {
                const result = formatPad('Hi', { length: 7, char: '*', position: 'both' });
                // Odd difference: 7-2=5, start gets 2, end gets 3
                expect(result).toBe('**Hi***');
            });

            it('should use default space for padding', () => {
                const result = formatPad('X', { length: 5, position: 'both' });
                expect(result).toBe('  X  ');
            });
        });

        describe('position: start', () => {
            it('should delegate to padStart', () => {
                const result = formatPad('42', { length: 5, char: '0', position: 'start' });
                expect(result).toBe('00042');
            });
        });

        describe('position: end', () => {
            it('should delegate to padEnd', () => {
                const result = formatPad('42', { length: 5, char: '0', position: 'end' });
                expect(result).toBe('42000');
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null', () => {
                const result = formatPad(null, { length: 5, position: 'both' });
                expect(result).toBe('');
            });

            it('should return empty string for undefined', () => {
                const result = formatPad(undefined, { length: 5, position: 'both' });
                expect(result).toBe('');
            });
        });

        describe('edge cases', () => {
            it('should not pad if already at length', () => {
                const result = formatPad('Hello', { length: 5, position: 'both' });
                expect(result).toBe('Hello');
            });

            it('should not pad if longer than length', () => {
                const result = formatPad('Hello World', { length: 5, position: 'both' });
                expect(result).toBe('Hello World');
            });
        });
    });

    describe('formatUppercase', () => {
        it('should uppercase text', () => {
            expect(formatUppercase('hello')).toBe('HELLO');
        });
        it('should handle non-string values', () => {
            expect(formatUppercase(123)).toBe('123');
        });
        it('should handle null/undefined', () => {
            expect(formatUppercase(null)).toBe('');
            expect(formatUppercase(undefined)).toBe('');
        });
    });

    describe('formatLowercase', () => {
        it('should lowercase text', () => {
            expect(formatLowercase('HELLO')).toBe('hello');
        });
        it('should handle non-string values', () => {
            expect(formatLowercase(123)).toBe('123');
        });
        it('should handle null/undefined', () => {
            expect(formatLowercase(null)).toBe('');
            expect(formatLowercase(undefined)).toBe('');
        });
    });

    describe('formatCapitalize', () => {
        it('should capitalize first letter', () => {
            expect(formatCapitalize('hello')).toBe('Hello');
        });
        it('should lowercase the rest of the string', () => {
            expect(formatCapitalize('HELLO')).toBe('Hello');
            expect(formatCapitalize('hELLO')).toBe('Hello');
        });
        it('should handle empty string', () => {
            expect(formatCapitalize('')).toBe('');
        });
        it('should handle non-string values', () => {
            expect(formatCapitalize(123)).toBe('123');
        });
        it('should handle null/undefined', () => {
            expect(formatCapitalize(null)).toBe('');
            expect(formatCapitalize(undefined)).toBe('');
        });
    });
});
