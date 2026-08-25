/**
 * Extracts the region/country code from a BCP 47 locale string.
 *
 * Uses the built-in `Intl.Locale` API to parse the locale and extract
 * the region subtag (e.g., "hu-HU" → "HU", "en-US" → "US").
 *
 * @param locale - A BCP 47 locale string (e.g., "hu-HU", "en-US", "de-DE")
 * @returns The uppercase 2-letter country/region code, or undefined if not available
 *
 * @example
 * extractCountryFromLocale('hu-HU'); // 'HU'
 * extractCountryFromLocale('en-US'); // 'US'
 * extractCountryFromLocale('de-DE'); // 'DE'
 * extractCountryFromLocale('pt-BR'); // 'BR'
 * extractCountryFromLocale('en');    // undefined (no region)
 * extractCountryFromLocale('');      // undefined
 */
export function extractCountryFromLocale(locale: string): string | undefined {
    if (!locale) return undefined;

    try {
        const parsedLocale = new Intl.Locale(locale);
        return parsedLocale.region ?? undefined;
    } catch {
        return undefined;
    }
}
