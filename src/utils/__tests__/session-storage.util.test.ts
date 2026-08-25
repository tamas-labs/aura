import { describe, it, expect, afterEach, vi } from 'vitest';
import {
    generateSessionKey,
    isSessionStorageAvailable,
    saveToSessionStorage,
    loadFromSessionStorage,
    removeFromSessionStorage,
} from '../session-storage.util';

describe('session-storage.util', () => {
    describe('generateSessionKey', () => {
        it('should generate key with aura-session prefix', () => {
            const key = generateSessionKey('my-table');
            expect(key).toBe('aura-session-my-table');
        });

        it('should handle empty storeId', () => {
            const key = generateSessionKey('');
            expect(key).toBe('aura-session-');
        });

        it('should handle special characters in storeId', () => {
            const key = generateSessionKey('table-123_test');
            expect(key).toBe('aura-session-table-123_test');
        });

        it('should use the explicit sessionKey verbatim when provided', () => {
            expect(generateSessionKey('my-table', 'users-state')).toBe('users-state');
        });

        it('should not prefix the explicit sessionKey', () => {
            expect(generateSessionKey('my-table', 'aura-session-other')).toBe('aura-session-other');
        });

        it('should let two storeIds share one explicit sessionKey', () => {
            expect(generateSessionKey('table-a', 'shared')).toBe(
                generateSessionKey('table-b', 'shared')
            );
        });

        it('should fall back to the derived key for null', () => {
            expect(generateSessionKey('my-table', null)).toBe('aura-session-my-table');
        });

        it('should fall back to the derived key for undefined', () => {
            expect(generateSessionKey('my-table', undefined)).toBe('aura-session-my-table');
        });

        it('should treat an empty sessionKey as not set', () => {
            expect(generateSessionKey('my-table', '')).toBe('aura-session-my-table');
        });

        it('should treat a whitespace-only sessionKey as not set', () => {
            expect(generateSessionKey('my-table', '   ')).toBe('aura-session-my-table');
        });

        it('should trim the explicit sessionKey', () => {
            expect(generateSessionKey('my-table', '  users-state  ')).toBe('users-state');
        });
    });

    describe('isSessionStorageAvailable', () => {
        it('should return true in normal environment', () => {
            expect(isSessionStorageAvailable()).toBe(true);
        });

        it('should return false when sessionStorage throws error', () => {
            // Mock sessionStorage.setItem to throw error
            const setItemSpy = vi
                .spyOn(window.sessionStorage, 'setItem')
                .mockImplementationOnce(() => {
                    throw new Error('SecurityError');
                });

            expect(isSessionStorageAvailable()).toBe(false);

            setItemSpy.mockRestore();
        });
    });

    describe('saveToSessionStorage and loadFromSessionStorage', () => {
        const testKey = 'test-key';

        afterEach(() => {
            removeFromSessionStorage(testKey);
        });

        describe('valid cases', () => {
            it('should save and load string data', () => {
                const data = 'test string';
                const saved = saveToSessionStorage(testKey, data);
                expect(saved).toBe(true);

                const loaded = loadFromSessionStorage(testKey);
                expect(loaded).toBe(data);
            });

            it('should save and load object data', () => {
                const data = { name: 'John', age: 30 };
                const saved = saveToSessionStorage(testKey, data);
                expect(saved).toBe(true);

                const loaded = loadFromSessionStorage(testKey);
                expect(loaded).toEqual(data);
            });

            it('should save and load array data', () => {
                const data = [1, 2, 3, 4, 5];
                const saved = saveToSessionStorage(testKey, data);
                expect(saved).toBe(true);

                const loaded = loadFromSessionStorage(testKey);
                expect(loaded).toEqual(data);
            });

            it('should save and load null', () => {
                const data = null;
                const saved = saveToSessionStorage(testKey, data);
                expect(saved).toBe(true);

                const loaded = loadFromSessionStorage(testKey);
                expect(loaded).toBeNull();
            });

            it('should save and load boolean', () => {
                const data = true;
                const saved = saveToSessionStorage(testKey, data);
                expect(saved).toBe(true);

                const loaded = loadFromSessionStorage(testKey);
                expect(loaded).toBe(true);
            });

            it('should save and load number', () => {
                const data = 42;
                const saved = saveToSessionStorage(testKey, data);
                expect(saved).toBe(true);

                const loaded = loadFromSessionStorage(testKey);
                expect(loaded).toBe(42);
            });

            it('should save and load complex nested object', () => {
                const data = {
                    page: 1,
                    sortItems: [{ field: 'name', direction: 'asc' }],
                    searchItems: [{ field: 'email', term: 'test', exact: true }],
                    globalSearchTerm: 'search term',
                };
                const saved = saveToSessionStorage(testKey, data);
                expect(saved).toBe(true);

                const loaded = loadFromSessionStorage(testKey);
                expect(loaded).toEqual(data);
            });
        });

        describe('invalid cases', () => {
            it('should return null when loading non-existent key', () => {
                const loaded = loadFromSessionStorage('non-existent-key');
                expect(loaded).toBeNull();
            });

            it('should handle corrupted JSON gracefully', () => {
                // Manually insert corrupted JSON
                window.sessionStorage.setItem(testKey, '{invalid json}');

                const loaded = loadFromSessionStorage(testKey);
                expect(loaded).toBeNull();
            });

            it('should return false when saving fails due to quota exceeded', () => {
                const setItemSpy = vi
                    .spyOn(window.sessionStorage, 'setItem')
                    .mockImplementationOnce(() => {
                        throw new Error('QuotaExceededError');
                    });

                const saved = saveToSessionStorage(testKey, { data: 'test' });
                expect(saved).toBe(false);

                setItemSpy.mockRestore();
            });

            it('should return false when saving fails due to JSON stringify error', () => {
                // Create circular reference that JSON.stringify cannot handle
                const obj: Record<string, unknown> = {};
                obj.self = obj;

                const saved = saveToSessionStorage(testKey, obj);
                expect(saved).toBe(false);
            });

            it('should return false when storage is not available during save', () => {
                const availableSpy = vi
                    .spyOn(window.sessionStorage, 'setItem')
                    .mockImplementationOnce(() => {
                        throw new Error('SecurityError');
                    });

                // First call checks availability, which will throw
                const saved = saveToSessionStorage(testKey, 'test');
                expect(saved).toBe(false);

                availableSpy.mockRestore();
            });

            it('should return null when storage is not available during load', () => {
                const availableSpy = vi
                    .spyOn(window.sessionStorage, 'setItem')
                    .mockImplementationOnce(() => {
                        throw new Error('SecurityError');
                    });

                const loaded = loadFromSessionStorage(testKey);
                expect(loaded).toBeNull();

                availableSpy.mockRestore();
            });
        });

        describe('edge cases', () => {
            it('should handle empty string key', () => {
                const saved = saveToSessionStorage('', 'data');
                expect(saved).toBe(true);

                const loaded = loadFromSessionStorage('');
                expect(loaded).toBe('data');

                removeFromSessionStorage('');
            });

            it('should handle empty object', () => {
                const data = {};
                const saved = saveToSessionStorage(testKey, data);
                expect(saved).toBe(true);

                const loaded = loadFromSessionStorage(testKey);
                expect(loaded).toEqual(data);
            });

            it('should handle empty array', () => {
                const data: unknown[] = [];
                const saved = saveToSessionStorage(testKey, data);
                expect(saved).toBe(true);

                const loaded = loadFromSessionStorage(testKey);
                expect(loaded).toEqual(data);
            });

            it('should overwrite existing data', () => {
                saveToSessionStorage(testKey, 'first');
                saveToSessionStorage(testKey, 'second');

                const loaded = loadFromSessionStorage(testKey);
                expect(loaded).toBe('second');
            });
        });
    });

    describe('removeFromSessionStorage', () => {
        const testKey = 'test-remove-key';

        it('should remove existing key', () => {
            saveToSessionStorage(testKey, 'test data');
            expect(loadFromSessionStorage(testKey)).toBe('test data');

            removeFromSessionStorage(testKey);
            expect(loadFromSessionStorage(testKey)).toBeNull();
        });

        it('should not throw error when removing non-existent key', () => {
            expect(() => removeFromSessionStorage('non-existent')).not.toThrow();
        });

        it('should handle error during removal gracefully', () => {
            const removeItemSpy = vi
                .spyOn(window.sessionStorage, 'removeItem')
                .mockImplementationOnce(() => {
                    throw new Error('Storage error');
                });

            expect(() => removeFromSessionStorage(testKey)).not.toThrow();

            removeItemSpy.mockRestore();
        });

        it('should not remove when storage is not available', () => {
            const setItemSpy = vi
                .spyOn(window.sessionStorage, 'setItem')
                .mockImplementationOnce(() => {
                    throw new Error('SecurityError');
                });

            // This should not throw, just silently fail
            expect(() => removeFromSessionStorage(testKey)).not.toThrow();

            setItemSpy.mockRestore();
        });
    });
});
