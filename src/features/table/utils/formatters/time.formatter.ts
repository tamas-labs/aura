import type { FormatterInput } from './formatter.types';

/**
 * Converts a value (in seconds) to HH:mm:ss duration format.
 *
 * - Accepts only integers (string or number). Fractions are rejected.
 * - Supports negative values (prefixed with `-`).
 * - Hours are unlimited (no day/month/year rollover).
 * - Returns empty string for invalid input.
 *
 * @param value - The value to format (integer seconds)
 * @returns The formatted duration string (e.g., "01:02:03", "-25:00:00")
 *
 * @example
 * formatDuration(0)        // "00:00:00"
 * formatDuration(3661)     // "01:01:01"
 * formatDuration(90000)    // "25:00:00"
 * formatDuration(-3661)    // "-01:01:01"
 * formatDuration(3.5)      // ""
 * formatDuration('hello')  // ""
 * formatDuration(null)     // ""
 */
export function formatDuration(value: FormatterInput): string {
    if (value === null || value === undefined || value === '' || typeof value === 'boolean') {
        return '';
    }

    if (value instanceof Date) {
        return '';
    }

    if (typeof value === 'string' && value.includes('.')) {
        return '';
    }

    const num = typeof value === 'string' ? Number(value) : value;

    if (typeof num !== 'number' || !Number.isFinite(num) || !Number.isInteger(num)) {
        return '';
    }

    const isNegative = num < 0;
    const absoluteSeconds = Math.abs(num);

    const hours = Math.floor(absoluteSeconds / 3600);
    const minutes = Math.floor((absoluteSeconds % 3600) / 60);
    const seconds = absoluteSeconds % 60;

    const hh = String(hours).padStart(2, '0');
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');

    const formatted = `${hh}:${mm}:${ss}`;

    return isNegative ? `-${formatted}` : formatted;
}
