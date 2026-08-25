/**
 * Shared type definitions for segment renderer functions.
 * Used by renderStaticNode, renderIconNode and TableBodyCell.
 */
import type { RawHtmlOptions } from '../../utils/formatters/formatter.types';
import type { AuraCustomRenderer, AuraCustomCallback } from '../../../../types/config.types';

/** Supported date display style options. */
export type DateStyleOption = 'short' | 'medium' | 'long';

/**
 * Options passed to segment renderer functions to provide locale,
 * date formatting and row item data context.
 *
 * Icon/variant registry resolution is handled by the preprocessor layer (⑦.5)
 * before rendering — renderers only work with resolved `class` arrays.
 */
export interface SegmentFormatOptions {
    /** BCP 47 locale string, e.g. 'en-US' or 'hu-HU'. */
    locale: string;
    /** Optional date style for formatValue. */
    dateStyle?: DateStyleOption;
    /** Optional IANA timezone identifier. */
    timeZone?: string;
    /** Row data object, used for route placeholder resolution. */
    item?: Record<string, unknown>;
    /** Base site URL, prepended to resolved route paths. */
    siteName?: string | null;
    /** Global CSS classes from config.classes for type-specific styling (icon, button, link). */
    globalClasses?: Record<string, unknown>;
    /** Icon registry from config.icons — maps icon keys to CSS class arrays (used by button icons). */
    icons?: Record<string, string[]>;
    /** Raw HTML whitelist (config-driven) for sanitizing `raw: true` segments. */
    rawHtml?: RawHtmlOptions;
    /** Custom renderer registry for the `custom` type (config.renderers) — name → function. */
    renderers?: Record<string, AuraCustomRenderer>;
    /** Custom callback registry for the `custom` type (config.callbacks) — name → function. */
    callbacks?: Record<string, AuraCustomCallback>;
}
