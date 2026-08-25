import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { SettingsPanel } from '../SettingsPanel';

describe('SettingsPanel', () => {
    describe('rendering', () => {
        it('should render settings panel container', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: false },
            });

            expect(wrapper.find('[data-testid="settings-panel"]').exists()).toBe(true);
        });

        it('should have collapse class', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: false },
            });

            const panel = wrapper.find('[data-testid="settings-panel"]');
            expect(panel.classes()).toContain('collapse');
        });

        it('should render card body inside collapse', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: true },
            });

            const cardBody = wrapper.find('.card-body');
            expect(cardBody.exists()).toBe(true);
        });
    });

    describe('collapse behavior', () => {
        it('should not have show class when closed', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: false },
            });

            const panel = wrapper.find('[data-testid="settings-panel"]');
            expect(panel.classes()).not.toContain('show');
        });

        it('should have show class when open', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: true },
            });

            const panel = wrapper.find('[data-testid="settings-panel"]');
            expect(panel.classes()).toContain('show');
        });

        it('should toggle show class when isOpen changes', async () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: false },
            });

            const panel = wrapper.find('[data-testid="settings-panel"]');
            expect(panel.classes()).not.toContain('show');

            await wrapper.setProps({ isOpen: true });
            expect(panel.classes()).toContain('show');

            await wrapper.setProps({ isOpen: false });
            expect(panel.classes()).not.toContain('show');
        });
    });

    describe('content sections', () => {
        it('should render column visibility section', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: true },
            });

            const heading = wrapper.findAll('h6').filter(h => h.text() === 'Column visibility');
            expect(heading.length).toBeGreaterThan(0);
        });

        it('should render active filters section', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: true },
            });

            const heading = wrapper.findAll('h6').filter(h => h.text() === 'Active filters');
            expect(heading.length).toBeGreaterThan(0);
        });

        it('should have placeholder text for column settings', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: true },
            });

            expect(wrapper.text()).toContain('Placeholder for the column settings');
        });

        it('should have placeholder text for filter settings', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: true },
            });

            expect(wrapper.text()).toContain('Placeholder for the filter settings');
        });

        it('should have two columns layout', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: true },
            });

            const columns = wrapper.findAll('.col-md-6');
            expect(columns.length).toBe(2);
        });
    });

    describe('styling', () => {
        it('should have bg-light class on card', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: true },
            });

            const card = wrapper.find('.card');
            expect(card.classes()).toContain('bg-light');
        });

        it('should have mt-2 class on card', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: true },
            });

            const card = wrapper.find('.card');
            expect(card.classes()).toContain('mt-2');
        });

        it('should have row class for layout', () => {
            const wrapper = mount(SettingsPanel, {
                props: { isOpen: true },
            });

            const row = wrapper.find('.row');
            expect(row.exists()).toBe(true);
        });
    });
});
