import type { FormatterInput, SliceOptions, PadOptions } from './formatter.types';

/**
 * Validates input and returns string representation.
 * Returns empty string for null, undefined.
 * Returns "true"/"false" for boolean.
 */
function safeString(value: FormatterInput): string {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value);
}

/**
 * Slices a string to a specific length.
 * Use with config.slice
 *
 * @example
 * formatSlice("Hello World", { length: 5 }) // "Hello"
 * formatSlice("Hello World", { length: 5, endWith: "..." }) // "Hello..."
 */
export function formatSlice(value: FormatterInput, options: SliceOptions): string {
    const text = safeString(value);
    if (!text || text.length <= options.length) {
        return text;
    }

    const sliced = text.slice(0, options.length);
    return options.endWith ? `${sliced}${options.endWith}` : sliced;
}

/**
 * Pads the start of the string.
 * Use with config.padStart
 */
export function formatPadStart(value: FormatterInput, length: number, char: string = ' '): string {
    if (value === null || value === undefined) return '';
    const text = safeString(value);
    return text.padStart(length, char);
}

/**
 * Pads the end of the string.
 * Use with config.padEnd
 */
export function formatPadEnd(value: FormatterInput, length: number, char: string = ' '): string {
    if (value === null || value === undefined) return '';
    const text = safeString(value);
    return text.padEnd(length, char);
}

/**
 * Pads the string based on position.
 * Use with config.pad
 */
export function formatPad(value: FormatterInput, options: PadOptions): string {
    if (value === null || value === undefined) return '';
    const { length, char = ' ', position = 'both' } = options;
    const text = safeString(value);

    // native pad functions don't support "both" directly easily without centering logic,
    // but the requirement "pad" usually implies padding around.
    // However, if we look at common implementations of "pad":
    // If we want to center it:
    if (position === 'both') {
        if (text.length >= length) return text;

        const padLen = length - text.length;
        const startLen = Math.floor(padLen / 2);

        const paddedStart = text.padStart(text.length + startLen, char);
        return paddedStart.padEnd(length, char);
    }

    if (position === 'start') {
        return formatPadStart(value, length, char);
    }

    if (position === 'end') {
        return formatPadEnd(value, length, char);
    }

    return text;
}

/**
 * Transforms string to uppercase.
 * Use with config.uppercase
 */
export function formatUppercase(value: FormatterInput): string {
    const text = safeString(value);
    return text.toUpperCase();
}

/**
 * Transforms string to lowercase.
 * Use with config.lowercase
 */
export function formatLowercase(value: FormatterInput): string {
    const text = safeString(value);
    return text.toLowerCase();
}

/**
 * Capitalizes the first letter of the string and lowercases the rest.
 * Use with config.capitalize
 */
export function formatCapitalize(value: FormatterInput): string {
    const text = safeString(value);
    if (!text) return text;
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
