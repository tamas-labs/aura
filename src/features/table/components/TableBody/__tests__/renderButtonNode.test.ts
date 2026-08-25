import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, type VNode } from 'vue';
import { renderButtonNode } from '../renderButtonNode';
import type { ButtonConfig } from '../../../../../types/api-response.types';
import type { SegmentFormatOptions } from '../segment-renderer.types';

/** Mounts a VNode in an isolated wrapper for DOM inspection. */
function mountVNode(vnode: VNode) {
    return mount(defineComponent({ render: () => vnode }), { attachTo: document.body });
}

const ICON_REGISTRY = {
    cog: ['fas', 'fa-cog'],
    primary: ['fas', 'fa-file'],
};

describe('renderButtonNode', () => {
    describe('element model (dual: <a> vs <button>)', () => {
        it('should render an <a class="btn"> when route is provided', async () => {
            const config: ButtonConfig = {
                type: 'button',
                field: 'name',
                key: 'id',
                route: '/users/{id}/edit',
                variant: 'primary',
                size: 'sm',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { id: 5, name: 'Edit' },
            };
            const wrapper = mountVNode(await renderButtonNode(config, options));
            const a = wrapper.find('a');
            expect(a.exists()).toBe(true);
            expect(a.attributes('href')).toBe('/users/5/edit');
            expect(a.classes()).toEqual(expect.arrayContaining(['btn', 'btn-primary', 'btn-sm']));
            expect(a.text()).toBe('Edit');
        });

        it('should render a <button type="button"> when no route is provided', async () => {
            const config: ButtonConfig = { type: 'button', value: 'Click' };
            const wrapper = mountVNode(await renderButtonNode(config, { locale: 'en-US' }));
            const button = wrapper.find('button');
            expect(button.exists()).toBe(true);
            expect(button.attributes('type')).toBe('button');
            expect(button.classes()).toContain('btn');
            expect(button.text()).toBe('Click');
        });

        it('should honor htmlType on the <button> element', async () => {
            const config: ButtonConfig = { type: 'button', value: 'Save', htmlType: 'submit' };
            const wrapper = mountVNode(await renderButtonNode(config, { locale: 'en-US' }));
            expect(wrapper.find('button').attributes('type')).toBe('submit');
        });
    });

    describe('label source', () => {
        it('should use the item field value as the label', async () => {
            const config: ButtonConfig = { type: 'button', field: 'label', value: 'fallback' };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { label: 'FromItem' } };
            const wrapper = mountVNode(await renderButtonNode(config, options));
            expect(wrapper.text()).toBe('FromItem');
        });

        it('should fall back to the static value when no field', async () => {
            const config: ButtonConfig = { type: 'button', value: 'Static' };
            const wrapper = mountVNode(await renderButtonNode(config, { locale: 'en-US' }));
            expect(wrapper.text()).toBe('Static');
        });

        it('should apply the static formatter chain (uppercase) to the label', async () => {
            const config: ButtonConfig = { type: 'button', field: 'name', uppercase: true };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { name: 'edit' } };
            const wrapper = mountVNode(await renderButtonNode(config, options));
            expect(wrapper.text()).toBe('EDIT');
        });
    });

    describe('styling flags', () => {
        it('should add rounded-circle and rounded-pill utilities', async () => {
            const config: ButtonConfig = {
                type: 'button',
                value: 'X',
                rounded: true,
                pill: true,
            };
            const wrapper = mountVNode(await renderButtonNode(config, { locale: 'en-US' }));
            const classes = wrapper.find('button').classes();
            expect(classes).toContain('rounded-circle');
            expect(classes).toContain('rounded-pill');
        });

        it('should set the native disabled attribute on a <button>', async () => {
            const config: ButtonConfig = { type: 'button', value: 'X', disabled: true };
            const wrapper = mountVNode(await renderButtonNode(config, { locale: 'en-US' }));
            expect(wrapper.find('button').attributes('disabled')).toBeDefined();
        });

        it('should mark a disabled anchor with the disabled class and aria-disabled', async () => {
            const config: ButtonConfig = {
                type: 'button',
                value: 'X',
                route: '/x/{id}',
                disabled: true,
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 1 } };
            const wrapper = mountVNode(await renderButtonNode(config, options));
            const a = wrapper.find('a');
            expect(a.classes()).toContain('disabled');
            expect(a.attributes('aria-disabled')).toBe('true');
        });

        it('should set the title attribute', async () => {
            const config: ButtonConfig = { type: 'button', icon: 'cog', title: 'Settings' };
            const options: SegmentFormatOptions = { locale: 'en-US', icons: ICON_REGISTRY };
            const wrapper = mountVNode(await renderButtonNode(config, options));
            expect(wrapper.find('button').attributes('title')).toBe('Settings');
        });
    });

    describe('icon support (config.icons registry)', () => {
        it('should render an <i> from the registry key before the text (default start)', async () => {
            const config: ButtonConfig = { type: 'button', value: 'Settings', icon: 'cog' };
            const options: SegmentFormatOptions = { locale: 'en-US', icons: ICON_REGISTRY };
            const wrapper = mountVNode(await renderButtonNode(config, options));
            const i = wrapper.find('i');
            expect(i.exists()).toBe(true);
            expect(i.classes()).toEqual(expect.arrayContaining(['fas', 'fa-cog']));
            // icon before text
            expect(wrapper.find('button').element.firstElementChild?.tagName).toBe('I');
        });

        it('should place the icon after the text when iconPosition is "end"', async () => {
            const config: ButtonConfig = {
                type: 'button',
                value: 'Settings',
                icon: 'cog',
                iconPosition: 'end',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', icons: ICON_REGISTRY };
            const wrapper = mountVNode(await renderButtonNode(config, options));
            expect(wrapper.find('button').element.lastElementChild?.tagName).toBe('I');
        });

        it('should render an icon-only button when no field/value', async () => {
            const config: ButtonConfig = {
                type: 'button',
                icon: 'cog',
                variant: 'outline-secondary',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', icons: ICON_REGISTRY };
            const wrapper = mountVNode(await renderButtonNode(config, options));
            expect(wrapper.find('i').exists()).toBe(true);
            expect(wrapper.text().trim()).toBe('');
        });

        it('should fall back to icons.primary for an unknown icon key', async () => {
            const config: ButtonConfig = { type: 'button', value: 'X', icon: 'unknownKey' };
            const options: SegmentFormatOptions = { locale: 'en-US', icons: ICON_REGISTRY };
            const wrapper = mountVNode(await renderButtonNode(config, options));
            expect(wrapper.find('i').classes()).toEqual(expect.arrayContaining(['fas', 'fa-file']));
        });

        it('should render no icon when there is no registry', async () => {
            const config: ButtonConfig = { type: 'button', value: 'X', icon: 'cog' };
            const wrapper = mountVNode(await renderButtonNode(config, { locale: 'en-US' }));
            expect(wrapper.find('i').exists()).toBe(false);
        });
    });

    describe('data-* attributes', () => {
        it('should forward data-* attributes with {field} placeholder substitution', async () => {
            const config = {
                type: 'button',
                value: 'X',
                'data-user-id': '{id}',
            } as unknown as ButtonConfig;
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 42 } };
            const wrapper = mountVNode(await renderButtonNode(config, options));
            expect(wrapper.find('button').attributes('data-user-id')).toBe('42');
        });
    });

    describe('sanitization', () => {
        it('should escape HTML in the label (text content, not innerHTML)', async () => {
            const config: ButtonConfig = { type: 'button', field: 'name' };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { name: '<script>alert(1)</script>' },
            };
            const wrapper = mountVNode(await renderButtonNode(config, options));
            expect(wrapper.find('button').element.querySelector('script')).toBeNull();
            expect(wrapper.text()).toContain('alert(1)');
        });
    });
});
