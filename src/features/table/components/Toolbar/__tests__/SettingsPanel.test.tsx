import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { SettingsPanel } from '../SettingsPanel';
import { useCoreStore, useApiResourcesStore } from '../../../../../state';
import type { AuraProps, ApiResourcesStore } from '../../../../../types';

const HEADER = {
    rows: [
        {
            cells: [
                { key: 'name', field: 'name', content: 'Name' },
                { key: 'email', field: 'email', content: 'Mail' },
            ],
        },
    ],
};

describe('SettingsPanel', () => {
    let counter = 0;
    let storeId: string;
    let resource: ApiResourcesStore;

    const setup = async (isOpen: boolean) => {
        const core = useCoreStore(storeId, { storeId } as AuraProps);
        resource = useApiResourcesStore(storeId, core);
        await resource.processResponse({ header: HEADER, items: [{ name: 'Jane' }] });

        return mount(SettingsPanel, { props: { storeId, isOpen } });
    };

    /**
     * `labels` is global config, not a prop, and `useCoreStore` reads it off the mounting
     * component instance — so the store has to be created *during* the mount.
     */
    const setupWithLabels = async (labels: Record<string, string>) => {
        const pinia = createPinia();
        setActivePinia(pinia);

        const wrapper = mount(SettingsPanel, {
            props: { storeId, isOpen: true },
            global: {
                plugins: [pinia],
                config: { globalProperties: { $aura: { labels } } as never },
            },
        });

        const core = useCoreStore(storeId, {} as AuraProps);
        resource = useApiResourcesStore(storeId, core);
        await resource.processResponse({ header: HEADER, items: [{ name: 'Jane' }] });
        await wrapper.vm.$nextTick();

        return wrapper;
    };

    beforeEach(() => {
        setActivePinia(createPinia());
        storeId = `settings-panel-${++counter}`;
    });

    describe('rendering', () => {
        it('should render settings panel container', async () => {
            const wrapper = await setup(false);

            expect(wrapper.find('[data-testid="settings-panel"]').exists()).toBe(true);
        });

        it('should have collapse class', async () => {
            const wrapper = await setup(false);

            expect(wrapper.find('[data-testid="settings-panel"]').classes()).toContain('collapse');
        });

        it('should render card body inside collapse', async () => {
            const wrapper = await setup(true);

            expect(wrapper.find('.card-body').exists()).toBe(true);
        });
    });

    describe('collapse behavior', () => {
        it('should not have show class when closed', async () => {
            const wrapper = await setup(false);

            expect(wrapper.find('[data-testid="settings-panel"]').classes()).not.toContain('show');
        });

        it('should have show class when open', async () => {
            const wrapper = await setup(true);

            expect(wrapper.find('[data-testid="settings-panel"]').classes()).toContain('show');
        });

        it('should toggle show class when isOpen changes', async () => {
            const wrapper = await setup(false);
            const panel = wrapper.find('[data-testid="settings-panel"]');

            expect(panel.classes()).not.toContain('show');

            await wrapper.setProps({ isOpen: true });
            expect(panel.classes()).toContain('show');

            await wrapper.setProps({ isOpen: false });
            expect(panel.classes()).not.toContain('show');
        });
    });

    describe('content sections', () => {
        it('should render the column visibility section', async () => {
            const wrapper = await setup(true);

            expect(wrapper.findAll('h6').map(node => node.text())).toContain('Column visibility');
            expect(wrapper.find('[data-testid="column-visibility-panel"]').exists()).toBe(true);
        });

        it('should not render placeholder text any more', async () => {
            const wrapper = await setup(true);

            expect(wrapper.text()).not.toContain('Placeholder');
        });

        it('should use the configured label overrides', async () => {
            const wrapper = await setupWithLabels({
                columnVisibility: 'Oszlopok',
            });

            expect(wrapper.findAll('h6').map(node => node.text())).toEqual(['Oszlopok']);
        });
    });

    describe('wiring', () => {
        it('should hide a column through the panel', async () => {
            const wrapper = await setup(true);

            await wrapper.find('[data-testid="column-toggle-email"]').trigger('change');

            expect(resource.hiddenColumns).toEqual(['email']);
        });
    });

    describe('styling', () => {
        it('should have bg-light class on card', async () => {
            const wrapper = await setup(true);

            expect(wrapper.find('.card').classes()).toContain('bg-light');
        });

        it('should have mt-2 class on card', async () => {
            const wrapper = await setup(true);

            expect(wrapper.find('.card').classes()).toContain('mt-2');
        });
    });
});
