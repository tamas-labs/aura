import DOMPurify from 'isomorphic-dompurify';

/**
 * HTML sanitizer - removes all HTML tags and attributes
 * For XSS protection
 *
 * @param value - The value to sanitize
 * @returns Sanitized value, or the original value if not a string
 */
export const htmlSanitizer = (value: unknown) => {
    if (typeof value !== 'string') return value;
    return DOMPurify.sanitize(value, {
        ALLOWED_TAGS: [], // No HTML tags
        ALLOWED_ATTR: [], // No HTML attributes
        ALLOW_DATA_ATTR: false, // No data-* attributes
    });
};
