import { z } from 'zod';
import { cacheSchema } from '../utils/schema-cache';

/**
 * Localization string validation
 * Format: two lowercase letters - two uppercase letters (e.g. hu-HU, en-US, de-DE)
 * Regex pattern: /^[a-z]{2}-[A-Z]{2}$/
 */
export const LocalizationZod = cacheSchema(() => {
    return z
        .string()
        .regex(
            /^[a-z]{2}-[A-Z]{2}$/,
            'Invalid localization format. Expected format: xx-XX (e.g., hu-HU, en-US)'
        )
        .nullable();
});
