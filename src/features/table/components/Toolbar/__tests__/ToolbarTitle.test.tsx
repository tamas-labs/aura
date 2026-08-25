import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { ToolbarTitle } from '../ToolbarTitle';
import { useCoreStore } from '../../../../../state';
import type { AuraProps } from '../../../../../types';

describe('ToolbarTitle', () => {
    const TEST_STORE_ID = 'test-toolbar-title';

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
    });

    describe('rendering', () => {
        it('should render toolbar title container', () => {
            // Initialize store with defaults
            useCoreStore(TEST_STORE_ID, { storeId: TEST_STORE_ID } as AuraProps);

            const wrapper = mount(ToolbarTitle, {
                props: { storeId: TEST_STORE_ID },
            });

            expect(wrapper.find('[data-testid="toolbar-title"]').exists()).toBe(true);
        });

        it('should render default title text when config is empty', () => {
            // Initialize store with defaults
            useCoreStore(TEST_STORE_ID, { storeId: TEST_STORE_ID } as AuraProps);

            const wrapper = mount(ToolbarTitle, {
                props: { storeId: TEST_STORE_ID },
            });

            expect(wrapper.text()).toBe('Logo/Title');
        });

        it('should render custom title from config', () => {
            const customTitle = 'Custom Global Config Title';
            useCoreStore(TEST_STORE_ID, {
                storeId: TEST_STORE_ID,
                toolbarTitleContent: customTitle,
            } as AuraProps);

            const wrapper = mount(ToolbarTitle, {
                props: { storeId: TEST_STORE_ID },
            });

            expect(wrapper.text()).toBe(customTitle);
        });

        it('should render with proper HTML element', () => {
            useCoreStore(TEST_STORE_ID, { storeId: TEST_STORE_ID } as AuraProps);
            const wrapper = mount(ToolbarTitle, {
                props: { storeId: TEST_STORE_ID },
            });

            const h5 = wrapper.find('h5');
            expect(h5.exists()).toBe(true);
        });

        it('should have correct CSS classes', () => {
            useCoreStore(TEST_STORE_ID, { storeId: TEST_STORE_ID } as AuraProps);
            const wrapper = mount(ToolbarTitle, {
                props: { storeId: TEST_STORE_ID },
            });

            const h5 = wrapper.find('h5');
            expect(h5.classes()).toContain('mb-0');
            expect(h5.classes()).toContain('fw-semibold');
        });
    });
});
