import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { PaginationInfo } from '../PaginationInfo';

describe('PaginationInfo', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('rendering', () => {
        it('should render with proper test id', () => {
            const wrapper = mount(PaginationInfo, {
                props: {
                    from: 1,
                    to: 10,
                    total: 100,
                },
            });

            expect(wrapper.find('[data-testid="aura-pagination-info"]').exists()).toBe(true);
        });

        it('should display correct format "Showing X-Y of Z"', () => {
            const wrapper = mount(PaginationInfo, {
                props: {
                    from: 1,
                    to: 10,
                    total: 100,
                },
            });

            expect(wrapper.text()).toBe('Showing 1-10 of 100');
        });

        it('should have text-muted and small classes', () => {
            const wrapper = mount(PaginationInfo, {
                props: {
                    from: 1,
                    to: 10,
                    total: 100,
                },
            });

            const element = wrapper.find('[data-testid="aura-pagination-info"]');
            expect(element.classes()).toContain('text-muted');
            expect(element.classes()).toContain('small');
        });
    });

    describe('different pagination states', () => {
        it('should show "No results" when total is 0', () => {
            const wrapper = mount(PaginationInfo, {
                props: {
                    from: null as unknown as number | null,
                    to: null as unknown as number | null,
                    total: 0,
                },
            });

            expect(wrapper.text()).toBe('No results');
        });

        it('should show "No results" when from is null', () => {
            const wrapper = mount(PaginationInfo, {
                props: {
                    from: null as unknown as number | null,
                    to: 10,
                    total: 100,
                },
            });

            expect(wrapper.text()).toBe('No results');
        });

        it('should show "No results" when to is null', () => {
            const wrapper = mount(PaginationInfo, {
                props: {
                    from: 1,
                    to: null as unknown as number | null,
                    total: 100,
                },
            });

            expect(wrapper.text()).toBe('No results');
        });

        it('should display first page correctly', () => {
            const wrapper = mount(PaginationInfo, {
                props: {
                    from: 1,
                    to: 10,
                    total: 100,
                },
            });

            expect(wrapper.text()).toBe('Showing 1-10 of 100');
        });

        it('should display middle page correctly', () => {
            const wrapper = mount(PaginationInfo, {
                props: {
                    from: 11,
                    to: 20,
                    total: 100,
                },
            });

            expect(wrapper.text()).toBe('Showing 11-20 of 100');
        });

        it('should display last page with partial items', () => {
            const wrapper = mount(PaginationInfo, {
                props: {
                    from: 91,
                    to: 95,
                    total: 95,
                },
            });

            expect(wrapper.text()).toBe('Showing 91-95 of 95');
        });

        it('should display single page correctly', () => {
            const wrapper = mount(PaginationInfo, {
                props: {
                    from: 1,
                    to: 5,
                    total: 5,
                },
            });

            expect(wrapper.text()).toBe('Showing 1-5 of 5');
        });
    });

    describe('edge cases', () => {
        it('should handle single item', () => {
            const wrapper = mount(PaginationInfo, {
                props: {
                    from: 1,
                    to: 1,
                    total: 1,
                },
            });

            expect(wrapper.text()).toBe('Showing 1-1 of 1');
        });

        it('should handle large numbers', () => {
            const wrapper = mount(PaginationInfo, {
                props: {
                    from: 9991,
                    to: 10000,
                    total: 10000,
                },
            });

            expect(wrapper.text()).toBe('Showing 9991-10000 of 10000');
        });
    });
});
