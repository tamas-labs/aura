import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, type VNode } from 'vue';
import { renderCustomNode, resolveCustomTemplateHtml } from '../renderCustomNode';
import type { CustomConfig } from '../../../../../types/api-response.types';
import type { SegmentFormatOptions } from '../segment-renderer.types';

/** Mounts a VNode in an isolated wrapper for DOM inspection. */
function mountVNode(vnode: VNode) {
    return mount(defineComponent({ render: () => vnode }), { attachTo: document.body });
}

/**
 * Note: the template/renderer HTML output goes through DOMPurify. In the happy-dom test
 * environment, DOMPurify strips unreliably (even allowed tags), so the DOM-level tests
 * rely on SURVIVING text content, while the placeholder/mapping logic is covered by the
 * pure `resolveCustomTemplateHtml` (pre-sanitization string). In a real browser, DOMPurify
 * sanitizes according to the proper whitelist.
 */
describe('resolveCustomTemplateHtml (pre-sanitize substitution)', () => {
    it('substitutes {value} and {field}', () => {
        const config: CustomConfig = {
            type: 'custom',
            field: 'status',
            template: '<span>{field}={value}</span>',
        };
        expect(resolveCustomTemplateHtml(config, { status: 'active' })).toBe(
            '<span>status=active</span>'
        );
    });

    it('substitutes exact-match mapping placeholders ({class}/{icon})', () => {
        const config: CustomConfig = {
            type: 'custom',
            field: 'status',
            template: "<span class='{class}'>{icon} {value}</span>",
            mapping: {
                active: { class: 'text-success', icon: '✓' },
                inactive: { class: 'text-danger', icon: '✗' },
            },
        };
        expect(resolveCustomTemplateHtml(config, { status: 'active' })).toBe(
            "<span class='text-success'>✓ active</span>"
        );
    });

    it('resolves range ("min-max") mapping keys', () => {
        const config: CustomConfig = {
            type: 'custom',
            field: 'stock',
            template: '{label}',
            mapping: {
                '0': { label: 'Elfogyott' },
                '1-10': { label: 'Kevés' },
                '11-999': { label: 'Raktáron' },
            },
        };
        expect(resolveCustomTemplateHtml(config, { stock: 5 })).toBe('Kevés');
        expect(resolveCustomTemplateHtml(config, { stock: 500 })).toBe('Raktáron');
    });

    it('prefers an exact key over a range match', () => {
        const config: CustomConfig = {
            type: 'custom',
            field: 'stock',
            template: '{label}',
            mapping: { '0': { label: 'Elfogyott' }, '0-10': { label: 'Kevés' } },
        };
        expect(resolveCustomTemplateHtml(config, { stock: 0 })).toBe('Elfogyott');
    });

    it('replaces unknown placeholders with empty string', () => {
        const config: CustomConfig = {
            type: 'custom',
            field: 'x',
            template: '{value}[{missing}]',
        };
        expect(resolveCustomTemplateHtml(config, { x: 'A' })).toBe('A[]');
    });

    it('does not substitute prototype-polluting placeholder keys', () => {
        const entry: Record<string, string> = { label: 'ok' };
        Object.defineProperty(entry, 'constructor', { value: 'x', enumerable: true });
        const config: CustomConfig = {
            type: 'custom',
            field: 'status',
            template: '{label}:{constructor}',
            mapping: { active: entry },
        };
        expect(resolveCustomTemplateHtml(config, { status: 'active' })).toBe('ok:');
    });

    it('leaves placeholders empty when no mapping matches', () => {
        const config: CustomConfig = {
            type: 'custom',
            field: 'status',
            template: '{value}/{icon}',
            mapping: { active: { icon: '✓' } },
        };
        expect(resolveCustomTemplateHtml(config, { status: 'other' })).toBe('other/');
    });
});

