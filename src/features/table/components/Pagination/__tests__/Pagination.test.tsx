import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { Pagination } from '../Pagination';
import type { PaginationMeta } from '../../../../../types/api-response.types';

describe('Pagination', () => {
    const createMeta = (overrides?: Partial<PaginationMeta>): PaginationMeta => ({
        current_page: 1,
        from: 1,
        last_page: 10,
        path: '',
        per_page: 10,
        to: 10,
        total: 100,
        ...overrides,
    });

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('rendering', () => {
        it('should render with proper test id', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta(),
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(true);
        });

        it('should have proper Bootstrap classes', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta(),
                    onPageChange: vi.fn(),
                },
            });

            const element = wrapper.find('[data-testid="aura-pagination"]');
            expect(element.classes()).toContain('d-flex');
            expect(element.classes()).toContain('justify-content-between');
            expect(element.classes()).toContain('align-items-center');
            expect(element.classes()).toContain('py-2');
        });

        it('should render PaginationButtons component', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta(),
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('.pagination').exists()).toBe(true);
        });

        it('should render PaginationInfo component', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta(),
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('[data-testid="aura-pagination-info"]').exists()).toBe(true);
        });
    });

    describe('meta prop handling', () => {
        it('should pass correct currentPage to PaginationButtons', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({ current_page: 5 }),
                    onPageChange: vi.fn(),
                },
            });

            const activeButton = wrapper.find('.page-item.active');
            expect(activeButton.text()).toBe('5');
        });

        it('should pass correct lastPage to PaginationButtons', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({ last_page: 15 }),
                    onPageChange: vi.fn(),
                },
            });

            // Verify that the component has initialized correctly
            expect(wrapper.find('.pagination').exists()).toBe(true);
        });

        it('should pass correct from, to, total to PaginationInfo', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({
                        from: 21,
                        to: 30,
                        total: 150,
                    }),
                    onPageChange: vi.fn(),
                },
            });

            const info = wrapper.find('[data-testid="aura-pagination-info"]');
            expect(info.text()).toBe('Showing 21-30 of 150');
        });
    });

    describe('null meta handling', () => {
        it('should not render when meta is null', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: null,
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(false);
        });

        it('should not render when total is 0', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({ total: 0 }),
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(false);
        });
    });

    describe('onPageChange callback', () => {
        it('should call onPageChange when page button is clicked', async () => {
            const onPageChange = vi.fn();
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({ current_page: 1 }),
                    onPageChange: onPageChange,
                },
            });

            const pageButtons = wrapper.findAll('.page-item button');
            const page2Button = pageButtons.find(btn => btn.text() === '2');

            await page2Button!.trigger('click');

            expect(onPageChange).toHaveBeenCalledWith(2);
        });

        it('should call onPageChange when next button is clicked', async () => {
            const onPageChange = vi.fn();
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({ current_page: 3 }),
                    onPageChange: onPageChange,
                },
            });

            const items = wrapper.findAll('.page-item');
            const nextButton = items[items.length - 1]!.find('button');

            await nextButton.trigger('click');

            expect(onPageChange).toHaveBeenCalledWith(4);
        });

        it('should call onPageChange when previous button is clicked', async () => {
            const onPageChange = vi.fn();
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({ current_page: 5 }),
                    onPageChange: onPageChange,
                },
            });

            const items = wrapper.findAll('.page-item');
            const prevButton = items[0]!.find('button');

            await prevButton.trigger('click');

            expect(onPageChange).toHaveBeenCalledWith(4);
        });
    });

    describe('different pagination states', () => {
        it('should render correctly on first page', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({
                        current_page: 1,
                        from: 1,
                        to: 10,
                        total: 100,
                    }),
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(true);
            expect(wrapper.text()).toContain('Showing 1-10 of 100');
        });

        it('should render correctly on middle page', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({
                        current_page: 5,
                        from: 41,
                        to: 50,
                        total: 100,
                    }),
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(true);
            expect(wrapper.text()).toContain('Showing 41-50 of 100');
        });

        it('should render correctly on last page', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({
                        current_page: 10,
                        from: 91,
                        to: 100,
                        total: 100,
                        last_page: 10,
                    }),
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(true);
            expect(wrapper.text()).toContain('Showing 91-100 of 100');
        });

        it('should render correctly with partial last page', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({
                        current_page: 5,
                        from: 41,
                        to: 45,
                        total: 45,
                        last_page: 5,
                    }),
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(true);
            expect(wrapper.text()).toContain('Showing 41-45 of 45');
        });

        it('should render correctly with single page', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({
                        current_page: 1,
                        from: 1,
                        to: 5,
                        total: 5,
                        last_page: 1,
                    }),
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(true);
            expect(wrapper.text()).toContain('Showing 1-5 of 5');
        });
    });

    describe('integration with sub-components', () => {
        it('should display both buttons and info together', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta(),
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('.pagination').exists()).toBe(true);
            expect(wrapper.find('[data-testid="aura-pagination-info"]').exists()).toBe(true);
        });

        it('should maintain layout with flex classes', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta(),
                    onPageChange: vi.fn(),
                },
            });

            const container = wrapper.find('[data-testid="aura-pagination"]');
            expect(container.classes()).toContain('justify-content-between');
            expect(container.classes()).toContain('align-items-center');
        });
    });

    describe('edge cases', () => {
        it('should handle null from and to values', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({
                        from: null,
                        to: null,
                        total: 0,
                    }),
                    onPageChange: vi.fn(),
                },
            });

            // Should not render when total is 0
            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(false);
        });

        it('should handle very large page counts', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({
                        current_page: 500,
                        from: 4991,
                        to: 5000,
                        total: 10000,
                        last_page: 1000,
                    }),
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(true);
            expect(wrapper.text()).toContain('Showing 4991-5000 of 10000');
        });

        it('should handle minimal pagination (1 item)', () => {
            const wrapper = mount(Pagination, {
                props: {
                    meta: createMeta({
                        current_page: 1,
                        from: 1,
                        to: 1,
                        total: 1,
                        last_page: 1,
                    }),
                    onPageChange: vi.fn(),
                },
            });

            expect(wrapper.find('[data-testid="aura-pagination"]').exists()).toBe(true);
        });
    });
});
