import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ErrorReporter, createErrorReporter } from '../error-reporter';
import type { ECSError, AuraConfig } from '../../types';

// Test constants
const TEST_ENDPOINT = 'https://api.example.com/errors';
const NETWORK_ERROR_MSG = 'Network error';

describe('ErrorReporter', () => {
    const mockError: ECSError = {
        severity: 'error',
        timestamp: '2024-01-01T00:00:00Z',
        component: 'TestComponent',
        action: 'testAction',
        level: 'error',
        type: 'validation',
        message: 'Test error message',
    };

    let fetchMock: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('constructor', () => {
        it('should create reporter with enabled=true', () => {
            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
            });

            expect(reporter).toBeInstanceOf(ErrorReporter);
        });

        it('should create reporter with batch timer if flushInterval is set', () => {
            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                flushInterval: 5000,
            });

            expect(reporter).toBeInstanceOf(ErrorReporter);
        });
    });

    describe('report', () => {
        it('should not report when disabled', async () => {
            const reporter = new ErrorReporter({
                enabled: false,
            });

            await reporter.report(mockError);

            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('should queue error when enabled', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
            });

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                batchSize: 5,
            });

            await reporter.report(mockError);

            // Should not flush yet (batch size not reached)
            expect(fetchMock).not.toHaveBeenCalled();
        });

        it('should flush when batch size is reached', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
            });

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                batchSize: 2,
            });

            await reporter.report(mockError);
            await reporter.report({ ...mockError, message: 'Second error' });

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith(
                TEST_ENDPOINT,
                expect.objectContaining({
                    method: 'POST',
                    headers: expect.objectContaining({
                        'Content-Type': 'application/json',
                    }),
                })
            );
        });
    });

    describe('flush', () => {
        it('should send queued errors to custom endpoint', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
            });

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                service: 'custom',
            });

            await reporter.report(mockError);
            await reporter.flush();

            expect(fetchMock).toHaveBeenCalledTimes(1);
            const callArgs = fetchMock.mock.calls[0];
            expect(callArgs![0]).toBe(TEST_ENDPOINT);
            expect(callArgs![1]).toMatchObject({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const body = JSON.parse(callArgs![1].body as string);
            expect(body.errors).toHaveLength(1);
            expect(body.errors[0]).toMatchObject(mockError);
        });

        it('should include API key in headers if provided', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
            });

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                apiKey: 'test-api-key',
            });

            await reporter.report(mockError);
            await reporter.flush();

            expect(fetchMock).toHaveBeenCalledWith(
                TEST_ENDPOINT,
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Authorization: 'Bearer test-api-key',
                    }),
                })
            );
        });

        it('should re-queue errors on failure', async () => {
            vi.useRealTimers(); // Use real timers for fetch operations

            fetchMock.mockRejectedValue(new Error(NETWORK_ERROR_MSG));

            const onFailure = vi.fn();

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                maxRetries: 0, // No retries for faster test
                retryDelay: 10,
                onFailure,
            });

            await reporter.report(mockError);
            await reporter.flush();

            expect(fetchMock).toHaveBeenCalled();
            expect(onFailure).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.any(Error),
                    pending: 1,
                    consecutiveFailures: 1,
                })
            );

            vi.useFakeTimers(); // Reset to fake timers
        });

        it('should not flush if queue is empty', async () => {
            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
            });

            await reporter.flush();

            expect(fetchMock).not.toHaveBeenCalled();
        });
    });

    describe('batch timer', () => {
        it('should automatically flush after interval', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
            });

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                flushInterval: 5000,
            });

            await reporter.report(mockError);

            // Fast-forward time and wait for the interval to trigger
            await vi.advanceTimersByTimeAsync(5000);

            expect(fetchMock).toHaveBeenCalled();
        });
    });

    describe('destroy', () => {
        it('should flush pending errors and stop timer', async () => {
            vi.useRealTimers(); // Use real timers for destroy test

            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
            });

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                service: 'custom', // Explicitly set service to custom
            });

            await reporter.report(mockError);

            // Verify error was added to queue before destroy
            expect(fetchMock).not.toHaveBeenCalled();

            await reporter.destroy();

            expect(fetchMock).toHaveBeenCalledTimes(1);

            vi.useFakeTimers(); // Reset to fake timers
        });

        it('should not accept new errors after destroy', async () => {
            fetchMock.mockResolvedValue({
                ok: true,
                status: 200,
            });

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
            });

            await reporter.destroy();
            await reporter.report(mockError);

            expect(fetchMock).not.toHaveBeenCalled();
        });
    });

    describe('queue cap', () => {
        // Without a cap a permanently unreachable endpoint grows the queue for
        // ever: every failed flush pushes its batch back while new errors arrive.
        const NO_AUTO_FLUSH = 1000;

        it('should drop the oldest errors above maxQueueSize', async () => {
            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                batchSize: NO_AUTO_FLUSH,
                maxQueueSize: 3,
            });

            for (let i = 0; i < 5; i++) {
                await reporter.report({ ...mockError, message: `error-${i}` });
            }

            expect(reporter.pendingCount).toBe(3);
            expect(reporter.droppedCount).toBe(2);
        });

        it('should keep the newest errors when dropping', async () => {
            fetchMock.mockResolvedValue({ ok: true, status: 200 });

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                batchSize: NO_AUTO_FLUSH,
                maxQueueSize: 2,
            });

            for (let i = 0; i < 4; i++) {
                await reporter.report({ ...mockError, message: `error-${i}` });
            }
            await reporter.flush();

            const body = JSON.parse(fetchMock.mock.calls[0]![1].body);
            expect(body.errors.map((e: ECSError) => e.message)).toEqual(['error-2', 'error-3']);
        });

        it('should report a full queue only once', async () => {
            const onDrop = vi.fn();

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                batchSize: NO_AUTO_FLUSH,
                maxQueueSize: 1,
                onDrop,
            });

            for (let i = 0; i < 5; i++) {
                await reporter.report(mockError);
            }

            expect(onDrop).toHaveBeenCalledTimes(1);
            expect(onDrop).toHaveBeenCalledWith({
                dropped: 1,
                totalDropped: 1,
                maxQueueSize: 1,
            });
            expect(reporter.droppedCount).toBe(4);
        });

        it('should stay bounded while the endpoint is unreachable', async () => {
            fetchMock.mockRejectedValue(new Error(NETWORK_ERROR_MSG));

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                maxRetries: 0,
                batchSize: 5,
                maxQueueSize: 10,
            });

            for (let i = 0; i < 60; i++) {
                await reporter.report({ ...mockError, message: `error-${i}` });
            }

            expect(reporter.pendingCount).toBeLessThanOrEqual(10);
            expect(reporter.droppedCount).toBeGreaterThan(0);
        });
    });

    describe('failure backoff', () => {
        /** Fails the first send, then succeeds. */
        const failOnce = () => {
            fetchMock
                .mockRejectedValueOnce(new Error(NETWORK_ERROR_MSG))
                .mockResolvedValue({ ok: true, status: 200 });
        };

        it('should skip sends while backing off after a failed flush', async () => {
            failOnce();

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                maxRetries: 0,
            });

            await reporter.report(mockError);
            await reporter.flush();

            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(reporter.isBackingOff).toBe(true);
            expect(reporter.pendingCount).toBe(1);

            // The interval timer would call this every cycle — it must not hammer
            // an endpoint that has just failed.
            await reporter.flush();
            expect(fetchMock).toHaveBeenCalledTimes(1);
        });

        it('should resume and reset the backoff once the window has passed', async () => {
            failOnce();

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                maxRetries: 0,
                maxBackoffDelay: 5000,
            });

            await reporter.report(mockError);
            await reporter.flush();
            expect(reporter.isBackingOff).toBe(true);

            vi.advanceTimersByTime(5000);
            await reporter.flush();

            expect(fetchMock).toHaveBeenCalledTimes(2);
            expect(reporter.isBackingOff).toBe(false);
            expect(reporter.pendingCount).toBe(0);
        });

        it('should grow the backoff window exponentially', async () => {
            fetchMock.mockRejectedValue(new Error(NETWORK_ERROR_MSG));

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                maxRetries: 0,
                flushInterval: 0, // no batch timer; only the backoff base matters
                maxBackoffDelay: 4000,
            });
            // `flushInterval: 0` falls back to the 30 s default base, capped at 4 s.

            await reporter.report(mockError);
            await reporter.flush(); // 1st failure → 4 s window (capped)

            vi.advanceTimersByTime(4000);
            await reporter.flush(); // 2nd failure → still 4 s (the cap holds)
            expect(fetchMock).toHaveBeenCalledTimes(2);

            // Half the window is not enough to try again.
            vi.advanceTimersByTime(2000);
            await reporter.flush();
            expect(fetchMock).toHaveBeenCalledTimes(2);

            vi.advanceTimersByTime(2000);
            await reporter.flush();
            expect(fetchMock).toHaveBeenCalledTimes(3);
        });

        it('should share a single request between concurrent flushes', async () => {
            let resolveFetch: (value: unknown) => void = () => {};
            fetchMock.mockImplementation(
                () =>
                    new Promise(resolve => {
                        resolveFetch = resolve;
                    })
            );

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                batchSize: 1000,
            });

            await reporter.report(mockError);

            // Batch-size trigger and interval timer can overlap in production.
            const first = reporter.flush();
            const second = reporter.flush();

            resolveFetch({ ok: true, status: 200 });
            await Promise.all([first, second]);

            expect(fetchMock).toHaveBeenCalledTimes(1);
        });
    });

    describe('retry logic', () => {
        it('should retry on failure', async () => {
            vi.useRealTimers(); // Use real timers for retry tests

            let attemptCount = 0;
            fetchMock.mockImplementation(() => {
                attemptCount++;
                if (attemptCount < 3) {
                    return Promise.reject(new Error(NETWORK_ERROR_MSG));
                }
                return Promise.resolve({
                    ok: true,
                    status: 200,
                });
            });

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                maxRetries: 3,
                retryDelay: 10, // Short delay for testing
            });

            await reporter.report(mockError);
            await reporter.flush();

            // Should have retried and succeeded
            expect(fetchMock).toHaveBeenCalledTimes(3);

            vi.useFakeTimers(); // Reset to fake timers
        });

        it('should fail after max retries', async () => {
            vi.useRealTimers(); // Use real timers for retry tests

            fetchMock.mockRejectedValue(new Error(NETWORK_ERROR_MSG));

            const onFailure = vi.fn();

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                maxRetries: 2,
                retryDelay: 10, // Short delay for testing
                onFailure,
            });

            await reporter.report(mockError);
            await reporter.flush();

            // Should have tried initial + 2 retries
            expect(fetchMock).toHaveBeenCalledTimes(3);
            expect(onFailure).toHaveBeenCalled();

            vi.useFakeTimers(); // Reset to fake timers
        });
    });

    // The vendor services never had a transport: their `sendTo*` branch only
    // called `console.warn`, which production strips — so choosing one discarded
    // every error in silence. They now fall back to the configured endpoint.
    describe('unimplemented services', () => {
        const unimplemented = ['sentry', 'logrocket', 'rollbar'] as const;

        it.each(unimplemented)('should send %s errors to the endpoint', async service => {
            const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
            fetchMock.mockResolvedValue({ ok: true, status: 200 });

            const reporter = new ErrorReporter({
                enabled: true,
                endpoint: TEST_ENDPOINT,
                service,
            });

            await reporter.report(mockError);
            await reporter.flush();

            expect(fetchMock).toHaveBeenCalledWith(
                TEST_ENDPOINT,
                expect.objectContaining({ method: 'POST' })
            );
            expect(consoleWarnSpy).not.toHaveBeenCalled();
        });

        // Without an endpoint there is nothing to fall back to — but the failure
        // must be reported, not swallowed like the old placeholder branch did.
        it('should report the failure when there is no endpoint to fall back to', async () => {
            const onFailure = vi.fn();

            const reporter = new ErrorReporter({
                enabled: true,
                service: 'sentry',
                onFailure,
            });

            await reporter.report(mockError);
            await reporter.flush();

            expect(fetchMock).not.toHaveBeenCalled();
            expect(onFailure).toHaveBeenCalledWith(
                expect.objectContaining({
                    error: expect.objectContaining({
                        message: expect.stringContaining('endpoint'),
                    }),
                })
            );
        });

        it('should keep the errors queued for a later retry', async () => {
            const reporter = new ErrorReporter({
                enabled: true,
                service: 'rollbar',
                onFailure: vi.fn(),
            });

            await reporter.report(mockError);
            await reporter.flush();

            expect(reporter.pendingCount).toBe(1);
        });
    });
});

