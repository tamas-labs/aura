import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { FilterBadges } from '../FilterBadges';

describe('FilterBadges', () => {
    describe('rendering', () => {
        it('should render filter badges container', () => {
            const wrapper = mount(FilterBadges);

            expect(wrapper.find('[data-testid="filter-badges"]').exists()).toBe(true);
        });

        it('should have correct CSS classes', () => {
            const wrapper = mount(FilterBadges);

            const container = wrapper.find('[data-testid="filter-badges"]');
            expect(container.classes()).toContain('d-flex');
            expect(container.classes()).toContain('gap-2');
        });

        it('should render as div element', () => {
            const wrapper = mount(FilterBadges);

            const container = wrapper.find('[data-testid="filter-badges"]');
            expect(container.element.tagName).toBe('DIV');
        });
    });

    describe('placeholder state', () => {
        it('should render empty container as placeholder', () => {
            const wrapper = mount(FilterBadges);

            const container = wrapper.find('[data-testid="filter-badges"]');
            expect(container.text()).toBe('');
        });

        it('should not have child elements', () => {
            const wrapper = mount(FilterBadges);

            const container = wrapper.find('[data-testid="filter-badges"]');
            expect(container.element.children.length).toBe(0);
        });
    });
});
