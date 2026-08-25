import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, type VNode } from 'vue';
import { renderStaticNode } from '../renderStaticNode';
import type { StaticConfig } from '../../../../../types/api-response.types';
import type { SegmentFormatOptions } from '../segment-renderer.types';

/** Mounts a VNode in an isolated wrapper for DOM inspection. */
function mountVNode(vnode: VNode) {
    return mount(defineComponent({ render: () => vnode }), { attachTo: document.body });
}

describe('renderStaticNode', () => {
    const baseOptions: SegmentFormatOptions = { locale: 'en-US' };

    describe('element type', () => {
        it('should return a VNode with type "span"', async () => {
            const config: StaticConfig = { type: 'static', value: 'Hello' };
            const node = await renderStaticNode(config, baseOptions);
            expect(node.type).toBe('span');
        });

        it('should render <span> element in DOM', async () => {
            const config: StaticConfig = { type: 'static', value: 'Test' };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').exists()).toBe(true);
        });
    });

    describe('text content', () => {
        it('should render string value as text content', async () => {
            const config: StaticConfig = { type: 'static', value: 'ID:' };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').text()).toBe('ID:');
        });

        it('should render numeric value as string', async () => {
            const config: StaticConfig = { type: 'static', value: 42 as any };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').text()).toContain('42');
        });

        it('should render empty string for null value', async () => {
            const config: StaticConfig = { type: 'static', value: null };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').text()).toBe('');
        });
    });

    describe('class attribute', () => {
        it('should apply class array to <span>', async () => {
            const config: StaticConfig = {
                type: 'static',
                value: 'ID:',
                class: ['pe-1', 'text-muted', 'fw-bold'],
            };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            const span = wrapper.find('span');
            expect(span.classes()).toContain('pe-1');
            expect(span.classes()).toContain('text-muted');
            expect(span.classes()).toContain('fw-bold');
        });

        it('should split class string and apply to <span>', async () => {
            const config: StaticConfig = {
                type: 'static',
                value: 'Ref:',
                class: 'fw-bold text-primary',
            };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            const span = wrapper.find('span');
            expect(span.classes()).toContain('fw-bold');
            expect(span.classes()).toContain('text-primary');
        });

        it('should not set class attribute when config has no class', async () => {
            const config: StaticConfig = { type: 'static', value: 'Plain' };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').attributes('class')).toBeFalsy();
        });
    });

    describe('inline styles', () => {
        it('should apply style string as inline style', async () => {
            const config: StaticConfig = {
                type: 'static',
                value: 'Label',
                style: 'font-weight: bold',
            };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').attributes('style')).toContain('font-weight');
        });

        it('should not set style attribute when config has no style properties', async () => {
            const config: StaticConfig = { type: 'static', value: 'Plain' };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').attributes('style')).toBeFalsy();
        });
    });

    describe('color formatting', () => {
        it('should apply Bootstrap color as text-* class', async () => {
            const config: StaticConfig = { type: 'static', value: 'Status', color: 'success' };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').classes()).toContain('text-success');
        });

        it('should apply CSS hex color as inline style', async () => {
            const config: StaticConfig = {
                type: 'static',
                value: 'Label',
                color: '#ff0000' as any,
            };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').attributes('style')).toContain('color');
        });

        it('should apply Bootstrap background as bg-* class', async () => {
            const config: StaticConfig = { type: 'static', value: 'Tag', background: 'warning' };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').classes()).toContain('bg-warning');
        });
    });

    describe('typography formatting', () => {
        it('should apply fontSize as inline style', async () => {
            const config: StaticConfig = { type: 'static', value: 'Text', fontSize: '14px' };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').attributes('style')).toContain('font-size');
        });

        it('should apply italic as inline style', async () => {
            const config: StaticConfig = { type: 'static', value: 'Italic', italic: true };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').attributes('style')).toContain('font-style');
        });

        it('should apply monospace class', async () => {
            const config: StaticConfig = { type: 'static', value: 'Code', monospace: true };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').classes()).toContain('font-monospace');
        });
    });

    describe('uppercase transform', () => {
        it('should format value as uppercase when uppercase is true', async () => {
            const config: StaticConfig = { type: 'static', value: 'hello', uppercase: true };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').text()).toBe('HELLO');
        });
    });

    describe('locale and date options', () => {
        it('should accept custom locale without error', async () => {
            const config: StaticConfig = { type: 'static', value: 'Szöveg' };
            const options: SegmentFormatOptions = { locale: 'hu-HU' };
            const node = await renderStaticNode(config, options);
            const wrapper = mountVNode(node);
            expect(wrapper.find('span').text()).toBe('Szöveg');
        });
    });

    describe('combined formatting', () => {
        it('should apply class + color + fontSize together', async () => {
            const config: StaticConfig = {
                type: 'static',
                value: 'Combo',
                class: 'fw-bold',
                color: 'danger',
                fontSize: '12px',
            };
            const node = await renderStaticNode(config, baseOptions);
            const wrapper = mountVNode(node);
            const span = wrapper.find('span');
            expect(span.classes()).toContain('fw-bold');
            expect(span.classes()).toContain('text-danger');
            expect(span.attributes('style')).toContain('font-size');
        });
    });
});
