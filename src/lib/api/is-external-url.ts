/**
 * Determines whether a URL is external (cross-origin) relative to the
 * current page's origin.
 *
 * Used to enforce the `allowExternalApi` security switch: if the
 * configuration doesn't allow external API calls, cross-origin requests
 * are blocked in `fetchData`.
 *
 * Behavior:
 * - Empty / missing URL → `false` (nothing to block; a relative call is same-origin).
 * - Relative URL (e.g. `/api/data`) → same-origin → `false`.
 * - Absolute or protocol-relative URL with a different origin → `true`.
 * - Non-browser (SSR) environment where `window.location` is unavailable → `false`
 *   (the origin can't be determined, so we don't block).
 * - Invalid URL → `false` (axios would fail on it anyway; not treated as external).
 *
 * @param url - The URL to check (may be relative or absolute)
 * @returns `true` if the URL points to a different origin, otherwise `false`
 *
 * @example
 * ```ts
 * isExternalUrl('/api/data');                 // false (same-origin)
 * isExternalUrl('https://evil.com/api');      // true (different origin)
 * isExternalUrl('//evil.com/api');            // true (protocol-relative, different host)
 * ```
 */
export const isExternalUrl = (url: string | null | undefined): boolean => {
    if (!url) return false;

    // SSR / no browser context: origin can't be determined, so don't block.
    if (typeof window === 'undefined' || !window.location) return false;

    try {
        const resolved = new URL(url, window.location.href);
        return resolved.origin !== window.location.origin;
    } catch {
        // Invalid URL: not treated as an external request.
        return false;
    }
};
