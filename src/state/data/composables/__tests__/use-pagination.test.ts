import { describe, it, expect } from 'vitest';
import { usePagination } from '../use-pagination';

describe('usePagination', () => {
    describe('initial state', () => {
        it('should start on the first page with the given limit', () => {
            const { page, limit } = usePagination(25);

            expect(page.value).toBe(1);
            expect(limit.value).toBe(25);
        });

        it('should keep two instances independent', () => {
            const first = usePagination(10);
            const second = usePagination(50);

            first.setPage(4);

            expect(second.page.value).toBe(1);
            expect(second.limit.value).toBe(50);
        });
    });

    describe('setPage', () => {
        it('should set the current page', () => {
            const { page, setPage } = usePagination(10);

            setPage(3);

            expect(page.value).toBe(3);
        });

        it('should not change the limit', () => {
            const { limit, setPage } = usePagination(10);

            setPage(3);

            expect(limit.value).toBe(10);
        });

        // The slice deliberately does not clamp: it has no access to the item count,
        // so the upper bound is enforced by the Pagination component.
        it('should accept an out-of-range page unchanged', () => {
            const { page, setPage } = usePagination(10);

            setPage(9999);

            expect(page.value).toBe(9999);
        });
    });

    describe('setLimit', () => {
        it('should reset the page — a page-size change invalidates the offset', () => {
            const { page, limit, setPage, setLimit } = usePagination(10);

            setPage(7);
            setLimit(50);

            expect(limit.value).toBe(50);
            expect(page.value).toBe(1);
        });

        it('should reset the page even when the limit is unchanged', () => {
            const { page, setPage, setLimit } = usePagination(10);

            setPage(7);
            setLimit(10);

            expect(page.value).toBe(1);
        });
    });
});
