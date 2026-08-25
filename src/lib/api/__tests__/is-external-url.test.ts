import { describe, it, expect } from 'vitest';
import { isExternalUrl } from '../is-external-url';

describe('isExternalUrl', () => {
    describe('same-origin / nem külső', () => {
        it('üres string esetén false', () => {
            expect(isExternalUrl('')).toBe(false);
        });

        it('null esetén false', () => {
            expect(isExternalUrl(null)).toBe(false);
        });

        it('undefined esetén false', () => {
            expect(isExternalUrl(undefined)).toBe(false);
        });

        it('relatív (gyökér) URL esetén false', () => {
            expect(isExternalUrl('/api/data')).toBe(false);
        });

        it('relatív (pont nélküli) URL esetén false', () => {
            expect(isExternalUrl('api/data')).toBe(false);
        });

        it('az aktuális origin abszolút URL-je esetén false', () => {
            expect(isExternalUrl(`${window.location.origin}/api/data`)).toBe(false);
        });
    });

    describe('cross-origin / külső', () => {
        it('más host abszolút URL-je esetén true', () => {
            expect(isExternalUrl('https://evil.com/api')).toBe(true);
        });

        it('protokoll-relatív, más host esetén true', () => {
            expect(isExternalUrl('//evil.com/api')).toBe(true);
        });

        it('azonos host, eltérő port esetén true', () => {
            // Swapping the current origin for a different port makes it a distinct origin
            const url = window.location.origin.replace(/:\d+$/, ':9999');
            const external = url === window.location.origin ? 'http://localhost:9999' : url;
            expect(isExternalUrl(`${external}/api`)).toBe(true);
        });

        it('eltérő protokoll (http vs https) esetén true', () => {
            const httpsOrigin = window.location.origin.replace(/^http:/, 'https:');
            // Under happy-dom, http is the default; if it were https anyway, skip
            if (httpsOrigin !== window.location.origin) {
                expect(isExternalUrl(`${httpsOrigin}/api`)).toBe(true);
            }
        });
    });

    describe('hibatűrés', () => {
        it('érvénytelen URL esetén false (nem tekintjük külsőnek)', () => {
            expect(isExternalUrl('https://[invalid')).toBe(false);
        });
    });
});
