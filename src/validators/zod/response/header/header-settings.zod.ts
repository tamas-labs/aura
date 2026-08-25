import { z } from 'zod';
import { BooleanZod } from '../../common/boolean.zod';
import { HeightZod } from './height.zod';
import { SearchableItemsZod } from './searchable-items.zod';

/**
 * Header Settings Zod Schema
 * - Validates the structure of the header settings object
 * - Fields:
 *   - sticky: boolean (optional)
 *   - height: CSS height (optional)
 *   - searchableItems: string array (optional, for global search)
 * - Type: object
 * - Nullable: yes (the settings object itself is also optional)
 *
 * @example
 * ```ts
 * HeaderSettingsZod.parse({ sticky: true }); // success
 * HeaderSettingsZod.parse({ height: "auto" }); // success
 * HeaderSettingsZod.parse({ searchableItems: ["id", "name"] }); // success
 * HeaderSettingsZod.parse({ sticky: true, height: "100px" }); // success
 * HeaderSettingsZod.parse({}); // success
 * HeaderSettingsZod.parse(null); // success
 * ```
 */
export const HeaderSettingsZod = z
    .object({
        sticky: BooleanZod.optional(),
        height: HeightZod.optional(),
        searchableItems: SearchableItemsZod.optional(),
    })
    .strip()
    .nullable();
