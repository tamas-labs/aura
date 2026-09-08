import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import { TableHeader } from '../components/TableHeader';
import { TableBody } from '../components/TableBody';
import { TableFooter } from '../components/TableFooter';
import { ActionButtons } from '../components/Toolbar';
import { triggerCsvDownload } from '../utils/export/build-csv';
import type * as BuildCsvModule from '../utils/export/build-csv';
import { useCoreStore, useApiResourcesStore } from '../../../state';
import type { AuraProps, ApiResourcesStore } from '../../../types';

// The browser download is mocked; `buildCsv` stays real so the column list is checked.
vi.mock('../utils/export/build-csv', async importOriginal => {
    const actual = await importOriginal<typeof BuildCsvModule>();
    return { ...actual, triggerCsvDownload: vi.fn() };
});

/** The header row's own cells — the search row below it has `th`s of its own. */
const HEADER_ROW_CELLS = '[data-testid="table-header-row"] th';

const RESPONSE = {
    header: {
        rows: [
            {
                cells: [
                    { content: 'ID', key: 'id', field: 'id' },
                    { content: 'Name', key: 'name', field: 'name', searchable: true },
                    { content: 'Mail', key: 'email', field: 'email', searchable: true },
                ],
            },
        ],
    },
    items: [{ id: 1, name: 'Jane', email: 'jane@example.com' }],
};

/**
 * The user-hidden column list has to reach every rendered section at once — a column
 * left in one of them would break the positional alignment the table relies on.
 */
describe('column visibility wiring', () => {
    let counter = 0;
    let storeId: string;
    let resource: ApiResourcesStore;

    const setup = async (config: Partial<AuraProps> = {}) => {
        const core = useCoreStore(storeId, { storeId, ...config } as AuraProps);
        resource = useApiResourcesStore(storeId, core);
        await resource.processResponse(RESPONSE);
    };

    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        storeId = `column-visibility-wiring-${++counter}`;
    });

    it('should drop the column from the header', async () => {
        await setup();
        const wrapper = mount(TableHeader, { props: { storeId } });

        const headerCells = () => wrapper.findAll(HEADER_ROW_CELLS);
        expect(headerCells()).toHaveLength(3);

        resource.hideColumn('email');
        await wrapper.vm.$nextTick();

        const headers = headerCells().map(node => node.text());
        expect(headers).toHaveLength(2);
        expect(headers.join(' ')).not.toContain('Mail');
    });

    it('should drop the column from the header search row', async () => {
        await setup({ showHeaderSearch: false });
        const wrapper = mount(TableHeader, { props: { storeId } });

        expect(wrapper.find('[data-testid="table-header-search-row"]').exists()).toBe(true);
        const before = wrapper.findAll('[data-testid="table-header-search-row"] th').length;

        resource.hideColumn('email');
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('[data-testid="table-header-search-row"] th').length).toBe(
            before - 1
        );
    });

    it('should drop the column from the body', async () => {
        await setup();
        const wrapper = mount(TableBody, { props: { storeId } });

        expect(wrapper.findAll('td')).toHaveLength(3);

        resource.hideColumn('email');
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('td')).toHaveLength(2);
        expect(wrapper.text()).not.toContain('jane@example.com');
    });

    it('should shrink the empty-state colspan with the hidden column', async () => {
        const core = useCoreStore(storeId, { storeId } as AuraProps);
        resource = useApiResourcesStore(storeId, core);
        await resource.processResponse({ ...RESPONSE, items: [] });

        const wrapper = mount(TableBody, { props: { storeId } });
        const cell = () => wrapper.find('[data-testid="table-body-empty-cell"]');

        expect(cell().attributes('colspan')).toBe('3');

        resource.hideColumn('email');
        await wrapper.vm.$nextTick();

        expect(cell().attributes('colspan')).toBe('2');
    });

    it('should drop the column from the footer', async () => {
        await setup({ showFooter: true });
        const wrapper = mount(TableFooter, { props: { storeId } });

        expect(wrapper.findAll('td, th')).toHaveLength(3);

        resource.hideColumn('email');
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll('td, th')).toHaveLength(2);
    });

    it('should leave the hidden column out of the CSV export', async () => {
        await setup({ actionButtons: ['export'] });
        const wrapper = mount(ActionButtons, { props: { storeId } });

        resource.hideColumn('email');
        await wrapper.vm.$nextTick();
        await wrapper.find('[data-testid="action-export-csv"]').trigger('click');

        const csv = vi.mocked(triggerCsvDownload).mock.calls[0]?.[1] ?? '';
        expect(csv).toContain('Name');
        expect(csv).not.toContain('Mail');
        expect(csv).not.toContain('jane@example.com');
    });

    it('should restore every section from show-all', async () => {
        await setup();
        const wrapper = mount(TableHeader, { props: { storeId } });

        resource.setHiddenColumns(['email', 'id']);
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll(HEADER_ROW_CELLS)).toHaveLength(1);

        resource.showAllColumns();
        await wrapper.vm.$nextTick();
        expect(wrapper.findAll(HEADER_ROW_CELLS)).toHaveLength(3);
    });

    it('should not drop a response-hidden column from the toggle list', async () => {
        const core = useCoreStore(storeId, { storeId } as AuraProps);
        resource = useApiResourcesStore(storeId, core);
        await resource.processResponse({
            header: {
                rows: [
                    {
                        cells: [
                            { content: 'ID', key: 'id', field: 'id' },
                            { content: 'Secret', key: 'secret', field: 'secret', show: false },
                        ],
                    },
                ],
            },
            items: [{ id: 1, secret: 'x' }],
        });

        const wrapper = mount(TableHeader, { props: { storeId } });

        // `show: false` already hid it, and hiding it again must not double-count.
        resource.hideColumn('secret');
        await wrapper.vm.$nextTick();

        expect(wrapper.findAll(HEADER_ROW_CELLS)).toHaveLength(1);
    });
});
