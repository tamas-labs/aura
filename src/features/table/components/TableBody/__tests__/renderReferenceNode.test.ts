import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, type VNode } from 'vue';
import { renderReferenceNode } from '../renderReferenceNode';
import type { ReferenceConfig } from '../../../../../types/api-response.types';
import type { SegmentFormatOptions } from '../segment-renderer.types';

/** Mounts a VNode in an isolated wrapper for DOM inspection. */
function mountVNode(vnode: VNode) {
    return mount(defineComponent({ render: () => vnode }), { attachTo: document.body });
}

describe('renderReferenceNode', () => {
    const baseOptions: SegmentFormatOptions = { locale: 'en-US' };

    describe('single field resolution', () => {
        it('should display the referenced field value from item', async () => {
            const config: ReferenceConfig = { type: 'reference', field: 'last' };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { last: 'Kovács' } };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.find('span').exists()).toBe(true);
            expect(wrapper.text()).toBe('Kovács');
        });

        it('should resolve a dotted field path', async () => {
            const config: ReferenceConfig = { type: 'reference', field: 'user.name' };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { user: { name: 'Anna' } },
            };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.text()).toBe('Anna');
        });

        it('should render empty span when item is missing', async () => {
            const config: ReferenceConfig = { type: 'reference', field: 'name' };
            const wrapper = mountVNode(await renderReferenceNode(config, baseOptions));
            expect(wrapper.text()).toBe('');
        });
    });

    describe('multi-field join', () => {
        it('should join fields with the given separator', async () => {
            const config: ReferenceConfig = {
                type: 'reference',
                fields: ['city', 'country'],
                separator: ', ',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { city: 'Budapest', country: 'Hungary' },
            };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.text()).toBe('Budapest, Hungary');
        });

        it('should default to a space separator', async () => {
            const config: ReferenceConfig = {
                type: 'reference',
                fields: ['firstName', 'lastName'],
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { firstName: 'Anna', lastName: 'Kovács' },
            };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.text()).toBe('Anna Kovács');
        });

        it('should drop empty/null values without leaving a dangling separator', async () => {
            const config: ReferenceConfig = {
                type: 'reference',
                fields: ['firstName', 'middle', 'lastName'],
                separator: ' ',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { firstName: 'Anna', middle: null, lastName: 'Kovács' },
            };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.text()).toBe('Anna Kovács');
        });

        it('should take precedence over a single field when both are given', async () => {
            const config: ReferenceConfig = {
                type: 'reference',
                field: 'ignored',
                fields: ['a', 'b'],
                separator: '-',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { ignored: 'X', a: '1', b: '2' },
            };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.text()).toBe('1-2');
        });
    });

    describe('value-based text source (mapping label→value alias target)', () => {
        it('should render `value` when present, taking priority over `field`', async () => {
            const config: ReferenceConfig = {
                type: 'reference',
                field: 'ignored',
                value: 'Aktív',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { ignored: 'from-field' },
            };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.text()).toBe('Aktív');
        });

        it('should render `value` when present, taking priority over `fields`', async () => {
            const config: ReferenceConfig = {
                type: 'reference',
                fields: ['a', 'b'],
                value: 'Fixed',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { a: '1', b: '2' },
            };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.text()).toBe('Fixed');
        });

        it('should apply the formatter chain to `value` (e.g. lowercase)', async () => {
            const config: ReferenceConfig = {
                type: 'reference',
                value: 'AKTÍV',
                lowercase: true,
            };
            const wrapper = mountVNode(await renderReferenceNode(config, baseOptions));
            expect(wrapper.text()).toBe('aktív');
        });

        it('should fall back to `fields` when `value` is null', async () => {
            const config: ReferenceConfig = {
                type: 'reference',
                value: null,
                fields: ['city', 'country'],
                separator: ', ',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { city: 'Budapest', country: 'Hungary' },
            };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.text()).toBe('Budapest, Hungary');
        });

        it('should fall back to `field` when `value` is undefined', async () => {
            const config: ReferenceConfig = { type: 'reference', field: 'name' };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { name: 'Anna' } };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.text()).toBe('Anna');
        });

        it('should fall back to `field` when `value` is an empty string', async () => {
            const config: ReferenceConfig = { type: 'reference', value: '', field: 'name' };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { name: 'Anna' } };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.text()).toBe('Anna');
        });
    });

    describe('formatting', () => {
        it('should lowercase the resolved value', async () => {
            const config: ReferenceConfig = { type: 'reference', field: 'email', lowercase: true };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { email: 'Anna@Example.com' },
            };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.text()).toBe('anna@example.com');
        });

        it('should apply content style classes', async () => {
            const config: ReferenceConfig = {
                type: 'reference',
                field: 'name',
                class: ['fw-bold', 'text-muted'],
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { name: 'X' } };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            const span = wrapper.find('span');
            expect(span.classes()).toContain('fw-bold');
            expect(span.classes()).toContain('text-muted');
        });

        it('should escape HTML in the referenced value (text content, not innerHTML)', async () => {
            const config: ReferenceConfig = { type: 'reference', field: 'name' };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { name: '<script>alert(1)</script>' },
            };
            const wrapper = mountVNode(await renderReferenceNode(config, options));
            expect(wrapper.find('span').element.querySelector('script')).toBeNull();
            expect(wrapper.text()).toContain('alert(1)');
        });
    });
});
