import { describe, it, expect } from 'vitest';
import { buildAxiosConfig } from '../build-axios-config';

describe('buildAxiosConfig', () => {
    it('should use POST method by default', () => {
        const config = buildAxiosConfig(null, null, 'api/test', null, null, null, {
            page: 1,
            paginate: 10,
        });

        expect(config.method).toBe('post');
    });

    it('should use GET method when specified', () => {
        const config = buildAxiosConfig('GET', null, 'api/test', null, null, null, {
            page: 1,
            paginate: 10,
        });

        expect(config.method).toBe('get');
    });

    it('should put data in body for POST requests', () => {
        const config = buildAxiosConfig('POST', null, 'api/test', null, null, null, {
            page: 1,
            paginate: 10,
        });

        expect(config.method).toBe('post');
        expect(config.data).toEqual({
            page: 1,
            paginate: 10,
        });
        expect(config.params).toBeUndefined();
    });

    it('should put data in body for PUT requests', () => {
        const config = buildAxiosConfig('PUT', null, 'api/test', null, null, null, {
            page: 1,
            paginate: 10,
        });

        expect(config.method).toBe('put');
        expect(config.data).toEqual({
            page: 1,
            paginate: 10,
        });
        expect(config.params).toBeUndefined();
    });

    it('should put data in body for PATCH requests', () => {
        const config = buildAxiosConfig('PATCH', null, 'api/test', null, null, null, {
            page: 1,
            paginate: 10,
        });

        expect(config.method).toBe('patch');
        expect(config.data).toEqual({
            page: 1,
            paginate: 10,
        });
        expect(config.params).toBeUndefined();
    });

    it('should put data in params for GET requests', () => {
        const config = buildAxiosConfig('GET', null, 'api/test', null, null, null, {
            page: 1,
            paginate: 10,
        });

        expect(config.method).toBe('get');
        expect(config.params).toEqual({
            page: 1,
            paginate: 10,
        });
        expect(config.data).toBeUndefined();
    });

    it('should put data in params for DELETE requests', () => {
        const config = buildAxiosConfig('DELETE', null, 'api/test', null, null, null, {
            page: 1,
            paginate: 10,
        });

        expect(config.method).toBe('delete');
        expect(config.params).toEqual({
            page: 1,
            paginate: 10,
        });
        expect(config.data).toBeUndefined();
    });

    it('should set timeout to 30000ms', () => {
        const config = buildAxiosConfig('POST', null, 'api/test', null, null, null, {});

        expect(config.timeout).toBe(30000);
    });

    it('should build complete config with all parameters', () => {
        const config = buildAxiosConfig(
            'POST',
            'Bearer token-123',
            '{siteName}/api/{urlParameter}',
            'TestApp',
            'users',
            'list',
            { page: 1, paginate: 10 }
        );

        expect(config).toEqual({
            method: 'post',
            url: 'TestApp/api/users',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                Authorization: 'Bearer token-123',
            },
            timeout: 30000,
            data: {
                page: 1,
                paginate: 10,
            },
        });
    });
});
