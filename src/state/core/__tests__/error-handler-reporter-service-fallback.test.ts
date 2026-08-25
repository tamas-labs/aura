import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useCoreStore } from '../core.state';
import type { AuraProps } from '../../../types';

/**
 * Fallback of an unimplemented `errorReportingService`.
 *
 * The config validator has always reported "falling back to 'custom'" and set
 * the validated config value accordingly — but the reporter was built from the
 * **raw** merged config, before validation, so it kept the original service and
 * dispatched to a `sendTo*` placeholder that only called `console.warn`. With
 * `drop_console` in the production build that meant: a visible banner promising
 * a fallback, and every error silently discarded. Measured on the old code:
 * 12 reported errors → **0** requests.
 */
describe('error handler store — unimplemented reporting service', () => {
    const ENDPOINT = 'https://errors.example.com/collect';
    const BATCH_SIZE = 10;

    let fetchMock: ReturnType<typeof vi.fn>;
    let storeCounter = 0;

    const createStore = (service: string) => {
        storeCounter += 1;
        const storeId = `reporter-service-${storeCounter}`;

        return useCoreStore(storeId, {
            storeId,
            errorReporting: true,
            errorReportingEndpoint: ENDPOINT,
            errorReportingService: service,
        } as unknown as AuraProps);
    };

    /** Fill exactly one batch so the reporter flushes. */
    const reportOneBatch = (core: ReturnType<typeof useCoreStore>): void => {
        for (let i = 0; i < BATCH_SIZE; i++) {
            core.errorStore.addError({
                severity: 'error',
                component: 'Aura',
                action: 'fetch',
                type: 'network',
                message: `boom-${i}`,
            });
        }
    };

    const settle = () => new Promise(resolve => setTimeout(resolve, 20));

    beforeEach(() => {
        setActivePinia(createPinia());
        fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        vi.stubGlobal('fetch', fetchMock);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it.each(['sentry', 'logrocket', 'rollbar'])(
        'should actually send the errors when %s is configured',
        async service => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const core = createStore(service);

            reportOneBatch(core);
            await settle();

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith(
                ENDPOINT,
                expect.objectContaining({ method: 'POST' })
            );
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        }
    );

    it('should surface the substitution as a non-blocking warning', () => {
        const core = createStore('sentry');

        const warning = core.errorStore.errors.find(error =>
            error.message.includes('not implemented yet')
        );

        expect(warning?.severity).toBe('warning');
        expect(warning?.key).toBe('errorReportingService');
    });

    // The banner and the transport must agree: the validated config value is the
    // one the reporter actually uses.
    it('should report the same service the reporter sends with', async () => {
        const core = createStore('sentry');

        expect(core.config.errorReportingService).toBe('custom');

        reportOneBatch(core);
        await settle();

        expect(fetchMock).toHaveBeenCalledWith(ENDPOINT, expect.anything());
    });

    it('should leave an implemented service untouched', async () => {
        const core = createStore('custom');

        expect(
            core.errorStore.errors.some(error => error.message.includes('not implemented yet'))
        ).toBe(false);

        reportOneBatch(core);
        await settle();

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
