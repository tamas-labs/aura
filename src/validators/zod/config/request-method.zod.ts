import { z } from 'zod';
import { cacheSchema } from '../utils/schema-cache';

/**
 * HTTP request method enum validation
 * Allowed values: GET, POST, PUT, DELETE, PATCH
 */
export const RequestMethodZod = cacheSchema(() => {
    return z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).nullable();
});
