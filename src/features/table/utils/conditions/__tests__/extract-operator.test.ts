import { describe, it, expect } from 'vitest';
import { extractOperator } from '../extract-operator';

describe('extractOperator', () => {
    describe('valid operators', () => {
        it('should extract eq operator', () => {
            const result = extractOperator({ eq: 'active', variant: 'success' });
            expect(result).toEqual({ operator: 'eq', value: 'active' });
        });

        it('should extract gt operator', () => {
            const result = extractOperator({ gt: 10, class: 'text-success' });
            expect(result).toEqual({ operator: 'gt', value: 10 });
        });

        it('should extract between operator', () => {
            const result = extractOperator({ between: [10, 20] });
            expect(result).toEqual({ operator: 'between', value: [10, 20] });
        });

        it('should extract boolean operators', () => {
            expect(extractOperator({ empty: true })).toEqual({ operator: 'empty', value: true });
            expect(extractOperator({ notNull: true })).toEqual({
                operator: 'notNull',
                value: true,
            });
        });

        it('should extract string operators', () => {
            expect(extractOperator({ contains: 'admin' })).toEqual({
                operator: 'contains',
                value: 'admin',
            });
            expect(extractOperator({ startsWith: 'user_' })).toEqual({
                operator: 'startsWith',
                value: 'user_',
            });
        });
    });

    describe('no operator found', () => {
        it('should return null when no operator present', () => {
            const result = extractOperator({ value: 'hello', class: 'text-primary' });
            expect(result).toBeNull();
        });

        it('should return null for empty object', () => {
            const result = extractOperator({});
            expect(result).toBeNull();
        });
    });

    describe('multiple operators', () => {
        it('should return the first operator found', () => {
            const result = extractOperator({ eq: 'active', gt: 5, variant: 'success' });
            expect(result).not.toBeNull();
            expect(['eq', 'gt']).toContain(result!.operator);
        });
    });

    describe('operator aliases', () => {
        it('should recognize ne and neq', () => {
            expect(extractOperator({ ne: 'test' })).toEqual({ operator: 'ne', value: 'test' });
            expect(extractOperator({ neq: 'test' })).toEqual({ operator: 'neq', value: 'test' });
        });

        it('should recognize bigger alias for gt', () => {
            expect(extractOperator({ bigger: 10 })).toEqual({ operator: 'bigger', value: 10 });
        });

        it('should recognize smaller alias for lt', () => {
            expect(extractOperator({ smaller: 5 })).toEqual({ operator: 'smaller', value: 5 });
        });
    });
});
