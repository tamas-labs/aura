import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { FilterBadges } from '../FilterBadges';
import { useCoreStore, useApiResourcesStore } from '../../../../../state';
import type { AuraProps, ApiResourcesStore } from '../../../../../types';

const HEADER = {
    rows: [
        {
            cells: [
                { key: 'name', field: 'name', content: 'Name', searchable: true },
                { key: 'status', field: 'status', content: 'Status', filterable: true },
            ],
        },
    ],
};

describe('FilterBadges', () => {
    let counter = 0;
    let storeId: string;
    let resource: ApiResourcesStore;

    const setup = async (props: Record<string, unknown> = {}) => {
        const core = useCoreStore(storeId, { storeId } as AuraProps);
        resource = useApiResourcesStore(storeId, core);
        await resource.processResponse({ header: HEADER, items: [{ name: 'Jane' }] });

        return mount(FilterBadges, { props: { storeId, ...props } });
    };

    beforeEach(() => {
        setActivePinia(createPinia());
        storeId = `filter-badges-${++counter}`;
    });

    describe('rendering', () => {
        it('should render the container', async () => {
            const wrapper = await setup();

            expect(wrapper.find('[data-testid="filter-badges"]').exists()).toBe(true);
        });

        it('should render nothing while no filter is active', async () => {
            const wrapper = await setup();

            expect(wrapper.find('[data-testid="filter-badges"]').element.children.length).toBe(0);
        });

        it('should render a badge for the global search term', async () => {
            const wrapper = await setup();

            resource.setGlobalSearch('jane');
            await wrapper.vm.$nextTick();

            const badge = wrapper.find('[data-testid="filter-badge-global"]');
            expect(badge.exists()).toBe(true);
            expect(badge.text()).toContain('jane');
        });

        it('should label a column search from the header', async () => {
            const wrapper = await setup();

            resource.addSearch('name', 'Jane');
            await wrapper.vm.$nextTick();

            const badge = wrapper.find('[data-testid="filter-badge-search:name"]');
            expect(badge.text()).toContain('Name');
            expect(badge.text()).toContain('Jane');
        });

        it('should render a badge for a column filter', async () => {
            const wrapper = await setup();

            resource.addFilter('status', ['active', 'pending']);
            await wrapper.vm.$nextTick();

            const badge = wrapper.find('[data-testid="filter-badge-filter:status"]');
            expect(badge.text()).toContain('Status');
            expect(badge.text()).toContain('active, pending');
        });
    });

    describe('removing', () => {
        it('should clear the global search from its badge', async () => {
            const wrapper = await setup();

            resource.setGlobalSearch('jane');
            await wrapper.vm.$nextTick();
            await wrapper.find('[data-testid="filter-badge-remove-global"]').trigger('click');

            expect(resource.globalSearchTerm).toBeNull();
        });

        it('should remove a column search from its badge', async () => {
            const wrapper = await setup();

            resource.addSearch('name', 'Jane');
            await wrapper.vm.$nextTick();
            await wrapper.find('[data-testid="filter-badge-remove-search:name"]').trigger('click');

            expect(resource.searchItems).toEqual([]);
        });

        it('should remove a column filter from its badge', async () => {
            const wrapper = await setup();

            resource.addFilter('status', ['active']);
            await wrapper.vm.$nextTick();
            await wrapper
                .find('[data-testid="filter-badge-remove-filter:status"]')
                .trigger('click');

            expect(resource.filterItems).toEqual([]);
        });

        it('should give the remove button the configured aria-label', async () => {
            const wrapper = await setup();

            resource.setGlobalSearch('jane');
            await wrapper.vm.$nextTick();

            expect(
                wrapper.find('[data-testid="filter-badge-remove-global"]').attributes('aria-label')
            ).toBe('Remove filter');
        });
    });

    describe('showClearAll', () => {
        it('should show the empty-state text when nothing is active', async () => {
            const wrapper = await setup({ showClearAll: true });

            expect(wrapper.find('[data-testid="filter-badges-empty"]').text()).toBe(
                'No active filters'
            );
        });

        it('should not show the empty-state text without the prop', async () => {
            const wrapper = await setup();

            expect(wrapper.find('[data-testid="filter-badges-empty"]').exists()).toBe(false);
        });

        it('should show the clear-all button once something is active', async () => {
            const wrapper = await setup({ showClearAll: true });

            resource.addSearch('name', 'Jane');
            await wrapper.vm.$nextTick();

            expect(wrapper.find('[data-testid="filter-badges-clear-all"]').text()).toBe(
                'Clear all'
            );
            expect(wrapper.find('[data-testid="filter-badges-empty"]').exists()).toBe(false);
        });

        it('should not show the clear-all button without the prop', async () => {
            const wrapper = await setup();

            resource.addSearch('name', 'Jane');
            await wrapper.vm.$nextTick();

            expect(wrapper.find('[data-testid="filter-badges-clear-all"]').exists()).toBe(false);
        });

        it('should empty every filter slice at once', async () => {
            const wrapper = await setup({ showClearAll: true });

            resource.setGlobalSearch('jane');
            resource.addSearch('name', 'Jane');
            resource.addFilter('status', ['active']);
            await wrapper.vm.$nextTick();
            await wrapper.find('[data-testid="filter-badges-clear-all"]').trigger('click');

            expect(resource.globalSearchTerm).toBeNull();
            expect(resource.searchItems).toEqual([]);
            expect(resource.filterItems).toEqual([]);
        });
    });
});
