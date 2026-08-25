/**
 * Utility functions for safe sessionStorage manipulation.
 * Handles storage availability checks, JSON serialization/deserialization, and error handling.
 */

/**
 * Generates the session key for a specific store instance.
 *
 * When `sessionKey` is provided it is used verbatim, so the saved state can stay stable
 * across a changing `storeId` (or be shared between two tables). A blank or whitespace-only
 * value counts as "not set" and falls back to the derived key.
 *
 * @param storeId - The unique identifier of the table store
 * @param sessionKey - Optional explicit key from the `sessionKey` config/prop
 * @returns The explicit key, or the prefixed key derived from the storeId
 *
 * @example
 * ```typescript
 * generateSessionKey('users-table');                  // 'aura-session-users-table'
 * generateSessionKey('users-table', 'my-key');        // 'my-key'
 * ```
 */
export const generateSessionKey = (storeId: string, sessionKey?: string | null): string => {
    const explicitKey = sessionKey?.trim();

    return explicitKey ? explicitKey : `aura-session-${storeId}`;
};

/**
 * Checks if sessionStorage is available and writable.
 * Some browsers may disable storage in private mode or iframes, throwing SecurityError.
 *
 * @returns True if sessionStorage is available and working, false otherwise
 */
export const isSessionStorageAvailable = (): boolean => {
    try {
        const testKey = '__aura_storage_test__';
        window.sessionStorage.setItem(testKey, testKey);
        window.sessionStorage.removeItem(testKey);
        return true;
    } catch {
        return false;
    }
};

/**
 * Safely saves data to sessionStorage.
 * Handles JSON serialization and storage errors (e.g., quota exceeded).
 *
 * @param key - The storage key
 * @param data - The data to save
 * @returns True if save was successful, false otherwise
 *
 * @example
 * ```typescript
 * const success = saveToSessionStorage('my-key', { page: 1 });
 * ```
 */
export const saveToSessionStorage = (key: string, data: unknown): boolean => {
    if (!isSessionStorageAvailable()) {
        return false;
    }

    try {
        const serialized = JSON.stringify(data);
        window.sessionStorage.setItem(key, serialized);
        return true;
    } catch {
        // QuotaExceededError or other storage errors
        return false;
    }
};

/**
 * Safely loads data from sessionStorage.
 * Handles JSON parsing errors and missing keys.
 *
 * @param key - The storage key
 * @returns The parsed data or null if not found or error occurred
 *
 * @example
 * ```typescript
 * const data = loadFromSessionStorage('my-key');
 * ```
 */
export const loadFromSessionStorage = (key: string): unknown => {
    if (!isSessionStorageAvailable()) {
        return null;
    }

    try {
        const serialized = window.sessionStorage.getItem(key);
        if (serialized === null) {
            return null;
        }
        return JSON.parse(serialized);
    } catch {
        // JSON parsing error
        return null;
    }
};

/**
 * Safely removes an item from sessionStorage.
 *
 * @param key - The storage key to remove
 *
 * @example
 * ```typescript
 * removeFromSessionStorage('my-key');
 * ```
 */
export const removeFromSessionStorage = (key: string): void => {
    if (!isSessionStorageAvailable()) {
        return;
    }

    try {
        window.sessionStorage.removeItem(key);
    } catch {
        // Ignore errors during removal
    }
};
