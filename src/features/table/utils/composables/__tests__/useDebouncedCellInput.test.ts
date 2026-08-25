import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { effectScope } from 'vue';
import { createPinia, setActivePinia } from 'pinia';
import {
    useDebouncedCellInput,
    debouncedCellInputProps,
    CELL_INPUT_DEBOUNCE_MS,
} from '../useDebouncedCellInput';
import { useCoreStore } from '../../../../../state/core/core.state';
import { useApiResourcesStore } from '../../../../../state/data/api-resources.state';
import type { HeaderCell } from '../../../../../types';

const STORE_ID = 'test-debounced-cell-input';

const cellOf = (overrides: Partial<HeaderCell> = {}): HeaderCell =>
    ({ content: 'Name', key: 'name', field: 'name', ...overrides }) as HeaderCell;

describe('useDebouncedCellInput', () => {
    let core: ReturnType<typeof useCoreStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        window.sessionStorage.clear();
        core = useCoreStore(STORE_ID, { storeId: STORE_ID });
        useApiResourcesStore(STORE_ID, core);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('store wiring', () => {
        it('should return the existing stores of the table, not new ones', () => {
            const resource = useApiResourcesStore(STORE_ID, core);

            const input = useDebouncedCellInput(STORE_ID, cellOf());

            expect(input.core).toBe(core);
            expect(input.resource).toBe(resource);
        });

        it('should resolve the field with the reference > field > key precedence', () => {
            expect(useDebouncedCellInput(STORE_ID, cellOf()).field).toBe('name');
            expect(useDebouncedCellInput(STORE_ID, cellOf({ field: undefined })).field).toBe(
                'name'
            );
            expect(useDebouncedCellInput(STORE_ID, cellOf({ reference: 'user.name' })).field).toBe(
                'user.name'
            );
        });
    });

    describe('debounce factory', () => {
        it('should expose the delay both search cells used to hard-code', () => {
            expect(CELL_INPUT_DEBOUNCE_MS).toBe(300);
        });

        it('should not run the callback before the shared delay elapses', () => {
            vi.useFakeTimers();
            const apply = vi.fn();
            const { debounce } = useDebouncedCellInput(STORE_ID, cellOf());

            debounce(apply).debounced();

            vi.advanceTimersByTime(CELL_INPUT_DEBOUNCE_MS - 1);
            expect(apply).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);
            expect(apply).toHaveBeenCalledTimes(1);
        });

        it('should collapse rapid calls into one', () => {
            vi.useFakeTimers();
            const apply = vi.fn();
            const { debounce } = useDebouncedCellInput(STORE_ID, cellOf());
            const { debounced } = debounce(apply);

            // Typing: each keystroke restarts the timer
            debounced();
            vi.advanceTimersByTime(200);
            debounced();
            vi.advanceTimersByTime(200);
            debounced();
            vi.advanceTimersByTime(CELL_INPUT_DEBOUNCE_MS);

            expect(apply).toHaveBeenCalledTimes(1);
        });

        it('should drop a pending call on cancel', () => {
            vi.useFakeTimers();
            const apply = vi.fn();
            const { debounce } = useDebouncedCellInput(STORE_ID, cellOf());
            const { debounced, cancel } = debounce(apply);

            debounced();
            cancel();
            vi.advanceTimersByTime(CELL_INPUT_DEBOUNCE_MS * 2);

            expect(apply).not.toHaveBeenCalled();
        });

        it('should give every call its own independent pair', () => {
            vi.useFakeTimers();
            const first = vi.fn();
            const second = vi.fn();
            const { debounce } = useDebouncedCellInput(STORE_ID, cellOf());

            const a = debounce(first);
            const b = debounce(second);

            a.debounced();
            b.debounced();
            a.cancel();
            vi.advanceTimersByTime(CELL_INPUT_DEBOUNCE_MS);

            expect(first).not.toHaveBeenCalled();
            expect(second).toHaveBeenCalledTimes(1);
        });

        it('should drop a pending call when the owning scope is disposed', () => {
            vi.useFakeTimers();
            const apply = vi.fn();
            const scope = effectScope();

            scope.run(() => {
                const { debounce } = useDebouncedCellInput(STORE_ID, cellOf());
                debounce(apply).debounced();
            });

            scope.stop();
            vi.advanceTimersByTime(CELL_INPUT_DEBOUNCE_MS * 2);

            expect(apply).not.toHaveBeenCalled();
        });
    });

    describe('shared props', () => {
        it('should declare storeId and cell as required', () => {
            expect(Object.keys(debouncedCellInputProps)).toEqual(['storeId', 'cell']);
            expect(debouncedCellInputProps.storeId).toEqual({ type: String, required: true });
            expect(debouncedCellInputProps.cell.required).toBe(true);
            expect(debouncedCellInputProps.cell.type).toBe(Object);
        });
    });
});
