import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, type VNode } from 'vue';
import { renderBadgeNode } from '../renderBadgeNode';
import type { BadgeConfig } from '../../../../../types/api-response.types';
import type { SegmentFormatOptions } from '../segment-renderer.types';

/** Mounts a VNode in an isolated wrapper for DOM inspection. */
function mountVNode(vnode: VNode) {
    return mount(defineComponent({ render: () => vnode }), { attachTo: document.body });
}

const ICON_REGISTRY = {
    check: ['fas', 'fa-check'],
    clock: ['fas', 'fa-clock'],
    primary: ['fas', 'fa-file'],
};

const EN = 'en-US';

describe('renderBadgeNode', () => {
    describe('static / plain mode', () => {
        it('should render a <span class="badge text-bg-{variant}"> from a field value', async () => {
            const config: BadgeConfig = { type: 'badge', field: 'status', variant: 'success' };
            const options: SegmentFormatOptions = { locale: EN, item: { status: 'Active' } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            const span = wrapper.find('span');
            expect(span.exists()).toBe(true);
            expect(span.classes()).toEqual(expect.arrayContaining(['badge', 'text-bg-success']));
            expect(span.text()).toBe('Active');
        });

        it('should render a fixed value badge (static mode)', async () => {
            const config: BadgeConfig = { type: 'badge', value: 'ÚJ', variant: 'danger' };
            const wrapper = mountVNode(await renderBadgeNode(config, { locale: EN }));
            expect(wrapper.text()).toBe('ÚJ');
            expect(wrapper.find('span').classes()).toContain('text-bg-danger');
        });

        it('should apply the static formatter chain (uppercase) to the label', async () => {
            const config: BadgeConfig = { type: 'badge', field: 'status', uppercase: true };
            const options: SegmentFormatOptions = { locale: EN, item: { status: 'active' } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.text()).toBe('ACTIVE');
        });

        it('should render no colour class when no variant is set', async () => {
            const config: BadgeConfig = { type: 'badge', value: 'plain' };
            const wrapper = mountVNode(await renderBadgeNode(config, { locale: EN }));
            const classes = wrapper.find('span').classes();
            expect(classes).toContain('badge');
            expect(classes.some(c => c.startsWith('text-bg-'))).toBe(false);
        });
    });

    describe('styling flags', () => {
        it('should add rounded-pill and badge-{size} utilities', async () => {
            const config: BadgeConfig = { type: 'badge', value: 'X', pill: true, size: 'lg' };
            const wrapper = mountVNode(await renderBadgeNode(config, { locale: EN }));
            const classes = wrapper.find('span').classes();
            expect(classes).toContain('rounded-pill');
            expect(classes).toContain('badge-lg');
        });
    });

    describe('mapping mode', () => {
        it('should resolve variant and label from a mapping entry', async () => {
            const config: BadgeConfig = {
                type: 'badge',
                field: 'priority',
                mapping: { high: { variant: 'danger', label: 'Magas' } },
            };
            const options: SegmentFormatOptions = { locale: EN, item: { priority: 'high' } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            const span = wrapper.find('span');
            expect(span.classes()).toContain('text-bg-danger');
            expect(span.text()).toBe('Magas');
        });

        it('should fall back to the raw value + config variant on a mapping miss', async () => {
            const config: BadgeConfig = {
                type: 'badge',
                field: 'priority',
                variant: 'info',
                mapping: { high: { variant: 'danger' } },
            };
            const options: SegmentFormatOptions = { locale: EN, item: { priority: 'unknown' } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            const span = wrapper.find('span');
            expect(span.text()).toBe('unknown');
            expect(span.classes()).toContain('text-bg-info');
        });

        it.each(['toString', 'valueOf', 'constructor'])(
            'should treat the inherited key %s as a mapping miss',
            async value => {
                // A plain `mapping[value]` read finds a function on Object.prototype,
                // which is truthy — the badge was then built from that "entry" and lost
                // the miss branch's `secondary` fallback, rendering an unstyled badge.
                const config: BadgeConfig = {
                    type: 'badge',
                    field: 'priority',
                    mapping: { high: { variant: 'danger' } },
                };
                const options: SegmentFormatOptions = { locale: EN, item: { priority: value } };
                const wrapper = mountVNode(await renderBadgeNode(config, options));
                const span = wrapper.find('span');

                expect(span.text()).toBe(value);
                expect(span.classes()).toContain('text-bg-secondary');
            }
        );

        it('should fall back to secondary variant when the config has no variant', async () => {
            const config: BadgeConfig = {
                type: 'badge',
                field: 'priority',
                mapping: { high: { variant: 'danger' } },
            };
            const options: SegmentFormatOptions = { locale: EN, item: { priority: 'other' } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.find('span').classes()).toContain('text-bg-secondary');
        });

        it('should use the raw value as label when the mapping entry has no label', async () => {
            const config: BadgeConfig = {
                type: 'badge',
                field: 'priority',
                mapping: { low: { variant: 'secondary' } },
            };
            const options: SegmentFormatOptions = { locale: EN, item: { priority: 'low' } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.text()).toBe('low');
        });

        it('should apply the mapping entry class', async () => {
            const config: BadgeConfig = {
                type: 'badge',
                field: 'priority',
                mapping: { high: { variant: 'danger', class: 'fw-bold' } },
            };
            const options: SegmentFormatOptions = { locale: EN, item: { priority: 'high' } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.find('span').classes()).toContain('fw-bold');
        });
    });

    describe('boolean mode (trueValue / falseValue)', () => {
        it('should use trueValue when the value is truthy', async () => {
            const config: BadgeConfig = {
                type: 'badge',
                field: 'isVerified',
                trueValue: { label: 'Ellenőrizve', variant: 'success', icon: 'check' },
                falseValue: { label: 'Függőben', variant: 'warning', icon: 'clock' },
            };
            const options: SegmentFormatOptions = {
                locale: EN,
                item: { isVerified: true },
                icons: ICON_REGISTRY,
            };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            const span = wrapper.find('span');
            expect(span.classes()).toContain('text-bg-success');
            expect(span.text()).toBe('Ellenőrizve');
            expect(wrapper.find('i').classes()).toEqual(
                expect.arrayContaining(['fas', 'fa-check'])
            );
        });

        it('should use falseValue when the value is falsy', async () => {
            const config: BadgeConfig = {
                type: 'badge',
                field: 'isVerified',
                trueValue: { label: 'Yes', variant: 'success' },
                falseValue: { label: 'No', variant: 'warning' },
            };
            const options: SegmentFormatOptions = { locale: EN, item: { isVerified: false } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.find('span').classes()).toContain('text-bg-warning');
            expect(wrapper.text()).toBe('No');
        });

        it('should treat the string "0" as falsy', async () => {
            const config: BadgeConfig = {
                type: 'badge',
                field: 'flag',
                trueValue: { label: 'On', variant: 'success' },
                falseValue: { label: 'Off', variant: 'secondary' },
            };
            const options: SegmentFormatOptions = { locale: EN, item: { flag: '0' } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.text()).toBe('Off');
        });

        it('should hide the badge when only the non-matching branch is configured', async () => {
            const config: BadgeConfig = {
                type: 'badge',
                field: 'flag',
                trueValue: { label: 'On', variant: 'success' },
            };
            const options: SegmentFormatOptions = { locale: EN, item: { flag: false } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.text()).toBe('');
            expect(wrapper.find('span').attributes('style')).toContain('display: none');
        });
    });

    describe('counter mode', () => {
        it('should render the number with prefix and suffix', async () => {
            const config: BadgeConfig = {
                type: 'badge',
                field: 'count',
                prefix: '#',
                variant: 'primary',
            };
            const options: SegmentFormatOptions = { locale: EN, item: { count: 7 } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.text()).toBe('#7');
        });

        it('should clamp to {maxValue}{suffix} when the value exceeds maxValue', async () => {
            const config: BadgeConfig = {
                type: 'badge',
                field: 'count',
                maxValue: 9,
                suffix: '+',
                variant: 'primary',
            };
            const options: SegmentFormatOptions = { locale: EN, item: { count: 15 } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.text()).toBe('9+');
        });

        it('should render the exact value when at or below maxValue', async () => {
            const config: BadgeConfig = { type: 'badge', field: 'count', maxValue: 9, suffix: '+' };
            const options: SegmentFormatOptions = { locale: EN, item: { count: 5 } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.text()).toBe('5');
        });

        it('should hide the badge at 0 when showZero is false', async () => {
            const config: BadgeConfig = { type: 'badge', field: 'count', showZero: false };
            const options: SegmentFormatOptions = { locale: EN, item: { count: 0 } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.text()).toBe('');
            expect(wrapper.find('span').attributes('style')).toContain('display: none');
        });

        it('should render 0 when showZero is not disabled', async () => {
            const config: BadgeConfig = { type: 'badge', field: 'count' };
            const options: SegmentFormatOptions = { locale: EN, item: { count: 0 } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.text()).toBe('0');
        });
    });

    describe('icon support (config.icons registry)', () => {
        it('should place the icon after the text when iconPosition is "end"', async () => {
            const config: BadgeConfig = {
                type: 'badge',
                value: 'Done',
                icon: 'check',
                iconPosition: 'end',
                variant: 'success',
            };
            const options: SegmentFormatOptions = { locale: EN, icons: ICON_REGISTRY };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.find('span').element.lastElementChild?.tagName).toBe('I');
        });

        it('should fall back to icons.primary for an unknown icon key', async () => {
            const config: BadgeConfig = { type: 'badge', value: 'X', icon: 'unknownKey' };
            const options: SegmentFormatOptions = { locale: EN, icons: ICON_REGISTRY };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.find('i').classes()).toEqual(expect.arrayContaining(['fas', 'fa-file']));
        });
    });

    describe('data-* attributes', () => {
        it('should forward data-* attributes with {field} placeholder substitution', async () => {
            const config = {
                type: 'badge',
                value: 'X',
                'data-count': '{count}',
            } as unknown as BadgeConfig;
            const options: SegmentFormatOptions = { locale: EN, item: { count: 42 } };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.find('span').attributes('data-count')).toBe('42');
        });
    });

    describe('sanitization', () => {
        it('should escape HTML in the label (text content, not innerHTML)', async () => {
            const config: BadgeConfig = { type: 'badge', field: 'status' };
            const options: SegmentFormatOptions = {
                locale: EN,
                item: { status: '<script>alert(1)</script>' },
            };
            const wrapper = mountVNode(await renderBadgeNode(config, options));
            expect(wrapper.find('span').element.querySelector('script')).toBeNull();
            expect(wrapper.text()).toContain('alert(1)');
        });
    });
});
