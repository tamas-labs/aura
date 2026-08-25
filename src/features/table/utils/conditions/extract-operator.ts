import { CONDITIONAL_OPERATORS } from './operator-names';

/**
 * Extracts the first operator and its value from a condition object.
 *
 * @param config A condition object which might contain an operator key.
 * @returns An object with operator and value, or null if none found.
 *
 * @example
 * extractOperator({ eq: 'active', variant: 'success' }) // { operator: 'eq', value: 'active' }
 * extractOperator({ value: 'hello' }) // null
 */
export function extractOperator(
    config: Record<string, unknown>
): { operator: string; value: unknown } | null {
    for (const key of Object.keys(config)) {
        if (CONDITIONAL_OPERATORS.has(key)) {
            return { operator: key, value: config[key] };
        }
    }
    return null;
}
