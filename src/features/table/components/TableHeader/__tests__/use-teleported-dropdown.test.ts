import { describe, it, expect, vi, afterEach } from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import { useTeleportedDropdown } from '../use-teleported-dropdown';

/**
 * `FilterDropdown.test.tsx` and `FilterCalendar.test.tsx` already exercise this composable
 * end-to-end through both of its consumers. These tests target the composable directly, so
 * its position/dismiss logic is covered even if a future consumer stops exercising a branch.
 */
const TestHost = defineComponent({
    props: { minWidth: { type: Number, default: 220 } },
    setup(props) {
        const state = useTeleportedDropdown(props.minWidth);
        return () =>
            h('button', {
                type: 'button',
                ref: state.toggleRef,
                'data-testid': 'toggle',
                'data-open': state.isOpen.value,
                'data-top': state.dropdownPosition.value.top,
                'data-left': state.dropdownPosition.value.left,
                onClick: state.toggleDropdown,
            });
    },
});

describe('useTeleportedDropdown', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should start closed', () => {
        const wrapper = mount(TestHost, { attachTo: document.body });
        expect(wrapper.find('[data-testid="toggle"]').attributes('data-open')).toBe('false');
        wrapper.unmount();
    });

    it('should open and close on repeated toggles', async () => {
        const wrapper = mount(TestHost, { attachTo: document.body });
        const button = wrapper.find('[data-testid="toggle"]');

        await button.trigger('click');
        expect(wrapper.find('[data-testid="toggle"]').attributes('data-open')).toBe('true');

        await button.trigger('click');
        expect(wrapper.find('[data-testid="toggle"]').attributes('data-open')).toBe('false');
        wrapper.unmount();
    });

    it('should position the panel from the toggle button rect, right-aligned with room', async () => {
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            left: 500,
            right: 550,
            top: 100,
            bottom: 120,
            width: 50,
            height: 20,
            x: 500,
            y: 100,
            toJSON: () => ({}),
        })) as unknown as typeof Element.prototype.getBoundingClientRect;

        const wrapper = mount(TestHost, { props: { minWidth: 220 }, attachTo: document.body });
        await wrapper.find('[data-testid="toggle"]').trigger('click');

        const toggle = wrapper.find('[data-testid="toggle"]');
        expect(toggle.attributes('data-top')).toBe('120');
        expect(toggle.attributes('data-left')).toBe('330'); // 550 - 220
        wrapper.unmount();
    });

    it('should left-align the panel when the button is near the viewport edge', async () => {
        Element.prototype.getBoundingClientRect = vi.fn(() => ({
            left: 100,
            right: 150,
            top: 100,
            bottom: 120,
            width: 50,
            height: 20,
            x: 100,
            y: 100,
            toJSON: () => ({}),
        })) as unknown as typeof Element.prototype.getBoundingClientRect;

        const wrapper = mount(TestHost, { props: { minWidth: 220 }, attachTo: document.body });
        await wrapper.find('[data-testid="toggle"]').trigger('click');

        expect(wrapper.find('[data-testid="toggle"]').attributes('data-left')).toBe('100');
        wrapper.unmount();
    });

    it('should close on outside click but not on the toggle button itself', async () => {
        const wrapper = mount(TestHost, { attachTo: document.body });
        const button = wrapper.find('[data-testid="toggle"]');

        await button.trigger('click');
        expect(wrapper.find('[data-testid="toggle"]').attributes('data-open')).toBe('true');

        document.body.click();
        await wrapper.vm.$nextTick();
        expect(wrapper.find('[data-testid="toggle"]').attributes('data-open')).toBe('false');
        wrapper.unmount();
    });

    it('should close on Escape and refocus the toggle button', async () => {
        const wrapper = mount(TestHost, { attachTo: document.body });
        const button = wrapper.find('[data-testid="toggle"]');

        await button.trigger('click');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await wrapper.vm.$nextTick();

        expect(wrapper.find('[data-testid="toggle"]').attributes('data-open')).toBe('false');
        expect(document.activeElement).toBe(button.element);
        wrapper.unmount();
    });

    it('should ignore non-Escape keys while open', async () => {
        const wrapper = mount(TestHost, { attachTo: document.body });
        const button = wrapper.find('[data-testid="toggle"]');

        await button.trigger('click');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        await wrapper.vm.$nextTick();

        expect(wrapper.find('[data-testid="toggle"]').attributes('data-open')).toBe('true');
        wrapper.unmount();
    });

    it('should close on window scroll and resize while open, and no-op while closed', async () => {
        const wrapper = mount(TestHost, { attachTo: document.body });
        const button = wrapper.find('[data-testid="toggle"]');

        // Closed: no-op, no error
        window.dispatchEvent(new Event('scroll'));
        window.dispatchEvent(new Event('resize'));
        await wrapper.vm.$nextTick();
        expect(wrapper.find('[data-testid="toggle"]').attributes('data-open')).toBe('false');

        await button.trigger('click');
        window.dispatchEvent(new Event('scroll'));
        await wrapper.vm.$nextTick();
        expect(wrapper.find('[data-testid="toggle"]').attributes('data-open')).toBe('false');

        await button.trigger('click');
        window.dispatchEvent(new Event('resize'));
        await wrapper.vm.$nextTick();
        expect(wrapper.find('[data-testid="toggle"]').attributes('data-open')).toBe('false');

        wrapper.unmount();
    });

    it('should remove its document/window listeners on unmount', async () => {
        const removeDocSpy = vi.spyOn(document, 'removeEventListener');
        const removeWinSpy = vi.spyOn(window, 'removeEventListener');

        const wrapper = mount(TestHost, { attachTo: document.body });
        wrapper.unmount();

        expect(removeDocSpy).toHaveBeenCalledWith('click', expect.any(Function));
        expect(removeDocSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(removeWinSpy).toHaveBeenCalledWith('scroll', expect.any(Function), true);
        expect(removeWinSpy).toHaveBeenCalledWith('resize', expect.any(Function));
    });
});
