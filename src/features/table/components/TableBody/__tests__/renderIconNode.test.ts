import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, type VNode } from 'vue';
import { renderIconNode } from '../renderIconNode';
import type { IconConfig } from '../../../../../types/api-response.types';
import type { SegmentFormatOptions } from '../segment-renderer.types';

/** Mounts a VNode in an isolated wrapper for DOM inspection. */
function mountVNode(vnode: VNode) {
    return mount(defineComponent({ render: () => vnode }), { attachTo: document.body });
}

describe('renderIconNode', () => {
    const baseOptions: SegmentFormatOptions = { locale: 'en-US' };

    describe('element type', () => {
        it('should return a VNode with type "i"', () => {
            const config: IconConfig = { type: 'icon' };
            const node = renderIconNode(config, baseOptions);
            expect(node.type).toBe('i');
        });

        it('should render <i> element without crash when config is minimal', async () => {
            const config: IconConfig = { type: 'icon' };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('i').exists()).toBe(true);
        });

        it('should not render <a> wrapper when no route is given', async () => {
            const config: IconConfig = { type: 'icon', class: ['fas', 'fa-eye'] };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('a').exists()).toBe(false);
            expect(wrapper.find('i').exists()).toBe(true);
        });
    });

    describe('class resolution — class field', () => {
        it('should apply class array to <i>', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fa-regular', 'fa-trash-can', 'ms-1'],
            };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            const el = wrapper.find('i');
            expect(el.classes()).toContain('fa-regular');
            expect(el.classes()).toContain('fa-trash-can');
            expect(el.classes()).toContain('ms-1');
        });

        it('should split class string by whitespace and apply to <i>', async () => {
            const config: IconConfig = { type: 'icon', class: 'fas fa-pencil fw-bold' };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            const el = wrapper.find('i');
            expect(el.classes()).toContain('fas');
            expect(el.classes()).toContain('fa-pencil');
            expect(el.classes()).toContain('fw-bold');
        });

        it('should render <i> with no class attribute when class is not set', async () => {
            const config: IconConfig = { type: 'icon' };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('i').attributes('class')).toBeUndefined();
        });
    });

    describe('attributes — title and alt', () => {
        it('should set title attribute from config.title', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-info'],
                title: 'Show details',
            };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('i').attributes('title')).toBe('Show details');
        });

        it('should set aria-label from config.alt', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-trash'],
                alt: 'Delete item',
            };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('i').attributes('aria-label')).toBe('Delete item');
        });

        it('should set both title and aria-label when both are provided', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-trash'],
                title: 'Destroy',
                alt: 'Destroy',
            };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('i').attributes('title')).toBe('Destroy');
            expect(wrapper.find('i').attributes('aria-label')).toBe('Destroy');
        });

        it('should not set title when config.title is not provided', async () => {
            const config: IconConfig = { type: 'icon', class: ['fas', 'fa-circle'] };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('i').attributes('title')).toBeUndefined();
        });

        it('should not set aria-label when config.alt is not provided', async () => {
            const config: IconConfig = { type: 'icon', class: ['fas', 'fa-circle'] };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('i').attributes('aria-label')).toBeUndefined();
        });
    });

    describe('attributes — data-* pass-through', () => {
        it('should pass data-action attribute to <i>', async () => {
            const config = {
                type: 'icon' as const,
                class: ['fas', 'fa-trash'],
                'data-action': 'delete',
            } as unknown as IconConfig;
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('i').attributes('data-action')).toBe('delete');
        });

        it('should pass multiple data-* attributes to <i>', async () => {
            const config = {
                type: 'icon' as const,
                class: ['fas', 'fa-edit'],
                'data-id': '7',
                'data-confirm': 'true',
            } as unknown as IconConfig;
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('i').attributes('data-id')).toBe('7');
            expect(wrapper.find('i').attributes('data-confirm')).toBe('true');
        });
    });

    describe('inline styles from style field', () => {
        it('should apply inline style string to <i>', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-circle'],
                style: 'opacity: 0.5',
            };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('i').attributes('style')).toContain('opacity');
        });
    });

    describe('route wrapping', () => {
        it('should wrap <i> in <a> when route and item are provided', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: '/items/{id}/edit',
                key: 'id',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 42 } };
            const wrapper = mountVNode(renderIconNode(config, options));
            const link = wrapper.find('a');
            expect(link.exists()).toBe(true);
            expect(link.attributes('href')).toBe('/items/42/edit');
            expect(link.find('i').exists()).toBe(true);
        });

        it('should return VNode with type "a" when route + item are given', () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: '/items/{id}',
                key: 'id',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 5 } };
            const node = renderIconNode(config, options);
            expect(node.type).toBe('a');
        });

        it('should resolve multiple placeholders in route', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-link'],
                route: '/org/{orgId}/items/{id}',
                key: 'id',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { orgId: 10, id: 99 } };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe('/org/10/items/99');
        });

        it('should replace missing placeholder with empty string', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-link'],
                route: '/items/{id}/edit',
                key: 'id',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: {} };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe('/items//edit');
        });

        it('should not wrap in <a> when route is set but item is not provided', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: '/items/{id}/edit',
                key: 'id',
            };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('a').exists()).toBe(false);
        });

        it('should not wrap in <a> when item is provided but route is not set', async () => {
            const config: IconConfig = { type: 'icon', class: ['fas', 'fa-eye'] };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 1 } };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').exists()).toBe(false);
        });
    });

    describe('route wrapping — key requirement', () => {
        it('should not wrap in <a> when route is set but key is not provided', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: '/items/{id}/edit',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 1 } };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').exists()).toBe(false);
        });

        it('should wrap in <a> when route, key and item are all provided', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: '/items/{id}/edit',
                key: 'id',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 3 } };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').exists()).toBe(true);
            expect(wrapper.find('a').attributes('href')).toBe('/items/3/edit');
        });
    });

    describe('route wrapping — dot to slash conversion', () => {
        it('should convert dots to slashes in route without placeholders', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: 'variables.icons.edit',
                key: 'id',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 1 } };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe('/variables/icons/edit');
        });

        it('should resolve placeholder then convert remaining dots to slashes', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: 'variables.icons.{id}.edit',
                key: 'id',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 42 } };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe('/variables/icons/42/edit');
        });

        it('should not change route without dots', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: 'single',
                key: 'id',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 1 } };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe('/single');
        });

        it('should convert multiple consecutive dots to slashes', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: 'a.b.c.d',
                key: 'id',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 1 } };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe('/a/b/c/d');
        });
    });

    describe('route wrapping — siteName prefix', () => {
        it('should prepend siteName to resolved route', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: 'items.{id}.edit',
                key: 'id',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                siteName: 'https://myapp.com',
                item: { id: 5 },
            };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe('https://myapp.com/items/5/edit');
        });

        it('should not produce double slash when siteName has trailing slash', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: 'items.{id}.edit',
                key: 'id',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                siteName: 'https://myapp.com/',
                item: { id: 5 },
            };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe('https://myapp.com/items/5/edit');
        });

        it('should return path with leading slash when siteName is null', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: 'items.{id}.edit',
                key: 'id',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                siteName: null,
                item: { id: 5 },
            };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe('/items/5/edit');
        });

        it('should return path with leading slash when siteName is undefined', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: 'items.{id}.edit',
                key: 'id',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { id: 5 } };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe('/items/5/edit');
        });

        it('should return path with leading slash when siteName is empty string', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: 'items.{id}.edit',
                key: 'id',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                siteName: '',
                item: { id: 5 },
            };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe('/items/5/edit');
        });

        it('should work with a different domain as siteName', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-edit'],
                route: 'items.{id}.edit',
                key: 'id',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                siteName: 'https://other-domain.com',
                item: { id: 10 },
            };
            const wrapper = mountVNode(renderIconNode(config, options));
            expect(wrapper.find('a').attributes('href')).toBe(
                'https://other-domain.com/items/10/edit'
            );
        });
    });

    describe('route wrapping — icons.2.json example', () => {
        it('should render icon with full siteName + dot-notation route as href', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fa-regular', 'fa-trash-can', 'ms-1', 'text-primary'],
                alt: 'Edit',
                title: 'Edit',
                key: 'id',
                route: 'variables.icons.{id}.edit',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                siteName: 'https://myapp.com',
                item: { id: 7 },
            };
            const wrapper = mountVNode(renderIconNode(config, options));
            const link = wrapper.find('a');
            expect(link.exists()).toBe(true);
            expect(link.attributes('href')).toBe('https://myapp.com/variables/icons/7/edit');
            const icon = link.find('i');
            expect(icon.exists()).toBe(true);
            expect(icon.classes()).toContain('fa-regular');
            expect(icon.classes()).toContain('fa-trash-can');
            expect(icon.classes()).toContain('ms-1');
            expect(icon.classes()).toContain('text-primary');
            expect(icon.attributes('title')).toBe('Edit');
            expect(icon.attributes('aria-label')).toBe('Edit');
        });
    });

    describe('icons.3.json example (preprocessed)', () => {
        it('should render preprocessed icon config with class array and dot-notation route', async () => {
            // After preprocessing: icon/variant resolved into class
            const config: IconConfig = {
                type: 'icon',
                class: ['fas', 'fa-info-circle', 'text-info'],
                alt: 'Show',
                title: 'Show',
                key: 'id',
                route: 'variables.icons.{id}.show',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                siteName: 'https://myapp.com',
                item: { id: 1 },
            };
            const wrapper = mountVNode(renderIconNode(config, options));
            const link = wrapper.find('a');
            expect(link.exists()).toBe(true);
            expect(link.attributes('href')).toBe('https://myapp.com/variables/icons/1/show');
            const icon = link.find('i');
            expect(icon.exists()).toBe(true);
            expect(icon.classes()).toContain('fas');
            expect(icon.classes()).toContain('fa-info-circle');
            expect(icon.classes()).toContain('text-info');
            expect(icon.attributes('title')).toBe('Show');
            expect(icon.attributes('aria-label')).toBe('Show');
        });
    });

    describe('icons.1.json example', () => {
        it('should render destroy icon with class array, title and alt', async () => {
            const config: IconConfig = {
                type: 'icon',
                class: ['fa-regular', 'fa-trash-can', 'ms-1', 'text-danger'],
                alt: 'Destroy',
                title: 'Destroy',
            };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            const el = wrapper.find('i');
            expect(el.exists()).toBe(true);
            expect(el.classes()).toContain('fa-regular');
            expect(el.classes()).toContain('fa-trash-can');
            expect(el.classes()).toContain('ms-1');
            expect(el.classes()).toContain('text-danger');
            expect(el.attributes('title')).toBe('Destroy');
            expect(el.attributes('aria-label')).toBe('Destroy');
        });
    });

    describe('global icon classes from options.globalClasses', () => {
        it('should apply globalClasses.icon array to <i> after config classes', async () => {
            const config: IconConfig = { type: 'icon', class: ['fas', 'fa-edit'] };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                globalClasses: { icon: ['mx-2', 'text-primary'] },
            };
            const wrapper = mountVNode(renderIconNode(config, options));
            const el = wrapper.find('i');
            expect(el.classes()).toContain('fas');
            expect(el.classes()).toContain('fa-edit');
            expect(el.classes()).toContain('mx-2');
            expect(el.classes()).toContain('text-primary');
        });

        it('should split globalClasses.icon string by whitespace and apply to <i>', async () => {
            const config: IconConfig = { type: 'icon', class: ['fas', 'fa-trash'] };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                globalClasses: { icon: 'mx-2 px-1' },
            };
            const wrapper = mountVNode(renderIconNode(config, options));
            const el = wrapper.find('i');
            expect(el.classes()).toContain('mx-2');
            expect(el.classes()).toContain('px-1');
        });

        it('should not apply globalClasses when undefined', async () => {
            const config: IconConfig = { type: 'icon', class: ['fas', 'fa-eye'] };
            const wrapper = mountVNode(renderIconNode(config, baseOptions));
            expect(wrapper.find('i').classes()).toEqual(['fas', 'fa-eye']);
        });

        it('should not apply globalClasses.button to icon renderer', async () => {
            const config: IconConfig = { type: 'icon', class: ['fas', 'fa-edit'] };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                globalClasses: { button: ['mx-1'] },
            };
            const wrapper = mountVNode(renderIconNode(config, options));
            const el = wrapper.find('i');
            expect(el.classes()).not.toContain('mx-1');
        });
    });
});
