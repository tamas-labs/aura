import { describe, it, expect } from 'vitest';
import { buildHeaders } from '../build-headers';

describe('buildHeaders', () => {
    it('should build default headers without token', () => {
        const headers = buildHeaders(false);

        expect(headers).toEqual({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        });
    });

    it('should add Authorization header with Bearer token', () => {
        const headers = buildHeaders('Bearer test-token-123');

        expect(headers).toEqual({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            Authorization: 'Bearer test-token-123',
        });
    });

    it('should add X-Site-Token header for non-Bearer token', () => {
        const headers = buildHeaders('custom-token-123');

        expect(headers).toEqual({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-Site-Token': 'custom-token-123',
        });
    });

    it('should not add token headers when siteToken is null', () => {
        const headers = buildHeaders(null);

        expect(headers).toEqual({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        });
        expect(headers).not.toHaveProperty('Authorization');
        expect(headers).not.toHaveProperty('X-Site-Token');
    });
});
