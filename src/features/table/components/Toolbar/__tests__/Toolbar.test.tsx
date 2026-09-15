import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { Toolbar } from '../Toolbar';
import { RowsSelect } from '../RowsSelect';
import { GlobalSearch } from '../GlobalSearch';
import { ToolbarTitle } from '../ToolbarTitle';
import { ActionButtons } from '../ActionButtons';
import { FilterBadges } from '../FilterBadges';
import { SettingsPanel } from '../SettingsPanel';
import { useCoreStore, useApiResourcesStore } from '../../../../../state';
import type { AuraProps } from '../../../../../types';

describe('Toolbar', () => {
    const TEST_STORE_ID = 'test-toolbar';
    const defaultProps = {
        storeId: TEST_STORE_ID,
        paginateValues: [10, 25, 50, 100],
        rowsNumber: 25,
        onRowsChange: vi.fn(),
        onRefresh: vi.fn(),
        onExport: vi.fn(),
    };
    // Title and action buttons are off by default; tests that inspect the top row switch
    // them on explicitly (the `defaults` block covers the untouched configuration)
    const TOP_ROW_ON: Pick<AuraProps, 'showToolbarTitle' | 'actionButtons'> = {
        showToolbarTitle: true,
        actionButtons: ['refresh', 'export', 'settings'],
    };

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        // Initialize stores
        const core = useCoreStore(TEST_STORE_ID, {
            storeId: TEST_STORE_ID,
            ...TOP_ROW_ON,
        } as AuraProps);
        useApiResourcesStore(TEST_STORE_ID, core);
    });

    const mountWithConfig = (storeId: string, config: Partial<AuraProps> = {}) => {
        const core = useCoreStore(storeId, { storeId, ...config } as AuraProps);
        useApiResourcesStore(storeId, core);

        return mount(Toolbar, { props: { ...defaultProps, storeId } });
    };

    describe('rendering', () => {
        it('should render toolbar container', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            expect(wrapper.find('[data-testid="aura-toolbar"]').exists()).toBe(true);
        });

        it('should render top row', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const rows = wrapper.findAll('.row');
            expect(rows.length).toBeGreaterThanOrEqual(2);
        });

        it('should render bottom row', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const rows = wrapper.findAll('.row');
            expect(rows.length).toBeGreaterThanOrEqual(2);
        });

        it('should render ToolbarTitle component', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const title = wrapper.findComponent(ToolbarTitle);
            expect(title.exists()).toBe(true);
        });

        it('should not render GlobalSearch component by default', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const globalSearch = wrapper.findComponent(GlobalSearch);
            expect(globalSearch.exists()).toBe(false);
        });

        it('should render ActionButtons component', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const actionButtons = wrapper.findComponent(ActionButtons);
            expect(actionButtons.exists()).toBe(true);
        });

        it('should render RowsSelect component', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const rowsSelect = wrapper.findComponent(RowsSelect);
            expect(rowsSelect.exists()).toBe(true);
        });

        it('should render FilterBadges component', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const filterBadges = wrapper.findComponent(FilterBadges);
            expect(filterBadges.exists()).toBe(true);
        });

        // The record count belongs to `PaginationInfo` alone: the toolbar copy was fed
        // from the optional response `meta`, so it contradicted the pager as soon as the
        // pagination was client-side or a filter narrowed the set.
        it('should not render a record count of its own', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            expect(wrapper.find('[data-testid="results-info"]').exists()).toBe(false);
        });

        it('should render SettingsPanel component', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const settingsPanel = wrapper.findComponent(SettingsPanel);
            expect(settingsPanel.exists()).toBe(true);
        });
    });

    describe('props forwarding', () => {
        it('should forward paginateValues to RowsSelect', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const rowsSelect = wrapper.findComponent(RowsSelect);
            expect(rowsSelect.props('values')).toEqual([10, 25, 50, 100]);
        });

        it('should forward rowsNumber to RowsSelect', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const rowsSelect = wrapper.findComponent(RowsSelect);
            expect(rowsSelect.props('selected')).toBe(25);
        });

        it('should forward onRowsChange to RowsSelect', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const rowsSelect = wrapper.findComponent(RowsSelect);
            expect(rowsSelect.props('onChange')).toBe(defaultProps.onRowsChange);
        });

        it('should forward storeId to GlobalSearch when search is enabled', () => {
            const storeId = 'test-forward-search';
            const core = useCoreStore(storeId, {
                storeId,
                showHeaderSearch: true,
            } as AuraProps);
            useApiResourcesStore(storeId, core);

            const wrapper = mount(Toolbar, {
                props: {
                    ...defaultProps,
                    storeId,
                },
            });

            const globalSearch = wrapper.findComponent(GlobalSearch);
            expect(globalSearch.exists()).toBe(true);
            expect(globalSearch.props('storeId')).toBe(storeId);
        });

        it('should forward storeId to ActionButtons', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const actionButtons = wrapper.findComponent(ActionButtons);
            expect(actionButtons.props('storeId')).toBe(TEST_STORE_ID);
        });
    });

    describe('callback forwarding', () => {
        it('should call onRowsChange when RowsSelect emits change', async () => {
            const onRowsChange = vi.fn();
            const wrapper = mount(Toolbar, {
                props: {
                    ...defaultProps,
                    onRowsChange,
                },
            });

            const rowsSelect = wrapper.findComponent(RowsSelect);
            await rowsSelect.vm.$props.onChange(50);

            expect(onRowsChange).toHaveBeenCalledWith(50);
            expect(onRowsChange).toHaveBeenCalledTimes(1);
        });
    });

    describe('layout', () => {
        it('should have mb-3 class for bottom margin', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const toolbar = wrapper.find('[data-testid="aura-toolbar"]');
            expect(toolbar.classes()).toContain('mb-3');
        });

        it('should have two row containers', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const rows = wrapper.findAll('.row');
            expect(rows.length).toBeGreaterThanOrEqual(2);
        });

        it('should have responsive column classes on top row', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const topRow = wrapper.findAll('.row')[0];
            const cols = topRow?.findAll('[class*="col-"]') || [];
            expect(cols.length).toBeGreaterThan(0);
        });

        it('should have responsive column classes on bottom row', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const bottomRow = wrapper.findAll('.row')[1];
            const cols = bottomRow?.findAll('[class*="col-"]') || [];
            expect(cols.length).toBeGreaterThan(0);
        });
    });

    describe('settings panel toggle', () => {
        it('should start with settings panel closed', () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const settingsPanel = wrapper.findComponent(SettingsPanel);
            expect(settingsPanel.props('isOpen')).toBe(false);
        });

        it('should toggle settings panel when settings button clicked', async () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            const core = useCoreStore(TEST_STORE_ID, { storeId: TEST_STORE_ID } as AuraProps);
            const settingsPanel = wrapper.findComponent(SettingsPanel);

            expect(core.isSettingsOpen).toBe(false);
            expect(settingsPanel.props('isOpen')).toBe(false);

            // Toggle settings open
            core.toggleSettings();
            await wrapper.vm.$nextTick();

            expect(core.isSettingsOpen).toBe(true);

            // Toggle settings closed
            core.toggleSettings();
            await wrapper.vm.$nextTick();

            expect(core.isSettingsOpen).toBe(false);
        });
    });

    describe('integration', () => {
        it('should handle all components working together', async () => {
            const onRowsChange = vi.fn();
            const integrationStoreId = TEST_STORE_ID + '-integration';

            const core = useCoreStore(integrationStoreId, {
                storeId: integrationStoreId,
            } as AuraProps);
            useApiResourcesStore(integrationStoreId, core);

            const wrapper = mount(Toolbar, {
                props: {
                    storeId: integrationStoreId,
                    paginateValues: [10, 25, 50],
                    rowsNumber: 10,
                    onRowsChange,
                    onRefresh: vi.fn(),
                    onExport: vi.fn(),
                },
            });

            // Test RowsSelect interaction
            const rowsSelect = wrapper.findComponent(RowsSelect);
            await rowsSelect.vm.$props.onChange(50);
            expect(onRowsChange).toHaveBeenCalledWith(50);
        });

        it('should update when props change', async () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            await wrapper.setProps({
                rowsNumber: 50,
            });

            const rowsSelect = wrapper.findComponent(RowsSelect);
            expect(rowsSelect.props('selected')).toBe(50);
        });

        it('should handle different paginateValues arrays', async () => {
            const wrapper = mount(Toolbar, {
                props: defaultProps,
            });

            await wrapper.setProps({
                paginateValues: [5, 10, 15, 20],
            });

            const rowsSelect = wrapper.findComponent(RowsSelect);
            expect(rowsSelect.props('values')).toEqual([5, 10, 15, 20]);
        });
    });

    describe('edge cases', () => {
        it('should handle empty paginateValues', () => {
            const wrapper = mount(Toolbar, {
                props: {
                    ...defaultProps,
                    paginateValues: [],
                },
            });

            const rowsSelect = wrapper.findComponent(RowsSelect);
            expect(rowsSelect.props('values')).toEqual([]);
        });

        it('should handle single pagination value', () => {
            const wrapper = mount(Toolbar, {
                props: {
                    ...defaultProps,
                    paginateValues: [25],
                },
            });

            const rowsSelect = wrapper.findComponent(RowsSelect);
            expect(rowsSelect.props('values')).toEqual([25]);
        });

        it('should render correctly with all required props', () => {
            const edgeStoreId = TEST_STORE_ID + '-edge';
            const core = useCoreStore(edgeStoreId, {
                storeId: edgeStoreId,
                ...TOP_ROW_ON,
                showHeaderSearch: true,
            } as AuraProps);
            useApiResourcesStore(edgeStoreId, core);

            const wrapper = mount(Toolbar, {
                props: {
                    storeId: edgeStoreId,
                    paginateValues: [10],
                    rowsNumber: 10,
                    onRowsChange: vi.fn(),
                    onRefresh: vi.fn(),
                    onExport: vi.fn(),
                },
            });

            expect(wrapper.findComponent(RowsSelect).exists()).toBe(true);
            expect(wrapper.findComponent(GlobalSearch).exists()).toBe(true);
            expect(wrapper.findComponent(ActionButtons).exists()).toBe(true);
            expect(wrapper.findComponent(SettingsPanel).exists()).toBe(true);
        });
    });

    describe('showHeaderSearch integration', () => {
        it('should render GlobalSearch when showHeaderSearch is true', () => {
            const storeId = 'search-enabled-test';
            const core = useCoreStore(storeId, {
                storeId,
                ...TOP_ROW_ON,
                showHeaderSearch: true,
            } as AuraProps);
            useApiResourcesStore(storeId, core);

            const wrapper = mount(Toolbar, {
                props: {
                    ...defaultProps,
                    storeId,
                },
            });

            expect(wrapper.findComponent(GlobalSearch).exists()).toBe(true);

            // Check layout classes (3-6-3 grid)
            const toolbarTitleParent = wrapper.findComponent(ToolbarTitle).element.parentElement;
            expect(toolbarTitleParent?.className).toContain('col-md-3');

            const globalSearchParent = wrapper.findComponent(GlobalSearch).element.parentElement;
            expect(globalSearchParent?.className).toContain('col-md-6');

            const actionButtonsParent = wrapper.findComponent(ActionButtons).element.parentElement;
            expect(actionButtonsParent?.className).toContain('col-md-3');
            expect(actionButtonsParent?.className).toContain('d-flex justify-content-md-end');
        });

        it('should not render GlobalSearch when showHeaderSearch is false', () => {
            const storeId = 'search-disabled-test';
            const core = useCoreStore(storeId, {
                storeId,
                ...TOP_ROW_ON,
                showHeaderSearch: false,
            } as AuraProps);
            useApiResourcesStore(storeId, core);

            const wrapper = mount(Toolbar, {
                props: {
                    ...defaultProps,
                    storeId,
                },
            });

            expect(wrapper.findComponent(GlobalSearch).exists()).toBe(false);

            // Check layout classes (6-0-6 grid)
            const toolbarTitleParent = wrapper.findComponent(ToolbarTitle).element.parentElement;
            expect(toolbarTitleParent?.className).toContain('col-md-6');

            const actionButtonsParent = wrapper.findComponent(ActionButtons).element.parentElement;
            expect(actionButtonsParent?.className).toContain('col-md-6');
            expect(actionButtonsParent?.className).toContain('d-flex justify-content-md-end');
        });

        it('should preserve mobile layout classes (col-12) regardless of showHeaderSearch', () => {
            const storeIdEnabled = 'mobile-test-enabled';
            const coreEnabled = useCoreStore(storeIdEnabled, {
                storeId: storeIdEnabled,
                ...TOP_ROW_ON,
                showHeaderSearch: true,
            } as AuraProps);
            useApiResourcesStore(storeIdEnabled, coreEnabled);

            const wrapperEnabled = mount(Toolbar, {
                props: {
                    ...defaultProps,
                    storeId: storeIdEnabled,
                },
            });

            // Check mobile classes when search is enabled
            const titleParentEnabled =
                wrapperEnabled.findComponent(ToolbarTitle).element.parentElement;
            expect(titleParentEnabled?.className).toContain('col-12');

            const searchParentEnabled =
                wrapperEnabled.findComponent(GlobalSearch).element.parentElement;
            expect(searchParentEnabled?.className).toContain('col-12');

            const actionsParentEnabled =
                wrapperEnabled.findComponent(ActionButtons).element.parentElement;
            expect(actionsParentEnabled?.className).toContain('col-12');

            // Check mobile classes when search is disabled
            const storeIdDisabled = 'mobile-test-disabled';
            const coreDisabled = useCoreStore(storeIdDisabled, {
                storeId: storeIdDisabled,
                ...TOP_ROW_ON,
                showHeaderSearch: false,
            } as AuraProps);
            useApiResourcesStore(storeIdDisabled, coreDisabled);

            const wrapperDisabled = mount(Toolbar, {
                props: {
                    ...defaultProps,
                    storeId: storeIdDisabled,
                },
            });

            const titleParentDisabled =
                wrapperDisabled.findComponent(ToolbarTitle).element.parentElement;
            expect(titleParentDisabled?.className).toContain('col-12');

            const actionsParentDisabled =
                wrapperDisabled.findComponent(ActionButtons).element.parentElement;
            expect(actionsParentDisabled?.className).toContain('col-12');
        });

        it('should handle null showHeaderSearch value (treat as false)', () => {
            const storeId = 'search-null-test';
            const core = useCoreStore(storeId, {
                storeId,
                ...TOP_ROW_ON,
                // showHeaderSearch not provided, will be null after validation
            } as AuraProps);
            useApiResourcesStore(storeId, core);

            const wrapper = mount(Toolbar, {
                props: {
                    ...defaultProps,
                    storeId,
                },
            });

            // Should behave as false (no search rendered)
            expect(wrapper.findComponent(GlobalSearch).exists()).toBe(false);

            // Check layout is 6-0-6
            const toolbarTitleParent = wrapper.findComponent(ToolbarTitle).element.parentElement;
            expect(toolbarTitleParent?.className).toContain('col-md-6');

            const actionButtonsParent = wrapper.findComponent(ActionButtons).element.parentElement;
            expect(actionButtonsParent?.className).toContain('col-md-6');
        });

        it('should keep ActionButtons right-aligned in both states', () => {
            // Test with search enabled
            const storeIdEnabled = 'alignment-test-enabled';
            const coreEnabled = useCoreStore(storeIdEnabled, {
                storeId: storeIdEnabled,
                ...TOP_ROW_ON,
                showHeaderSearch: true,
            } as AuraProps);
            useApiResourcesStore(storeIdEnabled, coreEnabled);

            const wrapperEnabled = mount(Toolbar, {
                props: {
                    ...defaultProps,
                    storeId: storeIdEnabled,
                },
            });

            const actionsParentEnabled =
                wrapperEnabled.findComponent(ActionButtons).element.parentElement;
            expect(actionsParentEnabled?.className).toContain('justify-content-md-end');

            // Test with search disabled
            const storeIdDisabled = 'alignment-test-disabled';
            const coreDisabled = useCoreStore(storeIdDisabled, {
                storeId: storeIdDisabled,
                ...TOP_ROW_ON,
                showHeaderSearch: false,
            } as AuraProps);
            useApiResourcesStore(storeIdDisabled, coreDisabled);

            const wrapperDisabled = mount(Toolbar, {
                props: {
                    ...defaultProps,
                    storeId: storeIdDisabled,
                },
            });

            const actionsParentDisabled =
                wrapperDisabled.findComponent(ActionButtons).element.parentElement;
            expect(actionsParentDisabled?.className).toContain('justify-content-md-end');
        });
    });

    describe('showToolbarTitle integration', () => {
        it('should render ToolbarTitle when showToolbarTitle is true', () => {
            const storeId = 'title-enabled-test';
            const core = useCoreStore(storeId, { storeId, showToolbarTitle: true } as AuraProps);
            useApiResourcesStore(storeId, core);

            const wrapper = mount(Toolbar, {
                props: { ...defaultProps, storeId },
            });

            expect(wrapper.findComponent(ToolbarTitle).exists()).toBe(true);
        });

        it('should NOT render ToolbarTitle when showToolbarTitle is false', () => {
            const storeId = 'title-disabled-test';
            const core = useCoreStore(storeId, {
                storeId,
                showToolbarTitle: false,
            } as AuraProps);
            useApiResourcesStore(storeId, core);

            const wrapper = mount(Toolbar, {
                props: { ...defaultProps, storeId },
            });

            expect(wrapper.findComponent(ToolbarTitle).exists()).toBe(false);
        });

        it('should apply correct layout when Title is ON and Search is OFF (6-0-6)', () => {
            const storeId = 'title-on-search-off';
            const core = useCoreStore(storeId, {
                storeId,
                ...TOP_ROW_ON,
                showHeaderSearch: false,
            } as AuraProps);
            useApiResourcesStore(storeId, core);

            const wrapper = mount(Toolbar, {
                props: { ...defaultProps, storeId },
            });

            const titleParent = wrapper.findComponent(ToolbarTitle).element.parentElement;
            const actionsParent = wrapper.findComponent(ActionButtons).element.parentElement;

            expect(titleParent?.className).toContain('col-md-6');
            expect(actionsParent?.className).toContain('col-md-6');
        });

        it('should apply correct layout when Title is OFF and Search is ON (0-9-3)', () => {
            const storeId = 'title-off-search-on';
            const core = useCoreStore(storeId, {
                storeId,
                ...TOP_ROW_ON,
                showToolbarTitle: false,
                showHeaderSearch: true,
            } as AuraProps);
            useApiResourcesStore(storeId, core);

            const wrapper = mount(Toolbar, {
                props: { ...defaultProps, storeId },
            });

            expect(wrapper.findComponent(ToolbarTitle).exists()).toBe(false);

            const searchParent = wrapper.findComponent(GlobalSearch).element.parentElement;
            const actionsParent = wrapper.findComponent(ActionButtons).element.parentElement;

            expect(searchParent?.className).toContain('col-md-9');
            expect(actionsParent?.className).toContain('col-md-3');
        });

        it('should apply correct layout when Title is OFF and Search is OFF (0-0-12)', () => {
            const storeId = 'title-off-search-off';
            const core = useCoreStore(storeId, {
                storeId,
                ...TOP_ROW_ON,
                showToolbarTitle: false,
                showHeaderSearch: false,
            } as AuraProps);
            useApiResourcesStore(storeId, core);

            const wrapper = mount(Toolbar, {
                props: { ...defaultProps, storeId },
            });

            expect(wrapper.findComponent(ToolbarTitle).exists()).toBe(false);
            expect(wrapper.findComponent(GlobalSearch).exists()).toBe(false);

            const actionsParent = wrapper.findComponent(ActionButtons).element.parentElement;
            expect(actionsParent?.className).toContain('col-12');
            // actionsParent already has col-12 from mobile, but here it's full width on desktop too (no col-md-*)
            // Actually our implementation sets class="col-12 d-flex..." so it applies everywhere
            expect(actionsParent?.className).not.toContain('col-md-');
        });
    });

    describe('defaults', () => {
        it('should render neither title, search nor action buttons without config', () => {
            const wrapper = mountWithConfig('defaults-nothing-on');

            expect(wrapper.findComponent(ToolbarTitle).exists()).toBe(false);
            expect(wrapper.findComponent(GlobalSearch).exists()).toBe(false);
            expect(wrapper.findComponent(ActionButtons).exists()).toBe(false);
        });

        it('should skip the top row when title, search and action buttons are all off', () => {
            const wrapper = mountWithConfig('defaults-no-top-row');

            // The first row is then the bottom row, which carries no mb-2 spacing
            expect(wrapper.find('.row').classes()).not.toContain('mb-2');
            expect(wrapper.findComponent(RowsSelect).exists()).toBe(true);
        });

        it('should render the top row as soon as a single action button is enabled', () => {
            const wrapper = mountWithConfig('defaults-one-button', { actionButtons: ['refresh'] });

            expect(wrapper.find('.row').classes()).toContain('mb-2');
            const actionsParent = wrapper.findComponent(ActionButtons).element.parentElement;
            expect(actionsParent?.className).toContain('col-12');
            expect(wrapper.find('[data-testid="action-refresh"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="action-settings"]').exists()).toBe(false);
        });
    });

    describe('search in the action buttons slot', () => {
        it('should move the search into the actions slot next to the title (9-0-3)', () => {
            const wrapper = mountWithConfig('search-slot-with-title', {
                showToolbarTitle: true,
                showHeaderSearch: true,
            });

            expect(wrapper.findComponent(ActionButtons).exists()).toBe(false);

            const titleParent = wrapper.findComponent(ToolbarTitle).element.parentElement;
            expect(titleParent?.className).toContain('col-md-9');

            const searchParent = wrapper.findComponent(GlobalSearch).element.parentElement;
            expect(searchParent?.className).toContain('col-12 col-md-3');
            expect(searchParent?.className).not.toContain('ms-auto');

            // No empty filler column after the search
            const topRow = wrapper.findAll('.row')[0];
            expect(topRow?.element.children).toHaveLength(2);
            expect(topRow?.element.lastElementChild).toBe(searchParent);
        });

        it('should right-align the search at the actions width when it is alone (0-0-3)', () => {
            const wrapper = mountWithConfig('search-slot-alone', { showHeaderSearch: true });

            expect(wrapper.findComponent(ActionButtons).exists()).toBe(false);

            const searchParent = wrapper.findComponent(GlobalSearch).element.parentElement;
            expect(searchParent?.className).toContain('col-12 col-md-3');
            expect(searchParent?.className).toContain('ms-auto');

            const topRow = wrapper.findAll('.row')[0];
            expect(topRow?.classes()).toContain('mb-2');
            expect(topRow?.element.children).toHaveLength(1);
        });

        it('should keep the empty filler column when only the title is shown', () => {
            const wrapper = mountWithConfig('search-slot-title-only', { showToolbarTitle: true });

            const topRow = wrapper.findAll('.row')[0];
            expect(topRow?.element.children).toHaveLength(2);
            expect(topRow?.element.lastElementChild?.className).toContain('col-md-6');
        });
    });
});
