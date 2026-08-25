import type { CssClass, Size } from '../primitives.types';
import type { BaseColumnConfig } from './base.types';

/**
 * Mapping entry for icon configuration — value → icon-config lookup resolved by the
 * generic `resolveMappingConfig` (flatten layer). No `type`/`label`: icons are not
 * textual content, so there is no display-text field to alias.
 */
export interface IconMappingEntry {
    icon?: string | null;
    variant?: string | null;
    color?: string | null;
    class?: CssClass | null;
    title?: string | null;
    alt?: string | null;
}

/**
 * Configuration for icon columns.
 *
 * The `icon`, `variant` and `color` fields are accepted in the API response input,
 * but the preprocessor layer (⑦.5) normalizes them into the `class` array
 * before rendering. After preprocessing, only `class` is used for CSS.
 */
export interface IconConfig extends BaseColumnConfig {
    type: 'icon';
    /** Icon name — resolved into `class` by the preprocessor via config.icons registry */
    icon?: string | null;
    /** Variant key — resolved into `text-{color}` class by the preprocessor via config.variants registry */
    variant?: string | null;
    /** Color key — alternative to variant; same preprocessing resolution chain */
    color?: string | null;
    /** Accessible label rendered as aria-label on the <i> element; max 500 chars */
    alt?: string | null;
    /** Tooltip text rendered as title attribute on the <i> element; max 500 chars */
    title?: string | null;
    /** URL template; {key} placeholders resolved from item data, dots converted to slashes, siteName prepended */
    route?: string | null;
    size?: Size | null;
    /** Field key to use in URL generation and conditional evaluation */
    key?: string | null;
    /** Value-based mapping configuration, resolved by `resolveMappingConfig` after if/else flattening */
    mapping?: Record<string, IconMappingEntry> | null;
}
