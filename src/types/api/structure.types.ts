/**
 * Header / Body / Footer Structure Types
 */

import type {
    Align,
    CellContent,
    CellType,
    CssClass,
    CssNumericValue,
    Size,
} from './primitives.types';
import type { FilterElement } from './query.types';
import type { RowRules } from './formatting.types';
import type { ColumnConfig } from './column-configs';

/**
 * Definition of a single cell in the table header.
 *
 * @example
 * ```typescript
 * const cell: HeaderCell = {
 *   content: 'User ID',
 *   key: 'id',
 *   field: 'id',
 *   sortable: true,
 *   width: '100px'
 * };
 * ```
 */
export interface HeaderCell {
    /** Displayed text content. Required (can be null for special cases). */
    content: CellContent;
    /** Unique identifier for the column. Required. */
    key: string;

    /** Field name in the data item. Mutually exclusive with `fields`. */
    field?: string;
    /** Array of field names for multi-field cells. Mutually exclusive with `field`. */
    fields?: string[];

    /** Alternative label (backward compatibility). */
    label?: string | null;

    // Layout
    /** Number of columns validation extends to. */
    colspan?: number | null;
    /** Number of rows validation extends to. */
    rowspan?: number | null;
    /** Width of the column (CSS units: px, %, rem, auto). */
    width?: string | null;
    /** Whether the column width is resizable. */
    resizable?: boolean | null;

    // Padding
    /** General padding value. */
    pad?: number | null;
    /** Start (left) padding value. */
    padStart?: number | null;
    /** End (right) padding value. */
    padEnd?: number | null;
    /** Character used for padding. */
    chars?: string | null;

    // Features
    /** Enable sorting for this column. */
    sortable?: boolean | null;
    /** Enable searching for this column. */
    searchable?: boolean | null;
    /** Enable filtering for this column. */
    filterable?: boolean | null;
    /** Elements for filtering (array of FilterElement objects, simple array, or object). */
    elements?: FilterElement[] | (string | number)[] | Record<string, string | number> | null;
    /** Enable selection for this column. */
    selectable?: boolean | null;
    /** Show/hide this column initial state. */
    show?: boolean | null;
    /** Enable range filtering (between) for this column. */
    between?: boolean | null;

    // Reference
    /** Reference field name for filtering/searching. */
    reference?: string | null;

    // Formatting
    /** Text alignment. */
    align?: Align | null;
    /** Size variant. */
    size?: Size | null;
    /** Text color (Bootstrap or CSS). */
    color?: string | null;
    /** Background color (Bootstrap or CSS). */
    background?: string | null;
    /** Font size (CSS). */
    fontSize?: string | null;
    /** Font weight (CSS or number). */
    fontWeight?: CssNumericValue;
    /** Line height (CSS or number). */
    lineHeight?: CssNumericValue;
    /** Italic style. */
    italic?: boolean | null;
    /** Normal style. */
    normal?: boolean | null;
    /** Monospace font family. */
    monospace?: boolean | null;
    /** Bootstrap text utility class (e.g. text-truncate). */
    text?: string | null;

    // Content Manipulation
    /** Format as number. */
    number?: boolean | null;
    /** Indicates this column contains currency values (uses config.currencyCode for formatting). */
    currency?: boolean | string | null;
    /** Format with Intl.NumberFormat unit style. Value must be a valid unit identifier (e.g., 'kilogram', 'celsius', 'percent'). */
    unit?: string | null;
    /** Format as date. */
    date?: boolean | null;
    /** Format as date and time. */
    datetime?: boolean | null;
    /** Format as phone number. */
    phone?: boolean | null;
    /** Format seconds as duration (HH:mm:ss). Only integers accepted, supports negative values. */
    time?: boolean | null;
    /** Truncate text to length. */
    slice?: number | null;
    /** Text to append after slicing. */
    sliceEnd?: string | null;
    /** Transform to uppercase. */
    uppercase?: boolean | null;
    /** Transform to lowercase. */
    lowercase?: boolean | null;
    /** Capitalize first letter. */
    capitalize?: boolean | null;
    /** Handle as object. */
    object?: boolean | null;
    /** Render as raw HTML. */
    raw?: boolean | string | null;

    // Other
    /** Custom CSS classes. */
    class?: CssClass | null;
    /** Inline CSS styles. */
    style?: string | null;
    /** Cell type identifier. */
    type?: CellType | null;

    /** Custom data attributes. */
    [key: `data-${string}`]: string | null | undefined;
}

/**
 * Represents a single row in the table header.
 */
export interface HeaderRow {
    /** Array of header cells in this row. */
    cells?: HeaderCell[];
    [key: string]: unknown;
}

/**
 * Global settings for the table header.
 */
export interface HeaderSettings {
    /** Whether the header sticks to the top during scroll. */
    sticky?: boolean | null;
    /** Fixed height for the header. */
    height?: string | null;
    /** Fields available for global search. */
    searchableItems?: string[];
}

/**
 * Complete header configuration structure.
 *
 * @example
 * ```typescript
 * const header: Header = {
 *   rows: [
 *     { cells: [{ content: 'Name', key: 'name' }] }
 *   ],
 *   settings: { sticky: true }
 * };
 * ```
 */
export interface Header {
    /** Header rows. */
    rows?: HeaderRow[];
    /** Header settings. */
    settings?: HeaderSettings | null;
    [key: string]: unknown;
}

/**
 * Global settings for the table body.
 */
export interface BodySettings {
    /** Enable striped rows. */
    striped?: boolean | null;
    /** Enable hover effect on rows. */
    hoverable?: boolean | null;
}

/**
 * Complete body configuration structure.
 * Defines column configurations, styles, and conditional rules.
 */
export interface Body {
    /** Configuration for individual columns by key. */
    columnConfigs?: Record<string, ColumnConfig> | null;
    /** CSS styles for columns by key. */
    columnStyles?: Record<string, CssClass> | null;
    /** Body settings. */
    settings?: BodySettings | null;
    /** Conditional rules for row styling. */
    rowRules?: RowRules | null;
    /** Allow additional properties for backward compatibility. */
    [key: string]: unknown;
}

/**
 * Represents a single row in the table footer.
 * Inherits all properties from HeaderRow.
 */
export type FooterRow = HeaderRow;

/**
 * Global settings for the table footer.
 */
export interface FooterSettings {
    /** Whether the footer sticks to the bottom. */
    sticky?: boolean | null;
    /** Fixed height for the footer. */
    height?: string | null;
}

/**
 * Complete footer configuration structure.
 */
export interface Footer {
    /** Footer rows. */
    rows?: FooterRow[];
    /** Footer settings. */
    settings?: FooterSettings | null;
    /** Allow additional properties for backward compatibility. */
    [key: string]: unknown;
}
