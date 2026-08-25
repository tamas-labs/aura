import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { TableHeaderBetweenCell } from '../TableHeaderBetweenCell';
import type { HeaderCell } from '../../../../../types/api-response.types';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';

describe('TableHeaderBetweenCell', () => {
    const storeId = 'test-table-header-between-cell';
    let core: ReturnType<typeof useCoreStore>;
    let resource: ReturnType<typeof useApiResourcesStore>;

    const numberCell: HeaderCell = {
        content: 'Age',
        key: 'age',
        field: 'age',
        searchable: true,
        between: true,
        number: true,
    };

    beforeEach(() => {
        setActivePinia(createPinia());
        window.sessionStorage.clear();
        core = useCoreStore(storeId, { storeId });
        resource = useApiResourcesStore(storeId, core);
    });

    describe('rendering', () => {
        it('should render the between cell with two inputs', () => {
            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: numberCell },
            });

            expect(wrapper.find('[data-testid="table-header-between-cell"]').exists()).toBe(true);
            // Header row cell: it has to declare what it labels
            expect(wrapper.find('th').attributes('scope')).toBe('col');
            expect(wrapper.findAll('input')).toHaveLength(2);
            expect(wrapper.find('[data-testid="between-min-age"]').exists()).toBe(true);
            expect(wrapper.find('[data-testid="between-max-age"]').exists()).toBe(true);
        });

        it('should use number input type for numeric columns', () => {
            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: numberCell },
            });

            expect(wrapper.find('[data-testid="between-min-age"]').attributes('type')).toBe(
                'number'
            );
        });

        it('should use date input type for date columns', () => {
            const dateCell: HeaderCell = {
                content: 'Created',
                key: 'created',
                field: 'created',
                searchable: true,
                between: true,
                date: true,
            };

            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: dateCell },
            });

            expect(wrapper.find('[data-testid="between-min-created"]').attributes('type')).toBe(
                'date'
            );
        });

        it('should prefill inputs from an existing range in the store', () => {
            resource.setBetweenSearch('age', 18, 65);

            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: numberCell },
            });

            expect(
                (wrapper.find('[data-testid="between-min-age"]').element as HTMLInputElement).value
            ).toBe('18');
            expect(
                (wrapper.find('[data-testid="between-max-age"]').element as HTMLInputElement).value
            ).toBe('65');
        });

        it('should target the reference field when set', () => {
            const refCell: HeaderCell = {
                content: 'Age',
                key: 'age',
                field: 'age',
                reference: 'profile.age',
                searchable: true,
                between: true,
                number: true,
            };

            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: refCell },
            });

            expect(wrapper.find('[data-testid="between-min-profile.age"]').exists()).toBe(true);
        });
    });

    describe('interaction', () => {
        it('should push a range search after debounce', async () => {
            vi.useFakeTimers();
            const spy = vi.spyOn(resource, 'setBetweenSearch');

            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: numberCell },
            });

            await wrapper.find('[data-testid="between-min-age"]').setValue('20');
            await wrapper.find('[data-testid="between-max-age"]').setValue('40');

            expect(spy).not.toHaveBeenCalled();
            vi.advanceTimersByTime(300);

            expect(spy).toHaveBeenLastCalledWith('age', '20', '40');
            vi.useRealTimers();
        });

        it('should clear the range on clear button click', async () => {
            resource.setBetweenSearch('age', 18, 65);
            const spy = vi.spyOn(resource, 'removeSearch');

            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: numberCell },
            });

            await wrapper.find('[data-testid="between-clear-age"]').trigger('click');

            expect(spy).toHaveBeenCalledWith('age');
            expect(resource.getBetweenRange('age')).toBeNull();
        });

        it('should disable the clear button when no range is active', () => {
            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: numberCell },
            });

            expect(
                wrapper.find('[data-testid="between-clear-age"]').attributes('disabled')
            ).toBeDefined();
        });
    });
    describe('resolveInputType', () => {
        /** Mounts a between cell for a header cell carrying only the given formatting flags. */
        function inputTypeFor(flags: Partial<HeaderCell>): string | undefined {
            const cell: HeaderCell = {
                content: 'Value',
                key: 'value',
                field: 'value',
                searchable: true,
                between: true,
                ...flags,
            };
            const wrapper = mount(TableHeaderBetweenCell, { props: { storeId, cell } });

            return wrapper.find('[data-testid="between-min-value"]').attributes('type');
        }

        describe('one flag at a time', () => {
            it.each([
                [{ datetime: true }, 'datetime-local'],
                [{ date: true }, 'date'],
                [{ number: true }, 'number'],
                [{ time: true }, 'number'],
                [{ currency: true }, 'number'],
                [{ currency: 'HUF' }, 'number'],
                [{}, 'text'],
            ] as [Partial<HeaderCell>, string][])('%o → type="%s"', (flags, expected) => {
                expect(inputTypeFor(flags)).toBe(expected);
            });

            it('should give both bounds the same input type', () => {
                const cell: HeaderCell = {
                    content: 'Created',
                    key: 'created',
                    field: 'created',
                    searchable: true,
                    between: true,
                    datetime: true,
                };
                const wrapper = mount(TableHeaderBetweenCell, { props: { storeId, cell } });

                expect(wrapper.find('[data-testid="between-min-created"]').attributes('type')).toBe(
                    'datetime-local'
                );
                expect(wrapper.find('[data-testid="between-max-created"]').attributes('type')).toBe(
                    'datetime-local'
                );
            });
        });

        describe('precedence', () => {
            it('should prefer datetime over every other flag', () => {
                expect(inputTypeFor({ datetime: true, date: true, number: true, time: true })).toBe(
                    'datetime-local'
                );
            });

            it('should prefer date over the numeric group', () => {
                expect(inputTypeFor({ date: true, number: true, currency: 'EUR' })).toBe('date');
            });

            it('should treat time as numeric, not as a clock', () => {
                // `time` holds a duration in seconds, so a range over it is a number range.
                expect(inputTypeFor({ time: true })).toBe('number');
            });
        });

        describe('flags that must NOT select a widget', () => {
            it.each([
                [{ datetime: false }],
                [{ datetime: null }],
                [{ date: false }],
                [{ date: null }],
                [{ number: false }],
                [{ number: null }],
                [{ time: false }],
                [{ time: null }],
                [{ currency: null }],
            ] as [Partial<HeaderCell>][])('%o → type="text"', flags => {
                expect(inputTypeFor(flags)).toBe('text');
            });

            it.each([[false], ['']] as [boolean | string][])(
                'should read currency for truthiness, not presence (currency: %j)',
                currency => {
                    // `formatValue` and `computeClasses` both read this flag for truthiness, so a
                    // column that explicitly says "not currency" renders plain text values — the
                    // range inputs must not disagree and demand numbers.
                    expect(inputTypeFor({ currency })).toBe('text');
                }
            );
        });
    });
    describe('remaining branches', () => {
        it('should send null for the bound left empty', async () => {
            vi.useFakeTimers();
            const spy = vi.spyOn(resource, 'setBetweenSearch');

            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: numberCell },
            });

            await wrapper.find('[data-testid="between-min-age"]').setValue('20');
            vi.advanceTimersByTime(300);

            // An empty bound is an open-ended range, not the string ''.
            expect(spy).toHaveBeenLastCalledWith('age', '20', null);
            vi.useRealTimers();
        });

        it('should send null for a bound holding only whitespace', async () => {
            vi.useFakeTimers();
            const spy = vi.spyOn(resource, 'setBetweenSearch');

            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: numberCell },
            });

            await wrapper.find('[data-testid="between-min-age"]').setValue('   ');
            await wrapper.find('[data-testid="between-max-age"]').setValue('40');
            vi.advanceTimersByTime(300);

            expect(spy).toHaveBeenLastCalledWith('age', null, '40');
            vi.useRealTimers();
        });

        it('should use the clear icon from the default config', () => {
            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: numberCell },
            });
            const icon = wrapper.find('[data-testid="between-clear-age"] i');

            expect(icon.classes()).toContain('fas');
            expect(icon.classes()).toContain('fa-xmark');
        });

        it('should fall back when the host registry has no clear entry', () => {
            // `validateIcons` REPLACES the registry rather than merging it into the defaults,
            // so a host that lists only some icons leaves `clear` undefined — that is what the
            // component's own fallback is for.
            core.config.icons = { primary: ['fas', 'fa-file'] } as typeof core.config.icons;

            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: numberCell },
            });
            const icon = wrapper.find('[data-testid="between-clear-age"] i');

            expect(icon.classes()).toContain('fas');
            expect(icon.classes()).toContain('fa-times');
        });

        it('should use the clear icon from config when available', () => {
            core.config.icons = {
                ...core.config.icons,
                clear: ['custom-clear', 'icon-class'],
            } as typeof core.config.icons;

            const wrapper = mount(TableHeaderBetweenCell, {
                props: { storeId, cell: numberCell },
            });
            const icon = wrapper.find('[data-testid="between-clear-age"] i');

            expect(icon.classes()).toContain('custom-clear');
            expect(icon.classes()).toContain('icon-class');
        });
    });
});
