import { describe, it, expect } from 'vitest';
import { CurrencyCodeZod } from '../currency-code.zod';

describe('CurrencyCodeZod', () => {
    describe('valid ISO 4217 currency codes', () => {
        it('should accept HUF', () => {
            const result = CurrencyCodeZod().parse('HUF');
            expect(result).toBe('HUF');
        });

        it('should accept USD', () => {
            const result = CurrencyCodeZod().parse('USD');
            expect(result).toBe('USD');
        });

        it('should accept EUR', () => {
            const result = CurrencyCodeZod().parse('EUR');
            expect(result).toBe('EUR');
        });

        it('should accept GBP', () => {
            const result = CurrencyCodeZod().parse('GBP');
            expect(result).toBe('GBP');
        });

        it('should accept JPY', () => {
            const result = CurrencyCodeZod().parse('JPY');
            expect(result).toBe('JPY');
        });

        it('should accept CHF', () => {
            const result = CurrencyCodeZod().parse('CHF');
            expect(result).toBe('CHF');
        });

        it('should accept CAD', () => {
            const result = CurrencyCodeZod().parse('CAD');
            expect(result).toBe('CAD');
        });

        it('should accept AUD', () => {
            const result = CurrencyCodeZod().parse('AUD');
            expect(result).toBe('AUD');
        });

        it('should accept CNY', () => {
            const result = CurrencyCodeZod().parse('CNY');
            expect(result).toBe('CNY');
        });

        it('should accept INR', () => {
            const result = CurrencyCodeZod().parse('INR');
            expect(result).toBe('INR');
        });

        it('should accept null value', () => {
            const result = CurrencyCodeZod().parse(null);
            expect(result).toBeNull();
        });
    });

    describe('invalid currency codes', () => {
        it('should throw error for invalid code', () => {
            expect(() => CurrencyCodeZod().parse('INVALID')).toThrow();
        });

        it('should throw error for lowercase code', () => {
            expect(() => CurrencyCodeZod().parse('usd')).toThrow();
        });

        it('should throw error for mixed case code', () => {
            expect(() => CurrencyCodeZod().parse('Usd')).toThrow();
        });

        it('should throw error for too short code', () => {
            expect(() => CurrencyCodeZod().parse('US')).toThrow();
        });

        it('should throw error for too long code', () => {
            expect(() => CurrencyCodeZod().parse('USDD')).toThrow();
        });

        it('should throw error for numeric code', () => {
            expect(() => CurrencyCodeZod().parse('123')).toThrow();
        });

        it('should throw error for empty string', () => {
            expect(() => CurrencyCodeZod().parse('')).toThrow();
        });
    });

    describe('invalid types', () => {
        it('should throw error for number type', () => {
            expect(() => CurrencyCodeZod().parse(123)).toThrow();
        });

        it('should throw error for boolean type', () => {
            expect(() => CurrencyCodeZod().parse(true)).toThrow();
        });

        it('should throw error for object type', () => {
            expect(() => CurrencyCodeZod().parse({})).toThrow();
        });

        it('should throw error for array type', () => {
            expect(() => CurrencyCodeZod().parse([])).toThrow();
        });

        it('should throw error for undefined', () => {
            expect(() => CurrencyCodeZod().parse(undefined)).toThrow();
        });
    });

    describe('safeParse validation', () => {
        it('should return success=true for valid currency code', () => {
            const result = CurrencyCodeZod().safeParse('EUR');
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBe('EUR');
            }
        });

        it('should return success=false for invalid currency code', () => {
            const result = CurrencyCodeZod().safeParse('INVALID');
            expect(result.success).toBe(false);
        });

        it('should return success=true for null', () => {
            const result = CurrencyCodeZod().safeParse(null);
            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeNull();
            }
        });

        it('should return success=false for invalid type', () => {
            const result = CurrencyCodeZod().safeParse(123);
            expect(result.success).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should accept all major currencies', () => {
            const majorCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
            majorCurrencies.forEach(currency => {
                const result = CurrencyCodeZod().parse(currency);
                expect(result).toBe(currency);
            });
        });

        it('should accept less common currencies', () => {
            const lesserCurrencies = ['RON', 'PLN', 'CZK', 'SEK', 'NOK', 'DKK'];
            lesserCurrencies.forEach(currency => {
                const result = CurrencyCodeZod().parse(currency);
                expect(result).toBe(currency);
            });
        });

        it('should accept exotic currencies', () => {
            const exoticCurrencies = ['XOF', 'XAF', 'XPF', 'XCD', 'XDR'];
            exoticCurrencies.forEach(currency => {
                const result = CurrencyCodeZod().parse(currency);
                expect(result).toBe(currency);
            });
        });
    });
});
