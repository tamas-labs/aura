/**
 * Common cell configuration for all cell types.
 * Header, Body and Footer cells inherit from this.
 */
export interface BaseCellConfig {
    /** Unique identifier */
    key: string;

    // === Layout ===
    width?: string | null;
    colspan?: number | null;
    rowspan?: number | null;

    // === Alignment ===
    align?: 'start' | 'center' | 'end' | null;

    // === Colors ===
    color?: string | null;
    background?: string | null;

    // === Typography ===
    fontSize?: string | null;
    fontWeight?: string | number | null;
    lineHeight?: string | number | null;
    italic?: boolean | null;
    normal?: boolean | null;
    monospace?: boolean | null;

    // === Text Transform ===
    uppercase?: boolean | null;
    lowercase?: boolean | null;
    capitalize?: boolean | null;

    // === CSS ===
    class?: string | string[] | null;
    style?: string | Record<string, string> | null;
    text?: string | null; // Bootstrap text utility
}

/**
 * Header cell configuration - with sorting support.
 */
export interface HeaderCellConfig extends BaseCellConfig {
    label?: string | null;
    content?: string | null;
    field?: string | null;
    sortable?: boolean | null;
    searchable?: boolean | null;
    filterable?: boolean | null;
    elements?: (string | number)[] | Record<string, string | number> | null;
}

/**
 * Body cell configuration - with formatting options.
 */
export interface BodyCellConfig extends BaseCellConfig {
    type?: 'static' | 'icon' | 'link' | 'badge' | 'checkbox' | 'actions' | null;

    // === Content manipulation ===
    slice?: number | null;
    sliceEnd?: string | null;
    number?: boolean | null;
    currency?: string | null;
    unit?: string | null;
    date?: boolean | null;
    datetime?: boolean | null;
    phone?: boolean | null;
    time?: boolean | null;
    raw?: boolean | null;

    // === Padding ===
    pad?: number | null;
    padStart?: number | null;
    padEnd?: number | null;
    chars?: string | null;
}

/**
 * Footer cell configuration.
 */
export interface FooterCellConfig extends BaseCellConfig {
    label?: string | null;
    content?: string | null;
}

import type { ColumnConfig } from './api-response.types';

/**
 * Represents a single segment within a multi-field cell.
 *
 * - `type: 'value'` — field value resolved from the data item
 * - `type: 'config'` — static/configured content from `body.columnConfigs`
 */
export interface FieldSegment {
    /** Segment source type */
    type: 'value' | 'config';
    /** The resolved value or static text to display */
    value: unknown;
    /** The column config (only present when type is 'config') */
    config?: ColumnConfig;
}
