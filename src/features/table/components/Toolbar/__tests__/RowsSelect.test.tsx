import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { RowsSelect } from '../RowsSelect';

describe('RowsSelect', () => {
    describe('rendering', () => {
        it('should render with dropdown structure', () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange: vi.fn(),
                },
            });

            expect(wrapper.find('[data-testid="rows-select"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="rows-select-toggle"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="rows-select-menu"]').exists()).toBe(true);
        });

        it('should display selected value on toggle button', () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange: vi.fn(),
                },
            });

            const button = wrapper.find('[data-testid="rows-select-toggle"]');
            expect(button.text()).toBe('25');
        });

        it('should render all values in dropdown menu', () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50, 100],
                    selected: 25,
                    onChange: vi.fn(),
                },
            });

            const items = wrapper.findAll('.dropdown-item');
            expect(items).toHaveLength(4);
            expect(items[0]!.text()).toBe('10');
            expect(items[1]!.text()).toBe('25');
            expect(items[2]!.text()).toBe('50');
            expect(items[3]!.text()).toBe('100');
        });

        it('should mark selected value as active', () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange: vi.fn(),
                },
            });

            const items = wrapper.findAll('.dropdown-item');
            expect(items[0]!.classes()).not.toContain('active');
            expect(items[1]!.classes()).toContain('active');
            expect(items[2]!.classes()).not.toContain('active');
        });

        it('should display labels around the dropdown', () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange: vi.fn(),
                },
            });

            const labels = wrapper.findAll('label');
            expect(labels).toHaveLength(2);
            expect(labels[0]!.text()).toBe('Per page');
            expect(labels[1]!.text()).toBe('results');
        });
    });

    describe('dropdown toggle behavior', () => {
        it('should start with dropdown closed', () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange: vi.fn(),
                },
            });

            const menu = wrapper.find('[data-testid="rows-select-menu"]');
            expect(menu.classes()).not.toContain('show');
        });

        it('should open dropdown on toggle button click', async () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange: vi.fn(),
                },
            });

            const button = wrapper.find('[data-testid="rows-select-toggle"]');
            await button.trigger('click');

            const menu = wrapper.find('[data-testid="rows-select-menu"]');
            expect(menu.classes()).toContain('show');
        });

        it('should close dropdown on second toggle button click', async () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange: vi.fn(),
                },
            });

            const button = wrapper.find('[data-testid="rows-select-toggle"]');
            await button.trigger('click');
            await button.trigger('click');

            const menu = wrapper.find('[data-testid="rows-select-menu"]');
            expect(menu.classes()).not.toContain('show');
        });
    });

    describe('selection behavior', () => {
        it('should call onChange when item is clicked', async () => {
            const onChange = vi.fn();
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange,
                },
            });

            const items = wrapper.findAll('.dropdown-item');
            await items[2]!.trigger('click');

            expect(onChange).toHaveBeenCalledWith(50);
            expect(onChange).toHaveBeenCalledTimes(1);
        });

        it('should close dropdown after selection', async () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange: vi.fn(),
                },
            });

            const button = wrapper.find('[data-testid="rows-select-toggle"]');
            await button.trigger('click');

            const items = wrapper.findAll('.dropdown-item');
            await items[0]!.trigger('click');

            const menu = wrapper.find('[data-testid="rows-select-menu"]');
            expect(menu.classes()).not.toContain('show');
        });

        it('should emit correct value when clicking different items', async () => {
            const onChange = vi.fn();
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50, 100],
                    selected: 25,
                    onChange,
                },
            });

            const items = wrapper.findAll('.dropdown-item');

            await items[0]!.trigger('click');
            expect(onChange).toHaveBeenLastCalledWith(10);

            await items[3]!.trigger('click');
            expect(onChange).toHaveBeenLastCalledWith(100);
        });
    });

    describe('edge cases', () => {
        it('should handle empty values array', () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [],
                    selected: 10,
                    onChange: vi.fn(),
                },
            });

            const items = wrapper.findAll('.dropdown-item');
            expect(items).toHaveLength(0);
        });

        it('should handle single value in array', () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [25],
                    selected: 25,
                    onChange: vi.fn(),
                },
            });

            const items = wrapper.findAll('.dropdown-item');
            expect(items).toHaveLength(1);
            expect(items[0]!.classes()).toContain('active');
        });

        it('should display selected value even if not in values array', () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 99,
                    onChange: vi.fn(),
                },
            });

            const button = wrapper.find('[data-testid="rows-select-toggle"]');
            expect(button.text()).toBe('99');
        });
    });

    describe('aria attributes', () => {
        it('should have correct aria-expanded when closed', () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange: vi.fn(),
                },
            });

            const button = wrapper.find('[data-testid="rows-select-toggle"]');
            expect(button.attributes('aria-expanded')).toBe('false');
        });

        it('should have correct aria-expanded when open', async () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange: vi.fn(),
                },
            });

            const button = wrapper.find('[data-testid="rows-select-toggle"]');
            await button.trigger('click');

            expect(button.attributes('aria-expanded')).toBe('true');
        });
    });

    describe('labels prop', () => {
        it('should apply the perPage / results overrides', () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange: vi.fn(),
                    labels: { perPage: 'Oldalanként', results: 'találat' },
                },
            });

            const labels = wrapper.findAll('label');
            expect(labels[0]!.text()).toBe('Oldalanként');
            expect(labels[1]!.text()).toBe('találat');
        });

        it('should fall back to the defaults for a partial labels object', () => {
            const wrapper = mount(RowsSelect, {
                props: {
                    values: [10, 25, 50],
                    selected: 25,
                    onChange: vi.fn(),
                    labels: { perPage: 'Oldalanként' },
                },
            });

            const labels = wrapper.findAll('label');
            expect(labels[0]!.text()).toBe('Oldalanként');
            expect(labels[1]!.text()).toBe('results');
        });
    });
});
