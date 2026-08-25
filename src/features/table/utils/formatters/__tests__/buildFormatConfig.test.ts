import { describe, it, expect } from 'vitest';
import { buildFormatConfig } from '../buildFormatConfig';

describe('buildFormatConfig', () => {
    // -------------------------------------------------------------------------
    // empty / minimal input
    // -------------------------------------------------------------------------
    describe('empty / minimal input', () => {
        it('should return all-null config for empty object', () => {
            const result = buildFormatConfig({});

            expect(result.number).toBeNull();
            expect(result.currency).toBeNull();
            expect(result.currencyCode).toBeUndefined();
            expect(result.unit).toBeNull();
            expect(result.date).toBeNull();
            expect(result.datetime).toBeNull();
            expect(result.phone).toBeNull();
            expect(result.time).toBeNull();
            expect(result.raw).toBeNull();
            expect(result.slice).toBeNull();
            expect(result.sliceEnd).toBeNull();
            expect(result.pad).toBeNull();
            expect(result.padStart).toBeNull();
            expect(result.padEnd).toBeNull();
            expect(result.chars).toBeNull();
            expect(result.uppercase).toBeNull();
            expect(result.lowercase).toBeNull();
            expect(result.capitalize).toBeNull();
        });

        it('should return object with all expected keys', () => {
            const result = buildFormatConfig({});
            const keys = Object.keys(result).sort();

            expect(keys).toEqual([
                'capitalize',
                'chars',
                'currency',
                'currencyCode',
                'date',
                'datetime',
                'lowercase',
                'number',
                'pad',
                'padEnd',
                'padStart',
                'phone',
                'raw',
                'slice',
                'sliceEnd',
                'time',
                'unit',
                'uppercase',
            ]);
        });
    });

    // -------------------------------------------------------------------------
    // single field
    // -------------------------------------------------------------------------
    describe('single field set', () => {
        it('should pass through number true', () => {
            const result = buildFormatConfig({ number: true });

            expect(result.number).toBe(true);
            expect(result.currency).toBeNull();
        });

        it('should pass through currency string', () => {
            const result = buildFormatConfig({ currency: 'EUR' });

            expect(result.currency).toBe('EUR');
            expect(result.number).toBeNull();
        });

        it('should pass through currency boolean', () => {
            const result = buildFormatConfig({ currency: true });

            expect(result.currency).toBe(true);
        });

        it('should pass through currencyCode', () => {
            const result = buildFormatConfig({ currencyCode: 'USD' });

            expect(result.currencyCode).toBe('USD');
        });

        it('should pass through unit', () => {
            const result = buildFormatConfig({ unit: 'GB' });

            expect(result.unit).toBe('GB');
        });

        it('should pass through date true', () => {
            const result = buildFormatConfig({ date: true });

            expect(result.date).toBe(true);
        });

        it('should pass through datetime true', () => {
            const result = buildFormatConfig({ datetime: true });

            expect(result.datetime).toBe(true);
        });

        it('should pass through phone true', () => {
            const result = buildFormatConfig({ phone: true });

            expect(result.phone).toBe(true);
        });

        it('should pass through time true', () => {
            const result = buildFormatConfig({ time: true });

            expect(result.time).toBe(true);
        });

        it('should pass through raw true', () => {
            const result = buildFormatConfig({ raw: true });

            expect(result.raw).toBe(true);
        });

        it('should pass through raw string', () => {
            const result = buildFormatConfig({ raw: 'sanitize' });

            expect(result.raw).toBe('sanitize');
        });

        it('should pass through slice', () => {
            const result = buildFormatConfig({ slice: 25 });

            expect(result.slice).toBe(25);
        });

        it('should pass through sliceEnd', () => {
            const result = buildFormatConfig({ sliceEnd: '...' });

            expect(result.sliceEnd).toBe('...');
        });

        it('should pass through pad', () => {
            const result = buildFormatConfig({ pad: 10 });

            expect(result.pad).toBe(10);
        });

        it('should pass through padStart', () => {
            const result = buildFormatConfig({ padStart: 5 });

            expect(result.padStart).toBe(5);
        });

        it('should pass through padEnd', () => {
            const result = buildFormatConfig({ padEnd: 3 });

            expect(result.padEnd).toBe(3);
        });

        it('should pass through chars', () => {
            const result = buildFormatConfig({ chars: '0' });

            expect(result.chars).toBe('0');
        });

        it('should pass through uppercase', () => {
            const result = buildFormatConfig({ uppercase: true });

            expect(result.uppercase).toBe(true);
        });

        it('should pass through lowercase', () => {
            const result = buildFormatConfig({ lowercase: true });

            expect(result.lowercase).toBe(true);
        });

        it('should pass through capitalize', () => {
            const result = buildFormatConfig({ capitalize: true });

            expect(result.capitalize).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // multiple fields
    // -------------------------------------------------------------------------
    describe('multiple fields', () => {
        it('should combine number + padStart + chars', () => {
            const result = buildFormatConfig({ number: true, padStart: 5, chars: '0' });

            expect(result.number).toBe(true);
            expect(result.padStart).toBe(5);
            expect(result.chars).toBe('0');
            expect(result.currency).toBeNull();
            expect(result.date).toBeNull();
        });

        it('should combine date + uppercase + slice', () => {
            const result = buildFormatConfig({ date: true, uppercase: true, slice: 10 });

            expect(result.date).toBe(true);
            expect(result.uppercase).toBe(true);
            expect(result.slice).toBe(10);
        });

        it('should accept all fields set at once', () => {
            const result = buildFormatConfig({
                number: true,
                currency: 'HUF',
                currencyCode: 'HUF',
                unit: '°C',
                date: false,
                datetime: false,
                phone: false,
                time: false,
                raw: true,
                slice: 100,
                sliceEnd: '…',
                pad: 8,
                padStart: 5,
                padEnd: 3,
                chars: '0',
                uppercase: false,
                lowercase: true,
                capitalize: false,
            });

            expect(result.number).toBe(true);
            expect(result.currency).toBe('HUF');
            expect(result.currencyCode).toBe('HUF');
            expect(result.unit).toBe('°C');
            expect(result.date).toBe(false);
            expect(result.datetime).toBe(false);
            expect(result.phone).toBe(false);
            expect(result.time).toBe(false);
            expect(result.raw).toBe(true);
            expect(result.slice).toBe(100);
            expect(result.sliceEnd).toBe('…');
            expect(result.pad).toBe(8);
            expect(result.padStart).toBe(5);
            expect(result.padEnd).toBe(3);
            expect(result.chars).toBe('0');
            expect(result.uppercase).toBe(false);
            expect(result.lowercase).toBe(true);
            expect(result.capitalize).toBe(false);
        });
    });

    // -------------------------------------------------------------------------
    // null normalization
    // -------------------------------------------------------------------------
    describe('null normalization', () => {
        it('should normalize explicit null to null', () => {
            const result = buildFormatConfig({ number: null, currency: null });

            expect(result.number).toBeNull();
            expect(result.currency).toBeNull();
        });

        it('should normalize undefined (missing) to null', () => {
            const result = buildFormatConfig({ number: true });

            // Fields not in input become null via ??
            expect(result.currency).toBeNull();
            expect(result.date).toBeNull();
            expect(result.slice).toBeNull();
        });
    });

    // -------------------------------------------------------------------------
    // edge cases
    // -------------------------------------------------------------------------
    describe('edge cases', () => {
        it('should ignore extra properties not in FormatConfigSource', () => {
            const result = buildFormatConfig({
                number: true,
                color: 'primary',
                background: 'success',
                class: 'fw-bold',
            } as any);

            expect(result.number).toBe(true);
            expect(result).not.toHaveProperty('color');
            expect(result).not.toHaveProperty('background');
            expect(result).not.toHaveProperty('class');
        });

        it('should return a new object each time', () => {
            const input = { number: true };
            const result1 = buildFormatConfig(input);
            const result2 = buildFormatConfig(input);

            expect(result1).not.toBe(result2);
            expect(result1).toEqual(result2);
        });

        it('should not modify the input object', () => {
            const input = { number: true, slice: 5 };
            const inputCopy = { ...input };

            buildFormatConfig(input);

            expect(input).toEqual(inputCopy);
        });

        it('should handle false values correctly (not convert to null)', () => {
            const result = buildFormatConfig({
                number: false,
                currency: false,
                uppercase: false,
                lowercase: false,
            });

            // false ?? null → false (not null)
            expect(result.number).toBe(false);
            expect(result.currency).toBe(false);
            expect(result.uppercase).toBe(false);
            expect(result.lowercase).toBe(false);
        });

        it('should handle zero values correctly (not convert to null)', () => {
            const result = buildFormatConfig({
                slice: 0,
                padStart: 0,
                padEnd: 0,
                pad: 0,
            });

            // 0 ?? null → 0 (not null)
            expect(result.slice).toBe(0);
            expect(result.padStart).toBe(0);
            expect(result.padEnd).toBe(0);
            expect(result.pad).toBe(0);
        });

        it('should handle empty string correctly (not convert to null)', () => {
            const result = buildFormatConfig({
                unit: '' as any,
                chars: '' as any,
                sliceEnd: '' as any,
            });

            // '' ?? null → '' (not null — empty string is not nullish)
            expect(result.unit).toBe('');
            expect(result.chars).toBe('');
            expect(result.sliceEnd).toBe('');
        });
    });
});
