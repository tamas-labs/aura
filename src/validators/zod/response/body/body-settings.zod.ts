import { z } from 'zod';
import { BooleanZod } from '../../common/boolean.zod';

/**
 * Body Settings Zod Schema
 *
 * Validates the body's global display settings.
 * Every field is optional; unknown fields are removed by `.strip()`.
 * The whole schema is nullable — a null value is accepted.
 *
 * Validation rules:
 * - `striped`: boolean, nullable, default false
 * - `hoverable`: boolean, nullable, default false
 *
 * @example
 * ```ts
 * BodySettingsZod.parse({ striped: true, hoverable: false }); // success
 * BodySettingsZod.parse({}); // success (all optional)
 * BodySettingsZod.parse(null); // null
 * BodySettingsZod.parse({ striped: true, unknown: 'x' }); // success, unknown stripped
 * BodySettingsZod.parse({ striped: 'yes' }); // error (not boolean)
 * ```
 */
export const BodySettingsZod = z
    .object({
        /** Enable striped rows. */
        striped: BooleanZod.optional(),
        /** Enable hover effect on rows. */
        hoverable: BooleanZod.optional(),
    })
    .strip()
    .nullable();
