import { z } from 'zod';
import { cacheSchema } from '../utils/schema-cache';

/**
 * Error reporting API key validation
 * - Min 10, max 200 characters (if not an empty string)
 * - Only alphanumeric characters, hyphen, and underscore are allowed
 * - Empty string is allowed (when there is no API key)
 */
export const ErrorReportingApiKeyZod = cacheSchema(() => {
    return z
        .string()
        .refine(
            val => {
                // Empty string is allowed
                if (val === '') return true;
                // If there's a value, check the length and format
                if (val.length < 10 || val.length > 200) return false;
                // Only alphanumeric + hyphen + underscore
                return /^[a-zA-Z0-9_-]+$/.test(val);
            },
            {
                message:
                    'The API key may only contain alphanumeric characters, hyphens and underscores (10-200 characters), or be an empty string',
            }
        )
        .nullable();
});
