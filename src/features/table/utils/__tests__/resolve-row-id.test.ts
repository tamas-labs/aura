import { describe, it, expect } from 'vitest';
import { resolveRowId, resolveRowIdField } from '../resolve-row-id';

describe('resolveRowIdField', () => {
    it('should use the cell field when present', () => {
        expect(resolveRowIdField({ field: 'uuid' })).toBe('uuid');
    });

    it('should default to "id" when field is absent', () => {
        expect(resolveRowIdField({})).toBe('id');
    });

    it('should default to "id" when field is empty string', () => {
        expect(resolveRowIdField({ field: '' })).toBe('id');
    });
});

describe('resolveRowId', () => {
    it('should resolve a numeric id', () => {
        expect(resolveRowId({ id: 5 }, 'id')).toBe(5);
    });

    it('should resolve a string id', () => {
        expect(resolveRowId({ id: 'abc' }, 'id')).toBe('abc');
    });

    it('should resolve a nested id via dotted path', () => {
        expect(resolveRowId({ user: { id: 9 } }, 'user.id')).toBe(9);
    });

    it('should return null for a missing field', () => {
        expect(resolveRowId({ name: 'x' }, 'id')).toBeNull();
    });

    it('should return null for a null value', () => {
        expect(resolveRowId({ id: null }, 'id')).toBeNull();
    });

    it('should return null for an object value (not a valid identifier)', () => {
        expect(resolveRowId({ id: { nested: 1 } }, 'id')).toBeNull();
    });

    it('should return null for a boolean value', () => {
        expect(resolveRowId({ id: true }, 'id')).toBeNull();
    });
});
