import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { validateErrorReportingService } from '../error-reporting-service.schema';
import { defaultConfigLib } from '../../../../lib/default-config.lib';
import { useErrorHandlerStore } from '../../../../state/core/error-handler.state';

describe('ErrorReportingService Schema Validator', () => {
    const TEST_STORE_ID = 'test-store';

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('validateErrorReportingService - Valid inputs', () => {
        it('should accept custom service', () => {
            const result = validateErrorReportingService('custom', TEST_STORE_ID);
            expect(result).toBe('custom');
        });

        it('should accept null value', () => {
            const result = validateErrorReportingService(null, TEST_STORE_ID);
            expect(result).toBeNull();
        });

        it('should not warn for custom or null', () => {
            validateErrorReportingService('custom', TEST_STORE_ID);
            validateErrorReportingService(null, TEST_STORE_ID);
            const errorStore = useErrorHandlerStore(TEST_STORE_ID);
            expect(errorStore.warnings).toHaveLength(0);
        });
    });

    describe('validateErrorReportingService - Placeholder services (warn + fallback)', () => {
        it.each(['sentry', 'logrocket', 'rollbar'])(
            'should fall back to custom for the unimplemented %s service',
            service => {
                const result = validateErrorReportingService(service, TEST_STORE_ID);
                expect(result).toBe('custom');
            }
        );

        it('should add a warning (not a blocking error) when a placeholder service is set', () => {
            validateErrorReportingService('sentry', TEST_STORE_ID);
            const errorStore = useErrorHandlerStore(TEST_STORE_ID);

            expect(errorStore.warnings).toHaveLength(1);
            const warning = errorStore.warnings[0]!;
            expect(warning.severity).toBe('warning');
            expect(warning.key).toBe('errorReportingService');
            expect(warning.message).toContain('not implemented');
            expect(warning.message).toContain('sentry');
            expect(warning.metadata?.implemented).toEqual(['custom']);
        });
    });

    describe('validateErrorReportingService - Invalid inputs', () => {
        it('should return fallback for invalid service name', () => {
            const result = validateErrorReportingService('invalid-service', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingService);
        });

        it('should return fallback for uppercase service name', () => {
            const result = validateErrorReportingService('SENTRY', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingService);
        });

        it('should return fallback for invalid type (number)', () => {
            const result = validateErrorReportingService(123, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingService);
        });

        it('should return fallback for invalid type (boolean)', () => {
            const result = validateErrorReportingService(true, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingService);
        });

        it('should return fallback for invalid type (object)', () => {
            const result = validateErrorReportingService({}, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingService);
        });

        it('should return fallback for undefined', () => {
            const result = validateErrorReportingService(undefined, TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingService);
        });

        it('should return fallback for empty string', () => {
            const result = validateErrorReportingService('', TEST_STORE_ID);
            expect(result).toBe(defaultConfigLib.errorReportingService);
        });
    });

    describe('validateErrorReportingService - Fallback behavior', () => {
        it('should return custom as default fallback', () => {
            const result = validateErrorReportingService('invalid-service', TEST_STORE_ID);
            expect(result).toBe('custom'); // defaultConfigLib.errorReportingService is 'custom'
        });
    });
});
