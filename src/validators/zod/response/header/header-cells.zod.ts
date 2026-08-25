import { z } from 'zod';
import { HeaderCellZod } from './header-cell.zod';

/**
 * Header Cells Zod Schema
 *
 * Validates the structure of the header.rows[].cells array:
 * - Required array type (CANNOT be null or undefined)
 * - Must contain at least 1 cell (cannot be empty)
 * - Elements: objects validated by HeaderCellZod
 *
 * @example Valid structure
 * ```ts
 * HeaderCellsZod.parse([
 *   { content: 'ID', field: 'id' },
 *   { content: 'Name', field: 'name' }
 * ]); // success
 * ```
 *
 * @example Invalid cases
 * ```ts
 * HeaderCellsZod.parse([]); // error - empty array
 * HeaderCellsZod.parse(null); // error - null not allowed
 * HeaderCellsZod.parse(['cell1']); // error - not object elements
 * ```
 */
export const HeaderCellsZod = z
    .array(HeaderCellZod)
    .min(1, 'Header cells array must contain at least one cell');
