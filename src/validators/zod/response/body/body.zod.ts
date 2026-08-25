import { z } from 'zod';
import { BodySettingsZod } from './body-settings.zod';
import { RowRulesZod } from './row-rules.zod';

/**
 * Body Zod Schema
 *
 * Validates the basic structure of the body object.
 * Detailed validation of the `columnConfigs` entries happens in the `validateBody`
 * schema validator, via type dispatch.
 * Unknown top-level fields are removed by `.strip()`.
 *
 * Validation rules:
 * - `columnConfigs`: Record<string, Record<string, unknown>>, optional, nullable
 *   (entry contents are validated by the schema validator via type dispatch)
 * - `columnStyles`: Record<string, unknown>, optional, nullable (pass-through)
 * - `settings`: BodySettingsZod, optional
 * - `rowRules`: RowRulesZod, optional (conditional row styling validated)
 *
 * @example
 * ```ts
 * BodyZod.parse({ columnConfigs: { id: { type: 'static', value: 'ID:' } } }); // success
 * BodyZod.parse({}); // success (all fields optional)
 * BodyZod.parse({ settings: { striped: true } }); // success
 * BodyZod.parse({ unknownField: 'x', columnConfigs: null }); // success, unknownField stripped
 * BodyZod.parse(null); // error (must be object)
 * BodyZod.parse({ rowRules: { key: 'status', if: [{ eq: 'active', background: 'success-subtle' }] } }); // success
 * ```
 */
export const BodyZod = z
    .object({
        /** Configuration for individual columns by key. */
        columnConfigs: z
            .record(z.string(), z.record(z.string(), z.unknown()))
            .nullable()
            .optional(),

        /** CSS styles for columns by key (pass-through). */
        columnStyles: z.record(z.string(), z.unknown()).nullable().optional(),

        /** Body global settings. */
        settings: BodySettingsZod.optional(),

        /** Conditional rules for row styling (RowRulesZod validated). */
        rowRules: RowRulesZod.optional(),
    })
    .strip();
