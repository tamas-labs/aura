import { describe, it, expect } from 'vitest';
import { evaluateCondition } from '../evaluate-condition';

describe('evaluateCondition', () => {
    describe('equality operators', () => {
        it('should evaluate eq with strings', () => {
            expect(evaluateCondition('active', 'eq', 'active')).toBe(true);
            expect(evaluateCondition('active', 'eq', 'inactive')).toBe(false);
        });

        it('should evaluate eq with numbers', () => {
            expect(evaluateCondition(10, 'eq', 10)).toBe(true);
            expect(evaluateCondition(10, 'eq', 5)).toBe(false);
        });

        it('should evaluate ne/neq', () => {
            expect(evaluateCondition('active', 'ne', 'inactive')).toBe(true);
            expect(evaluateCondition('active', 'neq', 'inactive')).toBe(true);
            expect(evaluateCondition('active', 'ne', 'active')).toBe(false);
        });
    });

    describe('comparison operators - numbers', () => {
        it('should evaluate gt/bigger', () => {
            expect(evaluateCondition(10, 'gt', 5)).toBe(true);
            expect(evaluateCondition(10, 'bigger', 5)).toBe(true);
            expect(evaluateCondition(5, 'gt', 10)).toBe(false);
        });

        it('should evaluate gte/biggerOrEqual', () => {
            expect(evaluateCondition(10, 'gte', 10)).toBe(true);
            expect(evaluateCondition(10, 'biggerOrEqual', 5)).toBe(true);
            expect(evaluateCondition(5, 'gte', 10)).toBe(false);
        });

        it('should evaluate lt/smaller', () => {
            expect(evaluateCondition(5, 'lt', 10)).toBe(true);
            expect(evaluateCondition(5, 'smaller', 10)).toBe(true);
            expect(evaluateCondition(10, 'lt', 5)).toBe(false);
        });

        it('should evaluate lte/smallerOrEqual', () => {
            expect(evaluateCondition(10, 'lte', 10)).toBe(true);
            expect(evaluateCondition(5, 'smallerOrEqual', 10)).toBe(true);
            expect(evaluateCondition(10, 'lte', 5)).toBe(false);
        });
    });

    describe('comparison operators - dates', () => {
        it('should evaluate lt with date strings', () => {
            const past = '2020-01-01';
            const future = '2025-01-01';
            expect(evaluateCondition(past, 'lt', future)).toBe(true);
            expect(evaluateCondition(future, 'lt', past)).toBe(false);
        });

        it('should evaluate gt with special date values', () => {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            expect(evaluateCondition(yesterday.toISOString(), 'lt', 'now')).toBe(true);
        });

        it('should handle today comparison', () => {
            const todayStr = new Date().toISOString().split('T')[0];
            expect(evaluateCondition(todayStr, 'gte', 'today')).toBe(true);
        });
    });

    describe('range operators', () => {
        it('should evaluate between with numbers', () => {
            expect(evaluateCondition(15, 'between', [10, 20])).toBe(true);
            expect(evaluateCondition(10, 'between', [10, 20])).toBe(true);
            expect(evaluateCondition(20, 'between', [10, 20])).toBe(true);
            expect(evaluateCondition(5, 'between', [10, 20])).toBe(false);
        });

        it('should return false for invalid between value', () => {
            expect(evaluateCondition(15, 'between', [10])).toBe(false);
            expect(evaluateCondition(15, 'between', 'not-array')).toBe(false);
        });

        it('should evaluate in operator', () => {
            expect(evaluateCondition('active', 'in', ['active', 'pending'])).toBe(true);
            expect(evaluateCondition('deleted', 'in', ['active', 'pending'])).toBe(false);
        });

        it('should evaluate notIn operator', () => {
            expect(evaluateCondition('deleted', 'notIn', ['active', 'pending'])).toBe(true);
            expect(evaluateCondition('active', 'notIn', ['active', 'pending'])).toBe(false);
        });
    });

    describe('string operators', () => {
        it('should evaluate contains', () => {
            expect(evaluateCondition('hello world', 'contains', 'world')).toBe(true);
            expect(evaluateCondition('hello world', 'contains', 'foo')).toBe(false);
        });

        it('should evaluate startsWith', () => {
            expect(evaluateCondition('user_admin', 'startsWith', 'user_')).toBe(true);
            expect(evaluateCondition('admin_user', 'startsWith', 'user_')).toBe(false);
        });

        it('should evaluate endsWith', () => {
            expect(evaluateCondition('file.txt', 'endsWith', '.txt')).toBe(true);
            expect(evaluateCondition('file.pdf', 'endsWith', '.txt')).toBe(false);
        });

        it('should evaluate regex', () => {
            expect(evaluateCondition('ABC-123', 'regex', '^[A-Z]{3}-\\d+$')).toBe(true);
            expect(evaluateCondition('abc-123', 'regex', '^[A-Z]{3}-\\d+$')).toBe(false);
        });

        it('should return false for invalid regex', () => {
            expect(evaluateCondition('test', 'regex', '[invalid')).toBe(false);
        });
    });

    describe('special value operators', () => {
        it('should evaluate null', () => {
            expect(evaluateCondition(null, 'null', true)).toBe(true);
            expect(evaluateCondition('value', 'null', true)).toBe(false);
            expect(evaluateCondition(null, 'null', false)).toBe(false);
        });

        it('should evaluate notNull', () => {
            expect(evaluateCondition('value', 'notNull', true)).toBe(true);
            expect(evaluateCondition(null, 'notNull', true)).toBe(false);
        });

        it('should evaluate empty', () => {
            expect(evaluateCondition(null, 'empty', true)).toBe(true);
            expect(evaluateCondition(undefined, 'empty', true)).toBe(true);
            expect(evaluateCondition('', 'empty', true)).toBe(true);
            expect(evaluateCondition(0, 'empty', true)).toBe(true);
            expect(evaluateCondition(false, 'empty', true)).toBe(true);
            expect(evaluateCondition('value', 'empty', true)).toBe(false);
        });

        it('should evaluate notEmpty', () => {
            expect(evaluateCondition('value', 'notEmpty', true)).toBe(true);
            expect(evaluateCondition(1, 'notEmpty', true)).toBe(true);
            expect(evaluateCondition(null, 'notEmpty', true)).toBe(false);
            expect(evaluateCondition('', 'notEmpty', true)).toBe(false);
        });

        it('should evaluate true', () => {
            expect(evaluateCondition(true, 'true', true)).toBe(true);
            expect(evaluateCondition(false, 'true', true)).toBe(false);
            expect(evaluateCondition('true', 'true', true)).toBe(false);
        });

        it('should evaluate false', () => {
            expect(evaluateCondition(false, 'false', true)).toBe(true);
            expect(evaluateCondition(true, 'false', true)).toBe(false);
        });
    });

    describe('edge cases', () => {
        it('should return false for undefined field value with string operators', () => {
            expect(evaluateCondition(undefined, 'contains', 'test')).toBe(false);
            expect(evaluateCondition(undefined, 'startsWith', 'test')).toBe(false);
        });

        it('should handle type mismatch gracefully', () => {
            expect(evaluateCondition('string', 'gt', 10)).toBe(false);
            expect(evaluateCondition(10, 'contains', 'test')).toBe(false);
        });

        it('should return false for unknown operators', () => {
            expect(evaluateCondition('value', 'unknownOp', 'test')).toBe(false);
        });

        it('should handle empty string with contains', () => {
            expect(evaluateCondition('', 'contains', '')).toBe(true);
            expect(evaluateCondition('test', 'contains', '')).toBe(true);
        });
    });

    describe('date edge cases', () => {
        it('should handle between with date strings', () => {
            const result = evaluateCondition('2024-06-15', 'between', ['2024-01-01', '2024-12-31']);
            expect(result).toBe(true);
        });

        it('should return false for non-date strings in date operations', () => {
            expect(evaluateCondition('not-a-date', 'gt', 'now')).toBe(false);
        });
    });
    describe('prototype-chain operator names', () => {
        // Regression guard: the operator name is a key of the response's condition object,
        // and the numeric-operator table was read with plain bracket access — so
        // `NUMERIC_OPS['constructor']` returned `Object`, which "compares" any two values
        // to a truthy object and made the condition match unconditionally.
        it.each(['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__'])(
            'should return false for the inherited operator "%s"',
            operator => {
                expect(evaluateCondition(5, operator, 10)).toBe(false);
                expect(evaluateCondition('anything', operator, 'other')).toBe(false);
            }
        );
    });
});
