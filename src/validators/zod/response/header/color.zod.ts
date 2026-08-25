import { z } from 'zod';

// Bootstrap colors
const BOOTSTRAP_COLORS = [
    'primary',
    'secondary',
    'success',
    'danger',
    'warning',
    'info',
    'dark',
    'light',
] as const;

/**
 * Color Zod Schema
 * - Validates color values
 * - Supports:
 *   - Bootstrap colors (primary, success, etc.)
 *   - Hex colors (#fff, #ffffff)
 *   - RGB/RGBA colors
 *   - CSS color names (letters only)
 * - Nullable: yes
 *
 * @example
 * ```ts
 * ColorZod.parse('primary'); // success
 * ColorZod.parse('#fff'); // success
 * ColorZod.parse('rgb(0,0,0)'); // success
 * ColorZod.parse('red'); // success
 * ```
 */
export const ColorZod = z
    .union([
        z.enum(BOOTSTRAP_COLORS),
        z.string().regex(/^#([0-9A-F]{3}){1,2}$/i), // Hex
        z.string().regex(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/), // RGB/RGBA
        z.string().regex(/^[a-zA-Z]+$/), // CSS color names
    ])
    .nullable();
