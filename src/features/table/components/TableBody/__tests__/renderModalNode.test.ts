import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, type VNode } from 'vue';
import { renderModalNode } from '../renderModalNode';
import type { ModalConfig } from '../../../../../types/api-response.types';
import type { SegmentFormatOptions } from '../segment-renderer.types';

/** Mounts a VNode in an isolated wrapper for DOM inspection. */
function mountVNode(vnode: VNode) {
    return mount(defineComponent({ render: () => vnode }), { attachTo: document.body });
}

describe('renderModalNode', () => {
    const baseOptions: SegmentFormatOptions = { locale: 'en-US' };

    // -------------------------------------------------------------------------
    // empty/fallback cases
    // -------------------------------------------------------------------------
    describe('fallback to empty span', () => {
        it('should render empty <span> when content is not set', async () => {
            const config: ModalConfig = { type: 'modal', id: 'test-modal' };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('span').exists()).toBe(true);
            expect(wrapper.find('a').exists()).toBe(false);
            expect(wrapper.find('button').exists()).toBe(false);
        });

        it('should render empty <span> when id is not set', async () => {
            const config: ModalConfig = {
                type: 'modal',
                content: { type: 'icon', class: ['fas', 'fa-eye'] },
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('span').exists()).toBe(true);
            expect(wrapper.find('a').exists()).toBe(false);
        });

        it('should render empty <span> when id is null', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: null,
                content: { type: 'icon', class: ['fas', 'fa-eye'] },
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('span').exists()).toBe(true);
        });

        it('should render empty <span> when content is null', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'test-modal',
                content: null,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('span').exists()).toBe(true);
        });

        it('should render empty <span> when content type is unknown', async () => {
            const config = {
                type: 'modal',
                id: 'test-modal',
                content: { type: 'unknown-type' },
            } as unknown as ModalConfig;
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('span').exists()).toBe(true);
        });
    });

    // -------------------------------------------------------------------------
    // icon trigger
    // -------------------------------------------------------------------------
    describe('icon trigger (content.type === "icon")', () => {
        it('should render <a> wrapping <i> for icon content', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'edit-modal',
                content: { type: 'icon', class: ['fas', 'fa-pencil'] },
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('a').exists()).toBe(true);
            expect(wrapper.find('a').find('i').exists()).toBe(true);
        });

        it('should set data-bs-toggle="modal" on the <a> element', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'edit-modal',
                content: { type: 'icon', class: ['fas', 'fa-pencil'] },
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('a').attributes('data-bs-toggle')).toBe('modal');
        });

        it('should set data-bs-target="#edit-modal" on the <a> element', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'edit-modal',
                content: { type: 'icon', class: ['fas', 'fa-pencil'] },
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('a').attributes('data-bs-target')).toBe('#edit-modal');
        });

        it('should set role="button" on the <a> element', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'edit-modal',
                content: { type: 'icon', class: ['fas', 'fa-pencil'] },
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('a').attributes('role')).toBe('button');
        });

        it('should apply icon class array to the <i> element', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'edit-modal',
                content: { type: 'icon', class: ['fas', 'fa-pencil', 'text-primary'] },
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));
            const iconEl = wrapper.find('i');

            expect(iconEl.classes()).toContain('fas');
            expect(iconEl.classes()).toContain('fa-pencil');
            expect(iconEl.classes()).toContain('text-primary');
        });

        it('should apply icon title as title attribute on <i>', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'edit-modal',
                content: { type: 'icon', class: ['fas', 'fa-pencil'], title: 'Edit item' },
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('i').attributes('title')).toBe('Edit item');
        });

        it('should apply content alt as aria-label on <i>', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'edit-modal',
                content: { type: 'icon', class: ['fas', 'fa-pencil'], alt: 'Edit' },
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('i').attributes('aria-label')).toBe('Edit');
        });

        it('should not have data-route when route is not set', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'edit-modal',
                content: { type: 'icon', class: ['fas', 'fa-pencil'] },
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('a').attributes('data-route')).toBeUndefined();
        });
    });

    // -------------------------------------------------------------------------
    // button trigger
    // -------------------------------------------------------------------------
    describe('button trigger (content.type === "button")', () => {
        it('should render <button> for button content', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'confirm-modal',
                content: { type: 'button', variant: 'danger', value: 'Delete' } as any,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('button').exists()).toBe(true);
        });

        it('should set data-bs-toggle="modal" on the <button>', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'confirm-modal',
                content: { type: 'button', variant: 'danger', value: 'Delete' } as any,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('button').attributes('data-bs-toggle')).toBe('modal');
        });

        it('should set data-bs-target="#confirm-modal" on the <button>', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'confirm-modal',
                content: { type: 'button', variant: 'danger', value: 'Delete' } as any,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('button').attributes('data-bs-target')).toBe('#confirm-modal');
        });

        it('should apply btn and btn-{variant} classes to <button>', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'confirm-modal',
                content: { type: 'button', variant: 'danger', value: 'Delete' } as any,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));
            const btn = wrapper.find('button');

            expect(btn.classes()).toContain('btn');
            expect(btn.classes()).toContain('btn-danger');
        });

        it('should apply btn-{size} class when size is set', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'confirm-modal',
                content: { type: 'button', variant: 'primary', value: 'Open', size: 'sm' } as any,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('button').classes()).toContain('btn-sm');
        });

        it('should render button text as text content', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'confirm-modal',
                content: { type: 'button', variant: 'warning', value: 'Confirm' } as any,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('button').text()).toBe('Confirm');
        });

        it('should set type="button" on the <button>', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'confirm-modal',
                content: { type: 'button', variant: 'primary', value: 'OK' } as any,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('button').attributes('type')).toBe('button');
        });
    });

    // -------------------------------------------------------------------------
    // link trigger
    // -------------------------------------------------------------------------
    describe('link trigger (content.type === "link")', () => {
        it('should render <a> for link content', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'info-modal',
                content: { type: 'link', value: 'View details' } as any,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('a').exists()).toBe(true);
        });

        it('should set href="#" on the link trigger', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'info-modal',
                content: { type: 'link', value: 'View details' } as any,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('a').attributes('href')).toBe('#');
        });

        it('should set role="button" on the link trigger', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'info-modal',
                content: { type: 'link', value: 'View details' } as any,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('a').attributes('role')).toBe('button');
        });

        it('should set data-bs-toggle="modal" and data-bs-target on link trigger', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'info-modal',
                content: { type: 'link', value: 'View details' } as any,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('a').attributes('data-bs-toggle')).toBe('modal');
            expect(wrapper.find('a').attributes('data-bs-target')).toBe('#info-modal');
        });

        it('should render link text as text content', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'info-modal',
                content: { type: 'link', value: 'View details' } as any,
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('a').text()).toBe('View details');
        });
    });

    // -------------------------------------------------------------------------
    // route resolution → data-route
    // -------------------------------------------------------------------------
    describe('route resolution', () => {
        it('should set data-route when route and item are provided', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'edit-modal',
                route: 'items.{id}',
                content: { type: 'icon', class: ['fas', 'fa-edit'] },
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { id: 42 },
            };
            const wrapper = mountVNode(renderModalNode(config, options));

            expect(wrapper.find('a').attributes('data-route')).toBe('/items/42');
        });

        it('should prepend siteName to data-route when provided', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'edit-modal',
                route: 'items.{id}',
                content: { type: 'icon', class: ['fas', 'fa-edit'] },
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { id: 5 },
                siteName: 'https://app.example.com',
            };
            const wrapper = mountVNode(renderModalNode(config, options));

            expect(wrapper.find('a').attributes('data-route')).toBe(
                'https://app.example.com/items/5'
            );
        });

        it('should not set data-route when route is set but item is not provided', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'edit-modal',
                route: 'items.{id}',
                content: { type: 'icon', class: ['fas', 'fa-edit'] },
            };
            const wrapper = mountVNode(renderModalNode(config, baseOptions));

            expect(wrapper.find('a').attributes('data-route')).toBeUndefined();
        });

        it('should not set data-route when item is provided but route is not set', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'edit-modal',
                content: { type: 'icon', class: ['fas', 'fa-edit'] },
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { id: 42 },
            };
            const wrapper = mountVNode(renderModalNode(config, options));

            expect(wrapper.find('a').attributes('data-route')).toBeUndefined();
        });

        it('should set data-route on button trigger when route matches', async () => {
            const config: ModalConfig = {
                type: 'modal',
                id: 'confirm-modal',
                route: 'items.{id}',
                content: { type: 'button', variant: 'primary', value: 'Open' } as any,
            };
            const options: SegmentFormatOptions = {
                locale: 'en-US',
                item: { id: 7 },
            };
            const wrapper = mountVNode(renderModalNode(config, options));

            expect(wrapper.find('button').attributes('data-route')).toBe('/items/7');
        });
    });

    // -------------------------------------------------------------------------
    // global classes from options.globalClasses
    // -------------------------------------------------------------------------
    describe('global classes from options.globalClasses', () => {
        describe('icon trigger', () => {
            it('should apply globalClasses.icon to <i> after content classes', async () => {
                const config: ModalConfig = {
                    type: 'modal',
                    id: 'edit-modal',
                    content: { type: 'icon', class: ['fas', 'fa-pencil'] },
                };
                const options: SegmentFormatOptions = {
                    locale: 'en-US',
                    globalClasses: { icon: ['mx-2'] },
                };
                const wrapper = mountVNode(renderModalNode(config, options));
                const iconEl = wrapper.find('i');
                expect(iconEl.classes()).toContain('fas');
                expect(iconEl.classes()).toContain('fa-pencil');
                expect(iconEl.classes()).toContain('mx-2');
            });

            it('should not add extra classes to icon trigger when globalClasses is undefined', async () => {
                const config: ModalConfig = {
                    type: 'modal',
                    id: 'edit-modal',
                    content: { type: 'icon', class: ['fas', 'fa-pencil'] },
                };
                const wrapper = mountVNode(renderModalNode(config, baseOptions));
                expect(wrapper.find('i').classes()).toEqual(['fas', 'fa-pencil']);
            });
        });

        describe('button trigger', () => {
            it('should apply globalClasses.button to <button> after btn classes', async () => {
                const config: ModalConfig = {
                    type: 'modal',
                    id: 'confirm-modal',
                    content: { type: 'button', variant: 'primary', value: 'OK' } as any,
                };
                const options: SegmentFormatOptions = {
                    locale: 'en-US',
                    globalClasses: { button: ['mx-1'] },
                };
                const wrapper = mountVNode(renderModalNode(config, options));
                const btn = wrapper.find('button');
                expect(btn.classes()).toContain('btn');
                expect(btn.classes()).toContain('btn-primary');
                expect(btn.classes()).toContain('mx-1');
            });

            it('should not apply globalClasses.icon to button trigger', async () => {
                const config: ModalConfig = {
                    type: 'modal',
                    id: 'confirm-modal',
                    content: { type: 'button', variant: 'danger', value: 'Delete' } as any,
                };
                const options: SegmentFormatOptions = {
                    locale: 'en-US',
                    globalClasses: { icon: ['mx-2'] },
                };
                const wrapper = mountVNode(renderModalNode(config, options));
                expect(wrapper.find('button').classes()).not.toContain('mx-2');
            });
        });

        describe('link trigger', () => {
            it('should apply globalClasses.link to <a> element', async () => {
                const config: ModalConfig = {
                    type: 'modal',
                    id: 'info-modal',
                    content: { type: 'link', value: 'View details' } as any,
                };
                const options: SegmentFormatOptions = {
                    locale: 'en-US',
                    globalClasses: { link: ['mx-1'] },
                };
                const wrapper = mountVNode(renderModalNode(config, options));
                expect(wrapper.find('a').classes()).toContain('mx-1');
            });

            it('should not set class attribute on link trigger when globalClasses is undefined', async () => {
                const config: ModalConfig = {
                    type: 'modal',
                    id: 'info-modal',
                    content: { type: 'link', value: 'View details' } as any,
                };
                const wrapper = mountVNode(renderModalNode(config, baseOptions));
                expect(wrapper.find('a').attributes('class')).toBeUndefined();
            });
        });
    });
    // -------------------------------------------------------------------------
    // keyboard accessibility
    // -------------------------------------------------------------------------
    describe('keyboard accessibility', () => {
        const ICON_CONFIG: ModalConfig = {
            type: 'modal',
            id: 'edit-modal',
            content: { type: 'icon', class: ['fas', 'fa-pencil'] },
        };
        const LINK_CONFIG: ModalConfig = {
            type: 'modal',
            id: 'info-modal',
            content: { type: 'link', value: 'View details' } as never,
        };

        /**
         * Sends a keydown to the trigger and reports what the element did with it.
         * Bootstrap opens the modal from a delegated CLICK listener, so "activated"
         * means a click event reached the trigger.
         */
        function pressKey(config: ModalConfig, key: string) {
            const wrapper = mountVNode(renderModalNode(config, baseOptions));
            const element = wrapper.find('a').element;
            const onClick = vi.fn();
            element.addEventListener('click', onClick);

            const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
            element.dispatchEvent(event);

            return { clicks: onClick.mock.calls.length, prevented: event.defaultPrevented };
        }

        describe('icon trigger (anchor without href)', () => {
            it('should be reachable with the Tab key', async () => {
                const wrapper = mountVNode(renderModalNode(ICON_CONFIG, baseOptions));

                // An <a> without href is not focusable on its own — the tab stop is what
                // makes this trigger operable at all.
                expect(wrapper.find('a').attributes('href')).toBeUndefined();
                expect(wrapper.find('a').attributes('tabindex')).toBe('0');
            });

            it.each([['Enter'], [' ']])('should activate on "%s"', key => {
                const { clicks, prevented } = pressKey(ICON_CONFIG, key);

                expect(clicks).toBe(1);
                expect(prevented).toBe(true);
            });

            it.each([['Tab'], ['a'], ['Escape'], ['ArrowDown']])('should ignore "%s"', key => {
                const { clicks, prevented } = pressKey(ICON_CONFIG, key);

                expect(clicks).toBe(0);
                expect(prevented).toBe(false);
            });
        });

        describe('link trigger (anchor with href="#")', () => {
            it('should activate on Space', () => {
                const { clicks, prevented } = pressKey(LINK_CONFIG, ' ');

                expect(clicks).toBe(1);
                expect(prevented).toBe(true);
            });

            it('should leave Enter to the browser instead of clicking twice', () => {
                // A focusable anchor already turns Enter into a click; handling it here as
                // well would toggle the modal twice — i.e. open and immediately close it.
                const { clicks, prevented } = pressKey(LINK_CONFIG, 'Enter');

                expect(clicks).toBe(0);
                expect(prevented).toBe(false);
            });

            it('should not need an extra tab stop', () => {
                const wrapper = mountVNode(renderModalNode(LINK_CONFIG, baseOptions));

                expect(wrapper.find('a').attributes('href')).toBe('#');
                expect(wrapper.find('a').attributes('tabindex')).toBeUndefined();
            });
        });

        describe('button trigger', () => {
            it('should rely on native button semantics', () => {
                const config: ModalConfig = {
                    type: 'modal',
                    id: 'view-modal',
                    content: { type: 'button', variant: 'primary', value: 'View' } as never,
                };
                const wrapper = mountVNode(renderModalNode(config, baseOptions));
                const button = wrapper.find('button');

                expect(button.attributes('type')).toBe('button');
                expect(button.attributes('tabindex')).toBeUndefined();
                expect(button.attributes('role')).toBeUndefined();
            });
        });
    });
});
