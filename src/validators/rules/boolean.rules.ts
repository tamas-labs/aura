/**
 * Validates whether the value is of boolean type
 * @param value - The value to validate
 * @returns true if the value is a boolean, false otherwise
 */
export const booleanRule = (value: unknown): boolean => {
    return typeof value === 'boolean';
};
