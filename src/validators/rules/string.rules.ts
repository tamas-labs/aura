/**
 * Validates whether the value is of string type
 * @param value - The value to validate
 * @returns true if the value is a string, false otherwise
 */
export const stringRule = (value: unknown): boolean => {
    return typeof value === 'string';
};