describe('createErrorReporter', () => {
    it('should return null when errorReporting is false', () => {
        const config: AuraConfig = {
            errorReporting: false,
        };

        const reporter = createErrorReporter(config);

        expect(reporter).toBeNull();
    });

    it('should return null when errorReporting is undefined', () => {
        const config: AuraConfig = {};

        const reporter = createErrorReporter(config);

        expect(reporter).toBeNull();
    });

    it('should create ErrorReporter when errorReporting is true', () => {
        const config: AuraConfig = {
            errorReporting: true,
            errorReportingEndpoint: TEST_ENDPOINT,
        };

        const reporter = createErrorReporter(config);

        expect(reporter).toBeInstanceOf(ErrorReporter);
    });

    it('should use custom service type', () => {
        const config: AuraConfig = {
            errorReporting: true,
            errorReportingEndpoint: TEST_ENDPOINT,
            errorReportingService: 'sentry',
        };

        const reporter = createErrorReporter(config);

        expect(reporter).toBeInstanceOf(ErrorReporter);
    });

    it('should use default service as custom when not specified', () => {
        const config: AuraConfig = {
            errorReporting: true,
            errorReportingEndpoint: TEST_ENDPOINT,
        };

        const reporter = createErrorReporter(config);

        expect(reporter).toBeInstanceOf(ErrorReporter);
    });
});
