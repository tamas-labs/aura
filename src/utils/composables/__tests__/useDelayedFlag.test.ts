import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { useDelayedFlag } from '../useDelayedFlag';

describe('useDelayedFlag', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should start false while the source is false', () => {
        const source = ref(false);
        const flag = useDelayedFlag(() => source.value, 250);

        expect(flag.value).toBe(false);
    });

    it('should stay false until the delay has elapsed', async () => {
        const source = ref(true);
        const flag = useDelayedFlag(() => source.value, 250);

        await vi.advanceTimersByTimeAsync(249);

        expect(flag.value).toBe(false);
    });

    it('should turn on once the source has stayed true for the delay', async () => {
        const source = ref(true);
        const flag = useDelayedFlag(() => source.value, 250);

        await vi.advanceTimersByTimeAsync(250);

        expect(flag.value).toBe(true);
    });

    // The anti-flicker case: the source went back to false inside the window, so
    // nothing should ever have been drawn.
    it('should never turn on for a source that clears inside the window', async () => {
        const source = ref(true);
        const flag = useDelayedFlag(() => source.value, 250);

        await vi.advanceTimersByTimeAsync(100);
        source.value = false;
        await nextTick();
        await vi.advanceTimersByTimeAsync(1000);

        expect(flag.value).toBe(false);
    });

    it('should turn off immediately when the source clears', async () => {
        const source = ref(true);
        const flag = useDelayedFlag(() => source.value, 250);

        await vi.advanceTimersByTimeAsync(250);
        expect(flag.value).toBe(true);

        source.value = false;
        await nextTick();

        expect(flag.value).toBe(false);
    });

    // A second request starting right after the first one finished restarts the
    // window rather than inheriting the elapsed part of it.
    it('should restart the window on each rising edge', async () => {
        const source = ref(true);
        const flag = useDelayedFlag(() => source.value, 250);

        await vi.advanceTimersByTimeAsync(200);
        source.value = false;
        await nextTick();
        source.value = true;
        await nextTick();

        await vi.advanceTimersByTimeAsync(200);
        expect(flag.value).toBe(false);

        await vi.advanceTimersByTimeAsync(50);
        expect(flag.value).toBe(true);
    });

    it('should follow the source in the same tick when the delay is 0', async () => {
        const source = ref(false);
        const flag = useDelayedFlag(() => source.value, 0);

        source.value = true;
        await nextTick();

        expect(flag.value).toBe(true);
    });

    it('should not turn on after the owning scope was disposed', async () => {
        const source = ref(true);
        const scope = effectScope();
        const flag = scope.run(() => useDelayedFlag(() => source.value, 250))!;

        scope.stop();
        await vi.advanceTimersByTimeAsync(1000);

        expect(flag.value).toBe(false);
    });

    it('should work outside an effect scope', async () => {
        const source = ref(true);
        const flag = useDelayedFlag(() => source.value, 250);

        await vi.advanceTimersByTimeAsync(250);

        expect(flag.value).toBe(true);
    });
});
