import { ref, type Ref } from 'vue';
import type { HeaderCell } from '../../../../types';
import { formatValue, buildRawHtmlOptions, type CellFormatConfig } from '../formatters';
import { watchAsyncEffect } from '../../../../utils/composables/watch-async-effect';

/**
 * Interface for the config object required by useFormattedContent
 */
export interface FormattedContentConfig {
    currencyCode?: string | null;
    localization?: string | null;
    /** Raw HTML whitelist settings (config-driven) for `raw: true` cells. */
    rawHtmlAllowedTags?: readonly string[] | null;
    rawHtmlAllowedAttr?: readonly string[] | null;
    rawHtmlAllowDataAttr?: boolean | null;
}

/**
 * Composable to handle cell content formatting using the core configuration.
 * Uses watchEffect with async callback to support async formatters (e.g. phone).
 *
 * @param cell - The header/footer cell configuration object (reactive)
 * @param config - The core configuration object (reactive)
 * @param options - Additional formatting options
 * @returns Object containing the formatted string ref
 */
export function useFormattedContent(
    cell: () => HeaderCell,
    config: () => FormattedContentConfig,
    options?: { skipTypeFormatting?: boolean }
): { formattedContent: Ref<string> } {
    const formattedContent = ref('');

    watchAsyncEffect(async isStale => {
        const cfg = config();
        const { currencyCode, localization } = cfg;
        const cellValue = cell();
        const locale = localization || 'en-US';
        const content = cellValue.content ?? cellValue.label ?? '';

        const formatted = await formatValue(
            content,
            cellValue as CellFormatConfig,
            locale,
            currencyCode ?? undefined,
            { ...options, rawHtml: buildRawHtmlOptions(cfg) }
        );

        // A newer run has started meanwhile - its result is the current one
        if (isStale()) return;

        formattedContent.value = formatted;
    });

    return { formattedContent };
}
