/**
 * Highlight Text Utility
 *
 * Provides functionality to highlight search terms within a text string.
 * Uses <mark> tag for highlighting.
 */

import { foldAccents } from '../../../../utils/normalize-text.util';
import { readOwnEntry } from '../../../../utils/safe-object.util';

/**
 * Configuration options for highlighting
 */
export interface HighlightOptions {
    /**
     * The CSS class to apply to the highlighting tag
     * @default 'aura-highlight'
     */
    highlightClass?: string;

    /**
     * Whether to wrap the result in a span container
     * @default false
     */
    wrapInSpan?: boolean;

    /**
     * Whether diacritics should be ignored when locating the term.
     *
     * Mirrors the `accentInsensitiveSearch` config key: the rows a search matches
     * and the substrings it highlights have to be decided the same way, otherwise
     * an accent-insensitive hit would render without any visible mark.
     *
     * @default false
     */
    accentInsensitive?: boolean;
}

/**
 * The comparable (accent-folded, lower-cased) form of a string, plus the map that
 * leads back to the original.
 */
interface FoldedIndex {
    /** The folded text the term is searched in. */
    folded: string;
    /**
     * `offsets[i]` is the index in the original string of the character that
     * produced `folded[i]`. One extra entry at the end holds the original length,
     * so a match ending at the very end still has an upper bound to read.
     */
    offsets: number[];
}

/**
 * Folds a string character by character, recording where each folded character
 * came from.
 *
 * Folding the whole string at once would be shorter but useless here: NFD turns
 * one character into a variable number of characters, so the folded offsets no
 * longer line up with the original ones and the highlight would land on the
 * wrong substring.
 *
 * @param text - The original text.
 * @returns The folded text and its offset map.
 */
function buildFoldedIndex(text: string): FoldedIndex {
    const offsets: number[] = [];
    let folded = '';
    let position = 0;

    // Iterating a string yields whole code points, so surrogate pairs stay intact.
    for (const character of text) {
        const foldedCharacter = foldAccents(character).toLowerCase();

        for (let index = 0; index < foldedCharacter.length; index += 1) {
            offsets.push(position);
        }

        folded += foldedCharacter;
        position += character.length;
    }

    // Sentinel for a match that runs to the end of the text.
    offsets.push(text.length);

    return { folded, offsets };
}

/**
 * Highlights every occurrence of a term, comparing accent-insensitively.
 *
 * The term is located in the folded text, then each hit is mapped back to the
 * original character range — so the mark wraps `árvíztűrő`, with its accents,
 * even though `arvizturo` was typed.
 *
 * @param text - The text to search within.
 * @param term - The trimmed search term.
 * @param highlightClass - The already-escaped CSS class for the mark.
 * @returns HTML string with highlighting applied.
 */
function highlightFolded(text: string, term: string, highlightClass: string): string {
    const { folded, offsets } = buildFoldedIndex(text);
    const foldedTerm = foldAccents(term).toLowerCase();

    // A term made purely of combining marks folds away to nothing; searching for
    // an empty string would loop forever.
    if (foldedTerm === '') {
        return escapeHtml(text);
    }

    let result = '';
    let cursor = 0;
    let searchFrom = 0;

    let matchIndex = folded.indexOf(foldedTerm, searchFrom);
    while (matchIndex !== -1) {
        // Both reads are in range by construction: `offsets` holds one entry per
        // folded character plus the end sentinel, and a match cannot reach past the
        // end of `folded`.
        const start = offsets[matchIndex]!;
        const end = offsets[matchIndex + foldedTerm.length]!;

        result += escapeHtml(text.slice(cursor, start));
        result += `<mark class="${highlightClass}">${escapeHtml(text.slice(start, end))}</mark>`;

        cursor = end;
        searchFrom = matchIndex + foldedTerm.length;
        matchIndex = folded.indexOf(foldedTerm, searchFrom);
    }

    return result + escapeHtml(text.slice(cursor));
}

/**
 * Escapes special characters for use in a regular expression.
 *
 * @param string - The string to escape
 * @returns Escaped string safe for Regex usage
 */
function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Escapes HTML characters to prevent XSS.
 *
 * @param string - The string to escape
 * @returns HTML escaped string
 */
export function escapeHtml(string: string): string {
    const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
    };
    return string.replace(/[&<>"']/g, m => readOwnEntry(map, m) ?? m);
}

/**
 * Highlights occurrences of a search term within a text string.
 *
 * @param text - The text to search within
 * @param searchTerm - The term to highlight
 * @param options - Configuration options
 * @returns HTML string with highlighting applied
 *
 * @example
 * ```typescript
 * highlightText('Hello World', 'world');
 * // Returns 'Hello <mark class="aura-highlight">World</mark>'
 * ```
 */
export function highlightText(
    text: string | number | null | undefined,
    searchTerm: string | null | undefined,
    options: HighlightOptions = {}
): string {
    // 1. Handle empty or invalid text
    if (text === null || text === undefined) {
        return '';
    }

    const strText = String(text);

    // 2. Handle empty search term - return escaped text
    if (!searchTerm || searchTerm.trim() === '') {
        return escapeHtml(strText);
    }

    const term = searchTerm.trim();
    // highlightClass ends up in an HTML attribute (`class="..."`), so we escape it:
    // a quote could otherwise break out of the attribute (XSS hardening, audit #6).
    const highlightClass = escapeHtml(options.highlightClass || 'aura-highlight');

    // 3. Accent-insensitive matching needs the offset map, not a regex: the folded
    // text and the original one have different lengths.
    if (options.accentInsensitive) {
        return highlightFolded(strText, term, highlightClass);
    }

    // 4. Escape regex characters in search term
    const escapedTerm = escapeRegExp(term);

    // 5. Create case-insensitive regex
    // Use word boundary check if needed, but simple contains is usually preferred for search
    const regex = new RegExp(`(${escapedTerm})`, 'gi');

    // Split text by regex matches and highlight matching parts
    // The split with capture group includes the captured parts in the array
    return strText
        .split(regex)
        .map(part => {
            // Check if this part matches the search term (case-insensitive)
            if (part.toLowerCase() === term.toLowerCase()) {
                return `<mark class="${highlightClass}">${escapeHtml(part)}</mark>`;
            }
            // Otherwise it's normal text, just escape it
            return escapeHtml(part);
        })
        .join('');
}
