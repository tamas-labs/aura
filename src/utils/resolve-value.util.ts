import { hasSafeOwnKey } from './safe-object.util';

/**
 * Helper to resolve object property value by string path (simple or nested).
 * Handles "user.name" style paths.
 *
 * Only **own** properties resolve. The `path` originates from the API response (a
 * header cell's `field`/`data`), so a faulty or hostile backend controls it; the
 * `in` operator this used to rely on also walks the prototype chain, which let
 * `'toString'` or `'constructor'` leak a function body into a cell, a filter list
 * or a CSV export. Reading was always the only operation here, so this was never a
 * prototype-pollution hole — but the contract is now "resolve an own property by
 * path", enforced rather than merely intended.
 *
 * @param item - The object to resolve value from
 * @param path - The path property string
 * @returns The resolved value or undefined
 *
 * @example
 * ```typescript
 * const user = { name: 'John', address: { city: 'New York' }, roles: ['admin'] };
 * resolveValue(user, 'name'); // 'John'
 * resolveValue(user, 'address.city'); // 'New York'
 * resolveValue(user, 'roles.0'); // 'admin'
 * resolveValue(user, 'age'); // undefined
 * resolveValue(user, 'toString'); // undefined (inherited)
 * ```
 */
export const resolveValue = (item: unknown, path: string): unknown => {
    if (item === null || typeof item !== 'object') {
        return undefined;
    }

    // Safe cast for direct access check
    const record = item as Record<string, unknown>;

    // Handle direct property access
    if (hasSafeOwnKey(record, path)) {
        return record[path];
    }

    // Handle nested paths (e.g., "user.name")
    if (path.includes('.')) {
        const keys = path.split('.');
        let current: unknown = item;

        for (const key of keys) {
            if (current === null || current === undefined || typeof current !== 'object') {
                return undefined;
            }
            const currentRecord = current as Record<string, unknown>;
            if (hasSafeOwnKey(currentRecord, key)) {
                current = currentRecord[key];
            } else {
                return undefined;
            }
        }
        return current;
    }

    return undefined;
};
