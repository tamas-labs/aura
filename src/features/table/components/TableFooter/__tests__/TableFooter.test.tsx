import { describe, it, expect, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableFooter } from '../TableFooter';
import { TableFooterRow } from '../TableFooterRow';
import { useCoreStore, useApiResourcesStore } from '../../../../../state';
import type { AuraProps } from '../../../../../types';

describe('TableFooter', () => {
    const TEST_STORE_ID = 'test-table-footer';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('rendering', () => {
        it('should render tfoot element when displayFooter exists', async () => {
            const core = useCoreStore(TEST_STORE_ID, {
                storeId: TEST_STORE_ID,
                showFooter: true,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID, core);

            await resource.processResponse({
                header: {
                    rows: [
                        {
                            cells: [
                                { content: 'ID', key: 'id', field: 'id' },
                                { content: 'Name', key: 'name', field: 'name' },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableFooter, {
                props: {
                    storeId: TEST_STORE_ID,
                },
            });

            expect(wrapper.find('[data-testid="table-footer"]').exists()).toBe(true);
            expect(wrapper.find('tfoot').exists()).toBe(true);
        });

        it('should render tfoot element not thead', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-not-thead', {
                storeId: TEST_STORE_ID + '-not-thead',
                showFooter: true,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-not-thead', core);

            await resource.processResponse({
                header: {
                    rows: [{ cells: [{ content: 'Test', key: 'test', field: 'test' }] }],
                },
            });

            const wrapper = mount(TableFooter, {
                props: {
                    storeId: TEST_STORE_ID + '-not-thead',
                },
            });

            expect(wrapper.find('tfoot').exists()).toBe(true);
            expect(wrapper.find('thead').exists()).toBe(false);
        });

        it('should render correct number of TableFooterRow components', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-rows', {
                storeId: TEST_STORE_ID + '-rows',
                showFooter: true,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-rows', core);

            await resource.processResponse({
                header: {
                    rows: [
                        { cells: [{ content: 'Row 1', key: 'row1', field: 'row1' }] },
                        { cells: [{ content: 'Row 2', key: 'row2', field: 'row2' }] },
                        { cells: [{ content: 'Row 3', key: 'row3', field: 'row3' }] },
                    ],
                },
            });

            const wrapper = mount(TableFooter, {
                props: {
                    storeId: TEST_STORE_ID + '-rows',
                },
            });

            const rows = wrapper.findAllComponents(TableFooterRow);
            expect(rows).toHaveLength(3);
        });

        it('should pass correct row prop to TableFooterRow', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-row-prop', {
                storeId: TEST_STORE_ID + '-row-prop',
                showFooter: true,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-row-prop', core);

            const testRow = { cells: [{ content: 'Test', key: 'test', field: 'test' }] };

            await resource.processResponse({
                header: {
                    rows: [testRow],
                },
            });

            const wrapper = mount(TableFooter, {
                props: {
                    storeId: TEST_STORE_ID + '-row-prop',
                },
            });

            const row = wrapper.findComponent(TableFooterRow);
            expect(row.props('row')).toMatchObject({ cells: testRow.cells });
        });

        it('should pass correct rowIndex to each TableFooterRow', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-row-index', {
                storeId: TEST_STORE_ID + '-row-index',
                showFooter: true,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-row-index', core);

            await resource.processResponse({
                header: {
                    rows: [
                        { cells: [{ content: 'Row 1', key: 'row1', field: 'row1' }] },
                        { cells: [{ content: 'Row 2', key: 'row2', field: 'row2' }] },
                    ],
                },
            });

            const wrapper = mount(TableFooter, {
                props: {
                    storeId: TEST_STORE_ID + '-row-index',
                },
            });

            const rows = wrapper.findAllComponents(TableFooterRow);
            expect(rows[0]!.props('rowIndex')).toBe(0);
            expect(rows[1]!.props('rowIndex')).toBe(1);
        });
    });

    describe('displayFooter logic', () => {
        it('should use API footer when available', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-api-footer', {
                storeId: TEST_STORE_ID + '-api-footer',
                showFooter: true,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-api-footer', core);

            await resource.processResponse({
                header: {
                    rows: [{ cells: [{ content: 'Header', key: 'header', field: 'header' }] }],
                },
                footer: {
                    rows: [{ cells: [{ content: 'Footer', key: 'footer', field: 'footer' }] }],
                },
            });

            const wrapper = mount(TableFooter, {
                props: {
                    storeId: TEST_STORE_ID + '-api-footer',
                },
            });

            expect(wrapper.find('tfoot').exists()).toBe(true);
            const rows = wrapper.findAllComponents(TableFooterRow);
            expect(rows).toHaveLength(1);
        });

        it('should fallback to header when no API footer', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-fallback', {
                storeId: TEST_STORE_ID + '-fallback',
                showFooter: true,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-fallback', core);

            await resource.processResponse({
                header: {
                    rows: [{ cells: [{ content: 'Header Cell', key: 'header', field: 'header' }] }],
                },
            });

            const wrapper = mount(TableFooter, {
                props: {
                    storeId: TEST_STORE_ID + '-fallback',
                },
            });

            expect(wrapper.find('tfoot').exists()).toBe(true);
            const rows = wrapper.findAllComponents(TableFooterRow);
            expect(rows).toHaveLength(1);
        });
    });

    describe('edge cases', () => {
        it('should return null when displayFooter is null', () => {
            const core = useCoreStore(TEST_STORE_ID + '-null-footer', {
                storeId: TEST_STORE_ID + '-null-footer',
                showFooter: false,
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-null-footer', core);

            const wrapper = mount(TableFooter, {
                props: {
                    storeId: TEST_STORE_ID + '-null-footer',
                },
            });

            expect(wrapper.find('tfoot').exists()).toBe(false);
        });

        it('should return null when showFooter is false', () => {
            const core = useCoreStore(TEST_STORE_ID + '-show-false', {
                storeId: TEST_STORE_ID + '-show-false',
                showFooter: false,
            } as AuraProps);
            useApiResourcesStore(TEST_STORE_ID + '-show-false', core);

            const wrapper = mount(TableFooter, {
                props: {
                    storeId: TEST_STORE_ID + '-show-false',
                },
            });

            expect(wrapper.find('tfoot').exists()).toBe(false);
        });
    });

    describe('complex footer structures', () => {
        it('should handle multiple rows with multiple cells', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-complex', {
                storeId: TEST_STORE_ID + '-complex',
                showFooter: true,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-complex', core);

            await resource.processResponse({
                header: {
                    rows: [{ cells: [{ content: 'Header', key: 'header', field: 'header' }] }],
                },
                footer: {
                    rows: [
                        {
                            cells: [
                                { content: 'Total', key: 'total', field: 'total' },
                                { content: '$100', key: 'amount1', field: 'amount1' },
                                { content: '$200', key: 'amount2', field: 'amount2' },
                            ],
                        },
                        {
                            cells: [
                                {
                                    content: 'Grand Total',
                                    key: 'grand',
                                    field: 'grand',
                                    colspan: 2,
                                },
                                { content: '$300', key: 'grand-amount', field: 'grand-amount' },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableFooter, {
                props: {
                    storeId: TEST_STORE_ID + '-complex',
                },
            });

            const rows = wrapper.findAllComponents(TableFooterRow);
            expect(rows).toHaveLength(2);
        });

        it('should handle footer with settings', async () => {
            const core = useCoreStore(TEST_STORE_ID + '-settings', {
                storeId: TEST_STORE_ID + '-settings',
                showFooter: true,
            } as AuraProps);
            const resource = useApiResourcesStore(TEST_STORE_ID + '-settings', core);

            await resource.processResponse({
                header: {
                    rows: [{ cells: [{ content: 'Header', key: 'header', field: 'header' }] }],
                },
                footer: {
                    rows: [{ cells: [{ content: 'Footer', key: 'footer', field: 'footer' }] }],
                    settings: {
                        sticky: true,
                        height: '50px',
                    },
                },
            });

            const wrapper = mount(TableFooter, {
                props: {
                    storeId: TEST_STORE_ID + '-settings',
                },
            });

            const tfoot = wrapper.find('tfoot');
            expect(tfoot.exists()).toBe(true);
            // sticky → class, height → inline style
            expect(tfoot.classes()).toContain('aura-tfoot-sticky');
            expect(tfoot.attributes('style')).toContain('height: 50px');
        });

        it('should not add sticky class when footer settings.sticky is false', async () => {
            const id = TEST_STORE_ID + '-no-sticky';
            const core = useCoreStore(id, { storeId: id, showFooter: true } as AuraProps);
            const resource = useApiResourcesStore(id, core);

            await resource.processResponse({
                header: { rows: [{ cells: [{ content: 'H', key: 'h', field: 'h' }] }] },
                footer: {
                    rows: [{ cells: [{ content: 'F', key: 'f', field: 'f' }] }],
                    settings: { sticky: false },
                },
            });

            const wrapper = mount(TableFooter, { props: { storeId: id } });
            expect(wrapper.find('tfoot').classes()).not.toContain('aura-tfoot-sticky');
        });

        it('should not add sticky class when footer has no settings', async () => {
            const id = TEST_STORE_ID + '-no-settings';
            const core = useCoreStore(id, { storeId: id, showFooter: true } as AuraProps);
            const resource = useApiResourcesStore(id, core);

            await resource.processResponse({
                header: { rows: [{ cells: [{ content: 'H', key: 'h', field: 'h' }] }] },
                footer: {
                    rows: [{ cells: [{ content: 'F', key: 'f', field: 'f' }] }],
                },
            });

            const wrapper = mount(TableFooter, { props: { storeId: id } });
            const tfoot = wrapper.find('tfoot');
            expect(tfoot.exists()).toBe(true);
            expect(tfoot.classes()).not.toContain('aura-tfoot-sticky');
            expect(tfoot.attributes('style')).toBeUndefined();
        });

        it('should not render footer cells for columns with show:false', async () => {
            const id = TEST_STORE_ID + '-show';
            const core = useCoreStore(id, { storeId: id, showFooter: true } as AuraProps);
            const resource = useApiResourcesStore(id, core);

            await resource.processResponse({
                header: { rows: [{ cells: [{ content: 'H', key: 'h', field: 'h' }] }] },
                footer: {
                    rows: [
                        {
                            cells: [
                                { content: 'A', key: 'a', field: 'a' },
                                { content: 'B', key: 'b', field: 'b', show: false },
                                { content: 'C', key: 'c', field: 'c' },
                            ],
                        },
                    ],
                },
            });

            const wrapper = mount(TableFooter, { props: { storeId: id } });
            await flushPromises();
            const footerTexts = wrapper.findAll('tfoot th').map(th => th.text());
            expect(footerTexts).toEqual(['A', 'C']);
        });
    });
});
