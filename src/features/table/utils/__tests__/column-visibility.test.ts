import { describe, it, expect } from 'vitest';
import { isCellVisible, filterVisibleCells } from '../column-visibility';

describe('isCellVisible', () => {
    it('should return true when show is absent', () => {
        expect(isCellVisible({})).toBe(true);
    });

    it('should return true when show is true', () => {
        expect(isCellVisible({ show: true })).toBe(true);
    });

    it('should return true when show is null', () => {
        expect(isCellVisible({ show: null })).toBe(true);
    });

    it('should return false only when show is explicitly false', () => {
        expect(isCellVisible({ show: false })).toBe(false);
    });

    it('should return false when the key is on the hidden list', () => {
        expect(isCellVisible({ key: 'email' }, ['email'])).toBe(false);
    });

    it('should return true when the hidden list names other columns', () => {
        expect(isCellVisible({ key: 'email' }, ['name', 'createdAt'])).toBe(true);
    });

    it('should ignore an empty hidden list', () => {
        expect(isCellVisible({ key: 'email' }, [])).toBe(true);
    });

    it('should keep a keyless cell visible whatever is hidden', () => {
        expect(isCellVisible({}, ['email'])).toBe(true);
    });

    it('should keep show:false hidden even when the list is empty', () => {
        expect(isCellVisible({ key: 'email', show: false }, [])).toBe(false);
    });
});

describe('filterVisibleCells', () => {
    it('should keep cells without show and drop show:false', () => {
        const cells = [
            { key: 'a' },
            { key: 'b', show: false },
            { key: 'c', show: true },
            { key: 'd', show: null },
        ];
        expect(filterVisibleCells(cells).map(c => c.key)).toEqual(['a', 'c', 'd']);
    });

    it('should preserve original order', () => {
        const cells = [{ key: '1', show: true }, { key: '2', show: false }, { key: '3' }];
        expect(filterVisibleCells(cells).map(c => c.key)).toEqual(['1', '3']);
    });

    it('should drop the columns on the hidden list', () => {
        const cells = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
        expect(filterVisibleCells(cells, ['b']).map(c => c.key)).toEqual(['a', 'c']);
    });

    it('should combine show:false with the hidden list', () => {
        const cells = [{ key: 'a' }, { key: 'b', show: false }, { key: 'c' }];
        expect(filterVisibleCells(cells, ['c']).map(c => c.key)).toEqual(['a']);
    });

    it('should not pass the array index as the hidden list', () => {
        // `cells.filter(isCellVisible)` would hand the index in as `hiddenKeys`.
        const cells = [{ key: 'a' }, { key: 'b' }, { key: 'c' }];
        expect(filterVisibleCells(cells)).toHaveLength(3);
    });

    it('should return empty array for all-hidden input', () => {
        expect(filterVisibleCells([{ show: false }, { show: false }])).toEqual([]);
    });

    it('should return a new array (not mutate input)', () => {
        const cells = [{ key: 'a', show: true }];
        expect(filterVisibleCells(cells)).not.toBe(cells);
    });
});
