import { describe, it, expect } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import { watchAsyncEffect } from '../watch-async-effect';

/** A promise whose resolution the test controls, so runs can settle out of order. */
const createDeferred = () => {
    let resolve!: (value: string) => void;
    const promise = new Promise<string>(res => {
        resolve = res;
    });
    return { promise, resolve };
};

describe('watchAsyncEffect', () => {
    it('should run the effect immediately, like watchEffect', () => {
        const scope = effectScope();
        const runs: number[] = [];

        scope.run(() => {
            watchAsyncEffect(() => {
                runs.push(1);
            });
        });

        expect(runs).toHaveLength(1);
        scope.stop();
    });

    it('should re-run when a dependency read before the first await changes', async () => {
        const scope = effectScope();
        const dependency = ref(0);
        const seen: number[] = [];

        scope.run(() => {
            watchAsyncEffect(async () => {
                seen.push(dependency.value);
                await Promise.resolve();
            });
        });

        dependency.value = 1;
        await nextTick();

        expect(seen).toEqual([0, 1]);
        scope.stop();
    });

    it('should write the result when the run is not superseded', async () => {
        const scope = effectScope();
        const output = ref('');
        const deferred = createDeferred();

        scope.run(() => {
            watchAsyncEffect(async isStale => {
                const value = await deferred.promise;
                if (isStale()) return;
                output.value = value;
            });
        });

        deferred.resolve('done');
        await nextTick();

        expect(output.value).toBe('done');
        scope.stop();
    });

    it('should keep the newest result even when an older run settles last', async () => {
        const scope = effectScope();
        const dependency = ref('first');
        const output = ref('');
        const deferreds: ReturnType<typeof createDeferred>[] = [];

        scope.run(() => {
            watchAsyncEffect(async isStale => {
                const trigger = dependency.value;
                const deferred = createDeferred();
                deferreds.push(deferred);

                const value = await deferred.promise;
                if (isStale()) return;
                output.value = `${trigger}/${value}`;
            });
        });

        // Second trigger: this is the run whose result must survive
        dependency.value = 'second';
        await nextTick();
        expect(deferreds).toHaveLength(2);

        // The newer run settles first, the outdated one only afterwards - the exact
        // interleaving that used to leave the cell showing a stale value
        deferreds[1]?.resolve('new');
        await nextTick();
        deferreds[0]?.resolve('old');
        await nextTick();

        expect(output.value).toBe('second/new');
        scope.stop();
    });

    it('should report stale after the effect scope is stopped', async () => {
        const scope = effectScope();
        const output = ref('untouched');
        const deferred = createDeferred();

        scope.run(() => {
            watchAsyncEffect(async isStale => {
                const value = await deferred.promise;
                if (isStale()) return;
                output.value = value;
            });
        });

        // Unmount before the formatting finished: the late result must not be written back
        scope.stop();
        deferred.resolve('too late');
        await nextTick();

        expect(output.value).toBe('untouched');
    });

    it('should return the stop handle of the underlying watchEffect', async () => {
        const dependency = ref(0);
        const seen: number[] = [];

        const stop = watchAsyncEffect(() => {
            seen.push(dependency.value);
        });
        stop();

        dependency.value = 1;
        await nextTick();

        expect(seen).toEqual([0]);
    });
});
