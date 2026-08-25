import { describe, it, expect } from 'vitest';
import { getApiUrl } from '../get-api-url';

describe('getApiUrl', () => {
    it('should replace {siteName} placeholder', () => {
        const url = getApiUrl('{siteName}/api/data', 'MyApp', null, null);
        expect(url).toBe('MyApp/api/data');
    });

    it('should replace {urlParameter} placeholder', () => {
        const url = getApiUrl('api/{urlParameter}', null, 'products', null);
        expect(url).toBe('api/products');
    });

    it('should replace {urlParameterLastSegment} placeholder', () => {
        const url = getApiUrl('api/data/{urlParameterLastSegment}', null, null, 'export');
        expect(url).toBe('api/data/export');
    });

    it('should replace multiple placeholders', () => {
        const url = getApiUrl(
            '{siteName}/api/{urlParameter}/{urlParameterLastSegment}',
            'TestApp',
            'users',
            'list'
        );
        expect(url).toBe('TestApp/api/users/list');
    });

    it('should return empty string when urlStructure is null', () => {
        const url = getApiUrl(null, 'TestApp', 'users', 'list');
        expect(url).toBe('');
    });

    it('should handle null replacements', () => {
        const url = getApiUrl('{siteName}/api/{urlParameter}', null, null, null);
        expect(url).toBe('/api/');
    });

    it('should remove leading slash from urlParameter', () => {
        const url = getApiUrl('api/{urlParameter}', null, '/products', null);
        expect(url).toBe('api/products');
    });

    it('should remove multiple leading slashes from urlParameter', () => {
        const url = getApiUrl('api/{urlParameter}', null, '//products', null);
        expect(url).toBe('api/products');
    });

    it('should remove leading slash from urlParameterLastSegment', () => {
        const url = getApiUrl('api/data/{urlParameterLastSegment}', null, null, '/export');
        expect(url).toBe('api/data/export');
    });

    it('should remove leading slashes from both parameters', () => {
        const url = getApiUrl(
            '{siteName}/api/{urlParameter}/{urlParameterLastSegment}',
            'TestApp',
            '/users',
            '/list'
        );
        expect(url).toBe('TestApp/api/users/list');
    });

    it('should keep inner slashes in urlParameter', () => {
        const url = getApiUrl('api/{urlParameter}', null, 'columns/filterable/normal', null);
        expect(url).toBe('api/columns/filterable/normal');
    });

    it('should remove leading slash but keep inner slashes in urlParameter', () => {
        const url = getApiUrl('api/{urlParameter}', null, '/columns/filterable/normal', null);
        expect(url).toBe('api/columns/filterable/normal');
    });

    it('should handle urlParameter with only slash', () => {
        const url = getApiUrl('api/{urlParameter}/data', null, '/', null);
        expect(url).toBe('api//data');
    });

    it('should keep trailing slash in urlParameter', () => {
        const url = getApiUrl('api/{urlParameter}', null, 'path/to/resource/', null);
        expect(url).toBe('api/path/to/resource/');
    });

    it('should handle full URL case from issue - no double slash', () => {
        const url = getApiUrl(
            'http://localhost:8000/{urlParameter}/resources',
            null,
            '/columns/filterable/normal',
            null
        );
        expect(url).toBe('http://localhost:8000/columns/filterable/normal/resources');
    });

    it('should handle urlParameterLastSegment with only slash', () => {
        const url = getApiUrl('api/data/{urlParameterLastSegment}', null, null, '/');
        expect(url).toBe('api/data/');
    });

    it('should handle multiple leading slashes on urlParameterLastSegment', () => {
        const url = getApiUrl('api/data/{urlParameterLastSegment}', null, null, '///export');
        expect(url).toBe('api/data/export');
    });
});
