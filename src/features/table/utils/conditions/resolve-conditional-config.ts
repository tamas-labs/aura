import { resolveValue } from '../../../../utils';
import { evaluateCondition } from './evaluate-condition';
import { extractOperator } from './extract-operator';

/** Hard cap on `if`/`else` nesting; deeper branches are ignored. */
export const MAX_RECURSION_DEPTH = 5;
const LOGIC_KEYS = new Set(['if', 'else', 'key']);
const CONDITIONAL_KEYS = new Set(['if', 'else']);

/**
 * Strips logic properties ('if', 'else', 'key') from a root-level configuration.
 * At root level 'key' serves as the conditional field selector and must be removed.
 */
function stripLogicProps(config: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(config).filter(([k]) => !LOGIC_KEYS.has(k)));
}

/**
 * Strips only conditional branching properties ('if', 'else') from a leaf branch.
 * Unlike stripLogicProps, 'key' is preserved because at the leaf level it serves
 * as a data field (e.g. for route placeholder resolution), not a conditional selector.
 */
function stripBranchProps(config: Record<string, unknown>): Record<string, unknown> {
    return Object.fromEntries(Object.entries(config).filter(([k]) => !CONDITIONAL_KEYS.has(k)));
}

/**
 * Finds the first matching branch from the if-array against the given field value.
 */
function findMatchingBranch(
    ifArray: unknown[],
    fieldValue: unknown
): Record<string, unknown> | null {
    for (const conditionObj of ifArray) {
        if (!conditionObj || typeof conditionObj !== 'object') continue;
        const operatorData = extractOperator(conditionObj as Record<string, unknown>);
        if (!operatorData) continue;
        if (evaluateCondition(fieldValue, operatorData.operator, operatorData.value)) {
            return conditionObj as Record<string, unknown>;
        }
    }
    return null;
}

/**
 * Resolves a potentially conditional configuration against the given item.
 *
 * @param config A column/cell configuration that might have if/else branching
 * @param item The row data item
 * @param depth Current recursion depth (to avoid infinite loops)
 * @param onMaxDepth Called when the depth cap truncates the config; the caller
 *        routes it to the error store (see `createMaxDepthReporter`). A plain
 *        `console.warn` used to sit here, and the production build strips it.
 * @returns Resolves configuration object or null if matched no condition and no else,
 *          or the original stripped of logic if invalid condition.
 */
export function resolveConditionalConfig(
    config: Record<string, unknown>,
    item: Record<string, unknown>,
    depth = 0,
    onMaxDepth?: () => void
): Record<string, unknown> | null {
    if (depth >= MAX_RECURSION_DEPTH) {
        onMaxDepth?.();
        return stripLogicProps(config);
    }

    if (!('if' in config) && !('else' in config)) {
        return config; // Not a conditional config
    }

    // Default to the original logic-stripped config
    const rootConfig = stripLogicProps(config);

    // We only process if there is a key
    if (typeof config.key !== 'string') {
        return rootConfig;
    }

    const fieldKey = config.key;
    const fieldValue = resolveValue(item, fieldKey);

    const ifArray = Array.isArray(config.if) ? config.if : [];
    const matchedBranch = findMatchingBranch(ifArray, fieldValue);

    let finalBranch: Record<string, unknown> | null | undefined = matchedBranch;

    if (!finalBranch) {
        // No conditions matched
        if ('else' in config && config.else && typeof config.else === 'object') {
            finalBranch = config.else as Record<string, unknown>;
        } else {
            // No else branch logic
            return null; // The cell/rule evaluates to empty
        }
    }

    // Strip the operator key from the branch (e.g. remove 'eq' from { eq: 'active', key: '...', if: [...] })
    const branchProps = { ...finalBranch };
    if (matchedBranch) {
        const opData = extractOperator(matchedBranch);
        if (opData) {
            delete branchProps[opData.operator];
        }
    }

    // If the branch itself is conditional, recurse — preserve key/if/else so the recursion can process them
    if ('if' in finalBranch || 'else' in finalBranch) {
        const mergedForRecursion: Record<string, unknown> = {
            ...rootConfig,
            ...branchProps, // keep key, if, else intact for the recursive call
        };
        return resolveConditionalConfig(mergedForRecursion, item, depth + 1, onMaxDepth);
    }

    // Non-conditional branch: strip only if/else, preserve 'key' for route/data resolution
    return {
        ...rootConfig,
        ...stripBranchProps(branchProps),
    };
}
