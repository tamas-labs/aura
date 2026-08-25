import type { z } from 'zod';
import { CellFormattingOptionsZod } from './cell-formatting-options.zod';
import { ConditionalConfigZod } from './conditional-config.zod';

/**
 * Row Rules Zod Schema
 *
 * Validates the `body.rowRules` conditional row formatting configuration.
 * Combines `CellFormattingOptionsZod` (background, border, padding etc.) with
 * `ConditionalConfigZod` (key, if, else conditional structure).
 *
 * `rowRules` is a `body`-level property — it conditionally formats the whole `<tr>` row.
 * It applies to every cell in the row, but `cellRules` and `columnConfigs` styles can override it.
 *
 * Priority: rowRules < cellRules < columnConfigs styles
 *
 * Validation rules:
 * - Inherits all fields of `CellFormattingOptionsZod` (formatting)
 * - Inherits the fields of `ConditionalConfigZod` (`key`, `if`, `else`)
 * - The whole schema is nullable — if `rowRules: null`, there is no conditional row formatting
 *
 * @example
 * ```ts
 * RowRulesZod.parse({
 *     key: 'status',
 *     if: [
 *         { eq: 'active', background: 'success-subtle', borderBottom: true, borderColor: 'success' },
 *         { eq: 'pending', background: 'warning-subtle', borderBottom: true, borderColor: 'warning' },
 *         { eq: 'inactive', background: 'secondary-subtle', class: 'text-muted' }
 *     ],
 *     else: { background: 'light' }
 * }); // success
 *
 * RowRulesZod.parse(null); // success — nullable
 *
 * RowRulesZod.parse({
 *     key: 'expires_at',
 *     if: [
 *         { lt: 'now', background: 'danger-subtle', opacity: 0.6, class: 'text-decoration-line-through' },
 *         { lt: 'tomorrow', background: 'warning-subtle', borderLeft: true, borderWidth: '4px' }
 *     ]
 * }); // success
 *
 * RowRulesZod.parse({ opacity: -0.1 }); // Error — opacity min 0
 * ```
 */
export const RowRulesZod = CellFormattingOptionsZod.merge(ConditionalConfigZod).nullable();

/**
 * TypeScript type derived from RowRulesZod.
 */
export type RowRulesZodInput = z.input<typeof RowRulesZod>;
