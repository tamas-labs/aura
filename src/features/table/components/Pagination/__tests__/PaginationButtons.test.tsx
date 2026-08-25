import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { PaginationButtons } from '../PaginationButtons';

describe('PaginationButtons', () => {
    const defaultProps = {
        currentPage: 1,
        lastPage: 10,
        onPageChange: vi.fn(),
    };

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    const getPageNumbers = (wrapper: VueWrapper<any>) => {
        return wrapper
            .findAll('.page-item:not(.disabled) .page-link')
            .map(btn => btn.text())
            .filter((text: string) => text !== '«' && text !== '»' && text !== '...');
    };

    const getEllipses = (wrapper: VueWrapper<any>) => {
        return wrapper
            .findAll('.page-item.disabled .page-link')
            .map(el => el.text())
            .filter((text: string) => text === '...');
    };

    describe('rendering', () => {
        it('should render pagination list', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, lastPage: 5 },
            });
            expect(wrapper.find('.pagination').exists()).toBe(true);
        });

        it('should render previous and next buttons', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, lastPage: 5 },
            });
            const items = wrapper.findAll('.page-item');
            expect(items[0]!.text()).toContain('«');
            expect(items[items.length - 1]!.text()).toContain('»');
        });
    });

    describe('page number display logic', () => {
        it('should show all pages when lastPage <= 7', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 1, lastPage: 7 },
            });
            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '2', '3', '4', '5', '6', '7']);
            expect(getEllipses(wrapper).length).toBe(0);
        });

        it('should show correct pages at start (page 1 of 10)', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 1, lastPage: 10 },
            });
            // Expected: [1] [2] [3] [4] [5] ... [10]
            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '2', '3', '4', '5', '10']);
            expect(getEllipses(wrapper).length).toBe(1);
        });

        it('should show correct pages at start (page 4 of 10)', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 4, lastPage: 10 },
            });
            // Expected: [1] [2] [3] [4] [5] [6] ... [10]
            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '2', '3', '4', '5', '6', '10']);
            expect(getEllipses(wrapper).length).toBe(1);
        });

        it('should show correct pages in middle (page 5 of 10)', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });
            // Expected: [1] ... [3] [4] [5] [6] [7] ... [10]
            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '3', '4', '5', '6', '7', '10']);
            expect(getEllipses(wrapper).length).toBe(2);
        });

        it('should show correct pages at end (page 7 of 10)', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 7, lastPage: 10 },
            });
            // Expected: [1] ... [5] [6] [7] [8] [9] [10]
            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '5', '6', '7', '8', '9', '10']);
            expect(getEllipses(wrapper).length).toBe(1);
        });

        it('should show correct pages at end (page 10 of 10)', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 10, lastPage: 10 },
            });
            // Expected: [1] ... [6] [7] [8] [9] [10]
            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '6', '7', '8', '9', '10']);
            expect(getEllipses(wrapper).length).toBe(1);
        });
    });

    describe('active state', () => {
        it('should mark current page as active (middle)', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });
            const activeItem = wrapper.find('.page-item.active');
            expect(activeItem.text()).toBe('5');
        });

        it('should mark First page as active', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 1, lastPage: 10 },
            });
            const activeItem = wrapper.find('.page-item.active');
            expect(activeItem.text()).toBe('1');
        });

        it('should mark Last page as active', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 10, lastPage: 10 },
            });
            const activeItem = wrapper.find('.page-item.active');
            expect(activeItem.text()).toBe('10');
        });
    });

    describe('interactions', () => {
        it('should emit onPageChange with 1 when First page clicked', async () => {
            const onPageChange = vi.fn();
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10, onPageChange },
            });

            // Find button with text '1'
            const buttons = wrapper.findAll('button.page-link');
            const btn1 = buttons.find(b => b.text() === '1');
            await btn1?.trigger('click');

            expect(onPageChange).toHaveBeenCalledWith(1);
        });

        it('should emit onPageChange with lastPage when Last page clicked', async () => {
            const onPageChange = vi.fn();
            const lastPage = 10;
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage, onPageChange },
            });

            // Find button with text '10'
            const buttons = wrapper.findAll('button.page-link');
            const btnLast = buttons.find(b => b.text() === String(lastPage));
            await btnLast?.trigger('click');

            expect(onPageChange).toHaveBeenCalledWith(lastPage);
        });

        it('should emit onPageChange on previous button click', async () => {
            const onPageChange = vi.fn();
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10, onPageChange },
            });

            const items = wrapper.findAll('.page-item');
            const prevButton = items[0]!.find('button');
            await prevButton.trigger('click');

            expect(onPageChange).toHaveBeenCalledWith(4);
        });

        it('should emit onPageChange on next button click', async () => {
            const onPageChange = vi.fn();
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10, onPageChange },
            });

            const items = wrapper.findAll('.page-item');
            const nextButton = items[items.length - 1]!.find('button');
            await nextButton.trigger('click');

            expect(onPageChange).toHaveBeenCalledWith(6);
        });

        it('should not emit onPageChange when clicking current page', async () => {
            const onPageChange = vi.fn();
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10, onPageChange },
            });

            const activeButton = wrapper.find('.page-item.active button');
            await activeButton.trigger('click');

            expect(onPageChange).not.toHaveBeenCalled();
        });

        it('should not emit onPageChange when clicking disabled previous', async () => {
            const onPageChange = vi.fn();
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 1, lastPage: 10, onPageChange },
            });

            const items = wrapper.findAll('.page-item');
            const prevButton = items[0]!.find('button');
            await prevButton.trigger('click');

            expect(onPageChange).not.toHaveBeenCalled();
        });

        it('should not emit onPageChange when clicking disabled next', async () => {
            const onPageChange = vi.fn();
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 10, lastPage: 10, onPageChange },
            });

            const items = wrapper.findAll('.page-item');
            const nextButton = items[items.length - 1]!.find('button');
            await nextButton.trigger('click');

            expect(onPageChange).not.toHaveBeenCalled();
        });
    });

    describe('disabled state', () => {
        it('should disable previous button on first page', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 1, lastPage: 10 },
            });

            const items = wrapper.findAll('.page-item');
            const prevButton = items[0]!;
            expect(prevButton.classes()).toContain('disabled');
            expect(prevButton.find('button').attributes('disabled')).toBeDefined();
        });

        it('should disable next button on last page', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 10, lastPage: 10 },
            });

            const items = wrapper.findAll('.page-item');
            const nextButton = items[items.length - 1]!;
            expect(nextButton.classes()).toContain('disabled');
            expect(nextButton.find('button').attributes('disabled')).toBeDefined();
        });

        it('should not disable previous button when not on first page', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });

            const items = wrapper.findAll('.page-item');
            const prevButton = items[0]!;
            expect(prevButton.classes()).not.toContain('disabled');
        });

        it('should not disable next button when not on last page', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });

            const items = wrapper.findAll('.page-item');
            const nextButton = items[items.length - 1]!;
            expect(nextButton.classes()).not.toContain('disabled');
        });
    });

    describe('edge cases', () => {
        it('should handle single page', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 1, lastPage: 1 },
            });

            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1']);
            expect(getEllipses(wrapper).length).toBe(0);
        });

        it('should handle two pages', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 1, lastPage: 2 },
            });

            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '2']);
            expect(getEllipses(wrapper).length).toBe(0);
        });

        it('should handle exactly 8 pages (first ellipsis threshold)', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 1, lastPage: 8 },
            });

            // Expected: [1] [2] [3] [4] [5] ... [8]
            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '2', '3', '4', '5', '8']);
            expect(getEllipses(wrapper).length).toBe(1);
        });

        it('should handle page 2 of 10', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 2, lastPage: 10 },
            });

            // Expected: [1] [2] [3] [4] [5] ... [10]
            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '2', '3', '4', '5', '10']);
            expect(getEllipses(wrapper).length).toBe(1);
        });

        it('should handle page 3 of 10', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 3, lastPage: 10 },
            });

            // Expected: [1] [2] [3] [4] [5] ... [10]
            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '2', '3', '4', '5', '10']);
            expect(getEllipses(wrapper).length).toBe(1);
        });

        it('should handle page 6 of 10', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 6, lastPage: 10 },
            });

            // Expected: [1] ... [4] [5] [6] [7] [8] ... [10]
            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '4', '5', '6', '7', '8', '10']);
            expect(getEllipses(wrapper).length).toBe(2);
        });

        it('should handle page 8 of 10', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 8, lastPage: 10 },
            });

            // Expected: [1] ... [6] [7] [8] [9] [10]
            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '6', '7', '8', '9', '10']);
            expect(getEllipses(wrapper).length).toBe(1);
        });

        it('should handle page 9 of 10', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 9, lastPage: 10 },
            });

            // Expected: [1] ... [6] [7] [8] [9] [10]
            const pages = getPageNumbers(wrapper);
            expect(pages).toEqual(['1', '6', '7', '8', '9', '10']);
            expect(getEllipses(wrapper).length).toBe(1);
        });

        it('should handle very large page numbers', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 500, lastPage: 1000 },
            });

            // Expected: [1] ... [498] [499] [500] [501] [502] ... [1000]
            const pages = getPageNumbers(wrapper);
            expect(pages).toContain('1');
            expect(pages).toContain('500');
            expect(pages).toContain('1000');
            expect(getEllipses(wrapper).length).toBe(2);
        });
    });

    describe('ellipsis display logic', () => {
        it('should not show ellipsis when all pages fit (7 pages)', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 4, lastPage: 7 },
            });

            expect(getEllipses(wrapper).length).toBe(0);
        });

        it('should show only end ellipsis at start', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 1, lastPage: 10 },
            });

            expect(getEllipses(wrapper).length).toBe(1);
        });

        it('should show both ellipses in middle', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });

            expect(getEllipses(wrapper).length).toBe(2);
        });

        it('should show only start ellipsis at end', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 10, lastPage: 10 },
            });

            expect(getEllipses(wrapper).length).toBe(1);
        });
    });

    describe('no duplicate pages', () => {
        it('should not duplicate first page when in range', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 1, lastPage: 10 },
            });

            const pages = getPageNumbers(wrapper);
            const firstPageCount = pages.filter((p: string) => p === '1').length;
            expect(firstPageCount).toBe(1);
        });

        it('should not duplicate last page when in range', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 10, lastPage: 10 },
            });

            const pages = getPageNumbers(wrapper);
            const lastPageCount = pages.filter((p: string) => p === '10').length;
            expect(lastPageCount).toBe(1);
        });

        it('should not duplicate any page numbers', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });

            const pages = getPageNumbers(wrapper);
            const uniquePages = new Set(pages);
            expect(pages.length).toBe(uniquePages.size);
        });
    });

    describe('page jump dropdown integration', () => {
        it('should have aria-haspopup on current page button', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });

            const activeButton = wrapper.find('.page-item.active button');
            expect(activeButton.attributes('aria-haspopup')).toBe('dialog');
        });

        it('should toggle dropdown when current page button is clicked', async () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });

            const activeButton = wrapper.find('.page-item.active button');

            // Initially closed
            expect(activeButton.attributes('aria-expanded')).toBe('false');

            // Click to open
            await activeButton.trigger('click');
            expect(activeButton.attributes('aria-expanded')).toBe('true');

            // Click again to close
            await activeButton.trigger('click');
            expect(activeButton.attributes('aria-expanded')).toBe('false');
        });

        it('should render PageJumpDropdown when current page is clicked', async () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });

            const activeButton = wrapper.find('.page-item.active button');
            await activeButton.trigger('click');

            // Check for dropdown dialog
            const dropdown = wrapper.find('[role="dialog"]');
            expect(dropdown.exists()).toBe(true);
        });

        it('should not show dropdown initially', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });

            const dropdown = wrapper.find('[role="dialog"]');
            expect(dropdown.exists()).toBe(false);
        });

        it('should call onPageChange when navigating from dropdown', async () => {
            const onPageChange = vi.fn();
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10, onPageChange },
            });

            // Open dropdown
            const activeButton = wrapper.find('.page-item.active button');
            await activeButton.trigger('click');

            // Find input and enter value
            const input = wrapper.find('input[type="number"]');
            await input.setValue('8');

            // Click jump button
            const jumpButton = wrapper.find('.dropdown-menu button');
            await jumpButton.trigger('click');

            expect(onPageChange).toHaveBeenCalledWith(8);
        });

        it('should close dropdown after navigation', async () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });

            // Open dropdown
            const activeButton = wrapper.find('.page-item.active button');
            await activeButton.trigger('click');

            // Navigate
            const input = wrapper.find('input[type="number"]');
            await input.setValue('8');
            const jumpButton = wrapper.find('.dropdown-menu button');
            await jumpButton.trigger('click');

            // Dropdown should be closed
            const dropdown = wrapper.find('[role="dialog"]');
            expect(dropdown.exists()).toBe(false);
        });

        it('should not affect non-current page buttons', async () => {
            const onPageChange = vi.fn();
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10, onPageChange },
            });

            // Click a non-current page button
            const buttons = wrapper.findAll('button.page-link');
            const page3Button = buttons.find(b => b.text() === '3');
            await page3Button?.trigger('click');

            expect(onPageChange).toHaveBeenCalledWith(3);
        });

        it('should have position-relative class on current page item', () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });

            const activeItem = wrapper.find('.page-item.active');
            expect(activeItem.classes()).toContain('position-relative');
        });

        it('should stop event propagation on current page button click', async () => {
            const wrapper = mount(PaginationButtons, {
                props: { ...defaultProps, currentPage: 5, lastPage: 10 },
            });

            const activeButton = wrapper.find('.page-item.active button');

            // Create a spy for stopPropagation
            let propagationStopped = false;
            const event = new MouseEvent('click', { bubbles: true });
            const stopPropagationSpy = vi.spyOn(event, 'stopPropagation').mockImplementation(() => {
                propagationStopped = true;
            });

            // Trigger the event
            await activeButton.element.dispatchEvent(event);

            expect(stopPropagationSpy).toHaveBeenCalled();
            expect(propagationStopped).toBe(true);
        });
    });
});
