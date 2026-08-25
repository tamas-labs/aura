import { z } from 'zod';
import { BooleanZod } from '../../common/boolean.zod';
import { HeightZod } from '../header/height.zod';

/**
 * Footer Settings Zod Schema
 * - Validates the structure of the footer settings object
 * - Fields:
 *   - sticky: boolean (optional)
 *   - height: CSS height (optional)
 * - Type: object
 * - Nullable: yes (the settings object itself is also optional)
 * - Strip: removes unknown fields
 *
 * @example
 * ```ts
 * FooterSettingsZod.parse({ sticky: true }); // success
 * FooterSettingsZod.parse({ height: "auto" }); // success
 * FooterSettingsZod.parse({ sticky: true, height: "100px" }); // success
 * FooterSettingsZod.parse({}); // success
 * FooterSettingsZod.parse(null); // success
 * ```
 */
export const FooterSettingsZod = z
    .object({
        sticky: BooleanZod.optional(),
        height: HeightZod.optional(),
    })
    .strip()
    .nullable();
