/**
 * ECS (Elastic Common Schema) severity levels
 * Compatible with the Elastic Stack
 */
export type ErrorSeverity = 'critical' | 'error' | 'warning' | 'info' | 'debug';

/**
 * Error types
 * Distinguishes between the different error categories
 */
export type ErrorType =
    | 'validation'
    | 'network'
    | 'authentication'
    | 'authorization'
    | 'not_found'
    | 'server'
    | 'client'
    | 'api'
    | 'unknown';

/**
 * ECS-compatible error object
 * Standard Elastic Common Schema format
 */
export interface ECSError {
    /**
     * Unique identifier for the error (optional)
     */
    id?: string;

    /**
     * Severity of the error
     */
    severity: ErrorSeverity;

    /**
     * Timestamp (ISO 8601 format)
     */
    timestamp: string;

    /**
     * Name of the component where the error occurred
     */
    component: string;

    /**
     * Action/operation during which the error occurred
     */
    action: string;

    /**
     * Log level (backwards compatibility)
     * @deprecated Use `severity` instead. This field is maintained for ECS compatibility.
     */
    level: ErrorSeverity;

    /**
     * Type of the error
     */
    type: ErrorType;

    /**
     * Error message
     */
    message: string;

    /**
     * Detailed error description (optional)
     */
    details?: string;

    /**
     * Key for identifying the error (e.g. field name during validation)
     */
    key?: string;

    /**
     * Stack trace (optional, useful in developer mode)
     */
    stack?: string;

    /**
     * How many times this error occurred.
     *
     * The store merges repeats of the same error (same `key`, `severity` and
     * `message`) into the entry that is already there instead of appending a new
     * one, and counts them here. **Absent while the error happened only once**,
     * so `count ?? 1` is the occurrence count.
     */
    count?: number;

    /**
     * Timestamp of the most recent occurrence (ISO 8601).
     *
     * Absent until the error repeats — `timestamp` then marks the first
     * occurrence and this one the last.
     */
    lastTimestamp?: string;

    /**
     * Additional metadata (optional)
     */
    metadata?: Record<string, unknown>;
}

/**
 * Error store state interface
 */
export interface ErrorState {
    /**
     * Whether there is invalid data
     */
    isValid: boolean;

    /**
     * Whether there are errors
     */
    hasErrors: boolean;

    /**
     * Array of errors
     */
    errors: ECSError[];
}
