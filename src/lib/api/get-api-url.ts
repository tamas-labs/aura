import { readOwnEntry } from '../../utils/safe-object.util';

/**
 * Builds the API URL based on config
 *
 * @param urlStructure - URL template with placeholders
 * @param siteName - Site name
 * @param urlParameter - URL parameter (leading slash is stripped)
 * @param urlParameterLastSegment - Last segment of the URL (leading slash is stripped)
 * @returns The assembled API URL
 */
export const getApiUrl = (
    urlStructure: string | null,
    siteName: string | null,
    urlParameter: string | null,
    urlParameterLastSegment: string | null
): string => {
    if (!urlStructure) {
        return '';
    }

    const cleanUrlParameter = urlParameter ? urlParameter.replace(/^\/+/, '') : '';
    const cleanUrlParameterLastSegment = urlParameterLastSegment
        ? urlParameterLastSegment.replace(/^\/+/, '')
        : '';

    const replacements: Record<string, string> = {
        '{siteName}': siteName || '',
        '{urlParameter}': cleanUrlParameter,
        '{urlParameterLastSegment}': cleanUrlParameterLastSegment,
    };

    return urlStructure.replace(
        /{siteName}|{urlParameter}|{urlParameterLastSegment}/g,
        (matched: string) => readOwnEntry(replacements, matched) ?? matched
    );
};
