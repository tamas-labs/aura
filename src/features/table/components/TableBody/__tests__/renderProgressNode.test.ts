import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, type VNode } from 'vue';
import { renderProgressNode } from '../renderProgressNode';
import type { ProgressConfig } from '../../../../../types/api-response.types';

/** Mounts a VNode in an isolated wrapper for DOM inspection. */
function mountVNode(vnode: VNode) {
    return mount(defineComponent({ render: () => vnode }), { attachTo: document.body });
}

const EN = 'en-US';

/** Reads the inline width (e.g. "72%") from the first .progress-bar. */
function barWidth(wrapper: ReturnType<typeof mountVNode>): string | undefined {
    const bar = wrapper.find('.progress-bar').element as HTMLElement;
    return bar.style.width;
}

describe('renderProgressNode', () => {
    describe('value / percentage', () => {
        it('should fill to field value as a percentage of default max 100', () => {
            const config: ProgressConfig = { type: 'progress', field: 'rate', variant: 'success' };
            const wrapper = mountVNode(
                renderProgressNode(config, { locale: EN, item: { rate: 72 } })
            );
            expect(wrapper.find('.progress').exists()).toBe(true);
            expect(wrapper.find('.progress-bar').classes()).toContain('bg-success');
            expect(barWidth(wrapper)).toBe('72%');
        });

        it('should render a static value bar', () => {
            const config: ProgressConfig = { type: 'progress', value: 65 };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN }));
            expect(barWidth(wrapper)).toBe('65%');
        });

        it('should compute percentage against a numeric max', () => {
            const config: ProgressConfig = { type: 'progress', field: 'used', max: 200 };
            const wrapper = mountVNode(
                renderProgressNode(config, { locale: EN, item: { used: 50 } })
            );
            expect(barWidth(wrapper)).toBe('25%');
        });

        it('should resolve max from a field name', () => {
            const config: ProgressConfig = { type: 'progress', field: 'used', max: 'total' };
            const wrapper = mountVNode(
                renderProgressNode(config, { locale: EN, item: { used: 30, total: 120 } })
            );
            expect(barWidth(wrapper)).toBe('25%');
        });

        it('should honour min in the percentage calculation', () => {
            const config: ProgressConfig = { type: 'progress', field: 'v', min: 50, max: 150 };
            const wrapper = mountVNode(
                renderProgressNode(config, { locale: EN, item: { v: 100 } })
            );
            expect(barWidth(wrapper)).toBe('50%');
        });

        it('should clamp above max to 100% and below min to 0%', () => {
            const over = mountVNode(
                renderProgressNode(
                    { type: 'progress', field: 'v' },
                    { locale: EN, item: { v: 250 } }
                )
            );
            expect(barWidth(over)).toBe('100%');
            const under = mountVNode(
                renderProgressNode(
                    { type: 'progress', field: 'v', min: 10 },
                    { locale: EN, item: { v: 5 } }
                )
            );
            expect(barWidth(under)).toBe('0%');
        });

        it('should yield 0% when max === min (division-by-zero guard)', () => {
            const config: ProgressConfig = { type: 'progress', field: 'v', min: 40, max: 40 };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { v: 40 } }));
            expect(barWidth(wrapper)).toBe('0%');
        });

        it('should treat a non-numeric value as 0', () => {
            const config: ProgressConfig = { type: 'progress', field: 'v' };
            const wrapper = mountVNode(
                renderProgressNode(config, { locale: EN, item: { v: 'x' } })
            );
            expect(barWidth(wrapper)).toBe('0%');
        });

        it('should fall back to max 100 when the max field is missing', () => {
            const config: ProgressConfig = { type: 'progress', field: 'v', max: 'missing' };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { v: 40 } }));
            expect(barWidth(wrapper)).toBe('40%');
        });

        it('should set ARIA attributes on the track', () => {
            const config: ProgressConfig = { type: 'progress', field: 'v', max: 200 };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { v: 50 } }));
            const track = wrapper.find('.progress').element as HTMLElement;
            expect(track.getAttribute('role')).toBe('progressbar');
            expect(track.getAttribute('aria-valuenow')).toBe('50');
            expect(track.getAttribute('aria-valuemin')).toBe('0');
            expect(track.getAttribute('aria-valuemax')).toBe('200');
        });
    });

    describe('colour resolution priority (mapping → thresholds → variant → primary)', () => {
        it('should default to bg-primary when nothing resolves', () => {
            const wrapper = mountVNode(
                renderProgressNode(
                    { type: 'progress', field: 'v' },
                    { locale: EN, item: { v: 10 } }
                )
            );
            expect(wrapper.find('.progress-bar').classes()).toContain('bg-primary');
        });

        it('should use config variant when no mapping/threshold matches', () => {
            const wrapper = mountVNode(
                renderProgressNode(
                    { type: 'progress', field: 'v', variant: 'info' },
                    { locale: EN, item: { v: 10 } }
                )
            );
            expect(wrapper.find('.progress-bar').classes()).toContain('bg-info');
        });

        it('should colour by a matching thresholds range', () => {
            const config: ProgressConfig = {
                type: 'progress',
                field: 'cpu',
                thresholds: { success: [0, 50], warning: [51, 80], danger: [81, 100] },
            };
            const wrapper = mountVNode(
                renderProgressNode(config, { locale: EN, item: { cpu: 72 } })
            );
            expect(wrapper.find('.progress-bar').classes()).toContain('bg-warning');
        });

        it('should colour and label by a matching mapping range', () => {
            const config: ProgressConfig = {
                type: 'progress',
                field: 'p',
                mapping: {
                    '0-25': { variant: 'danger', label: 'Kezdeti' },
                    '76-100': { variant: 'success' },
                },
            };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { p: 10 } }));
            expect(wrapper.find('.progress-bar').classes()).toContain('bg-danger');
            expect(wrapper.text()).toContain('Kezdeti');
        });

        it('should prefer mapping over thresholds and variant', () => {
            const config: ProgressConfig = {
                type: 'progress',
                field: 'p',
                variant: 'secondary',
                mapping: { '51-75': { variant: 'info' } },
                thresholds: { warning: [51, 80] },
            };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { p: 70 } }));
            expect(wrapper.find('.progress-bar').classes()).toContain('bg-info');
        });

        it('should fall through to thresholds when the mapping entry has no variant', () => {
            const config: ProgressConfig = {
                type: 'progress',
                field: 'p',
                mapping: { '51-75': { label: 'Haladó' } },
                thresholds: { warning: [51, 80] },
            };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { p: 70 } }));
            expect(wrapper.find('.progress-bar').classes()).toContain('bg-warning');
            expect(wrapper.text()).toContain('Haladó');
        });
    });

    describe('label (label is master)', () => {
        it('should substitute {value}/{max}/{percent} with decimals in a template', () => {
            const config: ProgressConfig = {
                type: 'progress',
                field: 'used',
                max: 'total',
                decimals: 1,
                label: '{value}/{max} GB ({percent}%)',
            };
            const wrapper = mountVNode(
                renderProgressNode(config, { locale: EN, item: { used: 30, total: 120 } })
            );
            expect(wrapper.text()).toBe('30.0/120.0 GB (25.0%)');
        });

        it('should show the percent for label:true', () => {
            const config: ProgressConfig = { type: 'progress', field: 'v', label: true };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { v: 70 } }));
            expect(wrapper.text()).toBe('70%');
        });

        it('should use prefix + custom suffix for label:true', () => {
            const config: ProgressConfig = {
                type: 'progress',
                field: 'v',
                label: true,
                prefix: '~',
                suffix: ' pct',
            };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { v: 70 } }));
            expect(wrapper.text()).toBe('~70 pct');
        });

        it('should render no label by default (label absent)', () => {
            const config: ProgressConfig = { type: 'progress', field: 'v' };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { v: 70 } }));
            expect(wrapper.find('.progress-bar').text()).toBe('');
        });

        it('should build a label from showValue/showPercent when no explicit label', () => {
            const config: ProgressConfig = {
                type: 'progress',
                field: 'v',
                showValue: true,
                showPercent: true,
                suffix: ' MB',
            };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { v: 40 } }));
            expect(wrapper.text()).toBe('40 MB 40%');
        });

        it('should let a matched mapping label win over the config label', () => {
            const config: ProgressConfig = {
                type: 'progress',
                field: 'p',
                label: true,
                mapping: { '0-25': { variant: 'danger', label: 'Kezdeti' } },
            };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { p: 10 } }));
            expect(wrapper.text()).toContain('Kezdeti');
        });

        it('should place the label outside the bar for labelPosition:outside', () => {
            const config: ProgressConfig = {
                type: 'progress',
                field: 'v',
                label: true,
                labelPosition: 'outside',
            };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { v: 70 } }));
            expect(wrapper.find('.progress-bar').text()).toBe('');
            expect(wrapper.find('.progress-label').text()).toBe('70%');
        });
    });

    describe('styling', () => {
        it('should add striped and animated modifiers (animated only with striped)', () => {
            const striped = mountVNode(
                renderProgressNode(
                    { type: 'progress', field: 'v', striped: true, animated: true },
                    { locale: EN, item: { v: 50 } }
                )
            );
            const cls = striped.find('.progress-bar').classes();
            expect(cls).toContain('progress-bar-striped');
            expect(cls).toContain('progress-bar-animated');

            const noStripe = mountVNode(
                renderProgressNode(
                    { type: 'progress', field: 'v', animated: true },
                    { locale: EN, item: { v: 50 } }
                )
            );
            expect(noStripe.find('.progress-bar').classes()).not.toContain('progress-bar-animated');
        });

        it('should apply a height style on the track', () => {
            const config: ProgressConfig = { type: 'progress', field: 'v', height: '20px' };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { v: 50 } }));
            const track = wrapper.find('.progress').element as HTMLElement;
            expect(track.style.height).toBe('20px');
        });

        it('should apply content styling (fontWeight) to the bar', () => {
            const config: ProgressConfig = {
                type: 'progress',
                field: 'v',
                label: true,
                fontWeight: 'bold',
            };
            const wrapper = mountVNode(renderProgressNode(config, { locale: EN, item: { v: 50 } }));
            const bar = wrapper.find('.progress-bar').element as HTMLElement;
            expect(bar.style.fontWeight).toBe('bold');
        });

        it('should forward data-* attributes with {field} substitution onto a wrapper', () => {
            const config: ProgressConfig = {
                type: 'progress',
                field: 'v',
                'data-id': '{id}',
            } as ProgressConfig;
            const wrapper = mountVNode(
                renderProgressNode(config, { locale: EN, item: { v: 50, id: 7 } })
            );
            const root = wrapper.element as HTMLElement;
            expect(root.getAttribute('data-id')).toBe('7');
            expect(root.querySelector('.progress')).not.toBeNull();
        });
    });

    describe('stacked mode', () => {
        it('should auto-normalise bar widths to their share of the sum', () => {
            const config: ProgressConfig = {
                type: 'progress',
                stacked: true,
                bars: [
                    { field: 'a', variant: 'success' },
                    { field: 'b', variant: 'warning' },
                ],
            };
            const wrapper = mountVNode(
                renderProgressNode(config, { locale: EN, item: { a: 60, b: 60 } })
            );
            expect(wrapper.find('.progress-stacked').exists()).toBe(true);
            const segments = wrapper.findAll('.progress');
            expect((segments[0]!.element as HTMLElement).style.width).toBe('50%');
            expect((segments[1]!.element as HTMLElement).style.width).toBe('50%');
            expect(wrapper.find('.progress-bar').classes()).toContain('bg-success');
        });

        it('should render bar labels and preserve absolute proportions', () => {
            const config: ProgressConfig = {
                type: 'progress',
                stacked: true,
                bars: [
                    { field: 'sold', variant: 'success', label: 'Eladott' },
                    { field: 'free', variant: 'secondary', label: 'Szabad' },
                ],
            };
            const wrapper = mountVNode(
                renderProgressNode(config, { locale: EN, item: { sold: 30, free: 70 } })
            );
            const segments = wrapper.findAll('.progress');
            expect((segments[0]!.element as HTMLElement).style.width).toBe('30%');
            expect((segments[1]!.element as HTMLElement).style.width).toBe('70%');
            expect(wrapper.text()).toContain('Eladott');
            expect(wrapper.text()).toContain('Szabad');
        });

        it('should render 0% widths when the bar sum is 0', () => {
            const config: ProgressConfig = {
                type: 'progress',
                stacked: true,
                bars: [{ field: 'a' }, { field: 'b' }],
            };
            const wrapper = mountVNode(
                renderProgressNode(config, { locale: EN, item: { a: 0, b: 0 } })
            );
            const segments = wrapper.findAll('.progress');
            expect((segments[0]!.element as HTMLElement).style.width).toBe('0%');
        });
    });
});
