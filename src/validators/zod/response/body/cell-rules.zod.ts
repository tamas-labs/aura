import type { z } from 'zod';
import { CellFormattingOptionsZod } from './cell-formatting-options.zod';
import { ConditionalConfigZod } from './conditional-config.zod';

/**
 * Cell Rules Zod Schema
 *
 * Validates the `body.columnConfigs.*.cellRules` conditional cell formatting configuration.
 * Combines `CellFormattingOptionsZod` (background, border, padding etc.) with
 * `ConditionalConfigZod` (key, if, else conditional structure).
 *
 * `cellRules` is a property of individual `columnConfigs` entries —
 * it conditionally formats that cell's `<td>` element.
 *
 * Validation rules:
 * - Inherits all fields of `CellFormattingOptionsZod` (formatting)
 * - Inherits the fields of `ConditionalConfigZod` (`key`, `if`, `else`)
 * - The whole schema is nullable — if `cellRules: null`, there is no conditional formatting
 *
 * @example
 * ```ts
 * CellRulesZod.parse({
 *     key: 'status',
 *     if: [
 *         { eq: 'active', background: 'success-subtle', borderBottom: true, borderColor: 'success' },
 *         { eq: 'pending', background: 'warning-subtle' }
 *     ],
 *     else: { background: 'light' }
 * }); // success
 *
 * CellRulesZod.parse(null); // success — nullable
 *
 * CellRulesZod.parse({
 *     key: 'score',
 *     if: [{ gte: 90, background: 'success-subtle', borderLeft: true, borderWidth: '3px' }]
 * }); // success
 *
 * CellRulesZod.parse({ opacity: 1.5 }); // Error — opacity max 1
 * ```
 */
export const CellRulesZod = CellFormattingOptionsZod.merge(ConditionalConfigZod).nullable();

/**
 * TypeScript type derived from CellRulesZod.
 */
export type CellRulesZodInput = z.input<typeof CellRulesZod>;
