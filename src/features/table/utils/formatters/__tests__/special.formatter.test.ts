// @vitest-environment jsdom
// formatRaw relies on DOMPurify, which only works correctly under a real DOM
// implementation (jsdom); under happy-dom it strips every tag.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import DOMPurify from 'isomorphic-dompurify';
import { formatPhone, formatRaw, buildRawHtmlOptions } from '../special.formatter';
import type { RawHtmlOptions } from '../formatter.types';

describe('special.formatter', () => {
    describe('formatPhone', () => {
        describe('valid cases - international format', () => {
            it('should format Hungarian phone number to international', async () => {
                const result = await formatPhone('+36301234567', { format: 'international' });
                expect(result).toContain('+36');
                expect(result).toContain('30');
            });

            it('should format with default international format', async () => {
                const result = await formatPhone('+36301234567');
                expect(result).toContain('+36');
            });

            it('should format local Hungarian number with default country', async () => {
                const result = await formatPhone('06301234567', { defaultCountry: 'HU' });
                expect(result).toContain('+36');
            });

            it('should format US phone number', async () => {
                const result = await formatPhone('+12025551234', { format: 'international' });
                expect(result).toContain('+1');
                expect(result).toContain('202');
            });
        });

        describe('valid cases - national format', () => {
            it('should format to national format', async () => {
                const result = await formatPhone('+36301234567', { format: 'national' });
                expect(result).toContain('30');
                // National format typically starts with 06
                expect(result).toMatch(/06|30/);
            });
        });

        describe('valid cases - e164 format', () => {
            it('should format to e164 format', async () => {
                const result = await formatPhone('+36301234567', { format: 'e164' });
                expect(result).toBe('+36301234567');
            });

            it('should format e164 without spaces', async () => {
                const result = await formatPhone('+1 202 555 1234', { format: 'e164' });
                expect(result).not.toContain(' ');
                expect(result).toContain('+1');
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null', async () => {
                const result = await formatPhone(null);
                expect(result).toBe('');
            });

            it('should return empty string for undefined', async () => {
                const result = await formatPhone(undefined);
                expect(result).toBe('');
            });

            it('should return empty string for empty string', async () => {
                const result = await formatPhone('');
                expect(result).toBe('');
            });

            it('should return empty string for invalid phone', async () => {
                const result = await formatPhone('not a phone');
                expect(result).toBe('');
            });

            it('should return empty string for too short number', async () => {
                const result = await formatPhone('12345');
                expect(result).toBe('');
            });

            it('should return empty string for just letters', async () => {
                const result = await formatPhone('abcdefgh');
                expect(result).toBe('');
            });
        });

        describe('edge cases', () => {
            it('should handle phone with spaces', async () => {
                const result = await formatPhone('+36 30 123 4567', { format: 'international' });
                expect(result).toContain('+36');
            });

            it('should handle phone with dashes', async () => {
                const result = await formatPhone('+36-30-123-4567', { format: 'international' });
                expect(result).toContain('+36');
            });

            it('should handle phone with parentheses', async () => {
                const result = await formatPhone('+1 (202) 555-1234', { format: 'international' });
                expect(result).toContain('+1');
            });

            it('should handle number as number type', async () => {
                const result = await formatPhone(36301234567 as unknown as string, {
                    defaultCountry: 'HU',
                });
                // May or may not be valid depending on how library handles pure numbers
                // but should not throw
                expect(typeof result).toBe('string');
            });
        });
    });

    describe('formatRaw', () => {
        let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

        beforeEach(() => {
            consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        });

        afterEach(() => {
            consoleWarnSpy.mockRestore();
        });

        describe('valid cases with sanitization', () => {
            it('should allow basic HTML tags', () => {
                const result = formatRaw('<b>bold</b>');
                expect(result).toBe('<b>bold</b>');
            });

            it('should allow paragraph tags', () => {
                const result = formatRaw('<p>text</p>');
                expect(result).toBe('<p>text</p>');
            });

            it('should allow span with class', () => {
                const result = formatRaw('<span class="highlight">text</span>');
                expect(result).toContain('<span');
                expect(result).toContain('class="highlight"');
                expect(result).toContain('text');
            });

            it('should allow multiple allowed tags', () => {
                const result = formatRaw('<p><strong>Bold</strong> and <em>italic</em></p>');
                expect(result).toContain('<strong>');
                expect(result).toContain('<em>');
            });

            it('should allow anchor tags with href', () => {
                const result = formatRaw('<a href="https://example.com">link</a>');
                expect(result).toContain('<a');
                expect(result).toContain('href="https://example.com"');
            });

            it('should allow br tags', () => {
                const result = formatRaw('line1<br>line2');
                expect(result).toContain('<br>');
            });
        });

        describe('target="_blank" rel enforcement (reverse tabnabbing)', () => {
            it('should force rel="noopener noreferrer" on target="_blank" anchors', () => {
                const result = formatRaw('<a href="https://evil.example" target="_blank">x</a>');
                expect(result).toContain('target="_blank"');
                expect(result).toContain('noopener');
                expect(result).toContain('noreferrer');
            });

            it('should preserve existing rel tokens while adding the required ones', () => {
                const result = formatRaw(
                    '<a href="https://x.example" target="_blank" rel="nofollow">x</a>'
                );
                expect(result).toContain('nofollow');
                expect(result).toContain('noopener');
                expect(result).toContain('noreferrer');
            });

            it('should not add rel to anchors without target="_blank"', () => {
                const result = formatRaw('<a href="https://x.example">x</a>');
                expect(result).not.toContain('rel=');
            });

            // `isomorphic-dompurify` exports one shared instance. The hook used to
            // be registered permanently, so from the first raw cell onwards the
            // host application's own sanitize() calls silently got the same `rel`
            // rewrite — a global side effect from a library the host cannot trace.
            describe('hook scoping', () => {
                it('should not leave the hook on the shared instance', () => {
                    formatRaw('<a href="https://x.example" target="_blank">x</a>');

                    // The host's own call, with its own config
                    const hostResult = DOMPurify.sanitize(
                        '<a href="https://x.example" target="_blank">x</a>',
                        { ALLOWED_TAGS: ['a'], ALLOWED_ATTR: ['href', 'target'] }
                    );

                    expect(hostResult).not.toContain('rel=');
                });

                it('should leave a hook the host registered in place', () => {
                    const hostHook = vi.fn((node: Element) => {
                        if (node.nodeName === 'A') node.setAttribute('data-host', '1');
                    });
                    DOMPurify.addHook('afterSanitizeAttributes', hostHook);

                    try {
                        formatRaw('<a href="https://x.example" target="_blank">x</a>');

                        const hostResult = DOMPurify.sanitize('<a href="https://x.example">x</a>', {
                            ALLOWED_TAGS: ['a'],
                            ALLOWED_ATTR: ['href', 'data-host'],
                        });

                        expect(hostResult).toContain('data-host="1"');
                    } finally {
                        DOMPurify.removeHook('afterSanitizeAttributes', hostHook);
                    }
                });

                // The scoping must not cost the protection: repeated calls each
                // register the hook again.
                it('should still enforce rel on every call', () => {
                    const first = formatRaw('<a href="https://x.example" target="_blank">x</a>');
                    const second = formatRaw('<a href="https://y.example" target="_blank">y</a>');

                    expect(first).toContain('noopener');
                    expect(second).toContain('noopener');
                });

                // A sanitize() that throws must not leak the hook either — hence
                // the removal sits in a `finally`.
                //
                // The throw is raised by a host hook rather than by a spy on
                // `sanitize`: under Node, `isomorphic-dompurify` 3.x exports a
                // Proxy whose `get` trap hands back a freshly bound function on
                // every access, so the export has no own `sanitize` property to
                // spy on. Going through the documented hook API keeps this test
                // honest on both supported majors — and it exercises the real
                // path anyway, since a throwing hook is how sanitization
                // actually fails in practice.
                it('should remove the hook even when sanitize throws', () => {
                    const failingHostHook = () => {
                        throw new Error('sanitize failed');
                    };
                    DOMPurify.addHook('afterSanitizeAttributes', failingHostHook);

                    try {
                        expect(() =>
                            formatRaw('<a href="https://x.example" target="_blank">x</a>')
                        ).toThrow('sanitize failed');
                    } finally {
                        DOMPurify.removeHook('afterSanitizeAttributes', failingHostHook);
                    }

                    const hostResult = DOMPurify.sanitize(
                        '<a href="https://x.example" target="_blank">x</a>',
                        { ALLOWED_TAGS: ['a'], ALLOWED_ATTR: ['href', 'target'] }
                    );

                    expect(hostResult).not.toContain('rel=');
                });
            });
        });

        describe('XSS protection', () => {
            it('should remove script tags', () => {
                const result = formatRaw('<script>alert("xss")</script>');
                expect(result).not.toContain('<script');
                expect(result).not.toContain('alert');
            });

            it('should remove onclick attributes', () => {
                const result = formatRaw('<div onclick="alert(\'xss\')">click</div>');
                expect(result).not.toContain('onclick');
                // div is not in allowed tags, so it should be removed entirely
            });

            it('should remove onerror from img', () => {
                const result = formatRaw('<img src="x" onerror="alert(\'xss\')">');
                expect(result).not.toContain('onerror');
                // img is not in allowed tags
                expect(result).not.toContain('<img');
            });

            it('should remove javascript: protocol', () => {
                const result = formatRaw('<a href="javascript:void(0)">click</a>');
                // DOMPurify should remove or sanitize the href
                expect(result).not.toContain('href');
            });

            it('should remove inline event handlers', () => {
                const result = formatRaw('<span onmouseover="alert(\'xss\')">hover</span>');
                expect(result).not.toContain('onmouseover');
                expect(result).toContain('hover');
            });

            it('should handle nested script tags', () => {
                const result = formatRaw('<div><script>alert(1)</script><p>safe</p></div>');
                // DOMPurify should keep safe content
                expect(result).toContain('safe');
                // The important part: result should not have executable script in the DOM
                // We accept that text content might remain, but tags should be stripped or escaped
                expect(result).toContain('<p>');
            });

            it('should remove data URIs with script', () => {
                const result = formatRaw(
                    '<a href="data:text/html,<script>alert(1)</script>">click</a>'
                );
                // DOMPurify should sanitize this
                expect(result).not.toContain('data:text/html');
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null', () => {
                const result = formatRaw(null);
                expect(result).toBe('');
            });

            it('should return empty string for undefined', () => {
                const result = formatRaw(undefined);
                expect(result).toBe('');
            });
        });

        describe('unconditional sanitization', () => {
            it('should sanitize by default', () => {
                const result = formatRaw('<script>alert(1)</script><b>text</b>');
                expect(result).not.toContain('<script');
                expect(result).toContain('<b>text</b>');
            });

            /**
             * There used to be a `sanitize: false` bypass whose only trace was a
             * `console.warn` — stripped from the production build by `drop_console`.
             * A stray flag must not resurrect it, so the option is ignored rather
             * than honoured.
             */
            it('should ignore a stray sanitize flag and still sanitize', () => {
                const result = formatRaw('<script>alert(1)</script><b>text</b>', {
                    sanitize: false,
                } as RawHtmlOptions);

                expect(result).not.toContain('<script');
                expect(result).toContain('<b>text</b>');
            });

            it('should never warn on the console about unsanitized output', () => {
                formatRaw('<b>text</b>');
                expect(console.warn).not.toHaveBeenCalled();
            });
        });

        describe('config-driven whitelist', () => {
            it('preserves the style attribute by default (default behavior)', () => {
                const result = formatRaw('<span style="color:red">x</span>');
                expect(result).toContain('style="color:red"');
            });

            it('the host can forbid style with a custom allowedAttr', () => {
                const result = formatRaw('<span style="color:red" class="c">x</span>', {
                    allowedAttr: ['class'],
                });
                expect(result).not.toContain('style=');
                expect(result).toContain('class="c"');
            });

            it('a custom allowedTags allows only the specified tags', () => {
                const result = formatRaw('<b>bold</b><i>italic</i>', {
                    allowedTags: ['b'],
                });
                expect(result).toContain('<b>bold</b>');
                expect(result).not.toContain('<i>');
            });

            it('allowDataAttr=false removes data-* attributes', () => {
                const result = formatRaw('<span data-id="5">x</span>', {
                    allowedAttr: ['class'],
                    allowDataAttr: false,
                });
                expect(result).not.toContain('data-id');
            });

            it('allowDataAttr=true preserves data-* attributes', () => {
                const result = formatRaw('<span data-id="5">x</span>', {
                    allowedAttr: ['class'],
                    allowDataAttr: true,
                });
                expect(result).toContain('data-id="5"');
            });
        });

        describe('buildRawHtmlOptions', () => {
            it('converts config values into RawHtmlOptions', () => {
                expect(
                    buildRawHtmlOptions({
                        rawHtmlAllowedTags: ['b'],
                        rawHtmlAllowedAttr: ['class'],
                        rawHtmlAllowDataAttr: false,
                    })
                ).toEqual({ allowedTags: ['b'], allowedAttr: ['class'], allowDataAttr: false });
            });

            it('maps null fields to undefined (formatRaw default fallback)', () => {
                expect(
                    buildRawHtmlOptions({
                        rawHtmlAllowedTags: null,
                        rawHtmlAllowedAttr: null,
                        rawHtmlAllowDataAttr: null,
                    })
                ).toEqual({
                    allowedTags: undefined,
                    allowedAttr: undefined,
                    allowDataAttr: undefined,
                });
            });
        });

        describe('edge cases', () => {
            it('should handle plain text without tags', () => {
                const result = formatRaw('plain text');
                expect(result).toBe('plain text');
            });

            it('should handle empty string', () => {
                const result = formatRaw('');
                expect(result).toBe('');
            });

            it('should handle number input', () => {
                const result = formatRaw(123);
                expect(result).toBe('123');
            });

            it('should handle boolean input', () => {
                const result = formatRaw(true);
                expect(result).toBe('true');
            });

            it('should handle malformed HTML', () => {
                const result = formatRaw('<b>unclosed');
                // DOMPurify should fix or handle it
                expect(result).toContain('unclosed');
            });

            it('should handle mixed allowed and disallowed tags', () => {
                const result = formatRaw('<div><b>bold</b><table>table</table></div>');
                // DOMPurify strips or sanitizes unknown tags, allowed tags remain
                expect(result).toContain('bold');
                expect(result).toContain('<b>');
            });
        });
    });
});
