import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, type VNode } from 'vue';
import { renderLinkNode } from '../renderLinkNode';
import type { LinkConfig } from '../../../../../types/api-response.types';
import type { SegmentFormatOptions } from '../segment-renderer.types';

/** Mounts a VNode in an isolated wrapper for DOM inspection. */
function mountVNode(vnode: VNode) {
    return mount(defineComponent({ render: () => vnode }), { attachTo: document.body });
}

describe('renderLinkNode', () => {
    const baseOptions: SegmentFormatOptions = { locale: 'en-US' };

    describe('element type', () => {
        it('should render <span> when no route is given', async () => {
            const config: LinkConfig = { type: 'link', value: 'Plain' };
            const wrapper = mountVNode(await renderLinkNode(config, baseOptions));
            expect(wrapper.find('a').exists()).toBe(false);
            expect(wrapper.find('span').exists()).toBe(true);
            expect(wrapper.text()).toBe('Plain');
        });

        it('should render <a> when route is given', async () => {
            const config: LinkConfig = { type: 'link', value: 'Go', route: '/users/{id}' };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 5 } };
            const wrapper = mountVNode(await renderLinkNode(config, options));
            const link = wrapper.find('a');
            expect(link.exists()).toBe(true);
            expect(link.attributes('href')).toBe('/users/5');
        });
    });

    describe('text resolution', () => {
        it('should display field value from item', async () => {
            const config: LinkConfig = { type: 'link', field: 'name', route: '/users/{id}' };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { id: 1, name: 'Anna' },
            };
            const wrapper = mountVNode(await renderLinkNode(config, options));
            expect(wrapper.text()).toBe('Anna');
        });

        it('should fall back to static value when no field', async () => {
            const config: LinkConfig = { type: 'link', value: 'Static', route: '/x/{id}' };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 1 } };
            const wrapper = mountVNode(await renderLinkNode(config, options));
            expect(wrapper.text()).toBe('Static');
        });

        it('should apply slice formatting to text', async () => {
            const config: LinkConfig = { type: 'link', value: 'abcdefghij', slice: 5 };
            const wrapper = mountVNode(await renderLinkNode(config, baseOptions));
            expect(wrapper.text().length).toBeLessThanOrEqual(8); // sliced + ellipsis
        });

        it('should uppercase text when uppercase is set', async () => {
            const config: LinkConfig = { type: 'link', value: 'hello', uppercase: true };
            const wrapper = mountVNode(await renderLinkNode(config, baseOptions));
            expect(wrapper.text()).toBe('HELLO');
        });
    });

    describe('link attributes', () => {
        it('should set target attribute', async () => {
            const config: LinkConfig = {
                type: 'link',
                field: 'site',
                route: '/x',
                target: '_blank',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { site: 'S' } };
            const wrapper = mountVNode(await renderLinkNode(config, options));
            expect(wrapper.find('a').attributes('target')).toBe('_blank');
        });

        it('should auto-set rel="noopener noreferrer" for target="_blank"', async () => {
            const config: LinkConfig = {
                type: 'link',
                value: 'X',
                route: '/x',
                target: '_blank',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: {} };
            const wrapper = mountVNode(await renderLinkNode(config, options));
            expect(wrapper.find('a').attributes('rel')).toBe('noopener noreferrer');
        });

        it('should respect explicit rel over auto value', async () => {
            const config: LinkConfig = {
                type: 'link',
                value: 'X',
                route: '/x',
                target: '_blank',
                rel: 'noopener',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: {} };
            const wrapper = mountVNode(await renderLinkNode(config, options));
            expect(wrapper.find('a').attributes('rel')).toBe('noopener');
        });

        it('should not set rel when target is not _blank', async () => {
            const config: LinkConfig = { type: 'link', value: 'X', route: '/x', target: '_self' };
            const options: SegmentFormatOptions = { locale: 'en-US', item: {} };
            const wrapper = mountVNode(await renderLinkNode(config, options));
            expect(wrapper.find('a').attributes('rel')).toBeUndefined();
        });

        it('should set title attribute', async () => {
            const config: LinkConfig = { type: 'link', value: 'X', route: '/x', title: 'Tip' };
            const options: SegmentFormatOptions = { locale: 'en-US', item: {} };
            const wrapper = mountVNode(await renderLinkNode(config, options));
            expect(wrapper.find('a').attributes('title')).toBe('Tip');
        });
    });

    describe('styling', () => {
        it('should apply Bootstrap color as text- class', async () => {
            const config: LinkConfig = { type: 'link', value: 'X', color: 'primary' };
            const wrapper = mountVNode(await renderLinkNode(config, baseOptions));
            expect(wrapper.find('span').classes()).toContain('text-primary');
        });

        it('should apply link-{variant} class', async () => {
            const config: LinkConfig = { type: 'link', value: 'X', variant: 'danger' };
            const wrapper = mountVNode(await renderLinkNode(config, baseOptions));
            expect(wrapper.find('span').classes()).toContain('link-danger');
        });

        it('should apply custom class array', async () => {
            const config: LinkConfig = {
                type: 'link',
                value: 'X',
                class: ['text-decoration-none', 'fw-bold'],
            };
            const wrapper = mountVNode(await renderLinkNode(config, baseOptions));
            const el = wrapper.find('span');
            expect(el.classes()).toContain('text-decoration-none');
            expect(el.classes()).toContain('fw-bold');
        });

        it('should apply global link classes from options', async () => {
            const config: LinkConfig = { type: 'link', value: 'X' };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                globalClasses: { link: ['mx-1'] },
            };
            const wrapper = mountVNode(await renderLinkNode(config, options));
            expect(wrapper.find('span').classes()).toContain('mx-1');
        });
    });

    describe('data-* attributes', () => {
        it('should substitute {field} placeholder in data-* values', async () => {
            const config = {
                type: 'link' as const,
                field: 'name',
                route: '/users/{id}',
                'data-user-id': '{id}',
            } as unknown as LinkConfig;
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 42, name: 'A' } };
            const wrapper = mountVNode(await renderLinkNode(config, options));
            expect(wrapper.find('a').attributes('data-user-id')).toBe('42');
        });

        it('should pass through data-* without placeholders', async () => {
            const config = {
                type: 'link' as const,
                value: 'X',
                'data-action': 'view',
            } as unknown as LinkConfig;
            const wrapper = mountVNode(await renderLinkNode(config, baseOptions));
            expect(wrapper.find('span').attributes('data-action')).toBe('view');
        });
    });

    describe('siteName prefix', () => {
        it('should prepend siteName to resolved route', async () => {
            const config: LinkConfig = { type: 'link', value: 'X', route: 'users.{id}' };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                siteName: 'https://app.com',
                item: { id: 7 },
            };
            const wrapper = mountVNode(await renderLinkNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe('https://app.com/users/7');
        });
    });
});
