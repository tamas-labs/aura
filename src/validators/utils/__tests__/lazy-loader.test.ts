import { describe, it, expect, vi } from 'vitest';
import { createLazyValidator } from '../lazy-loader';

describe('createLazyValidator', () => {
    it('should load module on first call', async () => {
        const mockValidator = vi.fn().mockReturnValue(true);
        const mockModule = { validate: mockValidator };
        const importFn = vi.fn().mockResolvedValue(mockModule);

        const lazyValidate = createLazyValidator(
            () => importFn() as Promise<typeof mockModule>,
            'validate'
        );

        expect(importFn).not.toHaveBeenCalled();

        const result = await lazyValidate('test');

        expect(importFn).toHaveBeenCalledTimes(1);
        expect(mockValidator).toHaveBeenCalledWith('test');
        expect(result).toBe(true);
    });

    it('should use cached module on subsequent calls', async () => {
        const mockValidator = vi.fn().mockReturnValue(true);
        const mockModule = { validate: mockValidator };
        const importFn = vi.fn().mockResolvedValue(mockModule);

        const lazyValidate = createLazyValidator(
            () => importFn() as Promise<typeof mockModule>,
            'validate'
        );

        await lazyValidate('first');
        await lazyValidate('second');

        expect(importFn).toHaveBeenCalledTimes(1);
        expect(mockValidator).toHaveBeenCalledTimes(2);
    });

    it('should handle parallel calls correctly', async () => {
        const mockValidator = vi.fn().mockReturnValue(true);
        const mockModule = { validate: mockValidator };
        const resolveModule = (resolve: (value: typeof mockModule) => void) => {
            setTimeout(() => resolve(mockModule), 10);
        };
        const importFn = vi.fn().mockImplementation(() => new Promise(resolveModule));

        const lazyValidate = createLazyValidator(
            () => importFn() as Promise<typeof mockModule>,
            'validate'
        );

        const [result1, result2] = await Promise.all([
            lazyValidate('first'),
            lazyValidate('second'),
        ]);

        expect(importFn).toHaveBeenCalledTimes(1);
        expect(result1).toBe(true);
        expect(result2).toBe(true);
    });

    it('should throw error if export is not a function', async () => {
        const mockModule = { validate: 'not a function' as unknown as () => boolean };
        const importFn = vi.fn().mockResolvedValue(mockModule);

        const lazyValidate = createLazyValidator(
            () => importFn() as Promise<typeof mockModule>,
            'validate'
        );

        await expect(lazyValidate()).rejects.toThrow('Export "validate" is not a function');
    });

    it('should pass multiple arguments to the validator', async () => {
        const mockValidator = vi.fn().mockReturnValue('result');
        const mockModule = { process: mockValidator };
        const importFn = vi.fn().mockResolvedValue(mockModule);

        const lazyProcess = createLazyValidator(
            () => importFn() as Promise<typeof mockModule>,
            'process'
        );

        const result = await lazyProcess('arg1', 'arg2', 'arg3');

        expect(mockValidator).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
        expect(result).toBe('result');
    });

    it('should handle validator returning undefined', async () => {
        const mockValidator = vi.fn().mockReturnValue(undefined);
        const mockModule = { validate: mockValidator };
        const importFn = vi.fn().mockResolvedValue(mockModule);

        const lazyValidate = createLazyValidator(
            () => importFn() as Promise<typeof mockModule>,
            'validate'
        );

        const result = await lazyValidate('test');

        expect(result).toBeUndefined();
    });

    it('should handle validator throwing error', async () => {
        const mockValidator = vi.fn().mockImplementation(() => {
            throw new Error('Validation failed');
        });
        const mockModule = { validate: mockValidator };
        const importFn = vi.fn().mockResolvedValue(mockModule);

        const lazyValidate = createLazyValidator(
            () => importFn() as Promise<typeof mockModule>,
            'validate'
        );

        await expect(lazyValidate('test')).rejects.toThrow('Validation failed');
    });

    it('should handle import rejection', async () => {
        const importFn = vi.fn().mockRejectedValue(new Error('Module not found'));

        const lazyValidate = createLazyValidator(
            () => importFn() as Promise<{ validate: () => boolean }>,
            'validate'
        );

        await expect(lazyValidate()).rejects.toThrow('Module not found');
    });

    it('should handle different export names', async () => {
        const mockParse = vi.fn().mockReturnValue({ parsed: true });
        const mockModule = { parse: mockParse };
        const importFn = vi.fn().mockResolvedValue(mockModule);

        const lazyParse = createLazyValidator(
            () => importFn() as Promise<typeof mockModule>,
            'parse'
        );

        const result = await lazyParse('data');

        expect(mockParse).toHaveBeenCalledWith('data');
        expect(result).toEqual({ parsed: true });
    });

    it('should handle validator returning complex objects', async () => {
        const complexResult = { valid: true, errors: [], warnings: ['minor issue'] };
        const mockValidator = vi.fn().mockReturnValue(complexResult);
        const mockModule = { validate: mockValidator };
        const importFn = vi.fn().mockResolvedValue(mockModule);

        const lazyValidate = createLazyValidator(
            () => importFn() as Promise<typeof mockModule>,
            'validate'
        );

        const result = await lazyValidate({ field: 'value' });

        expect(result).toEqual(complexResult);
    });

    it('should handle no arguments', async () => {
        const mockValidator = vi.fn().mockReturnValue(42);
        const mockModule = { getValue: mockValidator };
        const importFn = vi.fn().mockResolvedValue(mockModule);

        const lazyGetValue = createLazyValidator(
            () => importFn() as Promise<typeof mockModule>,
            'getValue'
        );

        const result = await lazyGetValue();

        expect(mockValidator).toHaveBeenCalledWith();
        expect(result).toBe(42);
    });
});
