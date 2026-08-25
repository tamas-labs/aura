import { describe, it, expect, beforeEach, vi } from 'vitest';
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
import { TableFooterCell } from '../TableFooterCell';
import type { HeaderCell } from '../../../../../types/api-response.types';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';

describe('TableFooterCell', () => {
    const storeId = 'test-table-footer-cell';
    let core: ReturnType<typeof useCoreStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        core = useCoreStore(storeId, { storeId });
        useApiResourcesStore(storeId, core);
        core.config.localization = 'en-US';
        core.config.currencyCode = 'USD';
    });

    describe('rendering', () => {
        it('should render th element with content', async () => {
            const cell: HeaderCell = {
                content: 'Total',
                key: 'total',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.exists()).toBe(true);
            expect(th.text()).toBe('Total');
        });

        it('should render th element not td', () => {
            const cell: HeaderCell = {
                content: 'Footer',
                key: 'footer',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('th').exists()).toBe(true);
            expect(wrapper.find('td').exists()).toBe(false);
        });

        it('should render with data-testid attribute', () => {
            const cell: HeaderCell = {
                content: 'Sum',
                key: 'sum',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('[data-testid="table-footer-cell"]').exists()).toBe(true);
        });

        it('should render with data-key attribute', () => {
            const cell: HeaderCell = {
                content: 'Count',
                key: 'count',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('data-key')).toBe('count');
        });
    });

    describe('styling', () => {
        it('should apply width style', () => {
            const cell: HeaderCell = {
                content: 'Width Test',
                key: 'width',
                width: '200px',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('width: 200px');
        });

        it('should apply text alignment', () => {
            const cell: HeaderCell = {
                content: 'Centered',
                key: 'center',
                align: 'center',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('style')).toContain('text-align: center');
        });

        it('should apply color styles', () => {
            const cell: HeaderCell = {
                content: 'Colored',
                key: 'colored',
                color: '#ff0000',
                background: '#00ff00',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            const style = th.attributes('style');
            expect(style).toContain('color: #ff0000');
            expect(style).toContain('background-color: #00ff00');
        });

        it('should apply font styles', () => {
            const cell: HeaderCell = {
                content: 'Styled',
                key: 'styled',
                fontSize: '16px',
                fontWeight: '700',
                lineHeight: '1.5',
                italic: true,
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            const style = th.attributes('style');
            expect(style).toContain('font-size: 16px');
            expect(style).toContain('font-weight: 700');
            expect(style).toContain('line-height: 1.5');
            expect(style).toContain('font-style: italic');
        });
    });

    describe('CSS classes', () => {
        it('should apply single class string', () => {
            const cell: HeaderCell = {
                content: 'Classed',
                key: 'classed',
                class: 'custom-class',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('th').classes()).toContain('custom-class');
        });

        it('should apply array of classes', () => {
            const cell: HeaderCell = {
                content: 'Multi Class',
                key: 'multi',
                class: ['class-1', 'class-2', 'class-3'],
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('class-1');
            expect(th.classes()).toContain('class-2');
            expect(th.classes()).toContain('class-3');
        });

        it('should apply monospace class', () => {
            const cell: HeaderCell = {
                content: '12345',
                key: 'mono',
                monospace: true,
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('th').classes()).toContain('font-monospace');
        });

        it('should apply text transformation classes', () => {
            const cell1: HeaderCell = {
                content: 'uppercase',
                key: 'up',
                uppercase: true,
            };

            const wrapper1 = mount(TableFooterCell, {
                props: { cell: cell1, cellIndex: 0, storeId },
            });
            expect(wrapper1.find('th').classes()).toContain('text-uppercase');

            const cell2: HeaderCell = {
                content: 'LOWERCASE',
                key: 'low',
                lowercase: true,
            };

            const wrapper2 = mount(TableFooterCell, {
                props: { cell: cell2, cellIndex: 0, storeId },
            });
            expect(wrapper2.find('th').classes()).toContain('text-lowercase');

            const cell3: HeaderCell = {
                content: 'capitalize',
                key: 'cap',
                capitalize: true,
            };

            const wrapper3 = mount(TableFooterCell, {
                props: { cell: cell3, cellIndex: 0, storeId },
            });
            expect(wrapper3.find('th').classes()).toContain('text-capitalize');
        });

        it('should apply text alignment class', () => {
            const cell: HeaderCell = {
                content: 'Text Align',
                key: 'align',
                text: 'text-end',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('th').classes()).toContain('text-end');
        });
    });

    describe('attributes', () => {
        it('should apply colspan attribute', () => {
            const cell: HeaderCell = {
                content: 'Span 2',
                key: 'span2',
                colspan: 2,
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('th').attributes('colspan')).toBe('2');
        });

        it('should apply rowspan attribute', () => {
            const cell: HeaderCell = {
                content: 'Span 3',
                key: 'span3',
                rowspan: 3,
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('th').attributes('rowspan')).toBe('3');
        });

        it('should apply both colspan and rowspan', () => {
            const cell: HeaderCell = {
                content: 'Span Both',
                key: 'both',
                colspan: 2,
                rowspan: 2,
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.attributes('colspan')).toBe('2');
            expect(th.attributes('rowspan')).toBe('2');
        });
    });

    describe('edge cases', () => {
        it('should render empty string when content and label are null', () => {
            const cell: HeaderCell = {
                content: null,
                label: null,
                key: 'empty',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('th').text()).toBe('');
        });

        it('should fallback to label when content is null', async () => {
            const cell: HeaderCell = {
                content: null,
                label: 'Fallback Label',
                key: 'fallback',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            await flushPromises();
            expect(wrapper.find('th').text()).toBe('Fallback Label');
        });

        it('should prioritize content over label', async () => {
            const cell: HeaderCell = {
                content: 'Content',
                label: 'Label',
                key: 'priority',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            await flushPromises();
            expect(wrapper.find('th').text()).toBe('Content');
        });

        it('should handle cell with only key', () => {
            const cell: HeaderCell = {
                content: null,
                key: 'minimal',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.exists()).toBe(true);
            expect(th.attributes('data-key')).toBe('minimal');
        });

        it('should handle different cellIndex values', () => {
            const cell: HeaderCell = {
                content: 'Test',
                key: 'test',
            };

            const wrapper1 = mount(TableFooterCell, {
                props: { cell, cellIndex: 0, storeId },
            });
            expect(wrapper1.find('th').exists()).toBe(true);

            const wrapper2 = mount(TableFooterCell, {
                props: { cell, cellIndex: 5, storeId },
            });
            expect(wrapper2.find('th').exists()).toBe(true);

            const wrapper3 = mount(TableFooterCell, {
                props: { cell, cellIndex: 99, storeId },
            });
            expect(wrapper3.find('th').exists()).toBe(true);
        });
    });

    describe('complex combinations', () => {
        it('should handle cell with multiple styles and classes', async () => {
            const cell: HeaderCell = {
                content: 'Complex',
                key: 'complex',
                width: '150px',
                align: 'center',
                color: '#333',
                background: '#f0f0f0',
                class: ['custom-1', 'custom-2'],
                monospace: true,
                uppercase: true,
                colspan: 2,
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.exists()).toBe(true);
            expect(th.text()).toBe('COMPLEX');
            expect(th.attributes('data-key')).toBe('complex');
            expect(th.attributes('colspan')).toBe('2');
            expect(th.classes()).toContain('custom-1');
            expect(th.classes()).toContain('custom-2');
            expect(th.classes()).toContain('font-monospace');
            expect(th.classes()).toContain('text-uppercase');
        });
    });

    describe('value formatting', () => {
        it('should format numeric content when number flag is true', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: 9876.54,
                key: 'total',
                number: true,
            };

            const wrapper = mount(TableFooterCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            // Accept any locale format that includes the digits
            const text = th.text();
            expect(text).toMatch(/9\D*8\D*7\D*6\D*5\D*4/);
        });

        it('should not format numeric content as currency in footers', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: 2500,
                key: 'price',
                currency: 'USD',
            };

            const wrapper = mount(TableFooterCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            // Footers skip type formatting, so numeric content displays as-is
            expect(th.text()).toBe('2500');
        });

        it('should format date content', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: '2024-03-15',
                key: 'date',
                date: true,
            };

            const wrapper = mount(TableFooterCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            // Accept any locale format that includes year, month, day
            const text = th.text();
            expect(text).toMatch(/2024/);
            expect(text).toMatch(/03|3/);
            expect(text).toMatch(/15/);
        });

        it('should apply uppercase transformation', async () => {
            const cell: HeaderCell = {
                content: 'total sum',
                key: 'text',
                uppercase: true,
            };

            const wrapper = mount(TableFooterCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.text()).toBe('TOTAL SUM');
        });

        it('should apply lowercase transformation', async () => {
            const cell: HeaderCell = {
                content: 'GRAND TOTAL',
                key: 'text',
                lowercase: true,
            };

            const wrapper = mount(TableFooterCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.text()).toBe('grand total');
        });

        it('should apply capitalize transformation', async () => {
            const cell: HeaderCell = {
                content: 'total amount',
                key: 'text',
                capitalize: true,
            };

            const wrapper = mount(TableFooterCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.text()).toBe('Total amount');
        });

        it('should apply slice with endWith', async () => {
            const cell: HeaderCell = {
                content: 'Very Long Footer Text',
                key: 'text',
                slice: 10,
                sliceEnd: '...',
            };

            const wrapper = mount(TableFooterCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.text()).toBe('Very Long ...');
        });

        it('should handle raw HTML content', async () => {
            const cell: HeaderCell = {
                content: '<strong>Total:</strong> 100',
                key: 'html',
                raw: true,
            };

            const wrapper = mount(TableFooterCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            expect(th.html()).toContain('<strong>Total:</strong>');
        });

        it('should combine number formatting with transformations', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: 1234.56,
                key: 'amount',
                number: true,
            };

            const wrapper = mount(TableFooterCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            // Accept any locale format that includes the digits
            const text = th.text();
            expect(text).toMatch(/1\D*2\D*3\D*4\D*5\D*6/);
        });

        it('should not format string content as currency when skipTypeFormatting is used', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: 'USD',
                key: 'currency',
                currency: 'USD',
            };

            const wrapper = mount(TableFooterCell, {
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
                content: 'Total',
                key: 'total',
                number: true,
            };

            const wrapper = mount(TableFooterCell, {
                props: { cell, cellIndex: 0, storeId },
            });

            await flushPromises();
            const th = wrapper.find('th');
            // Should display "Total" as text, not attempt to format it as number
            expect(th.text()).toBe('Total');
        });

        it('should preserve footer text with text transformations even when currency is set', async () => {
            core.config.localization = 'en-US';
            const cell: HeaderCell = {
                content: 'eur',
                key: 'currency',
                currency: 'EUR',
                uppercase: true,
            };

            const wrapper = mount(TableFooterCell, {
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
                content: 'Total',
                key: 'total',
                background: 'primary',
            };

            const wrapper = mount(TableFooterCell, {
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

            const wrapper = mount(TableFooterCell, {
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
                content: 'Footer',
                key: 'footer',
                background: 'success',
                color: 'warning',
            };

            const wrapper = mount(TableFooterCell, {
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

            const wrapper = mount(TableFooterCell, {
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

            const wrapper = mount(TableFooterCell, {
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

            const wrapper = mount(TableFooterCell, {
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
    });

    describe('dataTypes classes', () => {
        it('should apply number classes from config dataTypes', () => {
            const cell: HeaderCell = {
                content: 'Sum',
                key: 'sum',
                number: true,
            };

            const wrapper = mount(TableFooterCell, {
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
                content: 'Total Price',
                key: 'total_price',
                currency: true,
            };

            const wrapper = mount(TableFooterCell, {
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
                content: 'Grand Total',
                key: 'grand_total',
                currency: true,
                class: 'fw-bold',
            };

            const wrapper = mount(TableFooterCell, {
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

        it('should apply dataTypes classes with other styling', () => {
            const cell: HeaderCell = {
                content: 'Formatted Total',
                key: 'formatted_total',
                number: true,
                background: 'primary',
                align: 'end',
            };

            const wrapper = mount(TableFooterCell, {
                props: {
                    cell,
                    cellIndex: 0,
                    storeId,
                },
            });

            const th = wrapper.find('th');
            expect(th.classes()).toContain('text-end');
            expect(th.classes()).toContain('table-primary');
            expect(th.attributes('style')).toContain('text-align: right');
        });
    });

    describe('accessibility', () => {
        // The footer repeats the column labels, so it labels columns as well
        it('should mark the footer cell as a column header', () => {
            const wrapper = mount(TableFooterCell, {
                props: { cell: { content: 'Total', key: 'total' }, cellIndex: 0, storeId },
            });

            expect(wrapper.find('th').attributes('scope')).toBe('col');
        });

        it('should use colgroup scope for a spanning footer cell', () => {
            const wrapper = mount(TableFooterCell, {
                props: {
                    cell: { content: 'Total', key: 'total', colspan: 3 },
                    cellIndex: 0,
                    storeId,
                },
            });

            expect(wrapper.find('th').attributes('scope')).toBe('colgroup');
        });
    });
});
