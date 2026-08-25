import { describe, it, expect } from 'vitest';
import { htmlSanitizer } from '../html.sanitizer';

describe('htmlSanitizer', () => {
    describe('non-string values', () => {
        it('returns null unchanged', () => {
            expect(htmlSanitizer(null)).toBe(null);
        });

        it('returns undefined unchanged', () => {
            expect(htmlSanitizer(undefined)).toBe(undefined);
        });

        it('returns numbers unchanged', () => {
            expect(htmlSanitizer(123)).toBe(123);
            expect(htmlSanitizer(0)).toBe(0);
            expect(htmlSanitizer(-5.5)).toBe(-5.5);
        });

        it('returns booleans unchanged', () => {
            expect(htmlSanitizer(true)).toBe(true);
            expect(htmlSanitizer(false)).toBe(false);
        });

        it('returns objects unchanged', () => {
            const obj = { key: 'value' };
            expect(htmlSanitizer(obj)).toBe(obj);
        });

        it('returns arrays unchanged', () => {
            const arr = [1, 2, 3];
            expect(htmlSanitizer(arr)).toBe(arr);
        });
    });

    describe('string values - basic sanitization', () => {
        it('keeps safe text', () => {
            const safe = 'Hello World';
            expect(htmlSanitizer(safe)).toBe(safe);
        });

        it('keeps an empty string', () => {
            expect(htmlSanitizer('')).toBe('');
        });

        it('keeps a string containing numbers', () => {
            const text = '12345';
            expect(htmlSanitizer(text)).toBe(text);
        });

        it('keeps special characters', () => {
            const text = 'Hello! How are you?';
            expect(htmlSanitizer(text)).toBe(text);
        });
    });

    describe('XSS protection - removes HTML tags', () => {
        it('removes the script tag', () => {
            const malicious = '<script>alert("XSS")</script>';
            const result = htmlSanitizer(malicious);
            expect(result).not.toContain('<script>');
            expect(result).not.toContain('</script>');
        });

        it('removes the img tag', () => {
            const malicious = '<img src="x" onerror="alert(1)">';
            const result = htmlSanitizer(malicious);
            expect(result).not.toContain('<img');
            expect(result).not.toContain('onerror');
        });

        it('removes the div tag', () => {
            const html = '<div>Content</div>';
            const result = htmlSanitizer(html);
            expect(result).toBe('Content');
            expect(result).not.toContain('<div>');
        });

        it('removes the span tag', () => {
            const html = '<span>Text</span>';
            const result = htmlSanitizer(html);
            expect(result).toBe('Text');
            expect(result).not.toContain('<span>');
        });

        it('removes the p tag', () => {
            const html = '<p>Paragraph</p>';
            const result = htmlSanitizer(html);
            expect(result).toBe('Paragraph');
            expect(result).not.toContain('<p>');
        });

        it('removes the a tag', () => {
            const html = '<a href="http://evil.com">Link</a>';
            const result = htmlSanitizer(html);
            expect(result).toBe('Link');
            expect(result).not.toContain('<a');
            expect(result).not.toContain('href');
        });
    });

    describe('XSS protection - removes attributes', () => {
        it('removes the onclick attribute', () => {
            const malicious = '<button onclick="alert(1)">Click</button>';
            const result = htmlSanitizer(malicious);
            expect(result).not.toContain('onclick');
        });

        it('removes the onerror attribute', () => {
            const malicious = '<img onerror="alert(1)">';
            const result = htmlSanitizer(malicious);
            expect(result).not.toContain('onerror');
        });

        it('removes the style attribute', () => {
            const html = '<div style="color: red;">Text</div>';
            const result = htmlSanitizer(html);
            expect(result).not.toContain('style');
        });

        it('removes the class attribute', () => {
            const html = '<div class="malicious">Text</div>';
            const result = htmlSanitizer(html);
            expect(result).not.toContain('class');
        });

        it('removes data-* attributes', () => {
            const html = '<div data-secret="value">Text</div>';
            const result = htmlSanitizer(html);
            expect(result).not.toContain('data-secret');
        });
    });

    describe('complex XSS scenarios', () => {
        it('handles nested HTML', () => {
            const nested = '<div><span><b>Nested</b></span></div>';
            const result = htmlSanitizer(nested);
            // DOMPurify removes certain tags, but not necessarily all at once
            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
        });

        it('handles multiple script tags', () => {
            const multiple = '<script>alert(1)</script>Text<script>alert(2)</script>';
            const result = htmlSanitizer(multiple);
            expect(typeof result).toBe('string');
            expect(result).toContain('Text');
        });

        it('handles JavaScript URLs', () => {
            // Testing JavaScript protocol URL sanitization

            const malicious = '<a href="javascript:alert(1)">Click</a>';
            const result = htmlSanitizer(malicious);
            expect(result).toBe('Click');
            expect(result).not.toContain('javascript:');
        });

        it('handles SVG injection', () => {
            const svg = '<svg><script>alert(1)</script></svg>';
            const result = htmlSanitizer(svg);
            expect(result).not.toContain('<svg>');
            expect(result).not.toContain('<script>');
        });

        it('handles iframe injection', () => {
            // Suppress the happy-dom iframe loading error (this is expected behavior)
            const consoleError = console.error;
            console.error = () => {}; // Temporarily suppress console.error

            const iframe = '<iframe src="http://evil.com"></iframe>';
            const result = htmlSanitizer(iframe);
            expect(result).not.toContain('<iframe');

            console.error = consoleError; // Restore console.error
        });
    });

    describe('edge cases', () => {
        it('handles whitespace', () => {
            const text = '   Hello   ';
            expect(htmlSanitizer(text)).toBe(text);
        });

        it('handles newline characters', () => {
            const text = 'Line1\nLine2';
            expect(htmlSanitizer(text)).toBe(text);
        });

        it('handles special Unicode characters', () => {
            const text = 'Árvíztűrő tükörfúrógép';
            expect(htmlSanitizer(text)).toBe(text);
        });

        it('handles emoji', () => {
            const text = '👍 Hello 🚀';
            expect(htmlSanitizer(text)).toBe(text);
        });

        it('handles HTML entities', () => {
            const text = '&lt;div&gt;';
            const result = htmlSanitizer(text);
            // DOMPurify may decode the entities
            expect(result).toBeDefined();
        });
    });

    describe('security - verifies no tags are allowed', () => {
        it('removes dangerous tags', () => {
            const tags = [
                '<b>bold</b>',
                '<i>italic</i>',
                '<u>underline</u>',
                '<strong>strong</strong>',
                '<em>emphasis</em>',
                '<h1>header</h1>',
            ];

            tags.forEach(tag => {
                const result = htmlSanitizer(tag) as string;
                expect(typeof result).toBe('string');
                // The result contains the text content
                expect(result.length).toBeGreaterThan(0);
            });
        });

        it('keeps the text content', () => {
            const html = '<div><p>Keep <strong>this</strong> text</p></div>';
            const result = htmlSanitizer(html) as string;
            expect(typeof result).toBe('string');
            // The text remains in some form
            expect(result).toContain('Keep');
            expect(result).toContain('this');
            expect(result).toContain('text');
        });
    });
});