describe('renderCustomNode', () => {
    const baseOptions: SegmentFormatOptions = { locale: 'en-US' };

    describe('default mode (no renderer/callback/template)', () => {
        it('renders the field value as text', async () => {
            const config: CustomConfig = { type: 'custom', field: 'name' };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { name: 'Anna' } };
            const wrapper = mountVNode(await renderCustomNode(config, options));
            expect(wrapper.find('span').exists()).toBe(true);
            expect(wrapper.text()).toBe('Anna');
        });

        it('falls back to the fixed value when no field', async () => {
            const config: CustomConfig = { type: 'custom', value: 'N/A' };
            const wrapper = mountVNode(await renderCustomNode(config, baseOptions));
            expect(wrapper.text()).toBe('N/A');
        });

        it('applies static formatting (uppercase)', async () => {
            const config: CustomConfig = { type: 'custom', field: 'code', uppercase: true };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { code: 'abc' } };
            const wrapper = mountVNode(await renderCustomNode(config, options));
            expect(wrapper.text()).toBe('ABC');
        });
    });

    describe('renderer mode', () => {
        it('calls the named host renderer with (value, row, config)', async () => {
            const renderer = vi.fn(() => 'Custom');
            const config: CustomConfig = { type: 'custom', field: 'x', renderer: 'myRenderer' };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { x: 'val' },
                renderers: { myRenderer: renderer },
            };
            const wrapper = mountVNode(await renderCustomNode(config, options));
            expect(renderer).toHaveBeenCalledWith(
                'val',
                { x: 'val' },
                expect.objectContaining({ type: 'custom' })
            );
            expect(wrapper.text()).toBe('Custom');
        });

        it('passes the resolved fields array as the first argument', async () => {
            const renderer = vi.fn(() => 'ok');
            const config: CustomConfig = {
                type: 'custom',
                fields: ['first', 'last'],
                renderer: 'r',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { first: 'Anna', last: 'Kovács' },
                renderers: { r: renderer },
            };
            await renderCustomNode(config, options);
            expect(renderer).toHaveBeenCalledWith(
                ['Anna', 'Kovács'],
                expect.any(Object),
                expect.any(Object)
            );
        });

        it('sanitizes a bare dangerous element from the renderer output', async () => {
            // Bare img+onerror: reliably disappears in happy-dom too (like the formatRaw XSS test).
            const renderer = () => '<img src=x onerror=alert(1)>';
            const config: CustomConfig = { type: 'custom', field: 'x', renderer: 'r' };
            const options: SegmentFormatOptions = { locale: 'en-US', renderers: { r: renderer } };
            const wrapper = mountVNode(await renderCustomNode(config, options));
            expect(wrapper.find('img').exists()).toBe(false);
            expect(wrapper.html()).not.toContain('onerror');
        });

        it('falls through to default when renderer name is unknown', async () => {
            const config: CustomConfig = { type: 'custom', field: 'x', renderer: 'missing' };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { x: 'val' },
                renderers: {},
            };
            const wrapper = mountVNode(await renderCustomNode(config, options));
            expect(wrapper.text()).toBe('val');
        });
    });

    describe('callback mode', () => {
        it('calls the named host callback and renders escaped text', async () => {
            const callback = vi.fn(() => '<b>raw</b>');
            const config: CustomConfig = {
                type: 'custom',
                field: 'price',
                callback: 'fmt',
                params: { currency: 'HUF' },
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { price: 100 },
                callbacks: { fmt: callback },
            };
            const wrapper = mountVNode(await renderCustomNode(config, options));
            expect(callback).toHaveBeenCalledWith(100, { price: 100 }, { currency: 'HUF' });
            // Text mode → the HTML is escaped, not injected (Vue text-child reliably escapes it)
            expect(wrapper.find('b').exists()).toBe(false);
            expect(wrapper.text()).toBe('<b>raw</b>');
        });

        it('passes an empty params object when none provided', async () => {
            const callback = vi.fn(() => 'x');
            const config: CustomConfig = { type: 'custom', field: 'a', callback: 'cb' };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { a: 1 },
                callbacks: { cb: callback },
            };
            await renderCustomNode(config, options);
            expect(callback).toHaveBeenCalledWith(1, { a: 1 }, {});
        });
    });

    describe('template mode (surviving text content)', () => {
        it('renders substituted mapping text', async () => {
            const config: CustomConfig = {
                type: 'custom',
                field: 'status',
                template: "<span class='{class}'>{icon} {value}</span>",
                mapping: { active: { class: 'text-success', icon: '✓' } },
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { status: 'active' } };
            const wrapper = mountVNode(await renderCustomNode(config, options));
            expect(wrapper.text()).toContain('✓ active');
        });

        it('strips a bare script element from the template', async () => {
            const config: CustomConfig = {
                type: 'custom',
                field: 'x',
                template: '<script>alert(1)</script>',
            };
            const options: SegmentFormatOptions = { locale: 'en-US', item: { x: 'safe' } };
            const wrapper = mountVNode(await renderCustomNode(config, options));
            expect(wrapper.html()).not.toContain('<script');
        });

        it('forwards data-* attributes with item placeholder substitution', async () => {
            const config: CustomConfig = {
                type: 'custom',
                field: 'name',
                template: '{value}',
                'data-id': '{id}',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { id: 42, name: 'Anna' },
            };
            const wrapper = mountVNode(await renderCustomNode(config, options));
            expect(wrapper.find('span').attributes('data-id')).toBe('42');
        });
    });

    describe('mode priority', () => {
        it('renderer wins over callback and template', async () => {
            const config: CustomConfig = {
                type: 'custom',
                field: 'x',
                renderer: 'r',
                callback: 'c',
                template: 'tpl',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { x: 'v' },
                renderers: { r: () => 'R' },
                callbacks: { c: () => 'C' },
            };
            const wrapper = mountVNode(await renderCustomNode(config, options));
            expect(wrapper.text()).toBe('R');
        });

        it('callback wins over template', async () => {
            const config: CustomConfig = {
                type: 'custom',
                field: 'x',
                callback: 'c',
                template: 'tpl',
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { x: 'v' },
                callbacks: { c: () => 'CB' },
            };
            const wrapper = mountVNode(await renderCustomNode(config, options));
            expect(wrapper.text()).toBe('CB');
        });
    });
});

