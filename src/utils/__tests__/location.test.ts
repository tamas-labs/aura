import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getOrigin, getHref, getParameter } from '../location';

describe('location utils', () => {
    const TEST_ORIGIN = 'https://example.com';

    // Before mocking window.location
    const mockLocation = {
        origin: TEST_ORIGIN,
        href: 'https://example.com/admin/users/resources',
    };

    beforeEach(() => {
        // Mock window.location
        vi.stubGlobal('location', mockLocation);
    });

    describe('getOrigin', () => {
        it('returns the origin (protocol + host)', () => {
            const result = getOrigin();
            expect(result).toBe(TEST_ORIGIN);
        });

        it('the origin does not contain a path', () => {
            const result = getOrigin();
            expect(result).not.toContain('/admin');
            expect(result).not.toContain('/users');
        });
    });

    describe('getHref', () => {
        it('returns the full URL', () => {
            const result = getHref();
            expect(result).toBe('https://example.com/admin/users/resources');
        });

        it('the href contains the origin', () => {
            const result = getHref();
            expect(result).toContain(TEST_ORIGIN);
        });

        it('the href contains the path', () => {
            const result = getHref();
            expect(result).toContain('/admin/users/resources');
        });
    });

    describe('getParameter', () => {
        it('returns the URL without the origin', () => {
            const result = getParameter();
            expect(result).toBe('admin/users/resources');
        });

        it('the result does not contain the origin', () => {
            const result = getParameter();
            expect(result).not.toContain('https://');
            expect(result).not.toContain(TEST_ORIGIN.replace('https://', ''));
        });

        it('the result does not start with /', () => {
            const result = getParameter();
            expect(result.startsWith('/')).toBe(false);
        });

        it('works with different URLs', () => {
            // Change the location
            Object.defineProperty(window, 'location', {
                value: {
                    origin: 'http://localhost:3000',
                    href: 'http://localhost:3000/dashboard/settings',
                },
                writable: true,
                configurable: true,
            });

            const result = getParameter();
            expect(result).toBe('dashboard/settings');
        });

        it('handles the root path', () => {
            Object.defineProperty(window, 'location', {
                value: {
                    origin: TEST_ORIGIN,
                    href: `${TEST_ORIGIN}/`,
                },
                writable: true,
                configurable: true,
            });

            const result = getParameter();
            expect(result).toBe('');
        });
    });

    describe('edge cases', () => {
        it('works with HTTPS', () => {
            Object.defineProperty(window, 'location', {
                value: {
                    origin: 'https://secure.example.com',
                    href: 'https://secure.example.com/api/v1/users',
                },
                writable: true,
                configurable: true,
            });

            expect(getOrigin()).toBe('https://secure.example.com');
            expect(getParameter()).toBe('api/v1/users');
        });

        it('works with HTTP', () => {
            Object.defineProperty(window, 'location', {
                value: {
                    origin: 'http://localhost:8080',
                    href: 'http://localhost:8080/test/path',
                },
                writable: true,
                configurable: true,
            });

            expect(getOrigin()).toBe('http://localhost:8080');
            expect(getParameter()).toBe('test/path');
        });

        it('works with query parameters', () => {
            Object.defineProperty(window, 'location', {
                value: {
                    origin: TEST_ORIGIN,
                    href: `${TEST_ORIGIN}/search?q=test&page=1`,
                },
                writable: true,
                configurable: true,
            });

            const result = getParameter();
            expect(result).toBe('search?q=test&page=1');
        });

        it('works with a hash', () => {
            Object.defineProperty(window, 'location', {
                value: {
                    origin: TEST_ORIGIN,
                    href: `${TEST_ORIGIN}/page#section`,
                },
                writable: true,
                configurable: true,
            });

            const result = getParameter();
            expect(result).toBe('page#section');
        });
    });
});
