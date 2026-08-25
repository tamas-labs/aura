import type { ECSError, ErrorSeverity } from '../../../../types/error.types';
import { MAX_RECURSION_DEPTH } from './resolve-conditional-config';

/** Stable key, so an over-nested config is recorded once and not once per cell. */
const MAX_DEPTH_KEY = 'conditionalConfig.maxDepth';

/**
 * The slice of the error store this reporter needs.
 *
 * Declared structurally on purpose: importing the store type would close a
 * dependency cycle (`state` → `api-resources.state` → `use-response-data` →
 * `features/table/utils` → here → `state`), which `npm run graph` fails on.
 */
interface ErrorRecorder {
    getErrorsByKey: (key: string) => ECSError[];
    addError: (
        error: Omit<ECSError, 'timestamp' | 'level'> & {
            level?: ErrorSeverity;
            timestamp?: string;
        }
    ) => void;
}

/**
 * Builds the `onMaxDepth` callback of `resolveConditionalConfig`.
 *
 * The depth cap silently truncates an over-nested `if`/`else` chain arriving from
 * the API response. That used to be a `console.warn`, which the production build
 * strips (`drop_console` in `vite.config.ts`) — so the one audience who could fix
 * the response never saw it.
 *
 * Severity is `warning`: this is a response-authoring mistake like any other
 * validation warning, and the non-blocking banner is the right amount of noise.
 * The key guard keeps it to a single entry no matter how many cells hit the cap.
 *
 * @param core - The core store, or `undefined` when the cell renders without one
 * @returns A callback safe to hand to `resolveConditionalConfig`
 */
export const createMaxDepthReporter = (
    core: { errorStore: ErrorRecorder } | undefined
): (() => void) => {
    return (): void => {
        const errorStore = core?.errorStore;
        if (!errorStore) return;
        if (errorStore.getErrorsByKey(MAX_DEPTH_KEY).length > 0) return;

        errorStore.addError({
            severity: 'warning',
            component: 'resolveConditionalConfig',
            action: 'resolve',
            type: 'validation',
            key: MAX_DEPTH_KEY,
            message: `Conditional config nesting exceeded the maximum depth of ${MAX_RECURSION_DEPTH}; the deeper branches were ignored.`,
        });
    };
};
