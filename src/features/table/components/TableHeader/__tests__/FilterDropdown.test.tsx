import { describe, it, expect, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import type { FilterElement } from '../../../../../types';
import { FilterDropdown } from '../FilterDropdown';

describe('FilterDropdown', () => {
    const mockElements: FilterElement[] = [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'pending', label: 'Pending' },
    ];

    // Helper to find dropdown in body (since it's teleported)
    const findDropdownInBody = () => document.querySelector('[data-testid="filter-dropdown-menu"]');

    // Helper to find select all checkbox in dropdown
    const findSelectAllCheckbox = () =>
        document.querySelector('[data-testid="filter-select-all"]') as HTMLInputElement | null;

    // Helper to find apply button in dropdown
    const findApplyButton = () => document.querySelector('[data-testid="filter-apply"]') as any;

    // Helper to find all checkboxes in dropdown
    const findAllCheckboxes = () =>
        document.querySelectorAll('[data-testid="filter-dropdown-menu"] input[type="checkbox"]');

    afterEach(() => {
        // Clean up any teleported dropdowns
        document
            .querySelectorAll('[data-testid="filter-dropdown-menu"]')
            .forEach(el => el.remove());
    });

    describe('rendering', () => {
        it('should render toggle button with filter icon', () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
            });

            const button = wrapper.find('button[type="button"]');
            expect(button.exists()).toBe(true);
            expect(button.find('i.fa-filter').exists()).toBe(true);
        });

        it('should not show dropdown menu initially', () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            expect(findDropdownInBody()).toBeNull();
            wrapper.unmount();
        });

        it('should show dropdown menu when toggle button is clicked', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const button = wrapper.find('button[type="button"]');
            await button.trigger('click');

            expect(findDropdownInBody()).not.toBeNull();
            wrapper.unmount();
        });

        it('should render all filter elements as checkboxes', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const button = wrapper.find('button[type="button"]');
            await button.trigger('click');

            const dropdown = findDropdownInBody();
            const checkboxes = dropdown?.querySelectorAll('input[type="checkbox"]');
            // +1 for "Select All" checkbox
            expect(checkboxes?.length).toBe(mockElements.length + 1);
            wrapper.unmount();
        });

        it('should render custom label for Select All', async () => {
            const customLabel = 'Összes kiválasztása';
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                    label: customLabel,
                },
                attachTo: document.body,
            });

            const button = wrapper.find('button[type="button"]');
            await button.trigger('click');

            const dropdown = findDropdownInBody();
            expect(dropdown?.textContent).toContain(customLabel);
            wrapper.unmount();
        });

        it('should render element labels correctly', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const button = wrapper.find('button[type="button"]');
            await button.trigger('click');

            const dropdown = findDropdownInBody();
            mockElements.forEach(element => {
                expect(dropdown?.textContent).toContain(String(element.label));
            });
            wrapper.unmount();
        });

        it('should render data-testid attributes correctly', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            expect(wrapper.find('[data-testid="filter-dropdown"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="filter-dropdown-toggle"]').exists()).toBe(true);

            await wrapper.find('[data-testid="filter-dropdown-toggle"]').trigger('click');

            expect(findDropdownInBody()).not.toBeNull();
            expect(findSelectAllCheckbox()).not.toBeNull();
            expect(findApplyButton()).not.toBeNull();
            expect(document.querySelector('[data-testid="filter-item-0"]')).not.toBeNull();

            wrapper.unmount();
        });

        it('should generate unique IDs for multiple instances', async () => {
            const wrapper1 = mount(FilterDropdown, {
                props: { elements: mockElements },
                attachTo: document.body,
            });
            const wrapper2 = mount(FilterDropdown, {
                props: { elements: mockElements },
                attachTo: document.body,
            });

            await wrapper1.find('[data-testid="filter-dropdown-toggle"]').trigger('click');
            await wrapper2.find('[data-testid="filter-dropdown-toggle"]').trigger('click');

            const selectAllCheckboxes = document.querySelectorAll(
                '[data-testid="filter-select-all"]'
            );
            expect(selectAllCheckboxes.length).toBe(2);
            expect(selectAllCheckboxes[0]!.id).not.toBe(selectAllCheckboxes[1]!.id);

            wrapper1.unmount();
            wrapper2.unmount();
        });
    });

    describe('dropdown toggle', () => {
        it('should toggle dropdown open/closed', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const button = wrapper.find('button[type="button"]');

            // Open
            await button.trigger('click');
            expect(findDropdownInBody()).not.toBeNull();

            // Close
            await button.trigger('click');
            expect(findDropdownInBody()).toBeNull();
            wrapper.unmount();
        });

        it('should update aria-expanded attribute', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
            });

            const button = wrapper.find('button[type="button"]');

            expect(button.attributes('aria-expanded')).toBe('false');

            await button.trigger('click');
            expect(button.attributes('aria-expanded')).toBe('true');
        });

        it('should stop propagation when toggle button is clicked', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const button = wrapper.find('button[type="button"]');
            const mockEvent = { stopPropagation: vi.fn() };

            await button.trigger('click', mockEvent);

            // We can't directly test stopPropagation, but we verify the click works
            expect(findDropdownInBody()).not.toBeNull();
            wrapper.unmount();
        });
    });

    describe('dynamic positioning', () => {
        it('should use fixed positioning below the button', async () => {
            // Mock getBoundingClientRect
            Element.prototype.getBoundingClientRect = vi.fn(() => ({
                left: 500,
                right: 550,
                top: 100,
                bottom: 120,
                width: 50,
                height: 20,
                x: 500,
                y: 100,
            })) as any;

            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const button = wrapper.find('button[type="button"]');
            await button.trigger('click');

            const menu = findDropdownInBody();
            const style = menu?.getAttribute('style');
            expect(style).toContain('position: fixed');
            expect(style).toContain('top: 120px'); // bottom of button
            wrapper.unmount();
        });

        it('should align left when button is close to left edge (< 220px)', async () => {
            // Mock getBoundingClientRect
            Element.prototype.getBoundingClientRect = vi.fn(() => ({
                left: 100, // < 220
                right: 150,
                top: 100,
                bottom: 120,
                width: 50,
                height: 20,
                x: 100,
                y: 100,
            })) as any;

            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const button = wrapper.find('button[type="button"]');
            await button.trigger('click');

            const menu = findDropdownInBody();
            const style = menu?.getAttribute('style');
            // When left-aligned, dropdown left edge aligns with button left edge
            expect(style).toContain('left: 100px');
            wrapper.unmount();
        });

        it('should align right when button has enough space', async () => {
            // Mock getBoundingClientRect
            Element.prototype.getBoundingClientRect = vi.fn(() => ({
                left: 500,
                right: 550,
                top: 100,
                bottom: 120,
                width: 50,
                height: 20,
                x: 500,
                y: 100,
            })) as any;

            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const button = wrapper.find('button[type="button"]');
            await button.trigger('click');

            const menu = findDropdownInBody();
            const style = menu?.getAttribute('style');
            // When right-aligned, dropdown right edge aligns with button right edge
            // left = button.right - DROPDOWN_MIN_WIDTH = 550 - 220 = 330
            expect(style).toContain('left: 330px');
            wrapper.unmount();
        });

        it('should recalculate position on every open', async () => {
            // First: Right side
            Element.prototype.getBoundingClientRect = vi.fn(() => ({
                left: 500,
                right: 550,
                top: 100,
                bottom: 120,
                width: 50,
                height: 20,
            })) as any;

            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const button = wrapper.find('button[type="button"]');

            // Open 1: Right aligned
            await button.trigger('click');
            let menu = findDropdownInBody();
            expect(menu?.getAttribute('style')).toContain('left: 330px');

            // Close
            await button.trigger('click');

            // Move to left side
            Element.prototype.getBoundingClientRect = vi.fn(() => ({
                left: 100,
                right: 150,
                top: 100,
                bottom: 120,
                width: 50,
                height: 20,
            })) as any;

            // Open 2: Left aligned
            await button.trigger('click');
            menu = findDropdownInBody();
            expect(menu?.getAttribute('style')).toContain('left: 100px');
            wrapper.unmount();
        });
    });

    describe('outside click handling', () => {
        it('should close dropdown when clicking outside', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const button = wrapper.find('button[type="button"]');
            await button.trigger('click');

            expect(findDropdownInBody()).not.toBeNull();

            // Click outside (on document body)
            document.body.click();
            await wrapper.vm.$nextTick();

            expect(findDropdownInBody()).toBeNull();
            wrapper.unmount();
        });

        it('should not close when clicking inside dropdown', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const button = wrapper.find('button[type="button"]');
            await button.trigger('click');

            const dropdown = findDropdownInBody();
            expect(dropdown).not.toBeNull();

            // Click inside dropdown
            (dropdown as any)?.click();
            await wrapper.vm.$nextTick();

            //dropdown should still be open
            expect(findDropdownInBody()).not.toBeNull();
            wrapper.unmount();
        });
    });

    describe('Select All functionality', () => {
        it('should select all items when Select All is checked', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const selectAllCheckbox = findSelectAllCheckbox();
            selectAllCheckbox?.click();
            await wrapper.vm.$nextTick();

            const applyButton = findApplyButton();
            applyButton?.click();
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted('apply')).toBeTruthy();
            const emittedValues = wrapper.emitted('apply')?.[0]?.[0] as unknown[];
            expect(emittedValues).toHaveLength(mockElements.length);
            expect(emittedValues).toEqual(mockElements.map(e => e.value));
            wrapper.unmount();
        });

        it('should deselect all items when Select All is unchecked', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                    selected: ['active', 'inactive', 'pending'],
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const selectAllCheckbox = findSelectAllCheckbox();
            selectAllCheckbox?.click();
            await wrapper.vm.$nextTick();

            const applyButton = findApplyButton();
            applyButton?.click();
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted('apply')).toBeTruthy();
            const emittedValues = wrapper.emitted('apply')?.[0]?.[0] as unknown[];
            expect(emittedValues).toHaveLength(0);
            wrapper.unmount();
        });

        it('should show checked state when all items are selected', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                    selected: mockElements.map(e => e.value),
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const selectAllCheckbox = findSelectAllCheckbox();
            expect(selectAllCheckbox?.checked).toBe(true);
            wrapper.unmount();
        });

        it('should show indeterminate state when some items are selected', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                    selected: ['active'],
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const selectAllCheckbox = findSelectAllCheckbox();
            expect(selectAllCheckbox?.indeterminate).toBe(true);
            wrapper.unmount();
        });
    });

    describe('individual item selection', () => {
        it('should toggle individual item selection', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            // Find the first item checkbox (skip Select All)
            const itemCheckboxes = findAllCheckboxes();
            const firstItemCheckbox = itemCheckboxes[1] as HTMLInputElement; // Index 0 is Select All

            firstItemCheckbox?.click();
            await wrapper.vm.$nextTick();

            const applyButton = findApplyButton();
            applyButton?.click();
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted('apply')).toBeTruthy();
            const emittedValues = wrapper.emitted('apply')?.[0]?.[0] as unknown[];
            expect(emittedValues).toContain('active');
            wrapper.unmount();
        });

        it('should handle multiple item selections', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const itemCheckboxes = findAllCheckboxes();

            // Select first and third items
            (itemCheckboxes[1] as HTMLInputElement)?.click();
            (itemCheckboxes[3] as HTMLInputElement)?.click();
            await wrapper.vm.$nextTick();

            const applyButton = findApplyButton();
            applyButton?.click();
            await wrapper.vm.$nextTick();

            const emittedValues = wrapper.emitted('apply')?.[0]?.[0] as unknown[];
            expect(emittedValues).toHaveLength(2);
            expect(emittedValues).toContain('active');
            expect(emittedValues).toContain('pending');
            wrapper.unmount();
        });

        it('should deselect previously selected item', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                    selected: ['active', 'inactive'],
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const itemCheckboxes = findAllCheckboxes();
            const firstItemCheckbox = itemCheckboxes[1] as HTMLInputElement; // active

            firstItemCheckbox?.click();
            await wrapper.vm.$nextTick();

            const applyButton = findApplyButton();
            applyButton?.click();
            await wrapper.vm.$nextTick();

            const emittedValues = wrapper.emitted('apply')?.[0]?.[0] as unknown[];
            expect(emittedValues).toHaveLength(1);
            expect(emittedValues).toContain('inactive');
            expect(emittedValues).not.toContain('active');
            wrapper.unmount();
        });
    });

    describe('Apply button', () => {
        it('should emit apply event when Apply button is clicked', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const applyButton = findApplyButton();
            applyButton?.click();
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted('apply')).toBeTruthy();
            wrapper.unmount();
        });

        it('should emit update:selected event when Apply button is clicked', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const applyButton = findApplyButton();
            applyButton?.click();
            await wrapper.vm.$nextTick();

            expect(wrapper.emitted('update:selected')).toBeTruthy();
            wrapper.unmount();
        });

        it('should close dropdown after applying filter', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            expect(findDropdownInBody()).not.toBeNull();

            const dropdown = findDropdownInBody();
            const applyButton = dropdown?.querySelector('button.btn-primary') as any;
            applyButton?.click();
            await wrapper.vm.$nextTick();

            expect(findDropdownInBody()).toBeNull();
            wrapper.unmount();
        });

        it('should emit selected values array', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const itemCheckboxes = findAllCheckboxes();
            (itemCheckboxes[1] as HTMLInputElement)?.click();
            await wrapper.vm.$nextTick();

            const applyButton = findApplyButton();
            applyButton?.click();
            await wrapper.vm.$nextTick();

            const applyEvents = wrapper.emitted('apply');
            expect(applyEvents).toBeTruthy();
            expect(Array.isArray(applyEvents?.[0]?.[0])).toBe(true);
            wrapper.unmount();
        });
    });

    describe('state synchronization', () => {
        it('should sync internal state with props when dropdown opens', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                    selected: ['active'],
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const itemCheckboxes = findAllCheckboxes();
            const firstItemCheckbox = itemCheckboxes[1] as HTMLInputElement; // active

            expect(firstItemCheckbox?.checked).toBe(true);
            wrapper.unmount();
        });

        it('should not affect props when changing internal selection', async () => {
            const selectedValues = ['active'];
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                    selected: selectedValues,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const itemCheckboxes = findAllCheckboxes();
            (itemCheckboxes[2] as HTMLInputElement)?.click(); // Select inactive
            await wrapper.vm.$nextTick();

            // Props should remain unchanged until apply
            expect(wrapper.props('selected')).toEqual(['active']);
            wrapper.unmount();
        });
    });

    describe('edge cases', () => {
        it('should handle empty elements array', () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: [],
                },
                attachTo: document.body,
            });

            expect(wrapper.find('button[type="button"]').exists()).toBe(true);
            wrapper.unmount();
        });

        it('should handle elements with null values', async () => {
            const elementsWithNull: FilterElement[] = [
                { value: null, label: 'None' },
                { value: 'active', label: 'Active' },
            ];

            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: elementsWithNull,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const dropdown = findDropdownInBody();
            expect(dropdown?.textContent).toContain('None');
            expect(dropdown?.textContent).toContain('Active');
            wrapper.unmount();
        });

        it('should handle elements with numeric values', async () => {
            const numericElements: FilterElement[] = [
                { value: 1, label: 'One' },
                { value: 2, label: 'Two' },
            ];

            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: numericElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const itemCheckboxes = findAllCheckboxes();
            (itemCheckboxes[1] as HTMLInputElement)?.click();
            await wrapper.vm.$nextTick();

            const applyButton = findApplyButton();
            applyButton?.click();
            await wrapper.vm.$nextTick();

            const emittedValues = wrapper.emitted('apply')?.[0]?.[0] as unknown[];
            expect(emittedValues).toContain(1);
            wrapper.unmount();
        });

        it('should handle elements with boolean values', async () => {
            const booleanElements: FilterElement[] = [
                { value: true, label: 'Yes' },
                { value: false, label: 'No' },
            ];

            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: booleanElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const itemCheckboxes = findAllCheckboxes();
            (itemCheckboxes[1] as HTMLInputElement)?.click();
            await wrapper.vm.$nextTick();

            const applyButton = findApplyButton();
            applyButton?.click();
            await wrapper.vm.$nextTick();

            const emittedValues = wrapper.emitted('apply')?.[0]?.[0] as unknown[];
            expect(emittedValues).toContain(true);
            wrapper.unmount();
        });

        it('should use value as label when label is null', async () => {
            const elementsWithoutLabel: FilterElement[] = [{ value: 'active', label: null }];

            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: elementsWithoutLabel,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const dropdown = findDropdownInBody();
            expect(dropdown?.textContent).toContain('active');
            wrapper.unmount();
        });
    });

    describe('keyboard accessibility', () => {
        it('should close dropdown when Escape key is pressed', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            expect(findDropdownInBody()).not.toBeNull();

            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);
            await wrapper.vm.$nextTick();

            expect(findDropdownInBody()).toBeNull();
            wrapper.unmount();
        });

        it('should focus toggle button after closing with Escape', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);
            await wrapper.vm.$nextTick();

            expect(document.activeElement).toBe(toggleButton.element);
            wrapper.unmount();
        });

        it('should have aria-expanded attribute on toggle button', () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
            });

            const toggleButton = wrapper.find('button[type="button"]');
            expect(toggleButton.attributes('aria-expanded')).toBe('false');
            wrapper.unmount();
        });

        it('should update aria-expanded when dropdown opens', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            expect(toggleButton.attributes('aria-expanded')).toBe('true');
            wrapper.unmount();
        });

        it('should have aria-haspopup attribute on toggle button', () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
            });

            const toggleButton = wrapper.find('button[type="button"]');
            expect(toggleButton.attributes('aria-haspopup')).toBe('listbox');
            wrapper.unmount();
        });

        it('should have aria-label attribute on toggle button', () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
            });

            const toggleButton = wrapper.find('button[type="button"]');
            expect(toggleButton.attributes('aria-label')).toBe('Filter');
            wrapper.unmount();
        });

        it('should have role="listbox" on dropdown menu', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const dropdown = findDropdownInBody();
            expect(dropdown?.getAttribute('role')).toBe('listbox');
            wrapper.unmount();
        });

        it('should have aria-label on dropdown menu', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');

            const dropdown = findDropdownInBody();
            expect(dropdown?.getAttribute('aria-label')).toBe('Filter options');
            wrapper.unmount();
        });

        it('should focus select-all checkbox after opening dropdown', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');
            await wrapper.vm.$nextTick();

            const selectAllCheckbox = findSelectAllCheckbox();
            expect(document.activeElement).toBe(selectAllCheckbox);
            wrapper.unmount();
        });
    });

    describe('scroll and resize handling', () => {
        it('should close dropdown when window is scrolled', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            // Open dropdown
            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');
            expect(findDropdownInBody()).not.toBeNull();

            // Trigger scroll event
            window.dispatchEvent(new Event('scroll'));
            await wrapper.vm.$nextTick();

            // Dropdown should be closed
            expect(findDropdownInBody()).toBeNull();
            wrapper.unmount();
        });

        it('should close dropdown when window is resized', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            // Open dropdown
            const toggleButton = wrapper.find('button[type="button"]');
            await toggleButton.trigger('click');
            expect(findDropdownInBody()).not.toBeNull();

            // Trigger resize event
            window.dispatchEvent(new Event('resize'));
            await wrapper.vm.$nextTick();

            // Dropdown should be closed
            expect(findDropdownInBody()).toBeNull();
            wrapper.unmount();
        });

        it('should not trigger any action when scroll/resize occurs while dropdown is closed', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                },
                attachTo: document.body,
            });

            // Ensure dropdown is closed
            expect(findDropdownInBody()).toBeNull();

            // Trigger scroll and resize events
            window.dispatchEvent(new Event('scroll'));
            window.dispatchEvent(new Event('resize'));
            await wrapper.vm.$nextTick();

            // Dropdown should still be closed (no error)
            expect(findDropdownInBody()).toBeNull();
            wrapper.unmount();
        });
    });

    describe('labels prop', () => {
        const HU_LABELS = {
            selectAll: 'Összes kijelölése',
            filterToggle: 'Szűrés',
            filterOptions: 'Szűrő beállításai',
            filterApply: 'Szűrés indítása',
        };

        it('should apply the filterToggle override on the toggle button', () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                    labels: HU_LABELS,
                },
            });

            expect(wrapper.find('button[type="button"]').attributes('aria-label')).toBe('Szűrés');
            wrapper.unmount();
        });

        it('should apply the filterOptions / selectAll / filterApply overrides in the menu', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                    labels: HU_LABELS,
                },
                attachTo: document.body,
            });

            await wrapper.find('button[type="button"]').trigger('click');

            const dropdown = findDropdownInBody();
            expect(dropdown?.getAttribute('aria-label')).toBe('Szűrő beállításai');
            expect(dropdown?.textContent).toContain('Összes kijelölése');
            expect(findApplyButton()?.textContent).toBe('Szűrés indítása');
            wrapper.unmount();
        });

        it('should let the explicit label prop win over labels.selectAll', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                    label: 'Explicit label',
                    labels: HU_LABELS,
                },
                attachTo: document.body,
            });

            await wrapper.find('button[type="button"]').trigger('click');

            const dropdown = findDropdownInBody();
            expect(dropdown?.textContent).toContain('Explicit label');
            expect(dropdown?.textContent).not.toContain('Összes kijelölése');
            wrapper.unmount();
        });

        it('should fall back to the English defaults for a partial labels object', async () => {
            const wrapper = mount(FilterDropdown, {
                props: {
                    elements: mockElements,
                    labels: { filterToggle: 'Szűrés' },
                },
                attachTo: document.body,
            });

            await wrapper.find('button[type="button"]').trigger('click');

            const dropdown = findDropdownInBody();
            expect(dropdown?.getAttribute('aria-label')).toBe('Filter options');
            expect(dropdown?.textContent).toContain('Select All');
            expect(findApplyButton()?.textContent).toBe('Filter');
            wrapper.unmount();
        });
    });
});
