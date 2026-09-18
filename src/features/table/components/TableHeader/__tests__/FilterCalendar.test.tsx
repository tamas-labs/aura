import { describe, it, expect, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { FilterCalendar } from '../FilterCalendar';

describe('FilterCalendar', () => {
    // Helper to find the panel in body (since it's teleported)
    const findMenuInBody = () => document.querySelector('[data-testid="filter-calendar-menu"]');

    const findDateInput = () =>
        document.querySelector('[data-testid="filter-calendar-input"]') as HTMLInputElement | null;

    const findApplyButton = () =>
        document.querySelector('[data-testid="filter-calendar-apply"]') as any;

    afterEach(() => {
        document
            .querySelectorAll('[data-testid="filter-calendar-menu"]')
            .forEach(el => el.remove());
    });

    describe('rendering', () => {
        it('should render toggle button with the default filter icon when no filter is active', () => {
            const wrapper = mount(FilterCalendar);

            const button = wrapper.find('button[type="button"]');
            expect(button.exists()).toBe(true);
            expect(button.find('i.fa-filter').exists()).toBe(true);
            expect(button.find('i.fa-filter-circle-xmark').exists()).toBe(false);
            wrapper.unmount();
        });

        it('should render the filterableChecked icon when a filter value is active', () => {
            const wrapper = mount(FilterCalendar, { props: { value: '2026-03-15' } });

            const button = wrapper.find('button[type="button"]');
            expect(button.find('i.fa-filter-circle-xmark').exists()).toBe(true);
            expect(button.find('i.fa-filter:not(.fa-filter-circle-xmark)').exists()).toBe(false);
            wrapper.unmount();
        });

        it('should honour icons overrides from config.icons', () => {
            const wrapper = mount(FilterCalendar, {
                props: {
                    icons: {
                        filterable: ['fas', 'fa-custom'],
                        filterableChecked: ['fas', 'fa-active'],
                    },
                },
            });

            expect(wrapper.find('i.fa-custom').exists()).toBe(true);
            wrapper.unmount();

            const activeWrapper = mount(FilterCalendar, {
                props: {
                    value: '2026-03-15',
                    icons: {
                        filterable: ['fas', 'fa-custom'],
                        filterableChecked: ['fas', 'fa-active'],
                    },
                },
            });

            expect(activeWrapper.find('i.fa-active').exists()).toBe(true);
            activeWrapper.unmount();
        });

        it('should not show the panel initially', () => {
            const wrapper = mount(FilterCalendar, { attachTo: document.body });

            expect(findMenuInBody()).toBeNull();
            wrapper.unmount();
        });

        it('should show the panel with a date input when the toggle is clicked', async () => {
            const wrapper = mount(FilterCalendar, { attachTo: document.body });

            await wrapper.find('button[type="button"]').trigger('click');

            expect(findMenuInBody()).not.toBeNull();
            expect(findDateInput()?.type).toBe('date');
            wrapper.unmount();
        });

        it('should render data-testid attributes correctly', async () => {
            const wrapper = mount(FilterCalendar, { attachTo: document.body });

            expect(wrapper.find('[data-testid="filter-calendar"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="filter-calendar-toggle"]').exists()).toBe(true);

            await wrapper.find('[data-testid="filter-calendar-toggle"]').trigger('click');

            expect(findMenuInBody()).not.toBeNull();
            expect(findDateInput()).not.toBeNull();
            expect(findApplyButton()).not.toBeNull();
            wrapper.unmount();
        });
    });

    describe('value pre-fill', () => {
        it('should pre-fill the date input with the value prop when opened', async () => {
            const wrapper = mount(FilterCalendar, {
                props: { value: '2026-03-15' },
                attachTo: document.body,
            });

            await wrapper.find('button[type="button"]').trigger('click');

            expect(findDateInput()?.value).toBe('2026-03-15');
            wrapper.unmount();
        });

        it('should leave the date input blank when value is null', async () => {
            const wrapper = mount(FilterCalendar, {
                props: { value: null },
                attachTo: document.body,
            });

            await wrapper.find('button[type="button"]').trigger('click');

            expect(findDateInput()?.value).toBe('');
            wrapper.unmount();
        });
    });

    describe('apply behaviour', () => {
        it('should emit apply with a one-element array holding the chosen date', async () => {
            const wrapper = mount(FilterCalendar, { attachTo: document.body });

            await wrapper.find('button[type="button"]').trigger('click');

            const input = findDateInput()!;
            input.value = '2026-01-01';
            input.dispatchEvent(new Event('input'));
            await wrapper.vm.$nextTick();

            findApplyButton()?.click();
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted('apply')).toBeTruthy();
            expect(wrapper.emitted('apply')?.[0]?.[0]).toEqual(['2026-01-01']);
            wrapper.unmount();
        });

        it('should emit apply with an empty array when the input is left blank', async () => {
            const wrapper = mount(FilterCalendar, { attachTo: document.body });

            await wrapper.find('button[type="button"]').trigger('click');
            findApplyButton()?.click();
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted('apply')?.[0]?.[0]).toEqual([]);
            wrapper.unmount();
        });

        it('should clear a previously selected date when applied blank', async () => {
            const wrapper = mount(FilterCalendar, {
                props: { value: '2026-03-15' },
                attachTo: document.body,
            });

            await wrapper.find('button[type="button"]').trigger('click');

            const input = findDateInput()!;
            input.value = '';
            input.dispatchEvent(new Event('input'));
            await wrapper.vm.$nextTick();

            findApplyButton()?.click();
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted('apply')?.[0]?.[0]).toEqual([]);
            wrapper.unmount();
        });

        it('should close the panel after applying', async () => {
            const wrapper = mount(FilterCalendar, { attachTo: document.body });

            await wrapper.find('button[type="button"]').trigger('click');
            expect(findMenuInBody()).not.toBeNull();

            findApplyButton()?.click();
            await wrapper.vm.$nextTick();

            expect(findMenuInBody()).toBeNull();
            wrapper.unmount();
        });
    });

    describe('dismissal', () => {
        it('should close when clicking outside', async () => {
            const wrapper = mount(FilterCalendar, { attachTo: document.body });

            await wrapper.find('button[type="button"]').trigger('click');
            expect(findMenuInBody()).not.toBeNull();

            document.body.click();
            await wrapper.vm.$nextTick();

            expect(findMenuInBody()).toBeNull();
            wrapper.unmount();
        });

        it('should close on Escape and refocus the toggle button', async () => {
            const wrapper = mount(FilterCalendar, { attachTo: document.body });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            await wrapper.vm.$nextTick();

            expect(findMenuInBody()).toBeNull();
            expect(document.activeElement).toBe(toggleButton.element);
            wrapper.unmount();
        });

        it('should close on window scroll and resize', async () => {
            const wrapper = mount(FilterCalendar, { attachTo: document.body });

            await wrapper.find('button[type="button"]').trigger('click');
            expect(findMenuInBody()).not.toBeNull();

            window.dispatchEvent(new Event('scroll'));
            await wrapper.vm.$nextTick();
            expect(findMenuInBody()).toBeNull();

            await wrapper.find('button[type="button"]').trigger('click');
            window.dispatchEvent(new Event('resize'));
            await wrapper.vm.$nextTick();
            expect(findMenuInBody()).toBeNull();

            wrapper.unmount();
        });
    });

    describe('labels prop', () => {
        const HU_LABELS = {
            filterToggle: 'Szűrés',
            filterOptions: 'Szűrő beállításai',
            filterApply: 'Szűrés indítása',
        };

        it('should apply the filterToggle override on the toggle button', () => {
            const wrapper = mount(FilterCalendar, {
                props: { labels: HU_LABELS },
            });

            expect(wrapper.find('button[type="button"]').attributes('aria-label')).toBe('Szűrés');
            wrapper.unmount();
        });

        it('should apply the filterOptions / filterApply overrides in the panel', async () => {
            const wrapper = mount(FilterCalendar, {
                props: { labels: HU_LABELS },
                attachTo: document.body,
            });

            await wrapper.find('button[type="button"]').trigger('click');

            expect(findMenuInBody()?.getAttribute('aria-label')).toBe('Szűrő beállításai');
            expect(findApplyButton()?.textContent).toBe('Szűrés indítása');
            wrapper.unmount();
        });

        it('should fall back to the English defaults for a partial labels object', async () => {
            const wrapper = mount(FilterCalendar, {
                props: { labels: { filterToggle: 'Szűrés' } },
                attachTo: document.body,
            });

            await wrapper.find('button[type="button"]').trigger('click');

            expect(findMenuInBody()?.getAttribute('aria-label')).toBe('Filter options');
            expect(findApplyButton()?.textContent).toBe('Filter');
            wrapper.unmount();
        });
    });
});
