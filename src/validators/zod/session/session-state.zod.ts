import { z } from 'zod';

/**
 * Zod schema for a single sort item.
 * Validates 'field' (string) and 'direction' ('asc' or 'desc').
 */
export const SortItemZod = z.object({
    field: z.string().min(1).max(250),
    direction: z.enum(['asc', 'desc']),
});

/**
 * Zod schema for a single search item.
 * Validates 'field' (string), optional 'term' (string), optional 'exact' (boolean),
 * and the optional 'min'/'max' bounds used by range (`between`) searches.
 */
export const SearchItemZod = z.object({
    field: z.string().min(1).max(250),
    term: z.string().min(1).max(500).optional(),
    exact: z.boolean().optional(),
    min: z
        .union([z.number(), z.string().max(500)])
        .nullable()
        .optional(),
    max: z
        .union([z.number(), z.string().max(500)])
        .nullable()
        .optional(),
});

/**
 * Zod schema for a single filter item.
 * Validates 'field' (string) and 'values' (array of unknown).
 */
export const FilterItemZod = z.object({
    field: z.string().min(1).max(250),
    values: z.array(z.unknown()).max(100),
});

/**
 * Zod schema for the entire session state.
 * Validates pagination, sorting, and searching parameters restored from sessionStorage.
 *
 * Constraints:
 * - page: integer, min 1, max 100000
 * - limit: integer, min 1, max 1000
 * - sortItems: array, max 20 items
 * - searchItems: array, max 50 items
 * - globalSearchTerm: nullable, string, max 500 chars if present
 */
export const SessionStateZod = z.object({
    page: z.number().int().min(1).max(100000),
    limit: z.number().int().min(1).max(1000),
    sortItems: z.array(SortItemZod).max(20),
    searchItems: z.array(SearchItemZod).max(50),
    filterItems: z.array(FilterItemZod).max(50).optional(),
    globalSearchTerm: z.string().min(1).max(500).nullable(),
    selectedRows: z
        .array(z.union([z.string().max(250), z.number()]))
        .max(10000)
        .optional(),
});
