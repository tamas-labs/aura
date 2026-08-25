/**
 * Error handling usage examples
 *
 * This file shows how Aura's ECS-compatible error handling system is used
 * in a number of common scenarios.
 */

import { useErrorHandlerStore } from '../src/state/core/error-handler.state';
import type { ErrorSeverity, ErrorType } from '../src/types/error.types';

// ============================================================================
// 1. BASIC USAGE
// ============================================================================

/**
 * Initialize the error handler store
 */
export function initializeErrorHandler() {
    const errorStore = useErrorHandlerStore('app-errors');
    
    console.log('Error store initialized');
    console.log('Has errors:', errorStore.hasErrors); // false
    console.log('Is valid:', errorStore.isValid); // true
    
    return errorStore;
}

// ============================================================================
// 2. HANDLING VALIDATION ERRORS
// ============================================================================

/**
 * Add form validation errors
 */
export function handleFormValidation(errorStore: ReturnType<typeof useErrorHandlerStore>) {
    // Email validation error
    errorStore.addError({
        severity: 'error',
        component: 'LoginForm',
        action: 'validateEmail',
        type: 'validation',
        message: 'Invalid email format',
        key: 'email',
        details: 'Email must contain @ symbol and valid domain'
    });
    
    // Password validation error
    errorStore.addError({
        severity: 'error',
        component: 'LoginForm',
        action: 'validatePassword',
        type: 'validation',
        message: 'Password too short',
        key: 'password',
        details: 'Password must be at least 8 characters long'
    });
    
    console.log('Validation errors added:', errorStore.errors.length);
}

// ============================================================================
// 3. HANDLING NETWORK ERRORS
// ============================================================================

/**
 * Handle an API network error
 */
export function handleNetworkError(errorStore: ReturnType<typeof useErrorHandlerStore>) {
    errorStore.addError({
        severity: 'critical',
        component: 'ApiService',
        action: 'fetchUsers',
        type: 'network',
        message: 'Failed to fetch users from server',
        details: 'Connection timeout after 30 seconds',
        metadata: {
            endpoint: '/api/users',
            statusCode: 0,
            timeout: 30000,
            retryCount: 3
        }
    });
}

// ============================================================================
// 4. AUTHENTICATION AND AUTHORIZATION ERRORS
// ============================================================================

/**
 * Handle an authentication error
 */
export function handleAuthenticationError(errorStore: ReturnType<typeof useErrorHandlerStore>) {
    errorStore.addError({
        severity: 'error',
        component: 'AuthService',
        action: 'login',
        type: 'authentication',
        message: 'Invalid credentials',
        details: 'Username or password is incorrect',
        metadata: {
            username: 'user@example.com',
            attemptCount: 3,
            lockoutTime: 300 // seconds
        }
    });
}

/**
 * Handle an authorization error
 */
export function handleAuthorizationError(errorStore: ReturnType<typeof useErrorHandlerStore>) {
    errorStore.addError({
        severity: 'warning',
        component: 'AdminPanel',
        action: 'accessAdminArea',
        type: 'authorization',
        message: 'Insufficient permissions',
        details: 'User does not have admin role',
        metadata: {
            requiredRole: 'admin',
            userRole: 'user'
        }
    });
}

// ============================================================================
// 5. QUERYING AND FILTERING ERRORS
// ============================================================================

/**
 * Filter errors by various criteria
 */
export function queryErrors(errorStore: ReturnType<typeof useErrorHandlerStore>) {
    // All errors
    console.log('All errors:', errorStore.errors);
    
    // Critical errors
    console.log('Critical errors:', errorStore.criticalErrors);
    
    // Warnings
    console.log('Warnings:', errorStore.warnings);
    
    // Filter by severity
    const errorLevelErrors = errorStore.getErrorsBySeverity('error');
    console.log('Error level errors:', errorLevelErrors);
    
    // Filter by component
    const loginErrors = errorStore.getErrorsByComponent('LoginForm');
    console.log('Login form errors:', loginErrors);
    
    // Filter by key (field name)
    const emailErrors = errorStore.getErrorsByKey('email');
    console.log('Email field errors:', emailErrors);
}

// ============================================================================
// 6. CLEARING ERRORS
// ============================================================================

/**
 * The different ways to clear errors
 */
