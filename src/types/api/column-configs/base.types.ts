import type { CellType, CssClass } from '../primitives.types';
import type { ConditionalConfig } from '../conditional.types';
import type { CellRules } from '../formatting.types';

/**
 * Base configuration properties shared by all column types.
 * Extended with conditional rendering logic.
 */
export interface BaseColumnConfig extends ConditionalConfig<BaseColumnConfig> {
    /** Cell type identifier */
    type?: CellType | null;
    /** CSS classes */
    class?: CssClass | null;
    /** Inline styles */
    style?: string | null;
    /** Conditional rules for cell styling applied to the <td> element */
    cellRules?: CellRules | null;
    /** Custom data attributes */
    [key: `data-${string}`]: string | null | undefined;
}
