/**
 * Builds the HTTP request headers
 *
 * @param siteToken - Site token value (boolean, string, or null)
 * @returns Headers object with an Authorization or X-Site-Token header
 */
export const buildHeaders = (siteToken: boolean | string | null): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    };

    if (siteToken && typeof siteToken === 'string') {
        if (siteToken.startsWith('Bearer ')) {
            headers['Authorization'] = siteToken;
        } else {
            headers['X-Site-Token'] = siteToken;
        }
    }

    return headers;
};
