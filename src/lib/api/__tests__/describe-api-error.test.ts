import { describe, it, expect } from 'vitest';
import { describeApiError } from '../describe-api-error';
import { DEFAULT_LABELS } from '../../default-values.lib';

describe('describeApiError', () => {
    /** An axios rejection that got a response back */
    const withStatus = (status: number, message = `Request failed with status code ${status}`) =>
        Object.assign(new Error(message), { response: { status } });

    /** An axios rejection that never got a response */
    const withCode = (code: string, message = 'Something went wrong') =>
        Object.assign(new Error(message), { code });

    describe('classification', () => {
        it('should read a missing response as a network failure', () => {
            expect(describeApiError(new Error('Network Error')).kind).toBe('network');
        });

        it.each(['ERR_NETWORK', 'ENOTFOUND', 'ECONNREFUSED', 'ECONNRESET'])(
            'should read the %s code as a network failure',
            code => {
                expect(describeApiError(withCode(code)).kind).toBe('network');
            }
        );

        it.each(['ECONNABORTED', 'ETIMEDOUT'])('should read the %s code as a timeout', code => {
            expect(describeApiError(withCode(code, 'timeout of 5000ms exceeded')).kind).toBe(
                'timeout'
            );
        });

        it.each([400, 404, 422, 499])('should read %i as a client failure', status => {
            expect(describeApiError(withStatus(status)).kind).toBe('client');
        });

        it.each([500, 502, 503])('should read %i as a server failure', status => {
            expect(describeApiError(withStatus(status)).kind).toBe('server');
        });

        it('should let the status win over the transport code', () => {
            const error = Object.assign(new Error('failed'), {
                response: { status: 500 },
                code: 'ECONNABORTED',
            });

            expect(describeApiError(error).kind).toBe('server');
        });

        it('should not describe a non-error status as a status problem', () => {
            expect(describeApiError(withStatus(302)).kind).toBe('unknown');
        });

        it.each([0, 999, 'oops', null, undefined])(
            'should ignore the unusable %s status',
            status => {
                const error = Object.assign(new Error('failed'), { response: { status } });

                expect(describeApiError(error).status).toBeUndefined();
            }
        );

        it('should fall back to unknown for an error of our own', () => {
            expect(describeApiError(new TypeError('x is not a function')).kind).toBe('unknown');
        });

        it('should survive a rejection that is not an object at all', () => {
            const result = describeApiError('boom');

            expect(result.kind).toBe('unknown');
            expect(result.details).toBe('boom');
        });
    });

    describe('messages', () => {
        it('should return the user-facing text, not the axios wording', () => {
            const result = describeApiError(new Error('Network Error'));

            expect(result.message).toBe(DEFAULT_LABELS.apiErrorNetwork);
            expect(result.details).toBe('Network Error');
        });

        it('should substitute the status into the client message', () => {
            expect(describeApiError(withStatus(404)).message).toBe(
                DEFAULT_LABELS.apiErrorClient.replace('{status}', '404')
            );
        });

        it('should substitute the status into the server message', () => {
            expect(describeApiError(withStatus(500)).message).toBe(
                DEFAULT_LABELS.apiErrorServer.replace('{status}', '500')
            );
        });

        it('should prefer the labels override over the default', () => {
            const result = describeApiError(withStatus(500), {
                apiErrorServer: 'A szerver hibázott ({status}).',
            });

            expect(result.message).toBe('A szerver hibázott (500).');
        });

        it('should fall back to the default for a label that is not overridden', () => {
            const result = describeApiError(new Error('Network Error'), {
                apiErrorServer: 'A szerver hibázott ({status}).',
            });

            expect(result.message).toBe(DEFAULT_LABELS.apiErrorNetwork);
        });
    });

    describe('developer context', () => {
        it('should expose the status and the code when there are any', () => {
            const error = Object.assign(new Error('failed'), {
                response: { status: 503 },
                code: 'ERR_BAD_RESPONSE',
            });

            expect(describeApiError(error)).toMatchObject({
                status: 503,
                code: 'ERR_BAD_RESPONSE',
                details: 'failed',
            });
        });

        it('should omit the status and the code when there are none', () => {
            const result = describeApiError(new Error('Network Error'));

            expect(result).not.toHaveProperty('status');
            expect(result).not.toHaveProperty('code');
        });
    });
});
