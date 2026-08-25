import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useErrorHandlerStore } from '../error-handler.state';
import type { AuraConfig } from '../../../types/config.types';

/**
 * Observability of the error reporter's own failures.
 *
 * The reporter used to write these to `console.error` / `console.warn`, which the
 * production build strips (`drop_console` in `vite.config.ts`) — so a broken
 * telemetry endpoint was invisible exactly where it mattered. The reporter now
 * hands them to the store through the `onFailure` / `onDrop` hooks.
 */
describe('error handler store — reporter observability', () => {
    const ENDPOINT = 'https://errors.example.com/collect';
    const FAILURE_KEY = 'errorReporting.failed';
    const DROP_KEY = 'errorReporting.dropped';
    const BATCH_SIZE = 10;

    /** Flush interval (30 s) = the first backoff window. */
    const BACKOFF_MS = 30000;

    const config: AuraConfig = {
        errorReporting: true,
        errorReportingEndpoint: ENDPOINT,
    };

    let fetchMock: ReturnType<typeof vi.fn>;
    let storeCounter = 0;

    const newStore = () => useErrorHandlerStore(`reporter-observability-${++storeCounter}`, config);

    const reportErrors = (store: ReturnType<typeof useErrorHandlerStore>, count: number): void => {
        for (let i = 0; i < count; i++) {
            store.addError({
                severity: 'error',
                component: 'Aura',
                action: 'fetch',
                type: 'network',
                message: `boom-${i}`,
            });
        }
    };

    const errorsWithKey = (store: ReturnType<typeof useErrorHandlerStore>, key: string) =>
        store.errors.filter(error => error.key === key);

    /** Lets the retry delays and the fire-and-forget flush settle. */
    const settle = () => vi.advanceTimersByTimeAsync(10000);

    beforeEach(() => {
        vi.useFakeTimers();
        setActivePinia(createPinia());
        fetchMock = vi.fn().mockRejectedValue(new Error('Network down'));
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('should record a failed flush in the store', async () => {
        const store = newStore();

        reportErrors(store, BATCH_SIZE);
        await settle();

        const failures = errorsWithKey(store, FAILURE_KEY);
        expect(failures).toHaveLength(1);
        expect(failures[0]?.component).toBe('ErrorReporter');
        expect(failures[0]?.metadata).toMatchObject({
            reason: 'Network down',
            consecutiveFailures: 1,
        });
    });

    /**
     * Severity is deliberately `info`: `error` would swap the table for the error
     * UI and `warning` would raise a banner, so an unreachable telemetry endpoint
     * would degrade the UI for end users who cannot act on it.
     */
    it('should not block rendering or raise a banner', async () => {
        const store = newStore();

        reportErrors(store, BATCH_SIZE);
        await settle();

        const failure = errorsWithKey(store, FAILURE_KEY)[0];
        expect(failure?.severity).toBe('info');
        expect(failure?.level).toBe('info');

        // The table's own errors are still there; only the reporter entry is extra.
        expect(store.criticalErrors).toHaveLength(0);
        expect(store.warnings).toHaveLength(0);
    });

    it('should keep a single entry however often the endpoint fails', async () => {
        const store = newStore();

        reportErrors(store, BATCH_SIZE);
        await settle();

        // Past the backoff window the next batch is attempted — and fails again.
        vi.advanceTimersByTime(BACKOFF_MS);
        reportErrors(store, BATCH_SIZE);
        await settle();

        expect(fetchMock.mock.calls.length).toBeGreaterThan(1);
        expect(errorsWithKey(store, FAILURE_KEY)).toHaveLength(1);
    });

    /**
     * The store reports everything it collects to the reporter, so routing the
     * reporter's own failure through `addError` would feed itself.
     */
    it('should never send its own failure back to the endpoint', async () => {
        const store = newStore();

        reportErrors(store, BATCH_SIZE);
        await settle();

        vi.advanceTimersByTime(BACKOFF_MS);
        reportErrors(store, BATCH_SIZE);
        await settle();

        const bodies = fetchMock.mock.calls.map(([, init]) => String(init?.body ?? ''));
        expect(bodies.some(body => body.includes(FAILURE_KEY))).toBe(false);
    });

    it('should record a queue overflow in the store', async () => {
        const store = newStore();

        // The first batch fails and starts the backoff, so nothing else is sent
        // while the queue fills up to its 100-entry cap.
        reportErrors(store, BATCH_SIZE);
        await settle();

        reportErrors(store, 120);

        const drops = errorsWithKey(store, DROP_KEY);
        expect(drops).toHaveLength(1);
        expect(drops[0]?.severity).toBe('info');
        expect(drops[0]?.metadata).toMatchObject({ maxQueueSize: 100 });
    });

    it('should stay silent on the console', async () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

        const store = newStore();
        reportErrors(store, BATCH_SIZE);
        await settle();
        reportErrors(store, 120);

        expect(errorSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
    });
});
