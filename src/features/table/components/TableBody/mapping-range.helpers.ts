/**
 * Range `mapping` key helper functions.
 *
 * Both the `progress` and `custom` types support `mapping` keys in `"min-max"` format
 * (e.g. `"0-25"`, `"26.5-50"`). Parsing is shared so it doesn't get duplicated (jscpd).
 */

/** Range-key pattern for `mapping` (e.g. "0-25", "26.5-50"). */
export const RANGE_PATTERN = /^(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)$/;

/**
 * Converts a `mapping` range key (`"min-max"`) into a numeric tuple.
 *
 * @param key - The range key
 * @returns The [min, max] tuple, or null if the key isn't a valid range
 */
export function parseRange(key: string): [number, number] | null {
    const match = RANGE_PATTERN.exec(key);
    if (!match) return null;
    return [Number(match[1]), Number(match[2])];
}
