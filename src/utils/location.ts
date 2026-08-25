/**
 * Location utility functions for handling the browser location object
 */

/**
 * Returns the current origin (protocol + host)
 * @example "https://example.com"
 */
export const getOrigin = (): string => {
    const { origin } = window.location;
    return origin;
};

/**
 * Returns the full URL
 * @example "https://example.com/admin/users/resources"
 */
export const getHref = (): string => {
    const { href } = window.location;
    return href;
};

/**
 * Returns the URL without the origin
 * @example "admin/users/resources"
 */
export const getParameter = (): string => {
    const { origin, href } = window.location;
    return href.replace(`${origin}/`, '');
};
