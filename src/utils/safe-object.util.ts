/**
 * Prototype-safety primitives for objects built out of response data.
 *
 * The same three-name rule used to live as a private copy in `resolve-value.util.ts` and
 * in `renderCustomNode.ts`, while `create-config-validator.ts` — the file CLAUDE.md names
 * as the security boundary for response-supplied config — had no copy at all. A boundary
 * that depends on distant files each remembering the rule is not a boundary, so the rule
 * lives here once and every site imports it.
 *
 * Layer-neutral on purpose: `validators/`, `utils/` and `features/` all reach for it.
 */

/**
 * Property names that must never be written into — or read out of — an object built
 * from response data.
 *
 * `JSON.parse('{"__proto__":{}}')` mints a real *own* `__proto__` data property, so an
 * own-property check alone would still hand it back, and assigning it into an `{}`
 * literal invokes the `Object.prototype` setter instead of storing a value. `constructor`
 * and `prototype` reach the same machinery one step later. None of the three carries data
 * meaning in a table row, a column config or a mapping entry, so refusing them costs
 * nothing.
 */
export const FORBIDDEN_PROTO_KEYS: ReadonlySet<string> = new Set([
    '__proto__',
    'constructor',
    'prototype',
]);

/**
 * True when the key is one of the prototype-chain names that never carries data.
 *
 * @param key - The key to test (response-sourced)
 * @returns Whether the key must be refused
 */
export const isForbiddenProtoKey = (key: string): boolean => FORBIDDEN_PROTO_KEYS.has(key);

/**
 * True when `key` is a safe, **own** (not inherited) property of `record`.
 *
 * The guard for every dictionary lookup whose key comes from the response or from row
 * data: plain bracket access walks the prototype chain, so a value of `'toString'` finds
 * a function and a value of `'__proto__'` finds `Object.prototype` — both of which then
 * pass a `typeof x === 'object'`-style validity check or a truthiness check further down.
 *
 * @param record - The dictionary being looked up in
 * @param key - The lookup key (response- or data-sourced)
 * @returns Whether the lookup may proceed
 */
export const hasSafeOwnKey = (record: object, key: string): boolean =>
    !isForbiddenProtoKey(key) && Object.prototype.hasOwnProperty.call(record, key);

/**
 * A prototype-less dictionary — the accumulator to build response-keyed objects into.
 *
 * With an `{}` literal, `result[key] = value` for `key === '__proto__'` silently retargets
 * the object's prototype instead of adding an entry; with a null-prototype object it is an
 * ordinary own property. Combined with {@link isForbiddenProtoKey} filtering on the way in,
 * the result cannot carry inherited keys at all.
 *
 * @returns A fresh object with a `null` prototype
 */
export const createNullObject = <T = unknown>(): Record<string, T> =>
    Object.create(null) as Record<string, T>;

/**
 * Reads one entry from a dictionary whose key comes from the response or from row data.
 *
 * The read counterpart of {@link createNullObject}: plain bracket access walks the prototype
 * chain, so `registry['constructor']` hands back a function and `registry['__proto__']` an
 * object — both of which then survive the caller's truthiness or `typeof` check and are used
 * as if they were real registry entries. Routing the read through here makes an inherited
 * name behave exactly like an absent one.
 *
 * @param record - The dictionary being looked up in (may be absent)
 * @param key - The lookup key (response- or data-sourced, may be absent)
 * @returns The own entry for `key`, or `undefined` when it is missing, inherited or forbidden
 */
export const readOwnEntry = <T>(
    record: Record<string, T> | null | undefined,
    key: string | null | undefined
): T | undefined => {
    if (!record || !key || !hasSafeOwnKey(record, key)) return undefined;
    return record[key];
};
