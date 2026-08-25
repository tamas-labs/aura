import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { ActionButtons } from '../ActionButtons';
import { useCoreStore, useApiResourcesStore } from '../../../../../state';
import type { AuraProps } from '../../../../../types';
import { triggerCsvDownload } from '../../../utils/export/build-csv';
import type * as BuildCsvModule from '../../../utils/export/build-csv';

// We mock the actual browser download (Blob/anchor); `buildCsv` stays real.
vi.mock('../../../utils/export/build-csv', async importOriginal => {
    const actual = await importOriginal<typeof BuildCsvModule>();
    return { ...actual, triggerCsvDownload: vi.fn() };
});

describe('ActionButtons', () => {
    const TEST_STORE_ID = 'test-action-buttons';
    let pinia: ReturnType<typeof createPinia>;

    beforeEach(() => {
        pinia = createPinia();
        setActivePinia(pinia);
        vi.clearAllMocks();
        window.sessionStorage.clear();
    });

    describe('rendering with actionButtons config', () => {
        it('should render all buttons when all are enabled', () => {
            const core = useCoreStore(TEST_STORE_ID, {
                storeId: TEST_STORE_ID,
                actionButtons: ['refresh', 'export', 'settings'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID, core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID },
            });

            expect(wrapper.find('[data-testid="action-refresh"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="action-export-toggle"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="action-settings"]').exists()).toBe(true);
        });

        it('should render only refresh button when only refresh is enabled', () => {
            const core = useCoreStore(TEST_STORE_ID + '-refresh-only', {
                storeId: TEST_STORE_ID + '-refresh-only',
                actionButtons: ['refresh'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-refresh-only', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-refresh-only' },
            });

            expect(wrapper.find('[data-testid="action-refresh"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="action-export-toggle"]').exists()).toBe(false);
            expect(wrapper.find('[data-testid="action-settings"]').exists()).toBe(false);
        });

        it('should render only export button when only export is enabled', () => {
            const core = useCoreStore(TEST_STORE_ID + '-export-only', {
                storeId: TEST_STORE_ID + '-export-only',
                actionButtons: ['export'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-export-only', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-export-only' },
            });

            expect(wrapper.find('[data-testid="action-refresh"]').exists()).toBe(false);
            expect(wrapper.find('[data-testid="action-export-toggle"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="action-settings"]').exists()).toBe(false);
        });

        it('should render only settings button when only settings is enabled', () => {
            const core = useCoreStore(TEST_STORE_ID + '-settings-only', {
                storeId: TEST_STORE_ID + '-settings-only',
                actionButtons: ['settings'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-settings-only', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-settings-only' },
            });

            expect(wrapper.find('[data-testid="action-refresh"]').exists()).toBe(false);
            expect(wrapper.find('[data-testid="action-export-toggle"]').exists()).toBe(false);
            expect(wrapper.find('[data-testid="action-settings"]').exists()).toBe(true);
        });

        it('should render nothing when actionButtons is empty array', () => {
            const core = useCoreStore(TEST_STORE_ID + '-empty', {
                storeId: TEST_STORE_ID + '-empty',
                actionButtons: [],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-empty', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-empty' },
            });

            expect(wrapper.html()).toBe('');
        });

        it('should render partial buttons when some are enabled', () => {
            const core = useCoreStore(TEST_STORE_ID + '-partial', {
                storeId: TEST_STORE_ID + '-partial',
                actionButtons: ['refresh', 'settings'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-partial', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-partial' },
            });

            expect(wrapper.find('[data-testid="action-refresh"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="action-export-toggle"]').exists()).toBe(false);
            expect(wrapper.find('[data-testid="action-settings"]').exists()).toBe(true);
        });

        it('should render button group container when buttons are enabled', () => {
            const core = useCoreStore(TEST_STORE_ID + '-container', {
                storeId: TEST_STORE_ID + '-container',
                actionButtons: ['refresh'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-container', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-container' },
            });

            const btnGroup = wrapper.find('.btn-group[role="group"]');
            expect(btnGroup.exists()).toBe(true);
        });
    });

    describe('refresh button functionality', () => {
        it('should call resource.fetchData when refresh button clicked', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-refresh-click', {
                storeId: TEST_STORE_ID + '-refresh-click',
                actionButtons: ['refresh'],
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-refresh-click', core);
            const fetchDataSpy = vi.spyOn(resource, 'fetchData');

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-refresh-click' },
            });

            const refreshBtn = wrapper.find('[data-testid="action-refresh"]');
            await refreshBtn.trigger('click');

            expect(fetchDataSpy).toHaveBeenCalledOnce();
        });

        it('should have correct icon for refresh button', () => {
            const core = useCoreStore(TEST_STORE_ID + '-refresh-icon', {
                storeId: TEST_STORE_ID + '-refresh-icon',
                actionButtons: ['refresh'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-refresh-icon', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-refresh-icon' },
            });

            const refreshBtn = wrapper.find('[data-testid="action-refresh"]');
            const icon = refreshBtn.find('i.fa-rotate-right');
            expect(icon.exists()).toBe(true);
        });

        it('should have correct classes for refresh button', () => {
            const core = useCoreStore(TEST_STORE_ID + '-refresh-classes', {
                storeId: TEST_STORE_ID + '-refresh-classes',
                actionButtons: ['refresh'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-refresh-classes', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-refresh-classes' },
            });

            const refreshBtn = wrapper.find('[data-testid="action-refresh"]');
            expect(refreshBtn.classes()).toContain('btn');
            expect(refreshBtn.classes()).toContain('btn-outline-secondary');
        });
    });

    describe('export dropdown functionality', () => {
        it('should render export menu when export is enabled', () => {
            const core = useCoreStore(TEST_STORE_ID + '-export-menu', {
                storeId: TEST_STORE_ID + '-export-menu',
                actionButtons: ['export'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-export-menu', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-export-menu' },
            });

            const exportMenu = wrapper.find('[data-testid="action-export-menu"]');
            expect(exportMenu.exists()).toBe(true);
        });

        it('should have a single CSV export option', () => {
            const core = useCoreStore(TEST_STORE_ID + '-export-csv', {
                storeId: TEST_STORE_ID + '-export-csv',
                actionButtons: ['export'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-export-csv', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-export-csv' },
            });

            const dropdownItems = wrapper.findAll('.dropdown-item');
            expect(dropdownItems.length).toBe(1);
            expect(dropdownItems[0]?.text()).toBe('CSV export');
        });

        it('should trigger a CSV download when the CSV option is clicked', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-export-csv-click', {
                storeId: TEST_STORE_ID + '-export-csv-click',
                actionButtons: ['export'],
                disableSession: true,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-export-csv-click', core);
            await resource.processResponse({
                header: { rows: [{ cells: [{ content: 'Name', key: 'name', field: 'name' }] }] },
                items: [{ name: 'Anna' }, { name: 'Béla' }],
            });

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-export-csv-click' },
                global: { plugins: [pinia] },
            });

            await wrapper.find('[data-testid="action-export-csv"]').trigger('click');

            expect(triggerCsvDownload).toHaveBeenCalledTimes(1);
            const [filename, csv] = vi.mocked(triggerCsvDownload).mock.calls[0]!;
            expect(filename).toBe('export.csv');
            expect(csv).toContain('Name');
            expect(csv).toContain('Anna');
            expect(csv).toContain('Béla');
        });

        it('should have download icon for export button', () => {
            const core = useCoreStore(TEST_STORE_ID + '-export-icon', {
                storeId: TEST_STORE_ID + '-export-icon',
                actionButtons: ['export'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-export-icon', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-export-icon' },
            });

            const exportToggle = wrapper.find('[data-testid="action-export-toggle"]');
            const icon = exportToggle.find('i.fa-download');
            expect(icon.exists()).toBe(true);
        });
    });

    describe('settings button functionality', () => {
        it('should call core.toggleSettings when settings button clicked', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-settings-toggle', {
                storeId: TEST_STORE_ID + '-settings-toggle',
                actionButtons: ['settings'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-settings-toggle', core);
            const toggleSpy = vi.spyOn(core, 'toggleSettings');

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-settings-toggle' },
            });

            const settingsBtn = wrapper.find('[data-testid="action-settings"]');
            await settingsBtn.trigger('click');

            expect(toggleSpy).toHaveBeenCalledOnce();
        });

        it('should have outline style when settings is closed', () => {
            const core = useCoreStore(TEST_STORE_ID + '-settings-closed', {
                storeId: TEST_STORE_ID + '-settings-closed',
                actionButtons: ['settings'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-settings-closed', core);
            core.isSettingsOpen = false;

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-settings-closed' },
            });

            const settingsBtn = wrapper.find('[data-testid="action-settings"]');
            expect(settingsBtn.classes()).toContain('btn-outline-secondary');
            expect(settingsBtn.classes()).not.toContain('btn-secondary');
        });

        it('should have filled style when settings is open', () => {
            const core = useCoreStore(TEST_STORE_ID + '-settings-open', {
                storeId: TEST_STORE_ID + '-settings-open',
                actionButtons: ['settings'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-settings-open', core);
            core.isSettingsOpen = true;

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-settings-open' },
            });

            const settingsBtn = wrapper.find('[data-testid="action-settings"]');
            expect(settingsBtn.classes()).toContain('btn-secondary');
            expect(settingsBtn.classes()).not.toContain('btn-outline-secondary');
        });

        it('should have settings icon', () => {
            const core = useCoreStore(TEST_STORE_ID + '-settings-icon', {
                storeId: TEST_STORE_ID + '-settings-icon',
                actionButtons: ['settings'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-settings-icon', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-settings-icon' },
            });

            const settingsBtn = wrapper.find('[data-testid="action-settings"]');
            const icon = settingsBtn.find('i.fa-gears');
            expect(icon.exists()).toBe(true);
        });

        it('should toggle visual state when clicked multiple times', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-settings-toggle-visual', {
                storeId: TEST_STORE_ID + '-settings-toggle-visual',
                actionButtons: ['settings'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-settings-toggle-visual', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-settings-toggle-visual' },
            });

            const settingsBtn = wrapper.find('[data-testid="action-settings"]');

            // Initial state: closed
            expect(core.isSettingsOpen).toBe(false);
            expect(settingsBtn.classes()).toContain('btn-outline-secondary');

            // First click: open
            await settingsBtn.trigger('click');
            await wrapper.vm.$nextTick();
            expect(core.isSettingsOpen).toBe(true);

            // Second click: closed
            await settingsBtn.trigger('click');
            await wrapper.vm.$nextTick();
            expect(core.isSettingsOpen).toBe(false);
        });
    });

    describe('integration', () => {
        it('should work with all buttons enabled', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-integration-all', {
                storeId: TEST_STORE_ID + '-integration-all',
                actionButtons: ['refresh', 'export', 'settings'],
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-integration-all', core);
            const fetchDataSpy = vi.spyOn(resource, 'fetchData');
            const toggleSpy = vi.spyOn(core, 'toggleSettings');

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-integration-all' },
            });

            // Test refresh
            await wrapper.find('[data-testid="action-refresh"]').trigger('click');
            expect(fetchDataSpy).toHaveBeenCalled();

            // Test settings
            await wrapper.find('[data-testid="action-settings"]').trigger('click');
            expect(toggleSpy).toHaveBeenCalled();
        });

        it('should use default config when no actionButtons provided', () => {
            const core = useCoreStore(TEST_STORE_ID + '-default-config', {
                storeId: TEST_STORE_ID + '-default-config',
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-default-config', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-default-config' },
            });

            // Should render all buttons by default
            expect(wrapper.find('[data-testid="action-refresh"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="action-export-toggle"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="action-settings"]').exists()).toBe(true);
        });
    });

    describe('edge cases', () => {
        it('should handle buttons in different order', () => {
            const core = useCoreStore(TEST_STORE_ID + '-order', {
                storeId: TEST_STORE_ID + '-order',
                actionButtons: ['settings', 'refresh', 'export'],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-order', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-order' },
            });

            expect(wrapper.find('[data-testid="action-refresh"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="action-export-toggle"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="action-settings"]').exists()).toBe(true);
        });

        it('should handle null actionButtons config', () => {
            const core = useCoreStore(TEST_STORE_ID + '-null-config', {
                storeId: TEST_STORE_ID + '-null-config',
                actionButtons: null as unknown as string[],
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-null-config', core);

            const wrapper = mount(ActionButtons, {
                props: { storeId: TEST_STORE_ID + '-null-config' },
            });

            // Should render nothing when null
            expect(wrapper.html()).toBe('');
        });
    });
});
