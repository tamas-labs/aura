/**
 * Validates whether the value is a primitive type or a plain object
 * Accepts: string, number, boolean, array, plain object
 * Does not accept: null, undefined, function, symbol, class instance
 * @param value - The value to validate
 * @returns true if the value is of an acceptable type, false otherwise
 */
export const mixedRules = (value: unknown): boolean => {
    if (value === null || value === undefined) {
        return false;
    }

    const type = typeof value;

    // Primitive types
    if (type === 'string' || type === 'number' || type === 'boolean') {
        return true;
    }

    // Array
    if (Array.isArray(value)) {
        return true;
    }

    // Plain object (not null, not array, not function, not a class instance)
    return type === 'object' && value.constructor === Object;
};
