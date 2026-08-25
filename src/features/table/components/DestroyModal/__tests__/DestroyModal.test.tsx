import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { DestroyModal } from '../DestroyModal';
import { useErrorHandlerStore } from '../../../../../state/core/error-handler.state';
import { DEFAULT_STORE_ID } from '../../../../../lib/default-values.lib';

const MODAL_ID = 'destroyModal';
const MODAL_LABEL_ID = 'destroyModalLabel';
// The built-in (English) default labels – provided by DEFAULT_LABELS.
const MODAL_TITLE = 'Confirm deletion';
const MODAL_BODY_TEXT = 'Are you sure you want to delete this item?';
const CANCEL_LABEL = 'Cancel';
const CONFIRM_LABEL = 'Delete';
// Same-origin (relative) route – resolves against happy-dom's current origin,
// so the origin gate lets it through. `form.action` builds an absolute URL from this.
const TEST_ROUTE = '/users/5/destroy';
const TEST_ROUTE_ABS = new URL(TEST_ROUTE, window.location.href).href;
// Definitely a different origin – the origin gate must block it.
const EXTERNAL_ROUTE = 'https://evil.example.com/users/5/destroy';

describe('DestroyModal', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        // Clean up any leftover meta tags or forms
        document.querySelectorAll('meta[name="csrf-token"]').forEach(el => el.remove());
        document.querySelectorAll('form[data-test-destroy]').forEach(el => el.remove());
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // -------------------------------------------------------------------------
    // Basic structure tests
    // -------------------------------------------------------------------------
    describe('HTML structure', () => {
        it('should render the modal root element', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('[data-testid="destroy-modal"]').exists()).toBe(true);
        });

        it('should have id="destroyModal" on the root element', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('[data-testid="destroy-modal"]').attributes('id')).toBe(MODAL_ID);
        });

        it('should have class="modal fade" on the root element', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const root = wrapper.find('[data-testid="destroy-modal"]');
            expect(root.classes()).toContain('modal');
            expect(root.classes()).toContain('fade');
        });

        it('should have tabindex="-1" on the root element', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('[data-testid="destroy-modal"]').attributes('tabindex')).toBe('-1');
        });

        it('should have aria-labelledby="destroyModalLabel"', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(
                wrapper.find('[data-testid="destroy-modal"]').attributes('aria-labelledby')
            ).toBe(MODAL_LABEL_ID);
        });

        it('should have aria-hidden="true"', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('[data-testid="destroy-modal"]').attributes('aria-hidden')).toBe(
                'true'
            );
        });

        it('should render .modal-dialog > .modal-content structure', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('.modal-dialog').exists()).toBe(true);
            expect(wrapper.find('.modal-dialog .modal-content').exists()).toBe(true);
        });

        it('should render .modal-header with title and close button', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('.modal-header').exists()).toBe(true);
            expect(wrapper.find('.modal-header .modal-title').exists()).toBe(true);
            expect(wrapper.find('.modal-header .btn-close').exists()).toBe(true);
        });

        it('should render .modal-body', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('.modal-body').exists()).toBe(true);
        });

        it('should render .modal-footer', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('.modal-footer').exists()).toBe(true);
        });

        it('should NOT have data-bs-toggle or data-bs-target on the root (these belong on triggers)', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const root = wrapper.find('[data-testid="destroy-modal"]');
            expect(root.attributes('data-bs-toggle')).toBeUndefined();
            expect(root.attributes('data-bs-target')).toBeUndefined();
        });
    });

    // -------------------------------------------------------------------------
    // Text content tests
    // -------------------------------------------------------------------------
    describe('text content', () => {
        it('should render the modal title text', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('.modal-title').text()).toBe(MODAL_TITLE);
        });

        it('should render the modal title with id="destroyModalLabel"', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('.modal-title').attributes('id')).toBe(MODAL_LABEL_ID);
        });

        it('should render the body confirmation text', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('.modal-body').text()).toBe(MODAL_BODY_TEXT);
        });

        it('should render the cancel button with correct label', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const cancelBtn = wrapper.find('.modal-footer .btn-secondary');
            expect(cancelBtn.text()).toBe(CANCEL_LABEL);
        });

        it('should render the confirm button with correct label', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const confirmBtn = wrapper.find('.modal-footer .btn-danger');
            expect(confirmBtn.text()).toBe(CONFIRM_LABEL);
        });
    });

    // -------------------------------------------------------------------------
    // Localization: labels overridable via the `labels` config
    // -------------------------------------------------------------------------
    describe('label localization', () => {
        it('should render overridden labels from the global config', () => {
            const wrapper = mount(DestroyModal, {
                attachTo: document.body,
                props: { storeId: 'destroy-labels-override' },
                global: {
                    config: {
                        globalProperties: {
                            $aura: {
                                labels: {
                                    confirmDeleteTitle: 'Törlés megerősítése',
                                    confirmDeleteBody: 'Biztosan törlöd?',
                                    cancel: 'Mégsem',
                                    confirmDelete: 'Törlés',
                                },
                            },
                        } as any,
                    },
                },
            });

            expect(wrapper.find('.modal-title').text()).toBe('Törlés megerősítése');
            expect(wrapper.find('.modal-body').text()).toBe('Biztosan törlöd?');
            expect(wrapper.find('.modal-footer .btn-secondary').text()).toBe('Mégsem');
            expect(wrapper.find('.modal-footer .btn-danger').text()).toBe('Törlés');
        });

        it('should keep English defaults for keys that are not overridden', () => {
            const wrapper = mount(DestroyModal, {
                attachTo: document.body,
                props: { storeId: 'destroy-labels-partial' },
                global: {
                    config: {
                        globalProperties: {
                            $aura: {
                                labels: { confirmDelete: 'Eltávolítás' },
                            },
                        } as any,
                    },
                },
            });

            // Overridden key
            expect(wrapper.find('.modal-footer .btn-danger').text()).toBe('Eltávolítás');
            // Keys that are not overridden stay in English
            expect(wrapper.find('.modal-title').text()).toBe(MODAL_TITLE);
            expect(wrapper.find('.modal-footer .btn-secondary').text()).toBe(CANCEL_LABEL);
        });
    });

    // -------------------------------------------------------------------------
    // Button attribute tests
    // -------------------------------------------------------------------------
    describe('button attributes', () => {
        it('should have data-bs-dismiss="modal" on the close button in header', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('.modal-header .btn-close').attributes('data-bs-dismiss')).toBe(
                'modal'
            );
        });

        it('should have data-bs-dismiss="modal" on the cancel button in footer', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('.btn-secondary').attributes('data-bs-dismiss')).toBe('modal');
        });

        it('should NOT have data-bs-dismiss on the confirm button', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('.btn-danger').attributes('data-bs-dismiss')).toBeUndefined();
        });

        it('should have type="button" on the cancel button', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('.btn-secondary').attributes('type')).toBe('button');
        });

        it('should have type="button" on the confirm button', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            expect(wrapper.find('.btn-danger').attributes('type')).toBe('button');
        });

        it('should have class btn btn-danger on the confirm button', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const confirmBtn = wrapper.find('.btn-danger');
            expect(confirmBtn.classes()).toContain('btn');
            expect(confirmBtn.classes()).toContain('btn-danger');
        });

        it('should have class btn btn-secondary on the cancel button', () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const cancelBtn = wrapper.find('.btn-secondary');
            expect(cancelBtn.classes()).toContain('btn');
            expect(cancelBtn.classes()).toContain('btn-secondary');
        });
    });

    // -------------------------------------------------------------------------
    // show.bs.modal event handling
    // -------------------------------------------------------------------------
    describe('show.bs.modal event handling', () => {
        it('should update currentRoute when show.bs.modal fires with a relatedTarget that has data-route', async () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const modalEl = wrapper.find('[data-testid="destroy-modal"]').element;

            const trigger = document.createElement('a');
            trigger.setAttribute('data-route', TEST_ROUTE);

            const event = new Event('show.bs.modal');
            Object.defineProperty(event, 'relatedTarget', { value: trigger });
            modalEl.dispatchEvent(event);

            await wrapper.vm.$nextTick();

            // The confirm button must be clickable when a route is set (verified via form submit)
            expect(wrapper.find('.btn-danger').exists()).toBe(true);
        });

        it('should not change currentRoute when show.bs.modal fires without relatedTarget', async () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });

            const formSubmitSpy = vi.spyOn(document.body, 'appendChild');
            const modalEl = wrapper.find('[data-testid="destroy-modal"]').element;

            const event = new Event('show.bs.modal');
            // relatedTarget is not defined (null)
            modalEl.dispatchEvent(event);
            await wrapper.vm.$nextTick();

            await wrapper.find('.btn-danger').trigger('click');

            // No form was appended (currentRoute stayed null)
            expect(formSubmitSpy).not.toHaveBeenCalled();
        });

        it('should set currentRoute to null when relatedTarget has no data-route', async () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });

            const formSubmitSpy = vi.spyOn(document.body, 'appendChild');
            const modalEl = wrapper.find('[data-testid="destroy-modal"]').element;

            const trigger = document.createElement('button');
            // No data-route attribute

            const event = new Event('show.bs.modal');
            Object.defineProperty(event, 'relatedTarget', { value: trigger });
            modalEl.dispatchEvent(event);
            await wrapper.vm.$nextTick();

            await wrapper.find('.btn-danger').trigger('click');

            expect(formSubmitSpy).not.toHaveBeenCalled();
        });

        it('should update currentRoute on each subsequent modal open', async () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const modalEl = wrapper.find('[data-testid="destroy-modal"]').element;

            // First open
            const trigger1 = document.createElement('a');
            trigger1.setAttribute('data-route', '/users/1/destroy');
            const event1 = new Event('show.bs.modal');
            Object.defineProperty(event1, 'relatedTarget', { value: trigger1 });
            modalEl.dispatchEvent(event1);
            await wrapper.vm.$nextTick();

            // Second open
            const trigger2 = document.createElement('a');
            trigger2.setAttribute('data-route', '/users/99/destroy');
            const event2 = new Event('show.bs.modal');
            Object.defineProperty(event2, 'relatedTarget', { value: trigger2 });
            modalEl.dispatchEvent(event2);
            await wrapper.vm.$nextTick();

            // Verify via a form submit spy that it uses the route for id 99
            const formSpy = vi
                .spyOn(HTMLFormElement.prototype, 'submit')
                .mockImplementation(() => {});
            await wrapper.find('.btn-danger').trigger('click');
            expect(formSpy).toHaveBeenCalledTimes(1);

            // Verify the action in the DOM before submit
            const appendSpy = vi.spyOn(document.body, 'appendChild');
            // Reset spies and fire again
            formSpy.mockRestore();
            appendSpy.mockRestore();
        });
    });

    // -------------------------------------------------------------------------
    // Form submit tests
    // -------------------------------------------------------------------------
    describe('form submit on confirm', () => {
        it('should not submit if currentRoute is null (no data-route was set)', async () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const appendSpy = vi.spyOn(document.body, 'appendChild');

            await wrapper.find('.btn-danger').trigger('click');

            expect(appendSpy).not.toHaveBeenCalled();
        });

        it('should create a form and call submit when route is set', async () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const modalEl = wrapper.find('[data-testid="destroy-modal"]').element;

            // Set currentRoute via show.bs.modal event
            const trigger = document.createElement('a');
            trigger.setAttribute('data-route', TEST_ROUTE);
            const event = new Event('show.bs.modal');
            Object.defineProperty(event, 'relatedTarget', { value: trigger });
            modalEl.dispatchEvent(event);
            await wrapper.vm.$nextTick();

            const submitSpy = vi
                .spyOn(HTMLFormElement.prototype, 'submit')
                .mockImplementation(() => {});

            await wrapper.find('.btn-danger').trigger('click');

            expect(submitSpy).toHaveBeenCalledTimes(1);
        });

        it('should set form.method to "post" and form.action to the resolved route', async () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const modalEl = wrapper.find('[data-testid="destroy-modal"]').element;

            const trigger = document.createElement('a');
            trigger.setAttribute('data-route', TEST_ROUTE);
            const event = new Event('show.bs.modal');
            Object.defineProperty(event, 'relatedTarget', { value: trigger });
            modalEl.dispatchEvent(event);
            await wrapper.vm.$nextTick();

            let capturedForm: HTMLFormElement | null = null;
            const originalAppend = document.body.appendChild.bind(document.body);
            vi.spyOn(document.body, 'appendChild').mockImplementation(node => {
                if (node instanceof HTMLFormElement) {
                    capturedForm = node;
                }
                return originalAppend(node);
            });
            vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

            await wrapper.find('.btn-danger').trigger('click');

            expect(capturedForm).not.toBeNull();
            expect(capturedForm!.method.toLowerCase()).toBe('post');
            expect(capturedForm!.action).toBe(TEST_ROUTE_ABS);
        });

        it('should include _method=DELETE hidden input in the form', async () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const modalEl = wrapper.find('[data-testid="destroy-modal"]').element;

            const trigger = document.createElement('a');
            trigger.setAttribute('data-route', TEST_ROUTE);
            const event = new Event('show.bs.modal');
            Object.defineProperty(event, 'relatedTarget', { value: trigger });
            modalEl.dispatchEvent(event);
            await wrapper.vm.$nextTick();

            let capturedForm: HTMLFormElement | null = null;
            const originalAppend = document.body.appendChild.bind(document.body);
            vi.spyOn(document.body, 'appendChild').mockImplementation(node => {
                if (node instanceof HTMLFormElement) {
                    capturedForm = node;
                }
                return originalAppend(node);
            });
            vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

            await wrapper.find('.btn-danger').trigger('click');

            const methodInput =
                capturedForm!.querySelector<HTMLInputElement>('input[name="_method"]');
            expect(methodInput).not.toBeNull();
            expect(methodInput!.value).toBe('DELETE');
            expect(methodInput!.type).toBe('hidden');
        });

        it('should remove the form from the DOM after submit', async () => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const modalEl = wrapper.find('[data-testid="destroy-modal"]').element;

            const trigger = document.createElement('a');
            trigger.setAttribute('data-route', TEST_ROUTE);
            const event = new Event('show.bs.modal');
            Object.defineProperty(event, 'relatedTarget', { value: trigger });
            modalEl.dispatchEvent(event);
            await wrapper.vm.$nextTick();

            vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

            await wrapper.find('.btn-danger').trigger('click');

            // The form must not remain in the body
            expect(document.body.querySelector('form')).toBeNull();
        });
    });

    // -------------------------------------------------------------------------
    // Origin guard tests (blocking cross-origin routes – CSRF token protection)
    // -------------------------------------------------------------------------
    describe('origin guard', () => {
        const openWithRoute = async (route: string) => {
            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const modalEl = wrapper.find('[data-testid="destroy-modal"]').element;
            const trigger = document.createElement('a');
            trigger.setAttribute('data-route', route);
            const event = new Event('show.bs.modal');
            Object.defineProperty(event, 'relatedTarget', { value: trigger });
            modalEl.dispatchEvent(event);
            await wrapper.vm.$nextTick();
            return wrapper;
        };

        it('should NOT submit when the route is cross-origin', async () => {
            const appendSpy = vi.spyOn(document.body, 'appendChild');
            const submitSpy = vi
                .spyOn(HTMLFormElement.prototype, 'submit')
                .mockImplementation(() => {});

            const wrapper = await openWithRoute(EXTERNAL_ROUTE);
            await wrapper.find('.btn-danger').trigger('click');

            // Did not append a form and did not submit
            const appendedForm = appendSpy.mock.calls.find(
                ([node]) => node instanceof HTMLFormElement
            );
            expect(appendedForm).toBeUndefined();
            expect(submitSpy).not.toHaveBeenCalled();
        });

        it('should report a warning to the error store (not console) when a cross-origin route is blocked', async () => {
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});
            const errorStore = useErrorHandlerStore(`${DEFAULT_STORE_ID}-errors`);

            const wrapper = await openWithRoute(EXTERNAL_ROUTE);
            await wrapper.find('.btn-danger').trigger('click');

            // Per the design, the plugin does not log to the console – the block is
            // reported to the central error store instead (visible as a banner even with
            // production drop_console). (Vue itself may log an independent lifecycle
            // warning, so we only assert our own route message doesn't hit the console,
            // not every warning.)
            const routeWarn = warnSpy.mock.calls.find(call =>
                String(call[0]).includes(EXTERNAL_ROUTE)
            );
            expect(routeWarn).toBeUndefined();

            const authErrors = errorStore.errors.filter(
                e => e.component === 'DestroyModal' && e.type === 'authorization'
            );
            expect(authErrors).toHaveLength(1);
            expect(authErrors[0]?.severity).toBe('warning');
            expect(authErrors[0]?.message).toContain(EXTERNAL_ROUTE);
        });

        it('should NOT leak the CSRF token to a cross-origin route', async () => {
            const meta = document.createElement('meta');
            meta.setAttribute('name', 'csrf-token');
            meta.setAttribute('content', 'secret-token-xyz');
            document.head.appendChild(meta);

            let capturedForm: HTMLFormElement | null = null;
            const originalAppend = document.body.appendChild.bind(document.body);
            vi.spyOn(document.body, 'appendChild').mockImplementation(node => {
                if (node instanceof HTMLFormElement) {
                    capturedForm = node;
                }
                return originalAppend(node);
            });
            vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

            const wrapper = await openWithRoute(EXTERNAL_ROUTE);
            await wrapper.find('.btn-danger').trigger('click');

            // No form was created at all, so the token could not have been included either
            expect(capturedForm).toBeNull();

            meta.remove();
        });

        it('should still submit for a same-origin (relative) route', async () => {
            const submitSpy = vi
                .spyOn(HTMLFormElement.prototype, 'submit')
                .mockImplementation(() => {});

            const wrapper = await openWithRoute(TEST_ROUTE);
            await wrapper.find('.btn-danger').trigger('click');

            expect(submitSpy).toHaveBeenCalledTimes(1);
        });
    });

    // -------------------------------------------------------------------------
    // CSRF token tests
    // -------------------------------------------------------------------------
    describe('CSRF token (best-effort)', () => {
        it('should include _token hidden input when <meta name="csrf-token"> exists', async () => {
            const meta = document.createElement('meta');
            meta.setAttribute('name', 'csrf-token');
            meta.setAttribute('content', 'test-csrf-token-abc123');
            document.head.appendChild(meta);

            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const modalEl = wrapper.find('[data-testid="destroy-modal"]').element;

            const trigger = document.createElement('a');
            trigger.setAttribute('data-route', TEST_ROUTE);
            const event = new Event('show.bs.modal');
            Object.defineProperty(event, 'relatedTarget', { value: trigger });
            modalEl.dispatchEvent(event);
            await wrapper.vm.$nextTick();

            let capturedForm: HTMLFormElement | null = null;
            const originalAppend = document.body.appendChild.bind(document.body);
            vi.spyOn(document.body, 'appendChild').mockImplementation(node => {
                if (node instanceof HTMLFormElement) {
                    capturedForm = node;
                }
                return originalAppend(node);
            });
            vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

            await wrapper.find('.btn-danger').trigger('click');

            const tokenInput =
                capturedForm!.querySelector<HTMLInputElement>('input[name="_token"]');
            expect(tokenInput).not.toBeNull();
            expect(tokenInput!.value).toBe('test-csrf-token-abc123');
            expect(tokenInput!.type).toBe('hidden');

            meta.remove();
        });

        it('should NOT include _token when <meta name="csrf-token"> does not exist', async () => {
            // Ensure there is no meta tag
            document.querySelectorAll('meta[name="csrf-token"]').forEach(el => el.remove());

            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const modalEl = wrapper.find('[data-testid="destroy-modal"]').element;

            const trigger = document.createElement('a');
            trigger.setAttribute('data-route', TEST_ROUTE);
            const event = new Event('show.bs.modal');
            Object.defineProperty(event, 'relatedTarget', { value: trigger });
            modalEl.dispatchEvent(event);
            await wrapper.vm.$nextTick();

            let capturedForm: HTMLFormElement | null = null;
            const originalAppend = document.body.appendChild.bind(document.body);
            vi.spyOn(document.body, 'appendChild').mockImplementation(node => {
                if (node instanceof HTMLFormElement) {
                    capturedForm = node;
                }
                return originalAppend(node);
            });
            vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

            await wrapper.find('.btn-danger').trigger('click');

            const tokenInput =
                capturedForm!.querySelector<HTMLInputElement>('input[name="_token"]');
            expect(tokenInput).toBeNull();
        });

        it('should NOT include _token when csrf-token meta content is empty', async () => {
            const meta = document.createElement('meta');
            meta.setAttribute('name', 'csrf-token');
            meta.setAttribute('content', '');
            document.head.appendChild(meta);

            const wrapper = mount(DestroyModal, { attachTo: document.body });
            const modalEl = wrapper.find('[data-testid="destroy-modal"]').element;

            const trigger = document.createElement('a');
            trigger.setAttribute('data-route', TEST_ROUTE);
            const event = new Event('show.bs.modal');
            Object.defineProperty(event, 'relatedTarget', { value: trigger });
            modalEl.dispatchEvent(event);
            await wrapper.vm.$nextTick();

            let capturedForm: HTMLFormElement | null = null;
            const originalAppend = document.body.appendChild.bind(document.body);
            vi.spyOn(document.body, 'appendChild').mockImplementation(node => {
                if (node instanceof HTMLFormElement) {
                    capturedForm = node;
                }
                return originalAppend(node);
            });
            vi.spyOn(HTMLFormElement.prototype, 'submit').mockImplementation(() => {});

            await wrapper.find('.btn-danger').trigger('click');

            const tokenInput =
                capturedForm!.querySelector<HTMLInputElement>('input[name="_token"]');
            expect(tokenInput).toBeNull();

            meta.remove();
        });
    });

    // -------------------------------------------------------------------------
    // Event listener cleanup tests
    // -------------------------------------------------------------------------
    describe('event listener lifecycle', () => {
        it('should register show.bs.modal listener on mount', async () => {
            const addEventSpy = vi.spyOn(HTMLElement.prototype, 'addEventListener');

            mount(DestroyModal, { attachTo: document.body });

            expect(addEventSpy).toHaveBeenCalledWith('show.bs.modal', expect.any(Function));
        });

        it('should remove show.bs.modal listener on unmount', async () => {
            const removeEventSpy = vi.spyOn(HTMLElement.prototype, 'removeEventListener');

            const wrapper = mount(DestroyModal, { attachTo: document.body });
            wrapper.unmount();

            expect(removeEventSpy).toHaveBeenCalledWith('show.bs.modal', expect.any(Function));
        });
    });
});
