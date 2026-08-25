import { resolveDateValue } from './resolve-date-value';
import { readOwnEntry } from '../../../../utils';

type NumericCompare = (a: number, b: number) => boolean;

const NUMERIC_OPS: Record<string, NumericCompare> = {
    gt: (a, b) => a > b,
    bigger: (a, b) => a > b,
    gte: (a, b) => a >= b,
    biggerOrEqual: (a, b) => a >= b,
    lt: (a, b) => a < b,
    smaller: (a, b) => a < b,
    lte: (a, b) => a <= b,
    smallerOrEqual: (a, b) => a <= b,
};

const STRING_OPS = new Set(['contains', 'startsWith', 'endsWith', 'regex']);
const SPECIAL_OPS = new Set(['null', 'notNull', 'empty', 'notEmpty', 'true', 'false']);

function isEmpty(val: unknown): boolean {
    return val === null || val === undefined || val === '' || val === 0 || val === false;
}

function evaluateDateOrNumber(
    fieldValue: unknown,
    operatorValue: unknown,
    compare: NumericCompare
): boolean {
    const fd = resolveDateValue(fieldValue as string);
    const od = resolveDateValue(operatorValue as string);
    if (fd && od) return compare(fd.getTime(), od.getTime());
    return (
        typeof fieldValue === 'number' &&
        typeof operatorValue === 'number' &&
        compare(fieldValue, operatorValue)
    );
}

function evaluateBetween(fieldValue: unknown, operatorValue: unknown): boolean {
    if (!Array.isArray(operatorValue) || operatorValue.length !== 2) return false;
    const [min, max] = operatorValue;
    const fd = resolveDateValue(fieldValue as string);
    const minD = resolveDateValue(min as string);
    const maxD = resolveDateValue(max as string);
    if (fd && minD && maxD) {
        const ft = fd.getTime();
        return ft >= minD.getTime() && ft <= maxD.getTime();
    }
    return (
        typeof fieldValue === 'number' &&
        typeof min === 'number' &&
        typeof max === 'number' &&
        fieldValue >= min &&
        fieldValue <= max
    );
}

function evaluateStringOp(fieldValue: unknown, operator: string, operatorValue: unknown): boolean {
    if (typeof fieldValue !== 'string' || typeof operatorValue !== 'string') return false;
    if (operator === 'contains') return fieldValue.includes(operatorValue);
    if (operator === 'startsWith') return fieldValue.startsWith(operatorValue);
    if (operator === 'endsWith') return fieldValue.endsWith(operatorValue);
    try {
        return new RegExp(operatorValue).test(fieldValue);
    } catch {
        return false;
    }
}

function evaluateSpecialOp(fieldValue: unknown, operator: string, operatorValue: unknown): boolean {
    const flag = !!operatorValue;
    if (operator === 'null') return flag && fieldValue === null;
    if (operator === 'notNull') return flag && fieldValue !== null;
    if (operator === 'empty') return flag && isEmpty(fieldValue);
    if (operator === 'notEmpty') return flag && !isEmpty(fieldValue);
    if (operator === 'true') return flag && fieldValue === true;
    return flag && fieldValue === false;
}

/**
 * Evaluates a comparison operator with a field value and the comparison value.
 *
 * @param fieldValue The current value in the dataset
 * @param operator The operator string (e.g. 'eq', 'gt', 'between', etc.)
 * @param operatorValue The value to compare against
 * @returns Boolean indicating if the condition is met
 */
export function evaluateCondition(
    fieldValue: unknown,
    operator: string,
    operatorValue: unknown
): boolean {
    if (operator === 'eq') return fieldValue === operatorValue;
    if (operator === 'ne' || operator === 'neq') return fieldValue !== operatorValue;
    if (operator === 'in')
        return Array.isArray(operatorValue) && operatorValue.includes(fieldValue);
    if (operator === 'notIn')
        return Array.isArray(operatorValue) && !operatorValue.includes(fieldValue);
    if (operator === 'between') return evaluateBetween(fieldValue, operatorValue);

    // Own-key lookup: the operator name comes from the response's condition config, and a
    // plain bracket read would answer `constructor` with the `Object` function — which then
    // "compares" any two values truthily, so the condition would always match.
    const numericOp = readOwnEntry(NUMERIC_OPS, operator);
    if (numericOp) return evaluateDateOrNumber(fieldValue, operatorValue, numericOp);

    if (STRING_OPS.has(operator)) return evaluateStringOp(fieldValue, operator, operatorValue);
    if (SPECIAL_OPS.has(operator)) return evaluateSpecialOp(fieldValue, operator, operatorValue);

    return false;
}
