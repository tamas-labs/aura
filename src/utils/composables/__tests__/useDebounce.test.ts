import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, effectScope, h } from 'vue';
import { mount } from '@vue/test-utils';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('basic functionality', () => {
        it('should debounce callback execution', () => {
            const TestComponent = defineComponent({
                setup() {
                    const callback = vi.fn();
                    const { debounced } = useDebounce(callback, 300);

                    return () =>
                        h('button', {
                            onClick: () => debounced('test'),
                        });
                },
            });

            const wrapper = mount(TestComponent);
            const callback = vi.fn();

            // Create debounced function in test
            const { debounced } = useDebounce(callback, 300);

            debounced('arg1');
            expect(callback).not.toHaveBeenCalled();

            vi.advanceTimersByTime(299);
            expect(callback).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);
            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('arg1');

            wrapper.unmount();
        });

        it('should use default delay of 300ms', () => {
            const callback = vi.fn();
            const { debounced } = useDebounce(callback);

            debounced();
            vi.advanceTimersByTime(299);
            expect(callback).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should only execute the last call when called multiple times', () => {
            const callback = vi.fn();
            const { debounced } = useDebounce(callback, 300);

            debounced('call1');
            vi.advanceTimersByTime(100);
            debounced('call2');
            vi.advanceTimersByTime(100);
            debounced('call3');

            vi.advanceTimersByTime(300);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('call3');
        });

        it('should handle multiple arguments', () => {
            const callback = vi.fn();
            const { debounced } = useDebounce(callback, 300);

            debounced('arg1', 'arg2', 'arg3');
            vi.advanceTimersByTime(300);

            expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
        });
    });

    describe('cancel functionality', () => {
        it('should cancel pending execution', () => {
            const callback = vi.fn();
            const { debounced, cancel } = useDebounce(callback, 300);

            debounced('test');
            vi.advanceTimersByTime(100);
            cancel();
            vi.advanceTimersByTime(300);

            expect(callback).not.toHaveBeenCalled();
        });

        it('should allow new calls after cancel', () => {
            const callback = vi.fn();
            const { debounced, cancel } = useDebounce(callback, 300);

            debounced('call1');
            cancel();
            debounced('call2');
            vi.advanceTimersByTime(300);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('call2');
        });

        it('should be safe to call cancel multiple times', () => {
            const callback = vi.fn();
            const { debounced, cancel } = useDebounce(callback, 300);

            debounced('test');
            cancel();
            cancel();
            cancel();

            vi.advanceTimersByTime(300);
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('component unmount cleanup', () => {
        it('should cancel pending execution on component unmount', async () => {
            const callback = vi.fn();

            const TestComponent = defineComponent({
                setup() {
                    const { debounced } = useDebounce(callback, 300);

                    return () =>
                        h('button', {
                            onClick: () => debounced('test'),
                        });
                },
            });

            const wrapper = mount(TestComponent);
            await wrapper.find('button').trigger('click');

            vi.advanceTimersByTime(100);
            wrapper.unmount();

            vi.advanceTimersByTime(300);
            expect(callback).not.toHaveBeenCalled();
        });
    });

    describe('flush functionality', () => {
        it('should run a pending call immediately', () => {
            const callback = vi.fn();
            const { debounced, flush } = useDebounce(callback, 300);

            debounced('test');
            flush();

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('test');

            // The scheduled timeout must not fire a second time
            vi.advanceTimersByTime(300);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should flush the latest arguments of a burst', () => {
            const callback = vi.fn();
            const { debounced, flush } = useDebounce(callback, 300);

            debounced('first');
            debounced('second');
            debounced('third');
            flush();

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('third');
        });

        it('should be a no-op when nothing is pending', () => {
            const callback = vi.fn();
            const { debounced, flush } = useDebounce(callback, 300);

            flush();
            expect(callback).not.toHaveBeenCalled();

            debounced('test');
            vi.advanceTimersByTime(300);
            flush();
            expect(callback).toHaveBeenCalledTimes(1);
        });
    });

    describe('scope cleanup', () => {
        it('should drop a pending call when the scope is disposed', () => {
            const callback = vi.fn();
            const scope = effectScope();

            const { debounced } = scope.run(() => useDebounce(callback, 300))!;
            debounced('test');
            scope.stop();

            vi.advanceTimersByTime(300);
            expect(callback).not.toHaveBeenCalled();
        });

        it('should run a pending call on dispose with flushOnDispose', () => {
            const callback = vi.fn();
            const scope = effectScope();

            const { debounced } = scope.run(() =>
                useDebounce(callback, 300, { flushOnDispose: true })
            )!;
            debounced('test');
            scope.stop();

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('test');

            // Already flushed — the timeout must not fire again
            vi.advanceTimersByTime(300);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should work without any active scope', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const callback = vi.fn();

            const { debounced } = useDebounce(callback, 300);
            debounced('test');
            vi.advanceTimersByTime(300);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(warn).not.toHaveBeenCalled();
        });
    });

    describe('edge cases', () => {
        it('should handle 0ms delay - immediate execution', () => {
            const callback = vi.fn();
            const { debounced } = useDebounce(callback, 0);

            debounced('test');
            vi.advanceTimersByTime(0);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('test');
        });

        it('should handle very large delay', () => {
            const callback = vi.fn();
            const { debounced } = useDebounce(callback, 10000);

            debounced('test');
            vi.advanceTimersByTime(9999);
            expect(callback).not.toHaveBeenCalled();

            vi.advanceTimersByTime(1);
            expect(callback).toHaveBeenCalledTimes(1);
        });

        it('should handle rapid successive calls', () => {
            const callback = vi.fn();
            const { debounced } = useDebounce(callback, 300);

            for (let i = 0; i < 100; i++) {
                debounced(`call${i}`);
                vi.advanceTimersByTime(10);
            }

            vi.advanceTimersByTime(300);

            expect(callback).toHaveBeenCalledTimes(1);
            expect(callback).toHaveBeenCalledWith('call99');
        });
    });
});
