import { z } from 'zod';
import { HeaderRowZod } from './header-row.zod';

/**
 * Header Rows Zod Schema
 *
 * Validates the structure of the header.rows array:
 * - Required array type (CANNOT be null or undefined)
 * - Must contain at least 1 row (cannot be empty)
 * - Elements: objects validated by HeaderRowZod
 *
 * @example Valid structure
 * ```ts
 * HeaderRowsZod.parse([
 *   { cells: [...] },
 *   { cells: [...] }
 * ]); // success
 * ```
 *
 * @example Invalid cases
 * ```ts
 * HeaderRowsZod.parse([]); // error - empty array
 * HeaderRowsZod.parse(null); // error - null not allowed
 * HeaderRowsZod.parse(undefined); // error - undefined not allowed
 * HeaderRowsZod.parse([1, 2, 3]); // error - not object elements
 * ```
 */
export const HeaderRowsZod = z
    .array(HeaderRowZod)
    .min(1, 'Header rows array must contain at least one row');