export function clearErrors(errorStore: ReturnType<typeof useErrorHandlerStore>) {
    // Clear the errors of one specific field
    errorStore.clearByKey('email');
    console.log('Email errors cleared');
    
    // Clear every error of one component
    errorStore.clearByComponent('LoginForm');
    console.log('LoginForm errors cleared');
    
    // Clear every error of one type
    errorStore.clearByType('validation');
    console.log('All validation errors cleared');
    
    // Clear all errors
    errorStore.clearErrors();
    console.log('All errors cleared');
}

// ============================================================================
// 7. COMPLEX EXAMPLE: FORM SUBMIT FLOW
// ============================================================================

/**
 * A complete form submit flow with error handling
 */
export async function handleFormSubmit(
    errorStore: ReturnType<typeof useErrorHandlerStore>,
    formData: { email: string; password: string }
) {
    // 1. Clear the previous validation errors
    errorStore.clearByComponent('LoginForm');
    
    // 2. Email validation
    if (!formData.email.includes('@')) {
        errorStore.addError({
            severity: 'error',
            component: 'LoginForm',
            action: 'validateEmail',
            type: 'validation',
            message: 'Invalid email format',
            key: 'email'
        });
    }
    
    // 3. Password validation
    if (formData.password.length < 8) {
        errorStore.addError({
            severity: 'error',
            component: 'LoginForm',
            action: 'validatePassword',
            type: 'validation',
            message: 'Password too short',
            key: 'password'
        });
    }
    
    // 4. Do not submit while there are validation errors
    if (errorStore.hasErrors) {
        console.log('Form has validation errors');
        return false;
    }
    
    // 5. API call
    try {
        // Simulated API call
        const response = await fetch('/api/login', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            errorStore.addError({
                severity: 'error',
                component: 'LoginForm',
                action: 'submit',
                type: response.status === 401 ? 'authentication' : 'server',
                message: 'Login failed',
                metadata: {
                    statusCode: response.status,
                    statusText: response.statusText
                }
            });
            return false;
        }
        
        return true;
    } catch (error) {
        errorStore.addError({
            severity: 'critical',
            component: 'LoginForm',
            action: 'submit',
            type: 'network',
            message: 'Network error during login',
            details: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return false;
    }
}

// ============================================================================
// 8. USING SEVERITY LEVELS
// ============================================================================

/**
 * Using the different severity levels
 */
export function demonstrateSeverityLevels(errorStore: ReturnType<typeof useErrorHandlerStore>) {
    const severities: ErrorSeverity[] = ['critical', 'error', 'warning', 'info', 'debug'];
    
    severities.forEach(severity => {
        errorStore.addError({
            severity,
            component: 'DemoComponent',
            action: 'demonstrateSeverity',
            type: 'unknown',
            message: `This is a ${severity} level message`
        });
    });
    
    console.log('Total errors:', errorStore.errors.length);
    console.log('Critical:', errorStore.criticalErrors.length);
    console.log('Warnings:', errorStore.warnings.length);
}

// ============================================================================
// 9. USING ERROR TYPES
// ============================================================================

/**
 * Using the different error types
 */
export function demonstrateErrorTypes(errorStore: ReturnType<typeof useErrorHandlerStore>) {
    const errorTypes: ErrorType[] = [
        'validation',
        'network',
        'authentication',
        'authorization',
        'not_found',
        'server',
        'client',
        'unknown'
    ];
    
    errorTypes.forEach(type => {
        errorStore.addError({
            severity: 'error',
            component: 'DemoComponent',
            action: 'demonstrateType',
            type,
            message: `This is a ${type} error`
        });
    });
}

// ============================================================================
// 10. ELASTICSEARCH INTEGRATION EXAMPLE
// ============================================================================

/**
 * Export the collected errors for Elasticsearch
 */
export function exportToElastic(errorStore: ReturnType<typeof useErrorHandlerStore>) {
    // The ECS format means the payload can be fed straight into the Elastic Stack
    const ecsErrors = errorStore.errors.map(error => ({
        '@timestamp': error.timestamp,
        'log.level': error.level,
        'log.logger': error.component,
        'event.action': error.action,
        'event.severity': error.severity,
        'event.type': error.type,
        'message': error.message,
        'error.message': error.message,
        'error.stack_trace': error.stack,
        'labels': {
            component: error.component,
            key: error.key
        },
        'metadata': error.metadata
    }));
    
    console.log('ECS formatted errors for Elastic:', ecsErrors);
    
    // This is where the bulk request to Elasticsearch would go
    // await fetch('https://elastic.example.com/_bulk', { ... })
}
