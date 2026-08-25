import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useErrorHandlerStore } from '../../core/error-handler.state';
import type { ErrorSeverity, ErrorType } from '../../../types/error.types';

describe('useErrorHandlerStore', () => {
    const TEST_STORE_ID = 'test-error-store';
    const TEST_COMPONENT = 'TestComponent';
    const TEST_ACTION = 'testAction';
    const TEST_MESSAGE_PREFIX = 'Test error';
    const VALIDATION_TYPE = 'validation';
    const VALIDATE_ACTION = 'validate';
    const EMAIL_KEY = 'email';
    const INVALID_EMAIL_MSG = 'Invalid email';

    // Severity levels konstansok
    const ALL_SEVERITIES: readonly ErrorSeverity[] = [
        'critical',
        'error',
        'warning',
        'info',
        'debug',
    ] as const;

    // Error types konstansok
    const ALL_ERROR_TYPES: readonly ErrorType[] = [
        'validation',
        'network',
        'authentication',
        'authorization',
        'not_found',
        'server',
        'client',
        'unknown',
    ] as const;

    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe('initial state', () => {
        it('should initialize with empty errors array', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);
            expect(store.errors).toEqual([]);
        });

        it('should have hasErrors as false initially', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);
            expect(store.hasErrors).toBe(false);
        });

        it('should have isValid as true initially', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);
            expect(store.isValid).toBe(true);
        });

        it('should have empty critical errors initially', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);
            expect(store.criticalErrors).toEqual([]);
        });

        it('should have empty warnings initially', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);
            expect(store.warnings).toEqual([]);
        });
    });

    describe('addError', () => {
        it('should add an error to the store', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Test error message',
            });

            expect(store.errors).toHaveLength(1);
            expect(store.errors[0]!.message).toBe('Test error message');
        });

        it('should automatically generate timestamp if not provided', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);
            const beforeTimestamp = new Date().toISOString();

            store.addError({
                severity: 'error',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: TEST_MESSAGE_PREFIX,
            });

            const afterTimestamp = new Date().toISOString();
            const errorTimestamp = store.errors[0]!.timestamp;

            expect(errorTimestamp).toBeDefined();
            expect(errorTimestamp >= beforeTimestamp).toBe(true);
            expect(errorTimestamp <= afterTimestamp).toBe(true);
        });

        it('should set level to severity for backwards compatibility', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'warning',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Test warning',
            });

            expect(store.errors[0]!.level).toBe('warning');
            expect(store.errors[0]!.level).toBe(store.errors[0]!.severity);
        });

        it('should accept custom timestamp', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);
            const customTimestamp = '2024-01-01T00:00:00.000Z';

            store.addError({
                severity: 'error',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: TEST_MESSAGE_PREFIX,
                timestamp: customTimestamp,
            });

            expect(store.errors[0]!.timestamp).toBe(customTimestamp);
        });

        it('should add error with optional key', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: 'Form',
                action: VALIDATE_ACTION,
                type: VALIDATION_TYPE,
                message: INVALID_EMAIL_MSG,
                key: EMAIL_KEY,
            });

            expect(store.errors[0]!.key).toBe(EMAIL_KEY);
        });

        it('should generate a key from component.action.type when none is given', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: 'ApiResourcesStore',
                action: 'fetchData',
                type: 'api',
                message: 'Request failed',
            });

            expect(store.errors[0]!.key).toBe('ApiResourcesStore.fetchData.api');
        });

        it('should generate the same key for repeated errors from the same source', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);
            const failure = {
                severity: 'error' as const,
                component: 'ApiResourcesStore',
                action: 'fetchData',
                type: 'api' as const,
                message: 'Request failed',
            };

            store.addError(failure);
            store.addError({ ...failure, message: 'Request failed again' });

            expect(store.errors[0]!.key).toBe(store.errors[1]!.key);
        });

        it('should not overwrite a caller-supplied key with the generated one', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'warning',
                component: 'IconsValidator',
                action: VALIDATE_ACTION,
                type: VALIDATION_TYPE,
                message: 'Invalid icons object provided',
                key: 'icons',
            });

            expect(store.errors[0]!.key).toBe('icons');
        });

        it('should make an unkeyed error removable via clearByKey', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: 'ApiResourcesStore',
                action: 'fetchData',
                type: 'api',
                message: 'Request failed',
            });

            store.clearByKey('ApiResourcesStore.fetchData.api');

            expect(store.errors).toHaveLength(0);
        });

        it('should add error with optional details', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: 'API',
                action: 'fetch',
                type: 'network',
                message: 'Request failed',
                details: 'Connection timeout after 30s',
            });

            expect(store.errors[0]!.details).toBe('Connection timeout after 30s');
        });

        it('should add error with optional metadata', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);
            const metadata = { userId: 123, requestId: 'abc-123' };

            store.addError({
                severity: 'error',
                component: 'API',
                action: 'fetch',
                type: 'network',
                message: 'Request failed',
                metadata,
            });

            expect(store.errors[0]!.metadata).toEqual(metadata);
        });
    });

    describe('computed properties', () => {
        it('should update hasErrors when error is added', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);
            expect(store.hasErrors).toBe(false);

            store.addError({
                severity: 'error',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: TEST_MESSAGE_PREFIX,
            });

            expect(store.hasErrors).toBe(true);
        });

        it('should update isValid when error is added', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);
            expect(store.isValid).toBe(true);

            store.addError({
                severity: 'error',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: TEST_MESSAGE_PREFIX,
            });

            expect(store.isValid).toBe(false);
        });

        it('should filter critical errors correctly', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'critical',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: 'server',
                message: 'Critical error',
            });

            store.addError({
                severity: 'error',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Normal error',
            });

            expect(store.criticalErrors).toHaveLength(1);
            expect(store.criticalErrors[0]!.severity).toBe('critical');
        });

        it('should filter warnings correctly', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'warning',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Warning message',
            });

            store.addError({
                severity: 'error',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Error message',
            });

            expect(store.warnings).toHaveLength(1);
            expect(store.warnings[0]!.severity).toBe('warning');
        });
    });

    describe('clearErrors', () => {
        it('should clear all errors', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Error 1',
            });

            store.addError({
                severity: 'error',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Error 2',
            });

            expect(store.errors).toHaveLength(2);

            store.clearErrors();

            expect(store.errors).toHaveLength(0);
            expect(store.hasErrors).toBe(false);
            expect(store.isValid).toBe(true);
        });
    });

    describe('clearByKey', () => {
        it('should clear errors by key', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: 'Form',
                action: VALIDATE_ACTION,
                type: VALIDATION_TYPE,
                message: INVALID_EMAIL_MSG,
                key: EMAIL_KEY,
            });

            store.addError({
                severity: 'error',
                component: 'Form',
                action: VALIDATE_ACTION,
                type: VALIDATION_TYPE,
                message: 'Invalid name',
                key: 'name',
            });

            expect(store.errors).toHaveLength(2);

            store.clearByKey(EMAIL_KEY);

            expect(store.errors).toHaveLength(1);
            expect(store.errors[0]!.key).toBe('name');
        });

        // An error added without a key gets a generated `component.action.type`
        // one, so it is never cleared by an unrelated key either.
        it('should not affect errors added without an explicit key', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: 'Form',
                action: VALIDATE_ACTION,
                type: VALIDATION_TYPE,
                message: INVALID_EMAIL_MSG,
                key: EMAIL_KEY,
            });

            store.addError({
                severity: 'error',
                component: 'Form',
                action: VALIDATE_ACTION,
                type: VALIDATION_TYPE,
                message: 'General error',
            });

            store.clearByKey(EMAIL_KEY);

            expect(store.errors).toHaveLength(1);
            expect(store.errors[0]!.message).toBe('General error');
        });
    });

    describe('clearByComponent', () => {
        it('should clear errors by component', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: 'ComponentA',
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Error in A',
            });

            store.addError({
                severity: 'error',
                component: 'ComponentB',
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Error in B',
            });

            store.clearByComponent('ComponentA');

            expect(store.errors).toHaveLength(1);
            expect(store.errors[0]!.component).toBe('ComponentB');
        });
    });

    describe('clearByType', () => {
        it('should clear errors by type', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Validation error',
            });

            store.addError({
                severity: 'error',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: 'network',
                message: 'Network error',
            });

            store.clearByType('validation');

            expect(store.errors).toHaveLength(1);
            expect(store.errors[0]!.type).toBe('network');
        });
    });

    describe('getErrorsBySeverity', () => {
        it('should return errors filtered by severity', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'critical',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: 'server',
                message: 'Critical error',
            });

            store.addError({
                severity: 'error',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Normal error',
            });

            store.addError({
                severity: 'warning',
                component: TEST_COMPONENT,
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Warning',
            });

            const criticalErrors = store.getErrorsBySeverity('critical');
            expect(criticalErrors).toHaveLength(1);
            expect(criticalErrors[0]!.severity).toBe('critical');

            const errors = store.getErrorsBySeverity('error');
            expect(errors).toHaveLength(1);
            expect(errors[0]!.severity).toBe('error');
        });
    });

    describe('getErrorsByComponent', () => {
        it('should return errors filtered by component', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: 'ComponentA',
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Error 1',
            });

            store.addError({
                severity: 'error',
                component: 'ComponentA',
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Error 2',
            });

            store.addError({
                severity: 'error',
                component: 'ComponentB',
                action: TEST_ACTION,
                type: VALIDATION_TYPE,
                message: 'Error 3',
            });

            const componentAErrors = store.getErrorsByComponent('ComponentA');
            expect(componentAErrors).toHaveLength(2);
            expect(componentAErrors.every(e => e.component === 'ComponentA')).toBe(true);
        });
    });

    describe('getErrorsByKey', () => {
        it('should return errors filtered by key', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: 'Form',
                action: VALIDATE_ACTION,
                type: VALIDATION_TYPE,
                message: 'Invalid email format',
                key: EMAIL_KEY,
            });

            store.addError({
                severity: 'error',
                component: 'Form',
                action: VALIDATE_ACTION,
                type: VALIDATION_TYPE,
                message: 'Email required',
                key: EMAIL_KEY,
            });

            store.addError({
                severity: 'error',
                component: 'Form',
                action: VALIDATE_ACTION,
                type: VALIDATION_TYPE,
                message: 'Name required',
                key: 'name',
            });

            const emailErrors = store.getErrorsByKey(EMAIL_KEY);
            expect(emailErrors).toHaveLength(2);
            expect(emailErrors.every(e => e.key === EMAIL_KEY)).toBe(true);
        });
    });

    describe('ECS compliance', () => {
        it('should create ECS-compliant error structure', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError({
                severity: 'error',
                component: 'UserService',
                action: 'login',
                type: 'authentication',
                message: 'Invalid credentials',
                details: 'Username or password is incorrect',
                metadata: {
                    username: 'testuser',
                    attemptCount: 3,
                },
            });

            const error = store.errors[0]!;

            // ECS required fields
            expect(error.severity).toBe('error');
            expect(error.timestamp).toBeDefined();
            expect(error.component).toBe('UserService');
            expect(error.action).toBe('login');
            expect(error.level).toBe('error');
            expect(error.type).toBe('authentication');
            expect(error.message).toBe('Invalid credentials');

            // Optional fields
            expect(error.details).toBe('Username or password is incorrect');
            expect(error.metadata).toBeDefined();
        });

        it('should support all severity levels', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            ALL_SEVERITIES.forEach(severity => {
                store.addError({
                    severity,
                    component: TEST_COMPONENT,
                    action: TEST_ACTION,
                    type: VALIDATION_TYPE,
                    message: `${severity} message`,
                });
            });

            expect(store.errors).toHaveLength(5);
            ALL_SEVERITIES.forEach((severity, index) => {
                expect(store.errors[index]!.severity).toBe(severity);
            });
        });

        it('should support all error types', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            ALL_ERROR_TYPES.forEach(type => {
                store.addError({
                    severity: 'error',
                    component: TEST_COMPONENT,
                    action: TEST_ACTION,
                    type,
                    message: `${type} error`,
                });
            });

            expect(store.errors).toHaveLength(8);
            ALL_ERROR_TYPES.forEach((type, index) => {
                expect(store.errors[index]!.type).toBe(type);
            });
        });
    });

    describe('deduplication and size cap', () => {
        /** Mirrors `MAX_STORED_ERRORS` in the store (not exported on purpose) */
        const MAX_STORED_ERRORS = 50;
        const OVERFLOW_KEY = 'errorHandler.limitReached';
        const REPEATED_MESSAGE = 'Endpoint unreachable';

        /** The same problem, reported again */
        const repeatable = (overrides: Record<string, unknown> = {}) => ({
            severity: 'error' as ErrorSeverity,
            component: TEST_COMPONENT,
            action: TEST_ACTION,
            type: 'api' as ErrorType,
            message: REPEATED_MESSAGE,
            ...overrides,
        });

        /** A distinct problem per call, so nothing can merge */
        const distinct = (index: number, severity: ErrorSeverity = 'warning') => ({
            severity,
            component: TEST_COMPONENT,
            action: TEST_ACTION,
            type: VALIDATION_TYPE as ErrorType,
            message: `${TEST_MESSAGE_PREFIX} ${index}`,
        });

        it('should merge a repeated error instead of appending it', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError(repeatable());
            store.addError(repeatable());
            store.addError(repeatable());

            expect(store.errors).toHaveLength(1);
            expect(store.errors[0]!.count).toBe(3);
        });

        it('should leave count unset for a single occurrence', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError(repeatable());

            expect(store.errors[0]!.count).toBeUndefined();
            expect(store.errors[0]!.lastTimestamp).toBeUndefined();
        });

        it('should keep the first timestamp and record the last occurrence', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError(repeatable({ timestamp: '2026-01-01T00:00:00.000Z' }));
            store.addError(repeatable({ timestamp: '2026-01-02T00:00:00.000Z' }));

            expect(store.errors[0]!.timestamp).toBe('2026-01-01T00:00:00.000Z');
            expect(store.errors[0]!.lastTimestamp).toBe('2026-01-02T00:00:00.000Z');
        });

        it('should keep the first occurrence metadata', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError(repeatable({ metadata: { attempt: 1 } }));
            store.addError(repeatable({ metadata: { attempt: 2 } }));

            expect(store.errors[0]!.metadata).toEqual({ attempt: 1 });
        });

        it('should not merge different messages under the same key', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError(repeatable({ key: EMAIL_KEY, message: INVALID_EMAIL_MSG }));
            store.addError(repeatable({ key: EMAIL_KEY, message: 'Email is required' }));

            expect(store.errors).toHaveLength(2);
        });

        it('should not merge two validator failures that differ only in details', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addSchemaValidationError(
                'NumberValidator',
                'Invalid value',
                TEST_ACTION,
                'x',
                'Expected number, received string'
            );
            store.addSchemaValidationError(
                'NumberValidator',
                'Invalid value',
                TEST_ACTION,
                -1,
                'Number must be greater than 0'
            );

            expect(store.errors).toHaveLength(2);
        });

        it('should keep a repeating error out of the size cap entirely', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            for (let index = 0; index < MAX_STORED_ERRORS * 4; index += 1) {
                store.addError(repeatable());
            }

            expect(store.errors).toHaveLength(1);
            expect(store.errors[0]!.count).toBe(MAX_STORED_ERRORS * 4);
        });

        it('should cap the error list and record the overflow', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            for (let index = 0; index < MAX_STORED_ERRORS + 20; index += 1) {
                store.addError(distinct(index));
            }

            expect(store.errors).toHaveLength(MAX_STORED_ERRORS);

            const notice = store.errors.find(error => error.key === OVERFLOW_KEY);
            expect(notice).toBeDefined();
            expect(notice!.severity).toBe('info');
            expect(notice!.metadata).toMatchObject({ maxErrors: MAX_STORED_ERRORS });
        });

        it('should drop the oldest errors first', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            for (let index = 0; index < MAX_STORED_ERRORS + 20; index += 1) {
                store.addError(distinct(index));
            }

            const messages = store.errors.map(error => error.message);
            expect(messages).not.toContain(`${TEST_MESSAGE_PREFIX} 0`);
            expect(messages).toContain(`${TEST_MESSAGE_PREFIX} ${MAX_STORED_ERRORS + 19}`);
        });

        it('should never drop a blocking error in favour of warnings', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError(distinct(0, 'critical'));
            store.addError(distinct(1, 'error'));

            for (let index = 2; index < MAX_STORED_ERRORS + 20; index += 1) {
                store.addError(distinct(index));
            }

            expect(store.criticalErrors).toHaveLength(1);
            expect(store.errorLevelErrors).toHaveLength(1);
        });

        it('should keep the overflow notice alive while the flood continues', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            for (let index = 0; index < MAX_STORED_ERRORS * 3; index += 1) {
                store.addError(distinct(index));
            }

            const notices = store.errors.filter(error => error.key === OVERFLOW_KEY);
            expect(notices).toHaveLength(1);
            expect(notices[0]!.count).toBeGreaterThan(1);
            expect(notices[0]!.metadata!.totalDropped).toBeGreaterThan(MAX_STORED_ERRORS);
        });

        it('should let clearByKey remove a merged error in one go', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addError(repeatable({ key: EMAIL_KEY }));
            store.addError(repeatable({ key: EMAIL_KEY }));

            store.clearByKey(EMAIL_KEY);

            expect(store.errors).toHaveLength(0);
        });
    });

    describe('addSchemaValidationError', () => {
        const TEST_VALIDATOR_COMPONENT = 'TestValidator';
        const TEST_KEY = 'testKey';
        const INVALID_VALUE_MSG = 'Invalid value';

        it('should add schema validation error with default parameters', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addSchemaValidationError(
                TEST_VALIDATOR_COMPONENT,
                INVALID_VALUE_MSG,
                TEST_KEY,
                123
            );

            expect(store.errors).toHaveLength(1);
            const error = store.errors[0]!;
            expect(error.severity).toBe('warning');
            expect(error.action).toBe('validate');
            expect(error.type).toBe('validation');
            expect(error.component).toBe(TEST_VALIDATOR_COMPONENT);
            expect(error.message).toBe(INVALID_VALUE_MSG);
            expect(error.key).toBe(TEST_KEY);
        });

        it('should include receivedValue and receivedType in metadata', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);
            const testValue = { foo: 'bar' };

            store.addSchemaValidationError(
                TEST_VALIDATOR_COMPONENT,
                'Invalid object',
                TEST_KEY,
                testValue
            );

            const error = store.errors[0]!;
            expect(error.metadata).toBeDefined();
            expect(error.metadata?.receivedValue).toEqual(testValue);
            expect(error.metadata?.receivedType).toBe('object');
        });

        it('should accept optional details parameter', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addSchemaValidationError(
                TEST_VALIDATOR_COMPONENT,
                INVALID_VALUE_MSG,
                TEST_KEY,
                'invalid',
                'Expected number, received string'
            );

            const error = store.errors[0]!;
            expect(error.details).toBe('Expected number, received string');
        });

        it('should merge additional metadata', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            store.addSchemaValidationError(
                'NumberValidator',
                'Number out of range',
                'rowsNumber',
                1001,
                'Value must be between 1 and 1000',
                { constraints: { min: 1, max: 1000 } }
            );

            const error = store.errors[0]!;
            expect(error.metadata).toBeDefined();
            expect(error.metadata?.receivedValue).toBe(1001);
            expect(error.metadata?.receivedType).toBe('number');
            expect(error.metadata?.constraints).toEqual({ min: 1, max: 1000 });
        });

        it('should handle different value types correctly', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            const testCases = [
                { value: true, expectedType: 'boolean', useDeepEqual: false },
                { value: 'string', expectedType: 'string', useDeepEqual: false },
                { value: 123, expectedType: 'number', useDeepEqual: false },
                { value: null, expectedType: 'object', useDeepEqual: false },
                { value: undefined, expectedType: 'undefined', useDeepEqual: false },
                { value: [], expectedType: 'object', useDeepEqual: true },
                { value: {}, expectedType: 'object', useDeepEqual: true },
            ];

            testCases.forEach(({ value, expectedType }, index) => {
                store.addSchemaValidationError(
                    'TypeValidator',
                    `Invalid ${expectedType}`,
                    `key${index}`,
                    value
                );
            });

            expect(store.errors).toHaveLength(testCases.length);
            testCases.forEach(({ value, expectedType, useDeepEqual }, index) => {
                expect(store.errors[index]!.metadata?.receivedType).toBe(expectedType);
                if (useDeepEqual) {
                    expect(store.errors[index]!.metadata?.receivedValue).toEqual(value);
                } else {
                    expect(store.errors[index]!.metadata?.receivedValue).toBe(value);
                }
            });
        });

        it('should be compatible with existing error store methods', () => {
            const store = useErrorHandlerStore(TEST_STORE_ID);

            // Add schema validation error
            store.addSchemaValidationError(
                'BooleanValidator',
                'Invalid boolean',
                'debug',
                'not-a-boolean'
            );

            // Add regular error
            store.addError({
                severity: 'error',
                component: 'OtherComponent',
                action: 'process',
                type: 'network',
                message: 'Network error',
            });

            expect(store.errors).toHaveLength(2);

            // Test filtering by key
            const keyErrors = store.getErrorsByKey('debug');
            expect(keyErrors).toHaveLength(1);
            expect(keyErrors[0]!.component).toBe('BooleanValidator');

            // Test filtering by type
            const validationErrors = store.getErrorsByComponent('BooleanValidator');
            expect(validationErrors).toHaveLength(1);

            // Test clearing by key
            store.clearByKey('debug');
            expect(store.errors).toHaveLength(1);
            expect(store.errors[0]!.component).toBe('OtherComponent');
        });
    });
});
