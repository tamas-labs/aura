import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { PageJumpDropdown } from '../PageJumpDropdown';

describe('PageJumpDropdown', () => {
    const defaultProps = {
        currentPage: 5,
        lastPage: 10,
        isOpen: true,
        onClose: vi.fn(),
        onNavigate: vi.fn(),
    };

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render when isOpen is true', () => {
            const wrapper = mount(PageJumpDropdown, {
                props: defaultProps,
            });

            expect(wrapper.find('input[type="number"]').exists()).toBe(true);
            expect(wrapper.find('button').exists()).toBe(true);
            expect(wrapper.find('button').text()).toBe('Go');
        });

        it('should not render when isOpen is false', () => {
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, isOpen: false },
            });

            expect(wrapper.html()).toBe('');
        });

        it('should render input with correct placeholder', () => {
            const wrapper = mount(PageJumpDropdown, {
                props: defaultProps,
            });

            const input = wrapper.find('input[type="number"]');
            expect(input.attributes('placeholder')).toBe('Page number...');
        });

        it('should have correct aria attributes', () => {
            const wrapper = mount(PageJumpDropdown, {
                props: defaultProps,
            });

            const dropdown = wrapper.find('[role="dialog"]');
            expect(dropdown.exists()).toBe(true);
            expect(dropdown.attributes('aria-modal')).toBe('true');
            expect(dropdown.attributes('aria-label')).toBe('Jump to page');

            const input = wrapper.find('input[type="number"]');
            expect(input.attributes('aria-label')).toBe('Enter page number');

            const button = wrapper.find('button');
            expect(button.attributes('aria-label')).toBe('Go to page');
        });
    });

    describe('input validation', () => {
        it('should disable button when input is empty', () => {
            const wrapper = mount(PageJumpDropdown, {
                props: defaultProps,
            });

            const button = wrapper.find('button');
            expect(button.attributes('disabled')).toBeDefined();
        });

        it('should enable button when valid page number is entered', async () => {
            const wrapper = mount(PageJumpDropdown, {
                props: defaultProps,
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue('7');
            await nextTick();

            const button = wrapper.find('button');
            expect(button.attributes('disabled')).toBeUndefined();
        });

        it('should disable button when page number is 0', async () => {
            const wrapper = mount(PageJumpDropdown, {
                props: defaultProps,
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue('0');
            await nextTick();

            const button = wrapper.find('button');
            expect(button.attributes('disabled')).toBeDefined();
        });

        it('should disable button when page number is negative', async () => {
            const wrapper = mount(PageJumpDropdown, {
                props: defaultProps,
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue('-5');
            await nextTick();

            const button = wrapper.find('button');
            expect(button.attributes('disabled')).toBeDefined();
        });

        it('should disable button when page number exceeds lastPage', async () => {
            const wrapper = mount(PageJumpDropdown, {
                props: defaultProps,
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue('15');
            await nextTick();

            const button = wrapper.find('button');
            expect(button.attributes('disabled')).toBeDefined();
        });

        it('should enable button for page 1', async () => {
            const wrapper = mount(PageJumpDropdown, {
                props: defaultProps,
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue('1');
            await nextTick();

            const button = wrapper.find('button');
            expect(button.attributes('disabled')).toBeUndefined();
        });

        it('should enable button for lastPage', async () => {
            const wrapper = mount(PageJumpDropdown, {
                props: defaultProps,
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue('10');
            await nextTick();

            const button = wrapper.find('button');
            expect(button.attributes('disabled')).toBeUndefined();
        });
    });

    describe('interactions', () => {
        it('should call onNavigate with correct page when button clicked', async () => {
            const onNavigate = vi.fn();
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, onNavigate },
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue('7');
            await nextTick();

            const button = wrapper.find('button');
            await button.trigger('click');

            expect(onNavigate).toHaveBeenCalledWith(7);
        });

        it('should call onClose after navigation', async () => {
            const onClose = vi.fn();
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, onClose },
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue('7');
            await nextTick();

            const button = wrapper.find('button');
            await button.trigger('click');

            expect(onClose).toHaveBeenCalled();
        });

        it('should not call onNavigate when button is disabled', async () => {
            const onNavigate = vi.fn();
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, onNavigate },
            });

            const button = wrapper.find('button');
            await button.trigger('click');

            expect(onNavigate).not.toHaveBeenCalled();
        });

        it('should call onClose when ESC key is pressed', async () => {
            const onClose = vi.fn();
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, onClose },
                attachTo: document.body,
            });

            await nextTick();
            const event = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(event);
            await nextTick();

            expect(onClose).toHaveBeenCalled();
            wrapper.unmount();
        });

        it('should call onNavigate and onClose when Enter key is pressed with valid input', async () => {
            const onNavigate = vi.fn();
            const onClose = vi.fn();
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, onNavigate, onClose },
                attachTo: document.body,
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue('7');
            await nextTick();

            const event = new KeyboardEvent('keydown', { key: 'Enter' });
            document.dispatchEvent(event);
            await nextTick();

            expect(onNavigate).toHaveBeenCalledWith(7);
            expect(onClose).toHaveBeenCalled();
            wrapper.unmount();
        });

        it('should call onClose when clicking outside dropdown', async () => {
            const onClose = vi.fn();
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, onClose },
                attachTo: document.body,
            });

            await nextTick();
            document.body.click();
            await nextTick();

            expect(onClose).toHaveBeenCalled();
            wrapper.unmount();
        });

        it('should not call onClose when clicking inside dropdown', async () => {
            const onClose = vi.fn();
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, onClose },
            });

            const dropdown = wrapper.find('[role="dialog"]');
            await dropdown.trigger('click');

            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('focus management', () => {
        it('should focus input when dropdown opens', async () => {
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, isOpen: false },
                attachTo: document.body,
            });

            await wrapper.setProps({ isOpen: true });
            await nextTick();

            const input = wrapper.find('input[type="number"]').element;
            expect(document.activeElement).toBe(input);
            wrapper.unmount();
        });

        it('should clear input value when reopened', async () => {
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, isOpen: true },
                attachTo: document.body,
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue('7');
            await nextTick();

            await wrapper.setProps({ isOpen: false });
            await nextTick();
            await wrapper.setProps({ isOpen: true });
            await nextTick();

            // Re-query the input element after reopening (new DOM element created)
            const newInput = wrapper.find('input[type="number"]');
            expect((newInput.element as unknown as { value: string }).value).toBe('');
            wrapper.unmount();
        });
    });

    describe('dynamic width', () => {
        it('should have appropriate width for small lastPage', () => {
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, lastPage: 9 },
            });

            const input = wrapper.find('input[type="number"]');
            const style = input.attributes('style');
            expect(style).toContain('width');
        });

        it('should have appropriate width for large lastPage', () => {
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, lastPage: 999 },
            });

            const input = wrapper.find('input[type="number"]');
            const style = input.attributes('style');
            expect(style).toContain('width');
        });
    });

    describe('edge cases', () => {
        it('should handle whitespace in input', async () => {
            const onNavigate = vi.fn();
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, onNavigate },
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue(' 7 ');
            await nextTick();

            const button = wrapper.find('button');
            await button.trigger('click');

            expect(onNavigate).toHaveBeenCalledWith(7);
        });

        it('should handle page 1 correctly', async () => {
            const onNavigate = vi.fn();
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, onNavigate },
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue('1');
            await nextTick();

            const button = wrapper.find('button');
            await button.trigger('click');

            expect(onNavigate).toHaveBeenCalledWith(1);
        });

        it('should handle lastPage correctly', async () => {
            const onNavigate = vi.fn();
            const wrapper = mount(PageJumpDropdown, {
                props: { ...defaultProps, lastPage: 50, onNavigate },
            });

            const input = wrapper.find('input[type="number"]');
            await input.setValue('50');
            await nextTick();

            const button = wrapper.find('button');
            await button.trigger('click');

            expect(onNavigate).toHaveBeenCalledWith(50);
        });
    });
});
