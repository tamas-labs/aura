/**
 * Validates whether the value is of array type
 * @param value - The value to validate
 * @returns true if the value is an array, false otherwise
 */
export const arrayRule = (value: unknown): boolean => {
    return Array.isArray(value);
};
