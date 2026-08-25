import { describe, it, expect, vi } from 'vitest';
import { cacheSchema, cacheSchemaByArgs } from '../schema-cache';
import {
    StringZod,
    CurrencyCodeZod,
    TimeZoneZod,
    UtcOffsetZod,
    DateStyleZod,
    SliceEndTextZod,
    UnitIdentifierZod,
    LocalizationZod,
    RequestMethodZod,
    ErrorReportingServiceZod,
    ErrorReportingApiKeyZod,
} from '../../index';

describe('cacheSchema', () => {
    it('builds the schema only once and returns the same instance', () => {
        const build = vi.fn(() => ({ schema: true }));
        const factory = cacheSchema(build);

        const first = factory();
        const second = factory();

        expect(build).toHaveBeenCalledTimes(1);
        expect(first).toBe(second);
    });

    it('is lazy — nothing is built until the first call', () => {
        const build = vi.fn(() => ({ schema: true }));
        cacheSchema(build);

        expect(build).not.toHaveBeenCalled();
    });

    it('keeps separate caches per wrapped factory', () => {
        const first = cacheSchema(() => ({ id: 1 }));
        const second = cacheSchema(() => ({ id: 2 }));

        expect(first()).not.toBe(second());
    });
});

describe('cacheSchemaByArgs', () => {
    it('builds once per distinct argument tuple', () => {
        const build = vi.fn((min: number, max: number) => ({ min, max }));
        const factory = cacheSchemaByArgs(build);

        const a = factory(1, 250);
        const b = factory(1, 250);
        const c = factory(1, 500);

        expect(build).toHaveBeenCalledTimes(2);
        expect(a).toBe(b);
        expect(c).not.toBe(a);
        expect(c).toEqual({ min: 1, max: 500 });
    });

    it('does not confuse different tuples that share a prefix', () => {
        const factory = cacheSchemaByArgs((min: number, max: number) => ({ min, max }));

        expect(factory(1, 10)).not.toBe(factory(1, 100));
        expect(factory(11, 0)).not.toBe(factory(1, 10));
    });

    it('stops caching above the entry limit but still returns a correct schema', () => {
        const build = vi.fn((max: number) => ({ max }));
        const factory = cacheSchemaByArgs(build);

        // Fill the cache to its 64-entry limit.
        for (let max = 0; max < 64; max++) factory(max);
        expect(build).toHaveBeenCalledTimes(64);

        // A cached tuple still avoids a rebuild...
        factory(0);
        expect(build).toHaveBeenCalledTimes(64);

        // ...while an overflowing one is rebuilt every time, yet stays correct.
        expect(factory(999)).toEqual({ max: 999 });
        expect(factory(999)).not.toBe(factory(999));
        expect(build).toHaveBeenCalledTimes(67);
    });
});

describe('cached zod factories', () => {
    const parameterlessFactories = [
        ['CurrencyCodeZod', CurrencyCodeZod],
        ['TimeZoneZod', TimeZoneZod],
        ['UtcOffsetZod', UtcOffsetZod],
        ['DateStyleZod', DateStyleZod],
        ['SliceEndTextZod', SliceEndTextZod],
        ['UnitIdentifierZod', UnitIdentifierZod],
        ['LocalizationZod', LocalizationZod],
        ['RequestMethodZod', RequestMethodZod],
        ['ErrorReportingServiceZod', ErrorReportingServiceZod],
        ['ErrorReportingApiKeyZod', ErrorReportingApiKeyZod],
    ] as const;

    it.each(parameterlessFactories)('%s returns the very same instance', (_name, factory) => {
        expect(factory()).toBe(factory());
    });

    it('StringZod caches per (min, max) pair', () => {
        expect(StringZod(1, 250)).toBe(StringZod(1, 250));
        expect(StringZod(1, 250)).not.toBe(StringZod(1, 500));
    });

    it('StringZod normalizes its defaults before the cache lookup', () => {
        expect(StringZod()).toBe(StringZod(1, 250));
        expect(StringZod(5)).toBe(StringZod(5, 250));
    });

    it('a shared instance keeps parsing correctly across calls', () => {
        expect(StringZod(1, 5).parse('abc')).toBe('abc');
        expect(StringZod(1, 5).parse(null)).toBeNull();
        expect(() => StringZod(1, 5).parse('too long value')).toThrow();
        // The bounds of one cache entry must not leak into another.
        expect(StringZod(1, 100).parse('too long value')).toBe('too long value');
        expect(StringZod(1, 5).parse('abc')).toBe('abc');
    });

    it('a cached enum instance still rejects invalid values', () => {
        expect(RequestMethodZod().parse('GET')).toBe('GET');
        expect(() => RequestMethodZod().parse('FETCH')).toThrow();
        expect(RequestMethodZod().parse('POST')).toBe('POST');
    });
});
