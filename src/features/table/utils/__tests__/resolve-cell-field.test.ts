import { describe, it, expect } from 'vitest';
import { resolveCellField } from '../resolve-cell-field';

describe('resolveCellField', () => {
    it('should return reference when set', () => {
        expect(resolveCellField({ key: 'name', field: 'user.name', reference: 'user.id' })).toBe(
            'user.id'
        );
    });

    it('should fall back to field when reference is absent', () => {
        expect(resolveCellField({ key: 'name', field: 'user.name' })).toBe('user.name');
    });

    it('should fall back to key when reference and field are absent', () => {
        expect(resolveCellField({ key: 'status' })).toBe('status');
    });

    it('should ignore null reference and use field', () => {
        expect(resolveCellField({ key: 'name', field: 'user.name', reference: null })).toBe(
            'user.name'
        );
    });

    it('should ignore empty-string reference and use field', () => {
        expect(resolveCellField({ key: 'name', field: 'user.name', reference: '' })).toBe(
            'user.name'
        );
    });

    it('should prefer reference over both field and key', () => {
        expect(resolveCellField({ key: 'k', field: 'f', reference: 'r' })).toBe('r');
    });
});
