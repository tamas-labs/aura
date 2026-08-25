import { z } from 'zod';
import { cacheSchema } from '../utils/schema-cache';

/**
 * Slice end text string validation
 * Min: 0 characters (empty string is allowed too), Max: 10 characters
 * Examples: '...', '…', ' [...]', ''
 */
export const SliceEndTextZod = cacheSchema(() => {
    return z.string().min(0).max(10).nullable();
});
