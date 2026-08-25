import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useApiResourcesStore } from '../api-resources.state';
import { useCoreStore } from '../../core/core.state';
import type { AuraProps } from '../../../types';

describe('useApiResourcesStore - Search functionality', () => {
    const storeId = 'test-api-resources-search';
    let core: ReturnType<typeof useCoreStore>;
    let store: ReturnType<typeof useApiResourcesStore>;

    beforeEach(() => {
        setActivePinia(createPinia());
        // Clear session storage to prevent interference
        window.sessionStorage.clear();

        const mockProps: AuraProps = {
            storeId: storeId,
            siteName: 'Test Site',
            urlStructure: '{siteName}/api/{urlParameter}',
            urlParameter: 'users',
            urlParameterLastSegment: 'list',
            siteToken: 'test-token-123',
            requestMethod: 'POST',
            disableSession: true, // Disable session for pure unit tests
        };

        core = useCoreStore(storeId, mockProps);
        store = useApiResourcesStore(storeId, core);
    });

    describe('addSearch', () => {
        describe('valid cases', () => {
            it('should add new search field with term', () => {
                store.addSearch('name', 'John');

                expect(store.searchItems).toHaveLength(1);
                expect(store.searchItems[0]).toEqual({
                    field: 'name',
                    term: 'John',
                });
            });

            it('should add search with exact parameter', () => {
                store.addSearch('email', 'test@example.com', true);

                expect(store.searchItems).toHaveLength(1);
                expect(store.searchItems[0]).toEqual({
                    field: 'email',
                    term: 'test@example.com',
                    exact: true,
                });
            });

            it('should add multiple searches for different fields', () => {
                store.addSearch('name', 'John');
                store.addSearch('email', 'test@example.com');

                expect(store.searchItems).toHaveLength(2);
                expect(store.searchItems[0]).toEqual({
                    field: 'name',
                    term: 'John',
                });
                expect(store.searchItems[1]).toEqual({
                    field: 'email',
                    term: 'test@example.com',
                });
            });
        });

        describe('invalid/edge cases', () => {
            it('should not add search when field is empty', () => {
                store.addSearch('', 'test');

                expect(store.searchItems).toHaveLength(0);
            });

            it('should remove search when term is empty', () => {
                store.addSearch('name', 'John');
                expect(store.searchItems).toHaveLength(1);

                store.addSearch('name', '');
                expect(store.searchItems).toHaveLength(0);
            });

            it('should not add duplicate search for same field', () => {
                store.addSearch('name', 'John');
                store.addSearch('name', 'Jane');

                expect(store.searchItems).toHaveLength(1);
                expect(store.searchItems[0]?.term).toBe('John');
            });
        });
    });

    describe('updateSearchTerm', () => {
        describe('valid cases', () => {
            it('should update term of existing search', () => {
                store.addSearch('name', 'John');
                store.updateSearchTerm('name', 'Jane');

                expect(store.searchItems).toHaveLength(1);
                expect(store.searchItems[0]?.term).toBe('Jane');
            });

            it('should update exact parameter when provided', () => {
                store.addSearch('email', 'test@example.com', false);
                store.updateSearchTerm('email', 'test@example.com', true);

                expect(store.searchItems).toHaveLength(1);
                expect(store.searchItems[0]?.exact).toBe(true);
            });

            it('should update term and exact parameter together', () => {
                store.addSearch('name', 'John', false);
                store.updateSearchTerm('name', 'Jane', true);

                expect(store.searchItems).toHaveLength(1);
                expect(store.searchItems[0]?.term).toBe('Jane');
                expect(store.searchItems[0]?.exact).toBe(true);
            });
        });

        describe('invalid/edge cases', () => {
            it('should remove search when term is empty', () => {
                store.addSearch('name', 'John');
                store.updateSearchTerm('name', '');

                expect(store.searchItems).toHaveLength(0);
            });

            it('should do nothing when field does not exist', () => {
                store.addSearch('name', 'John');
                store.updateSearchTerm('email', 'test@example.com');

                expect(store.searchItems).toHaveLength(1);
                expect(store.searchItems[0]?.field).toBe('name');
            });
        });
    });

    describe('removeSearch', () => {
        it('should remove search for specific field', () => {
            store.addSearch('name', 'John');
            store.addSearch('email', 'test@example.com');

            store.removeSearch('name');

            expect(store.searchItems).toHaveLength(1);
            expect(store.searchItems[0]?.field).toBe('email');
        });

        it('should not throw error when field does not exist', () => {
            store.addSearch('name', 'John');

            expect(() => store.removeSearch('nonexistent')).not.toThrow();
            expect(store.searchItems).toHaveLength(1);
        });

        it('should handle removing from empty search list', () => {
            expect(() => store.removeSearch('name')).not.toThrow();
            expect(store.searchItems).toHaveLength(0);
        });
    });

    describe('clearAllSearches', () => {
        it('should clear all searches', () => {
            store.addSearch('name', 'John');
            store.addSearch('email', 'test@example.com');
            store.addSearch('phone', '123456');

            store.clearAllSearches();

            expect(store.searchItems).toHaveLength(0);
        });

        it('should handle clearing empty search list', () => {
            expect(() => store.clearAllSearches()).not.toThrow();
            expect(store.searchItems).toHaveLength(0);
        });
    });

    describe('getSearchTerm', () => {
        describe('valid cases', () => {
            it('should return term for existing field', () => {
                store.addSearch('name', 'John');

                const term = store.getSearchTerm('name');

                expect(term).toBe('John');
            });

            it('should return correct term when multiple searches exist', () => {
                store.addSearch('name', 'John');
                store.addSearch('email', 'test@example.com');

                const nameTerm = store.getSearchTerm('name');
                const emailTerm = store.getSearchTerm('email');

                expect(nameTerm).toBe('John');
                expect(emailTerm).toBe('test@example.com');
            });
        });

        describe('invalid/edge cases', () => {
            it('should return null for non-existent field', () => {
                store.addSearch('name', 'John');

                const term = store.getSearchTerm('email');

                expect(term).toBeNull();
            });

            it('should return null when search list is empty', () => {
                const term = store.getSearchTerm('name');

                expect(term).toBeNull();
            });
        });
    });

    describe('queryParams integration', () => {
        it('should not include searchable when no searches', () => {
            const params = store.queryParams;

            expect(params.searchable).toBeUndefined();
        });

        it('should include searchable with one search', () => {
            store.addSearch('name', 'John');

            const params = store.queryParams;

            expect(params.searchable).toBeDefined();
            expect(params.searchable).toHaveLength(1);
            expect(params.searchable?.[0]).toEqual({
                field: 'name',
                term: 'John',
            });
        });

        it('should include searchable with multiple searches', () => {
            store.addSearch('name', 'John');
            store.addSearch('email', 'test@example.com', true);

            const params = store.queryParams;

            expect(params.searchable).toBeDefined();
            expect(params.searchable).toHaveLength(2);
            expect(params.searchable?.[0]).toEqual({
                field: 'name',
                term: 'John',
            });
            expect(params.searchable?.[1]).toEqual({
                field: 'email',
                term: 'test@example.com',
                exact: true,
            });
        });

        it('should remove searchable after clearing all searches', () => {
            store.addSearch('name', 'John');
            expect(store.queryParams.searchable).toBeDefined();

            store.clearAllSearches();

            expect(store.queryParams.searchable).toBeUndefined();
        });

        it('should remove searchable after removing last search', () => {
            store.addSearch('name', 'John');
            expect(store.queryParams.searchable).toBeDefined();

            store.removeSearch('name');

            expect(store.queryParams.searchable).toBeUndefined();
        });

        it('should work together with pagination and sorting params', () => {
            store.setLimit(25);
            store.setPage(2);
            store.addSort('created_at', 'desc');
            store.addSearch('name', 'John');

            const params = store.queryParams;

            expect(params.page).toBe(2);
            expect(params.paginate).toBe(25);
            expect(params.sortable).toBeDefined();
            expect(params.sortable).toHaveLength(1);
            expect(params.searchable).toBeDefined();
            expect(params.searchable).toHaveLength(1);
        });
    });

    describe('edge case combinations', () => {
        it('should handle add after remove on same field', () => {
            store.addSearch('name', 'John');
            store.removeSearch('name');
            store.addSearch('name', 'Jane');

            expect(store.searchItems).toHaveLength(1);
            expect(store.searchItems[0]?.term).toBe('Jane');
        });

        it('should handle update after clear and add', () => {
            store.addSearch('name', 'John');
            store.clearAllSearches();
            store.addSearch('name', 'Jane');
            store.updateSearchTerm('name', 'Bob');

            expect(store.searchItems).toHaveLength(1);
            expect(store.searchItems[0]?.term).toBe('Bob');
        });

        it('should maintain search integrity when removing middle item', () => {
            store.addSearch('name', 'John');
            store.addSearch('email', 'test@example.com');
            store.addSearch('phone', '123456');

            store.removeSearch('email');

            expect(store.searchItems).toHaveLength(2);
            expect(store.searchItems[0]?.field).toBe('name');
            expect(store.searchItems[1]?.field).toBe('phone');
        });
    });
});
