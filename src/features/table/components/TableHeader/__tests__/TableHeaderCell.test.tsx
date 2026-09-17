import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import type * as SpecialFormatter from '../../../utils/formatters/special.formatter';

// formatRaw relies on DOMPurify, which doesn't preserve safe tags in the
// happy-dom test environment. The component test only verifies that raw
// content is rendered as innerHTML; the actual sanitization correctness is
// covered by special.formatter.test.ts (under jsdom).
vi.mock('../../../utils/formatters/special.formatter', async importOriginal => {
    const actual = await importOriginal<typeof SpecialFormatter>();
    return {
        ...actual,
        formatRaw: (value: unknown): string =>
            value === null || value === undefined ? '' : String(value),
    };
});
import { TableHeaderCell } from '../TableHeaderCell';
import type { HeaderCell } from '../../../../../types/api-response.types';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';

describe('TableHeaderCell', () => {
    const storeId = 'test-table-header-cell';
    let core: ReturnType<typeof useCoreStore>;
    let resource: ReturnType<typeof useApiResourcesStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        core = useCoreStore(storeId, { storeId });
        resource = useApiResourcesStore(storeId, core);

        // Ensure clean state (defensive cleanup)
        resource.clearAllFilters();
        resource.clearAllSearches();
        resource.clearAllSorts();
    });

    afterEach(() => {
        // Clean up store state to prevent test pollution
        resource?.clearAllFilters();
        resource?.clearAllSearches();
        resource?.clearAllSorts();
    });

    describe('rendering', () => {
        it('should render th element with content', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.exists()).toBe(true);
            expect(th.text()).toBe('Name');
        });

        it('should render with data-testid attribute', () => {
            const cell: HeaderCell = {
                content: 'ID',
                key: 'id',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('[data-testid="table-header-cell"]').exists()).toBe(true);
        });

        it('should render with data-key attribute', () => {
            const cell: HeaderCell = {
                content: 'Email',
                key: 'email',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('data-key')).toBe('email');
        });
    });

    describe('colspan and rowspan', () => {
        it('should render with colspan attribute', () => {
            const cell: HeaderCell = {
                content: 'Price',
                key: 'price',
                colspan: 3,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('colspan')).toBe('3');
        });

        it('should render with rowspan attribute', () => {
            const cell: HeaderCell = {
                content: 'File',
                key: 'file',
                rowspan: 2,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('rowspan')).toBe('2');
        });

        it('should render with both colspan and rowspan', () => {
            const cell: HeaderCell = {
                content: 'Combined',
                key: 'combined',
                colspan: 2,
                rowspan: 3,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('colspan')).toBe('2');
            expect(th.attributes('rowspan')).toBe('3');
        });
    });

    describe('style attributes', () => {
        it('should apply width style', () => {
            const cell: HeaderCell = {
                content: 'ID',
                key: 'id',
                width: '100px',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('width: 100px');
        });

        it('should apply text-align style for align="center"', () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                align: 'center',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('text-align: center');
        });

        it('should apply text-align style for align="start" (left)', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                align: 'start',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('text-align: left');
        });

        it('should apply text-align style for align="end" (right)', () => {
            const cell: HeaderCell = {
                content: 'Price',
                key: 'price',
                align: 'end',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('text-align: right');
        });

        it('should apply color style', () => {
            const cell: HeaderCell = {
                content: 'Alert',
                key: 'alert',
                color: 'red',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('color: red');
        });

        it('should apply background color style', () => {
            const cell: HeaderCell = {
                content: 'Header',
                key: 'header',
                background: 'blue',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('background-color: blue');
        });

        it('should apply font-size style', () => {
            const cell: HeaderCell = {
                content: 'Title',
                key: 'title',
                fontSize: '18px',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('font-size: 18px');
        });

        it('should apply font-weight style', () => {
            const cell: HeaderCell = {
                content: 'Bold',
                key: 'bold',
                fontWeight: 700,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('font-weight: 700');
        });

        it('should apply line-height style', () => {
            const cell: HeaderCell = {
                content: 'Text',
                key: 'text',
                lineHeight: '1.5',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('line-height: 1.5');
        });

        it('should apply italic font-style', () => {
            const cell: HeaderCell = {
                content: 'Italic',
                key: 'italic',
                italic: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('font-style: italic');
        });

        it('should apply multiple styles together', () => {
            const cell: HeaderCell = {
                content: 'Multi',
                key: 'multi',
                width: '150px',
                align: 'center',
                color: 'white',
                background: 'blue',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            const style = th.attributes('style') || '';
            expect(style).toContain('width: 150px');
            expect(style).toContain('text-align: center');
            expect(style).toContain('color: white');
            expect(style).toContain('background-color: blue');
        });
    });

    describe('class attributes', () => {
        it('should apply custom class as string', () => {
            const cell: HeaderCell = {
                content: 'Custom',
                key: 'custom',
                class: 'fw-bold',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('fw-bold');
        });

        it('should apply custom class as array', () => {
            const cell: HeaderCell = {
                content: 'Multi Class',
                key: 'multi',
                class: ['fw-bold', 'text-primary'],
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('fw-bold');
            expect(th.classes()).toContain('text-primary');
        });

        it('should apply monospace class', () => {
            const cell: HeaderCell = {
                content: 'Code',
                key: 'code',
                monospace: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('font-monospace');
        });

        it('should apply uppercase class', () => {
            const cell: HeaderCell = {
                content: 'upper',
                key: 'upper',
                uppercase: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('text-uppercase');
        });

        it('should apply lowercase class', () => {
            const cell: HeaderCell = {
                content: 'LOWER',
                key: 'lower',
                lowercase: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('text-lowercase');
        });

        it('should apply capitalize class', () => {
            const cell: HeaderCell = {
                content: 'capitalize me',
                key: 'capitalize',
                capitalize: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('text-capitalize');
        });

        it('should apply text utility class', () => {
            const cell: HeaderCell = {
                content: 'Truncate',
                key: 'truncate',
                text: 'text-truncate',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('text-truncate');
        });

        it('should apply multiple class modifiers together', () => {
            const cell: HeaderCell = {
                content: 'Combined',
                key: 'combined',
                class: ['fw-bold', 'text-primary'],
                monospace: true,
                uppercase: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('fw-bold');
            expect(th.classes()).toContain('text-primary');
            expect(th.classes()).toContain('font-monospace');
            expect(th.classes()).toContain('text-uppercase');
        });
    });

    describe('edge cases', () => {
        it('should render empty th when content is null', () => {
            const cell: HeaderCell = {
                content: null,
                key: 'empty',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.exists()).toBe(true);
            expect(th.text()).toBe('');
        });

        it('should use label as fallback when content is missing', async () => {
            const cell: HeaderCell = {
                content: null,
                label: 'Fallback Label',
                key: 'fallback',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.text()).toBe('Fallback Label');
        });

        it('should render empty string when both content and label are missing', () => {
            const cell: HeaderCell = {
                content: null,
                key: 'no-content',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.text()).toBe('');
        });

        it('should not render colspan/rowspan attributes when not provided', () => {
            const cell: HeaderCell = {
                content: 'Normal',
                key: 'normal',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('colspan')).toBeUndefined();
            expect(th.attributes('rowspan')).toBeUndefined();
        });
    });

    describe('sortable functionality', () => {
        it('should not render sort icon when sortable is false', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                sortable: false,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            expect(wrapper.find('[data-testid="sort-icon"]').exists()).toBe(false);
        });

        it('should render sort icon when sortable is true', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            expect(wrapper.find('[data-testid="sort-icon"]').exists()).toBe(true);
            // The icon sits inside the sort button, which carries the affordance
            // (the whole `th` is not clickable)
            const sortButton = wrapper.find('[data-testid="sort-button"]');
            expect(sortButton.element.tagName).toBe('BUTTON');
            expect(sortButton.find('[data-testid="sort-icon"]').exists()).toBe(true);
        });

        it('should handle sort toggle sequence: none -> asc -> desc -> none', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            // Initial: None -> Both icon
            expect(resource.getSortDirection('name')).toBeNull();
            let icon = wrapper.find('[data-testid="sort-icon"]');
            expect(icon.classes()).toContain('fa-sort');

            // Click 1: Asc (click on sort icon, not wrapper)
            await icon.trigger('click');
            expect(resource.getSortDirection('name')).toBe('asc');
            icon = wrapper.find('[data-testid="sort-icon"]'); // Re-find as DOM rerenders
            expect(icon.classes()).toContain('fa-caret-up');

            // Click 2: Desc
            await icon.trigger('click');
            expect(resource.getSortDirection('name')).toBe('desc');
            icon = wrapper.find('[data-testid="sort-icon"]');
            expect(icon.classes()).toContain('fa-caret-down');

            // Click 3: None
            await icon.trigger('click');
            expect(resource.getSortDirection('name')).toBeNull();
            icon = wrapper.find('[data-testid="sort-icon"]');
            expect(icon.classes()).toContain('fa-sort');
        });

        it('should fallback to key if field is missing', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name_key', // No field property
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            const sortIcon = wrapper.find('[data-testid="sort-icon"]');
            await sortIcon.trigger('click');
            expect(resource.getSortDirection('name_key')).toBe('asc');
        });

        it('should sort on the reference field when set', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'user.name',
                reference: 'user.id',
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            const sortIcon = wrapper.find('[data-testid="sort-icon"]');
            await sortIcon.trigger('click');

            expect(resource.getSortDirection('user.id')).toBe('asc');
            expect(resource.getSortDirection('user.name')).toBeNull();
        });

        it('should not trigger sort when sortable is false', async () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                sortable: false,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await wrapper.trigger('click');
            expect(resource.getSortDirection('name')).toBeNull();
        });

        it('should render the sort control as a button when sortable', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            // The control is the button, not the `th` and not the bare icon
            const sortButton = wrapper.find('[data-testid="sort-button"]');
            expect(sortButton.element.tagName).toBe('BUTTON');
            expect(sortButton.attributes('type')).toBe('button');
            expect(sortButton.classes()).toContain('btn');
        });

        it('should not apply pointer cursor when not sortable', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                sortable: false,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            const th = wrapper.find('th');
            expect(th.element.style.cursor).not.toBe('pointer');
        });

        it('should display correct icon classes from config', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                field: 'name',
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            const icon = wrapper.find('[data-testid="sort-icon"]');
            expect(icon.classes()).toContain('fas');
            expect(icon.classes()).toContain('fa-sort');
            // The spacing sits on the button around the icon
            expect(wrapper.find('[data-testid="sort-button"]').classes()).toContain('ms-2');
        });

        it('should maintain content alongside sort icon', async () => {
            const cell: HeaderCell = {
                content: 'Product Name',
                key: 'name',
                field: 'name',
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.text()).toContain('Product Name');
            expect(wrapper.find('[data-testid="sort-icon"]').exists()).toBe(true);
        });
    });

    describe('value formatting', () => {
        beforeEach(() => {
            core.config.localization = 'en-US';
            core.config.currencyCode = 'USD';
        });

        it('should format numeric content when number flag is true', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: 1234.56,
                key: 'total',
                number: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            // Accept any locale format that includes the digits
            const text = th.text();
            expect(text).toMatch(/1\D*2\D*3\D*4\D*5\D*6/);
        });

        it('should not format numeric content as currency in headers', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: 1000,
                key: 'price',
                currency: 'USD',
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            // Headers skip type formatting, so numeric content displays as-is
            expect(th.text()).toBe('1000');
        });

        it('should format date content', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: '2024-12-25',
                key: 'date',
                date: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            // Accept any locale format that includes year, month, day
            const text = th.text();
            expect(text).toMatch(/2024/);
            expect(text).toMatch(/12/);
            expect(text).toMatch(/25/);
        });

        it('should apply uppercase transformation', async () => {
            const cell: HeaderCell = {
                content: 'hello world',
                key: 'text',
                uppercase: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.text()).toBe('HELLO WORLD');
        });

        it('should apply lowercase transformation', async () => {
            const cell: HeaderCell = {
                content: 'HELLO WORLD',
                key: 'text',
                lowercase: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.text()).toBe('hello world');
        });

        it('should apply capitalize transformation', async () => {
            const cell: HeaderCell = {
                content: 'hello world',
                key: 'text',
                capitalize: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.text()).toBe('Hello world');
        });

        it('should apply slice with endWith', async () => {
            const cell: HeaderCell = {
                content: 'Very Long Header Text',
                key: 'text',
                slice: 10,
                sliceEnd: '...',
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.text()).toBe('Very Long ...');
        });

        it('should handle raw HTML content', async () => {
            const cell: HeaderCell = {
                content: '<b>Bold</b> Text',
                key: 'html',
                raw: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.html()).toContain('<b>Bold</b>');
        });

        it('should apply text transformations without currency formatting in headers', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: 500,
                key: 'price',
                currency: 'EUR',
                uppercase: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            // Headers skip currency formatting but apply text transformations
            // Uppercase transforms "500" to "500" (no change on numbers)
            expect(th.text()).toBe('500');
        });

        it('should not format string content as currency when skipTypeFormatting is used', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: 'USD',
                key: 'currency',
                currency: 'USD',
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            // Should display "USD" as text, not attempt to format it as number
            expect(th.text()).toBe('USD');
        });

        it('should not format string content as number when skipTypeFormatting is used', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: 'Amount',
                key: 'amount',
                number: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            // Should display "Amount" as text, not attempt to format it as number
            expect(th.text()).toBe('Amount');
        });

        it('should preserve header text with text transformations even when currency is set', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: 'eur',
                key: 'currency',
                currency: 'EUR',
                uppercase: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            // Should apply text transformation (uppercase) but not currency formatting
            expect(th.text()).toBe('EUR');
        });
    });

    describe('bootstrap variants integration', () => {
        it('should apply table-{variant} class when background is a bootstrap variant', () => {
            const cell: HeaderCell = {
                content: 'Price',
                key: 'price',
                background: 'primary',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('table-primary');
            const style = th.attributes('style');
            expect(style === undefined || !style.includes('background-color')).toBe(true);
        });

        it('should apply text-{variant} class when color is a bootstrap variant', () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                color: 'danger',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('text-danger');
            const style = th.attributes('style');
            expect(style === undefined || !style.includes('color')).toBe(true);
        });

        it('should apply both table and text variant classes', () => {
            const cell: HeaderCell = {
                content: 'Header',
                key: 'header',
                background: 'success',
                color: 'warning',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('table-success');
            expect(th.classes()).toContain('text-warning');
        });

        it('should use inline style when color is not a bootstrap variant', () => {
            const cell: HeaderCell = {
                content: 'Custom',
                key: 'custom',
                color: 'white',
                background: '#ff0000',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('color: white');
            expect(th.attributes('style')).toContain('background-color: #ff0000');
        });

        it('should mix variant and non-variant colors', () => {
            const cell: HeaderCell = {
                content: 'Mixed',
                key: 'mixed',
                background: 'primary',
                color: 'white',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('table-primary');
            expect(th.attributes('style')).toContain('color: white');
            expect(th.attributes('style')).not.toContain('background-color');
        });

        it('should combine bootstrap variants with custom classes', () => {
            const cell: HeaderCell = {
                content: 'Styled',
                key: 'styled',
                background: 'primary',
                color: 'danger',
                class: 'fw-bold',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('fw-bold');
            expect(th.classes()).toContain('table-primary');
            expect(th.classes()).toContain('text-danger');
        });

        it('should handle align with bootstrap variants', () => {
            const cell: HeaderCell = {
                content: 'Aligned',
                key: 'aligned',
                background: 'primary',
                align: 'center',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('table-primary');
            expect(th.attributes('style')).toContain('text-align: center');
        });
    });

    describe('dataTypes classes', () => {
        it('should apply number classes from config dataTypes', () => {
            const cell: HeaderCell = {
                content: 'Amount',
                key: 'amount',
                number: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('text-end');
        });

        it('should apply currency classes from config dataTypes', () => {
            const cell: HeaderCell = {
                content: 'Price',
                key: 'price',
                currency: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('text-end');
        });

        it('should combine dataTypes classes with custom classes', () => {
            const cell: HeaderCell = {
                content: 'Total',
                key: 'total',
                number: true,
                class: 'fw-bold',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('text-end');
            expect(th.classes()).toContain('fw-bold');
        });

        it('should combine dataTypes with sortable cursor styles', () => {
            const cell: HeaderCell = {
                content: 'Sortable Amount',
                key: 'sortable_amount',
                number: true,
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('text-end');
            // Sort icon should be present, not cursor style on th
            expect(wrapper.find('[data-testid="sort-icon"]').exists()).toBe(true);
        });
    });

    describe('sort functionality', () => {
        it('should render sort icon when cell is sortable', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const sortIcon = wrapper.find('[data-testid="sort-icon"]');
            expect(sortIcon.exists()).toBe(true);
        });

        it('should not render sort icon when cell is not sortable', () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('[data-testid="sort-icon"]').exists()).toBe(false);
        });

        it('should not add onClick to th element for sortable cells', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            // The th element should not have an onClick handler
            // Only the sort icon should be clickable
            expect(th.element.onclick).toBeNull();
        });

        it('should add sort when clicking on sort icon (no current sort)', async () => {
            const cell: HeaderCell = {
                content: 'Email',
                key: 'email',
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const sortIcon = wrapper.find('[data-testid="sort-icon"]');
            await sortIcon.trigger('click');

            expect(resource.getSortDirection('email')).toBe('asc');
        });

        it('should update sort direction from asc to desc when clicking sort icon', async () => {
            const cell: HeaderCell = {
                content: 'Price',
                key: 'price',
                sortable: true,
            };

            resource.addSort('price', 'asc');

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const sortIcon = wrapper.find('[data-testid="sort-icon"]');
            await sortIcon.trigger('click');

            expect(resource.getSortDirection('price')).toBe('desc');
        });

        it('should remove sort when clicking sort icon (desc -> none)', async () => {
            const cell: HeaderCell = {
                content: 'Date',
                key: 'date',
                sortable: true,
            };

            resource.addSort('date', 'desc');

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const sortIcon = wrapper.find('[data-testid="sort-icon"]');
            await sortIcon.trigger('click');

            expect(resource.getSortDirection('date')).toBeNull();
        });

        it('should display correct icon for no sort state', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const sortIcon = wrapper.find('[data-testid="sort-icon"]');
            expect(sortIcon.classes()).toContain('fa-sort');
        });

        it('should display correct icon for asc sort state', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                sortable: true,
            };

            resource.addSort('name', 'asc');

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const sortIcon = wrapper.find('[data-testid="sort-icon"]');
            expect(sortIcon.classes()).toContain('fa-caret-up');
        });

        it('should display correct icon for desc sort state', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                sortable: true,
            };

            // Use updateSortDirection to change existing sort, or use the proper sequence
            resource.addSort('name', 'asc');
            resource.updateSortDirection('name', 'desc');

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const sortIcon = wrapper.find('[data-testid="sort-icon"]');
            expect(sortIcon.classes()).toContain('fa-caret-down');
        });

        it('should hide the sort icon from assistive technologies', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            // The icon carries no meaning of its own — the button's aria-label and
            // the th's aria-sort do; announcing the icon too would just be noise.
            expect(wrapper.find('[data-testid="sort-icon"]').attributes('aria-hidden')).toBe(
                'true'
            );
        });
    });

    describe('filter functionality', () => {
        it('should render FilterDropdown when cell has elements', () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                elements: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                ],
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            // FilterDropdown should be rendered
            expect(wrapper.findComponent({ name: 'FilterDropdown' }).exists()).toBe(true);
        });

        it('should not render FilterDropdown when cell has no elements', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.findComponent({ name: 'FilterDropdown' }).exists()).toBe(false);
        });

        it('should not render FilterDropdown when elements array is empty', () => {
            const cell: HeaderCell = {
                content: 'Type',
                key: 'type',
                elements: [],
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.findComponent({ name: 'FilterDropdown' }).exists()).toBe(false);
        });

        it('should normalize Record<string, string> elements to FilterElement[]', () => {
            const cell: HeaderCell = {
                content: 'Name',
                key: 'name',
                elements: {
                    mark: 'Mark',
                    jacob: 'Jacob',
                    larry: 'Larry',
                },
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const filterDropdown = wrapper.findComponent({ name: 'FilterDropdown' });
            expect(filterDropdown.exists()).toBe(true);

            const elementsProps = filterDropdown.props('elements');
            expect(Array.isArray(elementsProps)).toBe(true);
            expect(elementsProps).toHaveLength(3);
            expect(elementsProps[0]).toEqual({ value: 'mark', label: 'Mark' });
            expect(elementsProps[1]).toEqual({ value: 'jacob', label: 'Jacob' });
            expect(elementsProps[2]).toEqual({ value: 'larry', label: 'Larry' });
        });

        it('should normalize simple array to FilterElement[]', () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                elements: ['active', 'inactive', 'pending'],
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const filterDropdown = wrapper.findComponent({ name: 'FilterDropdown' });
            expect(filterDropdown.exists()).toBe(true);

            const elementsProps = filterDropdown.props('elements');
            expect(Array.isArray(elementsProps)).toBe(true);
            expect(elementsProps).toHaveLength(3);
            expect(elementsProps[0]).toEqual({ value: 'active', label: 'active' });
            expect(elementsProps[1]).toEqual({ value: 'inactive', label: 'inactive' });
            expect(elementsProps[2]).toEqual({ value: 'pending', label: 'pending' });
        });

        it('should pass through FilterElement[] without modification', () => {
            const elements = [
                { value: 1, label: 'One' },
                { value: 2, label: 'Two' },
            ];

            const cell: HeaderCell = {
                content: 'Numbers',
                key: 'numbers',
                elements,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const filterDropdown = wrapper.findComponent({ name: 'FilterDropdown' });
            expect(filterDropdown.exists()).toBe(true);

            const elementsProps = filterDropdown.props('elements');
            expect(elementsProps).toEqual(elements);
        });

        it('should handle elements with numeric values in Record', () => {
            const cell: HeaderCell = {
                content: 'Priority',
                key: 'priority',
                elements: {
                    '1': 'Low',
                    '2': 'Medium',
                    '3': 'High',
                },
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const filterDropdown = wrapper.findComponent({ name: 'FilterDropdown' });
            expect(filterDropdown.exists()).toBe(true);

            const elementsProps = filterDropdown.props('elements');
            expect(elementsProps).toHaveLength(3);
            expect(elementsProps[0]).toEqual({ value: '1', label: 'Low' });
        });

        it('should handle numeric array elements', () => {
            const cell: HeaderCell = {
                content: 'Years',
                key: 'years',
                elements: [2020, 2021, 2022],
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const filterDropdown = wrapper.findComponent({ name: 'FilterDropdown' });
            expect(filterDropdown.exists()).toBe(true);

            const elementsProps = filterDropdown.props('elements');
            expect(elementsProps).toHaveLength(3);
            expect(elementsProps[0]).toEqual({ value: 2020, label: 2020 });
            expect(elementsProps[1]).toEqual({ value: 2021, label: 2021 });
        });

        it('should pass elements to FilterDropdown', () => {
            const elements = [
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
            ];

            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                elements,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const filterDropdown = wrapper.findComponent({ name: 'FilterDropdown' });
            expect(filterDropdown.props('elements')).toEqual(elements);
        });

        it('should handle apply event from FilterDropdown', async () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                field: 'status',
                elements: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                ],
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const filterDropdown = wrapper.findComponent({ name: 'FilterDropdown' });
            await filterDropdown.vm.$emit('apply', ['active']);

            // Check if filter was added to store
            expect(resource.getFilterValues('status')).toEqual(['active']);
        });

        it('should update existing filter when apply is called again', async () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                field: 'status',
                elements: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                ],
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const filterDropdown = wrapper.findComponent({ name: 'FilterDropdown' });

            // First apply
            await filterDropdown.vm.$emit('apply', ['active']);
            expect(resource.getFilterValues('status')).toEqual(['active']);

            // Second apply with different values
            await filterDropdown.vm.$emit('apply', ['inactive']);
            expect(resource.getFilterValues('status')).toEqual(['inactive']);
        });

        it('should remove filter when apply is called with empty array', async () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                field: 'status',
                elements: [{ value: 'active', label: 'Active' }],
            };

            // Pre-add a filter
            resource.addFilter('status', ['active']);
            expect(resource.getFilterValues('status')).toEqual(['active']);

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const filterDropdown = wrapper.findComponent({ name: 'FilterDropdown' });
            await filterDropdown.vm.$emit('apply', []);

            // Filter should be removed
            expect(resource.getFilterValues('status')).toBeNull();
        });

        it('should pass current filter values to FilterDropdown as selected prop', () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                field: 'status',
                elements: [
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                ],
            };

            // Pre-set filter in store
            resource.addFilter('status', ['active', 'inactive']);

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const filterDropdown = wrapper.findComponent({ name: 'FilterDropdown' });
            expect(filterDropdown.props('selected')).toEqual(['active', 'inactive']);
        });

        it('should pass empty array as selected when no filter exists', () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                elements: [{ value: 'active', label: 'Active' }],
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const filterDropdown = wrapper.findComponent({ name: 'FilterDropdown' });
            expect(filterDropdown.props('selected')).toEqual([]);
        });

        it('should render both sort icon and filter dropdown when applicable', () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                sortable: true,
                elements: [{ value: 'active', label: 'Active' }],
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('[data-testid="sort-icon"]').exists()).toBe(true);
            expect(wrapper.findComponent({ name: 'FilterDropdown' }).exists()).toBe(true);
        });

        it('should wrap controls in flex container when present', () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                sortable: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const controlsContainer = wrapper.find('.d-inline-flex.align-items-center');
            expect(controlsContainer.exists()).toBe(true);
        });
    });

    describe('date filter (calendar)', () => {
        it('should render FilterCalendar instead of FilterDropdown for a filterable date column', () => {
            const cell: HeaderCell = {
                content: 'Created at',
                key: 'created_at',
                filterable: true,
                date: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            expect(wrapper.findComponent({ name: 'FilterCalendar' }).exists()).toBe(true);
            expect(wrapper.findComponent({ name: 'FilterDropdown' }).exists()).toBe(false);
        });

        it('should not render FilterCalendar for a date column that is not filterable', () => {
            const cell: HeaderCell = {
                content: 'Created at',
                key: 'created_at',
                date: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            expect(wrapper.findComponent({ name: 'FilterCalendar' }).exists()).toBe(false);
        });

        it('should render FilterDropdown, not FilterCalendar, for a filterable non-date column', () => {
            const cell: HeaderCell = {
                content: 'Status',
                key: 'status',
                filterable: true,
                elements: [{ value: 'active', label: 'Active' }],
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            expect(wrapper.findComponent({ name: 'FilterCalendar' }).exists()).toBe(false);
            expect(wrapper.findComponent({ name: 'FilterDropdown' }).exists()).toBe(true);
        });

        it('should add a single-value filter when FilterCalendar emits apply', async () => {
            const cell: HeaderCell = {
                content: 'Created at',
                key: 'created_at',
                field: 'created_at',
                filterable: true,
                date: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            const filterCalendar = wrapper.findComponent({ name: 'FilterCalendar' });
            await filterCalendar.vm.$emit('apply', ['2026-03-15']);

            expect(resource.getFilterValues('created_at')).toEqual(['2026-03-15']);
        });

        it('should remove the filter when FilterCalendar emits apply with an empty array', async () => {
            const cell: HeaderCell = {
                content: 'Created at',
                key: 'created_at',
                field: 'created_at',
                filterable: true,
                date: true,
            };

            resource.addFilter('created_at', ['2026-03-15']);

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            const filterCalendar = wrapper.findComponent({ name: 'FilterCalendar' });
            await filterCalendar.vm.$emit('apply', []);

            expect(resource.getFilterValues('created_at')).toBeNull();
        });

        it('should pass the current filter value to FilterCalendar as the value prop', () => {
            const cell: HeaderCell = {
                content: 'Created at',
                key: 'created_at',
                field: 'created_at',
                filterable: true,
                date: true,
            };

            resource.addFilter('created_at', ['2026-03-15']);

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            const filterCalendar = wrapper.findComponent({ name: 'FilterCalendar' });
            expect(filterCalendar.props('value')).toBe('2026-03-15');
        });

        it('should pass null as the value prop when no filter exists', () => {
            const cell: HeaderCell = {
                content: 'Created at',
                key: 'created_at',
                filterable: true,
                date: true,
            };

            const wrapper = mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            const filterCalendar = wrapper.findComponent({ name: 'FilterCalendar' });
            expect(filterCalendar.props('value')).toBeNull();
        });
    });

    describe('accessibility', () => {
        const SORT_BUTTON_SELECTOR = '[data-testid="sort-button"]';

        const mountCell = (cell: HeaderCell) =>
            mount(TableHeaderCell, {
                props: { cell, cellIndex: 0, storeId },
            });

        // Without a scope a screen reader cannot associate a data cell with its
        // header — the most basic requirement for a data table (WCAG 1.3.1).
        it('should mark the header cell as a column header', () => {
            const wrapper = mountCell({ content: 'Name', key: 'name' });

            expect(wrapper.find('th').attributes('scope')).toBe('col');
        });

        it('should use colgroup scope for a spanning header cell', () => {
            const wrapper = mountCell({ content: 'Contact', key: 'contact', colspan: 2 });

            expect(wrapper.find('th').attributes('scope')).toBe('colgroup');
        });

        it('should not announce a sort state on a plain column', () => {
            const wrapper = mountCell({ content: 'Name', key: 'name' });

            expect(wrapper.find('th').attributes('aria-sort')).toBeUndefined();
        });

        // `none` on an unsorted sortable column is what tells the user the column
        // can be sorted at all.
        it('should report an unsorted sortable column as none', () => {
            const wrapper = mountCell({ content: 'Name', key: 'name', sortable: true });

            expect(wrapper.find('th').attributes('aria-sort')).toBe('none');
        });

        it('should follow the sort direction in aria-sort', async () => {
            const wrapper = mountCell({
                content: 'Name',
                key: 'name',
                field: 'name',
                sortable: true,
            });

            await wrapper.find(SORT_BUTTON_SELECTOR).trigger('click');
            expect(wrapper.find('th').attributes('aria-sort')).toBe('ascending');

            await wrapper.find(SORT_BUTTON_SELECTOR).trigger('click');
            expect(wrapper.find('th').attributes('aria-sort')).toBe('descending');

            await wrapper.find(SORT_BUTTON_SELECTOR).trigger('click');
            expect(wrapper.find('th').attributes('aria-sort')).toBe('none');
        });

        // A native button is focusable and reacts to Enter/Space on its own; the
        // `<i>` it replaced was mouse-only.
        it('should expose the sort control to the keyboard', () => {
            const wrapper = mountCell({ content: 'Name', key: 'name', sortable: true });
            const sortButton = wrapper.find(SORT_BUTTON_SELECTOR);

            expect(sortButton.element.tagName).toBe('BUTTON');
            expect(sortButton.attributes('disabled')).toBeUndefined();
            expect(sortButton.attributes('tabindex')).toBeUndefined();
        });

        it('should use the English default aria-label on the sort button', () => {
            const wrapper = mountCell({ content: 'Name', key: 'name', sortable: true });

            expect(wrapper.find(SORT_BUTTON_SELECTOR).attributes('aria-label')).toBe('Sort column');
        });

        it('should use the labels.sortColumn override from the global config', () => {
            const wrapper = mount(TableHeaderCell, {
                props: {
                    cell: { content: 'Name', key: 'name', sortable: true },
                    cellIndex: 0,
                    storeId: 'test-table-header-cell-labels',
                },
                global: {
                    config: {
                        globalProperties: {
                            $aura: { labels: { sortColumn: 'Oszlop rendezése' } },
                        } as never,
                    },
                },
            });

            expect(wrapper.find(SORT_BUTTON_SELECTOR).attributes('aria-label')).toBe(
                'Oszlop rendezése'
            );
        });
    });
});
