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

    it('should return empty array for all-hidden input', () => {
        expect(filterVisibleCells([{ show: false }, { show: false }])).toEqual([]);
    });

    it('should return a new array (not mutate input)', () => {
        const cells = [{ key: 'a', show: true }];
        expect(filterVisibleCells(cells)).not.toBe(cells);
    });
});
