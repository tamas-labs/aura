import type { AxiosRequestConfig } from 'axios';
import { buildHeaders } from './build-headers';
import { getApiUrl } from './get-api-url';

/**
 * Builds the Axios request config
 *
 * @param requestMethod - HTTP method (GET, POST, PUT, DELETE, PATCH)
 * @param siteToken - Site token for authorization
 * @param urlStructure - URL template
 * @param siteName - Site name
 * @param urlParameter - URL parameter
 * @param urlParameterLastSegment - Last segment of the URL
 * @param queryParams - Query parameters or request body
 * @returns Axios request config object
 */
export const buildAxiosConfig = (
    requestMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | null,
    siteToken: boolean | string | null,
    urlStructure: string | null,
    siteName: string | null,
    urlParameter: string | null,
    urlParameterLastSegment: string | null,
    queryParams: Record<string, unknown>
): AxiosRequestConfig => {
    const method = (requestMethod || 'POST').toLowerCase();
    const headers = buildHeaders(siteToken);
    const url = getApiUrl(urlStructure, siteName, urlParameter, urlParameterLastSegment);

    const config: AxiosRequestConfig = {
        method,
        url,
        headers,
        timeout: 30000,
    };

    // POST, PUT, PATCH: data in the body
    // GET, DELETE: params in the query string
    if (['post', 'put', 'patch'].includes(method)) {
        config.data = queryParams;
    } else {
        config.params = queryParams;
    }

    return config;
};
