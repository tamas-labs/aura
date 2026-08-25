import { defineComponent, h, ref, watch } from 'vue';
import type { HeaderCell } from '../../../../types';
import { debouncedCellInputProps, useDebouncedCellInput } from '../../utils';

const BETWEEN_TESTID = 'table-header-between-cell';

/**
 * Determines the HTML `type` attribute of the min/max inputs based on the
 * column's formatting flags.
 *
 * Precedence follows how specific the widget is: `datetime` wins over `date`, and both win
 * over the numeric group (`number` / `currency` / `time` — the last one holds seconds, so a
 * range over it is numeric, not a clock). `currency` is read for **truthiness**, matching
 * `formatValue` and `computeClasses`: `currency: false` and `currency: ''` mean the column is
 * not currency, so they must not turn the range inputs numeric.
 *
 * @param cell - The header cell configuration.
 * @returns The input type to use.
 */
function resolveInputType(cell: HeaderCell): string {
    if (cell.datetime === true) return 'datetime-local';
    if (cell.date === true) return 'date';
    if (cell.number === true || Boolean(cell.currency) || cell.time === true) return 'number';
    return 'text';
}

/**
 * TableHeaderBetweenCell Component
 *
 * The search cell for `between: true` columns: two inputs (min/max) for specifying
 * a range. Writes the values, debounced, via the store's `setBetweenSearch`.
 */
export const TableHeaderBetweenCell = defineComponent({
    name: 'TableHeaderBetweenCell',
    props: debouncedCellInputProps,
    setup(props) {
        const { core, resource, field, debounce } = useDebouncedCellInput(
            props.storeId,
            props.cell
        );

        const inputType = resolveInputType(props.cell);

        const toInputValue = (bound: number | string | null | undefined): string =>
            bound === null || bound === undefined ? '' : String(bound);

        const initial = resource.getBetweenRange(field);
        const minValue = ref(toInputValue(initial?.min));
        const maxValue = ref(toInputValue(initial?.max));

        // Sync local inputs with store state (e.g. after session restore).
        watch(
            () => resource.getBetweenRange(field),
            range => {
                minValue.value = toInputValue(range?.min);
                maxValue.value = toInputValue(range?.max);
            }
        );

        const apply = () => {
            const min = minValue.value.trim();
            const max = maxValue.value.trim();
            resource.setBetweenSearch(field, min === '' ? null : min, max === '' ? null : max);
        };

        const { debounced: debouncedApply, cancel: cancelApply } = debounce(apply);

        const handleClear = () => {
            cancelApply();
            minValue.value = '';
            maxValue.value = '';
            resource.removeSearch(field);
        };

        const clearIcon = core.config.icons?.clear || ['fas', 'fa-times'];

        const buildInput = (boundRef: typeof minValue, placeholder: string, testid: string) =>
            h('input', {
                type: inputType,
                class: 'form-control form-control-sm',
                placeholder,
                value: boundRef.value,
                'data-testid': testid,
                onInput: (e: Event) => {
                    boundRef.value = (e.target as HTMLInputElement).value;
                    debouncedApply();
                },
            });

        return () => {
            // Like the plain search cell: one column's header row, no colspan.
            return h('th', { scope: 'col', 'data-testid': BETWEEN_TESTID }, [
                h('div', { class: 'input-group input-group-sm' }, [
                    buildInput(minValue, 'Min', `between-min-${field}`),
                    buildInput(maxValue, 'Max', `between-max-${field}`),
                    h(
                        'button',
                        {
                            class: 'btn btn-outline-danger',
                            type: 'button',
                            'data-testid': `between-clear-${field}`,
                            disabled: resource.getBetweenRange(field) === null,
                            onClick: handleClear,
                        },
                        h('i', { class: clearIcon })
                    ),
                ]),
            ]);
        };
    },
});
