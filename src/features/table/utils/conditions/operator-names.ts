/**
 * Set of all supported conditional operator names.
 *
 * Used by `extractOperator` to identify which keys in a condition object
 * represent an operator (as opposed to config properties like `variant` or `label`).
 *
 * @example
 * CONDITIONAL_OPERATORS.has('eq')    // true
 * CONDITIONAL_OPERATORS.has('label') // false
 */
export const CONDITIONAL_OPERATORS = new Set<string>([
    'eq',
    'ne',
    'neq',
    'gt',
    'bigger',
    'gte',
    'biggerOrEqual',
    'lt',
    'smaller',
    'lte',
    'smallerOrEqual',
    'between',
    'in',
    'notIn',
    'contains',
    'startsWith',
    'endsWith',
    'regex',
    'null',
    'notNull',
    'empty',
    'notEmpty',
    'true',
    'false',
]);
