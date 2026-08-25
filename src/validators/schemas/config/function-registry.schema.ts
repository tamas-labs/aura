import { getErrorSink } from '../../utils/error-sink';
import { createNullObject, isForbiddenProtoKey } from '../../../utils/safe-object.util';

/** Component name reported with every finding of this validator. */
const COMPONENT_NAME = 'FunctionRegistryValidator';

/**
 * Records one non-blocking finding of this validator.
 *
 * Three call sites share the shape (severity, component, action, type), so the ECS
 * fields live here once rather than being repeated per branch.
 *
 * @param errorStoreId - The error handler store identifier
 * @param registryName - The registry name (`'renderers'` or `'callbacks'`)
 * @param message - The human-readable summary
 * @param details - The longer explanation
 * @param metadata - Extra machine-readable context
 */
function reportRegistryWarning(
    errorStoreId: string,
    registryName: string,
    message: string,
    details: string,
    metadata: Record<string, unknown>
): void {
    getErrorSink(errorStoreId).addError({
        severity: 'warning',
        component: COMPONENT_NAME,
        action: 'validate',
        type: 'validation',
        message,
        details,
        key: registryName,
        metadata,
    });
}

/**
 * Function-registry validator for the `custom` column type's `renderers` /
 * `callbacks` config maps.
 *
 * These config fields contain **functions** that can only be supplied by the host
 * (`app.use`/props) — they don't come from the API response, so they cannot be
 * zod-validated like other config values. The validator does the following:
 * - for `null`/`undefined`/non-object input it returns the empty registry,
 * - it **drops non-function entries with a warning** (not an error: the table keeps
 *   rendering, and the given `custom` column just falls back to the default text),
 * - it **drops entries named after a prototype member** (`__proto__`, `constructor`,
 *   `prototype`) with a warning, and collects the survivors into a prototype-less
 *   object. The lookup that consumes this registry uses a response-supplied name
 *   (`config.renderer`), so a registry that can answer such a name with an inherited
 *   member would call `Object` instead of falling through to the next rendering mode.
 *
 * @param value - The registry to validate (host-side `Record<string, Function>`)
 * @param errorStoreId - The error handler store identifier
 * @param registryName - The registry name for the error message (`'renderers'` or `'callbacks'`)
 * @returns The filtered registry containing only function values
 */
export function validateFunctionRegistry<T>(
    value: unknown,
    errorStoreId: string,
    registryName: string
): Record<string, T> {
    if (value === null || value === undefined) {
        return createNullObject<T>();
    }

    if (typeof value !== 'object' || Array.isArray(value)) {
        reportRegistryWarning(
            errorStoreId,
            registryName,
            `Invalid "${registryName}" config: expected an object of functions`,
            `Received ${Array.isArray(value) ? 'array' : typeof value}`,
            { receivedType: typeof value }
        );
        return createNullObject<T>();
    }

    const result = createNullObject<T>();
    const rejected: string[] = [];
    const reserved: string[] = [];

    Object.entries(value as Record<string, unknown>).forEach(([name, fn]) => {
        if (isForbiddenProtoKey(name)) {
            reserved.push(name);
        } else if (typeof fn === 'function') {
            result[name] = fn as T;
        } else {
            rejected.push(name);
        }
    });

    if (rejected.length > 0) {
        reportRegistryWarning(
            errorStoreId,
            registryName,
            `Ignored non-function entries in "${registryName}" config`,
            `Non-function keys dropped: ${rejected.join(', ')}`,
            { rejectedKeys: rejected }
        );
    }

    if (reserved.length > 0) {
        reportRegistryWarning(
            errorStoreId,
            registryName,
            `Ignored reserved entry names in "${registryName}" config`,
            `Prototype member names cannot be used as function names: ${reserved.join(', ')}`,
            { reservedKeys: reserved }
        );
    }

    return result;
}