describe('renderCustomNode — prototype-chain function names', () => {
    // Regression guard: `renderer`/`callback` are response-supplied strings, so a plain
    // bracket read into the host registry answered `constructor` with `Object` — a callable,
    // so the mode fired and the cell showed `[object Object]` instead of the real value.
    const PROTO_NAMES = ['constructor', 'toString', 'valueOf', 'hasOwnProperty', '__proto__'];

    it.each(PROTO_NAMES)('falls through to default for renderer name "%s"', async name => {
        const config: CustomConfig = { type: 'custom', field: 'x', renderer: name };
        const options: SegmentFormatOptions = {
            locale: 'en-US',
            item: { x: 'val' },
            renderers: {},
        };

        const wrapper = mountVNode(await renderCustomNode(config, options));
        expect(wrapper.text()).toBe('val');
    });

    it.each(PROTO_NAMES)('falls through to default for callback name "%s"', async name => {
        const config: CustomConfig = { type: 'custom', field: 'x', callback: name };
        const options: SegmentFormatOptions = {
            locale: 'en-US',
            item: { x: 'val' },
            callbacks: {},
        };

        const wrapper = mountVNode(await renderCustomNode(config, options));
        expect(wrapper.text()).toBe('val');
    });

    it('still calls an own registry entry that shadows a prototype member', async () => {
        const callback = vi.fn(() => 'formatted');
        const config: CustomConfig = { type: 'custom', field: 'x', callback: 'toString' };
        const options: SegmentFormatOptions = {
            locale: 'en-US',
            item: { x: 'val' },
            callbacks: { toString: callback },
        };

        const wrapper = mountVNode(await renderCustomNode(config, options));
        expect(callback).toHaveBeenCalled();
        expect(wrapper.text()).toBe('formatted');
    });

    it('prefers the template mode over a prototype-named renderer', async () => {
        const config: CustomConfig = {
            type: 'custom',
            field: 'x',
            renderer: 'constructor',
            template: '<span>{value}</span>',
        };
        const options: SegmentFormatOptions = {
            locale: 'en-US',
            item: { x: 'val' },
            renderers: {},
        };

        const wrapper = mountVNode(await renderCustomNode(config, options));
        expect(wrapper.text()).toBe('val');
    });
});
