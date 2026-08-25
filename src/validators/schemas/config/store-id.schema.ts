import { StringZod } from '../../zod';

/**
 * StoreId validation schema
 * - Minimum 1, maximum 250 characters
 * - HTML sanitization for XSS protection
 * - Fallback hierarchy: propsStoreId > configStoreId > 'aura-core'
 *
 * @example
 * ```ts
 * const result = validateStoreId('my-store', 'config-store'); // 'my-store'
 * const result2 = validateStoreId(undefined, 'config-store'); // 'config-store'
 * const result3 = validateStoreId(undefined, undefined); // 'aura-core'
 * const result4 = validateStoreId('<script>alert("xss")</script>'); // 'scriptalert("xss")/script' (sanitized)
 * ```
 */
export const storeIdSchema = StringZod(1, 250);

/**
 * StoreId validator function
 *
 * Priority order:
 * 1. Props storeId (if provided and valid)
 * 2. Config storeId (if provided and valid)
 * 3. 'aura-core' default value
 *
 * @param propsStoreId - The storeId value coming from props
 * @param configStoreId - The storeId value coming from config
 * @returns Validated and sanitized storeId, or the 'aura-core' default value
 */
export const validateStoreId = (propsStoreId: unknown, configStoreId?: unknown): string => {
    // 1. Try the props storeId
    try {
        if (propsStoreId !== undefined && propsStoreId !== null) {
            return storeIdSchema.parse(propsStoreId) as string;
        }
    } catch {
        // If props is invalid, try config
    }

    // 2. Try the config storeId
    try {
        if (configStoreId !== undefined && configStoreId !== null) {
            return storeIdSchema.parse(configStoreId) as string;
        }
    } catch {
        // If config is also invalid, use the default value
    }

    // 3. Default value
    return 'aura-core';
};
