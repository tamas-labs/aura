import { z } from 'zod';

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
 * Bootstrap Color Zod Schema
 * - Validates Bootstrap color variant values only
 * - Strictly limited to the 8 Bootstrap color names
 * - Does NOT accept hex colors, RGB, or arbitrary CSS color names
 * - Nullable: yes
 *
 * @example
 * ```ts
 * BootstrapColorZod.parse('success'); // 'success'
 * BootstrapColorZod.parse('danger'); // 'danger'
 * BootstrapColorZod.parse(null); // null
 * BootstrapColorZod.parse('#fff'); // Error (hex not allowed)
 * BootstrapColorZod.parse('red'); // Error (arbitrary CSS names not allowed)
 * ```
 */
export const BootstrapColorZod = z.enum(BOOTSTRAP_COLORS).nullable();
