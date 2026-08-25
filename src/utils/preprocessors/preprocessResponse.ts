/**
 * Response preprocessor — the ⑦.5 layer between response validation and
 * client-side processing.
 *
 * Responsibilities:
 * 1. Auto-generates `body.columnConfigs` entries for `_icon` suffixed fields
 *    (built-in `create`/`edit`/`show` prefixes get routes, `destroy` a modal trigger)
 * 2. Normalizes existing icon configs: resolves `icon`/`variant`/`color` into `class`
 * 3. Normalizes modal configs: resolves shorthand fields and branch types into `content` objects
 * 4. Auto-generates `body.columnConfigs` entries for `_link` suffixed fields
 * 5. Auto-generates `body.columnConfigs` entries for `_button` suffixed fields
 * 6. Auto-generates `body.columnConfigs` entries for `_badge` suffixed fields
 * 7. Auto-generates `body.columnConfigs` entries for `_progress` suffixed fields
 *
 * The preprocessor is a pure function — it does not mutate the input objects.
 *
 * @example
 * ```ts
 * const preprocessedBody = preprocessResponse(header, body, items, icons, variants, urlParameter);
 * // preprocessedBody now has auto-generated and normalized icon/modal/link configs
 * ```
 */
import type { Header, Body } from '../../types/api-response.types';
import { preprocessIconFields } from './preprocessIconFields';
import { normalizeIconConfigs } from './normalizeIconConfigs';
import { normalizeModalConfigs } from './normalizeModalConfigs';
import { preprocessLinkFields } from './preprocessLinkFields';
import { preprocessButtonFields } from './preprocessButtonFields';
import { preprocessBadgeFields } from './preprocessBadgeFields';
import { preprocessProgressFields } from './preprocessProgressFields';

/**
 * Preprocesses the API response to enrich and normalize `body.columnConfigs`.
 *
 * Steps:
 * 1. Scans header for `_icon` suffixed fields → auto-generates columnConfig entries
 * 2. Normalizes all icon-type configs: `icon`/`variant`/`color` → `class` array
 * 3. Normalizes modal configs: shorthand/branch types → `content` objects
 * 4. Scans header for `_link` suffixed fields → auto-generates link columnConfig entries
 * 5. Scans header for `_button` suffixed fields → auto-generates button columnConfig entries
 * 6. Scans header for `_badge` suffixed fields → auto-generates badge columnConfig entries
 * 7. Scans header for `_progress` suffixed fields → auto-generates progress columnConfig entries
 *
 * @param header - Validated header from the API response (may be null)
 * @param body - Validated body from the API response (may be null)
 * @param items - The items array from the API response
 * @param icons - Icon registry from config store
 * @param variants - Variant registry from config store
 * @param urlParameter - Resource base path from config (the `{current_url}` equivalent for `_link` routes)
 * @returns The enriched and normalized body, or the original body if no changes needed
 */
export function preprocessResponse(
    header: Header | null,
    body: Body | null,
    items: unknown[] | undefined,
    icons: Record<string, string[]> | undefined,
    variants: Record<string, string> | undefined,
    urlParameter?: string | null
): Body | null {
    if (!header) return body;

    // Step 1: Auto-generate configs for _icon suffixed fields (built-in prefixes get routes)
    let processedBody = preprocessIconFields(header, body, items, icons, variants, urlParameter);

    // Step 2: Normalize existing icon configs (icon/variant/color → class)
    processedBody = normalizeIconConfigs(processedBody, icons, variants);

    // Step 3: Normalize modal configs (shorthand/branch types → content)
    processedBody = normalizeModalConfigs(processedBody, icons, variants);

    // Step 4: Auto-generate configs for _link suffixed fields
    processedBody = preprocessLinkFields(header, processedBody, urlParameter);

    // Step 5: Auto-generate configs for _button suffixed fields (variant from registry)
    processedBody = preprocessButtonFields(header, processedBody, variants, urlParameter);

    // Step 6: Auto-generate configs for _badge suffixed fields (variant from registry, no routes)
    processedBody = preprocessBadgeFields(header, processedBody, variants);

    // Step 7: Auto-generate configs for _progress suffixed fields (no routes, no variant registry)
    processedBody = preprocessProgressFields(header, processedBody);

    return processedBody;
}
