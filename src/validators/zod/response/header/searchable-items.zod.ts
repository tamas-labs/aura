import { z } from 'zod';

/**
 * Searchable Items Zod Schema
 * - Validates an array of strings used for global search configuration
 * - Must contain at least one item
 * - Items must be non-empty strings
 * - Not nullable (if present, must be a valid array)
 *
 * @example
 * ```ts
 * SearchableItemsZod.parse(['id', 'name']); // success
 * SearchableItemsZod.parse(['id']); // success
 * SearchableItemsZod.parse([]); // error (min 1)
 * SearchableItemsZod.parse(['']); // error (item min 1)
 * SearchableItemsZod.parse(null); // error (not nullable)
 * ```
 */
export const SearchableItemsZod = z.array(z.string().min(1)).min(1);
