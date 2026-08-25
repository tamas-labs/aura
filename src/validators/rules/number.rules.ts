/**
 * Validates whether the value is of number type and a valid number
 * @param value - The value to validate
 * @returns true if the value is a valid number, false otherwise
 */
export const numberRule = (value: unknown): boolean => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
};
