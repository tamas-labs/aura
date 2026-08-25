import type { HeaderSettings, FooterSettings } from '../../../types/api-response.types';

/** The attribute fragment applied to the `<thead>`/`<tfoot>` element based on settings. */
export interface SectionSettingsAttrs {
    class?: string;
    style?: Record<string, string>;
}

/**
 * Builds DOM attributes for the `<thead>` / `<tfoot>` element from the
 * header/footer `settings` (sticky/height). `sticky: true` applies the given
 * CSS class (`aura-thead-sticky` or `aura-tfoot-sticky`), `height` applies an
 * inline `height` style. If settings are missing or the switches are off, the
 * corresponding field is omitted (empty object = nothing to do).
 *
 * @param settings - The header/footer settings object (nullable)
 * @param stickyClass - The CSS class for the sticky state
 * @returns The attribute fragment (`class`/`style`)
 */
export function buildSectionSettingsAttrs(
    settings: HeaderSettings | FooterSettings | null | undefined,
    stickyClass: string
): SectionSettingsAttrs {
    const attrs: SectionSettingsAttrs = {};
    if (!settings) return attrs;
    if (settings.sticky) attrs.class = stickyClass;
    if (settings.height) attrs.style = { height: settings.height };
    return attrs;
}
