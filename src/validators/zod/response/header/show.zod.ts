import { z } from 'zod';

/**
 * Show Zod Schema
 * - Validates the column's initial visibility (`show`)
 * - Boolean, nullable
 * - **Default: `true`** — this is the key difference from the generic `BooleanZod`:
 *   `show` has opt-out semantics, meaning a **missing** value means a visible column,
 *   and only an explicit `false` hides the column.
 *
 * @example
 * ```ts
 * ShowZod.parse(true);      // true
 * ShowZod.parse(false);     // false (hidden)
 * ShowZod.parse(null);      // null (visible)
 * ShowZod.parse(undefined); // true (default → visible)
 * ```
 */
export const ShowZod = z.boolean().nullable().default(true);
