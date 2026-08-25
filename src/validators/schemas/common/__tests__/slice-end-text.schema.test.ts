import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateSliceEndText } from '../slice-end-text.schema';

describe('SliceEndText Schema Validator', () => {
    const TEST_STORE_ID = 'test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('validateSliceEndText - Valid inputs', () => {
        it('should accept three dots', () => {
            const result = validateSliceEndText('...', TEST_STORE_ID);
            expect(result).toBe('...');
        });

        it('should accept ellipsis character', () => {
            const result = validateSliceEndText('…', TEST_STORE_ID);
            expect(result).toBe('…');
        });

        it('should accept empty string', () => {
            const result = validateSliceEndText('', TEST_STORE_ID);
            expect(result).toBe('');
        });

        it('should accept custom text', () => {
            const result = validateSliceEndText(' [...]', TEST_STORE_ID);
            expect(result).toBe(' [...]');
        });

        it('should accept text up to 10 characters', () => {
            const result = validateSliceEndText('1234567890', TEST_STORE_ID);
            expect(result).toBe('1234567890');
        });

        it('should accept null value', () => {
            const result = validateSliceEndText(null, TEST_STORE_ID);
            expect(result).toBeNull();
        });
    });

    describe('validateSliceEndText - Invalid inputs', () => {
        it('should return fallback for string longer than 10 chars', () => {
            const tooLong = 'This is too long';
            const result = validateSliceEndText(tooLong, TEST_STORE_ID);
            expect(result).toBe('...'); // Default fallback
        });

        it('should return fallback for invalid type (number)', () => {
            const result = validateSliceEndText(123, TEST_STORE_ID);
            expect(result).toBe('...');
        });

        it('should return fallback for invalid type (boolean)', () => {
            const result = validateSliceEndText(true, TEST_STORE_ID);
            expect(result).toBe('...');
        });

        it('should return fallback for invalid type (object)', () => {
            const result = validateSliceEndText({}, TEST_STORE_ID);
            expect(result).toBe('...');
        });

        it('should return fallback for invalid type (array)', () => {
            const result = validateSliceEndText([], TEST_STORE_ID);
            expect(result).toBe('...');
        });

        it('should return fallback for undefined', () => {
            const result = validateSliceEndText(undefined, TEST_STORE_ID);
            expect(result).toBe('...');
        });
    });

    describe('validateSliceEndText - Fallback behavior', () => {
        it('should return ... as default fallback', () => {
            const result = validateSliceEndText('This text is way too long', TEST_STORE_ID);
            expect(result).toBe('...');
        });
    });

    describe('validateSliceEndText - Edge cases', () => {
        it('should accept single character', () => {
            const result = validateSliceEndText('.', TEST_STORE_ID);
            expect(result).toBe('.');
        });

        it('should accept exactly 10 characters', () => {
            const result = validateSliceEndText('abcdefghij', TEST_STORE_ID);
            expect(result).toBe('abcdefghij');
        });

        it('should reject 11 characters', () => {
            const result = validateSliceEndText('abcdefghijk', TEST_STORE_ID);
            expect(result).toBe('...');
        });
    });
});
