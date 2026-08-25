import { ErrorReportingServiceZod } from '../../zod';
import { getErrorSink } from '../../utils/error-sink';
import {
    DEFAULT_ERROR_REPORTING_SERVICE,
    UNIMPLEMENTED_ERROR_REPORTING_SERVICES,
} from '../../../lib/default-values.lib';

/** Name of the validator component (ECS error component field). */
const VALIDATOR_COMPONENT = 'ErrorReportingServiceValidator';

/** The config key name (ECS error key field). */
const CONFIG_KEY = 'errorReportingService';

/** All accepted service values (for the error message metadata). */
const ALLOWED_SERVICES = [
    ...UNIMPLEMENTED_ERROR_REPORTING_SERVICES,
    DEFAULT_ERROR_REPORTING_SERVICE,
] as const;

/** The validator's return union. */
type ErrorReportingService = (typeof ALLOWED_SERVICES)[number] | null;

/**
 * ErrorReportingService validation schema
 * - Validates the error reporting service type
 * - Supports nullable values
 * - Allowed values: sentry, logrocket, rollbar, custom
 * - Default value: DEFAULT_ERROR_REPORTING_SERVICE ('custom')
 * - Error handling via errorStore
 *
 * @example
 * ```ts
 * const result = validateErrorReportingService('custom', 'my-store'); // 'custom'
 * const result2 = validateErrorReportingService(null, 'my-store'); // null
 * const result3 = validateErrorReportingService('sentry', 'my-store'); // 'custom' (placeholder → warning + fallback)
 * const result4 = validateErrorReportingService('invalid', 'my-store'); // 'custom' (fallback + error logged)
 * ```
 */

/**
 * ErrorReportingService validator function
 *
 * Accepts the not-yet-implemented services (`sentry`/`logrocket`/`rollbar`),
 * but issues a warning and falls back to `custom` — this way errors aren't
 * silently swallowed alongside production's `drop_console` (the warning is a
 * DOM banner, not `console`).
 *
 * @param value - The value to validate
 * @param errorStoreId - The error handler store identifier
 * @returns Validated error reporting service value or DEFAULT_ERROR_REPORTING_SERVICE fallback
 */
export const validateErrorReportingService = (
    value: unknown,
    errorStoreId: string
): ErrorReportingService => {
    let parsed: ErrorReportingService;

    try {
        parsed = ErrorReportingServiceZod().parse(value) as ErrorReportingService;
    } catch (error) {
        const errorStore = getErrorSink(errorStoreId);

        errorStore.addSchemaValidationError(
            VALIDATOR_COMPONENT,
            'Invalid error reporting service provided',
            CONFIG_KEY,
            value,
            error instanceof Error ? error.message : 'Unknown validation error',
            { allowedValues: [...ALLOWED_SERVICES] }
        );

        return DEFAULT_ERROR_REPORTING_SERVICE;
    }

    // Placeholder branches: redirect the not-yet-implemented services with a
    // warning to the working `custom` service.
    if (
        parsed !== null &&
        (UNIMPLEMENTED_ERROR_REPORTING_SERVICES as readonly string[]).includes(parsed)
    ) {
        const errorStore = getErrorSink(errorStoreId);

        errorStore.addSchemaValidationError(
            VALIDATOR_COMPONENT,
            `Error reporting service '${parsed}' is not implemented yet; falling back to '${DEFAULT_ERROR_REPORTING_SERVICE}'`,
            CONFIG_KEY,
            parsed,
            'Only the "custom" endpoint service currently sends data. Set errorReportingEndpoint, or integrate the vendor SDK.',
            { allowedValues: [...ALLOWED_SERVICES], implemented: ['custom'] }
        );

        return DEFAULT_ERROR_REPORTING_SERVICE;
    }

    return parsed;
};
