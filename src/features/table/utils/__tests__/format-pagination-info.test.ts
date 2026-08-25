import { describe, it, expect } from 'vitest';
import { formatPaginationInfo } from '../format-pagination-info';
import { DEFAULT_LABELS } from '../../../../lib/default-values.lib';

describe('formatPaginationInfo', () => {
    it('should substitute every token of the default template', () => {
        expect(formatPaginationInfo(DEFAULT_LABELS.paginationInfo, 1, 10, 100)).toBe(
            'Showing 1-10 of 100'
        );
    });

    it('should work with a reordered custom template', () => {
        expect(formatPaginationInfo('{total} of which {from}..{to}', 11, 20, 200)).toBe(
            '200 of which 11..20'
        );
    });

    it('should leave a template without tokens untouched', () => {
        expect(formatPaginationInfo('No tokens here', 1, 10, 100)).toBe('No tokens here');
    });

    it('should substitute only the first occurrence of each token', () => {
        expect(formatPaginationInfo('{from} {from}', 5, 10, 100)).toBe('5 {from}');
    });

    it('should handle zero values', () => {
        expect(formatPaginationInfo(DEFAULT_LABELS.paginationInfo, 0, 0, 0)).toBe(
            'Showing 0-0 of 0'
        );
    });
});
