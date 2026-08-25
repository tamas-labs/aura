import { z } from 'zod';

/**
 * Zod schema for validating siteToken.
 *
 * Accepts:
 * - string: API token or identifier
 * - boolean: enable (true) or disable (false)
 * - null: not set
 */
export const SiteTokenZod = z
    .union([z.string(), z.boolean(), z.null()])
    .describe('Site Token (string | boolean | null)');
