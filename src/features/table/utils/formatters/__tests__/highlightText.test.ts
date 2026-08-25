import { describe, it, expect } from 'vitest';
import { highlightText, escapeHtml } from '../highlightText';

describe('highlightText', () => {
    describe('escapeHtml', () => {
        describe('valid cases', () => {
            it('should escape HTML entities', () => {
                const result = escapeHtml('<script>alert("XSS")</script>');
                expect(result).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
            });

            it('should escape ampersand', () => {
                const result = escapeHtml('Tom & Jerry');
                expect(result).toBe('Tom &amp; Jerry');
            });

            it('should escape single quotes', () => {
                const result = escapeHtml("It's a test");
                expect(result).toBe('It&#039;s a test');
            });

            it('should handle text without special characters', () => {
                const result = escapeHtml('Hello World');
                expect(result).toBe('Hello World');
            });

            it('should escape multiple special characters', () => {
                const result = escapeHtml('<div class="test">A & B</div>');
                expect(result).toBe('&lt;div class=&quot;test&quot;&gt;A &amp; B&lt;/div&gt;');
            });
        });

        describe('edge cases', () => {
            it('should handle empty string', () => {
                const result = escapeHtml('');
                expect(result).toBe('');
            });

            it('should handle string with only spaces', () => {
                const result = escapeHtml('   ');
                expect(result).toBe('   ');
            });
        });
    });

    describe('highlightText', () => {
        describe('valid cases', () => {
            it('should highlight single match', () => {
                const result = highlightText('Hello World', 'World');
                expect(result).toBe('Hello <mark class="aura-highlight">World</mark>');
            });

            it('should highlight case-insensitive match', () => {
                const result = highlightText('Hello World', 'world');
                expect(result).toBe('Hello <mark class="aura-highlight">World</mark>');
            });

            it('should highlight multiple matches', () => {
                const result = highlightText('The quick brown fox jumps over the lazy dog', 'the');
                expect(result).toContain('<mark class="aura-highlight">The</mark>');
                expect(result).toContain('<mark class="aura-highlight">the</mark>');
            });

            it('should highlight partial word match', () => {
                const result = highlightText('JavaScript is awesome', 'Script');
                expect(result).toBe('Java<mark class="aura-highlight">Script</mark> is awesome');
            });

            it('should handle number values', () => {
                const result = highlightText(12345, '234');
                expect(result).toBe('1<mark class="aura-highlight">234</mark>5');
            });

            it('should escape HTML in non-matched parts', () => {
                const result = highlightText('<script>alert("test")</script>', 'test');
                expect(result).toContain('&lt;script&gt;');
                expect(result).toContain('<mark class="aura-highlight">test</mark>');
            });

            it('should escape HTML in matched parts', () => {
                const result = highlightText('Hello <script>', 'script');
                expect(result).toBe('Hello &lt;<mark class="aura-highlight">script</mark>&gt;');
            });

            it('should handle custom highlight class', () => {
                const result = highlightText('Hello World', 'World', {
                    highlightClass: 'custom-class',
                });
                expect(result).toBe('Hello <mark class="custom-class">World</mark>');
            });
        });

        describe('invalid cases', () => {
            it('should return empty string for null text', () => {
                const result = highlightText(null, 'test');
                expect(result).toBe('');
            });

            it('should return empty string for undefined text', () => {
                const result = highlightText(undefined, 'test');
                expect(result).toBe('');
            });

            it('should return escaped text for null search term', () => {
                const result = highlightText('Hello World', null);
                expect(result).toBe('Hello World');
            });

            it('should return escaped text for undefined search term', () => {
                const result = highlightText('Hello World', undefined);
                expect(result).toBe('Hello World');
            });

            it('should return escaped text for empty search term', () => {
                const result = highlightText('Hello World', '');
                expect(result).toBe('Hello World');
            });

            it('should return escaped text for whitespace-only search term', () => {
                const result = highlightText('Hello World', '   ');
                expect(result).toBe('Hello World');
            });

            it('should escape HTML when no search term', () => {
                const result = highlightText('<div>Test</div>', '');
                expect(result).toBe('&lt;div&gt;Test&lt;/div&gt;');
            });
        });

        describe('edge cases', () => {
            it('should handle text with no match', () => {
                const result = highlightText('Hello World', 'xyz');
                expect(result).toBe('Hello World');
                expect(result).not.toContain('<mark');
            });

            it('should handle exact match', () => {
                const result = highlightText('test', 'test');
                expect(result).toBe('<mark class="aura-highlight">test</mark>');
            });

            it('should handle search term longer than text', () => {
                const result = highlightText('Hi', 'Hello');
                expect(result).toBe('Hi');
            });

            it('should handle special regex characters in search term', () => {
                const result = highlightText('Price: $100', '$100');
                expect(result).toBe('Price: <mark class="aura-highlight">$100</mark>');
            });

            it('should handle parentheses in search term', () => {
                const result = highlightText('Function (test)', '(test)');
                expect(result).toBe('Function <mark class="aura-highlight">(test)</mark>');
            });

            it('should handle dots in search term', () => {
                const result = highlightText('example.com', '.com');
                expect(result).toBe('example<mark class="aura-highlight">.com</mark>');
            });

            it('should handle asterisks in search term', () => {
                const result = highlightText('Note: * required', '*');
                expect(result).toBe('Note: <mark class="aura-highlight">*</mark> required');
            });

            it('should handle question marks in search term', () => {
                const result = highlightText('Is it true?', '?');
                expect(result).toBe('Is it true<mark class="aura-highlight">?</mark>');
            });

            it('should handle square brackets in search term', () => {
                const result = highlightText('Array [0]', '[0]');
                expect(result).toBe('Array <mark class="aura-highlight">[0]</mark>');
            });

            it('should handle backslashes in search term', () => {
                const result = highlightText('Path: C:\\Users', '\\Users');
                expect(result).toBe('Path: C:<mark class="aura-highlight">\\Users</mark>');
            });

            it('should handle pipe character in search term', () => {
                const result = highlightText('Option A | B', '|');
                expect(result).toBe('Option A <mark class="aura-highlight">|</mark> B');
            });

            it('should handle plus sign in search term', () => {
                const result = highlightText('Sum: 2 + 2', '+');
                expect(result).toBe('Sum: 2 <mark class="aura-highlight">+</mark> 2');
            });

            it('should handle caret in search term', () => {
                const result = highlightText('Power: 2^3', '^');
                expect(result).toBe('Power: 2<mark class="aura-highlight">^</mark>3');
            });

            it('should handle empty text', () => {
                const result = highlightText('', 'test');
                expect(result).toBe('');
            });

            it('should handle multiple consecutive matches', () => {
                const result = highlightText('aaa', 'a');
                expect(result).toContain('<mark class="aura-highlight">a</mark>');
            });

            it('should preserve original case in highlighted text', () => {
                const result = highlightText('Hello WORLD world', 'world');
                expect(result).toContain('<mark class="aura-highlight">WORLD</mark>');
                expect(result).toContain('<mark class="aura-highlight">world</mark>');
            });

            it('should handle unicode characters', () => {
                const result = highlightText('Café München', 'café');
                expect(result).toBe('<mark class="aura-highlight">Café</mark> München');
            });

            it('should handle emojis', () => {
                const result = highlightText('Hello 👋 World', 'Hello');
                expect(result).toBe('<mark class="aura-highlight">Hello</mark> 👋 World');
            });

            it('should trim search term', () => {
                const result = highlightText('Hello World', '  World  ');
                expect(result).toBe('Hello <mark class="aura-highlight">World</mark>');
            });

            it('should handle newlines in text', () => {
                const result = highlightText('Line 1\nLine 2', 'Line');
                expect(result).toContain('<mark class="aura-highlight">Line</mark>');
            });

            it('should handle tabs in text', () => {
                const result = highlightText('Col1\tCol2', 'Col1');
                expect(result).toBe('<mark class="aura-highlight">Col1</mark>\tCol2');
            });
        });

        describe('XSS prevention', () => {
            it('should prevent XSS via text parameter', () => {
                const result = highlightText('<img src=x onerror=alert(1)>', 'img');
                expect(result).toContain('&lt;');
                expect(result).toContain('&gt;');
                expect(result).toContain('<mark class="aura-highlight">img</mark>');
            });

            it('should prevent XSS via search term with matching text', () => {
                const result = highlightText('test<script>alert(1)</script>', '<script>');
                expect(result).toContain('&lt;script&gt;');
                expect(result).not.toContain('<script>alert');
            });

            it('should prevent XSS with malicious HTML entities', () => {
                const result = highlightText('&lt;script&gt;', 'script');
                expect(result).toContain('&amp;lt;');
                expect(result).not.toContain('<script>');
            });

            it('should handle quotes in highlighted content', () => {
                const result = highlightText('Say "Hello"', '"Hello"');
                expect(result).toBe('Say <mark class="aura-highlight">&quot;Hello&quot;</mark>');
            });

            it('should handle ampersands in highlighted content', () => {
                const result = highlightText('A & B & C', '& B');
                expect(result).toBe('A <mark class="aura-highlight">&amp; B</mark> &amp; C');
            });
        });

        describe('options parameter', () => {
            it('should use default highlightClass when not provided', () => {
                const result = highlightText('Hello World', 'World', {});
                expect(result).toBe('Hello <mark class="aura-highlight">World</mark>');
            });

            it('should use custom highlightClass from options', () => {
                const result = highlightText('Hello World', 'World', {
                    highlightClass: 'my-highlight',
                });
                expect(result).toBe('Hello <mark class="my-highlight">World</mark>');
            });

            it('should use default when highlightClass is empty string', () => {
                const result = highlightText('Hello World', 'World', { highlightClass: '' });
                expect(result).toBe('Hello <mark class="aura-highlight">World</mark>');
            });

            it('should HTML-escape the highlightClass to prevent attribute breakout (XSS)', () => {
                const result = highlightText('Hello World', 'World', {
                    highlightClass: '"><img src=x onerror=alert(1)>',
                });
                // The quote and < > are escaped, so it doesn't break out of the attribute
                expect(result).not.toContain('<img');
                expect(result).toContain(
                    '<mark class="&quot;&gt;&lt;img src=x onerror=alert(1)&gt;">World</mark>'
                );
            });
        });

        describe('performance', () => {
            it('should handle long text efficiently', () => {
                const longText = 'Lorem ipsum '.repeat(1000);
                const result = highlightText(longText, 'Lorem');
                expect(result).toContain('<mark class="aura-highlight">Lorem</mark>');
            });

            it('should handle many matches efficiently', () => {
                const text = 'a '.repeat(100);
                const result = highlightText(text, 'a');
                expect(result).toContain('<mark class="aura-highlight">a</mark>');
            });
        });
    });
    describe('accentInsensitive', () => {
        const MARK_OPEN = '<mark class="aura-highlight">';

        it('should not match an unaccented term by default', () => {
            expect(highlightText('árvíztűrő', 'arvizturo')).toBe('árvíztűrő');
        });

        it('should mark the accented text an unaccented term found', () => {
            const result = highlightText('árvíztűrő', 'arvizturo', { accentInsensitive: true });

            expect(result).toBe(`${MARK_OPEN}árvíztűrő</mark>`);
        });

        it('should keep the surrounding text intact', () => {
            const result = highlightText('a Kovács Béla sor', 'kovacs', {
                accentInsensitive: true,
            });

            expect(result).toBe(`a ${MARK_OPEN}Kovács</mark> Béla sor`);
        });

        it('should mark an accented term inside unaccented text', () => {
            const result = highlightText('Kovacs Bela', 'Béla', { accentInsensitive: true });

            expect(result).toBe(`Kovacs ${MARK_OPEN}Bela</mark>`);
        });

        it('should mark every occurrence', () => {
            const result = highlightText('Bél, bel, BÉL', 'bel', { accentInsensitive: true });

            expect(result).toBe(
                `${MARK_OPEN}Bél</mark>, ${MARK_OPEN}bel</mark>, ${MARK_OPEN}BÉL</mark>`
            );
        });

        it('should mark a match that reaches the end of the text', () => {
            const result = highlightText('sor vége', 'vege', { accentInsensitive: true });

            expect(result).toBe(`sor ${MARK_OPEN}vége</mark>`);
        });

        it('should handle text given in decomposed form', () => {
            // 'e' + U+0301 rather than the precomposed 'é'
            const decomposed = 'B\u0065\u0301la';
            const result = highlightText(decomposed, 'bela', { accentInsensitive: true });

            expect(result).toBe(`${MARK_OPEN}${decomposed}</mark>`);
        });

        it('should escape HTML in both the marked and the untouched parts', () => {
            const result = highlightText('<b>Béla</b>', 'bela', { accentInsensitive: true });

            expect(result).toBe(`&lt;b&gt;${MARK_OPEN}Béla</mark>&lt;/b&gt;`);
        });

        it('should escape the highlight class', () => {
            const result = highlightText('Béla', 'bela', {
                accentInsensitive: true,
                highlightClass: 'a"onmouseover="alert(1)',
            });

            expect(result).toContain('class="a&quot;onmouseover=&quot;alert(1)"');
        });

        it('should not treat the term as a regular expression', () => {
            const result = highlightText('a.b axb', 'a.b', { accentInsensitive: true });

            expect(result).toBe(`${MARK_OPEN}a.b</mark> axb`);
        });

        it('should return the escaped text when the term folds away to nothing', () => {
            // A lone combining acute leaves no comparable characters behind.
            const result = highlightText('<Béla>', '\u0301', { accentInsensitive: true });

            expect(result).toBe('&lt;Béla&gt;');
        });

        it('should return the escaped text when there is no match', () => {
            const result = highlightText('Béla', 'zoltan', { accentInsensitive: true });

            expect(result).toBe('Béla');
        });

        it('should keep surrogate pairs intact around a match', () => {
            const result = highlightText('🎉 Béla 🎉', 'bela', { accentInsensitive: true });

            expect(result).toBe(`🎉 ${MARK_OPEN}Béla</mark> 🎉`);
        });
    });
});
