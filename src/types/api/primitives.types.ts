/**
 * Common Literal Types
 */

/**
 * Text alignment options.
 */
export type Align = 'start' | 'center' | 'end';

/**
 * Size options for various components.
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Bootstrap color variants.
 */
export type BootstrapColor =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'dark'
    | 'light';

/**
 * Icon position options.
 */
export type IconPosition = 'start' | 'end';

/**
 * Label position options for progress bars.
 */
export type LabelPosition = 'inside' | 'outside';

/**
 * HTML link target attributes.
 */
export type LinkTarget = '_blank' | '_self' | '_parent' | '_top';

/**
 * HTML button type attributes.
 */
export type ButtonHtmlType = 'button' | 'submit' | 'reset';

/**
 * CSS property value that accepts both string and number formats.
 * Used for properties like fontWeight (700 or 'bold') and lineHeight (1.5 or '24px').
 */
export type CssNumericValue = string | number | null;

/**
 * Available cell types for advanced rendering.
 */
export type CellType =
    | 'number'
    | 'currency'
    | 'date'
    | 'datetime'
    | 'phone'
    | 'time'
    | 'static'
    | 'icon'
    | 'link'
    | 'modal'
    | 'reference'
    | 'badge'
    | 'progress'
    | 'button'
    | 'custom';

/**
 * Sort direction for table ordering.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * CSS class name(s) - can be a single string or an array of strings.
 */
export type CssClass = string | string[];

/**
 * Cell content types
 */
export type CellContent = string | number | null;

/**
 * Label type for boolean or string labels
 */
export type LabelType = boolean | string | null;

/**
 * A row identifier used by the selection feature. Sent to the server in the
 * `selected` request field.
 */
export type RowId = string | number;

/**
 * A single bound of a range (`between`) search. `null` means "no bound" (open range).
 */
export type RangeBound = number | string | null;
