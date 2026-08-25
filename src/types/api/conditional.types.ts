/**
 * Conditional Rendering Types
 */

/**
 * Operators used in conditional rendering logic.
 */
export type ConditionalOperator =
    | 'eq'
    | 'ne'
    | 'neq'
    | 'gt'
    | 'bigger'
    | 'gte'
    | 'biggerOrEqual'
    | 'lt'
    | 'smaller'
    | 'lte'
    | 'smallerOrEqual'
    | 'between'
    | 'in'
    | 'notIn'
    | 'contains'
    | 'startsWith'
    | 'endsWith'
    | 'regex'
    | 'null'
    | 'notNull'
    | 'empty'
    | 'notEmpty'
    | 'true'
    | 'false';

/**
 * A single rule for conditional rendering.
 * It's a "flat" structure where the operator is the key.
 */
export type ConditionalRule<TConfig = Record<string, unknown>> = {
    [key: string]: unknown;
} & TConfig;

/**
 * Configuration for conditional rendering based on field values.
 */
export interface ConditionalConfig<TConfig = Record<string, unknown>> {
    /** The field key to check the condition against */
    key?: string | null;
    /** Array of conditions to evaluate */
    if?: ConditionalRule<TConfig>[];
    /** Default configuration if no condition is met */
    else?: TConfig | null;
}
