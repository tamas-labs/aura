import { z } from 'zod';
import { cacheSchema } from '../utils/schema-cache';

/**
 * Error reporting service type validation
 * Allowed values: sentry, logrocket, rollbar, custom
 */
export const ErrorReportingServiceZod = cacheSchema(() => {
    return z.enum(['sentry', 'logrocket', 'rollbar', 'custom']).nullable();
});
