import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { ColumnVisibilityPanel } from '../ColumnVisibilityPanel';
import { useCoreStore, useApiResourcesStore } from '../../../../../state';
import type { AuraProps, ApiResourcesStore } from '../../../../../types';

const HEADER = {
    rows: [
        {
            cells: [
                { key: 'name', field: 'name', content: 'Name' },
                { key: 'email', field: 'email', content: 'E-mail', label: 'Mail' },
                { key: 'notes', field: 'notes', content: 'Notes' },
            ],
        },
    ],
};

describe('ColumnVisibilityPanel', () => {
    let counter = 0;
    let storeId: string;
    let resource: ApiResourcesStore;

    /** Mounts the panel against a store that has not seen a response yet. */
    const mountBare = () => {
        const core = useCoreStore(storeId, { storeId } as AuraProps);
        resource = useApiResourcesStore(storeId, core);

        return mount(ColumnVisibilityPanel, { props: { storeId } });
    };

    const setup = async (header: unknown = HEADER) => {
        const core = useCoreStore(storeId, { storeId } as AuraProps);
        resource = useApiResourcesStore(storeId, core);
        await resource.processResponse({ header, items: [] } as never);

        return mount(ColumnVisibilityPanel, { props: { storeId } });
    };

    beforeEach(() => {
        setActivePinia(createPinia());
        storeId = `column-visibility-${++counter}`;
    });

    describe('rendering', () => {
        it('should render one checkbox per data column', async () => {
            const wrapper = await setup();

            expect(wrapper.findAll('.form-check-input')).toHaveLength(3);
        });

        it('should label a column with its label, then its content', async () => {
            const wrapper = await setup();

            const text = wrapper.text();
            expect(text).toContain('Name');
            expect(text).toContain('Mail');
            expect(text).not.toContain('E-mail');
        });

        it('should check every column while nothing is hidden', async () => {
            const wrapper = await setup();

            const boxes = wrapper.findAll<HTMLInputElement>('.form-check-input');
            expect(boxes.every(box => box.element.checked)).toBe(true);
        });

        it('should render an empty panel without a header', () => {
            const wrapper = mountBare();

            expect(wrapper.find('[data-testid="column-visibility-panel"]').exists()).toBe(true);
            expect(wrapper.findAll('.form-check-input')).toHaveLength(0);
        });

        it('should take the columns from the last header row', async () => {
            const wrapper = await setup({
                rows: [
                    { cells: [{ key: 'group', content: 'Group', colspan: 2 }] },
                    {
                        cells: [
                            { key: 'name', field: 'name', content: 'Name' },
                            { key: 'email', field: 'email', content: 'Mail' },
                        ],
                    },
                ],
            });

            expect(wrapper.findAll('.form-check-input')).toHaveLength(2);
            expect(wrapper.find('[data-testid="column-toggle-group"]').exists()).toBe(false);
        });
    });

    describe('excluded columns', () => {
        it('should leave out a show:false column', async () => {
            const wrapper = await setup({
                rows: [
                    {
                        cells: [
                            { key: 'name', field: 'name', content: 'Name' },
                            { key: 'secret', field: 'secret', content: 'Secret', show: false },
                        ],
                    },
                ],
            });

            expect(wrapper.find('[data-testid="column-toggle-secret"]').exists()).toBe(false);
        });

        it('should leave out the selection column', async () => {
            const wrapper = await setup({
                rows: [
                    {
                        cells: [
                            { key: 'select', field: 'id', content: null, selectable: true },
                            { key: 'name', field: 'name', content: 'Name' },
                        ],
                    },
                ],
            });

            expect(wrapper.find('[data-testid="column-toggle-select"]').exists()).toBe(false);
            expect(wrapper.findAll('.form-check-input')).toHaveLength(1);
        });
    });

    describe('toggling', () => {
        it('should hide the column on uncheck', async () => {
            const wrapper = await setup();

            await wrapper.find('[data-testid="column-toggle-email"]').trigger('change');

            expect(resource.hiddenColumns).toEqual(['email']);
        });

        it('should show the column again on re-check', async () => {
            const wrapper = await setup();

            await wrapper.find('[data-testid="column-toggle-email"]').trigger('change');
            await wrapper.find('[data-testid="column-toggle-email"]').trigger('change');

            expect(resource.hiddenColumns).toEqual([]);
        });

        it('should uncheck the box of a hidden column', async () => {
            const wrapper = await setup();

            resource.hideColumn('email');
            await wrapper.vm.$nextTick();

            const box = wrapper.find<HTMLInputElement>('[data-testid="column-toggle-email"]');
            expect(box.element.checked).toBe(false);
        });
    });

    describe('last visible column', () => {
        it('should disable the last remaining checkbox', async () => {
            const wrapper = await setup();

            resource.setHiddenColumns(['email', 'notes']);
            await wrapper.vm.$nextTick();

            expect(
                wrapper.find('[data-testid="column-toggle-name"]').attributes('disabled')
            ).toBeDefined();
        });

        it('should keep the hidden ones enabled so they can come back', async () => {
            const wrapper = await setup();

            resource.setHiddenColumns(['email', 'notes']);
            await wrapper.vm.$nextTick();

            expect(
                wrapper.find('[data-testid="column-toggle-email"]').attributes('disabled')
            ).toBeUndefined();
        });

        it('should leave every box enabled while two columns are visible', async () => {
            const wrapper = await setup();

            resource.hideColumn('notes');
            await wrapper.vm.$nextTick();

            expect(
                wrapper.find('[data-testid="column-toggle-name"]').attributes('disabled')
            ).toBeUndefined();
        });
    });

    describe('show all', () => {
        it('should not render the button while nothing is hidden', async () => {
            const wrapper = await setup();

            expect(wrapper.find('[data-testid="column-visibility-show-all"]').exists()).toBe(false);
        });

        it('should render the button once a column is hidden', async () => {
            const wrapper = await setup();

            resource.hideColumn('email');
            await wrapper.vm.$nextTick();

            expect(wrapper.find('[data-testid="column-visibility-show-all"]').text()).toBe(
                'Show all'
            );
        });

        it('should restore every column', async () => {
            const wrapper = await setup();

            resource.setHiddenColumns(['email', 'notes']);
            await wrapper.vm.$nextTick();
            await wrapper.find('[data-testid="column-visibility-show-all"]').trigger('click');

            expect(resource.hiddenColumns).toEqual([]);
        });
    });
});
